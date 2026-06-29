// Thin wrapper around Yalidine's real delivery-fee API — only attempted
// when both credentials env vars are set. The `yalidine` npm package is an
// unofficial third-party SDK with very low adoption, so this calls the API
// directly with Node's built-in fetch instead of adding that dependency;
// the call path either way is "try, catch, fall back to yalidineZones.js"
// (see deliveryRate.js), so nothing is lost by skipping the package.
const YALIDINE_BASE_URL = 'https://api.yalidine.app/v1';

const hasCredentials = () =>
  Boolean(process.env.YALIDINE_API_ID && process.env.YALIDINE_API_TOKEN);

// Best-effort — deliveryRate.js catches any failure here (network error,
// non-200, unexpected shape) and falls back to the hardcoded zone table.
const fetchRealRate = async (wilaya, isStopDesk) => {
  const res = await fetch(`${YALIDINE_BASE_URL}/fees/?to_wilaya_name=${encodeURIComponent(wilaya)}`, {
    headers: {
      'X-API-ID': process.env.YALIDINE_API_ID,
      'X-API-TOKEN': process.env.YALIDINE_API_TOKEN,
    },
  });

  if (!res.ok) {
    throw new Error(`Yalidine API a répondu ${res.status}`);
  }

  const data = await res.json();
  const price = isStopDesk ? data.stopdesk : data.home;
  if (typeof price !== 'number') {
    throw new Error('Réponse Yalidine inattendue');
  }
  return price;
};

module.exports = { hasCredentials, fetchRealRate };
