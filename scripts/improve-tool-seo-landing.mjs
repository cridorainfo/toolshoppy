#!/usr/bin/env node
/**
 * Tool-first SEO: category hubs, related-tool links, breadcrumb hubs,
 * and search UX that stays off the homepage when users land on a tool.
 *
 * Usage: node scripts/improve-tool-seo-landing.mjs
 * Idempotent — safe to re-run.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORY } from './tool-seo-config.mjs';
import { readToolCatalog } from './site-catalog.mjs';
import { HUB_GUIDES } from './service-search-content.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = path.join(ROOT, 'tools');
const TODAY = new Date().toISOString().slice(0, 10);

/** Top-level tools shown on hubs + related blocks (path key → meta). */
const CATALOG = readToolCatalog();

const HUB_COPY = {
  image: {
    title: 'Free Image Tools Online — Compress, Convert, Resize | ToolShoppy',
    description: 'Free image tools: compress images, convert HEIC/JPG/PNG, govt photo resize, OCR, background remove. No signup — files stay on your device.',
    h1: 'Free Image Tools',
    sub: 'Compress, convert, resize, and edit photos in your browser — private and free.',
  },
  pdf: {
    title: 'Free PDF Tools Online — Merge, Compress, Convert | ToolShoppy',
    description: 'Free PDF tools: merge, split, compress, Word↔PDF, editor, unlock, protect. No signup — PDFs never leave your device.',
    h1: 'Free PDF Tools',
    sub: 'Merge, compress, convert, and edit PDFs privately in your browser. Editing and downloads are free—no signup or watermark.',
  },
  video: {
    title: 'Free Video Tools Online — Compress, Trim, MP3 | ToolShoppy',
    description: 'Free video tools: compress MP4, trim clips, extract MP3, split WhatsApp status. No signup — processing stays in your browser.',
    h1: 'Free Video Tools',
    sub: 'Compress, trim, and convert video without uploading to a server.',
  },
  finance: {
    title: 'Free Finance Calculators India & UAE | ToolShoppy',
    description: 'Free EMI, GST, income tax, SIP, FD, salary, and UAE VAT calculators. No signup — runs in your browser.',
    h1: 'Free Finance Calculators',
    sub: 'EMI, tax, GST, SIP, FD, salary, and UAE VAT — instant browser calculators.',
  },
  rates: {
    title: 'Gold, Silver, Petrol & Currency Rates Today | ToolShoppy',
    description: 'Check gold rate, silver rate, petrol price, and AED–INR currency today. Free daily rates for India and UAE.',
    h1: 'Rates & Live Converters',
    sub: 'Gold, silver, petrol, and Gulf↔India currency — free daily reference pages.',
  },
  misc: {
    title: 'Free Utility Tools — QR, WhatsApp, BMI & More | ToolShoppy',
    description: 'Free utilities: QR generator, URL shortener, word counter, WhatsApp link, BMI, age calculator, and more. No signup.',
    h1: 'More Free Tools',
    sub: 'QR codes, WhatsApp links, counters, converters — quick utilities, no account.',
  },
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else if (ent.name === 'index.html') out.push(full);
  }
  return out;
}

function keyFromFile(abs) {
  return path.relative(TOOLS, path.dirname(abs)).split(path.sep).join('/');
}

function categoryOf(key) {
  return key.split('/')[0];
}

function relatedFor(key) {
  const cat = categoryOf(key);
  const siblings = CATALOG.filter((t) => t.key.startsWith(`${cat}/`) && t.key !== key && !key.startsWith(t.key + '/'));
  // Prefer siblings that are not the current parent tool for nested pages
  const parentKey = key.split('/').slice(0, 2).join('/');
  let list = siblings.filter((t) => t.key !== parentKey || key === parentKey);
  if (key.includes('/') && key.split('/').length > 2) {
    // Nested landing: include parent + other siblings
    const parent = CATALOG.find((t) => t.key === parentKey);
    list = [parent, ...siblings.filter((t) => t.key !== parentKey)].filter(Boolean);
  }
  return list.slice(0, 4);
}

function relatedHtml(items) {
  const links = items
    .map(
      (t) => `      <a href="/tools/${t.key}/">
        <span class="icon-tile icon-tile--sm icon-tile--${t.tile}"><svg class="icon-svg" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#${t.icon}"></use></svg></span>
        ${esc(t.title)}
        <span class="related-desc">${esc(t.desc)}</span>
      </a>`
    )
    .join('\n');
  return `  <div class="content-section seo-related">
    <h2>Related tools</h2>
    <div class="related-tools">
${links}
    </div>
  </div>`;
}

