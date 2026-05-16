# 다음 라운드 작업 계획 (v59 ~)

*현재 상태*: **v58 빌드 완료** (멀티 배틀 구조 전환 — 호스트 없는 공개 lobby + 3종 신규 게임 모드 + ghost player cleanup). paideia-pwa-v58.zip 배포.

*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션).
- **Wikimedia 파일명 추측 금지** (v54~v55 의 교훈) — 카테고리 페이지 listing 의 *실존 파일명* 만 채택.
- **PD 원전 인용 검증** (v56 의 교훈) — 명언·정역 모두 표준 인용으로 출처 명시.
- **단발성 null 에 보수적** (v57 의 교훈) — 외부 의존의 transient 실패가 UX 를 깨뜨리지 않게 임계점·재시도 패턴.
- **단일 실패점 회피** (v58 의 교훈) — 호스트·중앙 권한자 없는 자율 시스템 선호. 매치 questions[] 같은 자료는 *시작 시점에 결정론적으로 publish* 하여 진행 중 의존성 0.

---

## v58 완료 사항 (참조용)

사용자 요청 *"3, 1, 옵션 유지, 이외 더 창의적이고 재밌는 게임 방식 구상"* 처리:

### A. 멀티 배틀 구조 전환 (호스트 → 공개 lobby)
1. **`_battleState.roomPath` 일반화** — `_battleFetchRoom`/`_battleSaveRoom`/`_battleSubscribeSSE` 가 `roomPath` 가 있으면 그걸, 없으면 legacy `battles:<code>` 를 사용. 코드방·lobby 매치 둘 다 같은 시스템.
2. **공개 lobby (Ἀγορά)** — `lobby:waiters:<uid>` 큐 + `lobby:matches:<mid>` 매치. 호스트 없음. 가장 오래 기다린 사람 ("선임자") 이 "지금 시작" 누르면 모든 waiter 가 자동 매치 합류. waiters≥2 조건 (사용자 결정 3번 옵션).
3. **매치 questions 사전 publish** — `_lobbyStartMatch` 가 시드 기반 questions 를 *매치 시작 시점에* 결정론적으로 생성·저장. 진행 중 호스트 의존 0.
4. **매치 진행 중 입장 봉쇄** — lobby 가 `activeMatches.length>0` 이면 "큐 입장" 버튼 disabled (사용자 결정 1번 옵션).
5. **비공개 코드방 유지** — `renderBattle` 의 details 블록에 접어서 보존. legacy 사용자 호환 (사용자 결정 "옵션 유지").
6. **Ghost player cleanup** — `visibilitychange`/`beforeunload`/`pagehide` 시 `lobby:waiters:<uid>` 즉시 삭제. 대기자 stale 임계 60초 (heartbeat 20초).

### B. 4종 게임 모드 (BATTLE_MODES)
모두 동일한 4-option MC + 12초 타이머 + Q3/Q6/Q9 강탈 + 시드 결정성을 공유. 다른 점은 (a) 풀의 출처, (b) 프롬프트 렌더링.

| id | 그리스어명 | 한국어 | 풀 | 학습 가치 |
|---|---|---|---|---|
| `vocab` | Ἀγών | 어휘 결투 (기본) | ALL_VOCAB 1142 | 어휘 인식 (Greek → Korean) |
| `quote` | Μάχη Ποιητῶν | 명언의 주인 | CHARACTER_QUOTES 50 | 정전 귀속 + 캐릭터 학습 |
| `verse` | Στίχοι | 행 잇기 | CHARACTER_QUOTES (split) | 운율·문맥 인식 |
| `riddle` | Σφίγξ | 역방향 추론 | ALL_VOCAB (역방향) | 인출형 학습 (Korean → Greek) |

