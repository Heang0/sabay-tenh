const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Add this
const Admin = require('../models/Admin');

// Setup - hash password here instead
router.post('/setup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hash password here
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({
            username,
            password: hashedPassword // Save hashed password
        });

        await admin.save();
        res.json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Login - simplified
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, admin: { username: admin.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;