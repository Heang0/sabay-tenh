const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Helper function to generate unique slug
const generateUniqueSlug = async (baseSlug, excludeId = null) => {
    let slug = baseSlug;
    let counter = 1;

    const query = { slug };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    while (await Product.findOne(query)) {
        slug = `${baseSlug}-${counter}`;
        query.slug = slug;
        counter++;
    }

    return slug;
};

// ========== PUBLIC ROUTES ==========

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET product by SLUG
router.get('/slug/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET featured products (for homepage sections)
router.get('/featured/home', async (req, res) => {
    try {
        const newArrivals = await Product.find()
            .sort({ createdAt: -1 })
            .limit(8);

        const onSale = await Product.find({ onSale: true })
            .sort({ createdAt: -1 })
            .limit(8);

        res.json({ newArrivals, onSale });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== ADMIN ROUTES ==========

// CREATE product
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Creating product with data:', req.body);

        // Validate required fields
        const { nameKm, nameEn, price, image, category } = req.body;
        if (!nameKm || !nameEn || !price || !image || !category) {
            return res.status(400).json({
                message: 'Missing required fields: nameKm, nameEn, price, image, category'
            });
        }

        // Generate slug from nameEn
        const baseSlug = nameEn
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Check if slug exists and make it unique
        let slug = baseSlug;
        let counter = 1;

        while (await Product.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Create product with explicit slug
        const productData = {
            nameKm,
            nameEn,
            slug, // Set slug explicitly here
            price: parseFloat(price),
            salePrice: req.body.salePrice ? parseFloat(req.body.salePrice) : null,
            onSale: req.body.onSale || false,
            image,
            images: req.body.images || [], // Handle multiple images
            category,
            description: req.body.description || '',
            inStock: req.body.inStock !== undefined ? req.body.inStock : true
        };

        console.log('Saving product with slug:', slug);

        const product = new Product(productData);
        const newProduct = await product.save();

        console.log('✅ Product created:', newProduct.nameEn, 'with slug:', newProduct.slug);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// UPDATE product
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        if (req.body.nameKm) product.nameKm = req.body.nameKm;
        if (req.body.nameEn) product.nameEn = req.body.nameEn;
        if (req.body.price) product.price = parseFloat(req.body.price);
        if (req.body.salePrice !== undefined) product.salePrice = req.body.salePrice ? parseFloat(req.body.salePrice) : null;
        if (req.body.onSale !== undefined) product.onSale = req.body.onSale;
        if (req.body.image) product.image = req.body.image;
        if (req.body.images) product.images = req.body.images; // Update images array
        if (req.body.category) product.category = req.body.category;
        if (req.body.description !== undefined) product.description = req.body.description;
        if (req.body.inStock !== undefined) product.inStock = req.body.inStock;

        // If nameEn changed, update slug
        if (req.body.nameEn && req.body.nameEn !== product.nameEn) {
            const baseSlug = req.body.nameEn
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            product.slug = await generateUniqueSlug(baseSlug, req.params.id);
        }

        const updatedProduct = await product.save();
        console.log('✅ Product updated:', updatedProduct.nameEn, 'with slug:', updatedProduct.slug);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE product
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        console.log('🗑️ Product deleted:', product.nameEn);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;