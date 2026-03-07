import mongoose from 'mongoose';

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

const NetData = mongoose.model('NetData', netDataSchema);
export default NetData;
