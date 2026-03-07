import NetData from '../models/NetData.js';
import sendEmail from '../services/emailService.js';

// @desc    Receive hardware data from Arduino
// @route   POST /api/netdata
// @access  Public (Simulated Arduino Request)
const receiveHardwareData = async (req, res) => {
    const { loadValue, stressValue, deviceId, fishermanEmail } = req.body;

    try {
        const load = parseFloat(loadValue);
        const stress = parseFloat(stressValue);
        const status = load >= 50 ? 'STOP' : 'SAFE';

        const dataEntry = new NetData({
            deviceId,
            loadValue: load,
            stressValue: stress,
            status
        });

        await dataEntry.save();

        if (status === 'STOP' && fishermanEmail) {
            await sendEmail({
                email: fishermanEmail,
                subject: '🚨 URGENT: Net Overload Detected! - FisherDirect',
                message: `DANGER! Your fishing net load has exceeded safe limits.\n\nCurrent Load: ${load}kg\nStatus: STOP IMMEDIATELY\n\nPlease check your equipment to avoid tearing and tangling.\n\n- FisherDirect Smart Monitoring`
            });
        }

        res.status(201).json({ message: 'Data logged successfully', status });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// @desc    Get latest hardware data for dashboard
// @route   GET /api/netdata/latest
// @access  Public or Private depending on security needs
const getLatestNetData = async (req, res) => {
    try {
        const latestData = await NetData.findOne().sort({ createdAt: -1 });

        if (!latestData) {
            return res.status(404).json({ message: 'No data found' });
        }

        res.json(latestData);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export {
    receiveHardwareData,
    getLatestNetData
};
