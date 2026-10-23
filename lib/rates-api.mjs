// Live gold, silver & currency rates for GET /api/rates (served by server.mjs on Railway).
// Ported from the legacy Cloudflare Pages Function in functions/api/rates.js, which is not
// deployed any more. Upstream feeds: Goodreturns (retail gold/silver for Kerala and Mumbai, retail
// gold for Dubai), DahabPulse (international gold spot, used to sanity-check the Dubai retail rate and
// as a labelled fallback), gold-api.com (silver spot) and Frankfurter (USD/INR).
//
// Every region carries a `basis` ('retail' or 'spot') so consumers never mistake a spot conversion
// for a shop price. There is no silent substitution: if a retail source fails, the region is either
// missing or explicitly marked as spot.

const GR_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-IN,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
  'X-OIGT-Header': 'GITPL',
};

const TROY_OZ_GRAMS = 31.1034768;
const FETCH_TIMEOUT_MS = 10000;

function parseInr(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.replace(/[₹₹]/g, '').match(/[\d,]+(?:\.\d+)?/);
  if (!m) return null;
  const v = parseFloat(m[0].replace(/,/g, ''));
  return v > 0 && v < 500000 ? Math.round(v * 100) / 100 : null;
}

function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

function timedFetch(url, options) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

async function fetchJson(url, headers) {
  const res = await timedFetch(url, { headers });
  if (!res.ok) return null;
  const text = (await res.text()).trim();
  if (!text || text.startsWith('<')) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Each upstream call degrades to null so one failing feed never takes down the whole payload.
const safe = (promise) => promise.catch(() => null);

// Goodreturns publishes retail (shop) rates per city. "India" has no national page (the old
// /gold-rates/india.html is a 404 and silently fell back to Kerala), so India is the Mumbai bullion
// market, which is also what Goodreturns uses for its own national ticker.
const GR_CITY = { kerala: 'Kerala', india: 'Mumbai' };
const GR_SLUG = { kerala: 'kerala', india: 'mumbai' };

async function fetchGoodreturnsGold(region, day) {
  const base = `https://www.goodreturns.in/gold-rates/${GR_SLUG[region]}.html`;
  const url = `${base}?gr_db_dynamic_content=metal_past_price&date=${day}`;
  const data = await fetchJson(url, { ...GR_HEADERS, Referer: base });
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
    basis: 'retail',
    retail_source: `Goodreturns (${GR_CITY[region]})`,
    retail_date: data.current_date || null,
    basis_note: `Retail rate · Goodreturns (${GR_CITY[region]}) · indicative, excludes making charges, GST and other levies`,
  };
}

async function fetchGoodreturnsSilver(region, day) {
  const base = `https://www.goodreturns.in/silver-rates/${GR_SLUG[region]}.html`;
  const url = `${base}?gr_db_dynamic_content=metal_past_price&date=${day}`;
  const data = await fetchJson(url, { ...GR_HEADERS, Referer: base });
  if (!data) return null;
  let perGram = parseInr(data.silver_price_1G);
  if (!perGram) {
    const perKg = parseInr(data.silver_price_1KG);
    if (perKg) perGram = Math.round((perKg / 1000) * 100) / 100;
  }
  if (!perGram) return null;
  return {
    per_gram: perGram,
    per_10g: Math.round(perGram * 10),
    per_kg: Math.round(perGram * 1000),
    basis: 'retail',
    retail_source: `Goodreturns (${GR_CITY[region]})`,
    retail_date: data.current_date || null,
    basis_note: `Retail rate · Goodreturns (${GR_CITY[region]}) · indicative, excludes making charges and GST`,
  };
}

// Dubai retail gold (AED per gram) from the same Goodreturns feed. Values arrive as e.g.
// " د.إ 453.25"; parseAed keeps only the number.
function parseAed(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.match(/[\d,]+(?:\.\d+)?/);
  if (!m) return null;
  const v = parseFloat(m[0].replace(/,/g, ''));
  return v > 0 && v < 5000 ? Math.round(v * 100) / 100 : null;
}

async function fetchGoodreturnsDubaiGold(day) {
  const base = 'https://www.goodreturns.in/gold-rates/dubai.html';
  const url = `${base}?gr_db_dynamic_content=metal_past_price&date=${day}`;
  const data = await fetchJson(url, { ...GR_HEADERS, Referer: base });
  if (!data) return null;
  const g24 = parseAed(data.gold_price_24K);
  const g22 = parseAed(data.gold_price_22K);
  const g18 = parseAed(data.gold_price_18K);
  if (!g24 || !g22) return null;
  return { '24k': g24, '22k': g22, '18k': g18, date: data.current_date || null };
}

