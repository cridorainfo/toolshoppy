/**
 * ToolShoppy — Cloudflare Worker serving /api/rates and /api/fuel.
 * Deployed as a Worker Route (toolshoppy.com/api/*) sitting in front of the Railway
 * origin — everything else continues to hit Railway unchanged. Runs server-side, so
 * none of the upstream sources here are subject to browser CORS restrictions the way
 * assets/js/rates.js's client-side fallback and the old functions/api/*.js (which
 * never actually ran anywhere) were.
 *
 * Response shapes match exactly what assets/js/rates.js and assets/js/fuel.js already
 * expect from /api/rates and /api/fuel — no front-end changes needed once this is live.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const GR_HEADERS = { 'User-Agent': UA, Accept: '*/*', 'Accept-Language': 'en-IN,en;q=0.9' };
const GR_AJAX_HEADERS = { ...GR_HEADERS, 'X-Requested-With': 'XMLHttpRequest', 'X-OIGT-Header': 'GITPL' };
const TROY_OZ_GRAMS = 31.1034768;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300',
  'Access-Control-Allow-Origin': '*',
};

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: JSON_HEADERS });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseInr(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.replace(/[₹₹]/g, '').match(/[\d,]+(?:\.\d+)?/);
  if (!m) return null;
  const v = parseFloat(m[0].replace(/,/g, ''));
  return v > 0 && v < 500000 ? Math.round(v * 100) / 100 : null;
}

async function fetchAjaxJson(url, referer) {
  const res = await fetch(url, { headers: { ...GR_AJAX_HEADERS, Referer: referer }, cf: { cacheTtl: 300 } });
  if (!res.ok) return null;
  const text = (await res.text()).trim();
  if (!text || text.charAt(0) === '<') return null; // got the HTML page back, not JSON — endpoint didn't recognize the request
  try { return JSON.parse(text); } catch { return null; }
}

// --- Gold / Silver (Goodreturns AJAX endpoint — confirmed working server-side for gold) ---

async function fetchGoodreturnsGold(region, day) {
  const slug = region === 'india' ? 'india' : 'kerala';
  const base = `https://www.goodreturns.in/gold-rates/${slug}.html`;
  const url = `${base}?gr_db_dynamic_content=metal_past_price&date=${day}`;
  const data = await fetchAjaxJson(url, base);
  if (!data) return null;
  const k24 = parseInr(data.gold_price_24K);
  const k22 = parseInr(data.gold_price_22K);
  const k18 = parseInr(data.gold_price_18K);
  if (!k22 && !k24) return null;
  const g24 = k24 || (k22 ? Math.round((k22 / 0.916) * 100) / 100 : null);
  const g22 = k22 || (g24 ? Math.round(g24 * 0.916 * 100) / 100 : null);
  const g18 = k18 || (g24 ? Math.round(g24 * 0.75 * 100) / 100 : null);
  return {
    per_gram: { '24k': g24, '22k': g22, '18k': g18 },
    per_10g: { '24k': g24 ? Math.round(g24 * 10) : null, '22k': g22 ? Math.round(g22 * 10) : null },
    per_sovereign_8g: { '22k': g22 ? Math.round(g22 * 8) : null },
  };
}

