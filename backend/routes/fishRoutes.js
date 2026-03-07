const express = require('express');
const router = express.Router();
const { createListing, getListings, uploadListingPhoto, updateListing, deleteListing, getMyListings, toggleStockStatus, updateStockStatus } = require('../controllers/fishController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Fisherman's own listings - Both hyphen and slash as requested
router.get('/my-listings', protect, getMyListings);
router.get('/mylistings', protect, getMyListings);

// PATCH routes for stock control
router.patch('/:id/status', protect, updateStockStatus);
router.patch('/:id/toggle-stock', protect, toggleStockStatus);
router.patch('/:id/out-of-stock', protect, toggleStockStatus);

// User specs: GET /api/fish/list
router.get('/list', getListings);

// User specs: POST /api/fish/upload
router.post('/upload', protect, upload.single('image'), uploadListingPhoto);

// Backwards compatibility with standard routes
router.route('/:id')
    .put(protect, updateListing)
    .delete(protect, deleteListing);

router.route('/')
    .get(getListings)
    .post(protect, createListing);

module.exports = router;
