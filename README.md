# Ἑλληνικὴ Παιδεία — PWA 설치 가이드 (v2)

고전 그리스어 학습기. 단일 HTML + 서비스 워커로 작동하는 Progressive Web App. **개인 프로젝트.**

## 파일 목록

```
index.html               # 본체 — 어휘 · 문법 토픽 139 · 초보자 60일 과정 · 원문 읽기 · 배틀 …
data-units.js            # v72 문법 유닛 40 (Chase & Phillips 1~40과 진도, 새로 지은 연습문제 1,214문항)
units-src/ · tools/      # 유닛 원본과 빌드·검증 도구 (python3 tools/build_units.py)
manifest.json            # PWA 메타데이터
sw.js                    # 서비스 워커 (오프라인 캐싱, CACHE_VERSION='v76')
icon.svg / icon-192.png / icon-512.png / apple-touch-icon.png
```

## v72 — 교재 유닛 문법

문법 탭이 교재(Chase & Phillips, *A New Introduction to Greek*)의 과 순서를 따르는 **40개 유닛**이 되었습니다.
유닛마다 문법 설명 · 새 낱말 · 연습문제(형태 분석 · 해석 · 작문)가 있고, 세 묶음 모두 70% 이상이면 유닛 완료입니다.
연습문제는 교재 문장을 옮기지 않고 **그 과까지의 어휘 · 문법만으로 새로 지었습니다** (교재는 저작권 보호 중 — 1989 갱신 RE440155).
자세한 내용은 `CHANGELOG_v72.md`.

## v2 신규 사항

**전집 5편 추가** — 헤시오도스 *신통기* / *일과 날*, 소포클레스 *안티고네*, 플라톤 *에우티프론*, 헤로도토스 *역사* 1권 §1–30. 총 **13편**.

**AGDT 분석 5편 확장** — 위 5편 모두 검증된 형태분석 제공. 룩업 항목 **5,816 → 19,875**.

**Firebase 라이브 순위** — 자체 호스팅에서도 사용자 간 순위 공유 가능 (설정 필요, 아래 참조).

## 호스팅 — 기본 셋업

### GitHub Pages (추천, 무료)

1. github.com에서 새 repo 생성
2. 7개 파일 모두 업로드
3. Settings → Pages → Source: `main` branch, root → Save
4. 1분 후 `https://<username>.github.io/<repo>/` 발급

### Netlify Drop / Cloudflare Pages / 자체 서버
- 모두 가능. **HTTPS 필수** (서비스 워커 요구사항).

## 라이브 순위 (Firebase) — 5분 셋업

기본은 `FIREBASE_URL`이 비어 있어 라이브 순위가 꺼져 있습니다. 켜려면:

### 1) Firebase 프로젝트 생성

1. https://console.firebase.google.com → Google 로그인
2. **Add project** → 이름 `paideia` → Continue
3. Analytics 꺼도 됩니다 → Create

### 2) Realtime Database 활성화

1. 좌측 메뉴 **Build → Realtime Database**
2. **Create Database** → 지역 (asia-southeast1 권장) → **Start in test mode**
3. 상단 URL 복사 — 예: `https://paideia-xxxxx-default-rtdb.firebaseio.com/`

### 3) 규칙 설정 (30일 자동 만료 방지)

**Rules** 탭에 붙여넣고 **Publish** — **연구실 내부용 (모든 경로 허용)**:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠ **중요 (v59 갱신)**: v52 이후 추가된 경로 — `battles` (방 만들기), `lobby` (큐 입장·자동 매치), `feedback` (건의 사항), `presence` (동시 학습자) — 가 작동하려면 위 규칙처럼 *루트 수준 read/write 허용* 필요. 이전 버전 안내 (`lb` 만 허용) 를 사용하면 멀티 배틀과 큐 입장이 **차단**된다. 자가진단: 홈 → 진단 → 🔬 Firebase 자가진단.

연구실 내부용으로 충분. 더 엄격한 인증이 필요하면 Firebase Auth 추가 후 `auth != null` 로 조건 강화.

### 4) index.html에 URL 입력

`index.html` 텍스트 편집기로 열고 `FIREBASE_URL` 검색 → 빈 따옴표 안에 URL 붙여넣기:

```javascript
const FIREBASE_URL = 'https://paideia-xxxxx-default-rtdb.firebaseio.com';
```

저장 → 재업로드. 끝. 명예의 전당에 모든 사용자의 순위가 자동 동기화됩니다.

무료 한도: 월 10GB 다운로드, 1GB 저장 — 연구실 규모로 충분.

## 모바일 설치

**iPhone/iPad (Safari)**: URL → 공유 → "홈 화면에 추가"

**Android (Chrome)**: URL → 주소창 옆 "설치" 또는 메뉴 → "앱 설치"

설치 후 인터넷 없이도 작동 (Wikimedia 사진 제외).

## 콘텐츠 업데이트 워크플로우

1. claude.ai에서 새 버전 받기 → `greek-unified.html` 다운로드
2. `index.html`로 이름 변경 → 같은 호스팅에 덮어쓰기
3. **`sw.js`의 `CACHE_VERSION`을 한 단계 올려서** push (`'v2'` → `'v3'`)
4. 사용자에게 "새 버전 사용 가능" 토스트 → 새로고침 한 번으로 갱신

CACHE_VERSION 안 올리면 사용자는 캐시된 옛 버전 계속 봅니다.

## 환경별 라이브 순위 작동표

| 환경 | 라이브 순위 |
|---|---|
| claude.ai 아티팩트 | ✅ window.storage shared:true |
| PWA + Firebase URL 설정 | ✅ Firebase Realtime DB |
| PWA, Firebase 미설정 | ❌ localStorage만 (개인 전용) |
| 메모리 모드 (시크릿 등) | ❌ 새로고침 시 초기화 |

## 라이선스 / 출처

- 원문: Perseus DL `canonical-greekLit` (CC BY-SA 3.0)
- 형태분석: AGDT v2.1 — Persae · Iliad 1 · Odyssey 1 · Theogonia · Opera et Dies · Antigone · Euthyphro · Historiae 1 (CC BY-SA 3.0)
- 사진: Wikimedia Commons Public Domain
- 어휘 한국어: LSJ 기반
