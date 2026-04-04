const express = require('express');
const { sendMessage, getMessages, getRecentChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, sendMessage);

router.route('/inbox')
    .get(protect, getRecentChats);

router.route('/:room')
    .get(protect, getMessages);

module.exports = router;
