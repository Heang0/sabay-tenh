const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    couponCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    customer: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        email: String,
        note: String
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        nameKm: String,
        nameEn: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    paymentMethod: { type: String, default: 'Bakong KHQR' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMd5: String,
    paymentData: {
        amountKHR: Number,
        exchangeRate: Number,
        qrCode: String
    },
    orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true }
}, { timestamps: true });

// NO PRE-SAVE HOOKS AT ALL
// Let MongoDB generate _id and we'll handle orderNumber in the route

module.exports = mongoose.model('Order', orderSchema);