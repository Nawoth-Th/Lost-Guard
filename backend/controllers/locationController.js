const Location = require('../models/Location');

// @desc    Fetch all locations
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
    try {
        const locations = await Location.find({}).sort({ block: 1, name: 1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a location
// @route   POST /api/locations
// @access  Private/Admin
const createLocation = async (req, res) => {
    try {
        const { name, block, category } = req.body;
        const locationExists = await Location.findOne({ name });

        if (locationExists) {
            return res.status(400).json({ message: 'Location already exists' });
        }

        const location = await Location.create({ name, block, category });
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a location
// @route   PUT /api/locations/:id
// @access  Private/Admin
const updateLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);

        if (location) {
            location.name = req.body.name || location.name;
            location.block = req.body.block || location.block;
            location.category = req.body.category || location.category;

            const updatedLocation = await location.save();
            res.json(updatedLocation);
        } else {
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);

        if (location) {
            res.json({ message: 'Location removed' });
        } else {
            res.status(404).json({ message: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
};
