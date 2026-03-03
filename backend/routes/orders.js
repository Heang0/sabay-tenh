const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const authMiddleware = require('../middleware/auth');
const { sendOrderReceipt } = require('../services/emailService');
const { sendOrderNotification } = require('../services/telegram');
const bakongService = require('../services/bakong');

// Reduce upstream pressure to Bakong API (helps avoid CloudFront/WAF rate blocks).
const paymentCheckCache = new Map();
const PAYMENT_CHECK_MIN_INTERVAL_MS = 10000;
const PAYMENT_CHECK_TRANSIENT_MS = 30000;
const QR_EXPIRED_RETRY_MS = 30000;
const QR_CONFIRMATION_GRACE_MS = 10 * 60 * 1000;

const normalizeSiteCode = (value) => {
    const normalized = String(value || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    return normalized || 'A';
};

// Helper function to generate order number
const generateOrderNumber = () => {
    const siteCode = normalizeSiteCode(process.env.SITE_CODE || 'A');
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${siteCode}-ORD-${year}${month}${day}-${random}`;
};

const sendPaidReceiptIfNeeded = async (order) => {
    try {
        if (!order) return;
        if (order.paymentStatus !== 'paid') return;
        if (order.receiptSentAt) return;
        if (!order.customer?.email) return;

        const result = await sendOrderReceipt(order);
        if (result) {
            order.receiptSentAt = new Date();
            await order.save();
        }
    } catch (err) {
        console.error('Paid receipt send error:', err.message);
    }
};

// ========== PUBLIC ROUTES ==========

// CREATE order (public - checkout)
router.post('/', async (req, res) => {
    try {

        // Validate required fields
        if (!req.body.customer || !req.body.customer.fullName || !req.body.customer.phone || !req.body.customer.address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required customer information'
            });
        }

        if (!req.body.items || req.body.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        // Generate order number
        const orderNumber = generateOrderNumber();

        // Try to extract userId from Firebase token if user is logged in
        let userId = null;
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                const decodedToken = await admin.auth().verifyIdToken(token);
                const user = await User.findOne({ firebaseUid: decodedToken.uid });
                if (user) userId = user._id;
            }
        } catch (e) { /* Guest checkout - no user */ }

        // Handle coupon if provided
        let couponCode = req.body.couponCode || null;
        let discount = req.body.discount || 0;
        if (couponCode) {
            try {
                const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
                if (coupon) {
                    coupon.usedCount += 1;
                    await coupon.save();
                }
            } catch (e) { console.error('Coupon increment error:', e); }
        }

        const selectedPaymentMethod = 'Bakong KHQR';

        // Create order data
        const orderData = {
            orderNumber: orderNumber,
            userId: userId,
            couponCode: couponCode,
            discount: discount,
            customer: {
                fullName: req.body.customer.fullName,
                phone: req.body.customer.phone,
                address: req.body.customer.address,
                email: req.body.customer.email || '',
                note: req.body.customer.note || ''
            },
            items: req.body.items.map(item => ({
                productId: item.productId,
                nameKm: item.nameKm,
                nameEn: item.nameEn,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: req.body.subtotal,
            total: req.body.total,
            paymentMethod: selectedPaymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending'
        };

        // Create and save order
        const order = new Order(orderData);

        // If Bakong is selected, generate QR immediately
        if (order.paymentMethod === 'Bakong KHQR') {
            try {
                const qrResult = await bakongService.generateKHQR(order);
                if (qrResult.success) {
                    order.paymentMd5 = qrResult.md5;
                    order.paymentStatus = 'pending';
                    order.paymentData = {
                        currency: qrResult.currency || 'USD',
                        amountUSD: qrResult.amountUSD,
                        amountKHR: qrResult.amountKHR,
                        exchangeRate: qrResult.amountKHR ? 4100 : null,
                        qrCode: qrResult.qrCode,
                        qrImage: qrResult.qrImage
                    };
                    order.qrExpiresAt = new Date(qrResult.validUntil);
                } else {
                    return res.status(502).json({
                        success: false,
                        message: 'Failed to initialize Bakong payment. Please try again.'
                    });
                }
            } catch (err) {
                console.error('Bakong QR generation failed:', err.message);
                return res.status(502).json({
                    success: false,
                    message: 'Failed to initialize Bakong payment. Please try again.'
                });
            }
        }

        const savedOrder = await order.save();

        sendOrderNotification(savedOrder).catch(err =>
            console.error('Background telegram error:', err.message)
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: savedOrder._id,
                orderNumber: savedOrder.orderNumber,
                total: savedOrder.total,
                customer: {
                    fullName: savedOrder.customer.fullName,
                    email: savedOrder.customer.email,
                    phone: savedOrder.customer.phone
                }
            }
        });

    } catch (error) {
        console.error('❌ Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create order'
        });
    }
});

// GET single order by ID (public - for order tracking)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                customer: order.customer,
                items: order.items,
                subtotal: order.subtotal,
                total: order.total,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                qrImage: order.paymentData?.qrImage,
                paymentData: order.paymentData,
                qrExpiresAt: order.qrExpiresAt,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET payment status check for Bakong KHQR (public)
router.get('/:id/check-payment', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // If not a Bakong order or no md5, return unknown
        if (order.paymentMethod !== 'Bakong KHQR' || !order.paymentMd5) {
            return res.json({
                status: 'unknown',
                message: 'Not a Bakong KHQR order or missing payment reference'
            });
        }

        if (order.paymentStatus === 'paid') {
            sendPaidReceiptIfNeeded(order);
            return res.json({ status: 'paid' });
        }

        // Keep checking for a short grace window after QR expiry.
        // This avoids false "expired" when upstream verification is temporarily blocked.
        const nowMs = Date.now();
        const qrExpiresAtMs = order.qrExpiresAt ? new Date(order.qrExpiresAt).getTime() : null;
        const isQrExpired = Number.isFinite(qrExpiresAtMs) && qrExpiresAtMs < nowMs;
        const isPastConfirmationGrace = isQrExpired && (nowMs - qrExpiresAtMs) > QR_CONFIRMATION_GRACE_MS;

        if (isPastConfirmationGrace) {
            if (order.paymentStatus !== 'failed') {
                order.paymentStatus = 'failed';
                await order.save();
            }
            return res.json({
                status: 'expired',
                message: 'QR code has expired'
            });
        }

        // Mock mode: auto-approve mock orders for dev
        if (process.env.BAKONG_MOCK === 'true' && order.paymentMd5?.startsWith('mock_md5_')) {
            order.paymentStatus = 'paid';
            if (order.orderStatus === 'pending') {
                order.orderStatus = 'processing';
            }
            await order.save();
            sendPaidReceiptIfNeeded(order);
            return res.json({ status: 'paid' });
        }

        const cacheKey = String(order._id);
        const cached = paymentCheckCache.get(cacheKey);
        if (cached && nowMs < cached.nextCheckAt) {
            return res.json(cached.response);
        }

        const result = await bakongService.checkPaymentStatus(order.paymentMd5);

        let nextCheckDelayMs = PAYMENT_CHECK_MIN_INTERVAL_MS;
        let statusResponse;
        if (result.success && result.status === 'PAID') {
            order.paymentStatus = 'paid';
            if (order.orderStatus === 'pending') {
                order.orderStatus = 'processing';
            }
            await order.save();
            sendPaidReceiptIfNeeded(order);
            statusResponse = { status: 'paid' };
            paymentCheckCache.delete(cacheKey);
            return res.json(statusResponse);
        } else if (result.success && result.status === 'UNPAID') {
            if (result.transient) {
                nextCheckDelayMs = result.retryAfterMs || PAYMENT_CHECK_TRANSIENT_MS;
            }
            statusResponse = {
                status: 'pending',
                qrExpired: isQrExpired,
                retryAfterMs: nextCheckDelayMs,
                ...(result.transient ? { message: result.error } : {})
            };

            if (isQrExpired) {
                nextCheckDelayMs = Math.max(nextCheckDelayMs, QR_EXPIRED_RETRY_MS);
                statusResponse.retryAfterMs = nextCheckDelayMs;
                if (!statusResponse.message) {
                    statusResponse.message = 'QR has expired. Verifying latest payment status...';
                }
            }
        } else {
            nextCheckDelayMs = PAYMENT_CHECK_TRANSIENT_MS;
            statusResponse = {
                status: isQrExpired ? 'pending' : 'error',
                qrExpired: isQrExpired,
                retryAfterMs: nextCheckDelayMs,
                message: result.error || 'Payment check failed'
            };

            if (isQrExpired) {
                nextCheckDelayMs = Math.max(nextCheckDelayMs, QR_EXPIRED_RETRY_MS);
                statusResponse.retryAfterMs = nextCheckDelayMs;
            }
        }

        paymentCheckCache.set(cacheKey, {
            checkedAt: nowMs,
            nextCheckAt: nowMs + nextCheckDelayMs,
            response: statusResponse
        });

        res.json(statusResponse);
    } catch (error) {
        console.error('Error checking Bakong payment status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during payment check'
        });
    }
});

// GET order by order number (public)
router.get('/number/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                customer: order.customer,
                items: order.items,
                total: order.total,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========== ADMIN ROUTES (Protected) ==========

// GET all orders (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        res.json(orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            customer: order.customer,
            items: order.items,
            subtotal: order.subtotal,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        })));
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE order status (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const previousPaymentStatus = order.paymentStatus;

        // Update order status if provided
        if (req.body.orderStatus) {
            order.orderStatus = req.body.orderStatus;
        }

        // Update payment status if provided
        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        const updatedOrder = await order.save();
        if (previousPaymentStatus !== 'paid' && updatedOrder.paymentStatus === 'paid') {
            sendPaidReceiptIfNeeded(updatedOrder);
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            order: {
                id: updatedOrder._id,
                orderNumber: updatedOrder.orderNumber,
                orderStatus: updatedOrder.orderStatus,
                paymentStatus: updatedOrder.paymentStatus
            }
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

