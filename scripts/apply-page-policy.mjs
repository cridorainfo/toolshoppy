#!/usr/bin/env node
/**
 * Applies the site-wide page policy to the static HTML (idempotent):
 *   1. every page gets a footer with About / Contact / Privacy / Terms links
 *   2. ad-free pages (hubs, legal, error, thin district pages) lose their ad slots and are
 *      marked <meta name="ts-ads" content="off"> so no script adds ads back
 *   3. thin district pages are noindex,follow
 *   4. the AdSense <script async> tag is present (static mode) or absent (deferred mode)
 *      according to scripts/lib/page-policy.mjs
 *
 *   node scripts/apply-page-policy.mjs              # apply the mode set in page-policy.mjs
 *   node scripts/apply-page-policy.mjs deferred     # switch mode (rewrites page-policy.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADSENSE_MODE, ADSENSE_TAG, isAdFree, isThinPage, siteFooter } from './lib/page-policy.mjs';
import { snapshotTarget, SNAPSHOT_PLACEHOLDER } from '../lib/rate-snapshot.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2];
let mode = ADSENSE_MODE;
if (arg) {
  if (!['static', 'deferred'].includes(arg)) throw new Error('Mode must be "static" or "deferred".');
  mode = arg;
  const policyFile = path.join(ROOT, 'scripts/lib/page-policy.mjs');
  const src = fs.readFileSync(policyFile, 'utf8');
  const next = src.replace(/export const ADSENSE_MODE = '[a-z]+';/, `export const ADSENSE_MODE = '${mode}';`);
  if (next !== src) fs.writeFileSync(policyFile, next);
}

const SKIP = new Set(['node_modules', 'assets', 'scripts', 'docs', 'api', 'artifacts', 'lib', 'worker', 'functions', '_workers', 'libs']);
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.startsWith('.') || e.name.startsWith('toolshoppy.com-')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(ROOT);

// Remove <div class="ad-slot ..."> ... </div> blocks. Slots contain only a label or an <ins>,
// never nested divs, so a lazy match to the first closing </div> is exact.
const AD_SLOT = /[ \t]*<div class="ad-slot[^"]*"[^>]*>[\s\S]*?<\/div>[ \t]*\r?\n?/g;
const ADS_OFF_META = '<meta name="ts-ads" content="off">';
const ADSENSE_TAG_RE = /<script async src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=[^"]+"[^>]*><\/script>\r?\n?/g;
const THIRD_PARTY_RE = /<script defer src="\/assets\/js\/third-party\.js[^"]*"><\/script>/;

let changed = 0;
const stats = { footer: 0, adFree: 0, noindex: 0, adsenseTag: 0, snapshot: 0 };
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const before = fs.readFileSync(file, 'utf8');
  // Preserve line endings exactly. Pure-CRLF files are edited as LF and converted back; files
  // with mixed endings (the prerendered homepage) are edited in place so untouched lines keep theirs.
  const hasCRLF = before.includes('\r\n');
  const mixed = hasCRLF && /(^|[^\r])\n/.test(before);
  let html = mixed ? before : before.replace(/\r\n/g, '\n');

  // 1. footer with trust-page links (the homepage already has a full footer)
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
  if (footer && !/href="\/privacy\/?"/.test(footer[0])) {
    html = html.replace(footer[0], siteFooter(2026));
    stats.footer++;
  }

  const adFree = isAdFree(rel);
  // 2. ad-free pages: no slots, explicit marker
  if (adFree) {
    html = html.replace(AD_SLOT, '');
    if (!html.includes(ADS_OFF_META)) html = html.replace('</head>', `${ADS_OFF_META}\n</head>`);
    stats.adFree++;
  } else {
    html = html.replace(new RegExp(`${ADS_OFF_META}\\n?`, 'g'), '');
  }

  // 3. thin pages: noindex,follow (never index; still crawlable for link discovery)
  if (isThinPage(rel)) {
    html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, follow">');
    stats.noindex++;
  }

  // 3b. rate pages: placeholder that server.mjs fills with today's figures (lib/rate-snapshot.mjs)
  if (snapshotTarget('/' + rel.replace(/index\.html$/, '')) && !html.includes(SNAPSHOT_PLACEHOLDER)) {
    const anchor = html.match(/^[ \t]*<div class="ad-slot ad-top">/m);
    if (anchor) { html = html.replace(anchor[0], `  ${SNAPSHOT_PLACEHOLDER}\n${anchor[0]}`); stats.snapshot++; }
  }

  // 4. AdSense tag according to mode; never on ad-free/noindex pages
  html = html.replace(ADSENSE_TAG_RE, '');
  if (mode === 'static' && !adFree && THIRD_PARTY_RE.test(html)) {
    html = html.replace(THIRD_PARTY_RE, m => `${ADSENSE_TAG}\n${m}`);
    stats.adsenseTag++;
  }

  const out = hasCRLF && !mixed ? html.replace(/\n/g, '\r\n') : html;
  if (out !== before) { fs.writeFileSync(file, out); changed++; }
}
console.log(`AdSense mode: ${mode}. Files changed: ${changed}. ` + JSON.stringify(stats));
