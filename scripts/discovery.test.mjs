import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { readToolCatalog } from './site-catalog.mjs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const liveTools = readToolCatalog(html);
const searchSource = html.slice(html.indexOf('  const aliases ='), html.indexOf('  function renderDirectory()'));
const search = vm.runInNewContext(`${searchSource}\nsearchTools`, { liveTools });

test('task search finds photo size requirements and handles compact KB notation', () => {
  for (const query of ['photo 20 KB', 'photo 20kb', 'photo 100 KB']) {
    assert.ok(search(query).some(t => t.id === 'image-compressor'), query);
  }
});

test('conversion search ranks the requested direction first', () => {
  assert.equal(search('PDF to Word')[0].id, 'pdf-to-word');
  assert.equal(search('Word to PDF')[0].id, 'word-to-pdf');
});

test('every task shortcut leads to tools and unmatched searches remain empty', () => {
  for (const [, query] of html.matchAll(/data-task-query="([^"]+)"/g)) {
    assert.ok(search(query).length, query);
  }
  assert.equal(search('no-such-tool-zzzx').length, 0);
});

test('shared tool shells retain one top ad after their working area', () => {
  for (const tool of liveTools) {
    const page = fs.readFileSync(new URL(`../tools/${tool.key}/index.html`, import.meta.url), 'utf8');
    if (!page.includes('class="tool-experience"') || !page.includes('class="tool-layout')) continue;
    const topAds = [...page.matchAll(/class="ad-slot ad-top"/g)];
    if (topAds.length) {
      assert.equal(topAds.length, 1, tool.key);
      assert.ok(topAds[0].index > page.indexOf('class="tool-layout'), tool.key);
    }
    assert.ok(!page.includes('onfocus="location.href='), tool.key);
    assert.ok(page.includes('data-theme-enabled'), tool.key);
  }
});
