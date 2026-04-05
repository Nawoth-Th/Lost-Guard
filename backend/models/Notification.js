const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    read: { type: Boolean, required: true, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
