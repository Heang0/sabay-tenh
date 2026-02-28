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
        required: true,
        unique: true
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
