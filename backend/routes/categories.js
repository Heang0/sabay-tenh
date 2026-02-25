const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

// GET all categories (public)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ nameEn: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single category (public)
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE category (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Generate slug from English name
        const slug = req.body.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const category = new Category({
            nameKm: req.body.nameKm,
            nameEn: req.body.nameEn,
            icon: req.body.icon || '📦',
            slug: slug
        });

        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE category (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.nameKm = req.body.nameKm || category.nameKm;
        category.nameEn = req.body.nameEn || category.nameEn;
        category.icon = req.body.icon || category.icon;

        if (req.body.nameEn) {
            category.slug = req.body.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE category (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.deleteOne();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;