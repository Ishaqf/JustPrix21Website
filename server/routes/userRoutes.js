const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Always scoped to req.user._id (set by `protect`) — never accept a userId
// from params/body, so a user can only ever touch their own wishlist.
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);
router.delete('/wishlist', protect, clearWishlist);

module.exports = router;
