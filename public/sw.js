const CACHE_NAME = 'vviewer-static-v2';
const CORE_ASSETS = ['/', '/manifest.webmanifest'];
const STATIC_ASSET_PATTERN = /\.(?:js|mjs|css|woff2|woff|ttf|svg|png|jpg|jpeg|gif|webp|ico)$/i;

function shouldCacheRequest(requestUrl) {
  const { pathname } = requestUrl;

  if (pathname === '/sw.js') {
    return false;
  }

  if (pathname === '/' || pathname === '/index.html' || pathname === '/manifest.webmanifest') {
    return true;
  }

  if (pathname.startsWith('/assets/')) {
    return true;
  }

  return STATIC_ASSET_PATTERN.test(pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );

  // Activate updated worker immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigation = event.request.mode === 'navigate';

  // For app shell/navigation, prefer network to pick up fresh deployments.
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match('/');
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (!isSameOrigin || !shouldCacheRequest(requestUrl)) {
        return fetch(event.request)
          .catch(() => cached);
      }

      const networkUpdate = fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const cloned = response.clone();
          void caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });

          return response;
        });

      if (cached) {
        // Serve cached quickly, then refresh in background.
        void networkUpdate;
        return cached;
      }

      return networkUpdate.catch(() => {
        if (isSameOrigin) {
          return caches.match('/');
        }
        return undefined;
      });
    }),
  );
});
