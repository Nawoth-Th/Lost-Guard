const Message = require('../models/Message');
const User = require('../models/User');
const Item = require('../models/Item');
const { sendEmail, templates } = require('../utils/emailService');

// @desc    Send a message (and store in DB)
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    const { chat, recipient, item, content } = req.body;

    if (!content || !chat || !recipient || !item) {
        return res.status(400).json({ message: 'Missing required message fields' });
    }

    try {
        const message = new Message({
            chat,
            sender: req.user._id,
            recipient,
            item,
            content,
        });

        const createdMessage = await message.save();

        // Notify recipient via email
        const [recipientUser, targetItem] = await Promise.all([
            User.findById(recipient),
            Item.findById(item)
        ]);

        if (recipientUser && targetItem) {
            sendEmail({
                email: recipientUser.email,
                subject: `New message for "${targetItem.title}" 💬`,
                message: templates.newMessage(req.user.name, targetItem.title),
            }).catch(err => console.error('Chat email error:', err.message));
        }

        res.status(201).json(createdMessage);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get messages for a specific room
// @route   GET /api/chat/:room
// @access  Private
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.room })
            .sort({ createdAt: 1 })
            .populate('sender', 'name')
            .populate('recipient', 'name')
            .populate('item', 'title');

        res.json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get list of conversations (Recent Chats)
// @route   GET /api/chat/inbox
// @access  Private
const getRecentChats = async (req, res) => {
    try {
        // Find most recent message for each unique 'chat' room where user is sender or recipient
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: req.user._id },
                        { recipient: req.user._id }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$chat",
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.sender",
                    foreignField: "_id",
                    as: "senderDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.recipient",
                    foreignField: "_id",
                    as: "recipientDetails"
                }
            },
            {
                $lookup: {
                    from: "items",
                    localField: "lastMessage.item",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error('Inbox Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { sendMessage, getMessages, getRecentChats };