function hubPageHtml(cat, tools) {
  const copy = HUB_COPY[cat];
  const catMeta = CATEGORY[cat] || { label: cat };
  const url = `https://toolshoppy.com/tools/${cat}/`;
  const cards = tools
    .map(
      (t) => `      <a class="tool-card" href="/tools/${t.key}/">
        <div class="icon"><span class="icon-tile icon-tile--${t.tile}"><svg class="icon-svg" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#${t.icon}"></use></svg></span></div>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.desc)}</p>
      </a>`
    )
    .join('\n');
  const itemList = tools.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.title,
    url: `https://toolshoppy.com/tools/${t.key}/`,
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: copy.h1,
    url,
    description: copy.description,
    isPartOf: { '@type': 'WebSite', name: 'ToolShoppy', url: 'https://toolshoppy.com/' },
    mainEntity: { '@type': 'ItemList', itemListElement: itemList },
  };
  const crumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolshoppy.com/' },
      { '@type': 'ListItem', position: 2, name: catMeta.label, item: url },
    ],
  };
  const otherHubs = Object.keys(HUB_COPY)
    .filter((c) => c !== cat)
    .map((c) => `<a href="/tools/${c}/">${esc(HUB_COPY[c].h1.replace(/^Free /, ''))}</a>`)
    .join(' · ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PNN1LM2D9Q"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-PNN1LM2D9Q');</script>
<meta charset="UTF-8">
<script>(function(){try{document.documentElement.setAttribute('data-theme','light');localStorage.setItem('ts-theme','light');}catch(e){}})();</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(copy.title)}</title>
<meta name="description" content="${esc(copy.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(copy.title)}">
<meta property="og:description" content="${esc(copy.description)}">
<meta property="og:image" content="https://toolshoppy.com/assets/img/og-image.jpg">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ToolShoppy">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(copy.title)}">
<meta name="twitter:description" content="${esc(copy.description)}">
<meta name="twitter:image" content="https://toolshoppy.com/assets/img/og-image.jpg">
<link rel="icon" href="/favicon.ico?v=2" sizes="any">
<link rel="icon" href="/assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/icon-192.png?v=2">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#DC2626">
<link rel="stylesheet" href="/assets/css/main.css?v=5">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1180208702657280" crossorigin="anonymous"></script>
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(crumb, null, 2)}
</script>
</head>
<body>
<header class="site-header">
  <div class="container">
    <a href="/" class="logo"><img src="/assets/img/logo.png?v=2" alt="" class="logo-mark" width="28" height="28"> Tool<span>Shoppy</span></a>
    <nav class="site-nav">
      <a href="/tools/pdf/">PDF</a>
      <a href="/tools/image/">Image</a>
      <a href="/tools/video/">Video</a>
      <a href="/tools/finance/">Finance</a>
      <a href="/tools/rates/">Rates</a>
      <a href="/search/">Search</a>
    </nav>
    <button type="button" class="theme-toggle" onclick="TS.toggleTheme()" aria-label="Toggle dark mode">
      <svg class="icon-svg theme-icon-sun" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#sun"></use></svg>
      <svg class="icon-svg theme-icon-moon" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#moon"></use></svg>
    </button>
  </div>
</header>
<main class="tool-page container">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/"><svg class="icon-svg" width="16" height="16" aria-hidden="true"><use href="/assets/icons/sprite.svg#home"></use></svg> Home</a>
    <svg class="icon-svg crumb-sep" width="14" height="14" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-right"></use></svg>
    <span class="crumb-current">${esc(catMeta.label)}</span>
  </nav>
  <div class="tool-header">
    <h1>${esc(copy.h1)}</h1>
    <p>${esc(copy.sub)}</p>
  </div>
  <div class="ad-slot ad-top"><span class="ad-label">Ad</span></div>
  <div class="trust-badge"><svg class="icon-svg" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#lock"></use></svg> Private · Free · No signup — pick a tool below</div>
  <section class="content-section">
    <h2>${esc(HUB_GUIDES[cat][0])}</h2>
    ${HUB_GUIDES[cat][1]}
  </section>
  <div class="featured-grid" style="margin-top:20px;">
${cards}
  </div>
  <div class="ad-slot ad-incontent"><span class="ad-label">Ad</span></div>
  <div class="content-section">
    <h2>Browse other categories</h2>
    <p style="color:var(--text-muted);font-size:0.95rem;line-height:1.7;">${otherHubs}</p>
  </div>
</main>
<div class="ad-slot ad-bottom"><span class="ad-label">Ad</span></div>
<footer class="site-footer">
  <div class="container"><div class="footer-bottom">© ${new Date().getFullYear()} ToolShoppy. Global reach. Indian soul.</div></div>
