const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const { handleUpload } = require('../middleware/uploadMiddleware');
const validateRequest = require('../middleware/validateRequest');
const sanitizeRequest = require('../middleware/sanitizeRequest');
const { createProductValidator, updateProductValidator } = require('../middleware/validators/productValidators');

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

// sanitizeRequest runs again here (it's already mounted globally in
// server.js) because multer only populates req.body for multipart
// requests once handleUpload runs — the global pass, mounted before
// routing, has nothing to sanitize yet for these two routes specifically.
router.post(
  '/',
  protect,
  adminOnly,
  handleUpload('images', 6),
  sanitizeRequest,
  createProductValidator,
  validateRequest,
  createProduct
);
router.put(
  '/:id',
  protect,
  adminOnly,
  handleUpload('images', 6),
  sanitizeRequest,
  updateProductValidator,
  validateRequest,
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
