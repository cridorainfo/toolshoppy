// ToolShoppy — minimal service worker
// Goals: (1) make the site installable (Add to Home Screen / desktop install —
// Chrome requires an active SW with a fetch handler for the install prompt to
// fire), (2) instant repeat loads of the app shell, (3) NEVER serve stale rate
// data — gold/silver/petrol prices change daily, so navigations and /api/*
// calls always go to the network first.
'use strict';

var CACHE_NAME = 'toolshoppy-shell-v1';
var SHELL_URLS = [
  '/',
  '/manifest.json',
  '/assets/css/main.css?v=4',
  '/assets/js/core.js',
  '/assets/icons/sprite.svg',
  '/assets/img/logo.png?v=2',
  '/assets/img/icon-192.png?v=2',
  '/assets/img/icon-512.png?v=2',
  '/favicon.ico?v=2',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_URLS).catch(function () {
        // Best-effort — a single missing asset shouldn't block install.
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isStaticAsset(url) {
  return /\.(css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname);
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin (ads, analytics, rate APIs on other domains)
  if (url.pathname.indexOf('/api/') === 0) return; // live rates/fuel data — always network, let the page's own fallback chain handle failures

  if (req.mode === 'navigate') {
    // HTML pages: network-first so content (and any rate/tool logic) is always
    // fresh when online; fall back to the cached shell only when offline.
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) { return cached || caches.match('/'); });
      })
    );
    return;
  }

  if (isStaticAsset(url)) {
    // Static, cache-busted assets: cache-first for speed, refresh in the background.
    event.respondWith(
      caches.match(req).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
          }
          return res;
        }).catch(function () { return cached; });
        return cached || network;
      })
    );
  }
});
