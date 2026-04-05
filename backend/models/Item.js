const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g. Electronics, Pets, Documents
    location: { type: String, required: true },
    locationBlock: { type: String, required: true }, // e.g. NAB, Computing
    isAtHub: { type: Boolean, required: true, default: false },
    hubName: { type: String }, // e.g. Security Gate 1
    verificationQuestion: { type: String },
    verificationAnswer: { type: String },
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, required: true, enum: ['Lost', 'Found'] },
    status: { type: String, required: true, enum: ['Pending', 'Recovered', 'Closed'], default: 'Pending' },
    image: { type: String }, // Path to image
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
