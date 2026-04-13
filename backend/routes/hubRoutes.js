const express = require('express');
const { 
    getHubs, 
    createHub, 
    updateHub, 
    deleteHub 
} = require('../controllers/hubController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getHubs)
    .post(protect, admin, createHub);

router.route('/:id')
    .put(protect, admin, updateHub)
    .delete(protect, admin, deleteHub);

module.exports = router;