async function fetchDahabPulse() {
  const res = await timedFetch('https://dahabpulse.com/api/widget-prices');
  if (!res.ok) return null;
  return res.json();
}

// gold-api.com occasionally times out or rate-limits. One quick retry, then the last good spot
// price for up to 30 minutes (spot silver moves slowly enough for that, and UAE silver is
// labelled "spot" anyway); beyond that the region is omitted rather than shown stale.
const XAG_REUSE_MS = 30 * 60 * 1000;
let lastXag = null;

async function fetchSilverUsd() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await timedFetch('https://api.gold-api.com/price/XAG');
      if (res.ok) {
        const data = await res.json();
        if (data && data.price > 0) {
          lastXag = { price: data.price, at: Date.now() };
          return data.price;
        }
      }
    } catch { /* retry once, then fall through to the last good value */ }
  }
  return lastXag && Date.now() - lastXag.at < XAG_REUSE_MS ? lastXag.price : null;
}

async function fetchForex() {
  const res = await timedFetch('https://api.frankfurter.dev/v1/latest?from=USD&to=INR');
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.rates && data.rates.INR ? data.rates.INR : null;
}

const round2 = (n) => Math.round(n * 100) / 100;

// A Dubai retail quote is only accepted if it is plausible against international spot: shops charge
// a small premium over spot (about 2-6%), and 22K/18K keep a fixed ratio to 24K. A parse slip or a
// stale page fails these checks and the region is then served as explicit spot, never as "retail".
export function retailLooksSane(retail, spot) {
  if (!retail || !spot) return false;
  const premium = retail['24k'] / spot['24k'];
  const r22 = retail['22k'] / retail['24k'];
  const r18 = retail['18k'] ? retail['18k'] / retail['24k'] : null;
  return premium >= 0.99 && premium <= 1.10 && r22 >= 0.90 && r22 <= 0.95 && (r18 === null || (r18 >= 0.73 && r18 <= 0.78));
}

export function buildUaeGold(dahab, retail) {
  const usd = dahab.perGramUsd;
  const fx = dahab.currencies;
  const mul = (k) => round2(usd[k] * fx.AED);
  const spot = { '24k': mul('24k'), '22k': mul('22k'), '18k': mul('18k') };
  const tola = 11.6638;
  const useRetail = retailLooksSane(retail, spot);
  const g = useRetail ? { '24k': retail['24k'], '22k': retail['22k'], '18k': retail['18k'] || round2(retail['24k'] * 0.75) } : spot;
  const out = {
    label: 'UAE (Dubai)',
    currency: 'AED',
    per_gram: { '24k': g['24k'], '22k': g['22k'], '18k': g['18k'] },
    per_10g: { '24k': Math.round(g['24k'] * 10), '22k': Math.round(g['22k'] * 10) },
    per_tola_11_664g: { '24k': Math.round(g['24k'] * tola), '22k': Math.round(g['22k'] * tola) },
    spot_per_gram: spot,
  };
  if (useRetail) {
    out.basis = 'retail';
    out.retail_source = 'Goodreturns (Dubai)';
    out.retail_date = retail.date || null;
    out.premium_vs_spot_pct = round2((retail['24k'] / spot['24k'] - 1) * 100);
    out.basis_note = `Retail rate · Goodreturns (Dubai) · ${out.premium_vs_spot_pct}% above international spot (AED ${spot['24k']}/g 24K) · indicative, excludes making charges and VAT`;
  } else {
    out.basis = 'spot';
    out.basis_note = 'International spot price converted to AED. The Dubai retail rate is unavailable right now, so shop prices will be higher.';
  }
  return out;
}

// UAE silver: no verifiable retail source exists (Goodreturns has no UAE silver page and the quote
// sites are spot-based), so this is the international spot price in AED and is labelled as such.
export function buildUaeSilver(xagUsd, aedPerUsd) {
  const usdPerGram = xagUsd / TROY_OZ_GRAMS;
  const perGram = round2(usdPerGram * aedPerUsd);
  return {
    label: 'UAE (Dubai)',
    currency: 'AED',
    per_gram: perGram,
    per_10g: round2(perGram * 10),
    per_kg: Math.round(perGram * 1000),
    basis: 'spot',
    basis_note: 'International spot price converted to AED. Dubai shops add a premium and making charges, so retail is higher.',
  };
}

