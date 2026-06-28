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

router.get('/', getProducts);
router.get('/:id', optionalAuth, getProduct);
router.post('/', protect, adminOnly, handleUpload('images', 6), createProduct);
router.put('/:id', protect, adminOnly, handleUpload('images', 6), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
