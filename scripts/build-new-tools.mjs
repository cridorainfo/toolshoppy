#!/usr/bin/env node
/**
 * Generates the static tool pages for the newer tools (password generator, JSON formatter,
 * Base64, case converter, unit converter, percentage calculator, compound interest, image
 * crop) from scripts/new-tools/*.mjs and registers them in the homepage catalog.
 *
 * Idempotent: re-running rewrites the same files. After running, refresh the derived pages:
 *   node scripts/improve-tool-seo-landing.mjs --hubs-only
 *   node scripts/prerender-home.mjs
 *   node scripts/regenerate-sitemap.mjs
 * (or `npm run build:tools`, which does all of it).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToolPage } from './lib/tool-page.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TOOLS = [
  ['password-generator', { id: 'password-generator', cat: 'misc', name: 'password generator strong random secure', icon: 'lock-access', tile: 'rose', title: 'Password Generator', desc: 'Strong random passwords' }],
  ['json-formatter', { id: 'json-formatter', cat: 'misc', name: 'json formatter validator beautifier minify', icon: 'file-text', tile: 'amber', title: 'JSON Formatter', desc: 'Format, validate, minify' }],
  ['base64', { id: 'base64', cat: 'misc', name: 'base64 encode decode image to base64 converter', icon: 'transform', tile: 'slate', title: 'Base64 Encode & Decode', desc: 'Text and files to Base64' }],
  ['case-converter', { id: 'case-converter', cat: 'misc', name: 'case converter uppercase lowercase title case camelcase snake', icon: 'text-size', tile: 'indigo', title: 'Case Converter', desc: 'camelCase, snake_case & more' }],
  ['unit-converter', { id: 'unit-converter', cat: 'misc', name: 'unit converter length weight area temperature tola cent acre', icon: 'scale', tile: 'teal', title: 'Unit Converter', desc: 'Length, weight, area & more' }],
  ['percentage-calculator', { id: 'percentage-calculator', cat: 'misc', name: 'percentage calculator percent of increase decrease discount', icon: 'calculator', tile: 'green', title: 'Percentage Calculator', desc: 'Percent of, change, add & subtract' }],
  ['compound-interest', { id: 'compound-interest-calculator', cat: 'finance', name: 'compound interest calculator savings investment growth deposits', icon: 'coin', tile: 'emerald', title: 'Compound Interest', desc: 'Growth with monthly deposits' }],
  ['image-crop', { id: 'image-crop', cat: 'image', name: 'crop image online cropper rotate flip photo square', icon: 'cut', tile: 'violet', title: 'Crop Image', desc: 'Crop, rotate & flip photos', badge: 'New' }],
];

let written = 0;
const catalogEntries = [];
for (const [file, entry] of TOOLS) {
  const spec = (await import(`./new-tools/${file}.mjs`)).default;
  const html = renderToolPage(spec);
  const out = path.join(ROOT, spec.path.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== html) { fs.writeFileSync(out, html); written++; }
  catalogEntries.push({ ...entry, href: spec.path });
}

// Register in the homepage catalog (the single source for the home grid, hubs and search).
const indexFile = path.join(ROOT, 'index.html');
let home = fs.readFileSync(indexFile, 'utf8');
const EOL = home.includes('\r\n') ? '\r\n' : '\n';
const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const line = e => `    { id: ${q(e.id)}, href: ${q(e.href)}, cat: ${q(e.cat)}, name: ${q(e.name)}, icon: ${q(e.icon)}, tile: ${q(e.tile)}, title: ${q(e.title)}, desc: ${q(e.desc)}${e.badge ? `, badge: ${q(e.badge)}` : ''} }`;
let added = 0;
for (const e of catalogEntries) {
  if (home.includes(`id: '${e.id}'`)) continue;
  // Insert after the last existing entry of the same category so related tools stay grouped.
  const re = new RegExp(`(\\n    \\{ id: '[^']+', href: '/tools/[^']+', cat: '${e.cat}',[^\\r\\n]*\\})(,?)(?=\\r?\\n)`, 'g');
  let last = null, m;
  while ((m = re.exec(home))) last = m;
  if (!last) throw new Error(`No existing ${e.cat} entries in the catalog`);
  const at = last.index + last[1].length;
  const needsComma = last[2] === '';
  // If the last entry had no trailing comma it was the final array element; keep the array valid.
  home = home.slice(0, at) + (needsComma ? ',' : last[2]) + EOL + line(e) + (needsComma ? '' : ',') + home.slice(at + last[2].length);
  added++;
}
// Keep the "Calculators" group on the homepage for the two general calculators filed under misc.
home = home.replace(
  /\['age-calculator', 'bmi-calculator', 'timezone-converter'\]\.includes\(t\.id\)/,
  "['age-calculator', 'bmi-calculator', 'timezone-converter', 'percentage-calculator', 'unit-converter'].includes(t.id)"
);
if (home !== fs.readFileSync(indexFile, 'utf8')) fs.writeFileSync(indexFile, home);
console.log(`Tool pages written: ${written}/${TOOLS.length}. Catalog entries added: ${added}.`);
