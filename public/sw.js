const CACHE_NAME = 'resumeforge-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo/resumeforge-logo.svg',
  '/logo/resumeforge-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
