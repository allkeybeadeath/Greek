# 다음 라운드 작업 계획 (v58 ~)

*현재 상태*: **v57 빌드 완료** (멀티 배틀 "방이 닫혔습니다" fragility 핫픽스 — `_battleHandleUpdate` null robustness wrapper + 인트로 컷 보호 + 재연결 버튼). paideia-pwa-v57.zip 배포.

*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션).
- **Wikimedia 파일명 추측 금지** (v54~v55 의 교훈) — 카테고리 페이지 listing 의 *실존 파일명* 만 채택.
- **PD 원전 인용 검증** (v56 의 교훈) — 명언·정역 모두 표준 인용으로 출처 명시.
- **단발성 null 에 보수적** (v57 의 교훈) — 외부 의존 (Firebase, STORAGE.getShared 등) 의 transient 실패가 UX 를 깨뜨리지 않게 임계점·재시도 패턴 적용.

---

## v57 완료 사항 (참조용)

사용자 보고 *"멀티 배틀에서 '방이 닫혔습니다' 가 떠요"* (iPad Safari, allkeybeadeath.github.io) 에 대한 핫픽스:

1. **`_battleHandleUpdate` null robustness wrapper** — `BATTLE_NULL_THRESHOLD=3` + `BATTLE_NULL_MIN_MS=12000ms` 임계점 도입. 단발성 transient null 무시. 정상 응답 이력 없을 시 첫 null 만 전달 (코드 오타 등).
2. **모든 onUpdate 경로 wrapper 경유** — `_battleStartPolling` 즉시 fetch / interval, `_battleSubscribe` 즉시 fetch, `_battleSubscribeSSE` 의 path='/'+null 및 부분 갱신 분기 (총 6 위치).
3. **인트로 컷 보호** — `_battleState.introActive` + `latestRoomDuringIntro`. SSE/polling update 가 인트로 화면을 깨뜨리지 않고 latestRoom 만 보존. advance() 에서 최신 room 으로 본 게임 진입.
4. **방 닫힘 메시지 개선** — "방 연결 끊김" + sinceGood 진단 + 🔄 재연결 시도 버튼.
5. **`_battleCleanup` 신규 필드 정리** — nullRunCount, lastGoodRoom, lastGoodAt, introActive, latestRoomDuringIntro.

`APP_VERSION`/`CACHE_VERSION` v56 → v57. `test-v57.js` (45/45 PASS — 정적 grep + 동적 sandbox 시뮬레이션 4 시나리오 포함). `test-v56.js` 와 함께 실행 시 fail 3 — 모두 *의도된 reversal* (버전 상수 + onContinue 시그니처).

---

## 즉시 실행 후보 (자체 완결)

### 우선순위 1 — 정역 더 확장 (v53 부터 누적 defer, v56·v57 에서도 다른 우선순위에 밀림)
**작업 깊이**: 중간
**의존성**: v53 의 `WORK_TRANSLATIONS` 모델 (별도 파일 `data-translations.js`)
**목표**: 19 발췌 → 25 발췌

**구체 작업** (학습 가치 + v53 연속성 순):
1. **Plato Apology §23-26** (변론 마무리) — v52~v53 의 §17-22 자연스러운 연속.
2. **Homer Iliad 1.151-200+** (외교 시도) — v53 의 §1.101-150 연속.
3. **Sophocles Oedipus 1-100** — 안티고네 (v53) 에 이은 두 번째 비극.
4. **Plato Crito §44-47** — v53 의 §43 연속.
5. **Euripides Medea 1-100** (옵션) — v56 의 Medea 명언과 자연스러운 연결.

**번역 기조** (v53 헤더 그대로): 직역 우선, 자연스러운 한국어 절충.

**검증 기준**: 각 정역의 sentence count 가 renderer 의 `[.;·?!]` 정규식과 일치.

---

### 우선순위 2 — 매치 종료 시 ghost player 정리 (v57 신규 defer)
**작업 깊이**: 작음~중간
**배경**: 모바일에서 사용자가 *브라우저를 닫거나 백그라운드로 전환*하면 SSE/polling 끊긴 채 player 객체가 방에 남음. 다른 학습자에게 "ghost 참가자" 로 보임. v57 의 null-robustness 와 별개 작업 (v57 은 *내가 보는 측* 의 fragility, ghost player 는 *다른 사람에게 보이는 나의 stale 상태*).

**구현 옵션**:
- (a) `visibilitychange` 핸들러 — `document.hidden` 시 30초 후 자기 player 제거. 복귀 시 재등록. 위험: 사용자가 잠깐 다른 앱 갔다 와도 매치 끊김.
- (b) heartbeat 기반 stale 제거 — `presence:battle:<code>:<uid>` 별도 키 + 60초 TTL. `renderBattleLobby` 의 draw 가 stale player 자동 제거. *권장* — v56 presence 와 일관성.
- (c) 명시적 "방 나가기" 버튼 — 현재 `_battleLeave` 가 있으나 모바일 사용자가 보통 그냥 닫음. 버튼만으로는 불충분.

**구현 우선순위**: (b) 가 가장 robust. presence 의 4분 heartbeat 보다 짧은 주기 (60초 TTL → 30초 ping) 필요.

---

### 우선순위 3 — 재연결 후 인트로 컷 재진입 옵션 (v57 신규 defer)
**작업 깊이**: 작음
**배경**: 현재는 `_battleIntroShown[code] = true` 라 재연결해도 인트로 안 보임. 사용자가 인트로를 다시 보고 싶을 수 있음.

