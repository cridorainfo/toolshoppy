#!/usr/bin/env node
/**
 * Regenerate sitemap.xml from on-disk HTML pages with accurate lastmod
 * (git last-commit date, falling back to file mtime).
 * Skips doorway free-online / online paths and noindex pages.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://toolshoppy.com';
let modified = new Set();
try {
  modified = new Set(execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim().split(/\r?\n/));
} catch { /* Exported checkouts may not include git history. */ }

function gitLastmod(relPath) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', relPath], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function fileLastmod(abs) {
  try {
    return fs.statSync(abs).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function lastmodFor(urlPath) {
  let rel;
  if (urlPath === '/') rel = 'index.html';
  else if (urlPath.endsWith('.html')) rel = urlPath.replace(/^\//, '');
  else {
    const clean = urlPath.replace(/^\//, '').replace(/\/$/, '');
    // Root HTML pages served via cleanUrls: /about → about.html
    const rootHtml = path.join(ROOT, `${clean}.html`);
    if (fs.existsSync(rootHtml)) rel = `${clean}.html`;
    else rel = `${clean}/index.html`;
  }
  return (!modified.has(rel) && gitLastmod(rel)) || fileLastmod(path.join(ROOT, rel));
}

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') || ['node_modules', 'assets', 'scripts', 'docs', 'api', '_workers', 'worker', 'functions', 'libs'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(full, out);
    else if (ent.name === 'index.html' || (ent.name.endsWith('.html') && ent.name !== '404.html')) {
      out.push(full);
    }
  }
  return out;
}

const files = walkHtml(ROOT);
const urls = [];
for (const abs of files) {
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  if (rel.includes('/free-online/') || /\/online\//.test(rel) || rel.endsWith('/online/index.html')) continue;
  if (rel === 'search/index.html') continue;
  const html = fs.readFileSync(abs, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
  if (metas.some(m => /^(robots|googlebot)$/i.test(m.name || '') && /\b(noindex|none)\b/i.test(m.content || ''))) continue;
  let urlPath;
  if (rel === 'index.html') urlPath = '/';
  else if (rel.endsWith('/index.html')) urlPath = '/' + rel.slice(0, -'index.html'.length);
  else if (rel.endsWith('.html') && !rel.includes('/')) {
    // Match the self-canonical used on root HTML pages.
    urlPath = '/' + rel.slice(0, -'.html'.length) + '/';
  } else urlPath = '/' + rel;
  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0])).filter(t => t.rel?.toLowerCase() === 'canonical');
  if (canonicals.length !== 1) throw new Error(`Expected one canonical in ${rel}`);
  // A page canonicalized elsewhere is not a separate sitemap entry.
  if (canonicals[0].href !== BASE + urlPath) continue;
  urls.push(urlPath);
}

urls.sort((a, b) => {
  const rank = (p) => {
    if (p === '/') return 0;
    if (p.startsWith('/tools/')) return 1;
    if (p.startsWith('/blog')) return 2;
    return 3;
  };
  const d = rank(a) - rank(b);
  return d !== 0 ? d : a.localeCompare(b);
});

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const p of urls) {
  // Google ignores priority/changefreq. Neither can make a tool outrank Home.
  xml += `  <url><loc>${BASE}${p}</loc><lastmod>${lastmodFor(p)}</lastmod></url>\n`;
}
xml += '</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log('Wrote sitemap.xml with', urls.length, 'URLs (no doorway pages)');
