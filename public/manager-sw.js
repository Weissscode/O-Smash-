const MANAGER_CACHE = 'osmash-manager-shell-v1';
const MANAGER_SHELL = [
  '/gestion',
  '/manifest-manager.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(MANAGER_CACHE).then(cache => cache.addAll(MANAGER_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('osmash-manager-shell-') && key !== MANAGER_CACHE)
        .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(MANAGER_CACHE).then(cache => cache.put('/gestion', copy));
        return response;
      }).catch(() => caches.match('/gestion'))
    );
  }
});

