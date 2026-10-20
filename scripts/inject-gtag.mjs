#!/usr/bin/env node
/** Inject the GA4 dataLayer stub (gtag.js itself is loaded by /assets/js/third-party.js) into <head> of all HTML pages (once). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const GA_ID = 'G-PNN1LM2D9Q';
const MARKER = "function gtag()";
const SNIPPET = `
<!-- Google tag (gtag.js) — loaded later by /assets/js/third-party.js -->
<script defer src="/assets/js/third-party.js?v=1"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

let updated = 0;
for (const file of walk(ROOT)) {
  if (file.includes(`${path.sep}node_modules${path.sep}`)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARKER)) continue;
  if (!html.includes('<head>')) continue;
  html = html.replace('<head>', '<head>' + SNIPPET);
  fs.writeFileSync(file, html);
  updated++;
  console.log('  +', path.relative(ROOT, file));
}
console.log(`Done. Updated ${updated} files.`);
