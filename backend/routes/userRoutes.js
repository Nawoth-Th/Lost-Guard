const express = require('express');
const { 
    registerUser, 
    authUser, 
    getUserProfile, 
    updateUserProfile,
    getLeaderboard,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers);

router.post('/login', authUser);
router.get('/leaderboard', getLeaderboard);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

module.exports = router;
