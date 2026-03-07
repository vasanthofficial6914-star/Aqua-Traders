import FishListing from '../models/FishListing.js';

// @desc    Upload new fish listing with photo
// @route   POST /api/fish/upload
// @access  Private (Fishermen only)
const uploadListingPhoto = async (req, res) => {
    try {
        if (req.user.role !== 'fisherman') {
            return res.status(403).json({ message: 'Only fishermen can list fish' });
        }

        const { fishType, quantity, pricePerKg } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const listing = new FishListing({
            fishermanId: req.user._id.toString(),
            fishType,
            quantity: Number(quantity),
            totalQuantity: Number(quantity),
            pricePerKg: Number(pricePerKg),
            imageUrl
        });

        const createdListing = await listing.save();
        res.status(201).json({ message: 'Upload successful', listing: createdListing });
    } catch (error) {
        res.status(500).json({ message: 'Failed to upload listing', error: error.message });
    }
};

// @desc    Create a new fish listing without photo (fallback)
// @route   POST /api/fish
// @access  Private (Fishermen only)
const createListing = async (req, res) => {
    const { fishType, quantity, pricePerKg, imageUrl } = req.body;

    if (req.user.role !== 'fisherman') {
        return res.status(403).json({ message: 'Only fishermen can list fish' });
    }

    try {
        const listing = new FishListing({
            fishermanId: req.user._id.toString(),
            fishType,
            quantity,
            totalQuantity: quantity,
            pricePerKg,
            imageUrl: imageUrl || ''
        });

        const createdListing = await listing.save();
        res.status(201).json(createdListing);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create listing', error: error.message });
    }
};

// @desc    Get all fish listings
// @route   GET /api/fish/list & GET /api/fish
// @access  Public
const getListings = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Only return listings from last 24 hours
        // And sort: stock > 0 first, then by createdAt desc
        const listings = await FishListing.find({
            createdAt: { $gte: twentyFourHoursAgo }
        }).sort({
            quantity: -1,
            createdAt: -1
        });

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a fish listing
// @route   PUT /api/fish/:id
// @access  Private (Fishermen only)
const updateListing = async (req, res) => {
    try {
        const { fishType, quantity, pricePerKg, status } = req.body;
        const fish = await FishListing.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (fish.fishermanId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        fish.fishType = fishType || fish.fishType;
        fish.quantity = quantity !== undefined ? Number(quantity) : fish.quantity;
        fish.pricePerKg = pricePerKg || fish.pricePerKg;
        fish.status = status || fish.status;

        const updatedListing = await fish.save();
        res.json(updatedListing);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update listing', error: error.message });
    }
};

// @desc    Delete a fish listing
// @route   DELETE /api/fish/:id
// @access  Private (Fishermen only)
const deleteListing = async (req, res) => {
    try {
        const fish = await FishListing.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (fish.fishermanId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await fish.deleteOne();
        res.json({ message: 'Listing removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete listing', error: error.message });
    }
};

// @desc    Get listings by fisherman (for dashboard)
// @route   GET /api/fish/mylistings
// @access  Private (Fisherman only)
const getMyListings = async (req, res) => {
    try {
        const listings = await FishListing.find({ fishermanId: req.user._id.toString() }).sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle fish listing stock status
// @route   PATCH /api/fish/:id/toggle-stock
// @access  Private (Fishermen only)
const toggleStockStatus = async (req, res) => {
    try {
        const fish = await FishListing.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (fish.fishermanId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Toggle state
        fish.status = fish.status === 'in_stock' ? 'stock_out' : 'in_stock';

        // If marking as in_stock and quantity is 0, maybe we should reset it?
        // But the prompt says "manual stock control", so we'll just toggle the status field.

        await fish.save();
        res.json(fish);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update stock status', error: error.message });
    }
};

// @desc    Update fish listing stock status
// @route   PATCH /api/fish/:id/status
// @access  Private (Fishermen only)
const updateStockStatus = async (req, res) => {
    try {
        const fish = await FishListing.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ success: false, message: 'Fish not found' });
        }

        if (fish.fishermanId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        fish.status = req.body.status;

        await fish.save();

        res.json({
            success: true,
            message: "Stock status updated",
            fish
        });
    } catch (error) {
        console.error("Update stock status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update stock status"
        });
    }
};

export {
    uploadListingPhoto,
    createListing,
    getListings,
    getMyListings,
    updateListing,
    deleteListing,
    toggleStockStatus,
    updateStockStatus
};
