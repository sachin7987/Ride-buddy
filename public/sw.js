/* RideBuddy service worker
 * Strategy:
 *   • Static assets (Next build chunks, icons, leaflet css)  → cache-first
 *   • Navigation requests (HTML pages)                       → network-first
 *   • API + auth requests (POST/PATCH, /api/*, /auth/*)      → never cached
 *   • Offline fallback page when network is down
 *
 * Bump CACHE_VERSION whenever you change cached behaviour.
 */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `ridebuddy-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ridebuddy-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Same-origin only
  if (url.origin !== self.location.origin) return;

  // Never cache auth, API, or non-GET requests — these mutate or auth state.
  if (request.method !== "GET") return;
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  ) {
    return;
  }

  // HTML page navigations: network-first, fall back to cached page or offline.
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Static assets (JS chunks, CSS, images, fonts): cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});
