// Single source of truth for which pages carry ads / are indexed, and how AdSense is loaded.
// Applied to the static HTML by scripts/apply-page-policy.mjs (runs at the end of `npm run build:tools`).

/**
 * 'static'   — the AdSense <script async> tag sits in every ad-eligible page's <head>.
 *              Use while an AdSense review is pending: the reviewer's crawler then sees the
 *              snippet in the raw HTML on every page.
 * 'deferred' — no tag in the HTML; assets/js/third-party.js loads AdSense on first
 *              interaction (or after ~6s). Faster pages; switch to this after approval:
 *                node scripts/apply-page-policy.mjs deferred
 */
export const ADSENSE_MODE = 'static';

export const ADSENSE_CLIENT = 'ca-pub-1180208702657280';
export const ADSENSE_TAG = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;

// Kerala district pages repeat the statewide rate (their own FAQ says so) and share ~90% of
// their words with each other. They stay available to visitors but are not indexed or monetised.
const KERALA_DISTRICTS = 'alappuzha|ernakulam|idukki|kannur|kasaragod|kollam|kottayam|kozhikode|malappuram|palakkad|pathanamthitta|thiruvananthapuram|thrissur|wayanad';
const THIN_DISTRICT = new RegExp(`^tools/rates/(gold-rate|silver-rate)/(${KERALA_DISTRICTS})/index\\.html$`);
export const isThinPage = rel => THIN_DISTRICT.test(rel);

// Navigational and legal pages: no ads. Link hubs and short policy pages have little
// publisher content of their own ("screens without publisher content"), and ads there add
// risk for almost no revenue.
const AD_FREE_FILES = new Set(['about.html', 'contact.html', 'privacy.html', 'terms.html', '404.html', 'search/index.html', 'blog/index.html']);
export const isAdFree = rel => isThinPage(rel) || AD_FREE_FILES.has(rel) || /^tools\/(image|pdf|video|finance|misc|rates)\/index\.html$/.test(rel);

export const FOOTER_LINKS = [
  ['/about/', 'About'], ['/contact/', 'Contact'], ['/privacy/', 'Privacy Policy'],
  ['/terms/', 'Terms of Service'], ['/blog/', 'Blog &amp; Guides'], ['/', 'All tools'],
];

export function siteFooter(year = new Date().getFullYear()) {
  return `<footer class="site-footer">
  <div class="container">
    <nav class="footer-links" aria-label="Footer">
${FOOTER_LINKS.map(([href, label]) => `      <a href="${href}">${label}</a>`).join('\n')}
    </nav>
    <div class="footer-bottom">© ${year} ToolShoppy. Global reach. Indian soul.</div>
  </div>
</footer>`;
}
