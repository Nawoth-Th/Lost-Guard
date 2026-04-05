const express = require('express');
const router = express.Router();
const {
    createSubscription,
    getMySubscriptions,
    deleteSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSubscription)
    .get(protect, getMySubscriptions);

router.route('/:id')
    .delete(protect, deleteSubscription);

module.exports = router;
