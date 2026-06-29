const asyncHandler = require('express-async-handler');
const { resolveDeliveryRate } = require('../utils/deliveryRate');

// @desc    Get a delivery price estimate for a wilaya
// @route   POST /api/delivery/rate
// @access  Private
const getDeliveryRateHandler = asyncHandler(async (req, res) => {
  const wilaya = String(req.body.wilaya || '');
  const isStopDesk = String(req.body.deliveryType) === 'stopdesk';

  const { price, source } = await resolveDeliveryRate(wilaya, isStopDesk);

  res.status(200).json({ success: true, message: 'Tarif de livraison estimé', data: { price, source } });
});

module.exports = { getDeliveryRate: getDeliveryRateHandler };
