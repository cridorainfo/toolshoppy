// ToolShoppy — deferred third-party loader
// GA4 (gtag.js) and AdSense used to load from <head> on every page. Together they cost
// ~400 KB and ~1s of main-thread time, which dominated Total Blocking Time and LCP on
// mobile. They now load after the page is usable:
//   - GA4: shortly after the load event (or on first interaction), so short visits
//     still count.
//   - AdSense: on first interaction (scroll, tap, key) or a few seconds after load,
//     whichever comes first. ads.js queues its slots on window.adsbygoogle meanwhile,
//     and Auto ads start as soon as the library arrives.
// Pages keep the tiny inline dataLayer/gtag() stub, so events fired before gtag.js
// arrives are queued, not lost.
(function () {
  'use strict';

  var GA_ID = window.TS_GA_ID || 'G-PNN1LM2D9Q';
  var ADS_CLIENT = (window.TS_AD_CONFIG && window.TS_AD_CONFIG.client) || 'ca-pub-1180208702657280';
  var GA_DELAY_MS = 1500;
  var ADS_DELAY_MS = 6000;
  var gaStarted = false;
  var adsStarted = false;

  function addScript(src, crossOrigin) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (crossOrigin) s.crossOrigin = crossOrigin;
    document.head.appendChild(s);
  }

  function startGA() {
    if (gaStarted) return;
    gaStarted = true;
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
  }

  // Pages that must not carry ads (hubs, legal pages, error pages, noindex pages) are marked
  // <meta name="ts-ads" content="off"> or noindex. AdSense is never loaded there, because
  // Auto ads would otherwise place ads on them regardless of our own slots.
  function adsAllowed() {
    if (document.querySelector('meta[name="ts-ads"][content="off"]')) return false;
    var robots = document.querySelector('meta[name="robots"]');
    return !(robots && /noindex/i.test(robots.getAttribute('content') || ''));
  }

  function startAds() {
    if (adsStarted) return;
    adsStarted = true;
    if (!adsAllowed()) return;
    // Static mode: the page already carries the AdSense tag in its <head> (see
    // scripts/lib/page-policy.mjs), so do not load it a second time.
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    addScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ADS_CLIENT), 'anonymous');
  }

  var INTERACTION = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'];
  function onInteract() {
    INTERACTION.forEach(function (name) { window.removeEventListener(name, onInteract, true); });
    startGA();
    startAds();
  }
  INTERACTION.forEach(function (name) {
    window.addEventListener(name, onInteract, { capture: true, passive: true, once: true });
  });

  function afterLoad(fn, delay) {
    function run() { setTimeout(fn, delay); }
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  }
  afterLoad(startGA, GA_DELAY_MS);
  afterLoad(startAds, ADS_DELAY_MS);
})();
