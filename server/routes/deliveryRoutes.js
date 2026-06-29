const express = require('express');
const router = express.Router();
const { getDeliveryRate } = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');

// Mounted at /api/delivery — full path is /api/delivery/rate, matching
// the literal URL Step 19's own spec text uses (BUILD_PLAN.md), and what
// client/src/api/delivery.js (built in Step 15) already calls.
router.post('/rate', protect, getDeliveryRate);

module.exports = router;
