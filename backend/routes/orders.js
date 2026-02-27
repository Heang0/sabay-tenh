const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const { sendOrderReceipt } = require('../services/emailService');
const { sendOrderNotification } = require('../services/telegram');

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
        console.log('📦 Creating new order...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

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
        console.log('Generated order number:', orderNumber);

        // Create order data
        const orderData = {
            orderNumber: orderNumber,
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
        const savedOrder = await order.save();

        console.log('✅ Order saved to database:', savedOrder.orderNumber);

        // Fire and forget email with better error logging
        if (savedOrder.customer.email) {
            sendOrderReceipt(savedOrder)
                .then(result => {
                    if (result) console.log('📧 Email sent successfully');
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

        console.log(`✅ Order ${order.orderNumber} updated:`, {
            orderStatus: updatedOrder.orderStatus,
            paymentStatus: updatedOrder.paymentStatus
        });

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