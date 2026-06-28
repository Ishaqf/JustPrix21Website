const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendAdminOrderAlert } = require('../utils/email');

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Re-finds each item's product/variant and adds the quantity back. Variants
// are matched by {size, color} since that's all the order snapshot keeps
// (no live variant _id reference) — best-effort, fine for restocking.
const restockItems = async (order, session) => {
  for (const item of order.orderItems) {
    if (item.variant && (item.variant.size || item.variant.color)) {
      await Product.updateOne(
        {
          _id: item.product,
          variants: mongoose.trusted({
            $elemMatch: { size: item.variant.size, color: item.variant.color },
          }),
        },
        { $inc: { 'variants.$.stock': item.quantity } },
        { session }
      );
    } else {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
        { session }
      );
    }
  }
};

// @desc    Create an order (checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems: incomingItems, shippingAddress, deliveryType, paymentMethod, notes } = req.body;

  if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
    res.status(400);
    throw new Error('La commande doit contenir au moins un article');
  }

  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const rawItem of incomingItems) {
        const { productId, variantId } = rawItem;
        const quantity = Number(rawItem.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
          res.status(400);
          throw new Error('Quantité invalide');
        }

        const product = await Product.findById(productId).session(session);
        if (!product) {
          res.status(404);
          throw new Error(`Produit introuvable : ${productId}`);
        }

        let variant = null;
        if (variantId) {
          variant = product.variants.find((v) => v._id.toString() === String(variantId));
          if (!variant) {
            res.status(404);
            throw new Error(`Variante introuvable pour "${product.name}"`);
          }
          if (variant.stock < quantity) {
            res.status(400);
            throw new Error(
              `Stock insuffisant pour "${product.name}" (${[variant.size, variant.color].filter(Boolean).join(' / ')})`
            );
          }
        } else if (product.stock < quantity) {
          res.status(400);
          throw new Error(`Stock insuffisant pour "${product.name}"`);
        }

        const effectivePrice =
          product.salePrice !== null && product.salePrice < product.price
            ? product.salePrice
            : product.price;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '/no-image.png',
          price: effectivePrice,
          quantity,
          variant: variant ? { size: variant.size, color: variant.color } : undefined,
        });

        subtotal += effectivePrice * quantity;

        // Atomic + guarded: the $gte keeps stock decrement from racing
        // below zero even if two requests pass the soft check above at
        // the same time. mongoose.trusted() is required because
        // sanitizeFilter would otherwise mangle the $elemMatch/$gte
        // operators we're building here ourselves (see CLAUDE.md).
        const filter = variant
          ? {
              _id: product._id,
              variants: mongoose.trusted({
                $elemMatch: { _id: variant._id, stock: { $gte: quantity } },
              }),
            }
          : { _id: product._id, stock: mongoose.trusted({ $gte: quantity }) };
        const update = variant
          ? { $inc: { 'variants.$.stock': -quantity } }
          : { $inc: { stock: -quantity } };

        const result = await Product.updateOne(filter, update, { session });
        if (result.modifiedCount === 0) {
          res.status(400);
          throw new Error(`Stock insuffisant pour "${product.name}" (modifié entre-temps, réessayez)`);
        }
      }

      // Real shipping cost comes from the Yalidine-backed endpoint built in
      // Step 11; until checkout calls that, shippingPrice stays 0 here.
      const shippingPrice = 0;
      const taxPrice = 0;
      const totalPrice = subtotal + shippingPrice + taxPrice;

      const [created] = await Order.create(
        [
          {
            user: req.user._id,
            orderItems,
            shippingAddress,
            subtotal,
            shippingPrice,
            taxPrice,
            totalPrice,
            deliveryType: deliveryType || 'home',
            paymentMethod: paymentMethod || 'cash_on_delivery',
            notes,
          },
        ],
        { session }
      );

      order = created;
    });
  } finally {
    await session.endSession();
  }

  try {
    await sendOrderConfirmation(order, req.user);
  } catch (err) {
    console.error('Échec email confirmation commande:', err.message);
  }
  try {
    await sendAdminOrderAlert(order, req.user);
  } catch (err) {
    console.error('Échec email alerte admin commande:', err.message);
  }

  res.status(201).json({ success: true, message: 'Commande créée avec succès', data: order });
});

// @desc    Get the logged-in user's own orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  // sanitizeFilter mangles non-$eq operators regardless of source — even
  // this hardcoded, no-user-input $ne needs mongoose.trusted() (see
  // CLAUDE.md: it's not just req.query-derived filters that need this).
  const orders = await Order.find({
    user: req.user._id,
    hiddenByUser: mongoose.trusted({ $ne: true }),
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Commandes récupérées', data: orders });
});

