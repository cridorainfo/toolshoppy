// Static Railway runtime with one query-preserving redirect to each page's
// existing canonical URL. Tool processing stays in the browser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import serve from 'serve-handler';
import compression from 'compression';
import { handleLiveApi, startLiveApiRefresh, peekRates, peekFuel } from './lib/live-api.mjs';
import { snapshotTarget, renderRateSnapshot, SNAPSHOT_PLACEHOLDER } from './lib/rate-snapshot.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = 'https://toolshoppy.com';
const compress = promisify(compression());
export function createSiteServer({ root = ROOT } = {}) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'serve.json'), 'utf8'));
  const canonicalPaths = new Map();
  const files = new Map();
  const snapshotTemplates = new Map();
  const notFoundPage = fs.readFileSync(path.join(root, '404.html'));
  const adsTxt = fs.readFileSync(path.join(root, 'ads.txt'));
  const publicRootFiles = new Set(['/ads.txt', '/robots.txt', '/sitemap.xml', '/manifest.json', '/sw.js', '/favicon.ico', '/llms.txt', '/404.html']);
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
  // Templates are immutable for a deployment. Avoid blocking disk reads per visitor.
  for (const [route, file] of files) {
    if (!snapshotTarget(route)) continue;
    const template = fs.readFileSync(path.join(root, file), 'utf8');
    if (template.includes(SNAPSHOT_PLACEHOLDER)) snapshotTemplates.set(route, template);
  }
  for (const rule of config.redirects || []) canonicalPaths.set(rule.source, rule.destination);
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, ORIGIN);
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
      }
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end(); return; }
      // The repository is not a public document root. Reject hidden paths, Windows
      // separators, and encoded traversal before passing anything to serve-handler.
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) {
        res.writeHead(404, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }); res.end(); return;
      }
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
      // Serve the publisher record independently of clean-URL/static routing.
      // Short shared TTL prevents an old missing-file response lingering at the edge.
      if (pathname === '/ads.txt') {
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(req.method === 'HEAD' ? undefined : adsTxt); return;
      }
      if (target && (pathname !== target || url.pathname !== target)) {
        res.writeHead(301, { Location: target + url.search, 'Cache-Control': 'public, max-age=300' });
        res.end(); return;
      }
      // Rate pages: put today's figures into the HTML itself (crawlers do not run the page's
      // JavaScript). Renders nothing unless the cached data is live and fresh.
      const snapshot = files.has(pathname) ? snapshotTarget(pathname) : null;
      const template = snapshotTemplates.get(pathname);
      if (template) {
        const block = renderRateSnapshot(pathname, { rates: peekRates(), fuel: snapshot.kind === 'fuel' ? peekFuel(snapshot.state) : null });
        const body = template.replace(SNAPSHOT_PLACEHOLDER, block);
        await compress(req, res);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        });
        res.end(req.method === 'HEAD' ? undefined : body); return;
      }
      const publicAsset = pathname.startsWith('/assets/') && /\.(?:css|js|mjs|wasm|onnx|pdfium|woff2?|svg|png|jpe?g|webp|avif|ico|json|csv|pdf)$/i.test(pathname);
      if (!files.has(pathname) && !publicRootFiles.has(pathname) && !publicAsset) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
        res.end(req.method === 'HEAD' ? undefined : notFoundPage); return;
      }
      if (files.has(pathname)) req.url = files.get(pathname) + url.search;
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
