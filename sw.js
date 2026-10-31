// Service Worker per PWA WebGIS Studio Tecnico Giurato & Iacono
const CACHE_NAME = 'webgis-pwa-v13';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/mappa.html',
  '/qr-mappa.html',
  '/style.css',
  '/script.js',
  '/data/pf/index.js',
  '/data/pf/helmert.js',
  '/data/pf/H574.js',
  '/data/dis/index.js',
  '/data/dis/H574.js',
  '/data/monografie/index.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache incompleto (verrà completato al volo):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategia Network First con fallback a Cache per l'app e cache di asset
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Non cachare tile WMS dell'Agenzia delle Entrate, Google Maps o SITR per evitare overflow di memoria
  if (
    url.hostname.includes('wms.cartografia.agenziaentrate.gov.it') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('sitr.regione.sicilia.it') ||
    url.hostname.includes('openstreetmap.org')
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200 && req.method === 'GET') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});
