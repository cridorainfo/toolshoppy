import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSiteServer } from '../server.mjs';
import { renderRateSnapshot, snapshotTarget, SNAPSHOT_PLACEHOLDER } from '../lib/rate-snapshot.mjs';

const NOW = Date.parse('2026-10-20T18:00:00Z');
const hoursAgo = h => new Date(NOW - h * 3600000).toISOString();
const rates = (over = {}) => ({
  live: true, updated_at: hoursAgo(1), source_note: 'Live rates · Goodreturns (Kerala) + DahabPulse (UAE spot)',
  gold: {
    kerala: { label: 'Kerala', currency: 'INR', per_gram: { '24k': 14610, '22k': 13390, '18k': 10958 }, per_sovereign_8g: { '22k': 107120 } },
    uae: { label: 'UAE (Dubai)', currency: 'AED', per_gram: { '24k': 520.5, '22k': 477.1 }, per_tola_11_664g: { '24k': 6071 } },
    india: { label: 'India', currency: 'INR', per_gram: { '24k': 14610, '22k': 13390 } },
  },
  silver: { kerala: { label: 'Kerala', currency: 'INR', per_gram: 245, per_10g: 2450, per_kg: 245000 }, uae: { label: 'UAE (Dubai)', currency: 'AED', per_gram: 7.12, per_10g: 71.2, per_kg: 7120 } },
  currency: { inr_per_unit: { AED: 26.23, USD: 96.32 } },
  ...over,
});

test('which pages get a snapshot', () => {
  assert.deepEqual(snapshotTarget('/tools/rates/gold-rate/'), { kind: 'gold', region: 'kerala' });
  assert.deepEqual(snapshotTarget('/tools/rates/gold-rate/dubai/'), { kind: 'gold', region: 'uae' });
  assert.deepEqual(snapshotTarget('/tools/rates/silver-rate/uae/'), { kind: 'silver', region: 'uae' });
  assert.deepEqual(snapshotTarget('/tools/rates/petrol-price/tamil-nadu/'), { kind: 'fuel', state: 'tamil-nadu' });
  assert.deepEqual(snapshotTarget('/tools/rates/currency-converter/aed-inr/'), { kind: 'currency', code: 'AED' });
  // Kerala district pages repeat the statewide rate and are noindex: no snapshot.
  assert.equal(snapshotTarget('/tools/rates/gold-rate/kannur/'), null);
  assert.equal(snapshotTarget('/tools/image/compress/'), null);
});

test('gold, silver and currency render the live figures with a timestamp and source', () => {
  const gold = renderRateSnapshot('/tools/rates/gold-rate/kerala/', { rates: rates() }, NOW);
  assert.match(gold, /Today’s gold rate in Kerala/);
  assert.match(gold, /22K gold: ₹13,390 per gram/);
  assert.match(gold, /24K gold: ₹14,610 per gram/);
  assert.match(gold, /sovereign \(8 g\): ₹1,07,120/);
  assert.match(gold, /Updated \d{1,2} \w{3} 2026, \d{1,2}:\d{2} (am|pm) IST/i);
  assert.match(gold, /Source: Goodreturns \(Kerala\) \+ DahabPulse/);
  const uae = renderRateSnapshot('/tools/rates/gold-rate/dubai/', { rates: rates() }, NOW);
  assert.match(uae, /22K gold: AED 477\.1 per gram/);
  assert.match(uae, /tola \(11\.664 g\): AED 6,071/);
  assert.match(renderRateSnapshot('/tools/rates/silver-rate/', { rates: rates() }, NOW), /Silver: ₹245 per gram/);
  assert.match(renderRateSnapshot('/tools/rates/currency-converter/aed-inr/', { rates: rates() }, NOW), /1 AED = ₹26\.23/);
  assert.match(renderRateSnapshot('/tools/rates/currency-converter/aed-inr/', { rates: rates() }, NOW), /100 AED = ₹2,623/);
});

test('fuel renders the state price from live data', () => {
  const fuel = { live: true, updated_at: hoursAgo(1), state: { key: 'kerala', label: 'Kerala', petrol: 115.49, diesel: 104.4 } };
  const html = renderRateSnapshot('/tools/rates/petrol-price/kerala/', { fuel }, NOW);
  assert.match(html, /petrol and diesel price in Kerala/);
  assert.match(html, /Petrol: ₹115\.49 per litre/);
  assert.match(html, /Diesel: ₹104\.4 per litre/);
});

test('renders nothing for fallback, stale, missing or implausible data', () => {
  const p = '/tools/rates/gold-rate/kerala/';
  assert.equal(renderRateSnapshot(p, { rates: null }, NOW), '');
  assert.equal(renderRateSnapshot(p, { rates: rates({ live: false }) }, NOW), '');
  assert.equal(renderRateSnapshot(p, { rates: rates({ _fallback: true }) }, NOW), '');
  assert.equal(renderRateSnapshot(p, { rates: rates({ updated_at: hoursAgo(40) }) }, NOW), '', 'older than 36h');
  assert.equal(renderRateSnapshot(p, { rates: rates({ updated_at: 'not a date' }) }, NOW), '');
  assert.equal(renderRateSnapshot(p, { rates: rates({ gold: { kerala: { label: 'Kerala', currency: 'INR', per_gram: { '22k': 0 } } } }) }, NOW), '');
  assert.equal(renderRateSnapshot('/tools/rates/petrol-price/kerala/', { fuel: { live: false, updated_at: hoursAgo(1), state: { label: 'Kerala', petrol: 100 } } }, NOW), '');
  assert.equal(renderRateSnapshot('/tools/rates/gold-rate/kannur/', { rates: rates() }, NOW), '');
});

test('labels from the feed are escaped', () => {
  const r = rates();
  r.gold.kerala.label = '<img src=x onerror=alert(1)>';
  const html = renderRateSnapshot('/tools/rates/gold-rate/kerala/', { rates: r }, NOW);
  assert.ok(!html.includes('<img'), html);
  assert.match(html, /&lt;img/);
});

// --- through the real server ---
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let server, origin;
before(async () => {
  server = createSiteServer({ root });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

test('rate pages are served as HTML and the placeholder never leaks (cold cache renders nothing)', async () => {
  for (const route of ['/tools/rates/gold-rate/', '/tools/rates/gold-rate/kerala/', '/tools/rates/gold-rate/dubai/', '/tools/rates/silver-rate/', '/tools/rates/petrol-price/kerala/', '/tools/rates/currency-converter/aed-inr/']) {
    const res = await fetch(origin + route);
    assert.equal(res.status, 200, route);
    assert.match(res.headers.get('content-type'), /text\/html/, route);
    const body = await res.text();
    assert.ok(!body.includes(SNAPSHOT_PLACEHOLDER), `${route} leaked the placeholder`);
    assert.match(body, /<h1>/, route);
    const head = await fetch(origin + route, { method: 'HEAD' });
    assert.equal(head.status, 200, route + ' HEAD');
  }
});

test('noindex district pages and normal pages are untouched by the snapshot path', async () => {
  const kannur = await (await fetch(origin + '/tools/rates/gold-rate/kannur/')).text();
  assert.match(kannur, /noindex, follow/);
  const compress = await fetch(origin + '/tools/image/compress/');
  assert.equal(compress.status, 200);
});
