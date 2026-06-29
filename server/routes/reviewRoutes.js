const express = require('express');
const { addReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { addReviewValidator } = require('../middleware/validators/reviewValidators');

// Nested under /api/products/:productId/reviews — mergeParams so this
// router can read :productId from the parent mount path.
const nested = express.Router({ mergeParams: true });
nested.get('/', getReviews);
nested.post('/', protect, addReviewValidator, validateRequest, addReview);

// Standalone under /api/reviews — deletion isn't scoped to a product URL.
const standalone = express.Router();
standalone.delete('/:id', protect, deleteReview);

module.exports = { nested, standalone };
