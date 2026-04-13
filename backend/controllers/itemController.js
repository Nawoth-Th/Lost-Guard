const Item = require('../models/Item');
const StatusLog = require('../models/StatusLog');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { sendEmail, templates } = require('../utils/emailService');

// @desc    Fetch all items (with keyword search)
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                  $or: [
                      { title: { $regex: req.query.keyword, $options: 'i' } },
                      { category: { $regex: req.query.keyword, $options: 'i' } },
                      { location: { $regex: req.query.keyword, $options: 'i' } },
                  ],
              }
            : {};

        const items = await Item.find({ ...keyword })
            .populate('user', 'id name')
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single item
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('user', 'id name');

        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
    const { 
        title, 
        description, 
        category, 
        location, 
        locationBlock, 
        type, 
        image, 
        verificationQuestion, 
        verificationAnswer 
    } = req.body;

    if (!title || !description || !category || !location || !locationBlock || !type) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const item = new Item({
            title,
            description,
            category,
            location,
            locationBlock,
            type,
            user: req.user._id,
            image,
            verificationQuestion,
            verificationAnswer
        });

        const createdItem = await item.save();

        // Create initial StatusLog
        await StatusLog.create({
            item: createdItem._id,
            status: 'Reported',
            changedBy: req.user._id,
            remarks: `Item ${type} reported`
        });

        // 🔍 Automated Matching Alerts (non-blocking)
        try {
            const matchType = type === 'Lost' ? 'Found' : 'Lost';
            
            // Smart matching logic: find items of opposite type with same category AND same location block
            const matchQuery = {
                _id: { $ne: createdItem._id },
                type: matchType,
                category,
                locationBlock,
                status: 'Pending',
            };

            const matches = await Item.find(matchQuery).limit(5).populate('user');

            matches.forEach(match => {
                if (match.user && match.user.email && match.user._id.toString() !== req.user._id.toString()) {
                    sendEmail({
                        email: match.user.email,
                        subject: `Match Alert: Potential ${matchType} for "${match.title}" ✨`,
                        message: templates.itemMatch(match.title, match.type),
                    }).catch(err => console.error('Match email error:', err.message));
                }
            });

            // 🔔 Watchlist/Subscription Alerts
            if (type === 'Found') {
                const subscriptions = await Subscription.find({
                    category,
                    locationBlock,
                    user: { $ne: req.user._id }
                }).populate('user');

                subscriptions.forEach(async (sub) => {
                    if (sub.user) {
                        await Notification.create({
                            user: sub.user._id,
                            title: 'Watchlist Alert! 🔔',
                            message: `A new "${category}" has been found in ${locationBlock}.`,
                            item: createdItem._id
                        });
                        
                        if (sub.user.email) {
                            sendEmail({
                                email: sub.user.email,
                                subject: `Watchlist Alert: ${category} in ${locationBlock} 🛡️`,
                                message: `Good news! Someone found an item matching your criteria in ${locationBlock}. Log in to view details.`
                            }).catch(err => console.error('Watchlist email error:', err.message));
                        }
                    }
                });
            }
        } catch (matchErr) {
            console.error('Match/Subscription logic error (non-fatal):', matchErr.message);
        }

        res.status(201).json(createdItem);
    } catch (error) {
        console.error('Create Item Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update item status
// @route   PUT /api/items/:id/status
// @access  Private
const updateItemStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            item.status = status;
            const updatedItem = await item.save();

            // 🏆 Trust Score: If marked as recovered, reward the finder
            if (status === 'Recovered' && item.type === 'Found') {
                const finder = await User.findById(item.user);
                if (finder) {
                    finder.trustScore += 10;
                    await finder.save();
                }
            }

            // Create StatusLog entry
            await StatusLog.create({
                item: item._id,
                status: status,
                changedBy: req.user._id,
                remarks: req.body.remarks || `Status updated to ${status}`
            });

            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
    try {
        console.log(`[Item Deletion] Attempting to delete item: ${req.params.id} by user: ${req.user._id} (Admin: ${req.user.isAdmin})`);
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Verify ownership or Admin rights
        if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            console.warn(`[Item Deletion] Unauthorized attempt by user ${req.user._id} for item ${item._id}`);
            return res.status(401).json({ message: 'Not authorized - You do not own this item and are not an admin.' });
        }

        // Remove associated records first
        await StatusLog.deleteMany({ item: item._id });
        await Claim.deleteMany({ item: item._id });

        // Direct deletion
        await Item.findByIdAndDelete(item._id);
        
        console.log(`[Item Deletion] Successfully deleted item: ${item._id}`);
        res.json({ message: 'Item and history successfully removed.' });
    } catch (error) {
        console.error('[Item Deletion Error]:', error.message);
        res.status(500).json({ message: `Deletion failed: ${error.message}` });
    }
};

