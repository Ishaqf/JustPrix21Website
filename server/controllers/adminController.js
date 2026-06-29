const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Fresh object each call (not a shared constant) — these run concurrently
// via Promise.all below, so each query gets its own filter instance rather
// than two queries racing over one mutable object.
const lowStockFilter = () => ({
  stock: mongoose.trusted({ $lte: 5, $gt: 0 }),
  isActive: true,
});

// @desc    Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const [orderStatsAgg, totalProducts, lowStockCount, totalUsers, recentOrders, lowStockProducts] =
    await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0] } },
          },
        },
      ]),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments(lowStockFilter()),
      User.countDocuments({ role: 'user' }),
      Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email'),
      Product.find(lowStockFilter()).limit(6),
    ]);

  const ordersByStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0]));
  let totalOrders = 0;
  let totalRevenue = 0;
  orderStatsAgg.forEach((row) => {
    ordersByStatus[row._id] = row.count;
    totalOrders += row.count;
    if (row._id === 'delivered') totalRevenue = row.revenue;
  });

  res.status(200).json({
    success: true,
    message: 'Statistiques récupérées',
    data: {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      ordersByStatus,
      recentOrders,
      lowStockCount,
      lowStockProducts,
    },
  });
});

module.exports = { getStats };
