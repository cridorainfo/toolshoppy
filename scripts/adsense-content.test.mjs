import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { isAdFree } from './lib/page-policy.mjs';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function walk(dir) {
  return fs.readdirSync(new URL('../' + dir, import.meta.url), { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(dir + '/' + e.name) : e.name === 'index.html' ? [dir + '/' + e.name] : []);
}

test('regional rate summaries cannot load manual or Auto ads', () => {
  const pages = walk('tools/rates').filter(p => /^tools\/rates\/[^/]+\/[^/]+\/index.html$/.test(p));
  assert.ok(pages.length > 30);
  for (const page of pages) {
    assert.ok(isAdFree(page), page);
    const html = read(page);
    assert.match(html, /name="ts-ads" content="off"/, page);
    assert.doesNotMatch(html, /class="ad-slot|src="https:\/\/pagead2\.googlesyndication/, page);
  }
});

test('the retained centre resizer makes no official UIDAI size or online-update claim', () => {
  const html = read('tools/image/govt-photo/aadhaar/index.html');
  assert.match(html, /id="fileInput"/);
  assert.match(html, /id: 'portrait-200'.*w: 200, h: 230, maxKb: 100/);
  assert.match(html, /not an official UIDAI/);
  assert.doesNotMatch(html, /exact Aadhaar|Aadhaar enrollment spec|id: 'aadhaar'|upload the photo online via the UIDAI/);
  for (const page of walk('tools/image/govt-photo')) {
    assert.doesNotMatch(read(page), /id: 'aadhaar'/, page);
  }
});

test('published pages do not use the fabricated generic upload instructions', () => {
  for (const page of walk('tools')) assert.doesNotMatch(read(page), /Enter your inputs or upload a file as prompted/, page);
});

test('blog search submits a query and does not reset the saved theme', () => {
  for (const page of walk('blog')) {
    const html = read(page);
    assert.match(html, /action="\/search\/"/);
    assert.match(html, /name="q"/);
    assert.doesNotMatch(html, /onfocus="location.href|localStorage.setItem\('ts-theme','light'\)/);
  }
});

function fuel(responses) {
  const window = {};
  vm.runInNewContext(read('assets/js/fuel.js'), {
    window, Date, fetch: async () => {
      const data = responses.shift();
      if (data instanceof Error) throw data;
      return { ok: true, json: async () => data };
    },
  });
  return window.TSFuel;
}
test('fuel rejects an old checked-in snapshot after a live-feed outage', async () => {
  const old = { updated_at: new Date(Date.now() - 2 * 86400000).toISOString(), states: { delhi: { petrol: 90 } } };
  await assert.rejects(fuel([new Error('offline'), old]).fetchFuel('delhi'), /unavailable/);
});
test('a recent cached fuel quote retains its original timestamp and is labelled cached', async () => {
  const updated_at = new Date(Date.now() - 3600000).toISOString();
  const result = await fuel([new Error('offline'), { updated_at, states: { delhi: { petrol: 90 } } }]).fetchFuel('delhi');
  assert.equal(result.updated_at, updated_at);
  assert.equal(result.live, false);
  assert.equal(result.state.petrol, 90);
});
