const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema(
  {
    instagramUrl: {
      type: String,
      required: [true, "L'URL Instagram est obligatoire"],
      trim: true,
      match: [
        /^https:\/\/(www\.)?instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+\/?/,
        'URL Instagram invalide',
      ],
    },
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      maxlength: 150,
    },
    badge: {
      type: String,
      enum: ['Promo', 'Pack', 'Affaire du jour', 'Nouveauté'],
      default: 'Promo',
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReelSchema.path('products').validate(
  (val) => val.length >= 1 && val.length <= 10,
  'Une affaire doit contenir entre 1 et 10 produits.'
);

ReelSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Reel', ReelSchema);