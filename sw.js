/* ============================================================================
   Ἑλληνικὴ Παιδεία — Service Worker (v43)
   
   캐시 전략:
   - CRITICAL_SHELL: install 시 즉시 캐시 (≈150 KB) — 첫 SW 활성 빠름
                     단, index.html 은 network-first (아래) — 새 HTML 즉시 전파 (v41)
   - DATA_BUNDLE:    install 후 백그라운드 비동기 캐시 (≈1.3 MB gzip)
                     v43: data-dialogues.js 추가 — 콩트 장면 6개
   - espeakng.*.js, espeakng.worker.data: lazy — 사용자가 eSpeak NG 시스템을 처음
                     선택했을 때만 받아옴. 같은 origin 요청이므로 일반 fetch
                     intercept가 자동으로 캐시한다 (v36).
   - 학자 낭독 자원 (ancientgreek.eu mp3, soundcloud.com): cross-origin 으로
                     SW 가 가로채지 않음 (아래 url.origin 체크). 브라우저 기본
                     처리. v42 의 SCHOLAR_AUDIO 카탈로그가 이들을 참조.
   - Wikimedia 이미지: cache-first (이미지는 거의 안 변함, 한국→Wikimedia
                                     latency 절감, 두 번째 사용부터 즉시)
   - Google Fonts: stale-while-revalidate
   
   새 버전 배포 시 CACHE_VERSION만 올리면 됩니다.
   ============================================================================ */
const CACHE_VERSION = 'v75';
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
  './data-dialogues.js',
  './data-translations.js',   // v52: 원문 한국어 정역
  './data-characters.js',     // v53: 캐릭터 사진 URL 메타데이터
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

  // ── index.html (또는 navigation): network-first (v41) ──
  // cache-first 였던 v40 에서는 경로 변경(예: espeak/ 평탄화) 후 옛 HTML 이
  // 한 사이클 더 서빙되어 사용자가 옛 자원 경로를 요청하는 race window 가 있었다.
  // HTML 만 network-first 로 분기하여 다음 방문 즉시 새 코드가 전파되도록 한다.
  const isHTML = req.mode === 'navigate'
              || url.pathname === '/'
              || url.pathname.endsWith('/')
              || url.pathname.endsWith('/index.html')
              || url.pathname.endsWith('index.html');
  if (isHTML && req.method === 'GET') {
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
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

// 강제 업데이트 트리거 + 버전 조회 (v41: 진단 modal 용)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data === 'getVersion') {
    // MessageChannel port 응답 우선, 없으면 source 직접 응답
    const reply = { type: 'version', version: CACHE_VERSION };
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(reply);
    } else if (event.source && event.source.postMessage) {
      event.source.postMessage(reply);
    }
  }
});
