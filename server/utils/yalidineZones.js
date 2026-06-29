// Hardcoded Yalidine-style delivery zones (Step 11) — the only price
// source until real YALIDINE_API_ID/API_TOKEN credentials exist, and the
// fallback after that. Any wilaya not listed below defaults to zone 2
// ("most northern wilayas"), per BUILD_PLAN.md.
const ZONES = {
  0: ['Alger'],
  1: ['Blida', 'Boumerdès', 'Tipaza'],
  3: ['Biskra', 'Djelfa', 'El Oued', 'Ghardaïa', 'Laghouat', 'Ouargla', 'Tébessa'],
  4: ['Adrar', 'Béchar', 'El Bayadh', 'Naâma'],
  5: ['Illizi', 'Tindouf', 'Tamanrasset'],
};

const HOME_RATES = { 0: 350, 1: 450, 2: 600, 3: 750, 4: 950, 5: 1200 };
const STOPDESK_DISCOUNT = 100;

const getZone = (wilaya) => {
  for (const [zone, wilayas] of Object.entries(ZONES)) {
    if (wilayas.includes(wilaya)) return Number(zone);
  }
  return 2;
};

// Pure and synchronous on purpose — this is the guaranteed-to-succeed
// fallback, so it must never throw regardless of what `wilaya` is.
const getDeliveryRate = (wilaya, isStopDesk) => {
  const zone = getZone(wilaya);
  const base = HOME_RATES[zone];
  const price = isStopDesk ? base - STOPDESK_DISCOUNT : base;
  return { zone, price };
};

module.exports = { getDeliveryRate, getZone };
