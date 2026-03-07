import Order from '../models/Order.js';
import FishListing from '../models/FishListing.js';
import User from '../models/User.js';
import sendEmail from '../services/emailService.js';

// @desc    Create a new order / Buy fish
// @route   POST /api/orders/buy
// @access  Private (Buyer only for this specific route)
const buyFish = async (req, res) => {
    const { fishId, orderKg } = req.body;

    try {
        const listing = await FishListing.findById(fishId);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.status === 'stock_out') {
            return res.status(400).json({ message: 'Fish is out of stock' });
        }

        // Parse to integer just in case, similar to previous logic
        const quantity = parseInt(orderKg);

        if (listing.quantity < quantity) {
            return res.status(400).json({ message: `Only ${listing.quantity}kg available` });
        }

        const totalPrice = parseInt(listing.pricePerKg) * quantity;

        const order = new Order({
            buyerId: req.user._id,
            fishId: listing._id,
            quantity,
            totalPrice
        });

        const createdOrder = await order.save();

        // Update listing quantity
        listing.quantity -= quantity;

        // Stock Out Logic
        if (listing.quantity <= 0) {
            listing.status = "stock_out";
        }

        await listing.save();

        res.status(201).json({ message: 'Purchase successful', order: createdOrder });
    } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ message: `Failed: ${error.message}`, error: error.message });
    }
};

// @desc    Create a new order (legacy/generic route)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    // legacy logic remains here since buyFish takes over functionality.
    const { listingId, quantity } = req.body;

    try {
        const listing = await FishListing.findById(listingId).populate('fisherman');

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const price = listing.price || listing.pricePerKg; // fallback since model changed
        const totalStock = listing.weight !== undefined ? listing.weight : listing.quantity;

        if (totalStock < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const totalPrice = parseInt(price) * parseInt(quantity);

        const order = new Order({
            buyer: req.user._id,
            fisherman: listing.fisherman ? listing.fisherman._id : listing.fishermanId,
            listing: listing._id,
            quantity,
            totalPrice
        });

        const createdOrder = await order.save();

        if (listing.weight !== undefined) listing.weight -= quantity;
        if (listing.quantity !== undefined) listing.quantity -= quantity;

        await listing.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id })
            .populate('fishId', 'fishType imageUrl')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

export {
    buyFish,
    createOrder,
    getMyOrders
};