// @desc    Get smart matches for suggestions based on Category and Block
// @route   GET /api/items/matches/:id
// @access  Public
const getMatchingItems = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const matchType = item.type === 'Lost' ? 'Found' : 'Lost';
        
        // Campus Matching: Find opposite type with same category and same location block
        const matchQuery = {
            _id: { $ne: item._id },
            type: matchType,
            category: item.category,
            locationBlock: item.locationBlock,
            status: 'Pending'
        };

        const matches = await Item.find(matchQuery).limit(5).populate('user', 'name');

        res.json(matches);
    } catch (error) {
        console.error('Match Items Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update item hub status
// @route   PATCH /api/items/:id/hub
// @access  Private/Admin
const updateItemHub = async (req, res) => {
    try {
        const { isAtHub, hubName } = req.body;
        const item = await Item.findById(req.params.id);

        if (item) {
            if (!req.user.isAdmin) {
                return res.status(401).json({ message: 'Not authorized - Admin only' });
            }

            item.isAtHub = isAtHub;
            item.hubName = isAtHub ? hubName : '';
            
            const updatedItem = await item.save();
            
            // 🔔 Notify the owner when item is secured at hub
            if (isAtHub) {
                const owner = await User.findById(item.user);
                if (owner && owner.email) {
                    sendEmail({
                        email: owner.email,
                        subject: `Your item "${item.title}" is safe! 🛡️`,
                        message: templates.itemSecured(item.title, hubName),
                    }).catch(err => console.error('Hub notification email error:', err.message));

                    // Also create an in-app notification
                    await Notification.create({
                        user: owner._id,
                        title: 'Item Secured at Hub 🛡️',
                        message: `Your item "${item.title}" has been verified and is ready for collection at ${hubName}.`,
                        item: item._id
                    }).catch(err => console.error('Hub in-app notification error:', err.message));
                }
            }

            await StatusLog.create({
                item: item._id,
                status: isAtHub ? 'Secured at Hub' : 'In Circulation',
                changedBy: req.user._id,
                remarks: isAtHub ? `Item secured at ${hubName}` : 'Item released from hub'
            });

            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get status logs for an item
// @route   GET /api/items/:id/logs
// @access  Private
const getItemStatusLogs = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Only reporter and admin can see logs
        if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized to view logs' });
        }

        const logs = await StatusLog.find({ item: req.params.id })
            .populate('changedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get items reported by the logged-in user (Active)
// @route   GET /api/items/myitems
// @access  Private
const getMyItems = async (req, res) => {
    try {
        // Find items user successfully claimed
        const approvedClaims = await Claim.find({ requester: req.user._id, status: 'Approved' });
        const claimedItemIds = approvedClaims.map(c => c.item);

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const items = await Item.find({ 
            $and: [
                {
                    $or: [
                        { user: req.user._id },
                        { _id: { $in: claimedItemIds } }
                    ]
                },
                {
                    $or: [
                        { status: { $nin: ['Recovered', 'Closed'] } },
                        { status: { $in: ['Recovered', 'Closed'] }, updatedAt: { $gt: oneHourAgo } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(items);
    } catch (error) {
        console.error('Get My Items Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get archived items for the logged-in user
// @route   GET /api/items/archives
// @access  Private
const getArchivedItems = async (req, res) => {
    try {
        // Find items user successfully claimed
        const approvedClaims = await Claim.find({ requester: req.user._id, status: 'Approved' });
        const claimedItemIds = approvedClaims.map(c => c.item);

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const items = await Item.find({ 
            $and: [
                {
                    $or: [
                        { user: req.user._id },
                        { _id: { $in: claimedItemIds } }
                    ]
                },
                { status: { $in: ['Recovered', 'Closed'] } },
                { updatedAt: { $lte: oneHourAgo } }
            ]
        }).sort({ updatedAt: -1 });
        
        res.json(items);
    } catch (error) {
        console.error('Get Archived Items Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user items by ID (Admin)
// @route   GET /api/items/user/:userId
// @access  Private/Admin
const getUserItems = async (req, res) => {
    try {
        const items = await Item.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching user items' });
    }
};

module.exports = { 
    getItems, 
    getItemById, 
    createItem, 
    updateItemStatus, 
    deleteItem,
    getMatchingItems,
    getMyItems,
    getArchivedItems,
    getUserItems,
    getItemStatusLogs,
    updateItemHub
};
