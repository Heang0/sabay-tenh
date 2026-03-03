const express = require('express');
const crypto = require('crypto');
const admin = require('firebase-admin');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const userAuth = require('../middleware/userAuth');
const bakongService = require('../services/bakong');
const { sendOrderReceipt } = require('../services/emailService');
const { sendCustomerPaymentConfirmedNotification, sendOrderNotification } = require('../services/telegram');

const TELEGRAM_AUTH_MAX_AGE_SECONDS = 5 * 60;
const retryWindowDaysRaw = Number(process.env.UNPAID_ORDER_EXPIRE_DAYS || 3);
const PAYMENT_RETRY_WINDOW_DAYS = Number.isFinite(retryWindowDaysRaw) && retryWindowDaysRaw > 0
    ? retryWindowDaysRaw
    : 3;
const PAYMENT_RETRY_WINDOW_MS = PAYMENT_RETRY_WINDOW_DAYS * 24 * 60 * 60 * 1000;

const toNonEmptyString = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized : null;
};

const verifyTelegramPayload = (payload, botToken) => {
    const hash = toNonEmptyString(payload.hash);
    const authDateRaw = payload.auth_date;
    const authDate = Number(authDateRaw);

    if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) {
        return { valid: false, message: 'Invalid Telegram hash' };
    }

    if (!Number.isFinite(authDate) || authDate <= 0) {
        return { valid: false, message: 'Invalid Telegram auth date' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - authDate) > TELEGRAM_AUTH_MAX_AGE_SECONDS) {
        return { valid: false, message: 'Telegram auth request expired' };
    }

    const dataCheckString = Object.keys(payload)
        .filter((key) => key !== 'hash')
        .filter((key) => payload[key] !== undefined && payload[key] !== null && payload[key] !== '')
        .sort()
        .map((key) => `${key}=${payload[key]}`)
        .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const expectedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    const received = Buffer.from(hash.toLowerCase(), 'hex');
    const expected = Buffer.from(expectedHash.toLowerCase(), 'hex');

    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
        return { valid: false, message: 'Telegram signature mismatch' };
    }

    return { valid: true };
};

const buildDisplayName = ({ firstName, lastName, fallback }) => {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || fallback || '';
};

const toPublicEmail = (email) => {
    if (!email) return '';
    if (String(email).endsWith('@telegram.local')) return '';
    return email;
};

const upsertUserFromIdentity = async ({
    firebaseUid,
    email,
    displayName,
    photoURL,
    telegramId,
    telegramUsername,
    authProvider
}) => {
    let user = await User.findOne({ firebaseUid });
    if (!user && telegramId) {
        user = await User.findOne({ telegramId });
    }

    if (!user) {
        user = new User({
            firebaseUid,
            ...(email ? { email } : {}),
            displayName: displayName || '',
            photoURL: photoURL || '',
            authProvider: authProvider || 'firebase',
            ...(telegramId ? { telegramId } : {}),
            ...(telegramUsername ? { telegramUsername } : {})
        });
    } else {
        user.firebaseUid = firebaseUid;
        if (email) user.email = email;
        if (displayName) user.displayName = displayName;
        if (photoURL) user.photoURL = photoURL;
        if (authProvider) user.authProvider = authProvider;
        if (telegramId) user.telegramId = telegramId;
        if (telegramUsername) user.telegramUsername = telegramUsername;
    }

    await user.save();
    return user;
};

const reconcilePendingBakongOrder = async (order, user) => {
    if (!order) return order;
    if (order.paymentMethod !== 'Bakong KHQR') return order;
    if (!order.paymentMd5) return order;
    if (order.paymentStatus === 'paid') return order;

    try {
        const result = await bakongService.checkPaymentStatus(order.paymentMd5);
        if (!(result.success && result.status === 'PAID')) {
            return order;
        }

        order.paymentStatus = 'paid';
        if (order.orderStatus === 'pending') {
            order.orderStatus = 'processing';
        }

        if (!order.receiptSentAt && order.customer?.email) {
            const mailResult = await sendOrderReceipt(order);
            if (mailResult) {
                order.receiptSentAt = new Date();
            }
        }

        if (!order.telegramPaidNotifiedAt && user?.telegramId) {
            const sent = await sendCustomerPaymentConfirmedNotification(order, user);
            if (sent) {
                order.telegramPaidNotifiedAt = new Date();
            }
        }

        if (!order.adminPaidNotifiedAt) {
            const sent = await sendOrderNotification(order);
            if (sent) {
                order.adminPaidNotifiedAt = new Date();
            }
        }

        await order.save();
    } catch (error) {
        console.error(`Bakong reconcile error for order ${order.orderNumber}:`, error.message);
    }

    return order;
};

