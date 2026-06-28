const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Add a review to a product
// @route   POST /api/products/:productId/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, body } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) {
    res.status(409);
    throw new Error('Vous avez déjà laissé un avis sur ce produit');
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    body,
  });

  res.status(201).json({ success: true, message: 'Avis ajouté avec succès', data: review });
});

// @desc    List reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments({ product: productId }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Avis récupérés',
    data: {
      reviews,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      page: pageNum,
    },
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (owner or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Avis introuvable');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error("Non autorisé à supprimer l'avis d'un autre utilisateur");
  }

  // Instance deleteOne (not Review.findByIdAndDelete) — the rating-recalc
  // hook on the model is registered with { document: true, query: false },
  // so it only fires for this form, not the query-level shortcut.
  await review.deleteOne();

  res.status(200).json({ success: true, message: 'Avis supprimé', data: { _id: review._id } });
});

module.exports = { addReview, getReviews, deleteReview };
