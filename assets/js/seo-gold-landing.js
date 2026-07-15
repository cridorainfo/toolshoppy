// ToolShoppy — gold rate SEO subpages (Kerala, Dubai, Mumbai)
(function (global) {
  'use strict';

  function fmtVal(g, key) {
    var fmt = g.currency === 'INR' ? TSRates.formatINR : TSRates.formatAED;
    return fmt(g.per_gram[key], g.currency === 'AED' ? 2 : 0);
  }

  function boot(cfg) {
    var region = cfg.region;
    var heroValue = document.getElementById('heroValue');
    var heroSub = document.getElementById('heroSub');
    var rateGrid = document.getElementById('rateGrid');
    var updatedLine = document.getElementById('updatedLine');
    var sourceLine = document.getElementById('sourceLine');

    function render(d) {
      var g = d.gold && d.gold[region];
      if (!g) {
        heroValue.textContent = '—';
        heroSub.textContent = 'Rate unavailable';
        return;
      }
      heroValue.textContent = fmtVal(g, '22k');
      heroSub.textContent = '22 Carat · per gram · ' + g.label;
      var cards = [
        { label: '24K / gram', value: fmtVal(g, '24k') },
        { label: '22K / gram', value: fmtVal(g, '22k') },
        { label: '18K / gram', value: fmtVal(g, '18k') },
      ];
      if (g.per_sovereign_8g) cards.push({ label: '22K / Sovereign (8g)', value: (g.currency === 'INR' ? TSRates.formatINR : TSRates.formatAED)(g.per_sovereign_8g['22k'], 0) });
      if (g.per_tola_11_664g) cards.push({ label: '22K / Tola', value: (g.currency === 'INR' ? TSRates.formatINR : TSRates.formatAED)(g.per_tola_11_664g['22k'], 0) });
      rateGrid.innerHTML = cards.map(function (c) {
        return '<div class="rate-card"><div class="rate-card-label">' + c.label + '</div><div class="rate-card-value">' + c.value + '</div></div>';
      }).join('');
    }

    TSRates.fetchRates().then(function (d) {
      updatedLine.innerHTML = 'Last updated: <strong>' + TSRates.formatUpdatedAt(d.updated_at) + '</strong>';
      if (sourceLine) sourceLine.textContent = (d.live ? '● Live' : '○ Cached') + ' · ' + (d.source_note || '');
      render(d);
    }).catch(function () {
      updatedLine.textContent = 'Could not load rates.';
    });
  }

  global.TSGoldSEO = { boot: boot };
})(window);
