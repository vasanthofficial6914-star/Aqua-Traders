import express from 'express';
const router = express.Router();
import { receiveHardwareData, getLatestNetData } from '../controllers/netDataController.js';

router.post('/', receiveHardwareData);
router.get('/latest', getLatestNetData);

export default router;
