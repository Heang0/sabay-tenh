const admin = require('firebase-admin');
const path = require('path');
const User = require('../models/User');

// Initialize Firebase Admin SDK
let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Parse the JSON string from environment variable (for Render/Production)
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback to local file (for Development)
        serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
}

// Middleware to verify Firebase ID token and attach MongoDB user
const userAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.firebaseUser = decodedToken;
        req.firebaseUid = decodedToken.uid;

        // Attach MongoDB user so req.user.id works in all routes
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (user) {
            req.user = { id: user._id };
        }

        next();
    } catch (error) {
        console.error('Firebase auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = userAuth;

