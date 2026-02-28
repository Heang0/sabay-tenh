const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const userAuth = require('../middleware/userAuth');

// GET reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .sort({ createdAt: -1 });

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.json({
            success: true,
            reviews,
            averageRating: Number(averageRating),
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST new review (user auth required)
router.post('/', userAuth, async (req, res) => {
    try {
        const { productId, rating, comment, userName } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({
            userId: req.user.id,
            productId
        });

        if (existing) {
            // Update existing review
            const user = await User.findById(req.user.id);
            existing.rating = rating;
            existing.comment = comment || '';
            existing.userName = userName;
            existing.userPhoto = user?.photoURL || '';
            await existing.save();

            return res.json({
                success: true,
                message: 'Review updated',
                review: existing
            });
        }

        // Create new review
        const user = await User.findById(req.user.id);
        const review = new Review({
            userId: req.user.id,
            productId,
            userName,
            userPhoto: user?.photoURL || '',
            rating,
            comment: comment || ''
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review added',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE review (own review only)
router.delete('/:id', userAuth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
