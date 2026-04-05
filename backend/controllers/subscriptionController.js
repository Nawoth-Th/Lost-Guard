const Subscription = require('../models/Subscription');

// @desc    Subscribe to a category and block
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req, res) => {
    try {
        const { category, locationBlock } = req.body;

        // Check if subscription already exists
        const exists = await Subscription.findOne({
            user: req.user._id,
            category,
            locationBlock
        });

        if (exists) {
            return res.status(400).json({ message: 'Watchlist already active for this area' });
        }

        const subscription = await Subscription.create({
            user: req.user._id,
            category,
            locationBlock
        });

        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (subscription && subscription.user.toString() === req.user._id.toString()) {
            await subscription.deleteOne();
            res.json({ message: 'Watchlist removed' });
        } else {
            res.status(404).json({ message: 'Watchlist not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createSubscription,
    getMySubscriptions,
    deleteSubscription
};