// @desc    Get a single order
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Non autorisé à consulter cette commande');
  }

  res.status(200).json({ success: true, message: 'Commande récupérée', data: order });
});

// @desc    List + search all orders, with aggregated stats
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 25, search, startDate, endDate } = req.query;

  // Stats are computed over date+search only (not status), so the
  // per-status breakdown stays meaningful — locking status would make
  // e.g. deliveredCount trivially 0 whenever status=pending is applied.
  const baseFilter = {};

  const createdAtRange = {};
  if (startDate) {
    const d = new Date(startDate);
    if (!Number.isNaN(d.getTime())) createdAtRange.$gte = d;
  }
  if (endDate) {
    const d = new Date(endDate);
    if (!Number.isNaN(d.getTime())) createdAtRange.$lte = d;
  }
  if (Object.keys(createdAtRange).length) {
    baseFilter.createdAt = mongoose.trusted(createdAtRange);
  }

  // Built for the aggregate $match below, which never runs sanitizeFilter
  // (that only applies to Query, not Aggregate) — safe to embed $or here.
  let orConditions = null;
  if (search) {
    const safe = escapeRegExp(String(search));
    orConditions = mongoose.trusted([
      { 'shippingAddress.fullName': { $regex: safe, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: safe, $options: 'i' } },
      { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: `${safe}$`, options: 'i' } } },
    ]);
    baseFilter.$or = orConditions;
  }

  // listFilter deliberately omits $or: Query.prototype.merge() special-cases
  // $or/$and by rebuilding the array with .map(), which drops whatever
  // mongoose.trusted() marked — even per-element. Attaching it directly to
  // _conditions after find()/countDocuments() (below) is the only way that
  // survives through to sanitizeFilter. Confirmed by testing — see CLAUDE.md.
  const listFilter = { ...baseFilter };
  delete listFilter.$or;
  if (status) listFilter.status = status;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 25);

  const findQuery = Order.find(listFilter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
  const countQuery = Order.countDocuments(listFilter);
  if (orConditions) {
    findQuery._conditions.$or = orConditions;
    countQuery._conditions.$or = orConditions;
  }

  const [orders, total, statsAgg] = await Promise.all([
    findQuery,
    countQuery,
    Order.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalPriceSum: { $sum: '$totalPrice' },
        },
      },
    ]),
  ]);

  const raw = statsAgg[0] || {};
  const totalOrdersStat = raw.totalOrders || 0;
  const stats = {
    totalOrders: totalOrdersStat,
    totalRevenue: raw.totalRevenue || 0,
    pendingCount: raw.pendingCount || 0,
    deliveredCount: raw.deliveredCount || 0,
    cancelledCount: raw.cancelledCount || 0,
    avgOrderValue: totalOrdersStat > 0 ? Math.round((raw.totalPriceSum / totalOrdersStat) * 100) / 100 : 0,
  };

  res.status(200).json({
    success: true,
    message: 'Commandes récupérées',
    data: {
      orders,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
      page: pageNum,
      stats,
    },
  });
});

// @desc    Admin: transition an order's status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status: newStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    res.status(400);
    throw new Error(`Transition invalide : ${order.status} → ${newStatus}`);
  }

  if (newStatus === 'cancelled') {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await restockItems(order, session);
        order.status = 'cancelled';
        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }
  } else {
    order.status = newStatus;
    if (newStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
  }

  res.status(200).json({ success: true, message: 'Statut mis à jour', data: order });
});

// @desc    Customer: cancel their own pending order
// @route   PUT /api/orders/:id/cancel
// @access  Private (owner only — not admin)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé à annuler la commande d'un autre utilisateur");
  }

  if (order.status !== 'pending') {
    res.status(400);
    throw new Error('Seules les commandes en attente peuvent être annulées');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await restockItems(order, session);
      order.status = 'cancelled';
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({ success: true, message: 'Commande annulée', data: order });
});

// @desc    Customer: hide a cancelled order from their own list
// @route   PUT /api/orders/:id/hide
// @access  Private (owner only)
const hideOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé à modifier la commande d'un autre utilisateur");
  }

  if (order.status !== 'cancelled') {
    res.status(400);
    throw new Error('Seules les commandes annulées peuvent être masquées');
  }

  order.hiddenByUser = true;
  await order.save();

  res.status(200).json({ success: true, message: 'Commande masquée', data: order });
});

// @desc    Admin: permanently delete a cancelled order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  if (order.status !== 'cancelled') {
    res.status(400);
    throw new Error('Seules les commandes annulées peuvent être supprimées');
  }

  await order.deleteOne();

  res.status(200).json({ success: true, message: 'Commande supprimée', data: { _id: order._id } });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  hideOrder,
  deleteOrder,
};
