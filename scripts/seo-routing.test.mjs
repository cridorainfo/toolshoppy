import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSiteServer } from '../server.mjs';
import { readToolCatalog } from './site-catalog.mjs';
import { SERVICE_SEARCH_CONTENT } from './service-search-content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'serve.json'), 'utf8'));
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

test('search pages return HTML without a self-redirect, including query strings', async () => {
  for (const route of ['/search/', '/search/?q=pdfmerge', '/search/?q=no-such-tool']) {
    const res = await fetch(origin + route, { redirect: 'manual' });
    assert.equal(res.status, 200, route);
    assert.equal(res.headers.get('location'), null, route);
    assert.match(await res.text(), /noindex, follow/, route);
  }
});

test('all sitemap URLs directly return their self-canonical, indexable page', async () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const [, canonical] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const res = await fetch(origin + new URL(canonical).pathname, { redirect: 'manual' });
    assert.equal(res.status, 200, canonical);
    assert.match(res.headers.get('content-type'), /text\/html/, canonical);
    const html = await res.text();
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), canonical);
    assert.doesNotMatch(html, /<meta\b[^>]*content="[^"]*noindex/i, canonical);
  }
});

test('every configured legacy alias reaches its destination without looping', async () => {
  for (const rule of config.redirects) {
    const first = await fetch(origin + rule.source, { redirect: 'manual' });
    assert.equal(first.status, 301, rule.source);
    assert.equal(first.headers.get('location'), rule.destination, rule.source);
    const final = await fetch(origin + rule.destination, { redirect: 'manual' });
    assert.equal(final.status, 200, rule.destination);
    await first.text();
    await final.text();
  }
});

test('missing pages and source directories do not become indexable directory listings', async () => {
  for (const route of ['/audit-missing-page-20260912', '/scripts/', '/docs/', '/assets/']) {
    const res = await fetch(origin + route, { redirect: 'manual' });
    assert.equal(res.status, 404, route);
    await res.text();
  }
});

test('homepage provides all 55 tool cards and the merge link before JavaScript executes', async () => {
  const res = await fetch(origin);
  const html = (await res.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const grid = html.slice(html.indexOf('id="featuredGrid"'), html.indexOf('<div class="ad-slot ad-incontent">'));
  assert.equal([...grid.matchAll(/class="tool-card"/g)].length, 55);
  assert.ok(grid.includes('href="/tools/pdf/merge/"'));
  for (const tool of readToolCatalog()) {
    assert.ok(grid.includes(`<a href="${tool.href}" class="tool-card-link">${tool.title}</a>`), tool.href);
  }
});

test('all HTML variants redirect once to the canonical URL and preserve query strings', async () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname);
  for (const route of [...paths, '/search/']) {
    const variants = route === '/' ? ['/index', '/index.html'] : route.startsWith('/tools/') || route.startsWith('/blog/') || route === '/search/'
      ? [route.slice(0, -1), route + 'index', route + 'index.html']
      : [route.slice(0, -1), route.slice(0, -1) + '.html'];
    for (const variant of variants) {
      const query = '?q=image%20compression&utm_source=seo-check';
      const res = await fetch(origin + variant + query, { redirect: 'manual' });
      assert.equal(res.status, 301, variant);
      assert.equal(res.headers.get('location'), route + query, variant);
      await res.text();
    }
  }
});

test('every catalog tool has a descriptive static link from its own category hub', () => {
  for (const tool of readToolCatalog()) {
    const hub = fs.readFileSync(path.join(root, 'tools', tool.key.split('/')[0], 'index.html'), 'utf8');
    const html = hub.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    assert.ok(html.includes(`<a class="tool-card" href="${tool.href}">`), tool.href);
    assert.ok(html.includes(`<h3>${tool.title.replace(/&/g, '&amp;')}</h3>`), tool.title);
    const collection = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, s]) => JSON.parse(s)).find(s => s['@type'] === 'CollectionPage');
    assert.ok(collection.mainEntity.itemListElement.some(item => item.url.endsWith(tool.href)), tool.href);
  }
});

test('priority service metadata and FAQ schemas match the visible reviewed copy', () => {
  for (const [key, copy] of Object.entries(SERVICE_SEARCH_CONTENT)) {
    const html = fs.readFileSync(path.join(root, 'tools', key, 'index.html'), 'utf8');
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    assert.ok(html.includes(`<title>${esc(copy.title)}</title>`), key);
    assert.ok(html.includes(`<h1>${esc(copy.h1)}</h1>`), key);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(([, s]) => JSON.parse(s));
    assert.equal(schemas.find(s => s['@type'] === 'WebApplication').description, copy.description, key);
    if (copy.faqs) {
      const faq = schemas.find(s => s['@type'] === 'FAQPage');
      for (const question of faq.mainEntity) {
        assert.ok(html.includes(`<h3>${esc(question.name)}</h3>`), key);
        assert.ok(html.includes(`<p>${esc(question.acceptedAnswer.text)}</p>`), key);
      }
    }
  }
});

test('HEAD and asset responses retain the expected status and content types', async () => {
  for (const route of ['/', '/tools/image/compress/', '/robots.txt', '/sitemap.xml', '/assets/css/main.css?v=5', '/assets/js/core.js?v=2']) {
    const get = await fetch(origin + route, { redirect: 'manual' });
    const head = await fetch(origin + route, { method: 'HEAD', redirect: 'manual' });
    assert.equal(get.status, 200, route);
    assert.equal(head.status, 200, route);
    assert.equal(head.headers.get('content-type'), get.headers.get('content-type'), route);
    assert.equal(await head.text(), '', route);
    assert.equal(get.headers.get('x-robots-tag'), null, route);
    await get.text();
  }
  const compressed = await fetch(origin + '/tools/image/compress/', { headers: { 'Accept-Encoding': 'gzip' } });
  assert.equal(compressed.headers.get('content-encoding'), 'gzip');
  assert.match(await compressed.text(), /Image Compressor — Reduce Image Size Online/);
});
