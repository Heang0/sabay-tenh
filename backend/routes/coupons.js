const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const authMiddleware = require('../middleware/auth');

// ========== PUBLIC ROUTES ==========

// Validate coupon code
router.post('/validate', async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check expiry
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Coupon has expired'
            });
        }

        // Check usage limit
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit reached'
            });
        }

        // Check minimum order
        if (orderTotal && orderTotal < coupon.minOrder) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is $${coupon.minOrder}`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (orderTotal || 0) * (coupon.value / 100);
        } else {
            discount = coupon.value;
        }

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discount: Math.round(discount * 100) / 100
            }
        });
    } catch (error) {
        console.error('Coupon validation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== ADMIN ROUTES ==========

// GET all coupons (admin)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// CREATE coupon (admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { code, type, value, minOrder, maxUses, expiresAt } = req.body;

        if (!code || !type || value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Code, type, and value are required'
            });
        }

        // Check duplicate
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            type,
            value,
            minOrder: minOrder || 0,
            maxUses: maxUses || null,
            expiresAt: expiresAt || null
        });

        await coupon.save();
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// UPDATE coupon (admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.json({ success: true, coupon });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE coupon (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
