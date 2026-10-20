// Shared page shell for generated tool pages (new tools + size landing pages).
// Mirrors the markup of the hand-built pages so main.css, ads.js, core.js and the
// SEO audit treat them identically. Pages stay fully static: no runtime templating.
import { siteFooter } from './page-policy.mjs';

const ORIGIN = 'https://toolshoppy.com';
const GA_ID = 'G-PNN1LM2D9Q';

export const CATEGORIES = {
  image: { label: 'Image Tools', hub: '/tools/image/' },
  pdf: { label: 'PDF Tools', hub: '/tools/pdf/' },
  finance: { label: 'Finance', hub: '/tools/finance/' },
  misc: { label: 'More Tools', hub: '/tools/misc/' },
};

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = o => JSON.stringify(o, null, 2);

const svg = (id, size = 24, cls = 'icon-svg') =>
  `<svg class="${cls}" width="${size}" height="${size}" aria-hidden="true"><use href="/assets/icons/sprite.svg#${id}"></use></svg>`;

function crumb(trail) {
  // trail: [{name, href?}] after Home; last item is the current page.
  const sep = `<svg class="icon-svg crumb-sep" width="14" height="14" aria-hidden="true"><use href="/assets/icons/sprite.svg#chevron-right"></use></svg>`;
  const parts = trail.map((t, i) => i === trail.length - 1
    ? `<span class="crumb-current">${esc(t.name)}</span>`
    : `<a href="${t.href}">${esc(t.name)}</a>`);
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/">${svg('home', 16)} Home</a>
    ${parts.map(p => `${sep}\n    ${p}`).join('\n')}
  </nav>`;
}

function relatedBlock(items) {
  if (!items?.length) return '';
  return `  <div class="content-section seo-related">
    <h2>Related tools</h2>
    <div class="related-tools">
${items.map(r => `      <a href="${r.href}">
        <span class="icon-tile icon-tile--sm icon-tile--${r.tile}">${svg(r.icon)}</span>
        ${esc(r.title)}
        <span class="related-desc">${esc(r.desc)}</span>
      </a>`).join('\n')}
    </div>
  </div>`;
}

/**
 * @param {object} p
 *  path        '/tools/misc/password-generator/'
 *  trail       [{name, href}] between Home and the page, e.g. [{name:'More Tools', href:'/tools/misc/'}]
 *  crumbName   current-page crumb label
 *  title, description, name, h1, intro, keywords
 *  icon, tile  header icon (sprite id) and colour tile
 *  appCategory schema.org applicationCategory
 *  trust       text for the trust badge
 *  toolHtml    markup inside .tool-card-main (before the trust badge)
 *  sidebarHtml extra info boxes under the sidebar ad
 *  steps       [string]  how-to steps
 *  sections    [[h2, html]] explanatory sections
 *  faqs        [[q, a]]
 *  related     [{href,title,desc,icon,tile}]
 *  scripts     extra <script src> tags (strings) loaded before the inline script
 *  inlineScript JS source for the tool UI
 *  layoutId    optional id for .tool-layout
 */
export function renderToolPage(p) {
  const url = ORIGIN + p.path;
  const crumbs = [{ name: 'Home', item: ORIGIN + '/' }, ...p.trail.map(t => ({ name: t.name, item: ORIGIN + t.href })), { name: p.crumbName, item: url }];
  const webApp = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: p.name, url, description: p.description,
    applicationCategory: p.appCategory || 'UtilitiesApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
  };
  const faq = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: p.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const trustId = p.trustIcon || 'lock';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>
<meta charset="UTF-8">
<script>(function(){try{/* TEMP: dark mode disabled — restore prior boot to re-enable */document.documentElement.setAttribute('data-theme','light');localStorage.setItem('ts-theme','light');}catch(e){}})();</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="robots" content="index, follow">
${p.keywords ? `<meta name="keywords" content="${esc(p.keywords)}">\n` : ''}<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="${ORIGIN}/assets/img/og-image.jpg">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ToolShoppy">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${ORIGIN}/assets/img/og-image.jpg">
<link rel="icon" href="/favicon.ico?v=2" sizes="any">
<link rel="icon" href="/assets/img/favicon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/icon-192.png?v=2">
<link rel="stylesheet" href="/assets/css/main.css?v=9">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#DC2626">
<script type="application/ld+json">
${json(webApp)}
</script>
<script type="application/ld+json">
${json(breadcrumb)}
</script>
<script type="application/ld+json">
${json(faq)}
</script>
<meta name="google-adsense-account" content="ca-pub-1180208702657280">
<script defer src="/assets/js/third-party.js?v=1"></script>
</head>
<body>
<header class="site-header">
  <div class="container">
    <a href="/" class="logo"><img src="/assets/img/logo.webp?v=3" alt="" class="logo-mark" width="28" height="28"> Tool<span>Shoppy</span></a>
    <div class="site-search"><input type="text" placeholder="Search tools…" aria-label="Search tools" onfocus="location.href='/search/'"></div>
    <button type="button" class="theme-toggle" onclick="TS.toggleTheme()" aria-label="Toggle dark mode">
      ${svg('sun', 24, 'icon-svg theme-icon-sun')}
      ${svg('moon', 24, 'icon-svg theme-icon-moon')}
    </button>
  </div>
</header>
<main class="tool-page container">
  ${crumb([...p.trail, { name: p.crumbName }])}
  <div class="tool-header">
    <div class="icon-tile icon-tile--lg icon-tile--${p.tile}">${svg(p.icon)}</div>
    <h1>${esc(p.h1)}</h1>
    <p>${esc(p.intro)}</p>
  </div>
  <div class="ad-slot ad-top"><span class="ad-label">Ad</span></div>
  <div class="tool-layout with-sidebar"${p.layoutId ? ` id="${p.layoutId}"` : ''}>
    <div class="tool-card-main">
${p.toolHtml}
      <div class="trust-badge">${svg(trustId)} ${esc(p.trust)}</div>
    </div>
    <aside class="sidebar">
      <div class="ad-slot ad-sidebar"><span class="ad-label">Ad</span></div>
${p.sidebarHtml || ''}
    </aside>
  </div>
  <div class="ad-slot ad-incontent"><span class="ad-label">Ad</span></div>
  <div class="content-section seo-howto">
    <h2>${esc(p.howToTitle || `How to use the ${p.name}`)}</h2>
    <ol>
${p.steps.map(s => `      <li>${s}</li>`).join('\n')}
    </ol>
  </div>
${p.sections.map(([h, body]) => `  <section class="content-section">
    <h2>${esc(h)}</h2>
    ${body}
  </section>`).join('\n')}
  <div class="ad-slot ad-incontent"><span class="ad-label">Ad</span></div>
${relatedBlock(p.related)}
  <div class="content-section seo-faq">
    <h2>Frequently asked questions</h2>
${p.faqs.map(([q, a]) => `    <div class="faq-item"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('\n')}
  </div>
</main>
<div class="ad-slot ad-bottom"><span class="ad-label">Ad</span></div>
${siteFooter(year)}
<div class="ad-slot ad-sticky-footer"><span class="ad-label">Ad</span></div>
<script src="/assets/js/ga-config.js"></script>
<script src="/assets/js/ad-config.js"></script>
<script src="/assets/js/core.js?v=7"></script>
<script defer src="/assets/js/ads.js?v=7"></script>
<script defer src="/assets/js/analytics.js"></script>
${(p.scripts || []).join('\n')}${p.scripts?.length ? '\n' : ''}<script>
${p.inlineScript}
</script>
</body>
</html>
`;
}
