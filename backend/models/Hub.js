const mongoose = require('mongoose');

const hubSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    description: { type: String },
}, { timestamps: true });

const Hub = mongoose.model('Hub', hubSchema);

module.exports = Hub;
