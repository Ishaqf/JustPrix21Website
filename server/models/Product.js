const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      maxlength: 200,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
    },
    category: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      enum: ['phones', 'accessories', 'tvs', 'gaming', 'laptops', 'electronics'],
    },
    brand: {
      type: String,
      required: [true, 'La marque est obligatoire'],
      trim: true,
    },
    price:     { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null },
    sku:       { type: String, unique: true, sparse: true, trim: true },
    stock:     { type: Number, required: true, default: 0, min: 0 },
    condition: {
      type: String,
      enum: ['new', 'used', 'refurbished'],
      default: 'new',
    },
    warrantyMonths: { type: Number, default: 0 },
    images: [{ type: String }],
    variants: [
      {
        size:  { type: String, trim: true }, // storage/capacity, e.g. "256GB"
        color: { type: String, trim: true },
        stock: { type: Number, default: 0 },
        sku:   { type: String, trim: true },
      },
    ],
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    rating:     { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

ProductSchema.index({ category: 1, brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });

ProductSchema.virtual('effectivePrice').get(function () {
  return this.salePrice !== null && this.salePrice < this.price
    ? this.salePrice
    : this.price;
});

ProductSchema.virtual('thumbnail').get(function () {
  return this.images?.length ? this.images[0] : null;
});

ProductSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

module.exports = mongoose.model('Product', ProductSchema);