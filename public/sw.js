const CACHE = "nevaeh-offline-v1";
const PRECACHE = ["/", "/index.html", "/manifest.webmanifest", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

function cacheable(url) {
  if (url.origin === self.location.origin) return true;
  return url.hostname.includes("fonts.gstatic.com") || url.hostname.includes("fonts.googleapis.com");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname === "/sw.js") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => {
            c.put("/", copy);
            c.put("/index.html", copy.clone());
          });
          return res;
        })
        .catch(() => caches.match("/") || caches.match("/index.html")),
    );
    return;
  }

  if (!cacheable(url)) return;

  event.respondWith(
    caches.match(req).then((hit) => {
      const pending = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || pending;
    }),
  );
});
