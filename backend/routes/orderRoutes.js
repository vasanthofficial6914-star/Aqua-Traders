const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, buyFish } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/buy', protect, buyFish);
router.get('/myorders', protect, getMyOrders);

router.route('/')
    .post(protect, createOrder);

module.exports = router;
