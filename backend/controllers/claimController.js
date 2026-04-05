const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const { sendEmail, templates } = require('../utils/emailService');

// @desc    Submit a claim for an item
// @route   POST /api/claims
// @access  Private
const submitClaim = async (req, res) => {
    const { itemId, message, proofImage, verificationAnswer } = req.body;

    try {
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Blind Question Verification: If the item has a prompt, check the answer
        if (item.verificationQuestion && item.verificationAnswer) {
            if (!verificationAnswer) {
                return res.status(400).json({ message: 'Verification answer is required for this item' });
            }
            
            // Case-insensitive check
            if (verificationAnswer.trim().toLowerCase() !== item.verificationAnswer.trim().toLowerCase()) {
                return res.status(401).json({ message: 'Incorrect verification answer. Ownership could not be proven.' });
            }
        }

        // Check if user already claimed this item
        const existingClaim = await Claim.findOne({ item: itemId, requester: req.user._id });
        if (existingClaim) {
            return res.status(400).json({ message: 'You have already submitted a claim for this item' });
        }

        const claim = new Claim({
            item: itemId,
            requester: req.user._id,
            message,
            proofImage,
        });

        const createdClaim = await claim.save();

        // Notify the item finder (reporter)
        const finder = await User.findById(item.user);
        if (finder) {
            sendEmail({
                email: finder.email,
                subject: `New Claim for "${item.title}" 🔍`,
                message: templates.newClaim(item.title, req.user.name),
            }).catch(err => console.error('Claim email error:', err.message));
        }

        res.status(201).json(createdClaim);
    } catch (error) {
        console.error('Submit Claim Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get claims (User's own or ALL if Admin)
// @route   GET /api/claims
// @access  Private
const getClaims = async (req, res) => {
    try {
        const { type } = req.query; // 'received', 'sent', or 'all' (admin)

        let claims;
        if (type === 'all' && req.user.isAdmin) {
            // Global moderation view for admin
            claims = await Claim.find({})
                .populate('item', 'title category type location status')
                .populate('requester', 'name email');
        } else if (type === 'received') {
            // Find items owned by user
            const myItems = await Item.find({ user: req.user._id });
            const itemIds = myItems.map(item => item._id);
            
            // Find claims for those items
            claims = await Claim.find({ item: { $in: itemIds } })
                .populate('item', 'title type')
                .populate('requester', 'name email');
        } else {
            // Find claims made by user
            claims = await Claim.find({ requester: req.user._id })
                .populate('item', 'title category type location status');
        }

        res.json(claims);
    } catch (error) {
        console.error('Get Claims Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update claim status (Approve/Reject)
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const claim = await Claim.findById(req.params.id).populate('item');

        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }

        // Only the item owner or admin can update claim status
        if (claim.item.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'Not authorized to update this claim' });
        }

        claim.status = status;
        await claim.save();

        // If approved, optionally close the item
        if (status === 'Approved') {
            const item = await Item.findById(claim.item._id);
            item.status = 'Recovered';
            await item.save();
        }

        // Notify the claimant (requester)
        const claimant = await User.findById(claim.requester);
        if (claimant) {
            sendEmail({
                email: claimant.email,
                subject: `Claim Decision: ${status} for "${claim.item.title}"`,
                message: templates.claimUpdate(claim.item.title, status, req.body.remarks),
            }).catch(err => console.error('Claim update email error:', err.message));
        }

        res.json(claim);
    } catch (error) {
        console.error('Update Claim Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = { submitClaim, getClaims, updateClaimStatus };
