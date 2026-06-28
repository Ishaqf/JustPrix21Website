const express = require('express');
const router = express.Router();
const { getReels, getReel, createReel, updateReel, deleteReel } = require('../controllers/reelController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getReels);
router.get('/:id', getReel);
router.post('/', protect, adminOnly, createReel);
router.put('/:id', protect, adminOnly, updateReel);
router.delete('/:id', protect, adminOnly, deleteReel);

module.exports = router;
