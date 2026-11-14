// ToolShoppy — deferred third-party loader
// GA4 (gtag.js) and AdSense used to load from <head> on every page. Together they cost
// ~400 KB and ~1s of main-thread time, which dominated Total Blocking Time and LCP on
// mobile. They now load after the page is usable:
//   - GA4: only after Google CMP permits analytics for this visitor. Ad-free
//     pages without a CMP signal do not load analytics.
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
  var analyticsAllowed = false;

  // Google CMP publishes this signal only after resolving the visitor's region
  // and (where required) their choice. A timeout or interaction is not consent.
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  window.googlefc.callbackQueue.push({ CONSENT_MODE_DATA_READY: function () {
    var fc = window.googlefc;
    if (!fc.getGoogleConsentModeValues || !fc.ConsentModePurposeStatusEnum) return;
    var consent = fc.getGoogleConsentModeValues();
    if (!consent) return;
    var status = consent.analyticsStoragePurposeConsentStatus;
    var values = fc.ConsentModePurposeStatusEnum;
    analyticsAllowed = status === values.CONSENT_MODE_PURPOSE_STATUS_GRANTED ||
      status === values.CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE;
    if (analyticsAllowed) startGA();
  } });

  // Keep withdrawal reachable on monetized pages without inventing a second CMP.
  window.googlefc.callbackQueue.push({ CONSENT_API_READY: function () {
    if (typeof window.googlefc.showRevocationMessage !== 'function') return;
    var footer = document.querySelector('.footer-links') || document.querySelector('.site-footer .footer-bottom');
    if (!footer || document.querySelector('.ts-privacy-settings')) return;
    var link = document.createElement('a');
    link.className = 'ts-privacy-settings';
    link.href = '#privacy-settings';
    link.textContent = 'Privacy & cookie settings';
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.googlefc.showRevocationMessage();
    });
    footer.appendChild(link);
  } });

  function addScript(src, crossOrigin) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (crossOrigin) s.crossOrigin = crossOrigin;
    document.head.appendChild(s);
  }

  function startGA() {
    if (gaStarted || !analyticsAllowed) return;
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
