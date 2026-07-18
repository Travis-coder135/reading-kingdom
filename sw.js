/*
 * Reading Kingdom — Service Worker (offline cache)
 * =============================================================================
 * Makes the app installable and playable offline. Strategy:
 *   - Precache the app shell on install (cache-first thereafter).
 *   - Runtime-cache anything else successfully fetched (e.g. audio clips the
 *     owner adds later), so it's available offline next time.
 *   - Missing files (audio clips not yet recorded) simply fail the fetch; the
 *     app's Audio2 handles that by falling back to speech synthesis.
 *
 * Bump CACHE_VERSION whenever the shell files change to force an update.
 */
var CACHE_VERSION = 'reading-kingdom-v3';

var APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './data/curriculum.js',
  './js/emoji.js',
  './js/audio.js',
  './js/progress.js',
  './js/engine.js',
  './js/main.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/icon-180.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // addAll fails if ANY file is missing; add individually so a missing
      // optional asset can't block the whole install.
      return Promise.all(APP_SHELL.map(function (url) {
        return cache.add(url).catch(function () { /* skip missing */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        // Cache good same-origin responses for next time (incl. added audio).
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () {
        // Offline and not cached — for navigations, fall back to the shell.
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});
