#!/usr/bin/env node
/**
 * Regenerate sitemap.xml from on-disk HTML pages with accurate lastmod
 * (git last-commit date, falling back to file mtime).
 * Skips doorway free-online / online paths and noindex pages.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://toolshoppy.com';

function gitLastmod(relPath) {
  try {
    const out = execSync(`git log -1 --format=%cs -- ${JSON.stringify(relPath)}`, {
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
  else rel = urlPath.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
  return gitLastmod(rel) || fileLastmod(path.join(ROOT, rel));
}

function walkHtml(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'assets', 'scripts', 'worker', 'functions', 'libs'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(full, out);
    else if (ent.name === 'index.html' || (ent.name.endsWith('.html') && ent.name !== '404.html')) {
      out.push(full);
    }
  }
  return out;
}

function priorityFor(p) {
  if (p === '/') return 1.0;
  if (p.startsWith('/blog/')) return 0.75;
  if (p === '/blog/') return 0.85;
  if (p.startsWith('/tools/rates/')) return 0.9;
  if (p.startsWith('/tools/pdf/') || p.startsWith('/tools/video/')) return 0.9;
  if (p.startsWith('/tools/')) return 0.85;
  if (['/privacy.html', '/terms.html', '/about.html', '/contact.html'].includes(p)) return 0.3;
  return 0.8;
}

function changefreqFor(p) {
  if (p.startsWith('/tools/rates/')) return 'daily';
  if (p === '/' || p === '/blog/') return 'weekly';
  if (['/privacy.html', '/terms.html', '/about.html', '/contact.html'].includes(p)) return 'yearly';
  return 'monthly';
}

const files = walkHtml(ROOT);
const urls = [];
for (const abs of files) {
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  if (rel.includes('/free-online/') || /\/online\//.test(rel) || rel.endsWith('/online/index.html')) continue;
  if (rel === 'search/index.html') continue;
  let urlPath;
  if (rel === 'index.html') urlPath = '/';
  else if (rel.endsWith('/index.html')) urlPath = '/' + rel.slice(0, -'index.html'.length);
  else urlPath = '/' + rel;
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
  xml += `  <url><loc>${BASE}${p}</loc><lastmod>${lastmodFor(p)}</lastmod><changefreq>${changefreqFor(p)}</changefreq><priority>${priorityFor(p)}</priority></url>\n`;
}
xml += '</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log('Wrote sitemap.xml with', urls.length, 'URLs (no doorway pages)');
