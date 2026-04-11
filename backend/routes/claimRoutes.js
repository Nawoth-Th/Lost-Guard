const express = require('express');
const { submitClaim, getClaims, updateClaimStatus, getMyClaimStatus } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, submitClaim)
    .get(protect, getClaims);

router.route('/status/:itemId')
    .get(protect, getMyClaimStatus);

router.route('/:id')
    .put(protect, updateClaimStatus);

module.exports = router;
