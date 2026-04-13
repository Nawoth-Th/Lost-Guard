const Hub = require('../models/Hub');

// @desc    Get all hubs
// @route   GET /api/hubs
// @access  Public
const getHubs = async (req, res) => {
    try {
        const hubs = await Hub.find({}).sort({ name: 1 });
        res.json(hubs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a hub
// @route   POST /api/hubs
// @access  Private/Admin
const createHub = async (req, res) => {
    try {
        const { name, location, description } = req.body;
        const hubExists = await Hub.findOne({ name });

        if (hubExists) {
            return res.status(400).json({ message: 'Hub already exists' });
        }

        const hub = await Hub.create({ name, location, description });
        res.status(201).json(hub);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a hub
// @route   PUT /api/hubs/:id
// @access  Private/Admin
const updateHub = async (req, res) => {
    try {
        const hub = await Hub.findById(req.params.id);

        if (hub) {
            hub.name = req.body.name || hub.name;
            hub.location = req.body.location || hub.location;
            hub.description = req.body.description || hub.description;

            const updatedHub = await hub.save();
            res.json(updatedHub);
        } else {
            res.status(404).json({ message: 'Hub not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a hub
// @route   DELETE /api/hubs/:id
// @access  Private/Admin
const deleteHub = async (req, res) => {
    try {
        const hub = await Hub.findByIdAndDelete(req.params.id);

        if (hub) {
            res.json({ message: 'Hub removed' });
        } else {
            res.status(404).json({ message: 'Hub not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getHubs,
    createHub,
    updateHub,
    deleteHub,
};
