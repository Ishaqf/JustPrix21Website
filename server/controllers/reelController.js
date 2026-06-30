const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Reel = require('../models/Reel');
const Product = require('../models/Product');

const WRITABLE_FIELDS = ['instagramUrl', 'title', 'badge', 'products', 'order', 'isActive'];
const POPULATE_FIELDS = 'name slug price salePrice images stock';

// Treats a malformed id the same as a missing one — both are "invalid" from
// the caller's perspective, and this avoids a raw CastError leaking out of
// the $in query below for anything that isn't ObjectId-shaped.
const findInvalidProductIds = async (ids) => {
  const malformed = ids.filter((id) => !mongoose.isValidObjectId(id));
  const wellFormed = ids.filter((id) => mongoose.isValidObjectId(id));

  const existing = await Product.find({ _id: mongoose.trusted({ $in: wellFormed }) }, '_id');
  const existingSet = new Set(existing.map((p) => p._id.toString()));
  const missing = wellFormed.filter((id) => !existingSet.has(id));

  return [...malformed, ...missing];
};

// @desc    List active reels, ordered for the home page strip
// @route   GET /api/reels
// @access  Public
const getReels = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const filter = isAdmin ? {} : { isActive: true };
  const reels = await Reel.find(filter)
    .sort({ order: 1 })
    .populate('products', POPULATE_FIELDS);

  res.status(200).json({ success: true, message: 'Affaires récupérées', data: reels });
});

// @desc    Get a single reel
// @route   GET /api/reels/:id
// @access  Public
const getReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id).populate('products', POPULATE_FIELDS);

  if (!reel || !reel.isActive) {
    res.status(404);
    throw new Error('Affaire introuvable');
  }

  res.status(200).json({ success: true, message: 'Affaire récupérée', data: reel });
});

// @desc    Create a reel
// @route   POST /api/reels
// @access  Private/Admin
const createReel = asyncHandler(async (req, res) => {
  const payload = {};
  WRITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) payload[field] = req.body[field];
  });

  if (Array.isArray(payload.products)) {
    const invalidIds = await findInvalidProductIds(payload.products);
    if (invalidIds.length > 0) {
      res.status(404);
      throw new Error(`Produit(s) introuvable(s) : ${invalidIds.join(', ')}`);
    }
  }

  const reel = await Reel.create(payload);

  res.status(201).json({ success: true, message: 'Affaire créée avec succès', data: reel });
});

// @desc    Update a reel
// @route   PUT /api/reels/:id
// @access  Private/Admin
const updateReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    res.status(404);
    throw new Error('Affaire introuvable');
  }

  if (req.body.products !== undefined) {
    if (!Array.isArray(req.body.products)) {
      res.status(400);
      throw new Error('"products" doit être un tableau d\'identifiants de produits');
    }
    const invalidIds = await findInvalidProductIds(req.body.products);
    if (invalidIds.length > 0) {
      res.status(404);
      throw new Error(`Produit(s) introuvable(s) : ${invalidIds.join(', ')}`);
    }
  }

  WRITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) reel[field] = req.body[field];
  });

  const updatedReel = await reel.save();

  res.status(200).json({ success: true, message: 'Affaire mise à jour', data: updatedReel });
});

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private/Admin
const deleteReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    res.status(404);
    throw new Error('Affaire introuvable');
  }

  await reel.deleteOne();

  res.status(200).json({ success: true, message: 'Affaire supprimée', data: { _id: reel._id } });
});

module.exports = { getReels, getReel, createReel, updateReel, deleteReel };
