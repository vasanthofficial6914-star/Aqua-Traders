import express from 'express';
const router = express.Router();

// Memory store for latest hardware data
let latestHardwareData = {
    weight: 0,
    temperature: 0,
    salinity: 0,
    timestamp: new Date().toISOString()
};

// @desc    Update latest hardware data (Internal use by hardware-server)
// @route   POST /api/hardware/update
// @access  Private (should be protected in production)
router.post('/update', (req, res) => {
    const { weight, temperature, salinity, timestamp } = req.body;

    latestHardwareData = {
        weight: weight || latestHardwareData.weight,
        temperature: temperature || latestHardwareData.temperature,
        salinity: salinity || latestHardwareData.salinity,
        timestamp: timestamp || new Date().toISOString()
    };

    res.status(200).json({ success: true, message: 'Data updated' });
});

// @desc    Get latest hardware data
// @route   GET /api/hardware/latest
// @access  Public
router.get('/latest', (req, res) => {
    res.status(200).json(latestHardwareData);
});

export default router;
