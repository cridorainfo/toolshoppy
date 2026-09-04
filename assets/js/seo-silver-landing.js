// ToolShoppy — silver rate SEO subpages (Kerala districts, etc.)
(function (global) {
  'use strict';

  function boot(cfg) {
    var region = cfg.region;
    var heroValue = document.getElementById('heroValue');
    var heroSub = document.getElementById('heroSub');
    var rateGrid = document.getElementById('rateGrid');
    var updatedLine = document.getElementById('updatedLine');
    var sourceLine = document.getElementById('sourceLine');

    function render(d) {
      var s = d.silver && d.silver[region];
      if (!s) {
        heroValue.textContent = '—';
        heroSub.textContent = 'Rate unavailable';
        return;
      }
      var fmt = s.currency === 'INR' ? TSRates.formatINR : TSRates.formatAED;
      var dec = s.currency === 'AED' ? 2 : 0;
      heroValue.textContent = fmt(s.per_gram, dec);
      heroSub.textContent = 'per gram · ' + s.label;
      rateGrid.innerHTML =
        '<div class="rate-card"><div class="rate-card-label">Per gram</div><div class="rate-card-value">' + fmt(s.per_gram, dec) + '</div></div>' +
        '<div class="rate-card"><div class="rate-card-label">Per 10g</div><div class="rate-card-value">' + fmt(s.per_10g, dec) + '</div></div>' +
        '<div class="rate-card"><div class="rate-card-label">Per kg</div><div class="rate-card-value">' + fmt(s.per_kg, 0) + '</div></div>';
    }

    TSRates.fetchRates().then(function (d) {
      updatedLine.innerHTML = 'Last updated: <strong>' + TSRates.formatUpdatedAt(d.updated_at) + '</strong>';
      if (sourceLine) sourceLine.textContent = (d.live ? '● Live' : '○ Cached') + ' · ' + (d.source_note || '');
      render(d);
    }).catch(function () {
      updatedLine.textContent = 'Could not load rates.';
    });
  }

  global.TSSilverSEO = { boot: boot };
})(window);
