const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    authProvider: {
        type: String,
        enum: ['firebase', 'telegram'],
        default: 'firebase'
    },
    telegramId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    telegramUsername: {
        type: String,
        default: ''
    },
    displayName: {
        type: String,
        default: ''
    },
    photoURL: {
        type: String,
        default: ''
    },
    addresses: [{
        label: String,
        address: String,
        isDefault: Boolean
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
