// ToolShoppy — lightweight event tracking (GA4 wiring placeholder)
(function () {
  'use strict';

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  window.TSAnalytics = { track };
})();
