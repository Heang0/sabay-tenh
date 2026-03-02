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

// Helper function to generate order number
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
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
            paymentMethod: req.body.paymentMethod || 'ABA Payway Link',
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
                        amountKHR: qrResult.amountKHR,
                        exchangeRate: 4100,
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


        // Fire and forget email with better error logging
        if (savedOrder.customer.email) {
            sendOrderReceipt(savedOrder)
                .then(result => {
                    if (result) { }
                })
                .catch(err => {
                    console.error('❌ Email failed:', err.message);
                    console.error('Email error details:', err);
                });
        }

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
            return res.json({ status: 'paid' });
        }

        // Enforce QR expiration (real 3-min expiry)
        const now = new Date();
        if (order.qrExpiresAt && new Date(order.qrExpiresAt) < now) {
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
            return res.json({ status: 'paid' });
        }

        const result = await bakongService.checkPaymentStatus(order.paymentMd5);

        let statusResponse;
        if (result.success && result.status === 'PAID') {
            order.paymentStatus = 'paid';
            if (order.orderStatus === 'pending') {
                order.orderStatus = 'processing';
            }
            await order.save();
            statusResponse = { status: 'paid' };
        } else if (result.success && result.status === 'UNPAID') {
            statusResponse = {
                status: 'pending',
                ...(result.transient ? { message: result.error } : {})
            };
        } else {
            statusResponse = {
                status: 'error',
                message: result.error || 'Payment check failed'
            };
        }

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

        // Update order status if provided
        if (req.body.orderStatus) {
            order.orderStatus = req.body.orderStatus;
        }

        // Update payment status if provided
        if (req.body.paymentStatus) {
            order.paymentStatus = req.body.paymentStatus;
        }

        const updatedOrder = await order.save();

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
