const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();
const { startOrderExpiryCleanupJob } = require('./jobs/orderExpiryCleanup');

const app = express();

// Render runs behind a reverse proxy; needed for correct client IP in rate limiting.
app.set('trust proxy', 1);

// 🛡️ 1. Security Headers (Hacks & XSS protection)
app.use(helmet());

// 🧼 2. Input Sanitization (NoSQL Injection protection)
app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
});

// 🚦 3. Rate Limiting (DDoS protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  skip: (req) => /^\/api\/orders\/[^/]+\/check-payment$/.test(req.originalUrl || ''),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Apply global limiter to all routes
app.use('/api/', globalLimiter);

// 🔒 4. Auth-specific Rate Limiting (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 auth attempts per hour
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  }
});
app.use('/api/auth/', authLimiter);
app.use('/api/users/google-auth', authLimiter);
app.use('/api/users/telegram-auth', authLimiter);

// 🛡️ 5. HTTP Parameter Pollution protection
app.use(hpp());

// 🚫 6. Hide Express (Small layer of obscurity)
app.disable('x-powered-by');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'https://sabay-tenh-kh.onrender.com',
  'https://sabay-tenh.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin || '');

    if (!origin || allowedOrigins.indexOf(origin) !== -1 || isLocalDevOrigin) {
      callback(null, true);
    } else {
      // Do not throw; just deny CORS silently to avoid noisy server errors.
      callback(null, false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent huge payload attacks

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    startOrderExpiryCleanupJob();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const couponRoutes = require('./routes/coupons');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working! 🚀',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check route (for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { });
