import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { readToolCatalog } from './site-catalog.mjs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const tools = readToolCatalog(html);
const setup = html.slice(html.indexOf('  const groups = ['), html.indexOf('  const featuredGrid ='));
const search = html.slice(html.indexOf('  const aliases = {'), html.indexOf('  function renderDirectory'));
const api = vm.runInNewContext(`const liveTools = ${JSON.stringify(tools)}; const favorites = [];
  ${setup}\n${search}\n({ groupOf, orderedTools, directoryHTML, searchTools, groups });`);

test('every tool belongs to a visible category and has a real local page', () => {
  for (const tool of tools) {
    assert.ok(api.groups.some(group => group.id === api.groupOf(tool)), tool.id);
    assert.ok(fs.existsSync(new URL(`..${tool.href}index.html`, import.meta.url)), tool.href);
  }
});

test('common tasks and conversion directions rank first', () => {
  for (const [query, expected] of [
    ['join pdfs', 'pdf-merge'], ['photo 20KB', 'image-compressor'],
    ['pdf to word', 'pdf-to-word'], ['word to pdf', 'word-to-pdf'],
    ['extract text', 'image-ocr'], ['remove password', 'unlock-pdf']
  ]) assert.equal(api.searchTools(query)[0]?.id, expected, query);
  assert.equal(api.searchTools('nonexistentxyz').length, 0);
});

test('PDF order is predictable and does not mutate the catalog', () => {
  const original = tools.map(t => t.id).join(',');
  const pdf = api.orderedTools(tools.filter(t => t.cat === 'pdf'));
  assert.equal(pdf.slice(0, 3).map(t => t.id).join(','), 'pdf-merge,pdf-split,pdf-compress');
  assert.equal(tools.map(t => t.id).join(','), original);
});

test('server-free HTML includes all tools, grouped navigation, and a single leaderboard', () => {
  const directory = api.directoryHTML(tools, true);
  const ids = new Set([...directory.matchAll(/class="tool-card"[^>]*data-id="([^"]+)"/g)].map(m => m[1]));
  assert.equal(ids.size, tools.length);
  assert.equal((directory.match(/class="ad-slot ad-top"/g) || []).length, 1);
  const sectionIds = [...directory.matchAll(/id="(group-[^"]+)"/g)].map(m => m[1]);
  assert.equal(sectionIds.length, new Set(sectionIds).size);
  const imageSection = directory.split('aria-labelledby="group-image"')[1].split('</section>')[0];
  assert.match(imageSection, /data-id="image-to-pdf"/);
});
