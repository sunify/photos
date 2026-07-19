const CACHE_NAME = 'collage-v2';
const COLLAGE_URL = '/photos/collage/';

function extractUrls(text, baseUrl, contentType) {
  const patterns = [];

  if (contentType.includes('text/html')) {
    patterns.push(/(?:src|href|component-url|renderer-url|before-hydration-url)="([^"#]+)"/g);
  }

  if (contentType.includes('javascript')) {
    patterns.push(/(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/g);
  }

  if (contentType.includes('text/css')) {
    patterns.push(/url\(\s*["']?([^"')]+)["']?\s*\)/g);
  }

  return patterns.flatMap((pattern) =>
    Array.from(text.matchAll(pattern), (match) => match[1])
      .map((url) => new URL(url, baseUrl))
      .filter((url) => url.origin === self.location.origin),
  );
}

async function cacheResource(url, cache, visited) {
  const absoluteUrl = new URL(url, self.location.origin).href;

  if (visited.has(absoluteUrl)) {
    return;
  }
  visited.add(absoluteUrl);

  const response = await fetch(absoluteUrl, { cache: 'reload' });

  if (!response.ok) {
    throw new Error(`Could not cache ${absoluteUrl}: ${response.status}`);
  }

  await cache.put(absoluteUrl, response.clone());

  const contentType = response.headers.get('content-type') || '';
  const isText = contentType.includes('text/html')
    || contentType.includes('javascript')
    || contentType.includes('text/css');

  if (!isText) {
    return;
  }

  const text = await response.text();
  const childUrls = extractUrls(text, absoluteUrl, contentType);
  await Promise.all(childUrls.map((childUrl) => cacheResource(childUrl, cache, visited)));
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cacheResource(COLLAGE_URL, cache, new Set());
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
