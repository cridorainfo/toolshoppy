// ToolShoppy — live rates fetch + formatting (gold, silver, currency)
(function (global) {
  'use strict';

  var cache = null;
  var cacheTime = 0;
  var TTL = 5 * 60 * 1000;
  var TROY_OZ_GRAMS = 31.1034768;

  var GR_HEADERS = {
    Accept: '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'X-OIGT-Header': 'GITPL',
  };

  function parseInr(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var m = raw.replace(/[₹\u20b9]/g, '').match(/[\d,]+(?:\.\d+)?/);
    if (!m) return null;
    var v = parseFloat(m[0].replace(/,/g, ''));
    return v > 0 && v < 500000 ? Math.round(v * 100) / 100 : null;
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function fetchJson(url, extraHeaders) {
    var headers = Object.assign({}, GR_HEADERS, extraHeaders || {});
    return fetch(url, { headers: headers })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (text) {
        text = text.trim();
        if (!text || text.charAt(0) === '<') throw new Error('Not JSON');
        return JSON.parse(text);
      });
  }

  function fetchGoodreturnsGold(region, day) {
    var slug = region === 'india' ? 'india' : 'kerala';
    var base = 'https://www.goodreturns.in/gold-rates/' + slug + '.html';
    var url = base + '?gr_db_dynamic_content=metal_past_price&date=' + day;
    return fetchJson(url, { Referer: base }).then(function (data) {
      var k24 = parseInr(data.gold_price_24K);
      var k22 = parseInr(data.gold_price_22K);
      var k18 = parseInr(data.gold_price_18K);
      if (!k22 && !k24) return null;
      var g24 = k24 || (k22 ? Math.round((k22 / 0.916) * 100) / 100 : null);
      var g22 = k22 || (g24 ? Math.round(g24 * 0.916 * 100) / 100 : null);
      var g18 = k18 || (g24 ? Math.round(g24 * 0.75 * 100) / 100 : null);
      return {
        per_gram: { '24k': g24, '22k': g22, '18k': g18 },
        per_10g: { '24k': g24 ? Math.round(g24 * 10) : null, '22k': g22 ? Math.round(g22 * 10) : null },
        per_sovereign_8g: { '22k': g22 ? Math.round(g22 * 8) : null },
      };
    });
  }

  function fetchGoodreturnsSilver(day) {
    var base = 'https://www.goodreturns.in/silver-rates/kerala.html';
    var url = base + '?gr_db_dynamic_content=metal_past_price&date=' + day;
    return fetchJson(url, { Referer: base }).then(function (data) {
      var perGram = parseInr(data.silver_price_1G);
      if (!perGram) {
        var perKg = parseInr(data.silver_price_1KG);
        if (perKg) perGram = Math.round((perKg / 1000) * 100) / 100;
      }
      if (!perGram) return null;
      return {
        per_gram: perGram,
        per_10g: Math.round(perGram * 10),
        per_kg: Math.round(perGram * 1000),
      };
    });
  }

  function buildUaeGold(dahab) {
    var usd = dahab.perGramUsd;
    var fx = dahab.currencies;
    function mul(k) { return Math.round(usd[k] * fx.AED * 100) / 100; }
    var g24 = mul('24k');
    var g22 = mul('22k');
    var g18 = mul('18k');
    var tola = 11.6638;
    return {
      label: 'UAE (Dubai)',
      currency: 'AED',
      per_gram: { '24k': g24, '22k': g22, '18k': g18 },
      per_10g: { '24k': Math.round(g24 * 10), '22k': Math.round(g22 * 10) },
      per_tola_11_664g: { '24k': Math.round(g24 * tola), '22k': Math.round(g22 * tola) },
    };
  }

  function buildUaeSilver(xagUsd, aedPerUsd) {
    var usdPerGram = xagUsd / TROY_OZ_GRAMS;
    var perGram = Math.round(usdPerGram * aedPerUsd * 100) / 100;
    return {
      label: 'UAE (Dubai)',
      currency: 'AED',
      per_gram: perGram,
      per_10g: Math.round(perGram * 10 * 100) / 100,
      per_kg: Math.round(perGram * 1000),
    };
  }

  function buildCurrencyTable(dahab, inrPerUsd) {
    var fx = dahab.currencies;
    var inrPerUnit = { INR: 1 };
    Object.keys(fx).forEach(function (code) {
      if (code === 'USD') {
        inrPerUnit.USD = Math.round(inrPerUsd * 100) / 100;
      } else if (code !== 'EGP') {
        inrPerUnit[code] = Math.round((inrPerUsd / fx[code]) * 100) / 100;
      }
    });
    if (!inrPerUnit.USD) inrPerUnit.USD = Math.round(inrPerUsd * 100) / 100;
    return {
      updated_at: new Date().toISOString(),
      inr_per_unit: inrPerUnit,
      symbols: {
        INR: '₹', AED: 'AED', SAR: 'SAR', USD: '$', KWD: 'KWD', OMR: 'OMR',
        EUR: '€', GBP: '£', QAR: 'QAR', BHD: 'BHD',
      },
      names: {
        INR: 'Indian Rupee', AED: 'UAE Dirham', SAR: 'Saudi Riyal', USD: 'US Dollar',
        KWD: 'Kuwaiti Dinar', OMR: 'Omani Rial', EUR: 'Euro', GBP: 'British Pound',
        QAR: 'Qatari Riyal', BHD: 'Bahraini Dinar',
      },
    };
  }

  function fetchLiveRatesClient() {
    var day = todayIso();
    return Promise.all([
      fetch('https://dahabpulse.com/api/widget-prices').then(function (r) { return r.json(); }),
      fetchGoodreturnsGold('kerala', day).catch(function () { return null; }),
      fetchGoodreturnsSilver(day).catch(function () { return null; }),
      fetch('https://api.gold-api.com/price/XAG').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=INR').then(function (r) { return r.json(); }).catch(function () { return null; }),
    ]).then(function (parts) {
      var dahab = parts[0];
      var keralaGold = parts[1];
      var keralaSilver = parts[2];
      var xag = parts[3];
      var forex = parts[4];
      var inrPerUsd = forex && forex.rates ? forex.rates.INR : 86;
      if (!dahab || !dahab.perGramUsd) throw new Error('DahabPulse unavailable');

      function indiaFromSpot() {
        var usd = dahab.perGramUsd;
        function inr(k) { return Math.round(usd[k] * inrPerUsd); }
        var g24 = inr('24k');
        var g22 = inr('22k');
        var g18 = inr('18k');
        return {
          per_gram: { '24k': g24, '22k': g22, '18k': g18 },
          per_10g: { '24k': g24 * 10, '22k': g22 * 10 },
          per_sovereign_8g: { '22k': g22 * 8 },
        };
      }

      var indiaGold = keralaGold || indiaFromSpot();
      var indiaSilver = keralaSilver || (xag && xag.price ? {
        per_gram: Math.round((xag.price / TROY_OZ_GRAMS) * inrPerUsd),
        per_10g: Math.round((xag.price / TROY_OZ_GRAMS) * inrPerUsd * 10),
        per_kg: Math.round((xag.price / TROY_OZ_GRAMS) * inrPerUsd * 1000),
      } : null);

      return {
        updated_at: dahab.updatedAt || new Date().toISOString(),
        source_note: keralaGold
          ? 'Live · Goodreturns (Kerala) + DahabPulse (UAE)'
          : 'Live · DahabPulse spot × USD/INR (Kerala board unavailable in browser)',
        live: true,
        gold: {
          kerala: { label: 'Kerala', currency: 'INR', label_note: keralaGold ? 'Goodreturns' : 'Spot estimate', ...indiaGold },
          india: { label: 'India', currency: 'INR', ...indiaGold },
          uae: buildUaeGold(dahab),
        },
        silver: {
          kerala: indiaSilver ? { label: 'Kerala', currency: 'INR', ...indiaSilver } : null,
          india: indiaSilver ? { label: 'India', currency: 'INR', ...indiaSilver } : null,
          uae: xag && xag.price ? buildUaeSilver(xag.price, dahab.currencies.AED) : null,
        },
        history: null,
        currency: buildCurrencyTable(dahab, inrPerUsd),
      };
    });
  }

  function fetchRates() {
    if (cache && Date.now() - cacheTime < TTL) {
      return Promise.resolve(cache);
    }

    function store(data) {
      cache = data;
      cacheTime = Date.now();
      return data;
    }

    return fetch('/api/rates', { cache: 'no-cache' })
      .then(function (res) {
        if (res.ok) return res.json();
        throw new Error('API ' + res.status);
      })
      .then(store)
      .catch(function () {
        return fetchLiveRatesClient().then(store);
      })
      .catch(function () {
        return fetch('/api/rates.json', { cache: 'no-cache' })
          .then(function (res) {
            if (!res.ok) throw new Error('Static fallback unavailable');
            return res.json();
          })
          .then(function (data) {
            data.source_note = (data.source_note || '') + ' (cached fallback — deploy /api/rates for live)';
            data.live = false;
            return store(data);
          });
      });
  }

  function formatINR(n, decimals) {
    decimals = decimals === undefined ? 0 : decimals;
    if (n == null || isNaN(n)) return '—';
    return '₹' + Number(n).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatAED(n, decimals) {
    decimals = decimals === undefined ? 2 : decimals;
    if (n == null || isNaN(n)) return '—';
    return 'AED ' + Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatMoney(amount, currency, decimals) {
    if (amount == null || isNaN(amount)) return '—';
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
    var clean = values.filter(function (v) { return v != null && !isNaN(v); });
    if (!clean.length) return;
    var max = Math.max.apply(null, clean);
    var min = Math.min.apply(null, clean);
    var range = max - min || 1;
    container.innerHTML = '';
    values.forEach(function (v, i) {
      if (v == null || isNaN(v)) return;
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
