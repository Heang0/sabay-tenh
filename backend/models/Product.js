const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nameKm: {
        type: String,
        required: true
    },
    nameEn: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        default: null
    },
    onSale: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);