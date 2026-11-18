// ToolShoppy — petrol price SEO subpages
(function (global) {
  'use strict';

  function boot(stateKey) {
    var heroLabel = document.getElementById('heroLabel');
    var heroPetrol = document.getElementById('heroPetrol');
    var heroDiesel = document.getElementById('heroDiesel');
    var updatedLine = document.getElementById('updatedLine');
    var sourceLine = document.getElementById('sourceLine');

    // Request the selected state directly: a failure in another state's feed must
    // not leave this page empty, and its timestamp must belong to this quote.
    TSFuel.fetchFuel(stateKey).then(function (d) {
      updatedLine.innerHTML = 'Last updated: <strong>' + TSRates.formatUpdatedAt(d.updated_at) + '</strong>';
      if (sourceLine) sourceLine.textContent = (d.live ? '● Live' : '○ Cached') + ' · ' + (d.source_note || '');
      var s = d.state;
      if (!s) {
        heroLabel.textContent = 'Unavailable';
        return;
      }
      heroLabel.textContent = s.label;
      heroPetrol.textContent = TSFuel.formatFuel(s.petrol);
      heroDiesel.textContent = 'Diesel ' + TSFuel.formatFuel(s.diesel);
    }).catch(function () {
      updatedLine.textContent = 'Current fuel prices are unavailable. Check the price at your local pump.';
      if (sourceLine) sourceLine.textContent = 'Old snapshots are not shown as today’s prices.';
    });
  }

  global.TSFuelSEO = { boot: boot };
})(window);
