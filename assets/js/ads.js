// ToolShoppy — ad slot lazy loader (stub until AdSense/Ezoic client ID is live)
(function () {
  'use strict';

  function initAds() {
    const slots = document.querySelectorAll('.ad-slot');
    if (!slots.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadSlot(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });

    slots.forEach((slot) => observer.observe(slot));
  }

  function loadSlot(slot) {
    // Placeholder text until real ad network script is wired in.
    // Real <ins class="adsbygoogle"> units (see CLAUDE.md ad template)
    // can replace this innerHTML once ca-pub IDs are issued.
    if (!slot.dataset.loaded) {
      slot.dataset.loaded = 'true';
      if (!slot.querySelector('ins')) {
        slot.textContent = 'Advertisement';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
