const mongoose = require('mongoose');

const statusLogSchema = mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Item' },
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    remarks: { type: String },
}, { timestamps: true });

const StatusLog = mongoose.model('StatusLog', statusLogSchema);

module.exports = StatusLog;
