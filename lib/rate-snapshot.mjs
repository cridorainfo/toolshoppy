// Server-rendered "today's rates" block for the rate pages.
//
// The rate pages fill their numbers in with JavaScript, so crawlers (and AdSense reviewers)
// only saw "Loading live rates…". server.mjs replaces SNAPSHOT_PLACEHOLDER in those pages with
// the current figures from its in-memory cache, so the numbers are in the HTML itself.
//
// Safety rule (a stale fallback once hid a 12% USD/INR error): render only LIVE data that is
// fresh. Anything else renders nothing, and the page behaves exactly as before.

export const SNAPSHOT_PLACEHOLDER = '<!--ts-rate-summary-->';
const MAX_AGE_MS = 36 * 60 * 60 * 1000;

const GOLD_PAGES = { 'gold-rate': 'kerala', 'gold-rate/kerala': 'kerala', 'gold-rate/dubai': 'uae', 'gold-rate/mumbai': 'india' };
const SILVER_PAGES = { 'silver-rate': 'kerala', 'silver-rate/uae': 'uae' };
const FUEL_SLUG = /^petrol-price\/([a-z-]+)$/;

/** Maps a canonical page path to what it should show, or null when the page has no snapshot. */
export function snapshotTarget(pathname) {
  const m = /^\/tools\/rates\/(.+?)\/?$/.exec(pathname);
  if (!m) return null;
  const key = m[1];
  if (GOLD_PAGES[key]) return { kind: 'gold', region: GOLD_PAGES[key] };
  if (SILVER_PAGES[key]) return { kind: 'silver', region: SILVER_PAGES[key] };
  if (key === 'currency-converter/aed-inr') return { kind: 'currency', code: 'AED' };
  const fuel = FUEL_SLUG.exec(key);
  if (fuel) return { kind: 'fuel', state: fuel[1] };
  return null;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n, digits = 2) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: digits });
const money = (n, currency) => (currency === 'INR' ? '₹' : currency + ' ') + num(n);
const isNum = n => typeof n === 'number' && isFinite(n) && n > 0;

export function istStamp(ms) {
  return new Date(ms).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).replace(/\s+/g, ' ') + ' IST';
}

function fresh(updatedAt, now) {
  const t = Date.parse(updatedAt);
  return isFinite(t) && now - t >= -5 * 60 * 1000 && now - t < MAX_AGE_MS ? t : null;
}

function block(title, lines, stamp, source) {
  return `<section class="rate-snapshot" aria-label="Current rates">
    <p class="rate-snapshot-title">${esc(title)}</p>
    <ul>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
    <p class="rate-snapshot-meta">Updated ${esc(stamp)} · ${esc(source)}. Indicative rates; jeweller and pump prices vary.</p>
  </section>`;
}

/**
 * @param {string} pathname canonical path, e.g. /tools/rates/gold-rate/kerala/
 * @param {{rates?: object|null, fuel?: object|null}} data  cached payloads (may be null/stale)
 * @returns {string} HTML, or '' when there is nothing trustworthy to show
 */
export function renderRateSnapshot(pathname, { rates, fuel } = {}, now = Date.now()) {
  const target = snapshotTarget(pathname);
  if (!target) return '';

  if (target.kind === 'fuel') {
    const s = fuel && fuel.state;
    const t = fuel && fuel.live === true ? fresh(fuel.updated_at, now) : null;
    if (!s || !t || !(isNum(s.petrol) || isNum(s.diesel))) return '';
    const lines = [];
    if (isNum(s.petrol)) lines.push(`Petrol: ${money(s.petrol, 'INR')} per litre`);
    if (isNum(s.diesel)) lines.push(`Diesel: ${money(s.diesel, 'INR')} per litre`);
    return block(`Today’s petrol and diesel price in ${s.label}`, lines, istStamp(t), 'Source: Goodreturns');
  }

  const t = rates && rates.live === true && !rates._fallback ? fresh(rates.updated_at, now) : null;
  if (!t) return '';
  const source = rates.source_note ? String(rates.source_note).replace(/^Live rates\s*·\s*/, 'Source: ') : 'Live market data';

  if (target.kind === 'gold') {
    const g = rates.gold && rates.gold[target.region];
    if (!g || !g.per_gram || !(isNum(g.per_gram['22k']) || isNum(g.per_gram['24k']))) return '';
    const lines = [];
    if (isNum(g.per_gram['22k'])) lines.push(`22K gold: ${money(g.per_gram['22k'], g.currency)} per gram`);
    if (isNum(g.per_gram['24k'])) lines.push(`24K gold: ${money(g.per_gram['24k'], g.currency)} per gram`);
    if (isNum(g.per_gram['18k'])) lines.push(`18K gold: ${money(g.per_gram['18k'], g.currency)} per gram`);
    if (g.per_sovereign_8g && isNum(g.per_sovereign_8g['22k'])) lines.push(`22K per sovereign (8 g): ${money(g.per_sovereign_8g['22k'], g.currency)}`);
    if (g.per_tola_11_664g && isNum(g.per_tola_11_664g['24k'])) lines.push(`24K per tola (11.664 g): ${money(g.per_tola_11_664g['24k'], g.currency)}`);
    return block(`Today’s gold rate in ${g.label}`, lines, istStamp(t), source);
  }

  if (target.kind === 'silver') {
    const s = rates.silver && rates.silver[target.region];
    if (!s || !isNum(s.per_gram)) return '';
    const lines = [`Silver: ${money(s.per_gram, s.currency)} per gram`];
    if (isNum(s.per_10g)) lines.push(`${money(s.per_10g, s.currency)} per 10 grams`);
    if (isNum(s.per_kg)) lines.push(`${money(s.per_kg, s.currency)} per kilogram`);
    return block(`Today’s silver rate in ${s.label}`, lines, istStamp(t), source);
  }

  if (target.kind === 'currency') {
    const c = rates.currency && rates.currency.inr_per_unit;
    const per = c && c[target.code];
    if (!isNum(per)) return '';
    return block(`Today’s ${target.code} to INR rate`, [`1 ${target.code} = ${money(per, 'INR')}`, `100 ${target.code} = ${money(per * 100, 'INR')}`, `1,000 ${target.code} = ${money(per * 1000, 'INR')}`], istStamp(t), source);
  }
  return '';
}
