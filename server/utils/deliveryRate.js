const { hasCredentials, fetchRealRate } = require('./yalidine');
const { getDeliveryRate } = require('./yalidineZones');

// Single source of truth for "what does delivery to this wilaya cost" —
// used both by the live-quote endpoint (deliveryController.getRate, so the
// customer sees a price while filling the Checkout form) and by
// orderController.createOrder (so the price actually charged is computed
// the exact same way server-side, never trusted from the client). Tries
// the real Yalidine API first; any failure (including blank credentials)
// falls back to the hardcoded zone table — this must never throw.
const resolveDeliveryRate = async (wilaya, isStopDesk) => {
  if (hasCredentials()) {
    try {
      const price = await fetchRealRate(wilaya, isStopDesk);
      return { price, source: 'api' };
    } catch (err) {
      console.error('Yalidine API a échoué, repli sur le tableau de zones :', err.message);
    }
  }

  const { price } = getDeliveryRate(wilaya, isStopDesk);
  return { price, source: 'fallback' };
};

module.exports = { resolveDeliveryRate };
