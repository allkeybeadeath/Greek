/* ============================================================================
   Ἑλληνικὴ Παιδεία — Service Worker
   캐시 전략: cache-first for shell (HTML/icons/manifest), network-first for
   외부 도기 사진 (Wikimedia). 새 버전 배포 시 CACHE_VERSION만 올리면 됩니다.
   ============================================================================ */
const CACHE_VERSION = 'v17';
const CACHE_NAME = `paideia-${CACHE_VERSION}`;
const SHELL = [
  './',
  './index.html',
  './data-works.js',
  './data-morph.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Wikimedia 사진은 network-first, 실패 시 캐시
  if (url.hostname.includes('wikimedia.org') || url.hostname.includes('wikipedia.org')) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Google Fonts 등 외부 자원 — 캐시 후 백그라운드 갱신
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Perseus / Logeion / 기타 — 외부 사전 (네트워크 그대로)
  if (url.origin !== self.location.origin) {
    return; // 브라우저 기본 처리
  }

  // 앱 shell — cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((res) => {
        if (res.ok && req.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      });
    })
  );
});

// 메시지로 강제 업데이트 트리거
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
