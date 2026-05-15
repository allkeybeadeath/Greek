# Ἑλληνικὴ Παιδεία — PWA 설치 가이드

CIM Lab 고전 그리스어 학습기. 단일 HTML + 서비스 워커로 작동하는 Progressive Web App.

## 파일 목록

```
index.html               # 본체 (1.5 MB) — 어휘 1011 + 문법 34 + 전집 8 + 발췌 34 + AGDT 분석
manifest.json            # PWA 메타데이터
sw.js                    # 서비스 워커 (오프라인 캐싱)
icon.svg                 # 마스터 아이콘 (벡터)
icon-192.png             # Android 표준
icon-512.png             # Android·Chrome 권장
apple-touch-icon.png     # iOS 홈 화면 (180px)
```

## 호스팅 — 5분 셋업

### 옵션 A: GitHub Pages (추천, 무료)

1. github.com에서 새 repo 생성 (예: `greek`)
2. 위 7개 파일을 모두 업로드 (드래그&드롭 가능)
3. Settings → Pages → Source: `main` branch, root → Save
4. 약 1분 후 URL 발급: `https://<username>.github.io/greek/`
5. 끝. 새 버전은 같은 파일명으로 push만 하면 됩니다.

### 옵션 B: Netlify Drop

1. https://app.netlify.com/drop 에서 폴더 통째로 드래그
2. 임의 URL 즉시 발급 (`xxx.netlify.app`)
3. 갱신은 새 폴더 드래그로 덮어쓰기

### 옵션 C: 연구실 자체 서버

```
scp -r pwa/* user@cim-lab-server:/var/www/html/greek/
```

조건: 반드시 **HTTPS** (서비스 워커 요구). HTTP면 localhost 외 작동 안 함.

## 모바일 설치

### iPhone / iPad (Safari)
1. URL 열기
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면 아이콘 탭 → 전체 화면 앱처럼 실행

### Android (Chrome)
1. URL 열기
2. 주소창 옆 "설치" 버튼 또는 메뉴 → "앱 설치"
3. 홈 화면 아이콘 탭 → 전체 화면 앱

설치 후 **인터넷 없이도** 작동합니다 (Wikimedia 사진 제외 — 첫 로드 후 캐시됨).

## 콘텐츠 업데이트 워크플로우

1. claude.ai에서 새 버전 받기 → `greek-unified.html` 다운로드
2. `index.html`로 이름 변경 → 같은 호스팅에 덮어쓰기
3. `sw.js` 의 `CACHE_VERSION` 을 `'v2'`, `'v3'` … 로 올려서 push
4. 사용자가 앱을 열면 "새 버전 사용 가능" 토스트 → 새로고침 한 번으로 갱신

`CACHE_VERSION` 을 올리지 않으면 사용자는 캐시된 옛 버전을 계속 봅니다 — **잊지 마세요**.

## 라이브 순위 작동 조건

- claude.ai 아티팩트 환경: `window.storage` 사용 — 같은 아티팩트 사용자끼리 자동 공유
- PWA (GitHub Pages 등): `localStorage` 사용 — **개인 진행만 저장, 라이브 순위 비활성화**
- 라이브 순위가 PWA에서도 작동하려면 Firebase·Supabase 등 백엔드 추가 필요 (별도 작업)

## 데이터 보존

- 진행 상황은 브라우저 `localStorage` 에 저장됩니다
- 같은 도메인·같은 브라우저면 영구 보존
- 다른 기기로 이전: 명예의 전당 → "진행 내보내기 (JSON)" → 새 기기에서 동일 파일 import 기능은 향후 추가 예정 (현재는 JSON 직접 편집)

## 라이선스 / 출처

- 그리스어 원문: Perseus Digital Library `canonical-greekLit` (CC BY-SA 3.0)
- 형태분석: AGDT v2.1 (CC BY-SA 3.0)
- 사진: Wikimedia Commons Public Domain
- 어휘 한국어 풀이: LSJ 기반 (CIM Lab 작성, 검수 진행 중)