// POST /api/users/telegram-auth - verify Telegram payload and issue Firebase custom token
router.post('/telegram-auth', async (req, res) => {
    try {
        const botToken = toNonEmptyString(process.env.TELEGRAM_BOT_TOKEN);
        if (!botToken) {
            return res.status(500).json({
                success: false,
                message: 'Telegram login is not configured'
            });
        }

        const telegramId = String(req.body?.id || '').trim();
        if (!telegramId) {
            return res.status(400).json({
                success: false,
                message: 'Missing Telegram user id'
            });
        }

        const verification = verifyTelegramPayload(req.body || {}, botToken);
        if (!verification.valid) {
            return res.status(401).json({
                success: false,
                message: verification.message
            });
        }

        const username = toNonEmptyString(req.body.username) || '';
        const firstName = toNonEmptyString(req.body.first_name) || '';
        const lastName = toNonEmptyString(req.body.last_name) || '';
        const photoURL = toNonEmptyString(req.body.photo_url) || '';
        const displayName = buildDisplayName({
            firstName,
            lastName,
            fallback: username || `Telegram ${telegramId}`
        });
        const fallbackTelegramEmail = `telegram_${telegramId}@telegram.local`;

        const firebaseUid = `telegram_${telegramId}`;
        const customToken = await admin.auth().createCustomToken(firebaseUid, {
            provider: 'telegram',
            telegramId,
            telegramUsername: username,
            name: displayName,
            picture: photoURL
        });

        await upsertUserFromIdentity({
            firebaseUid,
            email: fallbackTelegramEmail,
            displayName,
            photoURL,
            telegramId,
            telegramUsername: username,
            authProvider: 'telegram'
        });

        res.json({
            success: true,
            customToken
        });
    } catch (error) {
        console.error('Telegram auth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/users/google-auth - create or find user after Firebase sign-in (Google/Email/Telegram)
router.post('/google-auth', userAuth, async (req, res) => {
    try {
        const { uid, email, name, picture, telegramId, telegramUsername, provider } = req.firebaseUser;
        const normalizedTelegramId = telegramId ? String(telegramId) : undefined;
        const finalProvider = provider === 'telegram' || normalizedTelegramId ? 'telegram' : 'firebase';
        const displayName = name || req.body.displayName || '';
        const photoURL = picture || req.body.photoURL || '';
        const normalizedEmail = toNonEmptyString(email) || (
            normalizedTelegramId ? `telegram_${normalizedTelegramId}@telegram.local` : undefined
        );

        const user = await upsertUserFromIdentity({
            firebaseUid: uid,
            email: normalizedEmail,
            displayName,
            photoURL,
            telegramId: normalizedTelegramId,
            telegramUsername: toNonEmptyString(telegramUsername) || undefined,
            authProvider: finalProvider
        });

        res.json({
            success: true,
            user: {
                id: user._id,
                email: toPublicEmail(user.email),
                displayName: user.displayName,
                photoURL: user.photoURL,
                addresses: user.addresses,
                authProvider: user.authProvider,
                telegramUsername: user.telegramUsername || ''
            }
        });
    } catch (error) {
        console.error('Firebase sync auth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/users/profile - get user profile
router.get('/profile', userAuth, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: toPublicEmail(user.email),
                displayName: user.displayName,
                photoURL: user.photoURL,
                addresses: user.addresses,
                authProvider: user.authProvider,
                telegramUsername: user.telegramUsername || ''
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/users/profile - update profile
router.put('/profile', userAuth, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.body.displayName) user.displayName = req.body.displayName;
        if (req.body.addresses) user.addresses = req.body.addresses;

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                email: toPublicEmail(user.email),
                displayName: user.displayName,
                photoURL: user.photoURL,
                addresses: user.addresses,
                authProvider: user.authProvider,
                telegramUsername: user.telegramUsername || ''
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/users/orders - get user's order history
router.get('/orders', userAuth, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const orders = await Order.find({ userId: user._id })
            .sort({ createdAt: -1 });

        const visibleOrders = [];
        const nowMs = Date.now();

        for (const order of orders) {
            const createdAtMs = new Date(order.createdAt).getTime();
            const orderAgeMs = nowMs - createdAtMs;
            const retryWindowExpired = orderAgeMs > PAYMENT_RETRY_WINDOW_MS;
            const isUnpaid = order.paymentStatus !== 'paid';

            // Hide stale unpaid orders from profile after retry window.
            if (isUnpaid && retryWindowExpired) {
                continue;
            }

            await reconcilePendingBakongOrder(order, user);

            const retryExpiresAt = new Date(createdAtMs + PAYMENT_RETRY_WINDOW_MS);
            const canRetryPayment = (
                order.paymentMethod === 'Bakong KHQR' &&
                order.paymentStatus !== 'paid' &&
                Date.now() <= retryExpiresAt.getTime()
            );

            visibleOrders.push({
                id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                total: order.total,
                paymentMethod: order.paymentMethod,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                canRetryPayment,
                retryPaymentExpiresAt: retryExpiresAt
            });
        }

        res.json({
            success: true,
            orders: visibleOrders
        });
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
