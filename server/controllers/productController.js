const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { uploadImage, deleteImage, getPublicIdFromUrl } = require('../utils/cloudinary');

const WRITABLE_FIELDS = [
  'name', 'description', 'category', 'brand', 'price', 'salePrice', 'sku',
  'stock', 'condition', 'warrantyMonths', 'variants', 'specs', 'tags',
  'isFeatured', 'isActive',
];

const JSON_FIELDS = ['variants', 'specs', 'tags'];

const MAX_SPEC_KEYS = 30;
const MAX_SPEC_KEY_LENGTH = 100;
const MAX_SPEC_VALUE_LENGTH = 500;

const parseJSONField = (res, raw, fieldName) => {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    res.status(400);
    throw new Error(`Le champ "${fieldName}" doit être un JSON valide`);
  }
};

const sanitizeSpecs = (rawSpecs) => {
  if (!rawSpecs || typeof rawSpecs !== 'object' || Array.isArray(rawSpecs)) return {};

  const sanitized = {};
  Object.keys(rawSpecs)
    .slice(0, MAX_SPEC_KEYS)
    .forEach((key) => {
      const value = rawSpecs[key];
      if (value !== null && typeof value === 'object') return; // no nested objects/arrays

      const safeKey = String(key).slice(0, MAX_SPEC_KEY_LENGTH);
      const safeValue =
        typeof value === 'number' || typeof value === 'boolean'
          ? value
          : String(value).slice(0, MAX_SPEC_VALUE_LENGTH);

      sanitized[safeKey] = safeValue;
    });

  return sanitized;
};

// Shared by create + update: copies only whitelisted fields onto `target`
// (a plain object for create, a Mongoose document for update), parsing the
// 3 fields multer hands us as JSON strings and sanitizing specs.
const applyWritableFields = (res, target, body) => {
  WRITABLE_FIELDS.forEach((field) => {
    if (body[field] === undefined) return;

    if (JSON_FIELDS.includes(field)) {
      const parsed = parseJSONField(res, body[field], field);
      target[field] = field === 'specs' ? sanitizeSpecs(parsed) : parsed;
    } else {
      target[field] = body[field];
    }
  });
};

// @desc    List products — filter, search, sort, paginate
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, brand, minPrice, maxPrice, isFeatured, sort, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (isFeatured !== undefined) filter.isFeatured = String(isFeatured) === 'true';

  // sanitizeFilter wraps any non-$eq operator (e.g. our own $gte/$lte) in an
  // extra { $eq: ... } unless marked trusted — but only after Number()
  // collapses anything non-numeric (including an injected object) to NaN,
  // so trust is granted to an already-sanitized primitive, never raw input.
  const minPriceNum = minPrice !== undefined ? Number(minPrice) : NaN;
  const maxPriceNum = maxPrice !== undefined ? Number(maxPrice) : NaN;
  if (Number.isFinite(minPriceNum) || Number.isFinite(maxPriceNum)) {
    const priceFilter = {};
    if (Number.isFinite(minPriceNum)) priceFilter.$gte = minPriceNum;
    if (Number.isFinite(maxPriceNum)) priceFilter.$lte = maxPriceNum;
    filter.price = mongoose.trusted(priceFilter);
  }
  // mongoose.set('sanitizeFilter', true) blocks $text by default (it's on
  // the same denylist as $where/$expr) since it can't tell a dev-constructed
  // operator from an injected one. mongoose.trusted() marks just this
  // fragment safe; String(search) keeps it that way even if a client sends
  // search as an object/array instead of a string.
  if (search) filter.$text = mongoose.trusted({ $search: String(search) });

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Produits récupérés',
    data: {
      products,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      page: pageNum,
    },
  });
});

// @desc    Get a single product by Mongo _id or slug
// @route   GET /api/products/:id
// @access  Public (inactive products are visible to admins only)
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product = mongoose.isValidObjectId(id) ? await Product.findById(id) : null;
  if (!product) {
    product = await Product.findOne({ slug: id });
  }

  const isAdmin = req.user?.role === 'admin';
  if (!product || (!product.isActive && !isAdmin)) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  res.status(200).json({ success: true, message: 'Produit récupéré', data: product });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const payload = {};
  applyWritableFields(res, payload, req.body);

  const files = req.files || [];
  if (files.length) {
    const uploads = await Promise.all(
      files.map((file) => uploadImage(file.buffer, 'justprix21/products'))
    );
    payload.images = uploads.map((u) => u.url);
  }

  const product = await Product.create(payload);

  res.status(201).json({ success: true, message: 'Produit créé avec succès', data: product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  applyWritableFields(res, product, req.body);
  if (req.body.specs !== undefined) {
    product.markModified('specs');
  }

  // Admin-selected URLs to remove (separate from uploading new images,
  // which always appends — see BUILD_PLAN Step 4).
  if (req.body.removeImages !== undefined) {
    const removeList = parseJSONField(res, req.body.removeImages, 'removeImages') || [];

    await Promise.all(
      removeList.map(async (url) => {
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) return;
        try {
          await deleteImage(publicId);
        } catch (err) {
          console.error(`Échec suppression Cloudinary (${publicId}):`, err.message);
        }
      })
    );

    product.images = product.images.filter((url) => !removeList.includes(url));
  }

  const files = req.files || [];
  if (files.length) {
    const uploads = await Promise.all(
      files.map((file) => uploadImage(file.buffer, 'justprix21/products'))
    );
    product.images.push(...uploads.map((u) => u.url));
  }

  const updatedProduct = await product.save();

  res.status(200).json({ success: true, message: 'Produit mis à jour', data: updatedProduct });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Produit introuvable');
  }

  await Promise.all(
    product.images.map(async (url) => {
      const publicId = getPublicIdFromUrl(url);
      if (!publicId) return;
      try {
        await deleteImage(publicId);
      } catch (err) {
        console.error(`Échec suppression Cloudinary (${publicId}):`, err.message);
      }
    })
  );

  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Produit supprimé', data: { _id: product._id } });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
