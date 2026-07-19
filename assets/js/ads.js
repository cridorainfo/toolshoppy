// ToolShoppy — config-driven ad slot loader
// Every .ad-slot on a page gets its own dedicated ad unit — no two slots on the same
// page ever request the identical network+unit ID at once (that reads as stacked/
// duplicate impressions to ad networks and causes intermittent no-fill on refresh).
// Each placement type has an ordered pool of (network, configKey) pairs; the Nth
// occurrence of a placement on a page uses the Nth pool entry (wrapping if needed),
// then walks the rest of the pool, then falls back to AdSense by placement key,
// before finally leaving a blank reserved-height placeholder.
(function () {
  'use strict';

  var PLACEMENT_MAP = {
    'ad-top': 'top',
    'ad-sidebar': 'sidebar',
    'ad-incontent': 'incontent',
    'ad-sticky-footer': 'stickyFooterMobile',
    'ad-bottom': 'bottom',
  };

  // Each pool entry is [network, configKey]. configKey looks up that network's own
  // config (Adsterra zones, MyBid banners, AdSense slots) — it doesn't have to match
  // the placement name, e.g. an 'incontent' slot can render the Adsterra zone that's
  // configured under the 'sidebar' key.
  var OCCURRENCE_POOLS = {
    top: [['adsterra', 'top']],
    sidebar: [['adsterra', 'sidebar']],
    incontent: [['mybid', 'incontent'], ['mybid', 'sidebar'], ['adsterra', 'incontent']],
    stickyFooterMobile: [['adsterra', 'stickyFooterMobile']],
    bottom: [['adsense', 'incontent']],
  };

  function getConfig() {
    return window.TS_AD_CONFIG || { client: '', slots: {} };
  }

  function getAdsterraZone(configKey) {
    var cfg = window.TS_ADSTERRA_CONFIG;
    if (!cfg || cfg.enabled === false) return null;
    return (cfg && cfg.zones && cfg.zones[configKey]) || null;
  }

  function getMybidBanner(configKey) {
    var cfg = window.TS_MYBID_CONFIG;
    return (cfg && cfg.banners && cfg.banners[configKey]) || null;
  }

  function getAdsenseSlot(configKey) {
    var cfg = getConfig();
    var slotId = configKey && cfg.slots ? cfg.slots[configKey] : null;
    if (!cfg.client || !slotId) return null;
    return { client: cfg.client, slotId: String(slotId) };
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

  function tryNetwork(slot, network, configKey) {
    if (network === 'adsterra') {
      var zone = getAdsterraZone(configKey);
      if (!zone) return false;
      if (zone.type === 'native') {
        renderAdsterraNative(slot, zone);
      } else {
        renderAdsterraBanner(slot, zone);
      }
      return true;
    }
    if (network === 'mybid') {
      var bannerId = getMybidBanner(configKey);
      if (!bannerId) return false;
      renderMybidBanner(slot, bannerId);
      return true;
    }
    if (network === 'adsense') {
      var res = getAdsenseSlot(configKey);
      if (!res) return false;
      var format = configKey === 'sidebar' ? 'rectangle' : 'auto';
      renderRealAd(slot, res.client, res.slotId, format);
      return true;
    }
    return false;
  }

  function loadSlot(slot) {
    if (slot.dataset.loaded === 'true') return;
    slot.dataset.loaded = 'true';

    var key = placementKey(slot);
    var pool = OCCURRENCE_POOLS[key] || [];
    var idx = parseInt(slot.dataset.occIndex || '0', 10) % (pool.length || 1);

    // Start from this slot's assigned pool entry, then walk the rest of the pool
    // (covers the case where its first choice has no config set), then fall back to
    // AdSense keyed by placement, then give up with a blank placeholder.
    var order = pool.slice(idx).concat(pool.slice(0, idx));
    for (var i = 0; i < order.length; i++) {
      if (tryNetwork(slot, order[i][0], order[i][1])) return;
    }
    if (tryNetwork(slot, 'adsense', key)) return;
    ensurePlaceholder(slot);
  }

  function initAds() {
    var slots = document.querySelectorAll('.ad-slot');
    if (!slots.length) return;

    // Assign each slot its occurrence index within its placement type, in DOM order,
    // before any lazy-loading happens — keeps the pool assignment deterministic
    // regardless of which slot's IntersectionObserver callback fires first.
    var counters = {};
    slots.forEach(function (slot) {
      var key = placementKey(slot);
      var idx = counters[key] || 0;
      slot.dataset.occIndex = String(idx);
      counters[key] = idx + 1;
    });

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
