const CACHE_NAME = 'customerconnect-v8';

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// On install, cache static shell assets (not index.html — that uses network-first)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/manifest.json',
        '/weekly-update.json',
        '/vocabulary-bundle.json',
        '/device-ecosystem-matrix.json',
        '/states-10m.json',
        '/tmo-logo-v4.svg',
        '/icon-192.svg',
        '/icon-512.svg',
      ]);
    })
  );
  // Activate immediately — don't wait for old SW to finish
  self.skipWaiting();
});

// On activate, claim all clients and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old cache versions
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      // Take control of all open tabs immediately
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    // For cross-origin, try cache then network
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Navigation requests — NETWORK FIRST so new deploys always load
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html')
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) =>
            cached || new Response('Offline — please reconnect and reload once.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
          )
        )
    );
    return;
  }

  // Time-sensitive JSON — network first so updates propagate
  if (url.pathname === '/weekly-update.json' || url.pathname === '/device-ecosystem-matrix.json' || url.pathname === '/vocabulary-bundle.json') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) =>
          cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } })
        ))
    );
    return;
  }

  // Hashed assets (JS/CSS with content hashes) — network first, fall back to cache
  // These filenames change on every build, so stale cache = white page
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) =>
            cached || new Response('', { status: 503 })
          )
        )
    );
    return;
  }

  // Everything else (SVGs, fonts, static files) — cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => new Response('', { status: 503 }));
    })
  );
});
