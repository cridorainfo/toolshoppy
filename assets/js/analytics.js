// ToolShoppy — GA4 event tracking
// gtag loads in <head> on every page; this file adds TSAnalytics.track() only.
(function () {
  'use strict';

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  window.TSAnalytics = { track: track };
})();
