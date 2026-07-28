#!/usr/bin/env node
/**
 * Cache-bust favicon / apple-touch / PWA icon URLs and ensure
 * a root favicon.ico <link> exists on every HTML page.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const V = '2';

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'assets'].includes(ent.name) && dir === ROOT) {
      // still walk assets/templates
    }
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (/\.(html|json)$/.test(ent.name)) out.push(full);
  }
  return out;
}

function bust(html) {
  let out = html;
  out = out.replace(/\/assets\/img\/favicon\.svg(\?v=\d+)?/g, `/assets/img/favicon.svg?v=${V}`);
  out = out.replace(/\/assets\/img\/favicon-32\.png(\?v=\d+)?/g, `/assets/img/favicon-32.png?v=${V}`);
  out = out.replace(/\/assets\/img\/icon-192\.png(\?v=\d+)?/g, `/assets/img/icon-192.png?v=${V}`);
  out = out.replace(/\/assets\/img\/icon-512\.png(\?v=\d+)?/g, `/assets/img/icon-512.png?v=${V}`);
  out = out.replace(/\/assets\/img\/logo\.png(\?v=\d+)?/g, `/assets/img/logo.png?v=${V}`);
  return out;
}

function ensureIcoLink(html) {
  if (!html.includes('<head')) return html;
  if (/href="\/favicon\.ico/.test(html)) {
    return html.replace(/href="\/favicon\.ico(\?v=\d+)?"/g, `href="/favicon.ico?v=${V}"`);
  }
  // Insert before existing favicon.svg link, or before </head>
  const ico = `<link rel="icon" href="/favicon.ico?v=${V}" sizes="any">`;
  if (/<link[^>]+rel="icon"[^>]+favicon\.svg/.test(html)) {
    return html.replace(/(<link[^>]+rel="icon"[^>]+favicon\.svg[^>]*>)/, `${ico}\n$1`);
  }
  if (/<link[^>]+href="\/assets\/img\/favicon\.svg/.test(html)) {
    return html.replace(/(<link[^>]+href="\/assets\/img\/favicon\.svg[^>]*>)/, `${ico}\n$1`);
  }
  return html.replace('</head>', `${ico}\n</head>`);
}

let n = 0;
for (const file of walk(ROOT)) {
  // Skip node_modules already, also skip package-lock if any
  if (file.includes(`${path.sep}node_modules${path.sep}`)) continue;
  let text = fs.readFileSync(file, 'utf8');
  if (!/favicon|icon-192|icon-512|apple-touch|logo\.png|manifest/.test(text) && !file.endsWith('.html')) {
    continue;
  }
  const before = text;
  text = bust(text);
  if (file.endsWith('.html')) text = ensureIcoLink(text);
  if (text !== before) {
    fs.writeFileSync(file, text);
    n++;
    console.log('updated', path.relative(ROOT, file));
  }
}

// manifest.json explicit update
const manPath = path.join(ROOT, 'manifest.json');
const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
man.icons = [
  { src: `/favicon.ico?v=${V}`, sizes: '48x48', type: 'image/x-icon', purpose: 'any' },
  { src: `/assets/img/favicon.svg?v=${V}`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
  { src: `/assets/img/icon-192.png?v=${V}`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
  { src: `/assets/img/icon-512.png?v=${V}`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
];
man.theme_color = '#E11D48';
fs.writeFileSync(manPath, JSON.stringify(man, null, 2) + '\n');
console.log('updated manifest.json');
console.log(`Done. ${n} files patched (+ manifest).`);
