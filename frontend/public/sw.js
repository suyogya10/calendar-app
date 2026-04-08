self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('calendar-pwa-v1').then((cache) => cache.addAll(['/']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open('calendar-pwa-v1').then((cache) => {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
