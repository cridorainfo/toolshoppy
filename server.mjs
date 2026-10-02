// Static Railway runtime with one query-preserving redirect to each page's
// existing canonical URL. Tool processing stays in the browser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import serve from 'serve-handler';
import compression from 'compression';
import { handleLiveApi, startLiveApiRefresh } from './lib/live-api.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = 'https://toolshoppy.com';
const compress = promisify(compression());
export function createSiteServer({ root = ROOT } = {}) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'serve.json'), 'utf8'));
  const canonicalPaths = new Map();
  const files = new Map();
  function addFile(file) {
    if (!file.endsWith('.html') || file === '404.html') return;
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    if (!canonical?.startsWith(ORIGIN + '/')) return;
    const target = new URL(canonical).pathname;
    const ownPath = file === 'index.html' ? '/' : file.endsWith('/index.html') ? '/' + file.slice(0, -10) : '/' + file.slice(0, -5) + '/';
    // Resolve aliases against their own file, even if a future page is canonicalized elsewhere.
    for (const variant of new Set([ownPath, ownPath.replace(/\/$/, '') || '/', '/' + file, '/' + file.replace(/\.html$/, '')])) canonicalPaths.set(variant, target);
    if (target === ownPath) files.set(target, '/' + file);
  }
  function walk(dir) {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const file = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else addFile(file);
    }
  }
  fs.readdirSync(root).filter(f => f.endsWith('.html')).forEach(addFile);
  ['tools', 'blog', 'search'].forEach(walk);
  for (const rule of config.redirects || []) canonicalPaths.set(rule.source, rule.destination);
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, ORIGIN);
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
      }
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end(); return; }
      const api = await handleLiveApi(pathname, url.searchParams);
      if (api) {
        const body = JSON.stringify(api.body);
        res.writeHead(api.status, {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body),
          'Cache-Control': api.maxAge ? `public, max-age=${api.maxAge}` : 'no-store',
          'Access-Control-Allow-Origin': '*',
          'X-Robots-Tag': 'noindex',
        });
        res.end(req.method === 'HEAD' ? undefined : body); return;
      }
      const target = canonicalPaths.get(pathname);
      if (target && (pathname !== target || url.pathname !== target)) {
        res.writeHead(301, { Location: target + url.search, 'Cache-Control': 'public, max-age=300' });
        res.end(); return;
      }
      if (files.has(pathname)) req.url = files.get(pathname) + url.search;
      if (/^\/(scripts|docs|functions|lib|worker|_workers|node_modules)(\/|$)|^\/[^/]+\.(md|mjs)$/i.test(pathname)) res.setHeader('X-Robots-Tag', 'noindex');
      await compress(req, res);
      await serve(req, res, { ...config, public: root, cleanUrls: false, redirects: [], directoryListing: false });
    } catch (error) {
      console.error('Request failed:', error.message);
      if (!res.headersSent) res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 3000);
  createSiteServer().listen(port, '0.0.0.0', () => {
    console.log(`ToolShoppy listening on port ${port}`);
    startLiveApiRefresh();
  });
}