**구현**: 인트로 컷에 *"건너뛰기 + 다시 안 보기"* 와 *"건너뛰기"* 두 가지 분기. localStorage 의 `S.battle.skipIntro` 로 전역 선호 저장.

---

### 우선순위 4 — BGM 확장 (v56 신규 defer)
**작업 깊이**: 작음~중간
**구현 옵션 (우선순위 순)**:
- **(d) 음량 슬라이더** — 현재 고정 0.045. 사용자 조절 가능하도록. *매우 작은 작업*.
- **(a) 모드 다양화** — Phrygian/Lydian/Mixolydian 추가. `SCALE_PRESETS` 객체화. 사용자가 모드 선택 가능.
- **(b) 모티프 다양화** — 현재 5종 → 15종. 도리아 모드 펜타토닉 + 헥사토닉.
- **(c) Seikilos Epitaph 실제 멜로디 mp3** — Public Domain 학자 녹음 검증 필요. 외부 호스트 (Wikimedia Commons 의 Seikilos 가창 파일?) 확인 후 추가.

---

### 우선순위 5 — Feedback 운영 UI (v56 신규 defer)
**작업 깊이**: 중간
**배경**: 현재는 console 의 `STORAGE.listShared('feedback:')` 로만 수집. 운영자가 매번 console 열기 번거로움.

**구현**:
- `/admin?token=<운영자 토큰>` 진입 — 명예의 전당 옆 카드에 *작은 텍스트 링크*.
- 운영자 토큰 확인 — `STORAGE.getShared('admin:<token>')` 가 존재해야 진입 허용. 초기 토큰은 console 에서 수동 발급.
- 진입 시 `listShared('feedback:')` → 카드 리스트 (timestamp 내림차순) + "처리 완료" 마킹 (별도 키 `feedback-done:<원래 키>`).

---

### 우선순위 6 — Presence 통계 (v56 신규 defer)
**작업 깊이**: 작음~중간
**구현**: 운영자 페이지 (위 우선순위 5 와 통합 가능) 에 *시간대별·요일별 분포 차트*. 데이터 소스는 `listShared('presence:')` 의 ts 분포. SVG 차트는 v56 의 BGM 모듈처럼 self-contained.

---

### 우선순위 7 — 캐릭터 명언 TTS 자동 발화 (v56 defer)
**작업 깊이**: 작음
**배경**: 인트로 컷에서 명언이 *말풍선으로만 표시*. 음성으로 재생되면 학습 효과 ↑.

**구현**: `_renderBattleIntro` 의 advance() 직전 ~3초 시점에 자기 명언 자동 발화. 사용자 선택 (`S.battle.autoQuote` localStorage).

---

### 우선순위 8 — 사진 prefetch (v53 defer)
**작업 깊이**: 작음
**구현**: 캐릭터 picker 열기 *전에* 50 사진 미리 캐싱. `link rel="prefetch"` 동적 삽입. service worker 가 IMG_CACHE 에 저장. 첫 picker 열림 즉시 모든 사진 표시.

---

### 우선순위 9 — 캐릭터 잠금 시스템 (v52 defer)
**작업 깊이**: 중간~큼
**배경**: 현재 50 캐릭터 모두 즉시 선택 가능. 학습 동기 부여를 위해 점진 unlock.

**제약**: UX 설계 복잡 — 어느 캐릭터를 기본 unlock 으로 둘지? 잠금 해제 기준 (XP, 배지, 완독)? 기존 사용자 grandfathering?

---

### 우선순위 10 — PARADIGM_LIB 분사·비교급 확장 (v51 defer)
**작업 깊이**: 큼
**범위**: 76 표제어 → 90+ (분사 15+ 표 추가)
- 현재분사 능동 (m/f/n) — 형용사 1·2 변화 패턴
- 부정과거 분사 (m/f/n) — ντ-stem 3 변화
- 완료분사 (m/f/n) — οτ-stem 3 변화
- 형용사 비교급 (μείζων) · 최상급 (μέγιστος)

---

### 우선순위 11 — μι-동사 quiz 통합 (v51 defer)
**작업 깊이**: 중간
**배경**: v50 의 mi-verbs 토픽이 9 표 → 14 표로 확장됐으나 quiz 진입 없음.

---

### 우선순위 12 — AI 기반 정역 (v53 defer)
**작업 깊이**: 큼
**배경**: 큐레이션 정역 19 발췌가 한계. 임의 섹션을 사용자 요청 시 번역.

**구현**: Anthropic API 직접 호출 (사용자 API 키 입력 → localStorage 저장).

---

## 외부 의존 (정보 없으면 진척 불가)

- SoundCloud rhapsodoi 실제 slug 검증 (v46 defer)
- Plato Crito 무료 mp3 (v46 defer)
- ScorpioMartianus 무료 mp3 호스트 (v46 defer)

---

## 권장 다음 작업

**우선순위 1 (정역 확장)** 이 v53 부터 누적 defer 인 데다 v56·v57 의 사용자 요청 (멀티 확장 + 안정성 핫픽스) 이 모두 처리됐으므로 자연스러운 v58 작업. 단, 사용자가 다른 요청 시 우선순위 재조정.

대안: **우선순위 2 (ghost player 정리)** — v57 의 멀티 배틀 안정성 작업의 자연스러운 후속편. 사용자가 멀티 배틀을 자주 사용한다면 (v56·v57 의 사용자 보고로 추정 가능) ghost player 문제도 곧 보고될 가능성.
