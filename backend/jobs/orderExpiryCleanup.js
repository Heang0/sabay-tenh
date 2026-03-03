const mongoose = require('mongoose');
const Order = require('../models/Order');

const daysRaw = Number(process.env.UNPAID_ORDER_EXPIRE_DAYS || 3);
const cleanupMinutesRaw = Number(process.env.UNPAID_ORDER_CLEANUP_MINUTES || 60);

const UNPAID_ORDER_EXPIRE_DAYS = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : 3;
const CLEANUP_INTERVAL_MINUTES = Number.isFinite(cleanupMinutesRaw) && cleanupMinutesRaw > 0
    ? cleanupMinutesRaw
    : 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const cleanupIntervalMs = CLEANUP_INTERVAL_MINUTES * 60 * 1000;

let cleanupTimer = null;

const getCutoffDate = () => new Date(Date.now() - (UNPAID_ORDER_EXPIRE_DAYS * DAY_MS));

const expireStaleUnpaidOrders = async () => {
    const cutoff = getCutoffDate();

    const result = await Order.updateMany(
        {
            paymentStatus: { $in: ['pending', 'failed'] },
            orderStatus: { $ne: 'cancelled' },
            createdAt: { $lt: cutoff }
        },
        {
            $set: {
                paymentStatus: 'failed',
                orderStatus: 'cancelled'
            }
        }
    );

    const modifiedCount = Number(result.modifiedCount || 0);
    if (modifiedCount > 0) {
        console.log(
            `[order-cleanup] Marked ${modifiedCount} unpaid orders as cancelled (older than ${UNPAID_ORDER_EXPIRE_DAYS} days).`
        );
    }

    return modifiedCount;
};

const runCleanupSafely = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return;
        }
        await expireStaleUnpaidOrders();
    } catch (error) {
        console.error('[order-cleanup] Failed to run unpaid-order cleanup:', error.message);
    }
};

const startOrderExpiryCleanupJob = () => {
    if (process.env.DISABLE_ORDER_EXPIRY_JOB === 'true') {
        console.log('[order-cleanup] Disabled by DISABLE_ORDER_EXPIRY_JOB=true');
        return null;
    }

    if (cleanupTimer) {
        return cleanupTimer;
    }

    runCleanupSafely();

    cleanupTimer = setInterval(runCleanupSafely, cleanupIntervalMs);
    if (typeof cleanupTimer.unref === 'function') {
        cleanupTimer.unref();
    }

    console.log(
        `[order-cleanup] Started: every ${CLEANUP_INTERVAL_MINUTES} minute(s), expire after ${UNPAID_ORDER_EXPIRE_DAYS} day(s).`
    );

    return cleanupTimer;
};

module.exports = {
    startOrderExpiryCleanupJob,
    expireStaleUnpaidOrders
};
