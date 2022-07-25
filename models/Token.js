const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },

    token: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true,
        createdAt: Date,
        expiresAt: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('Tokens', tokenSchema);