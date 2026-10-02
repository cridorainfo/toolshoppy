import test from 'node:test';
import assert from 'node:assert/strict';
import { handleLiveApi } from '../lib/live-api.mjs';

const page = (price, wording = 'stands at') =>
  `<div id="gr_intro_content"><p>Today's price in Kerala (Thiruvananthapuram) ${wording} &#x20b9;<b>${price}</b> per litre.</p></div>`;

function stubFetch(handler) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => handler(String(url));
  return () => { globalThis.fetch = original; };
}

test('only /api/rates and /api/fuel are handled', async () => {
  assert.equal(await handleLiveApi('/api/other', new URLSearchParams()), null);
  assert.equal(await handleLiveApi('/tools/', new URLSearchParams()), null);
});

test('unknown fuel states return 404 without touching upstream', async () => {
  const restore = stubFetch(() => { throw new Error('unexpected upstream call'); });
  try {
    const res = await handleLiveApi('/api/fuel', new URLSearchParams('state=atlantis'));
    assert.equal(res.status, 404);
  } finally { restore(); }
});

test('fuel prices are parsed from the page intro for either wording', async () => {
  const restore = stubFetch((url) => {
    const html = url.includes('petrol-price-in-kerala-s18') ? page('115.49', 'stands at') : page('104.40', 'is at');
    return new Response(html);
  });
  try {
    const res = await handleLiveApi('/api/fuel', new URLSearchParams('state=kerala'));
    assert.equal(res.status, 200);
    assert.equal(res.body.state.petrol, 115.49);
    assert.equal(res.body.state.diesel, 104.4);
    assert.equal(res.body.live, true);
  } finally { restore(); }
});

test('an unparseable fuel page yields 502 so the client falls back to its cached snapshot', async () => {
  const restore = stubFetch(() => new Response('<html>redesigned</html>'));
  try {
    const res = await handleLiveApi('/api/fuel', new URLSearchParams('state=punjab'));
    assert.equal(res.status, 502);
    assert.equal(res.maxAge, 0);
  } finally { restore(); }
});

test('rates are refused instead of guessing when USD/INR is unavailable', async () => {
  const restore = stubFetch((url) => {
    if (url.includes('dahabpulse')) {
      return Response.json({
        updatedAt: '2026-10-02T00:00:00Z',
        perGramUsd: { '24k': 100, '22k': 91.6, '18k': 75 },
        currencies: { AED: 3.6725, USD: 1 },
      });
    }
    return new Response('nope', { status: 500 });
  });
  try {
    const res = await handleLiveApi('/api/rates', new URLSearchParams());
    assert.equal(res.status, 502);
  } finally { restore(); }
});
