// ToolShoppy — petrol price SEO subpages
(function (global) {
  'use strict';

  function boot(stateKey) {
    var heroLabel = document.getElementById('heroLabel');
    var heroPetrol = document.getElementById('heroPetrol');
    var heroDiesel = document.getElementById('heroDiesel');
    var updatedLine = document.getElementById('updatedLine');
    var sourceLine = document.getElementById('sourceLine');

    TSFuel.fetchFuel().then(function (d) {
      updatedLine.innerHTML = 'Last updated: <strong>' + TSRates.formatUpdatedAt(d.updated_at) + '</strong>';
      if (sourceLine) sourceLine.textContent = (d.live ? '● Live' : '○ Cached') + ' · ' + (d.source_note || '');
      var s = d.states && d.states[stateKey];
      if (!s) {
        heroLabel.textContent = 'Unavailable';
        return;
      }
      heroLabel.textContent = s.label;
      heroPetrol.textContent = TSFuel.formatFuel(s.petrol);
      heroDiesel.textContent = 'Diesel ' + TSFuel.formatFuel(s.diesel);
    }).catch(function () {
      updatedLine.textContent = 'Could not load fuel prices.';
    });
  }

  global.TSFuelSEO = { boot: boot };
})(window);
