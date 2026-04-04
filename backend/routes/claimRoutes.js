const express = require('express');
const { submitClaim, getClaims, updateClaimStatus } = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, submitClaim)
    .get(protect, getClaims);

router.route('/:id')
    .put(protect, updateClaimStatus);

module.exports = router;
