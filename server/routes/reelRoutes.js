const express = require('express');
const router = express.Router();
const { getReels, getReel, createReel, updateReel, deleteReel, uploadThumbnail } = require('../controllers/reelController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const { handleUpload } = require('../middleware/uploadMiddleware');
const sanitizeRequest = require('../middleware/sanitizeRequest');
const validateRequest = require('../middleware/validateRequest');
const { createReelValidator, updateReelValidator } = require('../middleware/validators/reelValidators');

router.get('/', optionalAuth, getReels);
router.get('/:id', getReel);
// Must come before /:id so Express doesn't treat "upload-thumbnail" as an id param
router.post('/upload-thumbnail', protect, adminOnly, handleUpload('thumbnail', 1), sanitizeRequest, uploadThumbnail);
router.post('/', protect, adminOnly, createReelValidator, validateRequest, createReel);
router.put('/:id', protect, adminOnly, updateReelValidator, validateRequest, updateReel);
router.delete('/:id', protect, adminOnly, deleteReel);

module.exports = router;
