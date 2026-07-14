// ToolShoppy — GA4 event tracking
// Set measurementId below after creating a GA4 property, then deploy.
(function () {
  'use strict';

  var measurementId = window.TS_GA_ID || null; // e.g. 'G-XXXXXXXXXX'

  function loadGtag(id) {
    if (!id || window.gtag) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  if (measurementId) loadGtag(measurementId);

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  window.TSAnalytics = { track: track, loadGtag: loadGtag };
})();
