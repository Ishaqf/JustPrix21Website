const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    title:   { type: String, required: true, trim: true, maxlength: 100 },
    body:    { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

ReviewSchema.statics.recalcRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', numReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: stats[0].numReviews,
      rating: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, { numReviews: 0, rating: 0 });
  }
};

ReviewSchema.post('save', function () { this.constructor.recalcRating(this.product); });
ReviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.recalcRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);