#!/usr/bin/env node
/**
 * Adds the long-form "how it works / benefits / comparison / tips" guide to
 * each tool page. Content lives in scripts/tool-guides/*.mjs.
 *
 * Usage:
 *   node scripts/inject-tool-guides.mjs          # write pages
 *   node scripts/inject-tool-guides.mjs --check  # exit 1 if any page is stale
 *
 * Idempotent: the block sits between <!-- tool-guide:start --> and
 * <!-- tool-guide:end --> and is replaced on every run. It is placed before
 * the "Related tools" section (fallbacks: before the FAQ, then before </main>).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GUIDES, KINDS } from './tool-guides/index.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const START = '<!-- tool-guide:start -->';
const END = '<!-- tool-guide:end -->';
const REVIEWED = 'October 2026';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Content strings may contain a small set of inline tags written by hand.
const rich = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');

function link([href, label]) {
  return `<a href="${esc(href)}">${esc(label)}</a>`;
}

function render(key, g) {
  const kind = KINDS[g.kind];
  if (!kind) throw new Error(`${key}: unknown kind ${g.kind}`);
  const rows = [...kind.rows(g), ...(g.rows || [])];
  const vsTitle = g.vsTitle || kind.vsTitle;

  const table = [
    '<div class="tool-guide-table-wrap"><table>',
    `<thead><tr><th scope="col">What matters</th><th scope="col">ToolShoppy</th><th scope="col">${esc(kind.otherCol)}</th>${
      kind.thirdCol ? `<th scope="col">${esc(kind.thirdCol)}</th>` : ''
    }</tr></thead>`,
    '<tbody>',
    ...rows.map(
      (r) =>
        `<tr><th scope="row">${esc(r[0])}</th><td>${rich(r[1])}</td><td>${rich(r[2])}</td>${
          kind.thirdCol ? `<td>${rich(r[3] || '—')}</td>` : ''
        }</tr>`
    ),
    '</tbody></table></div>',
  ].join('\n');

  const out = [];
  out.push(START);
  out.push(`<div class="content-section tool-guide">
    <h2>How ${esc(g.name)} works</h2>
    ${g.how.map((p) => `<p>${rich(p)}</p>`).join('\n    ')}
  </div>`);
  out.push(`<div class="content-section tool-guide">
    <h2>Benefits of using ${esc(g.name)} on ToolShoppy</h2>
    <ul class="guide-list">
      ${g.benefits.map((b) => `<li>${rich(b)}</li>`).join('\n      ')}
    </ul>
  </div>`);
  out.push(`<div class="content-section tool-guide">
    <h2>${esc(vsTitle)}</h2>
    ${table}
    <p class="guide-note">${esc(kind.disclaimer)}</p>
    <p class="guide-verdict"><strong>When something else is the better choice:</strong> ${rich(g.better)}</p>
  </div>`);
  out.push(`<div class="content-section tool-guide">
    <h2>Tips and common mistakes</h2>
    <ul class="guide-list">
      ${g.tips.map((t) => `<li>${rich(t)}</li>`).join('\n      ')}
    </ul>
    <p class="guide-note">Guide reviewed ${REVIEWED}. ${(g.links || []).length ? 'Next steps: ' + g.links.map(link).join(' · ') : ''}</p>
  </div>`);
  out.push(END);
  return out.join('\n  ');
}

function insert(html, block, eol) {
  const stripped = html.replace(new RegExp(`[ \\t]*${START}[\\s\\S]*?${END}\\r?\\n?`, 'g'), '');
  const anchors = [
    /([ \t]*)<(?:div|section) class="content-section[^"]*"[^>]*>\s*<h2[^>]*>\s*Related(?: tools)?\s*<\/h2>/i,
    /([ \t]*)<(?:div|section) class="content-section[^"]*"[^>]*>\s*<h2[^>]*>\s*(?:Frequently asked|FAQ|Free PDF editor: questions)/i,
    /([ \t]*)<\/main>/i,
  ];
  for (let i = 0; i < anchors.length; i += 1) {
    const m = stripped.match(anchors[i]);
    if (m) {
      const indent = m[1] || '  ';
      const body = block.split('\n').map((l) => (l ? indent + l : l)).join(eol);
      return { html: stripped.slice(0, m.index) + body + eol + stripped.slice(m.index), anchor: i };
    }
  }
  return { html: stripped, anchor: -1 };
}

let changed = 0;
let stale = 0;
const fallback = [];
const missing = [];
for (const [key, g] of Object.entries(GUIDES)) {
  const file = path.join(ROOT, 'tools', key, 'index.html');
  if (!fs.existsSync(file)) {
    missing.push(key);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const eol = html.includes('\r\n') ? '\r\n' : '\n';
  const block = render(key, g).replace(/\r?\n/g, '\n');
  const res = insert(html, block, eol);
  if (res.anchor < 0) {
    missing.push(`${key} (no anchor)`);
    continue;
  }
  if (res.anchor > 0) fallback.push(`${key} (anchor ${res.anchor})`);
  if (res.html !== html) {
    stale += 1;
    if (!CHECK) {
      fs.writeFileSync(file, res.html);
      changed += 1;
    }
  }
}

console.log(`guides defined: ${Object.keys(GUIDES).length}`);
console.log(CHECK ? `stale pages: ${stale}` : `pages written: ${changed}`);
if (fallback.length) console.log('fallback anchors:', fallback.join(', '));
if (missing.length) console.log('MISSING:', missing.join(', '));
if (missing.length || (CHECK && stale)) process.exit(1);
