// Live petrol & diesel prices for GET /api/fuel (served by server.mjs on Railway).
// Goodreturns retired its JSON "fuel_past_price" endpoint and renamed state pages to
// /{petrol|diesel}-price-in-{state}-s{id}.html, so the state capital's price is read from the
// page intro: "Today's petrol price in Kerala (...) stands at ₹<b>115.49</b> per litre".

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html',
  'Accept-Language': 'en-IN,en;q=0.9',
};

const FETCH_TIMEOUT_MS = 10000;

export const FUEL_STATES = {
  kerala: { label: 'Kerala', slug: 'kerala-s18' },
  'tamil-nadu': { label: 'Tamil Nadu', slug: 'tamil-nadu-s30' },
  karnataka: { label: 'Karnataka', slug: 'karnataka-s17' },
  maharashtra: { label: 'Maharashtra', slug: 'maharashtra-s20' },
  delhi: { label: 'Delhi', slug: 'delhi-s10' },
  gujarat: { label: 'Gujarat', slug: 'gujarat-s12' },
  'andhra-pradesh': { label: 'Andhra Pradesh', slug: 'andhra-pradesh-s2' },
  telangana: { label: 'Telangana', slug: 'telangana-s31' },
  'uttar-pradesh': { label: 'Uttar Pradesh', slug: 'uttar-pradesh-s33' },
  'west-bengal': { label: 'West Bengal', slug: 'west-bengal-s35' },
  rajasthan: { label: 'Rajasthan', slug: 'rajasthan-s28' },
  punjab: { label: 'Punjab', slug: 'punjab-s27' },
  haryana: { label: 'Haryana', slug: 'haryana-s13' },
};

async function fetchPrice(fuel, slug) {
  const res = await fetch(`https://www.goodreturns.in/${fuel}-price-in-${slug}.html`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/id="gr_intro_content"[^>]*>\s*<p>[\s\S]*?<b>\s*([\d,]+(?:\.\d+)?)\s*<\/b>/);
  const value = m ? parseFloat(m[1].replace(/,/g, '')) : NaN;
  // Sanity range for INR per litre; rejects a markup change that would parse something else.
  return value > 40 && value < 250 ? Math.round(value * 100) / 100 : null;
}

/** Returns { label, petrol, diesel, date } for a FUEL_STATES key; throws when neither price parses. */
export async function fetchStateFuel(key) {
  const meta = FUEL_STATES[key];
  if (!meta) throw new Error('Unknown state');
  const [petrol, diesel] = await Promise.all([
    fetchPrice('petrol', meta.slug).catch(() => null),
    fetchPrice('diesel', meta.slug).catch(() => null),
  ]);
  if (!petrol && !diesel) throw new Error('Fuel data unavailable');
  return {
    label: meta.label,
    petrol,
    diesel,
    // Goodreturns publishes the day's prices in IST.
    date: new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10),
  };
}
