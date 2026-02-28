const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const userAuth = require('../middleware/userAuth');

// All wishlist routes require user auth
router.use(userAuth);

// GET user's wishlist
router.get('/', async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            return res.json({ success: true, products: [] });
        }

        // Populate product details
        const products = await Product.find({
            _id: { $in: wishlist.products }
        });

        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET just the product IDs (lightweight)
router.get('/ids', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        res.json({
            success: true,
            productIds: wishlist ? wishlist.products : []
        });
    } catch (error) {
        console.error('Error fetching wishlist IDs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ADD product to wishlist
router.post('/:productId', async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            wishlist = new Wishlist({ userId: req.user.id, products: [] });
        }

        // Check if already in wishlist
        if (wishlist.products.includes(req.params.productId)) {
            return res.json({ success: true, message: 'Already in wishlist' });
        }

        wishlist.products.push(req.params.productId);
        await wishlist.save();

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// REMOVE product from wishlist
router.delete('/:productId', async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== req.params.productId
        );
        await wishlist.save();

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
