#!/usr/bin/env node
/**
 * AdSense-readiness audit (read-only). Reports the things reviewers look at that can be
 * measured from the static site: publisher-content depth per page, trust-page links in the
 * footer, ad density, policy-page disclosures, and risky page types.
 *   node scripts/audit-adsense.mjs [--json]
 * It cannot see your AdSense account status or Google's decision; it checks the site only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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

const strip = html => html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<div class="ad-slot[\s\S]*?<\/div>/gi, ' ')
  .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
  .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z#0-9]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const rows = [];
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const html = fs.readFileSync(f, 'utf8');
  if (/noindex/.test(html) || rel === '404.html') continue;
  const main = strip((html.match(/<main[\s\S]*?<\/main>/i) || [html])[0]);
  const foot = (html.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];
  const policyLinks = ['/privacy', '/about', '/contact', '/terms'].filter(p => new RegExp(`href=["']${p}`).test(foot)).length;
  const kind = rel.startsWith('tools/rates/') ? 'rates' : rel.startsWith('tools/') ? rel.split('/')[1] : rel.startsWith('blog') ? 'blog' : 'site';
  rows.push({ rel, kind, words: main ? main.split(' ').length : 0, policyLinks, adSlots: (html.match(/class="ad-slot/g) || []).length });
}

const out = { pages: rows.length, byKind: {}, thin: [], missingFooterLinks: 0 };
for (const r of rows) (out.byKind[r.kind] ||= []).push(r);
for (const [k, rs] of Object.entries(out.byKind)) {
  const w = rs.map(r => r.words).sort((a, b) => a - b);
  out.byKind[k] = { pages: rs.length, medianWords: w[Math.floor(w.length / 2)], minWords: w[0], maxWords: w[w.length - 1], under300: rs.filter(r => r.words < 300).length };
}
out.thin = rows.filter(r => r.words < 300).sort((a, b) => a.words - b.words).map(r => `${r.words}w  ${r.rel}  (ad slots: ${r.adSlots})`);
out.missingFooterLinks = rows.filter(r => r.policyLinks < 4).length;

// Policy pages: do they say what AdSense expects?
const policy = {};
const read = f => (fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), 'utf8') : '');
const priv = strip(read('privacy.html')).toLowerCase();
policy.privacy = {
  words: priv.split(' ').length,
  mentionsGoogleAds: /adsense|google.*(ads|advertis)/.test(priv),
  mentionsCookies: /cookie/.test(priv),
  mentionsThirdPartyVendors: /third[- ]party/.test(priv),
  linksGoogleAdSettings: /adssettings\.google|policies\.google\.com\/technologies\/ads|google\.com\/settings\/ads/.test(read('privacy.html')),
  mentionsAnalytics: /analytics/.test(priv),
  mentionsEeaConsent: /(eea|european|gdpr|consent)/.test(priv),
  mentionsChildren: /(children|under 13|minors)/.test(priv),
  hasDate: /(updated|effective)/.test(priv),
};
const about = strip(read('about.html')).toLowerCase();
policy.about = { words: about.split(' ').length, namesAPerson: /(founder|created by|built by|i am|my name)/.test(about), hasContactRoute: /contact/.test(about) };
const contact = read('contact.html');
policy.contact = { words: strip(contact).split(' ').length, hasEmail: /mailto:|[\w.+-]+@[\w-]+\.[\w.]+/.test(contact), hasForm: /<form/.test(contact) };
out.policy = policy;
out.adsTxt = read('ads.txt').trim();

if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`Indexable pages: ${out.pages}`);
  console.log('\nPublisher content (words in <main>, excluding ads/nav/sidebar):');
  for (const [k, v] of Object.entries(out.byKind)) console.log(`  ${k.padEnd(8)} pages ${String(v.pages).padStart(3)}  median ${String(v.medianWords).padStart(4)}  min ${String(v.minWords).padStart(4)}  under 300: ${v.under300}`);
  console.log(`\nPages under 300 words (${out.thin.length}):`); out.thin.slice(0, 25).forEach(t => console.log('  ' + t));
  console.log(`\nPages missing a footer link to any of About/Contact/Privacy/Terms: ${out.missingFooterLinks} of ${out.pages}`);
  console.log('\nPolicy pages:'); console.log(JSON.stringify(out.policy, null, 2));
  console.log('\nads.txt:', out.adsTxt);
}
