const mongoose = require('mongoose');

const netDataSchema = new mongoose.Schema({
    fisherman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // If device is anonymous or mapped later
    },
    deviceId: {
        type: String,
        required: false
    },
    loadValue: {
        type: Number,
        required: true
    },
    stressValue: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['SAFE', 'STOP'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('NetData', netDataSchema);