빌더는 `_battleBuildVocab`/`_battleBuildQuote`/`_battleBuildVerse`/`_battleBuildRiddle` 로 분리. `_battleBuildQuestions(seed, mode)` 가 dispatch. `renderBattleGame` 의 promptBlock 이 `q.mode` 로 분기하여 글자 크기·보조 라벨·옵션 lang 속성을 모드별로 조정.

**verse 분절 알고리즘**: 명언을 ano teleia (·, U+0387) → comma → semicolon → 중앙 근처 공백 우선순위로 절반에 가까운 위치에서 분절. 양쪽이 각 6자 이상이어야 사용. 50 명언 중 ~30 개가 verse 풀에 진입.

**quote distractors**: 같은 카테고리 (god/hero/heroine/philo/poet) 우선. 학습자에게 *맥락 추론* 압력 (예: 호메로스 정형구라면 영웅 4명 중 누구인가).

**모드 선택 UI**: lobby 카드에 `🎲 게임 모드 선택` 섹션. 4 모드 카드. 선임자만 의미 있으나 *모든 대기자에게 보임* — 위로 올라가면서 그 권한이 자연스럽게 넘어옴.

### C. 검증
`test-v58.js` 104/104 PASS. 정적 grep + 동적 sandbox (모든 4 빌더가 10 questions × 시드 결정성 × Q3/Q6/Q9 강탈 패턴 × 옵션 검증 통과). `test-v57.js` 43/45 (fail 2 = APP/CACHE_VERSION 상수 의도된 reversal). `test-v56.js` 63/66 (fail 3 = 동일 + intro callback signature).

`APP_VERSION`/`CACHE_VERSION` v57 → v58.

---

## 즉시 실행 후보 (자체 완결)

### 우선순위 1 — 정역 더 확장 (v53 부터 누적 defer)
**작업 깊이**: 중간
**의존성**: `data-translations.js` 의 `WORK_TRANSLATIONS` 모델
**목표**: 19 발췌 → 25 발췌

**구체 작업**:
1. **Plato Apology §23-26** (변론 마무리) — v52~v53 의 §17-22 자연스러운 연속.
2. **Homer Iliad 1.151-200+** (외교 시도) — v53 의 §1.101-150 연속.
3. **Sophocles Oedipus 1-100** — 안티고네 (v53) 에 이은 두 번째 비극.
4. **Plato Crito §44-47** — v53 의 §43 연속.
5. **Euripides Medea 1-100** (옵션) — v56 의 Medea 명언과 자연스러운 연결.

---

### 우선순위 2 — 추가 게임 모드 후보 (v58 의 자연스러운 연장)
**작업 깊이**: 모드당 작음~중간
**배경**: v58 의 4 모드 골격 (4-option MC, 시드 결정성, 강탈, 12초 타이머) 이 plug-in 식으로 확장 가능하게 설계됨. `_battleBuildXxx` 함수 추가 + `BATTLE_MODES` 등록 + `renderBattleGame` 의 promptBlock 분기 추가만으로 신규 모드 가능.

**후보** (학습 가치 순):

- **2a · Ἀκόντισμα (Javelin · 속도전)** — 작음. 첫 정답자만 정답 점수. race-free 강탈 패턴 재사용 (`claimed[]`).
- **2b · Δίφθογγος (악센트 위치)** — 작음. v47 의 `_classifyAccent` 재사용. ultima/penult/antepenult 3-option MC.
- **2c · Ὀρθογραφία (받아쓰기 race)** — 중간. v44 의 `_normalizeForDictation` 재사용. TTS + 텍스트 입력 (MC 골격 벗어남, 별도 화면 분기 필요).
- **2d · Ἑρμηνεία (정역 맞히기)** — 중간. WORK_TRANSLATIONS 19 발췌 × ~330 문장에서 그리스 문장 → 4 한국어. 학습 가치 매우 큼.
- **2e · Δίκη (단어 재판 · 문맥 추론)** — 큼. DIALOGUES 의 turn 에서 어휘 highlight → 뜻 추론. 풀 작음 (~200).
- **2f · Κλήρωσις (Wager modifier)** — 중간. 모든 모드에 적용 가능한 베팅 modifier.

