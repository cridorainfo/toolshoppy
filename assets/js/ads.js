// ToolShoppy — config-driven ad slot loader
// Runs 3 networks side by side so all 3 show up somewhere on the page: each placement
// has one primary network (see PLACEMENT_NETWORK below); AdSense is also the fallback
// for any placement whose primary network has no config/zone set, so nothing sits blank.
(function () {
  'use strict';

  var PLACEMENT_MAP = {
    'ad-top': 'top',
    'ad-sidebar': 'sidebar',
    'ad-incontent': 'incontent',
    'ad-sticky-footer': 'stickyFooterMobile',
  };

  // Which network owns each placement. Falls through to AdSense if that network's
  // config/zone for the placement is missing (see loadSlot).
  var PLACEMENT_NETWORK = {
    top: 'adsterra',
    sidebar: 'mybid',
    incontent: 'mybid',
    stickyFooterMobile: 'adsterra',
  };

  function getConfig() {
    return window.TS_AD_CONFIG || { client: '', slots: {} };
  }

  function getAdsterraZone(key) {
    var cfg = window.TS_ADSTERRA_CONFIG;
    if (!cfg || cfg.enabled === false) return null;
    return (cfg && cfg.zones && cfg.zones[key]) || null;
  }

  function getMybidBanner(key) {
    var cfg = window.TS_MYBID_CONFIG;
    return (cfg && cfg.banners && cfg.banners[key]) || null;
  }

  function placementKey(slotEl) {
    for (var cls in PLACEMENT_MAP) {
      if (slotEl.classList.contains(cls)) return PLACEMENT_MAP[cls];
    }
    return slotEl.getAttribute('data-ad-placement') || null;
  }

  function ensurePlaceholder(slot) {
    if (!slot.querySelector('.ad-label') && !slot.querySelector('ins.adsbygoogle')) {
      slot.innerHTML = '<span class="ad-label">Ad</span>';
    }
  }

  function renderRealAd(slot, client, slotId, format) {
    slot.innerHTML = '';
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', client);
    ins.setAttribute('data-ad-slot', slotId);
    if (format === 'rectangle') {
      ins.setAttribute('data-ad-format', 'rectangle');
    } else {
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
    }
    slot.appendChild(ins);
    slot.setAttribute('data-ad-ready', '1');
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) { /* Auto ads or blocker */ }
  }

  function renderAdsterraBanner(slot, zone) {
    slot.innerHTML = '';
    var opts = document.createElement('script');
    opts.type = 'text/javascript';
    opts.text = 'atOptions = ' + JSON.stringify({
      key: zone.key, format: 'iframe', height: zone.height, width: zone.width, params: {}
    }) + ';';
    var invoke = document.createElement('script');
    invoke.type = 'text/javascript';
    invoke.src = zone.scriptSrc;
    slot.appendChild(opts);
    slot.appendChild(invoke);
    slot.setAttribute('data-ad-ready', '1');
  }

  function renderAdsterraNative(slot, zone) {
    slot.innerHTML = '';
    var container = document.createElement('div');
    container.id = zone.containerId;
    var invoke = document.createElement('script');
    invoke.async = true;
    invoke.setAttribute('data-cfasync', 'false');
    invoke.src = zone.scriptSrc;
    slot.appendChild(invoke);
    slot.appendChild(container);
    slot.setAttribute('data-ad-ready', '1');
  }

  function renderMybidBanner(slot, bannerId) {
    slot.innerHTML = '';
    var cfg = window.TS_MYBID_CONFIG || {};
    var div = document.createElement('div');
    div.setAttribute('data-banner-id', bannerId);
    var loader = document.createElement('script');
    loader.async = true;
    loader.src = cfg.scriptSrc || 'https://js.mbidadm.com/static/scripts.js';
    loader.setAttribute('data-admpid', cfg.admpid || '');
    slot.appendChild(div);
    slot.appendChild(loader);
    slot.setAttribute('data-ad-ready', '1');
  }

  function tryAdsterra(slot, key) {
    var zone = getAdsterraZone(key);
    if (!zone) return false;
    if (zone.type === 'native') {
      renderAdsterraNative(slot, zone);
    } else {
      renderAdsterraBanner(slot, zone);
    }
    return true;
  }

  function tryMybid(slot, key) {
    var bannerId = getMybidBanner(key);
    if (!bannerId) return false;
    renderMybidBanner(slot, bannerId);
    return true;
  }

  function tryAdsense(slot, key) {
    var cfg = getConfig();
    var slotId = key && cfg.slots ? cfg.slots[key] : null;
    if (!cfg.client || !slotId) return false;
    var format = key === 'sidebar' ? 'rectangle' : 'auto';
    renderRealAd(slot, cfg.client, String(slotId), format);
    return true;
  }

  var NETWORK_TRY = { adsterra: tryAdsterra, mybid: tryMybid, adsense: tryAdsense };

  function loadSlot(slot) {
    if (slot.dataset.loaded === 'true') return;
    slot.dataset.loaded = 'true';

    var key = placementKey(slot);
    var primary = PLACEMENT_NETWORK[key];
    var primaryTry = primary && NETWORK_TRY[primary];

    // Try the placement's assigned network first, then AdSense as universal fallback
    // (skip re-trying AdSense if it was already the primary), then a blank placeholder.
    if (primaryTry && primaryTry(slot, key)) return;
    if (primary !== 'adsense' && tryAdsense(slot, key)) return;
    ensurePlaceholder(slot);
  }

  function initAds() {
    var slots = document.querySelectorAll('.ad-slot');
    if (!slots.length) return;

    if (!('IntersectionObserver' in window)) {
      slots.forEach(loadSlot);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadSlot(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });

    slots.forEach(function (slot) {
      observer.observe(slot);
      // Fallback: if IntersectionObserver never fires for this slot (seen in some
      // embedded webviews/preview environments), force-load it anyway so ads don't
      // silently stay blank with no error.
      setTimeout(function () {
        if (slot.dataset.loaded !== 'true') {
          loadSlot(slot);
          observer.unobserve(slot);
        }
      }, 4000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
