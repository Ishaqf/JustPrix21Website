const express = require('express');
const router = express.Router();
const { getReels, getReel, createReel, updateReel, deleteReel } = require('../controllers/reelController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createReelValidator, updateReelValidator } = require('../middleware/validators/reelValidators');

router.get('/', optionalAuth, getReels);
router.get('/:id', getReel);
router.post('/', protect, adminOnly, createReelValidator, validateRequest, createReel);
router.put('/:id', protect, adminOnly, updateReelValidator, validateRequest, updateReel);
router.delete('/:id', protect, adminOnly, deleteReel);

module.exports = router;
