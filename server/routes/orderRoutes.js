const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  hideOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// /mine and / (collection routes) must come before /:id so they aren't
// swallowed by the param route.
router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/hide', protect, hideOrder);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
