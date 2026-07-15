/**
 * Cloudflare Pages Function — live petrol & diesel prices (India states).
 * GET /api/fuel?state=kerala
 */
const GR_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-IN,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
  'X-OIGT-Header': 'GITPL',
};

const STATES = {
  kerala: { label: 'Kerala', slug: 'petrol-price-in-kerala' },
  'tamil-nadu': { label: 'Tamil Nadu', slug: 'petrol-price-in-tamil-nadu' },
  karnataka: { label: 'Karnataka', slug: 'petrol-price-in-karnataka' },
  maharashtra: { label: 'Maharashtra', slug: 'petrol-price-in-maharashtra' },
  delhi: { label: 'Delhi', slug: 'petrol-price-in-delhi' },
  gujarat: { label: 'Gujarat', slug: 'petrol-price-in-gujarat' },
  'andhra-pradesh': { label: 'Andhra Pradesh', slug: 'petrol-price-in-andhra-pradesh' },
  telangana: { label: 'Telangana', slug: 'petrol-price-in-telangana' },
  'uttar-pradesh': { label: 'Uttar Pradesh', slug: 'petrol-price-in-uttar-pradesh' },
  'west-bengal': { label: 'West Bengal', slug: 'petrol-price-in-west-bengal' },
  rajasthan: { label: 'Rajasthan', slug: 'petrol-price-in-rajasthan' },
  punjab: { label: 'Punjab', slug: 'petrol-price-in-punjab' },
  haryana: { label: 'Haryana', slug: 'petrol-price-in-haryana' },
};

function parseInr(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/[₹\u20b9Rs.]/gi, '').trim();
  const m = s.match(/[\d,]+(?:\.\d+)?/);
  if (!m) return null;
  const v = parseFloat(m[0].replace(/,/g, ''));
  return v > 0 && v < 500 ? Math.round(v * 100) / 100 : null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchJson(url, referer) {
  const res = await fetch(url, {
    headers: { ...GR_HEADERS, Referer: referer },
    cf: { cacheTtl: 3600 },
  });
  if (!res.ok) return null;
  const text = (await res.text()).trim();
  if (!text || text.startsWith('<')) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchStateFuel(key, meta, day) {
  const base = `https://www.goodreturns.in/${meta.slug}.html`;
  const params = new URLSearchParams({
    gr_db_dynamic_content: 'fuel_past_price',
    date: day,
  });
  const data = await fetchJson(`${base}?${params}`, base);
  if (!data) return null;

  const petrol =
    parseInr(data.petrol_price) ||
    parseInr(data.petrol_price_today) ||
    parseInr(data.petrol);
  const diesel =
    parseInr(data.diesel_price) ||
    parseInr(data.diesel_price_today) ||
    parseInr(data.diesel);

  if (!petrol && !diesel) return null;
  return {
    key,
    label: meta.label,
    petrol: petrol,
    diesel: diesel,
    date: data.current_date || day,
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const stateKey = url.searchParams.get('state');
  const day = todayIso();

  try {
    if (stateKey && STATES[stateKey]) {
      const row = await fetchStateFuel(stateKey, STATES[stateKey], day);
      if (!row) {
        return Response.json({ error: 'Fuel data unavailable', state: stateKey }, { status: 502 });
      }
      return Response.json({
        updated_at: new Date().toISOString(),
        live: true,
        source_note: 'Goodreturns',
        state: row,
      }, {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    const entries = await Promise.all(
      Object.entries(STATES).map(([key, meta]) => fetchStateFuel(key, meta, day))
    );
    const states = {};
    entries.forEach((row) => {
      if (row) states[row.key] = { label: row.label, petrol: row.petrol, diesel: row.diesel, date: row.date };
    });

    if (!Object.keys(states).length) {
      return Response.json({ error: 'Fuel feeds unavailable' }, { status: 502 });
    }

    return Response.json({
      updated_at: new Date().toISOString(),
      live: true,
      source_note: 'Goodreturns',
      states,
    }, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err) {
    return Response.json({ error: err.message || 'Fuel fetch failed' }, { status: 500 });
  }
}
