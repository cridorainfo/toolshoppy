#!/usr/bin/env node
// Read-only checks of the static site and, optionally, its HTTP responses.
// node scripts/audit-seo.mjs [--live https://toolshoppy.com] [--output report.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isThinPage } from './lib/page-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://toolshoppy.com';
const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const liveOrigin = option('--live');
const output = option('--output');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const stripComments = html => html.replace(/<!--[\s\S]*?-->/g, '');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map(m => attrs(m[0]));
const visibleSource = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
const textOnly = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
function inspect(html) {
  html = stripComments(html);
  const meta = tags(html, 'meta');
  const body = visibleSource(html).split(/<body\b[^>]*>/i)[1] || '';
  const jsonErrors = [];
  const schemas = [];
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const parsed = JSON.parse(m[1]); schemas.push(...(Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed])); } catch (e) { jsonErrors.push(e.message); }
  }
  return {
    title: textOnly(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''),
    descriptions: meta.filter(m => m.name === 'description').map(m => m.content),
    robots: meta.filter(m => /^(robots|googlebot)$/i.test(m.name || '')).map(m => m.content).join(', '),
    canonicals: tags(html, 'link').filter(t => t.rel === 'canonical').map(t => t.href),
    h1: [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => textOnly(m[1])),
    words: textOnly(body).split(/\s+/).filter(Boolean).length,
    links: tags(body, 'a').map(t => t.href).filter(Boolean),
    assets: [...tags(html.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>'), 'script').map(t => t.src), ...tags(visibleSource(html), 'img').map(t => t.src), ...tags(visibleSource(html), 'link').filter(t => /stylesheet|icon/.test(t.rel || '')).map(t => t.href)].filter(Boolean),
    jsonErrors,
    schemas,
    headings: [...body.matchAll(/<h([1-6])\b/gi)].map(m => Number(m[1])),
    images: tags(body, 'img'),
    breadcrumbUI: /<nav\b[^>]*aria-label=["']Breadcrumb["']/i.test(body),
    authorBio: /class=["'][^"']*author-bio/.test(body),
  };
}
function walk(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e => {
    const rel = path.posix.join(dir, e.name);
    return e.isDirectory() ? walk(rel) : e.name.endsWith('.html') ? [rel] : [];
  });
}
const files = [...fs.readdirSync(root).filter(f => f.endsWith('.html')), ...['tools', 'blog', 'search'].flatMap(walk)];
const route = file => file === 'index.html' ? '/' : file.endsWith('/index.html') ? '/' + file.slice(0, -10) : '/' + file.replace(/\.html$/, '') + '/';
const resolveFile = pathname => {
  const rel = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '');
  return [rel, rel + '.html', path.posix.join(rel, 'index.html')].find(f => fs.existsSync(path.join(root, f)) && fs.statSync(path.join(root, f)).isFile());
};
const sitemapUrls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const sitemapSet = new Set(sitemapUrls);
const redirects = JSON.parse(read('serve.json')).redirects || [];
const redirectSources = new Set(redirects.map(r => r.source.replace(/\/$/, '')));
const errors = [];
const pages = files.map(file => ({ file, path: route(file), ...inspect(read(file)) }));
const indexable = pages.filter(p => !/noindex|\bnone\b/i.test(p.robots) && p.file !== '404.html');
for (const p of pages) {
  if (!['404.html', 'search/index.html'].includes(p.file) && !isThinPage(p.file) && /noindex|\bnone\b/i.test(p.robots)) errors.push({ type: 'unexpected-noindex', file: p.file });
  // Thin district pages must stay noindex: they repeat the statewide rate (scripts/lib/page-policy.mjs).
  if (isThinPage(p.file) && !/noindex/i.test(p.robots)) errors.push({ type: 'thin-page-indexable', file: p.file });
}
if (!/User-agent:\s*\*[\s\S]*Allow:\s*\//i.test(read('robots.txt')) || /Disallow:\s*\S+/i.test(read('robots.txt')) || !read('robots.txt').includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) errors.push({ type: 'robots-policy' });
for (const p of indexable) {
  if (!p.title) errors.push({ type: 'missing-title', file: p.file });
  if (p.descriptions.length !== 1) errors.push({ type: 'description-count', file: p.file, count: p.descriptions.length });
  if (p.h1.length !== 1) errors.push({ type: 'h1-count', file: p.file, count: p.h1.length });
  if (p.canonicals.length !== 1 || p.canonicals[0] !== canonicalOrigin + p.path) errors.push({ type: 'canonical-mismatch', file: p.file, canonical: p.canonicals });
  if (!sitemapSet.has(canonicalOrigin + p.path)) errors.push({ type: 'missing-from-sitemap', file: p.file });
  p.jsonErrors.forEach(error => errors.push({ type: 'invalid-json-ld', file: p.file, error }));
  if (!p.schemas.length) errors.push({ type: 'missing-schema', file: p.file });
  if (p.headings.some((level, i) => level > 4 || (i > 0 && level > p.headings[i - 1] + 1))) errors.push({ type: 'heading-order', file: p.file });
  for (const img of p.images) {
    if (!Object.hasOwn(img, 'alt') || !(Number(img.width) > 0 && Number(img.height) > 0)) errors.push({ type: 'image-accessibility-or-dimensions', file: p.file, image: img.src || img.id });
  }
  const breadcrumb = p.schemas.find(s => s['@type'] === 'BreadcrumbList');
  if (p.path !== '/' && (!breadcrumb || !p.breadcrumbUI)) errors.push({ type: 'missing-breadcrumb', file: p.file });
  if (breadcrumb && (!Array.isArray(breadcrumb.itemListElement) || breadcrumb.itemListElement.some((item, i) => item.position !== i + 1 || !item.name || !item.item?.startsWith(canonicalOrigin + '/')))) errors.push({ type: 'invalid-breadcrumb', file: p.file });
  const article = p.schemas.find(s => ['Article', 'BlogPosting'].includes(s['@type']));
  if (article && (!p.authorBio || !article.author?.name || !article.author?.url)) errors.push({ type: 'missing-article-attribution', file: p.file });
}
for (const rule of redirects) {
  if (redirects.some(next => next.source === rule.destination) || !indexable.some(p => p.path === rule.destination)) errors.push({ type: 'redirect-chain-or-invalid-destination', source: rule.source, destination: rule.destination });
}
for (const p of pages) {
  for (const [kind, values] of [['link', p.links], ['asset', p.assets]]) {
    for (const value of new Set(values)) {
      let url;
      try { url = new URL(value.replace(/&amp;/g, '&'), canonicalOrigin + p.path); } catch { continue; }
      if (url.origin !== canonicalOrigin) continue;
      if (resolveFile(url.pathname) || (kind === 'link' && redirectSources.has(url.pathname.replace(/\/$/, '')))) continue;
      errors.push({ type: 'broken-' + kind, file: p.file, target: url.pathname });
    }
  }
}
for (const url of sitemapUrls) {
  const p = pages.find(p => canonicalOrigin + p.path === url);
  if (!p || /noindex|\bnone\b/i.test(p.robots)) errors.push({ type: 'invalid-sitemap-entry', url });
}
if (sitemapSet.size !== sitemapUrls.length) errors.push({ type: 'duplicate-sitemap-urls' });
const reachable = new Set(['/']);
for (let changed = true; changed;) {
  changed = false;
  for (const p of pages.filter(p => reachable.has(p.path))) {
    for (const value of p.links) {
      let u;
      try { u = new URL(value, canonicalOrigin + p.path); } catch { continue; }
      if (u.origin !== canonicalOrigin) continue;
      const file = resolveFile(u.pathname);
      const dest = file && pages.find(p => p.file === file)?.path;
      if (dest && !reachable.has(dest)) { reachable.add(dest); changed = true; }
    }
  }
}
const duplicates = field => Object.entries(Object.groupBy(indexable, p => field === 'description' ? p.descriptions[0] : p[field])).filter(([k, v]) => k && v.length > 1).map(([value, group]) => ({ value, pages: group.map(p => p.path) }));
const report = {
  checkedAt: new Date().toISOString(),
  summary: { htmlPages: pages.length, indexablePages: indexable.length, sitemapUrls: sitemapUrls.length, errorCount: errors.length },
  errors,
  orphanPages: indexable.filter(p => !reachable.has(p.path)).map(p => p.path),
  duplicateTitles: duplicates('title'), duplicateDescriptions: duplicates('description'),
  pages,
};
for (const field of ['orphanPages', 'duplicateTitles', 'duplicateDescriptions']) {
  for (const value of report[field]) errors.push({ type: field, value });
}
report.summary.errorCount = errors.length;

async function fetchChain(url, userAgent = 'ToolShoppy-SEO-Audit/1.0') {
  const chain = [], seen = new Set();
  try {
    for (let hop = 0; hop < 8; hop++) {
      if (seen.has(url)) return { chain, error: 'redirect-loop' };
      seen.add(url);
      const start = performance.now();
      const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': userAgent } });
      const body = await response.text();
      const headers = Object.fromEntries(['content-type', 'x-robots-tag', 'location', 'cf-mitigated', 'cache-control'].map(k => [k, response.headers.get(k)]).filter(([, v]) => v));
      chain.push({ url, status: response.status, milliseconds: Math.round(performance.now() - start), bytes: Buffer.byteLength(body), headers });
      if ([301, 302, 303, 307, 308].includes(response.status) && headers.location) { url = new URL(headers.location, url).href; continue; }
      return { chain, page: /text\/html/.test(headers['content-type']) ? inspect(body) : undefined, text: /xml|text\/plain/.test(headers['content-type']) ? body : undefined };
    }
    return { chain, error: 'too-many-redirects' };
  } catch (e) { return { chain, error: e.message }; }
}
if (liveOrigin) {
  const remoteSitemap = await fetchChain(new URL('/sitemap.xml', liveOrigin).href);
  const remoteUrls = [...(remoteSitemap.text || '').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const paths = [...new Set([...remoteUrls.map(u => new URL(u).pathname), ...sitemapUrls.map(u => new URL(u).pathname), '/robots.txt', '/search/', '/search/?q=pdfmerge', '/tools/pdf/merge', '/tools/pdf/merge/index.html', '/pdf-merge/', '/about', '/about.html', '/audit-missing-page-20260912'])];
  let next = 0;
  const responses = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < paths.length) {
      const pathname = paths[next++];
      const result = await fetchChain(new URL(pathname, liveOrigin).href);
      responses.push({ path: pathname, ...result });
    }
  }));
  report.live = { origin: liveOrigin, sitemap: remoteSitemap, responses: responses.sort((a,b) => a.path.localeCompare(b.path)),
    // A UA simulation cannot prove that requests from genuine Googlebot IPs are allowed.
    simulatedGooglebot: await fetchChain(new URL('/tools/pdf/merge/', liveOrigin).href, 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)') };
  report.summary.liveChecked = responses.length;
  report.summary.liveErrors = responses.filter(r => r.error || (r.chain.at(-1)?.status !== 200 && r.path !== '/audit-missing-page-20260912')).map(r => ({ path: r.path, error: r.error, status: r.chain.at(-1)?.status }));
  report.summary.liveIndexabilityErrors = responses.filter(r => sitemapSet.has(canonicalOrigin + r.path) && (r.page?.canonicals?.[0] !== canonicalOrigin + r.path || /noindex|\bnone\b/i.test(r.page?.robots || '') || /noindex|\bnone\b/i.test(r.chain.at(-1)?.headers['x-robots-tag'] || '') || r.page?.jsonErrors?.length)).map(r => r.path);
  report.live.originVariants = new URL(liveOrigin).origin === canonicalOrigin
    ? await Promise.all(['http://toolshoppy.com/', 'https://www.toolshoppy.com/', 'http://www.toolshoppy.com/tools/pdf/merge'].map(async url => ({ url, ...await fetchChain(url) })))
    : [];
  report.summary.liveRedirectChainErrors = [...responses, ...report.live.originVariants].filter(r => r.chain.length > 2).map(r => ({ path: r.path || r.url, hops: r.chain.length - 1 }));
}
if (output) fs.writeFileSync(path.resolve(output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report.summary, orphanPages: report.orphanPages, duplicateTitles: report.duplicateTitles, duplicateDescriptions: report.duplicateDescriptions, errors: report.errors, output }, null, 2));
process.exitCode = errors.length || report.summary.liveErrors?.length || report.summary.liveIndexabilityErrors?.length || report.summary.liveRedirectChainErrors?.length ? 1 : 0;
