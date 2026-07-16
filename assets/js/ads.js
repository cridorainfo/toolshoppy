// ToolShoppy — config-driven ad slot loader
// Renders real AdSense <ins> units when slot IDs exist in ad-config.js;
// otherwise keeps CLS-safe reserved-height placeholders.
(function () {
  'use strict';

  var PLACEMENT_MAP = {
    'ad-top': 'top',
    'ad-sidebar': 'sidebar',
    'ad-incontent': 'incontent',
    'ad-sticky-footer': 'stickyFooterMobile',
  };

  var ADSTERRA_PLACEMENTS = { top: true, sidebar: true, incontent: true, stickyFooterMobile: true };

  function getConfig() {
    return window.TS_AD_CONFIG || { client: '', slots: {} };
  }

  function getAdsterraZone(key) {
    if (!ADSTERRA_PLACEMENTS[key]) return null;
    var cfg = window.TS_ADSTERRA_CONFIG;
    return (cfg && cfg.zones && cfg.zones[key]) || null;
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

  function loadSlot(slot) {
    if (slot.dataset.loaded === 'true') return;
    slot.dataset.loaded = 'true';

    var key = placementKey(slot);
    var adsterraZone = getAdsterraZone(key);

    if (adsterraZone) {
      if (adsterraZone.type === 'native') {
        renderAdsterraNative(slot, adsterraZone);
      } else {
        renderAdsterraBanner(slot, adsterraZone);
      }
      return;
    }

    var cfg = getConfig();
    var slotId = key && cfg.slots ? cfg.slots[key] : null;

    if (cfg.client && slotId) {
      var format = key === 'sidebar' ? 'rectangle' : 'auto';
      renderRealAd(slot, cfg.client, String(slotId), format);
    } else {
      ensurePlaceholder(slot);
    }
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

    slots.forEach(function (slot) { observer.observe(slot); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
