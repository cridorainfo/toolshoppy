// ToolShoppy — fuel price fetch helper
(function (global) {
  'use strict';

  var cache = null;
  var cacheTime = 0;
  var TTL = 60 * 60 * 1000;
  var MAX_AGE = 24 * 60 * 60 * 1000;

  function validate(data) {
    var updated = Date.parse(data.updated_at);
    if (!Number.isFinite(updated) || Date.now() - updated > MAX_AGE || updated > Date.now() + 60000) {
      throw new Error('Current fuel prices unavailable');
    }
    return data;
  }

  function fetchFuel(state) {
    var now = Date.now();
    if (!state && cache && now - cacheTime < TTL) {
      return Promise.resolve(cache);
    }
    var url = state ? '/api/fuel?state=' + encodeURIComponent(state) : '/api/fuel';
    return fetch(url, { cache: 'no-cache' })
      .then(function (res) {
        if (res.ok) return res.json();
        throw new Error('API ' + res.status);
      })
      .then(function (data) {
        validate(data);
        if (!state) {
          cache = data;
          cacheTime = now;
        }
        return data;
      })
      .catch(function () {
        return fetch('/api/fuel.json', { cache: 'no-cache' })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            validate(data);
            data.live = false;
            data.source_note = data.source_note || 'Cached snapshot — live feed temporarily unavailable';
            if (state && data.states && data.states[state]) {
              return { updated_at: data.updated_at, state: Object.assign({ key: state }, data.states[state]), live: false, source_note: data.source_note };
            }
            if (!state) {
              cache = data;
              cacheTime = now;
            }
            return data;
          });
      });
  }

  function formatFuel(n) {
    if (n == null || isNaN(n)) return '—';
    return '₹' + Number(n).toFixed(2) + '/L';
  }

  global.TSFuel = { fetchFuel: fetchFuel, formatFuel: formatFuel };
})(window);
