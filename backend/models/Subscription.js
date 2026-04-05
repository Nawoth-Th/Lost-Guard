const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    category: { type: String, required: true }, // For matching by name
    locationBlock: { type: String, required: true }, // For matching by area
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
