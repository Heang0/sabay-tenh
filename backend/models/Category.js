const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    nameKm: {
        type: String,
        required: true,
        unique: true
    },
    nameEn: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String,
        default: '📦'
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);