#!/usr/bin/env node
/**
 * Enrich tool pages with missing SEO: title/meta, WebApplication,
 * BreadcrumbList, FAQPage + visible FAQs, How-to, trust badge.
 *
 * Usage: node scripts/enrich-tool-seo.mjs
 * Idempotent — safe to re-run.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORY, TOOL_SEO } from './tool-seo-config.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS = path.join(ROOT, 'tools');

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
  const top = key.split('/')[0];
  return CATEGORY[top] || { label: 'Tools', hash: top };
}

function titleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function defaultCopy(key) {
  const leaf = key.split('/').pop();
  const name = titleCase(leaf);
  const cat = categoryOf(key);
  const isFile = /image|pdf|video|audio|sticker|qr|thumbnail|handwriting|font|ascii|upscale|background|passport|govt|compress|convert|resize|merge|split|editor|unlock|protect|trim|cutter/.test(key);
  return {
    name,
    title: `${name} Free Online | No Signup | ToolShoppy`,
    description: `Use ${name} free online on ToolShoppy. No signup.${isFile ? ' Files never leave your device.' : ' Runs entirely in your browser.'}`,
    trust: isFile ? 'files' : 'browser',
    applicationCategory: cat.hash === 'finance' || cat.hash === 'rates' ? 'FinanceApplication' : 'UtilitiesApplication',
    howToTitle: `How to use ${name}`,
    howToSteps: [
      `Open the ${name} tool on this page.`,
      'Enter your inputs or upload a file as prompted.',
      'Download or copy the result — everything runs in your browser.',
    ],
    faqs: [
      { q: `Is ${name} free?`, a: 'Yes. ToolShoppy tools are free with no signup required.' },
      { q: isFile ? 'Do my files get uploaded to a server?' : 'Is my data uploaded to a server?', a: isFile ? 'No. Processing runs entirely in your browser — files never leave your device.' : 'No. Calculations run entirely in your browser. We do not store your inputs.' },
      { q: 'Do I need an account?', a: 'No. There is no login or email required.' },
    ],
  };
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(obj) {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}

function buildSchemas(key, cfg, url) {
  const cat = categoryOf(key);
  const parts = [];
  parts.push({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: cfg.name,
    url,
    description: cfg.description,
    applicationCategory: cfg.applicationCategory || 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ...(cfg.featureList ? { featureList: cfg.featureList } : {}),
  });
  parts.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolshoppy.com/' },
      { '@type': 'ListItem', position: 2, name: cat.label, item: `https://toolshoppy.com/#${cat.hash}` },
      { '@type': 'ListItem', position: 3, name: cfg.name, item: url },
    ],
  });
  parts.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cfg.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });
  return parts;
}

function hasType(html, type) {
  return new RegExp(`"@type"\\s*:\\s*"${type}"`).test(html);
}

function hasHowTo(html) {
  return /<h2[^>]*>\s*How to[\s\S]*?<\/h2>/i.test(html) || /how to use/i.test(html);
}

function hasFaqHtml(html) {
  return /class="faq-item"/.test(html) || /Frequently asked questions/i.test(html);
}

function hasTrust(html) {
  return /trust-badge/.test(html) || /never leave your (device|browser)/i.test(html) || /Runs entirely in your browser/i.test(html);
}

function trustHtml(cfg) {
  const text = cfg.trust === 'browser'
    ? 'Runs entirely in your browser · No signup'
    : 'Your files never leave your device';
  return `<div class="trust-badge"><svg class="icon-svg" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#lock"></use></svg> ${esc(text)}</div>`;
}

function howToHtml(cfg) {
  const steps = cfg.howToSteps.map((s) => `      <li>${esc(s)}</li>`).join('\n');
  return `  <div class="content-section seo-howto">
    <h2>${esc(cfg.howToTitle)}</h2>
    <ol>
${steps}
    </ol>
  </div>`;
}

function faqHtml(cfg) {
  const items = cfg.faqs.map((f) => `    <div class="faq-item">
      <h3>${esc(f.q)}</h3>
      <p>${esc(f.a)}</p>
    </div>`).join('\n');
  return `  <div class="content-section seo-faq">
    <h2>Frequently asked questions</h2>
${items}
  </div>`;
}

function upsertMeta(html, cfg) {
  if (!cfg.title && !cfg.description) return html;
  let out = html;
  if (cfg.title) {
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(cfg.title)}</title>`);
    out = out.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(cfg.title)}">`);
    out = out.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(cfg.title)}">`);
  }
  if (cfg.description) {
    out = out.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(cfg.description)}">`);
    out = out.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(cfg.description)}">`);
    out = out.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(cfg.description)}">`);
  }
  return out;
}

function insertBeforeHeadClose(html, block) {
  if (!block.trim()) return html;
  return html.replace('</head>', `${block}\n</head>`);
}

function insertTrust(html, cfg) {
  if (hasTrust(html)) return html;
  const badge = trustHtml(cfg);
  // Prefer inside tool-card-main after controls; else after tool-header
  if (/<\/div>\s*<\/div>\s*<aside class="sidebar">/.test(html)) {
    return html.replace(
      /(<\/div>\s*)(<\/div>\s*<aside class="sidebar">)/,
      `$1      ${badge}\n    $2`
    );
  }
  if (/class="tool-header"[\s\S]*?<\/div>/.test(html)) {
    return html.replace(
      /(class="tool-header"[\s\S]*?<\/div>)/,
      `$1\n  ${badge}`
    );
  }
  return html.replace('<main', `${badge}\n<main`);
}

function insertContentSections(html, cfg) {
  let out = html;
  const blocks = [];
  if (!hasHowTo(out)) blocks.push(howToHtml(cfg));
  if (!hasFaqHtml(out)) blocks.push(faqHtml(cfg));
  if (!blocks.length) return out;

  const chunk = blocks.join('\n');
  // Insert before closing </main>
  if (out.includes('</main>')) {
    return out.replace('</main>', `${chunk}\n</main>`);
  }
  return out + chunk;
}

function insertSchemas(html, key, cfg, url) {
  const schemas = buildSchemas(key, cfg, url);
  const toAdd = [];
  if (!hasType(html, 'WebApplication') && !hasType(html, 'SoftwareApplication')) {
    toAdd.push(jsonLd(schemas[0]));
  }
  if (!hasType(html, 'BreadcrumbList')) {
    toAdd.push(jsonLd(schemas[1]));
  }
  if (!hasType(html, 'FAQPage')) {
    toAdd.push(jsonLd(schemas[2]));
  }
  if (!toAdd.length) return html;
  return insertBeforeHeadClose(html, toAdd.join('\n'));
}

function enrichFile(abs) {
  const key = keyFromFile(abs);
  const cfg = { ...defaultCopy(key), ...(TOOL_SEO[key] || {}) };
  const url = `https://toolshoppy.com/tools/${key}/`;
  let html = fs.readFileSync(abs, 'utf8');
  const before = html;

  // Only force title/meta updates when config explicitly sets them in TOOL_SEO
  if (TOOL_SEO[key]?.title || TOOL_SEO[key]?.description) {
    html = upsertMeta(html, cfg);
  }

  html = insertSchemas(html, key, cfg, url);
  html = insertTrust(html, cfg);
  html = insertContentSections(html, cfg);

  if (html !== before) {
    fs.writeFileSync(abs, html);
    return true;
  }
  return false;
}

const files = walk(TOOLS);
let changed = 0;
for (const f of files) {
  if (enrichFile(f)) {
    changed++;
    console.log('enriched', keyFromFile(f));
  } else {
    console.log('ok     ', keyFromFile(f));
  }
}
console.log(`\nDone. Updated ${changed} / ${files.length} tool pages.`);