function buildCurrencyTable(dahab, inrPerUsd) {
  const fx = dahab.currencies;
  const inrPerUnit = { INR: 1 };
  Object.keys(fx).forEach((code) => {
    if (code === 'USD') {
      inrPerUnit.USD = Math.round(inrPerUsd * 100) / 100;
    } else if (code !== 'EGP') {
      inrPerUnit[code] = Math.round(inrPerUsd / fx[code] * 100) / 100;
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

// Past days never change, so the 14 upstream requests are made at most every few hours.
const HISTORY_TTL_MS = 6 * 60 * 60 * 1000;
let historyCache = null;

async function fetchHistory() {
  if (historyCache && Date.now() - historyCache.at < HISTORY_TTL_MS) return historyCache.value;
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(isoDay(new Date(Date.now() - i * 86400000)));
  const rows = await Promise.all(days.map((iso) => Promise.all([
    safe(fetchGoodreturnsGold('kerala', iso)),
    safe(fetchGoodreturnsSilver('kerala', iso)),
  ])));
  const value = {
    dates: days,
    gold_22k_inr: rows.map(([g]) => (g && g.per_gram['22k'] ? g.per_gram['22k'] : null)),
    silver_inr: rows.map(([, s]) => (s ? s.per_gram : null)),
  };
  if (value.gold_22k_inr.some(Boolean)) historyCache = { at: Date.now(), value };
  return value;
}

/** Builds the /api/rates payload. Throws when the core feeds are unavailable. */
export async function buildRatesPayload() {
  const day = isoDay(new Date());
  const [dahab, keralaGold, indiaGold, dubaiRetail, keralaSilver, indiaSilver, xagUsd, inrPerUsd, history] = await Promise.all([
    safe(fetchDahabPulse()),
    safe(fetchGoodreturnsGold('kerala', day)),
    safe(fetchGoodreturnsGold('india', day)),
    safe(fetchGoodreturnsDubaiGold(day)),
    safe(fetchGoodreturnsSilver('kerala', day)),
    safe(fetchGoodreturnsSilver('india', day)),
    safe(fetchSilverUsd()),
    safe(fetchForex()),
    safe(fetchHistory()),
  ]);

  if (!dahab || !dahab.perGramUsd) throw new Error('Upstream gold feed unavailable');
  // No hardcoded fallback rate: a silently wrong USD/INR is worse than no live data.
  if (!inrPerUsd) throw new Error('Exchange rate unavailable');

  const uaeGold = buildUaeGold(dahab, dubaiRetail);
  const sources = [];
  if (keralaGold || indiaGold) sources.push('Goodreturns (Kerala, Mumbai)');
  if (uaeGold.basis === 'retail') sources.push('Goodreturns (Dubai retail)');
  sources.push('DahabPulse (gold spot)');
  if (xagUsd) sources.push('gold-api.com (silver spot)');

  // India is the Mumbai benchmark; it is never silently replaced by Kerala (the two can differ,
  // e.g. silver is Rs 5/g higher in Kerala). If Mumbai is down, India is absent and pages say so.
  const withMeta = (label, extra) => (v) => (v ? { label, currency: 'INR', ...extra, ...v } : null);
  const payload = {
    updated_at: dahab.updatedAt || new Date().toISOString(),
    source_note: 'Live rates · ' + sources.join(' + '),
    live: true,
    provider: {
      name: 'ToolShoppy',
      url: 'https://toolshoppy.com/',
      methodology_url: 'https://toolshoppy.com/tools/rates/methodology/',
      attribution: 'Rates via ToolShoppy (toolshoppy.com)',
      disclaimer: 'Indicative reference rates compiled from third-party sources; not a trading price. Making charges, taxes and dealer spreads are extra.',
    },
    gold: {
      kerala: withMeta('Kerala', {})(keralaGold),
      india: withMeta('India', { benchmark_city: 'Mumbai' })(indiaGold),
      uae: uaeGold,
    },
    silver: {
      kerala: withMeta('Kerala', {})(keralaSilver),
      india: withMeta('India', { benchmark_city: 'Mumbai' })(indiaSilver),
      uae: xagUsd ? buildUaeSilver(xagUsd, dahab.currencies.AED) : null,
    },
    history,
    currency: buildCurrencyTable(dahab, inrPerUsd),
  };

  // Spot-based UAE gold is always labelled basis:'spot', so serving it alone is honest.
  if (!payload.gold.kerala && !payload.gold.uae) throw new Error('No rate data');
  return payload;
}
