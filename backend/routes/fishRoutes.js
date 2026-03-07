import express from 'express';
const router = express.Router();
import { createListing, getListings, uploadListingPhoto, updateListing, deleteListing, getMyListings, toggleStockStatus, updateStockStatus } from '../controllers/fishController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

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

export default router;
