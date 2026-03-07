import express from 'express';
const router = express.Router();
import { createOrder, getMyOrders, buyFish } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/buy', protect, buyFish);
router.get('/myorders', protect, getMyOrders);

router.route('/')
    .post(protect, createOrder);

export default router;
