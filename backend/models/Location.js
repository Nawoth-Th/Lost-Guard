const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    block: { type: String, required: true }, // e.g. 'NAB', 'Computing', 'Engineering'
    category: { type: String, enum: ['Academic', 'Social', 'Facilities', 'Admin'], default: 'Academic' },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
