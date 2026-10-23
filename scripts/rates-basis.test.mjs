import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildUaeGold, buildUaeSilver, retailLooksSane } from '../lib/rates-api.mjs';
import { renderRateSnapshot } from '../lib/rate-snapshot.mjs';

// DahabPulse shape: USD per gram by carat + currency table. 128.57 USD/g x 3.6725 = AED 472.18 spot.
const dahab = {
  perGramUsd: { '24k': 128.57203305094282, '22k': 117.86198269779928, '18k': 96.42902478820712 },
  currencies: { USD: 1, AED: 3.6725 },
};

test('a plausible Dubai retail quote is served as retail, with the spot reference beside it', () => {
  const g = buildUaeGold(dahab, { '24k': 489.5, '22k': 453.25, '18k': 370.8, date: '23 October 2026' });
  assert.equal(g.basis, 'retail');
  assert.equal(g.retail_source, 'Goodreturns (Dubai)');
  assert.deepEqual(g.per_gram, { '24k': 489.5, '22k': 453.25, '18k': 370.8 });
  assert.equal(g.spot_per_gram['24k'], 472.18);
  assert.equal(g.premium_vs_spot_pct, 3.67);
  assert.equal(g.per_tola_11_664g['24k'], Math.round(489.5 * 11.6638));
  assert.match(g.basis_note, /Retail rate/);
});

test('without a retail quote the Dubai rate is spot and says so, never "retail"', () => {
  const g = buildUaeGold(dahab, null);
  assert.equal(g.basis, 'spot');
  assert.equal(g.per_gram['24k'], 472.18);
  assert.equal(g.retail_source, undefined);
  assert.match(g.basis_note, /spot/i);
});

test('an implausible retail quote is rejected instead of published', () => {
  const spot = { '24k': 472.18, '22k': 432.85, '18k': 354.14 };
  // 20% above spot, a parse slip, a stale page, or the wrong carat in the wrong field
  assert.equal(retailLooksSane({ '24k': 570, '22k': 527, '18k': 430 }, spot), false);
  assert.equal(retailLooksSane({ '24k': 300, '22k': 277, '18k': 225 }, spot), false);
  // 22K not in proportion to 24K
  assert.equal(retailLooksSane({ '24k': 489.5, '22k': 489.5, '18k': 370.8 }, spot), false);
  assert.equal(retailLooksSane({ '24k': 489.5, '22k': 453.25, '18k': 200 }, spot), false);
  assert.equal(retailLooksSane(null, spot), false);
  assert.equal(buildUaeGold(dahab, { '24k': 570, '22k': 527, '18k': 430 }).basis, 'spot');
  // the real figures from 23 Oct 2026 pass
  assert.equal(retailLooksSane({ '24k': 489.5, '22k': 453.25, '18k': 370.8 }, spot), true);
});

test('UAE silver is always labelled spot because no retail source exists', () => {
  const s = buildUaeSilver(54.01, 3.6725);
  assert.equal(s.basis, 'spot');
  assert.equal(s.currency, 'AED');
  assert.ok(s.per_gram > 6 && s.per_gram < 7);
  assert.match(s.basis_note, /premium/);
});

test('the server-rendered snapshot carries the basis line so crawlers and users see it', () => {
  const now = Date.parse('2026-10-23T18:30:00Z');
  const rates = {
    live: true, updated_at: '2026-10-23T18:00:00Z', source_note: 'Live rates · Goodreturns (Dubai retail) + DahabPulse (gold spot)',
    gold: { uae: buildUaeGold(dahab, { '24k': 489.5, '22k': 453.25, '18k': 370.8 }) },
    silver: { uae: buildUaeSilver(54.01, 3.6725) },
  };
  const gold = renderRateSnapshot('/tools/rates/gold-rate/dubai/', { rates }, now);
  assert.match(gold, /24K gold: AED 489\.5 per gram/);
  assert.match(gold, /Retail rate · Goodreturns \(Dubai\)/);
  const silver = renderRateSnapshot('/tools/rates/silver-rate/uae/', { rates }, now);
  assert.match(silver, /International spot price converted to AED/);
});
