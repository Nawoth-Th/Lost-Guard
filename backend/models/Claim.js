const mongoose = require('mongoose');

const claimSchema = mongoose.Schema({
    item: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Item' 
    },
    requester: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    message: { 
        type: String, 
        required: true 
    },
    proofImage: { 
        type: String 
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
}, { timestamps: true });

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;
