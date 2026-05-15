/* ============================================================================
   Ἑλληνικὴ Παιδεία — Service Worker (v18)
   
   캐시 전략:
   - CRITICAL_SHELL: install 시 즉시 캐시 (≈150 KB) — 첫 SW 활성 빠름
   - DATA_BUNDLE:    install 후 백그라운드 비동기 캐시 (≈1.3 MB gzip)
                     → install 실패 위험 감소, 첫 SW 활성 즉시
   - Wikimedia 이미지: cache-first (이미지는 거의 안 변함, 한국→Wikimedia
                                     latency 절감, 두 번째 사용부터 즉시)
   - Google Fonts: stale-while-revalidate
   
   새 버전 배포 시 CACHE_VERSION만 올리면 됩니다.
   ============================================================================ */
const CACHE_VERSION = 'v34';
const CACHE_NAME    = `paideia-${CACHE_VERSION}`;
const IMG_CACHE     = `paideia-img-${CACHE_VERSION}`;

// 필수 셸 — install 시 동기 캐시 (없으면 앱 자체가 안 뜸)
const CRITICAL_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './apple-touch-icon.png',
];

// 무거운 데이터 — install 후 비동기 캐시 (먼저 페이지 보여주고, 백그라운드로 받기)
const DATA_BUNDLE = [
  './data-works.js',
  './data-morph.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CRITICAL_SHELL))   // 셸만 동기 캐시 → 빠른 install
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 오래된 캐시 정리 (이전 버전)
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== IMG_CACHE).map(k => caches.delete(k))
      );
      await self.clients.claim();

      // 데이터 번들 백그라운드 캐시 — 페이지는 이미 사용 가능 상태에서 진행
      try {
        const cache = await caches.open(CACHE_NAME);
        await Promise.all(DATA_BUNDLE.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res.ok) await cache.put(url, res);
          } catch (e) { /* 다음 fetch 때 재시도 */ }
        }));
      } catch (e) { /* 무시 — 다음 활성 시 재시도 */ }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ── Wikimedia 이미지: cache-first (변경 거의 없음, 한국 지연 절감) ──
  if (url.hostname.includes('wikimedia.org') || url.hostname.includes('wikipedia.org')) {
    event.respondWith(
      caches.open(IMG_CACHE).then(cache =>
        cache.match(req).then(cached => {
          if (cached) return cached;  // 한 번 받으면 영구 캐시
          return fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => null);
        })
      )
    );
    return;
  }

  // ── Google Fonts: stale-while-revalidate (캐시 즉시, 백그라운드 갱신) ──
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // ── Perseus / Logeion / 기타 외부 사전: 브라우저 기본 처리 ──
  if (url.origin !== self.location.origin) {
    return;
  }

  // ── 앱 셸 + 데이터: cache-first + 미스 시 fetch+캐시 ──
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        if (res.ok && req.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      })
    )
  );
});

// 강제 업데이트 트리거
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
