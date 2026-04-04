const express = require('express');
const { 
    getItems, 
    getItemById, 
    createItem, 
    updateItemStatus, 
    deleteItem,
    getMatchingItems,
    getMyItems,
    getItemStatusLogs
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getItems)
    .post(protect, createItem);

router.route('/myitems')
    .get(protect, getMyItems);

router.route('/:id')
    .get(getItemById)
    .delete(protect, deleteItem);

router.route('/:id/status')
    .put(protect, updateItemStatus);

router.route('/:id/matches')
    .get(getMatchingItems);

router.route('/:id/logs')
    .get(protect, getItemStatusLogs);

module.exports = router;
