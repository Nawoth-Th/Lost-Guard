const Item = require('../models/Item');
const StatusLog = require('../models/StatusLog');
const User = require('../models/User');
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
    const { title, description, category, location, type, image } = req.body;

    if (!title || !description || !category || !location || !type) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const item = new Item({
            title,
            description,
            category,
            location,
            type,
            user: req.user._id,
            image,
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
            const titleWords = title.split(' ').filter(word => word.length > 2);
            const titleRegex = titleWords.length > 0 ? new RegExp(titleWords.join('|'), 'i') : null;

            const matchQuery = {
                _id: { $ne: createdItem._id },
                type: matchType,
                status: 'Pending',
            };

            if (titleRegex) {
                matchQuery.$or = [
                    { category: category },
                    { title: { $regex: titleRegex } }
                ];
            } else {
                matchQuery.category = category;
            }

            const matches = await Item.find(matchQuery).limit(3).populate('user');

            matches.forEach(match => {
                if (match.user && match.user.email && match.user._id.toString() !== req.user._id.toString()) {
                    sendEmail({
                        email: match.user.email,
                        subject: `Match Alert: Potential ${matchType} for "${match.title}" ✨`,
                        message: templates.itemMatch(match.title, match.type),
                    }).catch(err => console.error('Match email error:', err.message));
                }
            });
        } catch (matchErr) {
            console.error('Match logic error (non-fatal):', matchErr.message);
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
        const item = await Item.findById(req.params.id);

        if (item) {
            if (item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error('Delete Item Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get matching items for suggestions
// @route   GET /api/items/:id/matches
// @access  Public
const getMatchingItems = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const matchType = item.type === 'Lost' ? 'Found' : 'Lost';
        
        // Simple matching logic: find items of opposite type with same category
        // and whose title sounds similar (contains any of the words)
        const titleWords = item.title.split(' ').filter(word => word.length > 2);
        const titleRegex = titleWords.length > 0 ? new RegExp(titleWords.join('|'), 'i') : null;

        const matchQuery = {
            _id: { $ne: item._id },
            type: matchType,
        };

        if (titleRegex) {
            matchQuery.$or = [
                { category: item.category },
                { title: { $regex: titleRegex } }
            ];
        } else {
            matchQuery.category = item.category;
        }

        const matches = await Item.find(matchQuery).limit(5);

        res.json(matches);
    } catch (error) {
        console.error('Match Items Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
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

// @desc    Get items reported by the logged-in user
// @route   GET /api/items/myitems
// @access  Private
const getMyItems = async (req, res) => {
    try {
        const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
    getItemStatusLogs
};
