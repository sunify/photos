const CACHE_NAME = 'collage-v1';
const COLLAGE_URL = '/photos/collage/';

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(COLLAGE_URL, { cache: 'reload' });

  if (!response.ok) {
    throw new Error(`Could not cache collage page: ${response.status}`);
  }

  await cache.put(COLLAGE_URL, response.clone());

  const html = await response.text();
  const urls = Array.from(html.matchAll(/(?:src|href)="([^"#]+)"/g), (match) => match[1])
    .map((url) => new URL(url, self.location.origin))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.href);

  await Promise.allSettled(urls.map((url) => cache.add(url)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('collage-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(COLLAGE_URL, copy));
          return response;
        })
        .catch(() => caches.match(COLLAGE_URL)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
