const mongoose = require('mongoose');

const fishListingSchema = new mongoose.Schema({
    fishermanId: {
        type: String, // String or ObjectId, prompt says "fishermanId: String" but we can store ObjectId as string.
        required: true
    },
    fishType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    pricePerKg: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['in_stock', 'stock_out'],
        default: 'in_stock'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('FishListing', fishListingSchema);