**권장 다음**: 2a (Ἀκόντισμα) 가 가장 작고 변별성 큼. 또는 2d (Ἑρμηνεία) 가 학습 가치 ↑.

---

### 우선순위 3 — 매치 종료 시 ghost player 정리 (코드방 잔여)
**상태**: v58 의 lobby 모드는 이미 `visibilitychange`/`beforeunload`/`pagehide` 로 처리. **그러나 코드방 (private) 의 매치 진행 중 ghost** 는 미해결.

**작업 깊이**: 작음
**구현**: `renderBattleLobby` 의 draw 에 *stale player 자동 제거* — 60초 이상 currentQ 갱신 없는 player 는 표시에서 제외 (객체는 남김 — finished 처리는 5분 TTL).

---

### 우선순위 4 — 재연결 후 인트로 컷 재진입 옵션 (v57 신규 defer)
**작업 깊이**: 작음. localStorage `S.battle.skipIntro` + 인트로 컷 토글.

---

### 우선순위 5 — BGM 확장 (v56 신규 defer)
**작업 깊이**: 작음~중간
- (d) 음량 슬라이더 (가장 작음)
- (a) 모드 다양화 (Phrygian/Lydian/Mixolydian)
- (b) 모티프 다양화 (5종 → 15종)
- (c) Seikilos Epitaph 실제 멜로디 mp3 (PD 학자 녹음 검증 필요)

---

### 우선순위 6 — Feedback 운영 UI (v56 신규 defer)
**작업 깊이**: 중간. `/admin?token=<운영자 토큰>` + `listShared('feedback:')` 카드 리스트.

---

### 우선순위 7 — Presence 통계 (v56 신규 defer)
**작업 깊이**: 작음~중간. 운영자 페이지에 시간대별·요일별 분포 차트.

---

### 우선순위 8 — 캐릭터 명언 TTS 자동 발화 (v56 defer)
**작업 깊이**: 작음. 인트로 컷에서 명언 자동 발화 (`S.battle.autoQuote`).

---

### 우선순위 9 — 사진 prefetch (v53 defer)
**작업 깊이**: 작음. picker 열기 전 50 사진 미리 캐싱.

---

### 우선순위 10 — 캐릭터 잠금 시스템 (v52 defer)
**작업 깊이**: 중간~큼. UX 설계 복잡, 기존 사용자 grandfathering 필요.

---

### 우선순위 11 — PARADIGM_LIB 분사·비교급 확장 (v51 defer)
**작업 깊이**: 큼. 76 → 90+ 표제어.

---

### 우선순위 12 — μι-동사 quiz 통합 (v51 defer)
**작업 깊이**: 중간.

---

### 우선순위 13 — AI 기반 정역 (v53 defer)
**작업 깊이**: 큼. Anthropic API + 사용자 API 키.

---

## 외부 의존 (정보 없으면 진척 불가)

- SoundCloud rhapsodoi 실제 slug 검증 (v46 defer)
- Plato Crito 무료 mp3 (v46 defer)
- ScorpioMartianus 무료 mp3 호스트 (v46 defer)

---

## 권장 다음 작업

**우선순위 1 (정역 확장)** 이 v53 부터 누적 defer 인 데다 v54~v58 의 사용자 요청 (캐릭터 사진 hotfix, 멀티 확장, 안정성, 구조 전환) 이 모두 처리됐으므로 가장 자연스러운 v59 작업.

**대안**: **우선순위 2a (Ἀκόντισμα 속도전 모드)** — v58 의 게임 모드 골격이 plug-in 식으로 확장 가능하게 설계됐으니 소규모 신규 모드 추가는 가성비 ↑. 사용자가 멀티 배틀에 적극적이면 이쪽 우선.

사용자 보고나 우선순위 변경 시 즉시 재조정.
