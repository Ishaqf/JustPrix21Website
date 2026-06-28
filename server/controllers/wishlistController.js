const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

const WISHLIST_FIELDS = 'name slug images price salePrice brand category stock rating numReviews';

const getPopulatedWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    match: { isActive: true },
    select: WISHLIST_FIELDS,
  });
  return user.wishlist;
};

// @desc    Get the logged-in user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getPopulatedWishlist(req.user._id);
  res.status(200).json({ success: true, message: 'Liste de souhaits récupérée', data: wishlist });
});

// @desc    Add a product to the wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: product._id } });

  const wishlist = await getPopulatedWishlist(req.user._id);
  res.status(200).json({ success: true, message: 'Produit ajouté à la liste de souhaits', data: wishlist });
});

// @desc    Remove a product from the wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });

  const wishlist = await getPopulatedWishlist(req.user._id);
  res.status(200).json({ success: true, message: 'Produit retiré de la liste de souhaits', data: wishlist });
});

// @desc    Clear the entire wishlist
// @route   DELETE /api/users/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $set: { wishlist: [] } });
  res.status(200).json({ success: true, message: 'Liste de souhaits vidée', data: [] });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };
