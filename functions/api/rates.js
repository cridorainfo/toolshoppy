/**
 * Cloudflare Pages Function — live gold, silver & currency rates.
 * GET /api/rates
 */

const GR_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-IN,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
  'X-OIGT-Header': 'GITPL',
};

const TROY_OZ_GRAMS = 31.1034768;

function parseInr(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.replace(/[₹\u20b9]/g, '').match(/[\d,]+(?:\.\d+)?/);
  if (!m) return null;
  const v = parseFloat(m[0].replace(/,/g, ''));
  return v > 0 && v < 500000 ? Math.round(v * 100) / 100 : null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers, cf: { cacheTtl: 300 } });
  if (!res.ok) return null;
  const text = (await res.text()).trim();
  if (!text || text.startsWith('<')) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchGoodreturnsGold(region, day) {
  const slug = region === 'india' ? 'india' : 'kerala';
  const base = `https://www.goodreturns.in/gold-rates/${slug}.html`;
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
  };
}

async function fetchGoodreturnsSilver(day) {
  const base = 'https://www.goodreturns.in/silver-rates/kerala.html';
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

async function fetchForex() {
  const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', { cf: { cacheTtl: 3600 } });
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

function buildIndiaRegion(label, key, gold, silver) {
  return {
    gold: gold
      ? { label, currency: 'INR', ...gold }
      : null,
    silver: silver
      ? { label, currency: 'INR', ...silver }
      : null,
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

async function fetchHistory() {
  const dates = [];
  const gold22 = [];
  const silverInr = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    dates.push(iso);
    const [g, s] = await Promise.all([
      fetchGoodreturnsGold('kerala', iso),
      fetchGoodreturnsSilver(iso),
    ]);
    gold22.push(g && g.per_gram['22k'] ? g.per_gram['22k'] : null);
    silverInr.push(s ? s.per_gram : null);
  }
  return { dates, gold_22k_inr: gold22, silver_inr: silverInr };
}

export async function onRequestGet() {
  try {
    const day = todayIso();
    const [dahab, keralaGold, indiaGold, keralaSilver, xagUsd, inrPerUsd, history] =
      await Promise.all([
        fetchDahabPulse(),
        fetchGoodreturnsGold('kerala', day),
        fetchGoodreturnsGold('india', day),
        fetchGoodreturnsSilver(day),
        fetchSilverUsd(),
        fetchForex(),
        fetchHistory(),
      ]);

    if (!dahab || !dahab.perGramUsd) {
      return new Response(JSON.stringify({ error: 'Upstream gold feed unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const goldIndia = indiaGold || keralaGold;
    const silverIndia = keralaSilver;
    const uaeGold = buildUaeGold(dahab);
    const uaeSilver = xagUsd ? buildUaeSilver(xagUsd, dahab.currencies.AED) : null;

    const sources = [];
    if (keralaGold) sources.push('Goodreturns (Kerala)');
    if (dahab) sources.push('DahabPulse (UAE spot)');
    if (xagUsd) sources.push('gold-api.com (silver)');

    const payload = {
      updated_at: dahab.updatedAt || new Date().toISOString(),
      source_note: 'Live rates · ' + sources.join(' + '),
      live: true,
      gold: {
        kerala: keralaGold
          ? { label: 'Kerala', currency: 'INR', ...keralaGold }
          : null,
        india: goldIndia
          ? { label: 'India', currency: 'INR', ...(indiaGold || keralaGold) }
          : null,
        uae: uaeGold,
      },
      silver: {
        kerala: silverIndia
          ? { label: 'Kerala', currency: 'INR', ...silverIndia }
          : null,
        india: silverIndia
          ? { label: 'India', currency: 'INR', ...silverIndia }
          : null,
        uae: uaeSilver,
      },
      history,
      currency: buildCurrencyTable(dahab, inrPerUsd || 86),
    };

    if (!payload.gold.kerala && !payload.gold.uae) {
      return new Response(JSON.stringify({ error: 'No rate data' }), { status: 502 });
    }

    return new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Rates fetch failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
