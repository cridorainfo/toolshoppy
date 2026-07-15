// ToolShoppy — rates fetch + formatting (gold, silver, currency)
(function (global) {
  'use strict';

  var cache = null;
  var cacheTime = 0;
  var TTL = 5 * 60 * 1000;

  function fetchRates() {
    if (cache && Date.now() - cacheTime < TTL) {
      return Promise.resolve(cache);
    }
    return fetch('/api/rates.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('Rates unavailable');
        return res.json();
      })
      .then(function (data) {
        cache = data;
        cacheTime = Date.now();
        return data;
      });
  }

  function formatINR(n, decimals) {
    decimals = decimals === undefined ? 0 : decimals;
    return '₹' + Number(n).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatAED(n, decimals) {
    decimals = decimals === undefined ? 2 : decimals;
    return 'AED ' + Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatMoney(amount, currency, decimals) {
    if (currency === 'INR') return formatINR(amount, decimals);
    if (currency === 'AED') return formatAED(amount, decimals);
    return currency + ' ' + Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: decimals || 2,
      maximumFractionDigits: decimals || 2,
    });
  }

  function formatUpdatedAt(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch (e) {
      return iso;
    }
  }

  function convertCurrency(amount, from, to, rates) {
    var table = rates.currency.inr_per_unit;
    if (!table[from] || !table[to]) return null;
    var inr = amount * table[from];
    return inr / table[to];
  }

  function renderTrendBars(container, values, labels) {
    if (!container || !values || !values.length) return;
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    var range = max - min || 1;
    container.innerHTML = '';
    values.forEach(function (v, i) {
      var bar = document.createElement('div');
      bar.className = 'rate-trend-bar';
      var pct = 30 + ((v - min) / range) * 70;
      bar.style.height = pct + '%';
      bar.title = (labels && labels[i] ? labels[i] + ': ' : '') + v;
      container.appendChild(bar);
    });
  }

  global.TSRates = {
    fetchRates: fetchRates,
    formatINR: formatINR,
    formatAED: formatAED,
    formatMoney: formatMoney,
    formatUpdatedAt: formatUpdatedAt,
    convertCurrency: convertCurrency,
    renderTrendBars: renderTrendBars,
  };
})(window);
