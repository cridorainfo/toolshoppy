// Cached /api/rates and /api/fuel endpoints for server.mjs. Upstream feeds are fetched in the
// background and kept warm, so visitors never wait on them; if a refresh fails the last good
// payload is served (up to MAX_STALE_MS) and the page's own fallback chain handles anything older.
import { buildRatesPayload } from './rates-api.mjs';
import { FUEL_STATES, fetchStateFuel } from './fuel-api.mjs';

const RATES_TTL_MS = 10 * 60 * 1000;
const FUEL_TTL_MS = 3 * 60 * 60 * 1000;
const MAX_STALE_MS = 24 * 60 * 60 * 1000;

const store = new Map();

// Fresh value: returned as is. Expired value: returned immediately while a refresh runs in the
// background (up to MAX_STALE_MS old). No usable value: wait for the single in-flight load.
function cached(key, ttl, loader) {
  const hit = store.get(key) || {};
  const age = hit.at ? Date.now() - hit.at : Infinity;
  if (age < ttl) return Promise.resolve(hit.value);
  let pending = hit.pending;
  if (!pending) {
    const entry = hit;
    pending = loader().then((value) => {
      store.set(key, { value, at: Date.now() });
      return value;
    }).catch((error) => {
      console.error(`${key} refresh failed:`, error.message);
      delete entry.pending;
      throw error;
    });
    pending.catch(() => {});
    entry.pending = pending;
    store.set(key, entry);
  }
  return age < MAX_STALE_MS ? Promise.resolve(hit.value) : pending;
}

const getRates = () => cached('rates', RATES_TTL_MS, buildRatesPayload);
const getState = (key) => cached('fuel:' + key, FUEL_TTL_MS, () => fetchStateFuel(key));

async function getFuel(stateKey) {
  const updated_at = new Date().toISOString();
  if (stateKey) {
    return { updated_at, live: true, source_note: 'Goodreturns', state: { key: stateKey, ...(await getState(stateKey)) } };
  }
  const states = {};
  await Promise.all(Object.keys(FUEL_STATES).map(async (key) => {
    try {
      const { label, petrol, diesel, date } = await getState(key);
      states[key] = { label, petrol, diesel, date };
    } catch { /* leave the state out; the page falls back to its cached copy */ }
  }));
  if (!Object.keys(states).length) throw new Error('Fuel feeds unavailable');
  return { updated_at, live: true, source_note: 'Goodreturns', states };
}

/** Handles /api/rates and /api/fuel. Resolves to { status, maxAge, body }, or null for other paths. */
export async function handleLiveApi(pathname, searchParams) {
  const isRates = pathname === '/api/rates';
  if (!isRates && pathname !== '/api/fuel') return null;
  const stateKey = isRates ? null : searchParams.get('state');
  if (stateKey && !FUEL_STATES[stateKey]) return { status: 404, maxAge: 0, body: { error: 'Unknown state' } };
  try {
    const body = isRates ? await getRates() : await getFuel(stateKey);
    return { status: 200, maxAge: isRates ? 300 : 1800, body };
  } catch (error) {
    console.error(`${pathname} failed:`, error.message);
    return { status: 502, maxAge: 0, body: { error: 'Upstream feed unavailable' } };
  }
}

/** Fills the caches at boot and keeps them fresh, without holding the process open. */
export function startLiveApiRefresh() {
  const refresh = () => {
    getRates().catch(() => {});
    getFuel().catch(() => {});
  };
  refresh();
  setInterval(refresh, 5 * 60 * 1000).unref();
}