async function fetchDahabPulse() {
  const res = await fetch('https://dahabpulse.com/api/widget-prices', { cf: { cacheTtl: 300 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchSilverUsd() {
  const res = await fetch('https://api.gold-api.com/price/XAG', { cf: { cacheTtl: 300 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.price ? data.price : null;
}

async function fetchForexInrPerUsd() {
  const res = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=INR', { cf: { cacheTtl: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.rates && data.rates.INR ? data.rates.INR : null;
}

function buildUaeGold(dahab) {
  const usd = dahab.perGramUsd;
  const fx = dahab.currencies;
  const mul = (k) => Math.round(usd[k] * fx.AED * 100) / 100;
  const g24 = mul('24k');
  const g22 = mul('22k');
  const g18 = mul('18k');
  const tola = 11.6638;
  return {
    label: 'UAE (Dubai)',
    currency: 'AED',
    per_gram: { '24k': g24, '22k': g22, '18k': g18 },
    per_10g: { '24k': Math.round(g24 * 10), '22k': Math.round(g22 * 10) },
    per_tola_11_664g: { '24k': Math.round(g24 * tola), '22k': Math.round(g22 * tola) },
  };
}

function buildUaeSilver(xagUsd, aedPerUsd) {
  const usdPerGram = xagUsd / TROY_OZ_GRAMS;
  const perGram = Math.round(usdPerGram * aedPerUsd * 100) / 100;
  return {
    label: 'UAE (Dubai)',
    currency: 'AED',
    per_gram: perGram,
    per_10g: Math.round(perGram * 10 * 100) / 100,
    per_kg: Math.round(perGram * 1000),
  };
}

function buildCurrencyTable(dahab, inrPerUsd) {
  const fx = dahab.currencies;
  const inrPerUnit = { INR: 1 };
  Object.keys(fx).forEach((code) => {
    if (code === 'USD') {
      inrPerUnit.USD = Math.round(inrPerUsd * 100) / 100;
    } else if (code !== 'EGP') {
      inrPerUnit[code] = Math.round((inrPerUsd / fx[code]) * 100) / 100;
    }
  });
  if (!inrPerUnit.USD) inrPerUnit.USD = Math.round(inrPerUsd * 100) / 100;
  return {
    updated_at: new Date().toISOString(),
    inr_per_unit: inrPerUnit,
    symbols: {
      INR: '₹', AED: 'AED', SAR: 'SAR', USD: '$', KWD: 'KWD', OMR: 'OMR',
      EUR: '€', GBP: '£', QAR: 'QAR', BHD: 'BHD',
    },
    names: {
      INR: 'Indian Rupee', AED: 'UAE Dirham', SAR: 'Saudi Riyal', USD: 'US Dollar',
      KWD: 'Kuwaiti Dinar', OMR: 'Omani Rial', EUR: 'Euro', GBP: 'British Pound',
      QAR: 'Qatari Riyal', BHD: 'Bahraini Dinar',
    },
  };
}

async function handleRates() {
  const day = todayIso();
  const [dahab, keralaGold, indiaGold, xagUsd, inrPerUsd] = await Promise.all([
    fetchDahabPulse(),
    fetchGoodreturnsGold('kerala', day),
    fetchGoodreturnsGold('india', day),
    fetchSilverUsd(),
    fetchForexInrPerUsd(),
  ]);

  if (!dahab || !dahab.perGramUsd) {
    return json({ error: 'Upstream gold feed unavailable' }, 502);
  }

  const usdPerInr = inrPerUsd || 86;
  const goldIndia = indiaGold || keralaGold;

  // Silver: gold-api.com international spot × live USD/INR. Goodreturns' silver page
  // doesn't expose a clean live per-gram rate the way gold does (its AJAX endpoint
  // returns the full HTML page, and the visible page value looks like a jewelry
  // calculator default including making charges/GST, not a raw rate) — spot-based is
  // the more trustworthy number here, same tradeoff the site already made previously.
  const silverData = xagUsd ? {
    per_gram: Math.round((xagUsd / TROY_OZ_GRAMS) * usdPerInr),
    per_10g: Math.round((xagUsd / TROY_OZ_GRAMS) * usdPerInr * 10),
    per_kg: Math.round((xagUsd / TROY_OZ_GRAMS) * usdPerInr * 1000),
  } : null;

  const sources = ['DahabPulse (UAE spot)'];
  if (keralaGold) sources.push('Goodreturns (Kerala gold)');
  if (xagUsd) sources.push('gold-api.com (silver spot)');
  if (inrPerUsd) sources.push('Frankfurter (USD/INR)');

  return json({
    updated_at: dahab.updatedAt || new Date().toISOString(),
    source_note: 'Live · ' + sources.join(' + '),
    live: true,
    gold: {
      kerala: keralaGold ? { label: 'Kerala', currency: 'INR', label_note: 'Goodreturns', ...keralaGold } : null,
      india: goldIndia ? { label: 'India', currency: 'INR', ...goldIndia } : null,
      uae: buildUaeGold(dahab),
    },
    silver: {
      kerala: silverData ? { label: 'Kerala', currency: 'INR', ...silverData } : null,
      india: silverData ? { label: 'India', currency: 'INR', ...silverData } : null,
      uae: xagUsd ? buildUaeSilver(xagUsd, dahab.currencies.AED) : null,
    },
    history: null,
    currency: buildCurrencyTable(dahab, usdPerInr),
  });
}

// --- Fuel (Goodreturns per-state pages — the -s{id} suffix is required; the plain
// slug URL silently canonicalizes to the generic national page and returns identical
// stale placeholder data for every state, confirmed by direct testing 2026-07-19) ---

const FUEL_STATES = {
  kerala: { label: 'Kerala', id: 18 },
  'tamil-nadu': { label: 'Tamil Nadu', id: 30 },
  karnataka: { label: 'Karnataka', id: 17 },
  maharashtra: { label: 'Maharashtra', id: 20 },
  delhi: { label: 'Delhi', id: 10 },
  gujarat: { label: 'Gujarat', id: 12 },
  'andhra-pradesh': { label: 'Andhra Pradesh', id: 2 },
  telangana: { label: 'Telangana', id: 31 },
  'uttar-pradesh': { label: 'Uttar Pradesh', id: 33 },
  'west-bengal': { label: 'West Bengal', id: 35 },
  rajasthan: { label: 'Rajasthan', id: 28 },
  punjab: { label: 'Punjab', id: 27 },
  haryana: { label: 'Haryana', id: 13 },
};

async function fetchFuelPrice(kind, slug, id) {
  const url = `https://www.goodreturns.in/${kind}-price-in-${slug}-s${id}.html`;
  const res = await fetch(url, { headers: GR_HEADERS, cf: { cacheTtl: 3600 } });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/var fuelPrice = parseFloat\("([\d.]+)"/);
  return m ? parseFloat(m[1]) : null;
}

async function fetchStateFuel(key, meta) {
  const [petrol, diesel] = await Promise.all([
    fetchFuelPrice('petrol', key, meta.id),
    fetchFuelPrice('diesel', key, meta.id),
  ]);
  if (petrol == null && diesel == null) return null;
  return { key, label: meta.label, petrol, diesel };
}

async function handleFuel(stateKey) {
  const today = new Date().toISOString();

  if (stateKey && FUEL_STATES[stateKey]) {
    const row = await fetchStateFuel(stateKey, FUEL_STATES[stateKey]);
    if (!row) return json({ error: 'Fuel data unavailable', state: stateKey }, 502);
    return json({
      updated_at: today,
      live: true,
      source_note: 'Goodreturns',
      state: { key: row.key, label: row.label, petrol: row.petrol, diesel: row.diesel },
    });
  }

  const entries = await Promise.all(
    Object.entries(FUEL_STATES).map(([key, meta]) => fetchStateFuel(key, meta))
  );
  const states = {};
  entries.forEach((row) => {
    if (row) states[row.key] = { label: row.label, petrol: row.petrol, diesel: row.diesel };
  });

  if (!Object.keys(states).length) return json({ error: 'Fuel feeds unavailable' }, 502);

  return json({
    updated_at: today,
    live: true,
    source_note: 'Goodreturns',
    states,
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/rates') return await handleRates();
      if (url.pathname === '/api/fuel') return await handleFuel(url.searchParams.get('state'));
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json({ error: err.message || 'Request failed' }, 500);
    }
  },
};
