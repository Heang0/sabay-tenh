const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const userAuth = require('../middleware/userAuth');

// POST /api/users/google-auth — Create or find user after Google sign-in
router.post('/google-auth', userAuth, async (req, res) => {
    try {
        const { uid, email, name, picture } = req.firebaseUser;

        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // Create new user from Google profile
            user = new User({
                firebaseUid: uid,
                email: email || '',
                displayName: name || req.body.displayName || '',
                photoURL: picture || req.body.photoURL || ''
            });
            await user.save();
            console.log('✅ New user created:', email);
        } else {
            // Update profile info from Google (in case they changed name/photo)
            if (name && name !== user.displayName) user.displayName = name;
            if (picture && picture !== user.photoURL) user.photoURL = picture;
            if (email && email !== user.email) user.email = email;
            await user.save();
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                addresses: user.addresses
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/users/profile — Get user profile
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
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                addresses: user.addresses
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/users/profile — Update profile
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
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                addresses: user.addresses
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/users/orders — Get user's order history
router.get('/orders', userAuth, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const orders = await Order.find({ userId: user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders: orders.map(order => ({
                id: order._id,
                orderNumber: order.orderNumber,
                items: order.items,
                total: order.total,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt
            }))
        });
    } catch (error) {
        console.error('Orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