</footer>
<div class="ad-slot ad-sticky-footer"><span class="ad-label">Ad</span></div>
<script src="/assets/js/ga-config.js"></script>
<script src="/assets/js/adsterra-config.js?v=5"></script>
<script src="/assets/js/ad-config.js"></script>
<script src="/assets/js/core.js"></script>
<script src="/assets/js/ads.js?v=6"></script>
<script src="/assets/js/analytics.js"></script>
</body>
</html>
`;
}

function writeHubs() {
  let n = 0;
  for (const cat of Object.keys(HUB_COPY)) {
    const tools = CATALOG.filter((t) => t.key.startsWith(`${cat}/`));
    if (!tools.length) continue;
    const dir = path.join(TOOLS, cat);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'index.html');
    fs.writeFileSync(file, hubPageHtml(cat, tools));
    console.log('hub    ', `tools/${cat}/`);
    n++;
  }
  return n;
}

function fixBreadcrumbs(html) {
  let out = html;
  // Visible crumbs: /#pdf → /tools/pdf/
  out = out.replace(/href="\/#(image|pdf|video|finance|rates|misc)"/g, 'href="/tools/$1/"');
  // Schema crumbs
  out = out.replace(
    /https:\/\/toolshoppy\.com\/#(image|pdf|video|finance|rates|misc)/g,
    'https://toolshoppy.com/tools/$1/'
  );
  // Plain-text style crumbs "› <a href="/#video">"
  out = out.replace(/href='\/#(image|pdf|video|finance|rates|misc)'/g, "href='/tools/$1/'");
  return out;
}

function fixSearchFocus(html) {
  return html.replace(
    /onfocus="location\.href='\/'"/g,
    "onfocus=\"location.href='/search/'\""
  );
}

function injectRelated(html, key) {
  if (/related-tools/.test(html) || /seo-related/.test(html)) return html;
  const items = relatedFor(key);
  if (!items.length) return html;
  const block = relatedHtml(items);
  // Prefer before FAQ section
  if (/class="content-section[^"]*"[\s\S]*?Frequently asked questions/i.test(html)) {
    return html.replace(
      /(<div class="content-section[^"]*">\s*<h2>Frequently asked questions<\/h2>)/i,
      `${block}\n  $1`
    );
  }
  if (html.includes('</main>')) {
    return html.replace('</main>', `${block}\n</main>`);
  }
  return html + block;
}

function enrichToolPages() {
  const files = walk(TOOLS).filter((f) => {
    const key = keyFromFile(f);
    // Skip category hub index.html (single segment)
    return key.includes('/');
  });
  let changed = 0;
  for (const abs of files) {
    const key = keyFromFile(abs);
    let html = fs.readFileSync(abs, 'utf8');
    const before = html;
    html = fixBreadcrumbs(html);
    html = fixSearchFocus(html);
    html = injectRelated(html, key);
    if (html !== before) {
      fs.writeFileSync(abs, html);
      changed++;
      console.log('tool   ', key);
    } else {
      console.log('ok     ', key);
    }
  }
  return changed;
}

// Update CATEGORY hash targets in config file for future enrich runs
function patchEnrichConfig() {
  const cfgPath = path.join(ROOT, 'scripts', 'tool-seo-config.mjs');
  let src = fs.readFileSync(cfgPath, 'utf8');
  const next = src.replace(
    /export const CATEGORY = \{[\s\S]*?\};/,
    `export const CATEGORY = {
  image: { label: 'Image Tools', hash: 'image', hub: '/tools/image/' },
  pdf: { label: 'PDF Tools', hash: 'pdf', hub: '/tools/pdf/' },
  video: { label: 'Video Tools', hash: 'video', hub: '/tools/video/' },
  finance: { label: 'Finance', hash: 'finance', hub: '/tools/finance/' },
  rates: { label: 'Rates', hash: 'rates', hub: '/tools/rates/' },
  misc: { label: 'More Tools', hash: 'misc', hub: '/tools/misc/' },
};`
  );
  if (next !== src) {
    fs.writeFileSync(cfgPath, next);
    console.log('patched tool-seo-config.mjs CATEGORY hubs');
  }

  const enrichPath = path.join(ROOT, 'scripts', 'enrich-tool-seo.mjs');
  let enrich = fs.readFileSync(enrichPath, 'utf8');
  const patched = enrich.replace(
    /item: `https:\/\/toolshoppy\.com\/#\$\{cat\.hash\}`/,
    'item: `https://toolshoppy.com${cat.hub || `/tools/${cat.hash}/`}`'
  );
  if (patched !== enrich) {
    fs.writeFileSync(enrichPath, patched);
    console.log('patched enrich-tool-seo.mjs breadcrumb hubs');
  }
}

console.log('Writing category hubs…');
const hubs = writeHubs();
const tools = process.argv.includes('--hubs-only') ? 0 : enrichToolPages();
if (!process.argv.includes('--hubs-only')) patchEnrichConfig();
console.log(`\nDone. Hubs: ${hubs}. Tool pages updated: ${tools}. (${TODAY})`);
