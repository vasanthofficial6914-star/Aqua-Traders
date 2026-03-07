const express = require('express');
const router = express.Router();
const { receiveHardwareData, getLatestNetData } = require('../controllers/netDataController');

router.post('/', receiveHardwareData);
router.get('/latest', getLatestNetData);

module.exports = router;
