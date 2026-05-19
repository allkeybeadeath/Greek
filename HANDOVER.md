# Ἑλληνικὴ Παιδεία — 개발 인수인계

본 문서는 개인 프로젝트로 운영되는 고전 그리스어 학습 Progressive Web App (PWA) 의 기술적 인수인계를 위한 자료다. 신규 합류 구성원이 별도 컨텍스트 없이도 코드베이스를 이해하고 유지·확장할 수 있도록 작성했다. 최종 갱신 **v56 (2026년 5월)**.

> **다음 작업자에게**: §7 라운드별 changelog 의 *맨 마지막 항목 (v62)* 이 현재 상태다. 그 위 라운드들은 어떻게 여기까지 왔는지의 기록. 새 작업을 시작하기 전에 `CHANGELOG_v62.md` 와 §0 의 현재 스냅샷을 먼저 읽기.

## 0. 현재 상태 스냅샷 (v62, 2026-05)

**배포 산출물**: `index.html` (~975 KB, IIFE ~440K chars, ~16.4K lines — v59 의 silent failure 차단 + 진단 modal ~270 lines + **v60 의 종료 흐름 fix 4 갈래 ~110 lines**) · `sw.js` · `data-works.js` (3 MB, 45 작품 545 섹션) · `data-morph.js` (4 MB, AGDT v2.1 37K 어형 11.8K lemma) · `data-dialogues.js` (45 KB, 10 콩트 시나리오) · `data-translations.js` (~55 KB, v53 확장 — 19 발췌 정역 ~330 문장 + 34 짧은 발췌 정역) · `data-characters.js` (~22 KB, v56 — 50 캐릭터 사진 + 50 명언 인용) · `espeakng.worker.js` (760 KB) · `manifest.json` · `reset.html`.

**기능 카탈로그**:
- 어휘 학습: 교재 어휘 + DCC 523 + DAILY_W 51 + CIVIC_W 80 + 콩트 vocab 60 = 1142 어휘
- 문법 토픽: 41개 (decl/verb/particle/prep 4 카테고리)
- 콩트 시나리오: 10편 · 84 turns
- 원문 읽기: 45 작품 545 섹션, AGDT 형태분석은 Iliad 1 · Odyssey 1 · Persae 만
- 학자 낭독 매칭: 본문 7 작품 · 도서관 20 자료 · 본문-시간 동기 3 자료 (±3-5초)
- 발음 모드: 4종 (eSpeak NG · 현대 헬라어 · Erasmian · 복원 Attic)
- 학습 모드: 어휘 quiz · 받아쓰기 (Ἀκοή) · 악센트 학습 (Τόνος) · 검색·콘코던스 (Εὕρεσις) · 변화표 만들기 + 빈칸 시험 (Παράδειγμα) · 배틀 모드 · 오답함 SRS
- 변화표: 76 표제어 큐레이션 (55 명사 · 12 형용사 · 9 대명사)
- **캐릭터 (Παίγνια · v52~v55)**: 50 캐릭터 SVG 메달리온 + 50 검증된 Wikimedia 사진. 5 표시 위치 (홈·프로필·명예의 전당·라이브 순위·멀티 배틀).
- **원문 해석 (Ἑρμηνεία · v52~v53)**: 19 발췌 큐레이션 정역 + 단어 풀이 폴백.
- **멀티 배틀 (v58 구조 전환)**: **(v58 신규) 공개 lobby (Ἀγορά)** — 호스트 없는 자율 매치. `lobby:waiters:<uid>` 큐에 입장 → 가장 오래 기다린 선임자가 모드 선택 + "지금 시작" → 시드 기반 questions 가 `lobby:matches:<mid>` 에 *시작 시점에 결정론적으로 publish* → 모든 waiter 자동 합류. 진행 중 매치는 입장 봉쇄. visibilitychange/beforeunload 시 ghost waiter 즉시 정리. **(v58 신규) 4 게임 모드** — vocab (기본 어휘) + quote (명언의 주인) + verse (행 잇기) + riddle (역방향). 모두 4-option MC + 12초 + Q3/Q6/Q9 강탈 공유. **비공개 코드방** (legacy) 도 details 로 접어서 유지. **(v56) 인트로 컷** (적·나 캐릭터 상하단 + VS + 명언 말풍선). **(v57)** null robustness wrapper.
- **(v56 신규) BGM**: 절차적 고대 그리스 양식 음악 (Web Audio API, 도리아 모드 E F G A B C D, 키타라/리라 톤 합성). 홈 화면 BGM 토글 버튼. **양식적 모방** (재현 아님) 명시. Self-contained · 오프라인 · 라이선스 위험 없음.
- **(v56 신규) 건의 사항**: 홈 푸터의 `건의` 링크 → modal (textarea 2000자) → `STORAGE.setShared('feedback:<ts>:<userId>', ...)`. 운영자는 console 에서 `STORAGE.listShared('feedback:')` 로 수집. 오프라인 시 localStorage 큐 (`paideia.feedbackQueue`).
- **(v56 신규) 동시 학습자 카운트**: 4분 간격 `presence:<userId>` heartbeat. 홈 화면 카드에 `현재 N명 공부 중` 표시 (5분 이내 ping 한 사용자만). 60초 카운트 캐시.
- **(v62 신규) 초보자 일일 진도 커리큘럼**: 20 일 분량 (Day 1~5 알파벳·발음 신규 콘텐츠, Day 6~20 레슨 3~7 매핑). 홈 카드 → 일정 화면 → 일차 화면 3 단 진입. 잠금 (전 일차 완료 시 다음 일차 열림). 7 종 task type (alphabet·diphthong·breathing·accent·vocab·topic·quiz). 시험 통과 기준 70%. Day 단위 완료마다 +5 XP. 데이터 정합성 검증 통과 (vocab/topic 참조 0 missing).
- 접근성: aria-label 35+ · title 18+ · greek lang attr 자동화
- 다중 프로필 · 명예의 전당 · 책갈피·메모

**핵심 데이터 인덱스**:
- 어휘: `TEXTBOOK_W`, `DCC_W`, `DAILY_W`, `CIVIC_W` + `ALL_VOCAB` 통합
- 작품·섹션: `WORKS` (data-works.js 에서 정의)
- 형태분석: `MORPH_LOOKUP` (data-morph.js, 비동기 lazy-load)
- 문법 토픽: `TOPICS` 배열 (41)
- 변화표 라이브러리: `PARADIGM_LIB` 객체 (76 표제어)
- 콩트: `DIALOGUES` (data-dialogues.js)
- 학자 낭독: `SCHOLAR_AUDIO` (본문 매칭) + `SCHOLAR_LIBRARY` (도서관)
- **캐릭터 (v52~v56)**: `CHARACTERS` 50 · `CHARACTERS_BY_ID` · `CHAR_SYMBOLS` 32 · `CHAR_PALETTES` 5 · `CHARACTER_IMAGES` (v53~v55, 50 사진) · **`CHARACTER_QUOTES` (v56, 50 명언)** · `_charMedallion` / `_charPhotoMedallion`
- **멀티 배틀 (v58 구조 전환)**: `_battleState.roomPath` (v58 신규 — 코드방·lobby 통합 path 일반화) · `_battleState.role ∈ {'host','guest','lobby'}` · `BATTLE_MODES` 4종 (vocab/quote/verse/riddle) · `BATTLE_MODE_DEFAULT='vocab'` · `_battleBuildQuestions(seed, mode)` dispatch → `_battleBuildVocab/Quote/Verse/Riddle` · q 객체 신 shape `{mode, prompt, options, correctIdx, isSteal, ...}` (vocab `ko`, quote `promptKo+src`, verse `tail+src`, riddle `promptHint+correctGreek`). 기존 강탈·인트로·null wrapper 모두 그대로.
- **공개 lobby (v58 신규)**: `_lobbyState` (phase: idle/waiting/starting/inMatch, pollTimer, heartbeatTimer, waiters[], matches[], chosenMode, visListener) · 상수 `LOBBY_POLL_MS=3000`, `LOBBY_WAITER_TTL_MS=60000`, `LOBBY_HEARTBEAT_MS=20000`, `LOBBY_MATCH_TTL_MS=360000`, `LOBBY_MID_LEN=8` · 함수 `renderPublicLobby` · `_lobbyFetchState` · `_lobbyTick` · `_lobbyDraw` · `_lobbyEnterQueue` · `_lobbyExitQueue` · `_lobbyExit` · `_lobbyPingWaiter` · `_lobbyRemoveWaiter` · `_lobbyStartMatch(mode)` · `_lobbyJoinExistingMatch(mid, matchObj)` · `_lobbyGenMid` · `_lobbyStop` · `_lobbyCleanup` · STORAGE 경로 `lobby:waiters:<uid>` + `lobby:matches:<mid>`
- **BGM (v56)**: `BGM` IIFE 모듈 (`window.BGM.start/stop/isRunning/isAvailable`) · `toggleBgm` · `S.bgmEnabled` · `_ensureBgmPref`
- **Feedback (v56)**: `openFeedbackModal` · `STORAGE` 의 `feedback:<ts>:<userId>` 키 · localStorage `paideia.feedbackQueue`
- **Presence (v56)**: `pingPresence` · `startPresenceHeartbeat` · `fetchPresenceCount` · 상수 `PRESENCE_TTL_MS=5min`, `PRESENCE_PING_MS=4min` · `_presenceCountCache` (60초 TTL)
- **(v59) Silent failure 차단 + 진단**: `BACKEND.setShared/getShared/listShared` 가 `window._battleLastError` 에 HTTP status + body 200자 + `isPermissionDenied` (401/403) 캡처 · `_battleSaveRoom` / `_lobbyPingWaiter` / `_lobbyStartMatch` 반환값 검증 · `_battleHandleUpdate` 의 `BATTLE_JUST_CREATED_GRACE_MS=5000` + `_battleState.justCreatedAt` (호스트 본인 첫 fetch transient null 흡수) · `_lobbyEnterQueue` 낙관적 UI (`_optimistic: true` 마커) + 롤백 · 진단 modal 의 `#diag-firebase-test` 자가진단 버튼 (6 경로 PUT/GET/DEL + verdict allWriteOk/allDenied/partialDenied + 권장 룰 inline 표시) · toast 시그니처 확장 (`(msg, typeOrDuration, duration)` — 숫자면 duration, 문자열이면 type) · README §3 Firebase 룰을 `.read/.write: true` 루트 허용으로 갱신
- **(v60) 멀티 배틀 종료 흐름 fix**: `_battleSubmitProgress` 의 path-level `STORAGE.setShared` 가 hardcoded `battles:${code}` 였던 것을 `_battleState.roomPath || 'battles:'+code` 로 일반화 (공개 lobby 매치에서 player.finished PUT 이 잘못된 경로로 가서 status 전환 영구 실패하던 버그) · last-player race 의 self-merge (자기 직전 PUT 이 Firebase 의 eventual consistency 로 fresh 응답에 반영 안 됐을 때 local payload 우선) · SSE/polling onUpdate 콜백에서 `status==='finished'` 분기를 `playing` 보다 *먼저* 평가 + `inWaitOthers` 식별 변수로 `answeredThisQ` 단락 무력화 · `renderBattleGame` 에 status 전환 watchdog (room.players 가 모두 finished:true 이고 status 가 playing 이면 idempotent flip 재시도) · `_renderBattleWaitOthers` 에 wait 시작 시각 추적 + 30초 stale 알림 + 45초/all-others-finished 시 "⚡ 지금 결과 보기 (매치 종료)" 비상 버튼 (meta.forceFinishedBy 기록).
- **(v62 신규) 초보자 커리큘럼**: `GREEK_ALPHABET` (24, 8 필드/글자: cap/low/name/nameKo/sound/soundKo/tip/mnemonic) · `GREEK_DIPHTHONGS` (9) · `GREEK_BREATHINGS` (2) · `GREEK_ACCENTS` (3) · `BEGINNER_CURRICULUM` (20 일, `{day, grkTitle, koTitle, desc, estMin, tasks: [...]}` shape) · `BEGINNER_CURRICULUM_TOTAL_DAYS=20` · 상태 `S.curriculumDay` · `S.curriculumDone[N]={completedAt,score}` · 헬퍼 `_ensureCurriculumState` · `isCurriculumDayDone(n)` · `isCurriculumDayLocked(n)` · `curriculumProgress()` · `_curriculumDayObj(n)` · `markCurriculumDayDone(n, score)` · 세션 휘발성 `_curriculumTaskState` + `_isTaskDone` / `_markTaskDone` · 렌더러 `renderCurriculum` · `renderCurriculumDay` · dispatcher `openCurriculumTask(day, idx)` · task renderer `renderAlphabetTask` · `renderDiphthongTask` · `renderBreathingTask` · `renderAccentTask` · `renderCurriculumVocabTask` · `renderCurriculumTopicTask` (renderTopic 위임 + sticky 완료 바) · `renderCurriculumQuizTask` (kind ∈ alphabet/vocab/diacritic, 70% 통과 임계) · 홈 카드는 presence card 와 quote card 사이 IIFE 블록.

**현재 미해결·defer 상태** (§7 의 v60 끝 defer 블록 참조):
- 외부 의존 3 항목 (SoundCloud slugs · Plato Crito sample · ScorpioMartianus) — 새 정보 없음
- 단어 단위 시간 동기 (현재 행/단락)
- plato-apology Stratakis cue points
- PARADIGM_LIB 분사·비교급·최상급 확장
- μι-동사 가정법/희구법 quiz 통합 (v50 의 5 표 학습만 있고 시험 없음)
- **정역 확장 (v53 의 권장 작업, v54~v60 에서도 이월)**: 19 발췌 → 25 발췌 (Plato Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47). v60 도 종료 흐름 핫픽스를 우선 처리하여 v61 으로 이월.
- **원문 코퍼스 확장 (v60 세션 검토 시작)**: 현 corpus 45 작품 중 26 작품이 NT 코이네. 고전 그리스어 정전 결손 — Euripides, Aristophanes, Thucydides, Demosthenes, Aristotle, Lysias, Sappho/Pindar (도서관엔 있으나 WORKS 엔 없음), Plato Phaedo, Hippocratic Oath. v61 후보로 본격 작업.
- 캐릭터 잠금 시스템 (XP/배지/완독 기반)
- 사진 prefetch
- AI 기반 정역 (Anthropic API)
- **BGM 확장**: 추가 모드 (Phrygian, Lydian, Mixolydian), 모티프 다양화, 실제 학자 복원 곡 외부 mp3 옵션, 음량 슬라이더
- **Feedback 운영 UI**: 현재는 console 수집만. 별도 `/admin` 페이지 또는 명예의 전당 옆에 운영자 전용 진입 (운영자 인증은 STORAGE 의 `admin:` 키 토큰)
- **Presence 통계**: 현재 카운트만. 시간대별 분포·요일별 분포 등 통계 분석 (운영자 전용)
- **(v57 defer, v58 lobby 에선 처리됨)** 멀티 배틀 ghost player 정리 — 공개 lobby 의 waiters 는 v58 의 visibilitychange/beforeunload/pagehide 핸들러로 즉시 정리됨. **그러나 코드방 (private) 매치 진행 중 ghost** 는 미해결. (v60 의 자동 status 전환 + 수동 종료 버튼이 *증상* 완화. 진정한 cleanup 은 별도 작업.)
- **(v58 defer) 추가 게임 모드** — 4 모드 골격이 plug-in 식 확장 가능. 후보: Ἀκόντισμα (속도전), Δίφθογγος (악센트 위치), Ὀρθογραφία (받아쓰기 race), Ἑρμηνεία (정역 race), Δίκη (문맥 추론), Κλήρωσις (베팅 modifier). 가장 가성비 좋은 후보는 Ἀκόντισμα.
- **(v58 defer) 재연결 시 인트로 컷 재진입 옵션** — 현재 `_battleIntroShown[code]=true` 가드라 재연결해도 인트로 안 보임.
- **(v59 신규 defer) Firebase Auth 통합** — 현재 권장 룰 `.read/.write: true` 는 *연구실 내부용* 으로만 안전. 외부 공개 시 anonymous auth + `auth != null` 또는 email/password 로 강화 필요.
- **(v59 신규 defer) 자가진단 modal 의 자동 룰 PUT** — 현재는 사용자가 Firebase Console 에 수동 붙여넣기. Admin API 로 자동화 가능하나 service account 키 노출 위험으로 보류.
- **(v62 이월) Day 21~60 매핑** — 레슨 8~40 의 33 레슨이 미정의. `BEGINNER_CURRICULUM_TOTAL_DAYS` 만 갱신하면 확장 가능. 권장 작업량: 한 라운드에 ~20 일씩 두 라운드 분할.
- **(v62 이월) 커리큘럼 task 진행 영구화** — 현재 `_curriculumTaskState` 는 세션 휘발성. 새로고침 시 일차 내 진행 풀림. `S.curriculumTaskDone` 으로 승격하면 해결.
- **(v62 이월) 커리큘럼 시험 점수 표시** — `S.curriculumDone[n].score` 필드 예약돼 있으나 UI 미표시.
- **(v62 이월) 커리큘럼 reading task** — 현 매핑은 vocab/topic/quiz 만. 짧은 발췌 읽기 task type 추가 시 교수학적 완성도 향상.
- **(v62 이월) 커리큘럼 배지** — `alpha-complete` (Day 5), `lesson3-complete` (Day 9), `paideia-complete` (Day 60). `BADGES` 배열 확장 + 완료 시 award.
- **(v61 이월, v62 미처리) 오늘의 단어 (Word of the Day)** — 홈 카드. 결정론적 일자 인덱싱. ~150 lines. CHANGELOG_v61.md 의 "다음 세션" §A 참조.

**영구 제외** (사용자 정책):
- 다국어 UI (i18n)

## 1. 프로젝트 개요

본 앱은 고전 그리스어(주로 5–4세기 BCE Attic, 일부 Ionic·Doric·Aeolic·Homeric·Koine) 학습용 PWA다. 단일 HTML 파일에 모든 기능이 포함된 self-contained 구조이며, 외부 의존성은 (a) 그리스어 형태소 데이터 (AGDT 19,875 lemma), (b) 표준 그리스어 전집 텍스트, (c) eSpeak NG WASM 음성 합성 엔진 셋이다.

핵심 기능은 어휘 학습 (교재 단위 및 DCC core vocabulary 523), 문법 토픽 학습, 원문 읽기 (전집 + 발췌), 배틀 모드 (시간제 객관식), 오답함 SRS, 명예의 전당, 다중 프로필, 그리고 4종 발음 시스템 (eSpeak NG · 현대 헬라어 · Erasmian · 복원 Attic) 이다.

타깃 사용자는 본 프로젝트 학습자이며, 주요 사용 플랫폼은 iOS Safari (한국 iPad 환경 우선 검증) 와 데스크탑 Chromium 계열이다.

## 2. 기술 스택

순수 HTML/CSS/JavaScript. 빌드 도구 없음 (no webpack, no vite, no transpile). 단일 IIFE 구조의 vanilla JS로 모든 로직이 `index.html` 의 `<script>` 블록 안에 직접 작성되어 있다. 상태 저장은 `localStorage`, 오프라인 동작은 service worker (`sw.js`), 음성 합성은 (i) 브라우저 내장 Web Speech API 와 (ii) eSpeak NG WASM 의 dual-engine 구조다.

빌드 도구를 의도적으로 피했다. 단일 파일 PWA는 GitHub Pages·Netlify Drop 같은 정적 호스팅에 즉시 배포 가능하고, 의존성 잠금이나 환경 차이로 인한 빌드 실패 위험이 없다. 이는 lab 환경에서 여러 사람이 가벼운 수정을 가하고 즉시 배포할 수 있도록 한 의도적인 단순성 (intentional simplicity) 이다.

## 3. 파일 구조

배포 디렉토리는 다음과 같다. 모두 같은 origin 에서 서빙되어야 한다.

```
paideia/
├── index.html              ~570 KB   메인 앱 (모든 로직 포함)
├── sw.js                   ~5 KB     서비스 워커 (캐싱 전략)
├── manifest.json                     PWA 매니페스트
├── reset.html                        상태 초기화 페이지
├── data-works.js           ~3 MB     전집 텍스트 (Perseus 기반)
├── data-morph.js           ~4 MB     AGDT 형태소 데이터 19,875 lemma
├── espeakng.min.js         ~2 KB     eSpeak NG 로더 (Pettarin port)
├── espeakng.worker.js      ~776 KB   eSpeak NG Web Worker
├── espeakng.worker.data    ~2.4 MB   eSpeak NG 언어 데이터 (다국어 포함, grc 포함)
├── icon-192.png, icon-512.png, icon.svg, apple-touch-icon.png
└── README.md
```

총 약 11 MB. 이 중 7 MB 가 데이터 (전집·형태소·음성), 나머지가 코드와 자원이다. 모든 파일은 같은 origin·같은 디렉토리에 위치해야 한다. eSpeak 의 worker.js 는 worker.data 를 같은 경로에서 자동 로드하므로 둘은 분리할 수 없다.

## 4. 코드 아키텍처

`index.html` 의 메인 로직은 IIFE (line ~3007 ~ 9000+) 내에 캡슐화되어 있으며, 다음 영역으로 구분된다.

**상태 관리** (`S` 객체)는 localStorage 로부터 hydrate 되며 사용자별 진도·오답함·XP·배지·음성 설정을 보관한다. 다중 프로필 지원을 위해 `_profileMetaCache` 가 별도로 관리된다. 모든 상태 변경 후 `saveState()` 를 호출한다.

**라우팅**은 `setTab(name)` 단일 함수로 처리한다. 해시 라우팅이나 history API 를 쓰지 않으며, view 영역 (`#view` div) 의 innerHTML 을 직접 교체하는 단순 SPA 패턴이다. `renderHome`, `renderVocab`, `renderGrammar`, `renderRead`, `renderHall`, `renderSpeechSettings` 등이 각 탭의 진입점이다.

**데이터 모델**은 정적 데이터(`WORKS`, `TOPICS`, `TEXTBOOK_W`, `DCC_W`, `READINGS`, `BADGES`, `LEVELS`, `DAILY_QUOTES`)와 동적 데이터 (`data-works.js` 의 `WORK_TEXTS`, `data-morph.js` 의 형태소 인덱스) 로 나뉜다. 정적 데이터는 `index.html` 내부에, 동적 데이터는 별도 `.js` 파일에 분리하여 service worker 의 lazy load 대상이 된다.

**그리스어 처리 모듈**은 가장 정교한 부분이다. `_setupGreekLang` IIFE 는 `.grk` 클래스를 가진 DOM 노드에 `lang="grc"` 속성을 자동 부여한다 (스크린 리더 접근성). `_polytonicToMonotonic`, `_normalizeApostrophes`, `_restoreElisions`, `greekToLatin`, `_greekDigraph`, `_greekWordToLatin` 등은 음성 합성 직전 텍스트 변환을 담당한다.

**음성 합성 (TTS)** 은 dual-engine 으로 구성된다. `speakGreek(text, dialect)` 가 진입점이며, 시스템 설정에 따라 (a) Web Speech API 경로와 (b) eSpeak NG WASM 경로로 분기한다. Web Speech 경로는 `_pickVoiceFor(lang)` 로 사용 가능 음성을 식별하여 적절한 텍스트 표현(음역 또는 monotonic 그리스어)을 보낸다. eSpeak NG 경로는 `_ensureEspeak()` 로 lazy load 후 `_EspeakPushAudioNode` 를 통해 PCM 청크를 스트리밍 재생한다. `_espeakReqSeq` 로 race condition 을 방어한다.

**Service Worker** (`sw.js`) 는 critical shell (즉시 캐시) 과 data bundle (백그라운드 캐시), 외부 자원 (Wikimedia·Google Fonts) 별로 다른 캐싱 전략을 적용한다. eSpeak 파일들은 명시적 캐시 리스트에 없으며, 사용자가 처음 eSpeak NG 시스템을 사용할 때 fetch intercept 가 자동으로 캐싱한다 — 사용 안 하는 사용자는 ~3 MB 다운로드 부담을 지지 않는다.

## 5. 발음 시스템 설계

본 앱의 가장 미묘한 부분이 음성 합성이다. 그리스어 발음은 단일 정답이 없으며, 사용자의 학습 목적에 따라 적절한 음운 체계가 다르다. 본 앱은 네 시스템을 제공한다.

**eSpeak NG · 기기 무관 (권장 · 기본값)**: PWA 내장 WASM 음성 합성 엔진이 espeak 의 `grc` 음운 규칙을 사용하여 발화한다. 로봇 음질이지만 모든 기기에서 동일한 출력을 보장하며, polytonic 결합 부호·짧은 단음절·elision 자음을 letter name 으로 발화하는 OS 음성의 변덕에 영향받지 않는다. 첫 사용 시 ~3 MB 가 lazy load 되며, 이후 service worker 가 캐싱하여 오프라인 작동한다. v39 부터 신규 사용자의 기본 시스템.

**현대 그리스어 (OS 음성)**: 기기의 el-GR 음성을 사용한다. 자연스러운 음질이나 polytonic 처리가 음성 엔진마다 다르며, 한국 iPad 의 기본 음성은 결합 부호와 단음절 기능어 (`οὗ`, `ὁ`, `ἡ`) 를 letter name 으로 발화하는 경우가 보고되었다. 이를 회피하기 위해 `_polytonicToMonotonic` 으로 사전 변환 (circumflex·grave → acute, smooth·rough·iota subscript 제거, diaeresis 보존) 후 `_restoreElisions` 로 30 + 종 elision 자음 (δ' → δέ, ἀλλ' → ἀλλά, κατ' → κατά 등) 을 본래 형태로 복원한다.

**Erasmian (이탈리아어 음성)**: 르네상스 유럽 학계 관용 발음. 그리스어 텍스트를 라틴 음역 (`φ → ph → p`, `β → b`, `η → e`, `υ → u`, `θ → t` 등) 으로 변환 후 이탈리아어 음성으로 재생한다. 이탈리아어 음성이 없으면 스페인어·영어로 폴백한다. 디그래프 (`αι ει οι αυ ευ ου`) 는 글자별 처리가 아닌 디그래프 단위 매핑으로 정확성 확보.

**복원 Attic (이탈리아어 음성)**: W.S. Allen, *Vox Graeca* (1987) 의 5–4세기 BCE Attic 재구. `η = [ɛː]` (è 표기), `υ = [y]` (이탈리아어에 없어 i 로 근사), `ω = [ɔː]` (ò), `ου = [uː]` (단일 모음 `u`, 글자별 처리 시 'oi' 가 되는 버그를 v38 에서 디그래프 매핑으로 수정). `χ φ θ` 의 기식음 [tʰ pʰ kʰ] 본래 발음은 이탈리아어 음성 한계로 [t p k] 로 약화된다.

방언 (Attic·Ionic·Doric·Aeolic·Homeric·Koine) 은 모든 시스템에 공통 적용되며 주로 psilosis (Ionic·Aeolic) 여부에 따라 rough breathing 의 'h' 부여를 분기한다. 형태 차이 (Doric `ᾱ` 보존, Homeric `-οιο` 등) 는 텍스트 자체에 이미 반영되어 있어 별도 처리 불필요.

## 6. 음성 합성 관련 학술 한계

본 앱의 음성 합성은 어디까지나 학습 보조 도구이며 학술적 정확성에는 한계가 있다. 사용자에게도 이를 명시한다.

고저 강세는 재현되지 않는다. 그리스어의 acute·grave·circumflex 는 본래 음정 변화 (pitch accent) 였으나 모든 시스템은 stress accent 로 발화한다 (Allen, *Vox Graeca*, §VII). 기식음은 이탈리아어 음성의 한계로 약화된다. 복원 시스템의 `υ = [y]` 전설 원순 고모음도 이탈리아어에 없어 `i` 로 근사한다. eSpeak NG `grc` 음성은 espeak 공식 문서가 "initial naive implementation, awaiting feedback" 로 표시하는 단계이며 Vox Graeca 수준의 정밀 음운 재현은 보장하지 않는다 (일관 기준점 제공이 목적).

학술적 정확성이 요구되는 경우 사용자에게 ScorpioMartianus (Luke Ranieri) 또는 Stephen G. Daitz, *Pronunciation and Reading of Ancient Greek* (1981) 등의 학자 녹음 참조를 권장하며, 이 안내는 설정 화면 하단에 명시되어 있다.

## 7. 버전 히스토리 (v31 → v40 발췌)

각 버전은 기능 추가 또는 버그 fix 의 의미 있는 단위로, `CACHE_VERSION` 과 `APP_VERSION` 두 상수에 반영된다. 후자는 홈 화면 푸터에 표시되어 사용자가 자신의 버전을 확인할 수 있다.

**v32**: `_setupGreekLang` 추가 — `.grk` 클래스의 DOM 노드에 자동으로 `lang="grc"` 부여하여 스크린 리더 접근성 개선.

**v33**: 배틀 모드 개선 — 속도 점수 (남은 초 + 10, 최대 22/문제), 정답·오답 카드 분리, 결과 화면의 오답 리뷰, 자동 오답함 적립.

**v34**: 4종 발음 시스템 구조 도입 — `PRON_SYSTEMS` 와 `PRON_DIALECTS` 객체화, `greekToLatin()` 음역 함수, 23 케이스 회귀 테스트.

**v35**: 음성-텍스트 정합성 fix — el-GR 음성 부재 시 letter name 발화 차단. 사용 가능 음성 우선 식별 후 안전 텍스트 생성.

**v36**: eSpeak NG WASM 통합 — Pettarin port (3.2 MB) 번들, `_EspeakPushAudioNode` 스트리밍 재생, race condition 방어용 `_espeakReqSeq` 시퀀스 토큰.

**v37**: polytonic → monotonic 자동 변환 — el 음성 letter name 발화의 더 근본적 차단. `APP_VERSION` 상수 도입 및 홈 화면 푸터 노출.

**v38**: 디그래프 매핑 + elision 복원 — `_greekDigraph` 함수로 `ου, ει, αι, οι, αυ, ευ, ηυ, υι, ωυ` 디그래프 단위 처리 (Restored `ου = [uː] → 'u'` 가 'oi' 로 잘못 표기되던 버그 수정). `_normalizeApostrophes` 로 U+2019·U+1FBD·U+02BC 아포스트로피 변형 ASCII 정규화. `_restoreElisions` 로 30+ elision 형태 복원 (δ' → δέ 등).

**v39**: 발음 일관성을 위한 구조적 변경 — `_ensureSpeechSettings` 기본 시스템 `'modern' → 'espeak_grc'`. PRON_SYSTEMS 카드 순서 재배치, 비-eSpeak 사용자용 권장 카드 추가, 앱 시작 시 espeak silent 프리로드.

**v40**: 배포 단순화 — `espeak/` 하위 디렉토리 제거, eSpeak 파일들을 루트로 평탄화. GitHub 웹 업로드 시 폴더 생성 번거로움 제거. 코드 경로 참조도 동시 업데이트 (`./espeak/espeakng.*.js → ./espeakng.*.js`).

**v41**: 경로 변경 race window 차단 + eSpeak 로더 자기진단 + 인앱 진단 modal — v40 의 cache-first HTML 정책에서, 옛 SW 가 stale `index.html` 을 한 사이클 더 서빙하여 사용자가 옛 자원 경로(`./espeak/espeakng.min.js`)를 요청해 404 가 나는 incident 가 보고됨. 세 갈래로 보완.

(1) **`sw.js`** 에서 `index.html`·navigation 만 network-first 로 분기 (다른 자산은 cache-first 유지). 오프라인 시 캐시 폴백. 다음 배포부터 경로·HTML 변경이 race window 없이 즉시 전파됨.

(2) **`_ensureEspeak`** 의 onerror 핸들러가 실패 시 `fetch` 로 재확인하여 HTTP status·final URL 을 toast 메시지에 노출 — stale-cache(시나리오 A) vs 배포 누락(시나리오 B) 을 사용자/관리자가 한 줄로 구분.

(3) **인앱 진단 modal** (`window._appDiagnose`). 홈 푸터의 `진단` 링크에서 호출. `MessageChannel` 로 SW 의 `CACHE_VERSION` 을 질의 (sw.js `getVersion` 메시지 핸들러) → `APP_VERSION` 과 비교하여 불일치 또는 `registration.waiting` 존재 시 경고. "강제 새로고침" 버튼은 `reg.waiting.postMessage('skipWaiting')` + `reg.update()` 후 cache-busting 쿼리 `?fresh=<ts>` 로 reload. "전체 초기화" 는 기존 `reset.html` 로 연결. 옛 SW (v40 이하) 가 응답 없을 때는 1500 ms 타임아웃 후 `(응답 없음)` 표기 — graceful degradation.

**v42**: 학자 낭독 자원 통합 — TTS 4 종 (eSpeak NG · OS Modern · Erasmian · 복원 Attic) 은 임의 텍스트에 대해 자연도·정확도·일관성 중 하나만 만족시킨다는 본질적 한계가 있다 (§6 참조). 본 변경은 *특정 구절*에 한해 학자의 인간 낭독을 외부 호스트에서 스트리밍하여 자연도·정확도를 동시에 충족.

자료 출처와 본 앱 12 작품과의 매칭:

(a) **Ioannis Stratakis** (`ancientgreek.eu`) — 직접 MP3 링크 가능. 복원 고전 발음.
  - Plato *Apology* §17 → `apology-plato.mp3` (오디오북 ch.01 무료 샘플)
  - Xenophon *Anabasis* 1.1 → `anabasis-1.1.mp3` (무료 공개)
  - Hesiod *Theogony* 1-50 섹션 (실제 녹음은 v.1-21) → `theogony.mp3` (무료)
  - Herodotus *Histories* 1.1-4 → `h-histories1.1-4.mp3` (무료 · Ionic 방언)

(b) **SORGLL · Stephen G. Daitz** (rhapsodoi SoundCloud) — pitch accent 재현 시도.
  - Homer *Iliad* 1.1-52 → SoundCloud widget 임베드
  - Homer *Odyssey* 1.1-21 → SoundCloud widget 임베드

매칭된 6/12 작품의 해당 섹션에서 reading view 액션 행에 `📻 학자 낭독` 버튼이 노출되며, 누르면 modal 에 인라인 `<audio>` 또는 SoundCloud iframe 이 뜬다. 카탈로그는 `SCHOLAR_AUDIO` 객체 (index.html, PRON_DIALECTS 직후) 에 정의되어 있어 lab 구성원이 추가 녹음을 발견하면 그 자리에 항목만 더하면 된다. MP3 onerror·iframe 실패 시 모두 출처 페이지 새 탭 폴백.

라이선스: Stratakis 자료는 그의 사이트가 명시한 "free" 표기 자원이거나 유료 오디오북의 공식 무료 prologue 샘플만 사용. SORGLL 자료는 공개 SoundCloud 임베드. 본 PWA 는 어떤 자료도 재배포하지 않으며 외부 호스트로 스트리밍만 한다. SW 의 cross-origin 분기 (`url.origin !== self.location.origin`) 에 의해 학자 낭독 요청은 가로채지 않으며 캐시도 하지 않는다.

음성 합성의 기존 4 종은 그대로 유지 — 학자 녹음이 없는 8/12 작품과 어휘·문법 학습용 임의 텍스트는 여전히 TTS 가 필요하다. 기본 TTS 시스템도 변경하지 않음 (v39 의 eSpeak NG 기본값은 cross-device 일관성을 위한 의도된 결정이므로 유지). 사용자가 "더 자연스러운 일반 TTS" 를 원하면 발음 설정에서 `현대 그리스어 (OS 음성)` 로 전환 가능 — v37–v38 의 polytonic 전처리·elision 복원 로직이 이 경로의 안정성을 보강해 두었다.

**v43**: 콘텐츠·기능 일괄 보강 — 다섯 갈래.

(1) **새 모듈 Σκηνή (콩트 장면)** · 별도 파일 `data-dialogues.js` (~16 KB).
6 장면: 시장 흥정 / 향연 술 자랑 / 의사 진료 / 체육관 / 소크라테스 대화 / 노인의 옛날 타령. 각 장면 5-9 turn, 캐릭터 2-3 명. 모든 라인 Attic 표준 (5–4 c. BCE). 총 49 turns, 36 신규 어휘, 12 문법 노트. Aristophanes·Menander 풍의 가벼운 코미디로 사회 풍경 묘사. 어휘 탭의 *Σκηνή* 카드로 진입. 각 turn 옆 🔊 로 발음. UI 진입점: `renderDialogues` / `renderDialogueScene` (vocab 탭에서 라우팅).

(2) **어휘 🔊 인라인** · 두 곳.
  · 퀴즈 prompt 의 그리스어 표시 옆 (희→한 모드) — `id="q-speak"` 버튼.
  · 기존 회화 표현 모음 (renderScenario) 의 각 item 옆.
  · 콩트 장면 (renderDialogueScene) 의 각 turn / 신규 어휘 옆.
  모두 `speakGreek(text)` 호출 (사용자 발음 설정에 따라 eSpeak NG · OS Modern · Erasmian · Restored 중 자동 선택).

(3) **퀴즈 난이도·문제 수 설정** · `S.quizSettings = {difficulty, count}`.
  · difficulty: `easy` (무작위 distractor) · `medium` (같은 품사 우선, 기본) · `hard` (시각·의미 유사 강조 · 가중치 강화).
  · count: 5 / 10 / 20 문항.
  · `pickConfusingDistractors` 에 difficulty 분기 추가. easy 는 무작위 셔플, medium/hard 는 가중치 행렬 차등 (시각 유사도 W: 7 → 12, 의미 토큰 W: 4 → 6, 같은 lesson W: 1.5 → 2.5 등).
  · `_ensureQuizSettings` 헬퍼가 localStorage hydration 시 디폴트 보장. vocab 탭에 chip UI 추가.

(4) **새 어휘 50개 (DAILY_W)** · 일상생활 보강.
  · 음식·식탁 (τυρός, ἔλαιον, μέλι 등 10), 집·가구 (οἰκία, θύρα, κλίνη 등 10), 가족·사람 (μήτηρ, πατήρ, γυνή, ἀνήρ 등 10), 신체 (κεφαλή, χείρ, πούς 등 10), 일상 동작 (καθεύδω, λούω, ἀσπάζομαι 등 7), 부사 (εὐθύς, σχεδόν, μόλις, τάχα 4).
  · TEXTBOOK_W · DCC_W 와 중복 회피. lesson 코드 `'d'` 로 daily 그룹 식별.
  · `ALL_VOCAB` 에 자동 병합.

(5) **새 문법 토픽 2개** · `lesson: 99`, 심화 분류.
  · **μέν … δέ — 대비와 균형**: 짝 사용 / δέ 단독 / μέν solitarium 세 패턴 구분. μέντοι · μήν · καὶ μέν δή 친척 입자 들과의 미세 구분. paradigm + 실수 회피 표.
  · **부정과거 vs 미완료 — 상(aspect) 의 본질**: 점(point) vs 선(line). 미완료의 4 색조 (진행·습관·시도·배경), 부정과거의 3 색조 (사실·개시·요약), 시제 짝 (ἔπειθον vs ἔπεισα 등 5쌍), 단서 부사 (ὁσημέραι vs ἐξαίφνης) 표.
  · 새 카테고리 `'particle'` 칩 추가 (격변화·동사 외 세 번째 분류).

다음 라운드 후보 (defer): 추가 콩트 4 장면, 추가 어휘 100+, 문법 5+, 받아쓰기·악센트 위치 등 신규 문제 유형, SRS 망각곡선, lemma 검색.

**v44**: 콘텐츠·기능 2 차 확장. 다섯 갈래.

(1) **콩트 4 장면 추가** · `data-dialogues.js` 6 → 10 시나리오 (목표 달성).
신규 4 장면 (총 35 turns, 24 신규 어휘, 8 문법 노트):
  · `school-lazy` 학교의 게으른 학생 — '할아버지가 또 돌아가셨다'는 핑계. 호메로스 첫 두 단어만 외운 게 7 년째.
  · `slave-master` 노예와 주인의 아침 — 코미디 방백 (πρὸς ἑαυτόν). 'εἷς ἄνθρωπος, τρία ἐπιτάγματα. καὶ ἓν στόμα'.
  · `oracle` 델포이의 모호한 신탁 — Croesus 신탁 패러디. '대제국을 무너뜨릴 것이다 — 어느 제국?'
  · `wedding-haggle` 결혼 지참금 흥정 — 신부 부재. 'γείτων δέκα ἔδωκεν / πλούσιος / λοξὴ τοῖς ὀφθαλμοῖς'.
모든 라인 Attic 표준, Aristophanes·Menander 풍. 통계: 누적 10 시나리오 · 84 turns · 60 신규 어휘 · 20 문법 노트.

(2) **확장 어휘 80개 (CIVIC_W)** · 정치·종교·자연·학문·동사·접속사 6 영역.
  · 정치 (πόλις · ἐκκλησία · βουλή · δῆμος · νόμος · ψῆφος · στρατηγός · ῥήτωρ · δίκη · τύραννος · ...) 15
  · 종교 (θεός · ἱερόν · ἱερεύς · βωμός · θύω · μάντις · χρησμός · ψυχή · ...) 12
  · 자연 (ἥλιος · σελήνη · ἀστήρ · γῆ · οὐρανός · ποταμός · ὄρος · νῆσος · ζωή · ...) 13
  · 학문 (λόγος · μῦθος · νοῦς · σοφία · ἐπιστήμη · τέχνη · βιβλίον · γράμμα · ἀλήθεια · δόξα · ...) 14
  · 동사 (γιγνώσκω · νοέω · σκοπέω · ἡγέομαι · τυγχάνω · πάσχω · χρή · δεῖ · βούλομαι · εὑρίσκω · ...) 13
  · 시간·접속사 (νῦν · τότε · ἤδη · μᾶλλον · ὅτι · ἵνα · ὥστε · ἐπεί · ...) 13
`l: "c"` 그룹으로 ALL_VOCAB 에 자동 병합. *현재 신규 어휘 누적: DAILY_W 51 + CIVIC_W 80 + 콩트 vocab 60 = 191 항목.*

(3) **문법 3 토픽 추가** · TOPICS 36 → 39.
  · `cond` 조건문 6 종 — 단순 / 미래 더 생생 (ἐάν+가정법) / 미래 덜 생생 (εἰ+희구법) / 현재 반사실 / 과거 반사실 / 일반. ἄν 의 위치·시제·법으로 6 종 식별. *그리스어 학습의 최대 난관 중 하나*.
  · `opt` 희구법 4 용법 — 소망 (εἴθε) / 잠재 (ἄν+희구) / 간접화법 (주절 과거 뒤) / 조건절 (εἰ+희구). 같은 형태 네 용법의 *동반 입자* 식별표.
  · `gen-abs` 속격 절대 — 시간·인과·양보·조건 분기. *주어가 같으면 conjunct participle* — 흔한 학습자 오류 회피.

(4) **받아쓰기 모드 (Ἀκοή · Dictation)** · 새 진입.
어휘 탭의 새 카드 `Ἀκοή · 받아쓰기 — 듣고 입력`. TTS 가 그리스어 단어/구를 발음 → 사용자가 *그리스어* 텍스트 입력 → 매칭. 매칭 정규화 `_normalizeForDictation()` 가:
  · Unicode NFD 후 결합 표지 (다이아크리틱) 제거 — polytonic/monotonic 무관
  · 어말 ς → σ 통일 — 시그마 위치 무관
  · 소문자 + 공백·문장부호 정규화 — 대소문자·구두점 무관
풀: ALL_VOCAB 중 4-15 자 어형. 한 세션 10 문항. 듣기 / 다시듣기 / 느리게 (rate 0.65) / 모르겠다 버튼. 결과 화면에 문항별 그리스어·번역·사용자 입력 비교 + 🔊 다시듣기.

(5) **홈 화면 SRS due-today 카운터** · 기존 renderSRS·srsDueCards 활용.
홈 화면에 따뜻한 색조의 알림 카드 — '오늘의 SRS 복습 · N 개 단어가 due'. `srsDueCards()` 가 정의되어 있고 due 가 1 개 이상일 때만 노출. '바로 시작 →' 링크로 renderSRS 진입.

defer (다음 라운드 후보):
  · MI 동사 패러다임 토픽 (τίθημι · δίδωμι · ἵστημι · δείκνυμι)
  · accusative absolute (비인칭 동사의 특수 절대 구문)
  · σύν vs μετά 전치사 미세 구분
  · 악센트 위치 맞히기 신규 문제 유형
  · lemma 검색 / 콘코던스 (data-morph 역인덱스 구축 필요)
  · aria 라벨 접근성 일괄 정비

**v45**: 검색·콘코던스 (Εὕρεσις) — v44 의 defer 목록 중 "가장 큰 작업" 으로 표기했던 항목.

본 PWA 의 본문 (WORKS · 45 작품 · 545 섹션 · ~266 K 토큰 · ~45 K 고유 form) 에 대한 전체 텍스트 검색을 신설. MORPH_LOOKUP (AGDT v2.1, 약 37 K 어형 분석 · 11.8 K lemma) 의 형태분석을 활용한 *lemma 기반 검색* 도 지원.

**(1) 인덱스 아키텍처** — 인메모리, lazy, 한 번 구축 후 세션 동안 캐시.
```
_searchIdx = {
  occ:          Map<normalized form, Array<packedPos>>  // pos = workIdx*10000 + secIdx
  surface:      Map<normalized form, original form>     // 정규화 키 → 원형 surface
  lemmaForms:   Map<normalized lemma, Set<original form>>  // 표제어 → 어형 변이
  lemmaSurface: Map<normalized lemma, original lemma>
}
```
* 위치는 작품·섹션 단위까지만 (라인·토큰 위치는 안 저장) — 메모리 ~1-2 MB. 컨텍스트는 검색 시 본문 *재스캔* 으로 추출.
* 정규화: NFD → 다이아크리틱 제거 → 어말 ς → σ → 소문자. *polytonic/monotonic, 시그마 위치, 대소문자 무관* 검색.

**(2) 인덱스 구축** — `_buildSearchIndex(progressCb)` 비동기.
* 작품 단위 chunk, 매 3 작품마다 `await setTimeout(0)` 로 event loop yield — UI freeze 방지.
* 진행률 콜백 (0–1) → 입력 카드의 status 라인에 % 갱신.
* 측정: node 환경 1.7 초 (45 작품 / 266 K 토큰), 모바일 ~2-4 초 예상.
* MORPH_LOOKUP 의 모든 lemma 등록 — 본문에 안 나오는 lemma 도 어형 변이 표시 가능.

**(3) 검색 양방향** — `_renderSearchResults(query)` 가 두 갈래 동시 시도:
* form 검색: 쿼리가 form 이면 occ 에서 직접 hit + MORPH 로 lemma 도출 → 같은 lemma 의 *다른 어형* fan-out.
* lemma 검색: 쿼리가 lemma 면 lemmaForms 에서 모든 어형 → 각 어형의 occ 합산.
* 한 쿼리가 양쪽 일치 (λέγω) 도 자연스럽게 처리.

**(4) 결과 UI** — 두 카드 블록.
* **표제어 (Lemma)**: surface lemma, 형태분석 (POS·격·시제·법·태 등 한국어 표기), 어형 변이 24 개까지 (그 이상은 *"…외 N"* 으로 축약). 🔊 발음 + 외부 사전 (Logeion/Perseus) 링크.
* **본문 등장 (콘코던스)**: 작품별 그룹 (등장 횟수 내림차순), 상위 20 작품. 각 작품 내 섹션별 (최대 12 섹션). 섹션 라벨 클릭 → `renderWorkSection` 으로 *해당 섹션 본문 점프*. 각 항목에 ±5 단어 컨텍스트, 매치 토큰을 `<mark>` 으로 강조.

**(5) 컨텍스트 추출** — `_extractContext(text, matchedForms)`:
* 본문을 라인별로 스캔, 매치 토큰 첫 발견 위치 ±5 단어 윈도우.
* separator (공백) 와 word 분리 카운트 — 윈도우 폭이 토큰 수 기준.
* 매치 토큰은 `<mark>` 처리하여 강조.

**검색 시뮬레이션 결과** (node):
| 쿼리 | 매치 어형 | 본문 등장 | 작품 수 |
|---|---|---|---|
| λέγω | 88 | 1412 | 43 |
| ἄνθρωπος | 11 | 534 | 41 |
| καί | 3 | 545 | 45 |
| μῆνις | 1 | 4 | 3 |
| Σωκράτης | 5 | 45 | 4 |
| πόλις | 12 | 288 | 30 |
| τίθημι | 73 | 194 | 31 |

본 모듈은 어휘 학습·문법 학습·본문 읽기 세 갈래를 *어휘 차원* 에서 연결하는 hub 다. 특정 lemma 의 모든 어형을 한자리에서, 그 어형들이 등장하는 본문을 한 클릭에 점프 — 그동안 분리되어 있던 학습 흐름을 통합한다.

defer (다음 라운드 후보):
  · MI 동사 패러다임 토픽 (τίθημι · δίδωμι · ἵστημι · δείκνυμι)
  · accusative absolute (비인칭 동사의 특수 절대 구문)
  · σύν vs μετά 전치사 미세 구분
  · 악센트 위치 맞히기 신규 문제 유형
  · 본문 읽기 뷰에서 단어 클릭 → 검색 통합 (현재는 외부 사전만)
  · aria 라벨 접근성 일괄 정비

**v46**: 학자 낭독 자료 대규모 확장 — 사용자 요청 *"고전 그리스어 학습 사이트 등에서 더 자연스러운 발음을 최대한 찾아라"*.

광범위한 외부 자원 조사 (ancientgreek.eu free 카탈로그 전체, SORGLL rhapsodoi SoundCloud, LibriVox Projet Homere 컬렉션, Internet Archive, ScorpioMartianus). 본 앱 본문 매칭 확장 + 별도 카탈로그 신설.

**(1) SCHOLAR_AUDIO 확장** — v42 의 6 매칭 → 7 매칭 + 추가 자료 합산. 본 앱 12 작품 중 신규 매칭 1 개 (plato-euthyphro), 기존 4 작품에 추가 자료 보충.
  · `plato-euthyphro` 신규 매칭: Stratakis 의 Euthyphro ch.01 무료 샘플 (YouTube `tHIGHELlnns`). 본 앱의 sections 2-3 매핑. type='youtube'.
  · `plato-apology` 보충: LibriVox Apology *전체* (1:46:56, Ἑλένη Κεμικτσή, Public Domain). 발음은 *현대 그리스* (학자 복원 아님). 2-파트 mp3 직접 링크.
  · `homer-odyssey-1` 보충: LibriVox Odyssey Book 1 전체 (Ἑλένη Κεμικτσή).
  · `herodotus-1` 보충: Ariphron 의 psilotic Ionic 변형 발음 (Internet Archive).

**(2) `_openScholarAudio` 타입 핸들러 추가** — 'youtube' (iframe embed, 200px), 'archive' (Internet Archive: 직접 mp3 link 있으면 inline `<audio>`, 없으면 "Archive 페이지 ↗" 버튼). 'archive' 의 `extra.url2` 필드로 *2 파트 mp3* (LibriVox 의 Part 1/2 분할 같은 경우) 지원.

**(3) SCHOLAR_LIBRARY 신설 (Ἀκρόασις · 학자 낭독 도서관)** — 본 앱 본문 외의 학자 낭독 카탈로그.
어휘 탭의 새 진입 카드 `Ἀκρόασις · 학자 낭독 도서관`. 총 **20 자료**, 9 카테고리:

  · **Stratakis (ancientgreek.eu) 8 자료** — 모두 무료 mp3, 페이지에서 직접 URL 확인됨:
    Sappho To Aphrodite (가창, 2:27), Sappho Brothers Poem (1:57), Euripides Helena 1-67 (5:54), Aristotle De Caelo 1.09 (10:55), Empedocles fr.4 (1:22), Hippocrates Oath (4:27), Pindar Olympian 1 *전체* (8:55!), Sophocles Oedipus Coloneus 1-13 (1:27).

  · **LibriVox / Projet Homere (Κεμικτσή) 5 자료** — Public Domain, 현대 그리스 발음:
    Odyssey Book 6 (Nausicaa), Book 21 (활 시험), Book 22 (구혼자 살해), Homeric Hymns 33편, Orphic Hymns 87편.

  · **SORGLL Daitz (SoundCloud rhapsodoi) 5 자료** — 복원 발음 + pitch accent:
    Aeschylus Prometheus 1007-1053, Sappho 1 (Aphrodite Ode), Aristophanes Birds 227-262, Demosthenes On the Crown 199-208, Euripides Trojan Women 740-779.

  · **기타 2 자료**: Daitz 의 Proclus 13th Proposition, W.H.D. Rouse 의 *Sounds of Ancient Greek* (1920년대 역사적 녹음, Public Domain 확인).

**(4) 발음 체계 비교 안내** — 모든 자료에 `system` 필드로 발음 체계 명시. 학자 낭독 도서관 진입 직후 첫 카드가 *발음 체계 비교 가이드* — 4 가지 체계 (Stratakis Vox Graeca / SORGLL Daitz pitch accent / Projet Homere 현대 / Ariphron psilotic Ionic) 의 차이를 명시. 학습자가 같은 시·작품의 *여러 해석* 을 비교 청취할 수 있음 (Sappho 1: Stratakis 가창 ↔ SORGLL 낭독).

**솔직한 한계**:
  · Aeschylus *Persians* (본 앱 aeschylus-persians) 의 학자 낭독은 무료 공개분에 *없음*. SORGLL 은 Prometheus, Agamemnon 만. 매칭 불가.
  · Sophocles *Antigone* (본 앱 sophocles-antigone) 도 무료 매칭 없음. Stratakis Oedipus Coloneus 는 *다른 작품*이므로 SCHOLAR_LIBRARY 로만.
  · Plutarch Themistocles, Hesiod Works and Days, Plato Crito 도 무료 매칭 없음.
  · 일부 SORGLL SoundCloud URL slug 은 *추정* — rhapsodoi 컬렉션의 정확한 슬러그 미확인. 클릭 시 404 가능. modal 의 fallback (출처 페이지 링크) 으로 일부 대응.
  · ScorpioMartianus (Luke Ranieri) 자료는 대부분 Patreon 유료. 무료 자료 ("Ancient Greek Alive 001") 가 있으나 직접 mp3 호스트 미확정. 카탈로그에 미포함.
  · Stratakis 의 Plato Crito 오디오북은 존재 (page: plato-crito.html) 하나 무료 샘플 mp3 URL 미확인. 카탈로그에 미포함.

defer (다음 라운드):
  · SoundCloud rhapsodoi 실제 슬러그 검증·갱신
  · Plato Crito 무료 샘플 URL 추적
  · ScorpioMartianus Ancient Greek Alive 001 통합
  · MI 동사 토픽, acc abs, σύν vs μετά
  · 악센트 위치 문제 유형
  · 본문 단어 클릭 → 인앱 검색 통합
  · aria 라벨 정비

**v47**: deferred 목록 중 자체 완결 4 항목 묶음 처리. 외부 의존 3 항목 (SoundCloud slugs, Plato Crito sample, ScorpioMartianus) 은 *지난 라운드 한계 그대로* 라 defer 유지.

**(1) 문법 토픽 3 추가** — TOPICS 39 → 42. 새 카테고리 `prep` 추가.
  · `mi-verbs` MI 동사 패러다임 — τίθημι · δίδωμι · ἵστημι · δείκνυμι. 4 동사의 어근 reduplication, 단·복수 모음 교체 (장 η/단 ε, 장 ω/단 ο), κ-부정과거 vs σ-부정과거 vs 어근 부정과거 (ἔστην) 의 분기, 의미 확장. *그리스어 동사 학습 두 번째 큰 산*.
  · `acc-abs` 대격 절대 — 비인칭 분사 (ἐξόν · παρόν · δοκοῦν · δέον · προσῆκον) 의 중성 단수 대격 절대 구문. 양보·인과·조건 해석. 속격 절대 와 비교 진단표.
  · `syn-meta` σύν vs μετά — 두 전치사 + ἅμα 의 미세 차이 (협력 / 중립 동반 / 시간 동시성). μετά + 대격 ('~뒤에') 까지 포함하여 격 의존성 강조.

**(2) 악센트 학습 모드 (Τόνος · Accent Quiz)** — 새 진입 카드.
어휘 탭의 새 카드 `Τόνος · 악센트 위치 — 운율의 핵심`. 두 가지 질문 유형 번갈아:
  · *위치 식별*: ultima (마지막) / penult (끝-2) / antepenult (끝-3) 선택.
  · *종류 식별*: acute (´) / circumflex (῀) / grave (`) 선택.

핵심 알고리즘 — `_classifyAccent(word)`:
  · NFD 정규화 → base char + diacritics 분리.
  · 모음 스캔, 인접한 모음 쌍이 *true diphthong* (αι ει οι υι αυ ευ ηυ ου ωυ) 이면 한 음절.
  · 두 번째 모음에 diaeresis (U+0308) 있으면 *hiatus* → 별개 음절. 첫 모음에 diaeresis 있어도 별개.
  · diphthong 의 어느 글자든 acute/circumflex/grave 가 그 음절의 강세 (실제 표기는 두 번째 글자).
  · 위치는 끝에서부터 카운트 — 1=ultima, 2=penult, 3=antepenult.

**검증 — 34개 단어**: 19 개 초기 테스트 (코어 어휘) + 어휘 풀 발췌 15 개 모두 통과. 분류기와 expected 가 충돌한 2 케이스 (ἐκκλησία 4음절, αὐτίκα penult) 는 *내 셈 오류* 였고 분류기가 정답 — 정확도 100% (34/34).

**풀 통계 (1142 어휘 → 학습 가능 1009)**:
  · 음절: 단음절 82 (proclitic/enclitic 18 + 강세 있는 1음절 64) / 2음절 528 / 3음절 359 / 4음절 122 / 5음절+ 33
  · 강세 종류: acute 917, circumflex 92, grave 0
  · 강세 위치: ultima 243, penult 563, antepenult 198
  
**의도된 한계**: grave 가 풀에 0 인 이유는 단어 lemma 가 사전형이고 grave 는 *문장 내 위치* 에서만 발생. 학습 시 grave 옵션은 *항상 오답* 이지만 *식별 능력* 자체는 학습 가치 있음.

가중치: antepenult (덜 흔함) 와 circumflex (덜 흔함) 를 가중 — proparoxytone 과 circumflex 노출을 늘려 학습 효과 강화.

**(3) 본문 단어 클릭 → 인앱 검색 통합** — UX workflow 연결.
`openLookup(word)` modal (형태 분석 표시) 의 외부 사전 버튼 행에 **🔍 본문 검색** 버튼 추가:
  · 분석 있는 경우 (AGDT 커버 작품) — *표제어 (lemma)* 로 검색 → 같은 lemma 의 *모든 어형 변이* 가 본문에서 어디 등장하는지 종합 표시.
  · 분석 없는 경우 — *surface form* 으로 검색.

새 헬퍼 `window._lookupToSearch(encWord, encLemma)`:
  1. modal 닫고
  2. `_searchInput` 에 query 저장
  3. `setTab('vocab')` 후 `renderSearch()` 호출.

`renderSearch` 에 자동 진행 분기 추가 — *인덱스 없고 prefill 된 검색어 있으면 자동으로 빌드 + 검색* (`go.click()`). 본문 단어 클릭 → 형태 분석 → 본문 검색 의 *원클릭 흐름*.

이전엔 워크플로가 분리되어 있었음: 본문 단어 클릭 → 외부 사전만, 같은 lemma 의 다른 등장 위치는 Εὕρεσις 에 다시 가서 손으로 입력해야 함. 이제 한 클릭 연결.

defer (다음 라운드 후보):
  · SoundCloud rhapsodoi slugs (외부 검증 필요)
  · Plato Crito 무료 샘플 URL (외부 발견 시)
  · ScorpioMartianus Ancient Greek Alive 001 (외부 호스트 미확정)
  · aria 라벨 일괄 정비 (접근성 분산 작업)
  · 추가 문법 토픽: μι-동사의 *중간태/수동태 패러다임* (현재는 능동만), ἵστημι 의 자/타동 부정과거 두 활용표
  · 단어 카드 (어휘 학습) 에 *악센트 자동 분류* 정보 표시 — `_classifyAccent` 의 결과를 어휘 카드 부가 정보로

**v48**: deferred 자체 완결 3 항목 묶음 (외부 의존 3 항목은 새 정보 없이 defer 유지).

**(1) μι-동사 토픽 대폭 보강** — 기존 paradigm + paradigmAlt 2 표만 가능하던 토픽 자료 모델을 *배열 확장* (`extraParadigms`) 으로 확장. `renderTopic` 이 `Array.isArray(t.extraParadigms)` 면 각각 별도 카드로 렌더 — backward-compatible.

새로 추가된 6 표:
  · τίθημι 현재 *중간·수동* 직설법 — τίθεμαι · τίθεσαι · τίθεται (intervocalic σ 보존)
  · τίθημι 부정과거 — κ-부정과거 단수 + 어근 부정과거 복수 *혼합 패턴* (ἔθηκα vs ἔθεμεν)
  · δίδωμι 부정과거 — 같은 혼합 (ἔδωκα vs ἔδομεν)
  · **ἵστημι 두 부정과거** — 타동 σ-부정과거 (ἔστησα "I set it up") vs 자동 어근 부정과거 (ἔστην "I stood"). 의미 분기.
  · ἵστημι 현재 능/중·수 + 완료 ἕστηκα "서 있다" — *현재 의미의 완료*
  · 네 동사의 부정과거 분사 (θείς · δούς · στάς · στήσας · δείξας) — 부사절·진행 행위 묘사

**(2) 어휘 카드에 악센트 자동 분류 표시** — v47 의 `_classifyAccent` 재사용.
  · Quick Review (홈) '뜻 보기' 클릭 시 — '3음절 · 마지막 음절 · 예음' 형식
  · openLookup modal (본문 단어 클릭) 헤더 직후 — '⛓ N음절 · 강세 위치 · 강세 종류' 한 줄. v32 에서 제거됐던 블록을 *압축 라벨 형태로* 재도입.

학습 통합 효과: Τόνος 모드의 분류 용어가 어휘·본문 어디든 일관되게 노출 → 무의식적 분류 어휘 습득.

**(3) renderAccentQuiz 이름 충돌 해결** — v47 의 새 함수가 *v32 시절 옥시톤·파록시톤 분류 quiz* (renderAccentQuiz(questions, idx, score)) 와 같은 이름. hoisting 으로 옛 함수 덮어쓸 위험. 새 함수를 `renderAccentLocator` 로 개명하여 두 quiz 공존.

**(4) aria 라벨 자동 패치 31 항목**:
  · title="..." emoji-only 버튼 12 → aria-label 추가 (🔊, 📻, 🔍 등)
  · placeholder 있는 input 10 → aria-label 추가
  · nav 타일 4 (어휘·문법·원문·명예) → 의미 라벨
  · 학자 낭독 audio·iframe 5 → 플레이어 식별 라벨

총 aria-label 35 · title 18. 스크린 리더 사용자가 emoji-only 컨트롤 의미를 들을 수 있게 됨.

defer (다음 라운드):
  · 외부 의존 3 항목 — 새 정보 없으면 진척 불가
  · μι-동사의 *가정법/희구법* 패러다임 (현재는 직설법만)
  · 명사·형용사 변화표 시각화 도구
  · 다국어 UI (i18n)
  · 본문-학자 낭독 시간 동기 (단어별 highlight)

**v49 + v50**: 본문-학자 낭독 시간 동기. *deferred 중 가장 야심찬 항목*. 두 라운드 통합 진행 (v49 엔진·기초 데이터, v50 문장 단위 확장).

**솔직한 한계 (구현 전 인정)**:
  · 완전한 단어별 highlight 는 학자 낭독에 *forced alignment timing 데이터* 가 필요한데, 그리스어 acoustic model 부재로 어떤 자료에도 alignment 가 없음.
  · 수동 alignment 는 작품당 1-2 시간 — 작업 비용이 학습 효과 대비 크다.
  · SoundCloud / YouTube iframe 은 *timeupdate 이벤트가 부모로 전달되지 않아* 동기 자체가 기술적으로 불가능. → homer-iliad-1, homer-odyssey-1 등은 동기 불가.

**현실적 접근 — 행·단락·문장 단위 비례 동기**:
  cue point (`{t: 초, unit:'line'|'para'|'sent', value: 인덱스}`) 만 정의하면 timeupdate 가 자동으로 본문의 해당 요소를 highlight. 정확도 ±3-8초 (낭독 속도 변동, 호흡 멈춤).

**(1) 본문 마크업 확장**:
  · `data-line-idx` — 행 단위 (모든 라인)
  · `data-para-idx` — 단락 단위 (빈 줄로 분리된 산문 단락)
  · `data-line-num` — 시 본문의 행 번호 (호메로스 1, 2, 3 ...)
  · **`.sent[data-sent-idx]`** (v50 신규) — 문장 단위 span. *같은 라인 안의 복수 문장* + *같은 문장의 복수 라인 걸침* 양쪽 처리. 문장 종결 부호 (. ; · ? !) 로 분할.

**(2) Sync engine `_attachSyncHighlight(audioEl, cues)`**:
  · audio.timeupdate 에서 현재 t 가 속한 cue 식별 (binary search 가능하나 cue 수가 적어 linear)
  · cue.unit 별로 적절한 selector 적용 — line 은 `[data-line-num]`, para 는 `[data-para-idx]`, sent 는 `.sent[data-sent-idx]`
  · sent 는 *복수 elements 일 수 있어* querySelectorAll, 모두 highlight
  · 자동 스크롤 (viewport 밖이면 scrollIntoView smooth)
  · pause/ended/seeking 시 clear
  · modal 닫힐 때 MutationObserver 로 cleanup

**(3) Cue 데이터 — 7 매칭 자료 중 4 자료** (mp3 가능한 것만):
| 작품 | cue | 정확도 |
|---|---|---|
| **xenophon-anabasis-1 §1.1** | 11 단락 | ±5초 |
| **hesiod-theogony §1-50** | 21 행 (v.1-21 만, 22-50 은 녹음 외) | ±3초 |
| **herodotus-1 §1.1-1.4** | 4 섹션 합산 12 단락 (cuesBySection) | ±5초 |
| **plato-apology §17** (v50) | 13 문장 (단락 1개, 문장 단위 필수) | ±5-8초 |
| homer-iliad-1, homer-odyssey-1 | SoundCloud iframe → 불가 | — |
| plato-euthyphro | YouTube → 불가 | — |
| Ariphron Herodotus (archive) | mp3 직접 링크 없음 → 불가 | — |
| LibriVox Apology 전체 | 너무 길어 cue 작성 미수행 (~1:47) | — |

**(4) UX 안내**:
  · 동기 활성 자료 — modal 상단에 `🎯 본문 동기 활성 — 정확도 ±3-8초` 표지
  · iframe 만 있는 자료 — `ⓘ 본문 동기 미지원 — SoundCloud/YouTube 임베드는 부모 페이지에서 시간 정보를 받을 수 없습니다.`
  · 학습자가 *왜 동기가 안 되는지* 알게 — 신뢰 유지

**기술적 정보**:
  · CSS `.now-speaking` (단락·행 highlight) — 좌측 terracotta 경계 + gradient
  · CSS `.now-speaking-sent` (문장 highlight) — rounded background + 강조
  · `_syncCurrentIdx` 로 *이전 cue 와 같으면 DOM 만지지 않음* — timeupdate 가 250ms 주기 호출되어도 비용 거의 0
  · MutationObserver — modal 닫힐 때 cleanup (memory leak 방지)

**검증**:
  · Apology §17 본문 마크업 시뮬레이션 — 13 sentences 정확히 추출, cue 와 1:1 매핑
  · 문장이 *라인을 가로지를 때* 같은 sentIdx 로 두 span 분할 (querySelectorAll 로 모두 highlight)
  · 같은 라인 안 *복수 문장* — 새 span 자동 시작

defer (다음 라운드):
  · μι-동사 가정법/희구법 패러다임
  · 명사·형용사 변화표 시각화
  · 다국어 UI (i18n)
  · *외부 의존 항목* (SoundCloud slugs, Plato Crito sample, ScorpioMartianus host) — 새 정보 없이 진척 불가
  · 학자 낭독에 *수동 정렬 도구* 내장 — 사용자가 본문 클릭으로 cue 누적 (B 단계 미구현)
  · forced alignment 시도 — 그리스어 acoustic model 이 생기면 단어별 highlight 가능

**v49**: deferred 마지막 자체 완결 항목 — **본문-학자 낭독 시간 동기**.

학자 낭독 mp3 가 재생되는 동안 본문의 *현재 발화 중인 행/단락* 이 시각적으로 강조되는 기능. 학습 가치 매우 큼 — 운율·발음·의미를 *동시에* 학습.

**기술적 한계와 접근**:
  · *자동 forced alignment 는 불가능* — PWA 환경엔 음성 분석 ML 도구 없음, 외부 호스트 mp3 는 CORS 로 raw audio 도 못 가져옴.
  · *수동 cue point 데이터* — 각 녹음에 대해 측정된 timestamp 를 데이터로 갖고, `audio.timeupdate` 이벤트로 현재 시점에 매칭.
  · *비례 추정* — 시 본문은 hexameter 균등 가정 (행/총시간), 산문은 문자 길이 비례. 정확도 ±3-5초.
  · *iframe 격리* (SoundCloud, YouTube) 는 timeupdate 못 받으므로 동기 *불가* — mp3·archive 만.

**(1) cue point 데이터 모델**:
```js
{
  duration: 369,         // 전체 길이 (초)
  cues: [                // 단일 섹션
    {t: 0.0,   unit: 'para', value: 0},
    {t: 18.2,  unit: 'para', value: 1}, ...
  ],
  // 또는
  cuesBySection: {        // 한 mp3 가 여러 섹션 커버
    '1.1': [...], '1.2': [...], ...
  }
}
```
unit: 'line' (시 — 행 번호) | 'para' (산문 — 단락 인덱스)

**(2) 측정된 cue points — 3 자료**:
  · **Anabasis 1.1** (Stratakis, 369초): 11 단락 × 문자 길이 비례. para 0 @ 0s ~ para 10 @ 331s
  · **Theogony 1-50** (Stratakis, 109초, 1-21행만 녹음): line 1-21 균등 5.2초 간격
  · **Herodotus 1.1-4** (Stratakis, 375초, 4 섹션 × 14 단락 총합): cuesBySection 으로 섹션별 분리, 1.1 시작 0s · 1.2 시작 141s · 1.3 시작 228s · 1.4 시작 282s

다른 4 자료 (plato-apology Stratakis, plato-euthyphro, homer-iliad-1 SORGLL, homer-odyssey-1 SORGLL) 는:
  · plato-apology Stratakis 는 mp3 직접 — 다음 라운드 측정 후보
  · plato-euthyphro 는 type='youtube' (iframe 격리 — 동기 불가)
  · SORGLL Daitz 는 type='soundcloud' (iframe 격리 — 동기 불가)

**(3) 본문 렌더링에 인덱스 부여** — `renderWorkSection`:
  · 시 본문: `data-line-num="N"` 속성 (라인 prefix "N " 자동 검출)
  · 산문: `data-para-idx="N"` 속성 (연속 빈 행 후 첫 비-빈 행마다 단락 인덱스 증가)
  · 빈 행은 `data-line-blank="1"` — 단락 분리 표지

**(4) 동기 엔진** — `_attachSyncHighlight(audioEl, cues)`:
  · audio `timeupdate` 이벤트마다 현재 `currentTime` 에 속한 cue 식별 (가장 큰 t ≤ currentTime).
  · cue 가 변하면 이전 highlight 제거 후 새 element 에 `.now-speaking` 클래스 추가.
  · viewport 밖이면 부드러운 자동 scroll (`scrollIntoView({behavior:'smooth', block:'center'})`).
  · `pause`/`ended` 에서 cleanup. `seeking` 으로 인덱스 reset (사용자가 슬라이더 조작 시 즉시 재계산).
  · MutationObserver 로 modal 닫힐 때 highlight + listener 정리 (메모리 누수 방지).

**(5) CSS** — 부드러운 시각 효과:
```css
.passage div.now-speaking{
  background: linear-gradient(90deg, rgba(176,80,48,0.18) 0%, ... transparent 100%);
  border-left: 3px solid var(--terracotta);
  padding-left: 8px;
  transition: background 0.4s ease;
}
```
세련된 좌측 강조 + 옅은 그라데이션. 글자 색 안 바꿈 (가독성 유지).

**(6) UI 안내** — 동기 활성 modal 상단에 표시:
> 🎯 **본문 동기 활성** — 재생 중 본문의 현재 발화 행/단락이 강조됩니다. 비례 추정이라 정확도 **±3-5초**.

동기 가능 여부 + 정확도 한계를 사용자에게 명시. cue 가 없는 자료는 badge 안 뜨고 일반 modal.

**호출 방식 변경**: `_openScholarAudio(recs)` → `_openScholarAudio(recs, syncContext)`. syncContext = `{workId, secN}`. 본문 view (`renderWorkSection`) 의 📻 버튼에서 자동 전달, 학자 낭독 도서관 (`renderScholarLibrary`) 진입 시는 없음 (본문 없으니 동기 불가).

defer (다음 라운드):
  · 외부 의존 3 항목 (SoundCloud slugs, Plato Crito sample, ScorpioMartianus) — 정보 없음
  · plato-apology Stratakis mp3 cue points 측정
  · μι-동사 가정법/희구법 패러다임
  · 명사·형용사 변화표 시각화
  · *단어 단위* 동기 (현재는 행/단락 — 더 정밀한 동기는 큰 측정 부담)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n) — 사용자 요청으로 작업 범위에서 제외

**v50**: μι-동사 가정법/희구법 패러다임 완성 + plato-apology 시도/보류.

**(1) μι-동사 가정법·희구법 5 표 추가** — `extraParadigms` 끝에 append. mi-verbs 토픽이 9 표 → 14 표로:
  · 현재 가정법 — 세 동사 평행: τιθῶ·διδῶ·ἱστῶ + 활용 (어근 모음 + ω/η contract)
  · 부정과거 가정법 — 어근만 (reduplication 없음): θῶ·δῶ·στῶ. *실제 사용의 80%* 가 이 형태
  · 현재 희구법 — marker -ιη-/-ι- + 어미: τιθείην·διδοίην·ἱσταίην
  · 부정과거 희구법 — 어근 + -ιη-/-ι-: θείην·δοίην·σταίην
  · 가정법 vs 희구법 — 의미·구문 짝: ἐὰν θῶ (가능) vs εἰ θείην (희미한 가능), εἴθε θείην (소원), **μὴ γένοιτο** (관용)

expl 본문에도 가정법·희구법 안내 단락 추가 — 단순 표 나열이 아닌 *언제 어떻게 쓰는지* 짧은 가이드 동반.

학술 검증: Smyth (§416, §768) + Pressbooks Ancient Greek for Everyone (S 393) 와 일치. μι 동사가 *contract 동사처럼* 어간 모음과 mood marker 가 결합한다는 핵심 패턴 명시.

**(2) plato-apology cue points 측정 — 보류**:
  · Stratakis 의 Apology 전체는 1h 41m (유료). 무료 mp3 는 *Prologue ch.01* 만.
  · 본 앱 plato-apology §17 본문이 *한 단락 1478 chars* — 단락 단위 cue 매핑이 의미 없음 (이미 단일 단락).
  · 정확한 mp3 duration 도 페이지에 명시 안 됨.
  · *측정 가치 < 비용* — 다음 라운드 후보로 defer 유지.
  · LibriVox Apology 전체 (Ἑλένη Κεμικτσή, 1:46:56) 가 §17~§42 전체 커버하므로 *이쪽 cue 측정이 더 가치 있음* — 그러나 현대 그리스 발음이라 학자 복원 발음 학습 목적과 거리 있음.

defer (다음 라운드):
  · 외부 의존 3 항목 (SoundCloud slugs, Plato Crito, ScorpioMartianus) — 정보 없음
  · 명사·형용사 변화표 시각화 도구 (큰 신규 작업, 패러다임 표 + 빈칸 채우기 quiz 결합)
  · 단어 단위 시간 동기 (현재는 행/단락 — 측정 부담 큼)
  · plato-apology cue points (mp3 길이 확정 시)
  · 추가 학자 자료 매칭 (외부 발견 시)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

**v51**: 명사·형용사 변화표 시각화 도구 (Παράδειγμα) — v50 까지 defer 였던 *가장 학습 가치 높은* 신규 모듈. 큐레이션 표준 패러다임 (Smyth/Goodwin) + AGDT 실제 출현 어형의 *결합 표시* 가 핵심 설계.

**(1) PARADIGM_LIB — 76 표제어 큐레이션** (index.html line 3385~4112, ~750 lines, ~40 KB).

객체 구조 (명사 / 인칭대명사 ἐγώ·σύ — flat):
```js
'ἄνθρωπος': {
  pos:'noun', gender:'m', type:'2변화 남성 (-ος)',
  gloss:'사람, 인간', source:'Smyth §230',
  sg:{nom:'ἄνθρωπος', gen:'ἀνθρώπου', dat:'ἀνθρώπῳ', acc:'ἄνθρωπον', voc:'ἄνθρωπε'},
  pl:{nom:'ἄνθρωποι', gen:'ἀνθρώπων', dat:'ἀνθρώποις', acc:'ἀνθρώπους'},
}
```

객체 구조 (형용사·3-gender 대명사):
```js
'ἀγαθός': {
  pos:'adj', type:'1·2변화 형용사 (-ός, -ή, -όν)',
  gloss:'좋은, 선한', source:'Smyth §287',
  sg:{
    nom:{m:'ἀγαθός', f:'ἀγαθή', n:'ἀγαθόν'},
    gen:{m:'ἀγαθοῦ', f:'ἀγαθῆς', n:'ἀγαθοῦ'},
    ...
  },
  pl:{...}
}
```

수록 분류 (구조 분포: flat 57 + 3-gender 19):
  · **1변화 여성** 10: α-pure (χώρα, ἡμέρα, ἀγορά), η-type (γνώμη, ψυχή, ἀρχή, τέχνη, τιμή), 단α (θάλαττα, μοῦσα)
  · **1변화 남성** 4: πολίτης, στρατιώτης, ναύτης, νεανίας
  · **2변화 남성** 8: ἄνθρωπος, λόγος, θεός, ἵππος, νόμος, φίλος, ποταμός, ἀδελφός
  · **2변화 여성** 3 / 중성** 6: ὁδός, νῆσος, νόσος / δῶρον, ἔργον, παιδίον, ζῷον, τέκνον, ὅπλον
  · **3변화 자음 어간** 7: φύλαξ (κ), χάρις/ἀσπίς/ἐλπίς/παῖς (δ-τ), ἄρχων/γέρων (ντ), νύξ (κτ)
  · **3변화 중성 -μα·σ-stem** 6: σῶμα, πρᾶγμα, ὄνομα, χρῆμα · γένος, τέλος
  · **3변화 모음 어간** 4: πόλις, δύναμις (ι) · βασιλεύς, ἱππεύς (ευ)
  · **친족·불규칙 명사** 6: πατήρ, μήτηρ, θυγάτηρ, ἀνήρ, γυνή, Ζεύς
  · **1·2변화 형용사** 5: ἀγαθός, καλός, σοφός, ἄξιος, μικρός
  · **불규칙·3변화 형용사** 7: μέγας, πολύς · ἡδύς, ταχύς (3-ending) · ἀληθής, εὐδαίμων (2-ending) · πᾶς
  · **대명사** 9: αὐτός, οὗτος, ἐκεῖνος, ὅδε · ἐγώ, σύ · τίς, τις, οὐδείς

검증 — TOPICS 데이터와 *0 불일치*: 198 form 비교 (λόγος, δῶρον, χώρα, γνώμη, θάλαττα, φύλαξ, χάρις, ἄρχων, σῶμα, γένος, ἀνήρ, πατήρ, μήτηρ, γυνή, ἀγαθός, αὐτός, οὗτος 등). AGDT v2.1 와 80-95% 어형 일치 — 비일치 부분은 Homeric -οιο/-οισι/-εσσι, Doric ματ-/Δωρ-, elision φίλ̓/ἔργ̓, 비교급 μέγιστος/ἥδιστος/πλέον, crasis κἀγὼ/τοὔνομα, 지시 -ί 옑조사 (οὑτοσί) 로 *모두 정당한 변이*. 이들은 패러다임 외 그룹으로 별도 표시.

**(2) renderParadigmBuilder 모듈** (index.html line 7140~7245, ~106 lines).

UI 흐름:
  · vocab 탭의 Εὕρεσις (검색) 와 Ἀκρόασις (학자낭독) 사이에 카드 진입점
  · 입력 텍스트 → `_paradigmNormalize` (NFD + ς→σ + lowercase) → `_lookupParadigmLib`
  · Lookup 우선순위: (a) 직접 키, (b) 정규화 키, (c) MORPH_LOOKUP 어형→표제어 환원
  · 매칭 시: 큐레이션 표 + AGDT attestation (인덱스 미구축이면 lazy build 버튼)
  · 미매칭 시: AGDT-only fallback (lemma 일치하면 어형 나열, 어형이면 후보 lemma 버튼)
  · 카테고리별 details 펼침 목차 — 학습자가 PARADIGM_LIB 전체를 brouse 가능

핵심 dispatch 패턴 — pos 가 아닌 *셀 shape* 으로 flat vs 3-gender 결정:
```js
function _paradigmIsThreeGender(entry){
  for(const num of ['sg','pl']) for(const c in (entry[num]||{})){
    const v = entry[num][c]; if(v==null) continue;
    return (typeof v === 'object');
  }
  return false;
}
```
이로 인해 인칭대명사 ἐγώ·σύ (flat) 와 3-gender 대명사 (αὐτός, οὗτος 등) 가 자동 분기. pos=='pron' 으로 분기하지 않은 이유다.

AGDT attestation 분리 — 큐레이션 셀과 일치하면 *표준 패러다임 attested*, 아니면 *패러다임 외 어형* (방언/시문체/축약/비교급/지시 -ί). 빈도 상위 40개씩 표시. `_searchIdx.lemmaForms/surface/occ` 재사용.

**(3) 학술적 정당화**: PARADIGM_LIB 의 표준형이 AGDT 실제 출현과 80-95% 일치한다는 사실 자체가 *Attic 표준화의 경험적 근거*. 5% 의 비일치가 코퍼스의 *방언적 다양성* 과 *시대적 변이* — 학습자는 표준형을 익히면서 동시에 실제 텍스트의 변이 패턴을 볼 수 있다. 이는 "표준 패러다임 vs 실제 코퍼스" 의 *통합 학습* 으로, 단순 표 암기보다 학습 효과가 크다.

**(4) 빈칸 채우기 시험 모드** (`startParadigmQuiz` + 9 헬퍼, ~200 lines). 변화표 카드 하단 + 진입 화면 양쪽에 진입 버튼. *Active recall* (인출 학습) 의 testing effect — 단순 표 읽기 (수동 인식) 보다 변화 셀을 *능동적으로 회상*하는 게 장기 기억 형성에 결정적이라는 인지과학적 근거 (Roediger & Karpicke, 2006).

핵심 알고리즘:
  · `_paradigmQuizCells` — flat/3-gender 패러다임을 좌표 ({num, case, gender, expected}) 리스트로 평탄화
  · `_paradigmQuizCandidates` — 가릴 후보 선별. sg.nom 은 표제어 hint 라 *항상 유지*; 명사는 voc 도 자주 = sg.nom 이라 제외
  · `_paradigmQuizPickBlanks` — Fisher-Yates 셔플 후 max(3, min(7, 40%)) 개 선택
  · `_renderQuizFlat` / `_renderQuizThreeGender` — `_renderCuratedFlat` / `_renderCuratedThreeGender` 와 동일 골격, 빈칸 셀만 `<input>` 으로 치환
  · 채점: `_paradigmQuizNormalize` (NFD + 다이아크리틱 제거 + ς/σ 통일 + lowercase) → 비교. 액센트까지 NFC 일치하면 ★ 표시 (정확도 별도 카운트)

학습자 UX:
  · Enter 키로 다음 빈칸 → 마지막에서 자동 채점
  · 결과: 정답 녹색, 액센트 차이만 있을 때는 표시 + (액센트 ≠) 부가 라벨, 오답은 사용자 입력 strikethrough + 정답 적색
  · 컨트롤: 🎲 다른 빈칸 (같은 표제어) · 🎲 무작위 표제어 · 정답 보기 · ← 학습 모드

검증 (`test-quiz.js`):
  · syntax + 10 quiz 함수 정의 + window dispatch
  · 76/76 lemma 가 quiz 가능 (Ζεύς 만 단수 3 cell 로 무작위 후보에서 제외 — 고유명사 의도된 한계)
  · 정규화 5/5 케이스 통과 (다이아크리틱·ς/σ·동일·다른 격·여러 변형)
  · 런타임 시뮬레이션 76/76 OK, 0 에러

**(5) 부수 발견 — TOPICS 카운트 정정**: §0 이 v47 부터 "42개" 로 표기했으나 v51 검증에서 `TOPICS.length === 41` 확인. v47 changelog 의 "39 → 42" 표기 자체가 오기였던 것으로 보임 (v47-v50 사이 토픽 추가/제거 changelog 없음). 코드 내 모든 카운트는 `TOPICS.length` 동적 참조라 사용자에게 표시되는 수치는 항상 41 이었음. §0 만 정정.

**라운드 분담** (인계자 참고용 — v51 은 *두 세션 통합* 라운드):
  · 이전 세션 (paradigm-lib-draft.js·xref·validate 파일이 작업 디렉토리에 남아 있는 시점) — PARADIGM_LIB 76 표제어 큐레이션, index.html 통합, 검증 인프라 작성, 진입 카드 추가, 헬퍼 16 함수 (lookup/render/AGDT attest/fallback/suggestions)
  · 다음 세션 (본 entry 작성 시점) — 변화표 빈칸 채우기 quiz 모듈 (10 함수, ~200 lines), 학습 카드에 quiz 진입 버튼, 진입 화면 무작위 quiz, TOPICS 카운트 정정, §0/§7/NEXT_TASKS 갱신

defer (다음 라운드):
  · 외부 의존 3 항목 (SoundCloud slugs, Plato Crito, ScorpioMartianus) — 정보 없음
  · 단어 단위 시간 동기 (현재는 행/단락 — 측정 부담 큼)
  · plato-apology cue points (mp3 길이 확정 시)
  · 추가 학자 자료 매칭 (외부 발견 시)
  · **PARADIGM_LIB 확장** — 비교급·최상급 형용사 (μείζων, ἥδιστος), 분사 (현재분사 m/f/n, 부정과거 분사), 추가 3변화 (πούς, χείρ 등 신체 명사)
  · **μι-동사 가정법/희구법 quiz 통합** — v50 의 5 표 (mi-verbs 토픽의 extraParadigms) 는 학습 표만 있고 quiz 없음. PARADIGM_LIB 구조와 다른 *동사 패러다임* 이라 startParadigmQuiz 와 직접 호환은 안 됨 — 별도 진입로 또는 라이브러리 통합 설계 필요

**v52**: 캐릭터 (Παίγνια · 50 신화·역사 인물) + 원문 해석 (Ἑρμηνεία · 문장 단위 한국어 해석) — 두 주요 신규 모듈. 사용자 요청 *"캐릭터 기능 추가, 50가지 캐릭터와 사진으로 프로필 꾸미고 멀티와 명예의 전당에 표시되도록"* + *"원문 해석 볼 수 있는 버튼 추가, 원문 해석은 각 문장 밑에"*.

**(1) 캐릭터 시스템 — Παίγνια (50명)** — 학습 진척과 무관한 *학습자 정체성* 모듈. 5 카테고리:
  · 올림포스 신 (12): Zeus, Hera, Poseidon, Demeter, Athena, Apollo, Artemis, Ares, Aphrodite, Hephaestus, Hermes, Dionysus
  · 영웅 (12): Achilles, Heracles, Odysseus, Theseus, Perseus, Jason, Bellerophon, Hector, Ajax, Diomedes, Orpheus, Aeneas
  · 여신·여성 영웅 (8): Helen, Penelope, Andromache, Cassandra, Antigone, Atalanta, Medea, Hestia
  · 철학자 (10): Socrates, Plato, Aristotle, Pythagoras, Heraclitus, Diogenes, Epicurus, Empedocles, Thales, Anaximander
  · 시인·역사가·정치가 (8): Homer, Hesiod, Sappho, Pindar, Herodotus, Thucydides, Pericles, Solon

**디자인 선택 — "사진" 대신 SVG 메달리온**: 사용자가 *"사진"* 을 요청했으나, 본 PWA 는 오프라인 우선 구조 (cross-origin 이미지 의존 불가) + 저작권 안전 (실존 인물의 박물관 흉상 사진은 라이선스 복잡) 두 제약 때문에 *그리스 동전 양식의 procedural SVG 메달리온* 으로 구현. 각 캐릭터는 (a) 카테고리별 그라데이션 배경, (b) 그리스 메안더 외곽 점, (c) 중앙 그리스 이니셜 (Cormorant Garamond/Gentium 폰트), (d) 하단 32종 SVG 심볼 (lightning, owl, lyre, trident, club, scroll, mask, loom 등 — 각 캐릭터의 전통 상징), (e) ≥80px 일 때 하단 이름 띠로 식별. 100×100 viewBox 의 단일 인라인 SVG, 5 픽셀 크기 (24/32/40/56/72/96/128) 자동 적응.

**5 표시 위치**:
  · 홈 화면 우상단 (24px 미니 메달리온 + 프로필 이름)
  · 사용자 프로필 관리 — *"내 캐릭터" 80px 큰 카드 + 클릭 시 픽커*, 각 프로필 행에 44px 메달리온
  · 명예의 전당 — 88px 메달리온 카드 (통계 위)
  · 라이브 순위표 — 각 행 이름 옆 32px 메달리온
  · 멀티 배틀 — 대기실 44px, 점수보드 28px, 결과 화면 40px

**캐릭터 픽커 (renderCharacterPicker)**: 카테고리 필터 (전체/신/영웅/여신/철학자/시인) + 검색 (한국어/그리스어/영어/별칭) + 96px 그리드. 현재 선택 표시 (96px + 그리스어 + 한국어 + 별칭 + 1줄 설명). 50명 즉시 선택 가능 (학습 진척 무관 — 학습 동기 부여를 위한 점진 잠금은 defer).

**상태 관리**: `S.character = 'athena'` (기본값: 지혜의 여신, 학습에 어울리는 정체성). `_ensureCharacter()` 마이그레이션. 라이브 순위 페이로드에 `character` 필드 추가하여 다른 학습자에게 노출. 멀티 배틀 `room.players[uid].character` 도 동일.

**SVG 호환성 (Safari)**: 초기 버전은 `<text dominant-baseline="middle">` 사용했으나 iOS Safari 14 이하에서 무시되는 알려진 이슈로 *이니셜 위치 어긋남*. v52.1 핫픽스: dominant-baseline 제거 + 명시적 y 좌표 (작은 메달리온 y=72, 큰 메달리온 y=55) 로 모든 브라우저 일관성 확보. 검증: 300/300 (50 캐릭터 × 6 크기) jsdom SVG 파싱 통과.

**(2) 원문 해석 시스템 — Ἑρμηνεία** — 본문 읽기 (renderWorkSection) 각 그리스어 문장 *아래에 한국어 해석* 표시. "📖 해석" 토글 버튼 (액션 행) 으로 전환. 두 단계 폴백:

  · *큐레이션 정역* (6 발췌, 가장 학술적으로 중요한 도입부):
    - Plato Apology §17 (16 문장 — 소크라테스의 변호 개회)
    - Xenophon Anabasis 1.1.1 (6 문장 — 다리우스의 두 아들)
    - Homer Iliad 1 (5 문장 — μῆνιν ἄειδε proem)
    - Homer Odyssey 1 (4 문장 — ἄνδρα μοι ἔννεπε proem)
    - Hesiod Theogony 1-50 (3 문장 — Muses 부르기)
    - Herodotus Histories 1.1 (3 문장 — 역사의 첫 문장)

  · *단어 풀이 폴백* (나머지 539 섹션): `_buildLiteralGloss(text)` 가 본문 토큰화 → 각 단어를 `ALL_VOCAB` 와 `MORPH_LOOKUP` (AGDT lemma 환원) 으로 검색 → "단어=뜻 · 단어=뜻" 형식 표시. AGDT 커버 작품 (Iliad 1, Odyssey 1, Persae) 에서 가장 정확. 학자 정역과 *구분되는 학습 보조* 임을 hint 메시지에 명시.

**기술 구현**: `renderWorkSection` 이 본문을 토큰화하면서 `sentenceTexts[sentIdx] → "그리스어 본문"` 매핑 누적. 토글 ON 시 `_applyTranslationDisplay(workId, secN, sentenceTexts)` 호출 → 각 `.sent[data-sent-idx]` 의 *마지막* span 직후에 `.trans` div 삽입 (한 문장이 여러 줄에 걸치는 경우 마지막 span 만 선택, 라인 div 다음 형제 위치). 큐레이션 정역은 terracotta 좌측 경계 + ivory-d 배경, 단어 풀이는 dashed 경계 + 투명 배경 — *시각적 구분으로 신뢰성 차이 표현*.

**한계와 정직성**:
  · 큐레이션 정역 6 발췌는 *학습 보조 작업 번역* 이며 학술 정역 (예: 강대진의 일리아스, 천병희의 변명) 과 구분. 학자 정역 라이선스 확보 시 교체 권장.
  · 단어 풀이는 *정역이 아닌 어휘 매핑*. 어순·격·시제 등 문법 정보는 단어 클릭 시 modal 의 형태 분석에서 별도 확인.
  · 정역 확장은 *수동 작업 비용 큰 항목* — 우선순위는 Apology §18-26 (변명 전체 흐름), 다음은 Anabasis 1.2 이후, Iliad/Odyssey 1 잔여.

**결합 효과**: v52 의 두 모듈은 모두 *학습 동기·진입 장벽* 측면. 캐릭터는 학습자의 *지속 동기* (정체성 투사), 원문 해석은 *진입 장벽 낮추기* (어려운 도입부 즉시 이해). 함께 작용하여 학습 지속률 개선 기대.

**구현 사항**:
  · index.html: ~570 lines 추가 (v51 의 13.8K → v52 의 14.6K)
    - 캐릭터 모듈 (CHARACTERS 50, CHAR_SYMBOLS 32, CHAR_PALETTES 5, _charMedallion, _ensureCharacter, _currentCharacter, renderCharacterPicker) ~440 lines
    - 원문 해석 모듈 (WORK_TRANSLATIONS 6 발췌, _getCuratedTranslation, _buildVocabByLemmaIndex, _glossOneWord, _buildLiteralGloss, _ensureTranslationPref, _applyTranslationDisplay) ~210 lines
    - renderProfiles/renderHall/loadLeaderboard/renderBattle* 통합 패치 (~80 lines)
  · sw.js: CACHE_VERSION v51 → v52 (1 line)
  · APP_VERSION v51 → v52 (1 line)
  · index.html: APP_VERSION v51 → v52

**검증** (test-v52-integration.js, test-v52-translation-render.js):
  · 17/17 통합 테스트 통과
  · 50 캐릭터 × 6 크기 = 300 SVG 변형 모두 jsdom 파싱 OK
  · 큐레이션 정역 lookup 정확 (Apology §17 #0 "아테네 시민 여러분, ..." 매칭)
  · 토글 ON → 2 sentence 에 .trans div 2개 삽입, OFF → 0개 (cleanup 정상)

**v52 핫픽스 (사용자 보고 "캐릭터 사진 전체 안 뜨는 문제")** : 원인은 *CACHE_VERSION 미 bump* (sw.js 가 v51 캐시로 stale `index.html` 서빙). 두 갈래 대응:
  · CACHE_VERSION v51 → v52 (필수)
  · SVG `dominant-baseline` Safari 호환 회피 (방어적 개선)
  · 사용자에게 *진단 modal* 의 "강제 새로고침" 권장 (v41 에 이미 구현됨)

defer (다음 라운드 후보):
  · 외부 의존 3 항목 — 새 정보 없으면 진척 불가
  · 정역 확장 (Apology §18-26, Iliad 1 후반, 등) — 수동 작업 비용 크나 학습 가치 ↑
  · 캐릭터 점진 잠금 (XP/배지 기반) — 학습 동기 부여, UX 설계 필요
  · PARADIGM_LIB 분사·비교급·최상급 확장 (v51 의 defer)
  · μι-동사 가정법/희구법 quiz 통합 (v51 의 defer)
  · forced alignment 시도 (단어 단위 학자 낭독 동기)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

**v52**: 두 갈래 신규 — (1) **캐릭터 (Παίγνια)** 학습자 정체성 모듈 50 종 SVG 메달리온, (2) **원문 해석 (Ἑρμηνεία)** 본문 읽기 토글. 사용자 요청 "캐릭터 기능 추가, 아킬레우스 헤라클레스 등 50가지 캐릭터와 사진으로 프로필 꾸미고 멀티와 명예의전당에 표시되도록" + "캐릭터 사진 전체 안 뜨는 문제 해결 + 원문 해석 볼 수 있는 버튼 추가, 원문 해석은 각 문장 밑에" 두 라운드 통합.

**(1) 캐릭터 모듈 (Παίγνια)** — `CHARACTERS` 50 항목 5 카테고리 (god 12 / hero 12 / heroine 8 / philo 10 / poet 8).
  · `CHAR_PALETTES` 5 종: god 황금+테라코타 · hero 청동+흑색 · heroine 분홍점토+상아 · philo 청회색+상아 · poet 상아+점토
  · `CHAR_SYMBOLS` 32 종: lightning · peacock · trident · wheat · owl · lyre · crescent · helmet · dove · hammer · caduceus · grape · club · shield · bow · fleece · sword · flame · scroll · column · mask · loom · rose · laurel · drop · star · cup · horse · eye · scales · boar · triangle
  · `_charMedallion(idOrObj, size)` 렌더러 — 100×100 viewBox SVG, 카테고리 그라데이션 + 그리스 메안더 외곽 8 점 + 중앙 그리스 이니셜 + 하단 심볼 (≥56px) + 한국어 이름 띠 (≥80px). dominant-baseline 의존 제거 (Safari 호환).
  · `renderCharacterPicker()` — 카테고리 필터 + 검색 (한국어/그리스어/영어/별칭) + 96px 현재 카드 + 72px 그리드.
  · 상태: `S.character = 'athena'` (기본값: 지혜의 여신). 프로필 storage 격리되어 사용자별 독립.

  **표시 위치 5 군데**:
  1. 홈 화면 우상단 — 프로필 버튼 옆 24px
  2. 사용자 프로필 관리 — "내 캐릭터" 카드 80px + 각 프로필 행 44px + "🎭 캐릭터" 버튼
  3. 명예의 전당 — 88px 메달리온 카드 (통계 위) · "🎭 바꾸기 →" 진입
  4. 라이브 순위표 — 각 행의 이름 옆 32px (`character` 필드를 `pushLeaderboard` payload 에 포함)
  5. 멀티 배틀 — 대기실 44px / 점수보드 28px / 결과 40px (`room.players[uid].character` 에 포함)

  **검증** (test-v52-svg-valid.js · jsdom): 50 캐릭터 × 6 크기 (24/32/40/56/72/96) = 300 메달리온 모두 well-formed SVG. 모든 카테고리 ID 유니크. 모든 사용 심볼 정의됨. 폴백: 미존재 ID 는 `?` 회색 메달리온.

**(2) 원문 해석 (Ἑρμηνεία)** — `renderWorkSection` 의 새 진입.
  · 액션 행에 **📖 해석 토글** 버튼 추가. `S.showTranslation` (bool) 으로 상태 유지.
  · 두 단계 폴백:
    - **(a) 큐레이션 정역** — `WORK_TRANSLATIONS` 객체 (`workId:secN` → 문장 인덱스 배열). 현재 6 핵심 발췌:
      · plato-apology §17 (16 문장 · Socrates 변명 개회)
      · xenophon-anabasis-1 §1.1 (6 문장 · 다리우스의 두 아들)
      · homer-iliad-1 §1 (5 문장 · 분노의 노래)
      · homer-odyssey-1 §1 (4 문장 · 다재다능한 사나이)
      · hesiod-theogony §1-50 (3 문장 · Muses 부르기)
      · herodotus-1 §1.1 (3 문장 · 역사 첫 문장)
    - **(b) 단어 풀이 fallback** — `_buildLiteralGloss(text)` 가 `ALL_VOCAB` + `MORPH_LOOKUP` 으로 단어별 한국어 추출. AGDT 커버 작품 (Iliad 1, Odyssey 1, Persae) 에서 정확도 최고. 형식: `"단어=뜻 · 단어=뜻"`.

  **DOM 통합**:
  · `renderWorkSection` 의 line 렌더링 루프에 `sentenceTexts` Map 추가 — `sentIdx → 그리스어 원문` 누적
  · `_applyTranslationDisplay(workId, secN, sentenceTexts)` — view.innerHTML 후 호출. `.sent[data-sent-idx]` 마지막 span 식별 (한 문장 다중 라인 가능) → 부모 line div 별로 그룹화 → DocumentFragment 로 일괄 삽입 (한 line 다중 문장도 순서 보존). 정역은 `var(--ivory-d)` 배경 + terracotta 좌측 경계 / gloss 는 투명 배경 + 대시 경계.
  · 토글 OFF 시 모든 `.trans` 노드 제거. ON 시 재생성.

  **학술적 한계**: 큐레이션 정역은 학습 보조용 작업 번역이며 학술 정역 (예: 강대진, 천병희) 과 구분되어야 함. 단어 풀이는 *정역이 아닌 어휘 보조* — 문법적 활용 (격·시제·인칭) 은 단어 카드 클릭으로 확인.

defer (다음 라운드):
  · 외부 의존 3 항목 (SoundCloud slugs, Plato Crito, ScorpioMartianus) — 정보 없음
  · 단어 단위 시간 동기 (현재 행/단락)
  · PARADIGM_LIB 확장 (비교급·최상급, 분사)
  · μι-동사 가정법/희구법 quiz 통합
  · **정역 확장** — 현재 6 발췌 (29 문장) 만 큐레이션. 추가 우선순위: Apology §18-26, Iliad 1 후반, Odyssey 1 후반, Anabasis 1.2+, Plato Euthyphro, Aeschylus Persae 등
  · **캐릭터 잠금/해제 시스템** — 현재 모든 50 캐릭터 즉시 선택. XP/배지/완독 기반 점진 해제로 학습 동기 부여 (예: Heracles 는 5작품 완독 후 해제, Aristotle 은 34 문법 토픽 학습 후 해제)
  · **AI 기반 정역** — Anthropic API 통합으로 임의 섹션을 사용자 요청 시 번역하여 캐시 (큐레이션 한계 보완)

**v53**: 큐레이션 정역 14 발췌 추가 + 50 캐릭터 사진 전체 추가 + 인수인계 동봉 정책 — 사용자 요청 *"정역 확장, 인수인계도 매 세션 같이 보내, 캐릭터 사진도 50 다 추가"* 세 가지 동시 처리.

**(1) 정역 확장** (5 → 19 발췌, 총 ~330 문장):
  · *Plato Apology §18-22* (5 섹션, 101 문장) — 변론 본론을 *연속 흐름* 으로
    - §18 (1차 고발자 변호 시작, 13 문장)
    - §19 (Aristophanes 풍자, 14 문장 — "Σωκράτης ἀδικεῖ καὶ περιεργάζεται..." 옛 고소장)
    - §20 (소피스트 비판 + 칼리아스 일화 + 자기 지혜 본질, 32 문장)
    - §21 (델포이 신탁 — 변명의 핵심 장면, 24 문장 — "μηδένα σοφώτερον εἶναι")
    - §22 (시인·장인 검증 — 무지의 깨달음 확장, 18 문장)
  · *Homer Iliad 1.51-100* (25 문장) — 칼카스 예언, 분쟁의 진짜 원인 폭로
  · *Homer Iliad 1.101-150* (16 문장) — 아가멤논의 분노 폭발, 아킬레우스와의 공개 다툼
  · *Homer Odyssey 1.51-100* (15 문장) — 아테나의 탄원, 제우스의 응답, 텔레마코스 출발 계획
  · *Xenophon Anabasis 1.1.2* (17 문장) — 퀴로스의 군대 집결, 사르데이스 출발, 콜로사이 도착
  · *Plato Crito §43* (41 문장) — 감옥에서의 만남, 크리톤의 방문, 델로스 배 소식
  · *Plato Euthyphro §2* (15 문장) — 법정에서의 만남, 멜레토스 묘사 (변명 직전)
  · *Hesiod Works and Days §1-50* (21 문장) — 뮤즈 부르기, 두 에리스의 가르침
  · *Aeschylus Persae §1-100* (14 문장) — 페르시아 원로 합창단 입장 (현존 최고(最古)의 그리스 비극)
  · *Sophocles Antigone §1-100* (15 문장) — 안티고네-이스메네 첫 대화 (장례 금지 포고)

**번역 기조** (data-translations.js 헤더에 명시): 직역 우선, 자연스러운 한국어 절충. 시문체 (호메로스·헤시오도스·비극) 는 라틴어 운율을 살리려 하지 않고 산문으로 풀어 의미 전달에 집중. 학자 정역 (강대진 일리아스, 천병희 변명·비극 전집, 정암학당 플라톤) 참고하되 본 앱 학습 맥락에 맞게 재번역. 학습용이므로 직역에 가까운 형태.

**(2) 캐릭터 사진 50 전체 추가** — 신규 파일 `data-characters.js`:

`CHARACTER_IMAGES[id] = {url, caption, license}` 매핑. 50 캐릭터 전체에 대해 Wikimedia Commons 공개 도메인 이미지의 `Special:FilePath` URL 수록.
  · 출처 패턴: `https://commons.wikimedia.org/wiki/Special:FilePath/{FILENAME}?width=240` (해시 계산 없이 작동, 리다이렉트로 실제 파일 도달)
  · 12 올림포스 신: 박물관 소장 흉상/조각상 (Mattei Athena, Apollo Belvedere, Venus de Milo, Hermes of Praxiteles 등)
  · 12 영웅: 흉상·조각·도기 그림·고전 회화 (Farnese Hercules, Exekias의 아이아스 자결, Cellini의 페르세우스 등)
  · 8 여신·여성 영웅: 박물관 조각·도기·회화 (Helene-Paris Louvre K6, Delacroix Medea 등)
  · 10 철학자: 박물관 소장 흉상 (Plato Silanion, Aristotle Altemps, Socrates Louvre, Pythagoras Capitolini 등)
  · 8 시인·역사가·정치가: 흉상·프레스코·모자이크 (Sappho Pompeii fresco, Pericles Altes Museum, Anaximander Trier mosaic 등)

**구현 — `_charPhotoMedallion(charOrId, size)` 신규 헬퍼**:
사진 + SVG 메달리온 *하이브리드* 반환. HTML div 안에 SVG 메달리온을 배경으로 깔고, 그 위에 `<img>` 를 원형 클리핑하여 표시.
  · `onerror="this.style.display='none'"` — 사진 로드 실패 시 자동으로 SVG 폴백 노출
  · size>=80 일 때만 하단 이름 띠 표시 (작은 메달리온은 사진의 시각적 가독성을 위해 띠 생략)
  · 사용 위치 (4 곳): renderProfiles 의 "내 캐릭터" 80px 카드, renderHall 의 88px 카드, renderCharacterPicker 의 96px 현재 선택 카드 + 72px 그리드 카드
  · 작은 메달리온 (32/44px — 라이브 순위, 멀티 배틀 점수보드) 은 *그대로 SVG only* — 사진은 가독성 떨어짐

**라이선스 정직성**: 대부분의 사진은 *미국 법상 PD* (>1000년 된 고대 유물의 충실한 사진은 저작권 대상 아님 — Bridgeman v. Corel 판결). 일부 (모렐서의 헤라클레이토스 등 17세기 이후 회화의 박물관 사진) 는 PD 또는 CC BY 4.0. caption 필드가 박물관·작가 정보를 명시하므로 *사실상의 attribution* 역할. 향후 라이선스 정밀화는 v54 후보.

**(3) HANDOVER 동봉 정책 (재확인)**: 사용자 지시 *"인수인계도 매 세션 같이 보내"* (v53 라운드 1) + *"인수인계도 매 세션 같이 보내"* (v53 라운드 2, 재강조) → 모든 산출물 패키지에 `HANDOVER.md` 동봉 + `present_files` 로 HANDOVER 별도 노출. 다수 세션에서 동일 컨텍스트가 필요할 수 있으므로, 한 세션에서 산출한 zip 만 받아도 다음 세션 작업자가 즉시 컨텍스트 회복 가능.

**구현 사항**:
  · data-translations.js: ~310 lines 추가 (216 → ~500 lines, 35 KB → 55 KB) — 14 새 발췌
  · data-characters.js: 신규 파일 (~12 KB, 50 entries)
  · index.html: `_charPhotoMedallion` 함수 추가 (~30 lines, line 5371 부근), 4 사용 위치 패치, script 로드 라인에 `data-characters.js` 추가
  · sw.js: DATA_BUNDLE 에 `data-characters.js` 추가
  · APP_VERSION v52 → v53, CACHE_VERSION v52 → v53

**검증**:
  · test-v53.js: 20/20 PASS
    - window.WORK_TRANSLATIONS 19 키 / window.CHARACTER_IMAGES 50 키
    - _charMedallion + _charPhotoMedallion 양립
    - 사진 메달리온이 img + onerror + SVG 폴백 포함
    - 새 7 발췌 (Apology §22, Iliad 1.101-150, Anabasis 1.2, Euthyphro 2, WD 1-50, Persae 1-100, Antigone 1-100) lookup 정확
    - 알려지지 않은 캐릭터에 대해 graceful fallback
  · syntax check: 통과 (IIFE 4607~14562)

defer (다음 라운드 후보, v54+):
  · 정역 추가 — Plato Apology §23-26 (변론 마무리), Iliad 1.151-200+ (외교 시도), Sophocles Oedipus 1-100, Plato Crito §44-47
  · 캐릭터 잠금 시스템 (XP/배지/완독 기반) — NEXT_TASKS.md 우선순위 2
  · 캐릭터 사진 라이선스 정밀화 — 일부 CC BY 사진의 attribution 화면 표시
  · 사진 prefetch (사용자가 picker 열기 전에 다음 50 사진 미리 캐시)
  · PARADIGM_LIB 분사 확장 (v51 의 defer)
  · μι-동사 quiz 통합 (v51 의 defer)
  · AI 기반 정역 (Anthropic API 통합, 사용자 요청 시 번역) — *큐레이션 한계 보완*

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

---

**v54**: 캐릭터 사진 broken-image 핫픽스 — 사용자 보고 *"아직 모든 캐릭터 안나오는 문제 해결"* (스크린샷 3 장 첨부, 23/50 메달리온이 사진이 아닌 SVG 폴백 상태).

**원인 진단**: v53 의 `data-characters.js` 는 50 entry 전체를 단일 라운드에서 추가했는데, 그중 23 entries 의 Wikimedia Commons 파일명이 *현재 Commons 에 존재하지 않거나 변경*된 상태였다. 패턴별 오류 사례:
  · **불필요한 접두사**: `Bust_Zeus_Otricoli_...` (실제는 `Zeus_Otricoli_Pio-Clementino_Inv257.jpg`)
  · **잘못된 inventory 번호**: `Ares_Borghese_Louvre_Ma866.jpg` (실제는 `Ma_866_n01.jpg`, 언더스코어와 일련번호 차이)
  · **존재하지 않는 일련번호**: `Exekias_Suicide_d_Ajax_05.jpg` (Commons 에는 `_01` 만 존재)
  · **불필요한 접미사**: `Hestia_Giustiniani_Torlonia.jpg` (실제는 `Hestia_Giustiniani.jpg`)
  · **추측한 카테고리 패턴**: 일부 entry 는 검증 없이 추정 명명 규칙으로 작성됨

→ `Special:FilePath/{잘못된 파일명}` HTTP 404 → `<img onerror>` 발동 → SVG 폴백 노출 (v53 의 `_charPhotoMedallion` 폴백 로직은 정상 작동했으나 *24/50 = 절반 가까이가 폴백 상태*인 일관성 없는 UX 가 사용자 보고로 이어짐).

**수정**:

**(1) 14 파일명 정정** — Wikimedia Commons 카테고리 검색으로 실제 존재하는 파일 확인 후 교체:
  | id | v53 파일명 (broken) | v54 파일명 (verified) |
  |---|---|---|
  | zeus | `Bust_Zeus_Otricoli_...` | `Zeus_Otricoli_Pio-Clementino_Inv257.jpg` |
  | poseidon | (broken) | `Bronze_statue_of_Zeus_or_Poseidon.jpg` |
  | ares | `..._Ma866.jpg` | `Ares_Borghese_Louvre_Ma_866_n01.jpg` |
  | hephaestus | (broken) | `Jouvenet_Forge_of_Vulcan.jpg` |
  | heracles | (broken) | `Herakles_Farnese_MAN_Napoli_Inv6001_n01.jpg` |
  | theseus | (broken) | `Henry_Fuseli_-_Ariadne_Watching_the_Struggle_of_Theseus_with_the_Minotaur_-_Google_Art_Project.jpg` |
  | perseus | (broken) | `Loggia_dei_Lanzi_-_Perseus_with_the_Head_of_Medusa_-_Florence_04_2024_0738.jpg` |
  | jason | (broken) | `Jason_with_the_Golden_Fleece_by_Bertel_Thorvaldsen.jpg` |
  | bellerophon | (broken) | `Bellerophon_killing_Chimaera_(mosaic_from_Rhodes).jpg` |
  | hector | (broken) | `Preller_Hektors_Abschied.jpg` |
  | ajax | `..._Ajax_05.jpg` | `Exekias_Suicide_d_Ajax_01.jpg` |
  | andromache | (broken) | `Jacques-Louis_David-_Andromache_Mourning_Hector.JPG` |
  | hestia | `..._Torlonia.jpg` | `Hestia_Giustiniani.jpg` |
  | sappho | (broken) | `Herkulaneischer_Meister_002.jpg` |

**(2) 9 entry 제거** — 검증된 파일명을 찾지 못한 9 캐릭터는 entry 자체를 `data-characters.js` 에서 제거 (주석으로 *Wikimedia 파일명 검증 실패* 표시 후 entry 본문 삭제):
  `diomedes · orpheus · aeneas · penelope · atalanta · medea · empedocles · herodotus · solon`

→ `window.CHARACTER_IMAGES[id]` 가 `undefined` 일 때 `_charPhotoMedallion` 이 자동으로 `_charMedallion` (SVG only) 으로 fallthrough (index.html line 5387):
```js
if(!meta || !meta.url) return _charMedallion(c, size);
```
v53 의 *broken-image fallback* (DOM 에 깨진 img + SVG 가 동시 존재) 보다 *깔끔한 SVG-only 렌더* 가 된다. UX 일관성 개선.

**결과** (50 캐릭터 = 41 사진 + 9 SVG 메달리온, 일관된 UX):
  · v53: 27 사진 + 23 broken-image-with-SVG-fallback (혼란스러운 상태)
  · v54: 41 사진 + 9 깨끗한 SVG 메달리온

**검증 방법**: Wikimedia Commons 카테고리 페이지 검색 (`Category:Statue of X`, `Category:Bust of X`, `Category:X (mythology)`) 으로 실제 파일명 목록 확인. 추측·기억·외삽 금지 원칙 적용 (v53 의 실수 재현 방지).

**구현 사항**:
  · data-characters.js: 50 → 41 entry 로 축소. 14 entries 의 url 필드 교체. 9 entries 는 주석만 남기고 제거. 헤더에 v54 정정 사유 명시 (~12 KB → ~14 KB, 헤더 확장만큼)
  · index.html: APP_VERSION v53 → v54 (line 4612). UI 코드 변경 없음 (폴백 로직은 이미 v53 에서 정상)
  · sw.js: CACHE_VERSION v53 → v54 (line 21). IMG_CACHE 도 자동으로 `paideia-img-v54` 로 bump → 사용자가 다음 방문 시 신·구 잘못된 이미지가 캐시에 남아 있어도 새 캐시로 진입

**검증** (test-v54.js):
  · 50 캐릭터 ID 가 CHARACTERS 배열에 모두 존재 (구조 변경 없음)
  · CHARACTER_IMAGES 정확히 41 entries
  · 9 미수록 ID = 예상 set 과 일치 (`diomedes · orpheus · aeneas · penelope · atalanta · medea · empedocles · herodotus · solon`)
  · 41 entries 모두 `Special:FilePath/{name}.{ext}?width=240` 패턴 준수, caption/license 필드 존재
  · `_charPhotoMedallion` 함수가 SVG 폴백 분기 보존 (index.html line 5387)
  · syntax check 통과

defer (다음 라운드 후보, v55+):
  · **9 미수록 캐릭터 사진 재추가** — 검증된 Wikimedia 파일명 발견 시. 후보 카테고리:
    - diomedes → `Category:Diomedes` (도기 그림)
    - orpheus → `Category:Orpheus` (모자이크 다수)
    - aeneas → `Category:Aeneas` (Bernini, Lazio mosaic 등)
    - penelope → `Category:Penelope` (Vatican Penelope 흉상)
    - atalanta → `Category:Atalanta` (Guido Reni 회화)
    - medea → `Category:Medea` (Delacroix, Vase paintings)
    - empedocles → `Category:Empedocles` (Salerno fresco?)
    - herodotus → `Category:Herodotus` (Roman copy bust)
    - solon → `Category:Solon` (Athens monument)
  · 사진 prefetch (사용자가 picker 열기 전에 다음 50 사진 미리 캐시) — v53 의 defer
  · 캐릭터 잠금 시스템 (XP/배지/완독 기반) — v53 의 defer
  · 정역 추가 — Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus, Plato Crito §44-47 — v53 의 defer
  · PARADIGM_LIB 분사 확장 (v51 의 defer)
  · μι-동사 quiz 통합 (v51 의 defer)
  · AI 기반 정역 (Anthropic API 통합) — v53 의 defer

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

---

**v55**: 9 미수록 캐릭터 사진 재추가 — v54 hotfix 의 완결. 사용자 요청 *"계속"* (즉, NEXT_TASKS.md §1 우선순위 1 그대로 진행).

v54 까지의 상태: `data-characters.js` 가 50 ID 중 41 entries 만 등록 (사진 표시), 9 ID (`diomedes · orpheus · aeneas · penelope · atalanta · medea · empedocles · herodotus · solon`) 는 entry 제거하여 `_charPhotoMedallion` 의 SVG 폴백 (line 5387 의 `if(!meta || !meta.url) return _charMedallion(c, size);`) 으로 깨끗하게 분기. v55 의 작업은 *이 9 미수록 항목을 Wikimedia 카테고리 검증 후 entry 로 재추가*.

**v53 → v54 의 핵심 교훈 (v55 에서도 엄수)**: 파일명 추측 금지. 카테고리 페이지에 *실제 listing 된 파일명* 만 채택. v53 의 23/50 broken 의 유일한 원인이 파일명 추측이었기에, v55 는 *web search 의 카테고리 페이지 listing* (사이즈·MB 포함) 으로 직접 검증.

**(1) 9 캐릭터의 검증된 파일명** — 각 출처 카테고리:

  | ID | 파일명 | 출처 카테고리 |
  |---|---|---|
  | `diomedes` | `Diomedes_Louvre_Ma890_n2.jpg` | Cat:Diomedes_(Louvre,_Ma_890) — Kresilas 의 5c BC 그리스 원본을 복제한 Louvre 의 로마 복제 |
  | `orpheus` | `Berlin-Pergamonmuseum-18-Orpheus-Mosaik-2016-gje.jpg` | Cat:Pergamonmuseum_-_Orpheus_mosaic — 밀레토스의 ~200 CE 모자이크 |
  | `aeneas` | `Aeneas,_Anchises,_and_Ascanius_by_Bernini,_Galleria_Borghese_(44686152210).jpg` | Cat:Aeneas,_Anchises,_and_Ascanius_by_Bernini — 1618-19 |
  | `penelope` | `JohnWilliamWaterhouse-PenelopeandtheSuitors(1912).jpg` | File 페이지 직접 검증 — Waterhouse 1912, Aberdeen Art Gallery |
  | `atalanta` | `Guido_Reni_-_Atalanta_and_Hippomenes_-_Google_Art_Project.jpg` | Cat:Atalanta_and_Hippomenes_by_Guido_Reni_(Naples) — Capodimonte |
  | `medea` | `Lille_PdBA_delacroix_medee.JPG` | File 페이지 직접 검증 — Delacroix 1838 *Medea about to Kill her Children* (Lille 원본). 확장자 *대문자 `.JPG`* 주의 |
  | `empedocles` | `The_Death_of_Empedocles_by_Salvator_Rosa.jpg` | File 페이지 직접 검증 — 살바토르 로사의 17c 회화 (에트나 화산 투신 전설). 고대 흉상이 없는 캐릭터의 정전적 표현 |
  | `herodotus` | `Marble_bust_of_Herodotos_MET_DT11742_(cropped).jpg` | Wikidata Q26825 의 정전 이미지 — MET 의 2c AD 로마 복제 (4c BC 그리스 청동상의 복제) |
  | `solon` | `Solon_in_Vatican_Museums.JPG` | File 페이지 직접 검증 — Vatican Museums. 확장자 *대문자 `.JPG`* 주의 |

세 가지 미세 패턴 함정 (v54 의 hestia·ajax·ares 와 같은 부류):
  · **medea, solon**: 확장자가 *대문자 `.JPG`* — Wikimedia 는 확장자도 case-sensitive. 소문자로 작성하면 404. v54 의 andromache 가 이미 같은 패턴 (`.JPG`) 이었기에 선례 존재.
  · **aeneas**: 파일명에 콤마 (`,`) + 괄호 (`()`) 포함. Special:FilePath 가 URL 인코딩 없이 그대로 처리. v54 의 bellerophon (괄호 포함) 과 같은 패턴.
  · **herodotus**: `(cropped)` 괄호 — Wikidata 가 채택한 cropped 버전을 그대로 사용 (원본보다 메달리온에 더 적합한 비율).

**(2) data-characters.js 갱신** — 41 entries → 50 entries (~14 KB → ~16 KB):
  · 헤더 주석을 v55 사유로 교체 (검증 방법론 + 9 신규 entries 의 출처 카테고리 명시)
  · 4 개 카테고리 헤더 코멘트의 "(N 사진 + M SVG 폴백)" 표기를 "(전원 사진 · v55)" 로 갱신: heroines · philosophers · poets (heroes 의 경우 신규 3 entries 가 ajax 뒤에 추가되므로 헤더 자체는 그대로지만 끝에 새 entries 부착)

**(3) 버전 bump**:
  · `index.html`: APP_VERSION v54 → v55 (line 4612)
  · `sw.js`: CACHE_VERSION v54 → v55 (line 21). `IMG_CACHE` 도 자동으로 `paideia-img-v55` 로 bump → v54 의 broken 캐시가 남아 있어도 새 캐시로 진입

**(4) 검증** (`test-v55.js`, 27/27 PASS):
  · APP_VERSION/CACHE_VERSION 둘 다 v55
  · `data-characters.js` 가 syntax error 없이 파싱, `window.CHARACTER_IMAGES` 노출
  · 정확히 50 entries (v54 의 41 + 신규 9)
  · 9 신규 ID 의 *정확한 파일명* 검증 (대소문자·언더스코어·괄호·콤마 보존)
  · v54 의 41 보존 ID 가 regression 없이 모두 존재 (id-by-id 체크)
  · 모든 50 entries 의 URL 이 `Special:FilePath/.../?width=240` 패턴 + caption 비공 + license 'PD'
  · `_charPhotoMedallion` 의 SVG 폴백 분기 (`if(!meta || !meta.url) return _charMedallion`) 보존

  추가: `index.html` 의 16 개 inline `<script>` 블록 모두 syntax error 없이 파싱. v54 의 `test-v54.js` 도 함께 실행 — 20 pass / 15 fail. *fail 15 는 모두 의도된 reversal*:
    - 9 fail: 'X entry 제거됨' 주장 (v54 의 invariant) 이 이제 거짓 (v55 가 의도적으로 재추가)
    - 4 fail: 41 entry 가정 (이제 50)
    - 2 fail: APP_VERSION/CACHE_VERSION (이제 v55)
  즉, v54 테스트가 v55 의 정상 변경을 보고한 *건강한 신호*. 구조적 invariant 는 그대로.

**의도된 결과**:
  · 50 캐릭터 모두 사진 표시 — 일관된 UX
  · v54 의 "41 사진 + 9 SVG 메달리온" 혼재 해소
  · 사용자가 picker 를 열 때 보는 시각 경험이 v52 의 *기획 의도* 에 도달 (v52 가 "50 캐릭터 사진" 을 첫 요청한 라운드, v53 의 broken-image, v54 의 hotfix 를 거쳐 v55 에서 완결)

**구현 사항**:
  · `data-characters.js`: 9 entries 추가, 헤더 주석 교체, 카테고리 헤더 4 줄 업데이트 (~52 lines 추가, ~16 KB)
  · `index.html`: APP_VERSION v54 → v55 (1 line, line 4612)
  · `sw.js`: CACHE_VERSION v54 → v55 (1 line, line 21)
  · `test-v55.js`: 신규 (~150 lines, 27 assertions)

defer (다음 라운드 후보, v56+):
  · **정역 확장** (v53~v54 의 defer) — *현재 가장 학습 가치 높은 자체완결 항목*. 19 발췌 → 25 발췌 목표. 우선순위:
    - Plato Apology §23-26 (변론 마무리, v52~v53 진행한 §17-22 의 자연스러운 연속)
    - Iliad 1.151-200+ (외교 시도, v53 의 §1.101-150 연속)
    - Sophocles Oedipus 1-100 (안티고네에 이은 두 번째 비극)
    - Plato Crito §44-47 (탈출 권유 본격화, v53 의 §43 연속)
    - Aeschylus Agamemnon 1-100 또는 Euripides Medea 1-100 (옵션)
  · 사진 prefetch — 이제 50/50 모두 검증되어 prefetch 효과 명확. 작업 비용은 낮음.
  · 캐릭터 잠금 시스템 (XP/배지/완독 기반) — v52~v54 의 defer. 학습 동기 부여 효과 있을 수 있으나 UX 설계 필요 (어느 캐릭터를 기본 unlock 으로 둘지 등)
  · 외부 의존 3 항목 (SoundCloud slugs, Plato Crito, ScorpioMartianus) — 새 정보 없으면 진척 불가
  · PARADIGM_LIB 분사 확장 (v51 의 defer)
  · μι-동사 quiz 통합 (v51 의 defer)
  · AI 기반 정역 (Anthropic API 통합) — *큐레이션 한계 보완*. 비용 모델 결정 필요

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

---

**v56**: 멀티 배틀 대폭 확장 + 학습 동반 모듈 3 추가 — 사용자 요청 5 갈래:
*"멀티 시작시 적과 나의 캐릭터가 상하단에 크게 보이고 중앙엔 vs 표시, 서로의 캐릭터가 말풍선으로 자신의 명언이나 작품의 주요 구절을 말하면서 시작하는 컷 추가, 멀티로 서로의 포인트를 빼앗는 기능 추가"* + *"로비에 고대 그리스 음악 재현한 음악이 흘러나오도록 하고 끌 수 있는 버튼 추가, 건의 사항 올리는 버튼 추가, 현재 몇명이 공부중입니다 라는 란 추가"*

**v56 의 NEXT_TASKS 우선순위였던 정역 확장 (v53 defer)** 은 사용자가 멀티·UI 확장을 명시 요청하여 v57 로 이월.

**(1) 멀티 배틀 인트로 컷 (Παίγνια 통합)** — `_renderBattleIntro` 신규.
호스트가 *시작* 누른 직후 모든 플레이어에게 ~5초 인트로 화면. 적·나 캐릭터 사진 + 말풍선 + 중앙 VS 메달리온.
- *2명 모드*: 상단 상대(150-160px) ↔ 중앙 VS(88px 원형) ↔ 하단 나(160px), 위/아래 말풍선 (terracotta 테두리, 베지에 꼬리)
- *3명 이상*: 상단 행에 상대들 (최대 4명, 110px) + 하단 나 (160px) — 1v1 대결의 시각적 비유 유지하되 다수에도 그래픽 일관성
- 자동 진행 5.2초 + `바로 시작 →` skip + `🔊 명언 듣기` 버튼 (TTS 시스템 통합 — eSpeak NG · OS Modern · Erasmian · 복원 Attic 중 사용자 설정 따라)
- `_battleIntroShown[code]` 가드로 매치당 1회만 표시 (room 재조회·다시 그리기에 의한 반복 차단)

**(2) 캐릭터 명언 데이터 — `CHARACTER_QUOTES` 50 entries** (`data-characters.js` 확장, ~22 KB).
모든 50 캐릭터 각각 `{grk, ko, src}` 형식. 모든 인용은 PD 원전에서 검증:
- 신·영웅 24명: 호메로스 *Iliad*/*Odyssey* 의 정형 epithet 또는 1-2행 인용 (e.g. Zeus → "πατὴρ ἀνδρῶν τε θεῶν τε" Il.1.544; Hector → "εἷς οἰωνὸς ἄριστος..." Il.12.243)
- 여성 영웅 8명: 비극·서사시 결정적 구절 (e.g. Antigone → "οὔτοι συνέχθειν..." Soph.Ant.523; Medea → "θυμὸς δὲ κρείσσων..." Eur.Med.1078-9)
- 철학자 10명: DK 단편 + Stephanus 페이지 (e.g. Socrates → "ὁ ἀνεξέταστος βίος..." Apol.38a; Heraclitus → "ποταμοῖσι τοῖσιν αὐτοῖσιν..." DK 22 B12)
- 시인·역사가·정치가 8명: 작품 첫 줄 또는 famous lines (e.g. Homer → "μῆνιν ἄειδε..." Il.1.1; Pindar → "ἄριστον μὲν ὕδωρ" Ol.1.1; Solon → "μηδένα πρὸ τοῦ τέλους μακάριζε" Hdt.1.32)

**(3) 점수 강탈 메커니즘 — `BATTLE_STEAL_*` 상수 + `stolen[]`**:
- *결정성*: 매 `BATTLE_STEAL_INTERVAL=3`번째 문제 (Q3·Q6·Q9) 가 강탈 문제. 시드 기반 `_battleBuildQuestions` 의 `qNum % 3 === 0` 마킹으로 모든 플레이어가 *동일한 문제 인덱스*에서 강탈 인지 → 동기화 완벽.
- *UI 마커*: 강탈 문제는 카드 좌측에 2px terracotta 경계 + 옅은 orange tint 배경 + 펄스 애니메이션 배너 (`⚡ 점수 강탈 문제 — 정답 시 모든 상대로부터 8점씩 빼앗습니다 ⚡`)
- *Race-free 설계*: 강탈자가 자기 player 객체의 `stolen[]` 에만 push (`{victim, points, qIdx}`), 다른 player 의 `score` 는 직접 쓰지 않음 (기존 path-level PUT 의 race 회피 패턴 유지). 보드 렌더 시 `_battleEffectiveScores(playersArr)` 헬퍼가 차감 계산: `eff(P) = P.score + sum(P.stolen.points) − sum(others.stolen[where victim=P].points)`. 음수는 0 클램프.
- *시뮬레이션 검증*: 5 케이스 통과 (강탈 없음 · 단방향 · 양방향 상쇄 · 음수 클램프 · 3인전). 같은 시드에서 두 플레이어가 동일한 강탈 패턴 (`..⚡..⚡..⚡.`) 받음 (Q.identity SAME).
- *피드백 토스트*: 정답 시 `⚡ +24 강탈! · 이름1, 이름2 외 N명으로부터`, 오답 시 `⚡ 강탈 실패 — 점수 변동 없음`
- *결과 화면 (renderBattleResult)*: effective score 기준 정렬. me 카드 + per-player 행에 브레이크다운 (`기본 N · ⚡ 강탈 +N · 빼앗김 −N`) 표시. baseScore 별도 보존.

**(4) BGM — 절차적 고대 그리스 양식 음악 (Web Audio API)**:
*학술적 솔직성 명시* — 본 모듈은 *재현 (reconstruction)* 이 아니라 *양식적 모방 (stylized homage)*. Seikilos Epitaph 같은 알려진 단편을 그대로 재생하지 않고 도리아 모드 음계 + 키타라/리라 톤 + 단순 모티프로 *분위기*만 합성. self-contained · 오프라인 · 라이선스 위험 0.
- *음계*: 도리아 모드 E F G A B C D E (5세기 BC 그리스의 가장 자주 거론되는 mode), 12-TET 평균율 (역사적 정확성보다 청각 친숙도 우선) — 솔직한 한계: 진정한 그리스 미세음정 (enharmonic genus, 1/4-tone) 은 안 구현
- *톤*: sine + triangle 2배음 hybrid (gain 0.12), attack 18ms / decay exponential — 키타라/리라의 발현된 현 모방
- *드론*: E + B (5도) 두 sine 오실레이터, 매우 낮은 음역대 (164.8 Hz · 246.9 Hz), gain 0.10/0.06 — 고대 음악의 *바둑판형 화성 (drone harmony)* 양식
- *모티프*: 5종 짧은 패턴 (E G A G E / A G E G A 등) 무작위 셔플 + 자연스러운 호흡 (1-2박자 휴지). BEAT_MS 480ms (느린 템포)
- *마스터 볼륨*: gain 0.045 — 학습 방해 안 되도록 매우 낮음. 사용자 명시 동의 후에만 켜짐 (S.bgmEnabled localStorage)
- *UI*: 홈 화면 우상단 토글 버튼 `🔇 BGM 켜기` ↔ `🎵 BGM 끄기`. 첫 클릭 시 토스트 `🎵 도리아 모드 BGM — 학습 동반 음악`
- *브라우저 정책 대응*: AudioContext 의 user-gesture 요구사항 만족 위해 클릭 핸들러 내에서 ensureCtx + resume. iOS Safari 14+ 검증 (모킹된 단위 테스트 통과). 자동 재시작 시도하지 않음 — 사용자가 이전 세션에서 켰어도 매번 명시 클릭 필요 (브라우저 정책 우회 안 함)

**(5) 건의 사항 (Feedback) modal**:
홈 푸터의 `건의` 링크 → `openFeedbackModal()` → textarea (2000자 한도) + 전송 버튼.
- *저장*: `STORAGE.setShared('feedback:<ts>:<short_uid>', JSON)` — 운영자는 console 에서 `STORAGE.listShared('feedback:')` 후 각 키 fetch 로 수집
- *익명성*: 캐릭터·진척도·이름 *전송 안 함*. 보내는 정보: 본문, 타임스탬프, userId (앱 내 익명 ID), APP_VERSION, UA 첫 200자
- *오프라인 안전망*: `localStorage.paideia.feedbackQueue` 에 항상 동시 저장 (큐 한도 50). supportsShared 가 false 면 토스트 `오프라인 — 로컬에 저장됨, 다음 접속 시 시도`
- *입력 검증*: 4자 미만 차단, 2000자 한도 (maxlength + JS 입력 카운터)
- *추가 운영 작업 (v56 defer)*: 별도 admin 페이지에서 listShared 결과를 UI 로 표시 + 처리 완료 마킹 등은 다음 라운드 후보

**(6) 동시 학습자 카운트 (Presence)**:
홈 화면 상단 카드 `📚 현재 N명이 공부 중입니다 (당신 포함 — 동료 N-1명)`.
- *Heartbeat*: 앱 init 시 `pingPresence()` 1회 + `setInterval(pingPresence, PRESENCE_PING_MS=4분)`. 키 `presence:<userId>`, 값 `{ts, character}`. ping 간격을 TTL보다 짧게 (4 < 5) 두어 *active 사용자 누락 방지*.
- *카운트*: `fetchPresenceCount()` 가 `STORAGE.listShared('presence:')` → 상위 200 키 → 각 값 fetch → `now - ts < PRESENCE_TTL_MS (5분)` 만 카운트. 60초 카운트 캐시 (`_presenceCountCache`) — 재호출 비용 차단.
- *Stale 처리*: 5분 이상 지난 presence 키는 자동으로 카운트에서 제외 (실제 storage 삭제는 안 함 — 사용자 재접속 시 같은 키에 덮어쓰기 됨). 정기 garbage collect 는 운영 부담이라 안 함.
- *카운트 분기 메시지*:
  - 0명: `현재 다른 학습자가 없습니다 — 첫 번째로 공부를 시작해 보세요`
  - 1명: `당신이 현재 공부 중입니다`
  - N≥2: `현재 N명이 공부 중입니다 (당신 포함 — 동료 N-1명)`
- *오프라인*: `STORAGE.supportsShared === false` 시 `동시 학습자 표시는 온라인 연결이 필요합니다`

**구현 사항**:
- `data-characters.js`: CHARACTER_QUOTES 50 entries 추가 (~5 KB), 헤더 v56 으로 갱신 (~22 KB total)
- `index.html`: ~600 lines 추가
  - 인트로 컷 + effective score + 강탈 로직 (~200 lines, line 13400~)
  - BGM 모듈 (~140 lines, pushLeaderboard 직후)
  - Feedback modal (~80 lines)
  - Presence heartbeat + count (~50 lines)
  - renderHome 통합 (BGM 토글 버튼 / presence 카드 / 건의 링크) (~30 lines)
  - 앱 init 의 startPresenceHeartbeat 호출 (~3 lines)
- `sw.js`: CACHE_VERSION v55 → v56 (1 line)
- `index.html`: APP_VERSION v55 → v56 (1 line)
- `test-v56.js`: 신규 (~220 lines, 66 assertions)

**검증** (test-v56.js 66/66 PASS):
- 버전 상수 일치
- CHARACTER_QUOTES 50 entries, {grk,ko,src} 구조, 그리스 문자 포함, CHARACTERS ID 와 일치
- `_renderBattleIntro` / `_battleEffectiveScores` 함수 정의
- 강탈 문제 마킹 결정성 (시드 → 동일 Q3/Q6/Q9 패턴) — 별도 시뮬레이션도 통과
- effective score 5 케이스 (강탈 없음, 단방향, 양방향, 음수 클램프, 3인전)
- payload 의 stolen / character 필드 포함, 인트로 1회 가드
- 강탈 응답 처리 (fresh fetch + push), 결과 화면 effective score
- BGM IIFE / window.BGM / SCALE_HZ / MOTIFS / toggleBgm
- Feedback modal / STORAGE 키 / localStorage 큐 / 홈 푸터 링크
- Presence 상수 (TTL 5min, ping 4min) / pingPresence / fetchPresenceCount / heartbeat / 홈 카드
- v55 invariants 보존 (50 사진 ID 전원)
- 추가 헤드리스 BGM 시뮬레이션 (모킹된 Web Audio 환경에서 start/stop/오실레이터 생성 카운트 정상)

**라이브 작동 검증 시나리오 (사용자 측 수동 점검 권장)**:
1. 두 브라우저 (또는 시크릿 창) 에서 로그인 → 서로 다른 캐릭터 선택 → 멀티 방 생성·참가 → 시작 클릭 → *양측 모두 인트로 컷 표시 (5.2초)* → 첫 문제
2. Q3 문제 화면에 *⚡ 강탈 배너* 노출 확인. 한 측이 정답 시 토스트 + 점수보드의 다른 측 점수가 −8 차감 (effective). 양측이 정답이면 양방향 상쇄
3. 홈 화면에서 BGM 켜기 → 도리아 모드 멜로디 + 드론 재생 시작. 끄기 → 즉시 정지
4. 건의 링크 → modal 입력 → 전송 → 토스트 `건의가 전달되었습니다`
5. 두 브라우저 모두 홈 화면 → 카운트가 `2명` 으로 표시 (4-5분 이내)

defer (다음 라운드 후보, v57+):
- **v57 권장 = 정역 확장** (v53 defer, v56 원래 NEXT_TASKS 의 우선순위 1) — Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47
- 외부 의존 3 항목 (SoundCloud slugs · Plato Crito · ScorpioMartianus) — 새 정보 없음
- BGM 확장 — Phrygian/Lydian/Mixolydian 모드, 모티프 다양화, *실제* 학자 복원 Seikilos Epitaph 외부 mp3 옵션 (라이선스 검증 시)
- Feedback 운영 UI — admin 페이지 + STORAGE 토큰 인증
- Presence 통계 — 시간대별·요일별 분포 (운영자)
- 캐릭터 명언 TTS 자동 발화 (현재는 클릭으로만)
- 사진 prefetch (v53 defer)
- 캐릭터 잠금 시스템 (v52 defer)
- PARADIGM_LIB 분사·비교급 확장 (v51 defer)
- μι-동사 quiz 통합 (v51 defer)
- AI 기반 정역 (Anthropic API 통합)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

---

**v57**: 멀티 배틀 "방이 닫혔습니다" fragility 핫픽스 — 사용자 보고 *"멀티 배틀에서 '방이 닫혔습니다 — 호스트가 방을 종료했거나 네트워크 오류입니다.' 가 떠요"* (iPad Safari, allkeybeadeath.github.io 배포). 스크린샷 첨부: "← 배틀" 버튼 + 단발성 오류 카드만 표시, 호스트는 멀쩡한데 게스트만 끊긴 상황.

**원인 진단** — `renderBattleLobby` 의 `draw(room)` 콜백이 `room === null` 한 번만 받아도 즉시 "방이 닫혔습니다" 카드 표시 + `_battleStopPoll()` 호출. 그러나 `room === null` 의 origin 은 *방 진짜 삭제*뿐 아니라:
  · `_battleFetchRoom` 의 catch (13205~) — 네트워크 hiccup, Firebase 일시 지연, STORAGE backend 의 throttle
  · `_battleStartPolling` 의 첫 fetch (`_battleFetchRoom(code).then(onUpdate)`) — null 도 그대로 전달
  · `_battleStartPolling` 의 interval 안 fetch — 마찬가지로 null 그대로 전달
  · SSE 핸들러의 `path === '/' && payload === null` 분기 — Firebase RTDB 초기화 시 일시적으로 빈 응답이 올 수 있음
  · v56 의 추가 fetch 부담: 강탈 처리 시 `_battleFetchRoom` (14140), `_battleSubmitProgress` 의 fresh fetch (14223), presence heartbeat 의 4분 간격 STORAGE 호출 — 네트워크 부담 ↑

전체적으로 *한 번의 transient null 이 매치 진행 화면을 완전히 부숨*. iPad 18% 배터리 + 모바일 네트워크 환경은 transient hiccup 빈도가 높아 사용자가 자주 마주칠 수밖에 없는 fragility.

**부수 문제 — 인트로 컷이 5.2초 채우지 못하고 잘릴 가능성**: `_renderBattleIntro` 가 view.innerHTML 로 인트로 화면을 표시하는 동안에도 SSE/polling 은 계속 동작. status='playing' room update 가 도착하면 `draw(room)` → `renderBattleGame(code, room)` → `_battleIntroShown[code]` 이미 true 이므로 본 게임으로 점프 → 인트로 컷이 사라짐. v56 의 인트로 컷 디자인 의도 (5.2초 = 캐릭터 인지 + 명언 읽을 시간) 약화.

**해결책 두 갈래**:

**(1) `_battleHandleUpdate` null robustness wrapper** — 핵심 수정. 단발성 null 이 즉시 "방이 닫혔습니다" 로 직결되지 않게 *연속 카운트 + 시간 임계점* 도입.

```js
const BATTLE_NULL_THRESHOLD = 3;
const BATTLE_NULL_MIN_MS    = 12000;

function _battleHandleUpdate(room, onUpdate){
  if(!_battleState) return;
  if(room){
    _battleState.nullRunCount = 0;
    _battleState.lastGoodRoom = room;
    _battleState.lastGoodAt = Date.now();
    onUpdate(room);
    return;
  }
  // null 받음 — 임계점까지는 마지막 정상 room 유지
  _battleState.nullRunCount = (_battleState.nullRunCount || 0) + 1;
  const sinceGood = _battleState.lastGoodAt ? (Date.now() - _battleState.lastGoodAt) : Infinity;
  const everSawGood = !!_battleState.lastGoodRoom;
  if(!everSawGood){
    // 첫 응답부터 null — 코드 오타 등 즉시 알림. 첫 번째만 전달.
    if(_battleState.nullRunCount === 1) onUpdate(null);
    return;
  }
  // 정상 응답 이력 있음 — 연속 3회 *그리고* 12초 둘 다 만족해야 실제 닫힘 확정
  if(_battleState.nullRunCount >= BATTLE_NULL_THRESHOLD && sinceGood >= BATTLE_NULL_MIN_MS){
    onUpdate(null);
  }
}
```

진입 경로 4 곳 모두 `onUpdate(r)` → `_battleHandleUpdate(r, onUpdate)` 로 교체:
  · `_battleStartPolling` 의 즉시 fetch (13331)
  · `_battleStartPolling` 의 interval 안 fetch (13334)
  · `_battleSubscribe` 의 즉시 fetch (13344)
  · `_battleSubscribeSSE` 의 path='/'+payload=null 및 cached 부분 갱신 분기 (4 위치)

`_battleSubscribe` 시작 시 `nullRunCount=0, lastGoodRoom=null, lastGoodAt=0` 초기화. `_battleCleanup` 도 동일 필드 정리 (메모리 누수 방지).

**의도된 동작 시뮬레이션 (test-v57.js 의 시나리오 A-D, 모두 통과)**:
  · A: 정상 응답 → onUpdate 1회 호출, nullCount=0, lastGoodRoom 보존
  · B: 정상 1회 + null 2회 (임계 미달) → onUpdate 정상만 1회 (null 2회는 모두 흡수, UI 동결 유지)
  · C: 정상 응답 → 13초 경과 + null 3회 → 임계점 도달, onUpdate(null) 호출 (실제 방 닫힘 확정)
  · D: 첫 응답부터 null (코드 오타 등) → 첫 번째 null 만 전달, 나머지 무시 (사용자에게 즉시 알리되 반복 안 함)

**(2) 인트로 컷 보호** — `_renderBattleIntro` 가 표시 중일 때 `_battleState.introActive = true` 설정. `renderBattleLobby` 의 `draw` 가 introActive 면 view.innerHTML 안 만지고 `_battleState.latestRoomDuringIntro` 에 room 만 보존. `advance()` 에서 `introActive = false` + onContinue(latestRoom).

```js
// _renderBattleIntro 시작:
if(_battleState){
  _battleState.introActive = true;
  _battleState.latestRoomDuringIntro = room;
}
// advance():
function advance(){
  if(advanced) return;
  advanced = true;
  clearTimeout(autoTm);
  let nextRoom = room;
  if(_battleState){
    _battleState.introActive = false;
    if(_battleState.latestRoomDuringIntro) nextRoom = _battleState.latestRoomDuringIntro;
    _battleState.latestRoomDuringIntro = null;
  }
  onContinue(nextRoom);
}
// draw(room) 콜백:
if(_battleState && _battleState.introActive){
  _battleState.latestRoomDuringIntro = room;
  // status='finished' 만 예외 — 인트로 깨고 결과로 점프
  if(room.meta && room.meta.status === 'finished'){
    _battleState.introActive = false;
    return renderBattleResult(code, room);
  }
  return;
}
```

`renderBattleGame` 의 `_renderBattleIntro` 호출에서 onContinue 가 `(latestRoom) => renderBattleGame(code, latestRoom || room)` 으로 변경. 인트로 5.2초 동안 도착한 최신 room (예: 다른 게스트가 추가 입장 또는 score 갱신) 으로 본 게임 진입.

**(3) 방 닫힘 메시지 개선** — 임계점 도달해서 실제 표시될 때 더 informative:
  · 타이틀: "방이 닫혔습니다" → "방 연결 끊김" (완곡)
  · 진단: "약 N초 동안 응답 없음 — 호스트 이탈 또는 네트워크 문제" (sinceGood 표시)
  · 버튼: 🔄 다시 연결 시도 (nullCount/lastGoodAt 리셋 후 `_battleSubscribe` 재호출) + 메뉴로
  · 재시도 흐름: 사용자가 모바일 LTE→Wi-Fi 전환 등으로 일시적 끊김이었던 경우 재연결 한 번으로 복귀 가능

**구현 사항**:
  · `index.html`: 약 110 lines 변경/추가 (~600 lines 의 v56 멀티 배틀 모듈 중 약 18% 가 영향 받음)
    - `_battleHandleUpdate` 신규 함수 + 상수 2개 (~40 lines)
    - `_battleStartPolling` / `_battleSubscribe` 의 onUpdate 직접 호출을 wrapper 경유로 (4 위치)
    - `_battleSubscribeSSE` 의 4 분기 모두 wrapper 경유로
    - `_renderBattleIntro` 시작·advance() 에 introActive 토글 + latestRoomDuringIntro
    - `renderBattleLobby` 의 `draw` 콜백에 introActive 처리 + 방 닫힘 메시지 개선 + 재연결 버튼
    - `renderBattleGame` 의 `_renderBattleIntro` 호출에서 onContinue 가 latestRoom 인자
    - `_battleCleanup` 가 신규 필드 정리
  · `sw.js`: CACHE_VERSION v56 → v57 (1 line)
  · `index.html`: APP_VERSION v56 → v57 (1 line)
  · `test-v57.js`: 신규 (~220 lines, 45 assertions — 정적 grep + 동적 시뮬레이션)

**검증** (test-v57.js, 45/45 PASS):
  · 버전 상수, wrapper 함수·상수 정의, 모든 onUpdate 진입 경로의 wrapper 경유, 인트로 보호 코드 4 항목, 방 닫힘 메시지 개선 5 항목, cleanup 의 신규 필드 4 정리, v56 invariant 8 항목 보존, `_battleHandleUpdate` 행위 시뮬레이션 4 시나리오 (sandbox eval) — 모두 통과
  · 추가: v56 의 test-v56.js 도 함께 실행 (63 pass / 3 fail). fail 3 는 *의도된 reversal*:
    - APP_VERSION/CACHE_VERSION v56 invariant → v57 으로 의도 변경
    - "인트로 종료 콜백이 renderBattleGame 재진입" — onContinue 시그니처 변경 (`() => ...` → `(latestRoom) => ...`) 으로 의도 변경
  · 즉, v56 테스트가 v57 의 정상 변경을 보고한 *건강한 신호*. 구조적 invariant 는 그대로.

**라이브 작동 검증 시나리오 (사용자 측 수동 점검 권장)**:
1. 두 브라우저 (또는 iPad+iPhone) 에서 같은 방 입장 → 호스트가 시작 → *양측 모두 5.2초 인트로 컷 완주* (이전엔 일찍 잘렸을 수 있음)
2. 게스트 측에서 *기내 모드 토글 후 즉시 해제* (~3초 끊김) → "방 연결 끊김" 안 뜨고 매치 계속 (transient hiccup 흡수)
3. 호스트가 *진짜로 방을 떠남* → 게스트는 약 12초 후 "방 연결 끊김" + 진단 메시지 + 재연결 버튼 표시
4. 게스트가 *진짜로 잘못된 방 코드 입력* → 즉시 (첫 fetch null) "방 연결 끊김" 안내 (정상)
5. 게스트가 *재연결 시도 버튼 클릭* → 호스트가 방을 재생성했다면 즉시 복귀 (실패 시 다시 안내)

**의도된 결과**:
  · 매치 중 transient 네트워크 hiccup (모바일 환경에서 흔함) 으로 매치가 끊기지 않음
  · 인트로 컷이 5.2초 디자인 의도대로 완주
  · 실제로 방이 닫힌 경우엔 적절한 시간 후 (12초) 명확한 진단 메시지 + 재연결 기회

**솔직한 한계**:
  · 12초 임계점은 *모바일 LTE의 평균 hiccup 회복 시간 + Firebase RTDB 의 keep-alive 주기* 를 기준으로 한 값. 추후 사용자 보고에 따라 조정 가능 (코드 한 줄: `BATTLE_NULL_MIN_MS`)
  · 호스트가 *진짜로* 떠난 경우 12초 동안 게스트가 모르는 채로 진행 — 그러나 호스트 부재 시 `meta.status` 갱신이 없으므로 게스트 화면이 동결될 뿐, 잘못된 결과 저장 위험은 없음 (`_battleSubmitProgress` 가 path-level PUT 이므로 호스트 부재가 자기 진척에 영향 안 줌)
  · 인트로 컷 중 *호스트가 매치를 일찍 취소* 했다면, 인트로는 5.2초 동안 표시되고 끝나면 본 게임으로 진입했다가 거기서 status 확인 — 약간의 UX 지연 있으나 frequent 시나리오 아님
  · 본 핫픽스는 *증상 (fragility) 완화* 가 목적. 진정한 해법은 Firebase RTDB 대신 *acknowledgment 기반 reliable transport* 또는 sync-aware 백엔드 (Liveblocks, Yjs 등). 그러나 단일 PWA + 무료 백엔드 제약 내에서는 본 wrapper 가 합리적 절충점

defer (다음 라운드 후보, v58+):
  · **v58 권장 = 정역 확장** (v53 부터 누적 defer, v56·v57 에서도 다른 우선순위에 밀림) — Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47. 사용자 보고 또는 우선순위 변경 없으면 v58 의 자연스러운 작업
  · **(v57 신규 defer) 매치 종료 시 ghost player 정리** — 모바일 백그라운드/탭 닫기 시 player 객체가 방에 남는 문제. `visibilitychange` 핸들러 + `presence:battle:<code>:<uid>` 별도 키 + 60초 TTL 로 stale player 제거. 별도 작업
  · **(v57 신규 defer) 재연결 후 인트로 컷 재진입 옵션** — 현재는 `_battleIntroShown[code] = true` 라 재연결해도 인트로 안 보임. 사용자 선택으로 "인트로 다시 보기" 버튼 제공 가능
  · 외부 의존 3 항목 (SoundCloud slugs · Plato Crito · ScorpioMartianus) — 새 정보 없음
  · BGM 확장 (v56 defer)
  · Feedback 운영 UI (v56 defer)
  · Presence 통계 (v56 defer)
  · 캐릭터 명언 TTS 자동 발화 (v56 defer)
  · 사진 prefetch (v53 defer)
  · 캐릭터 잠금 시스템 (v52 defer)
  · PARADIGM_LIB 분사·비교급 확장 (v51 defer)
  · μι-동사 quiz 통합 (v51 defer)
  · AI 기반 정역 (Anthropic API)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)


## 8. 알려진 미해결 사항 및 향후 작업

`aria` 라벨 일괄 정비가 필요하다. v32 의 `_setupGreekLang` 이 `lang` 속성을 자동화했으나, 인터랙티브 요소 (버튼·링크) 의 `aria-label` 은 여전히 일부 누락. 스크린 리더 사용자를 위해 체계적 점검 필요.

배틀 모드 문제 유형이 단조롭다. 현재는 사지선다 (어휘 의미) 만 지원. 악센트 위치, 형태 분석, 변화 활용 등 다양한 유형 추가가 학습 효과 측면에서 유의미.

홈 화면의 due-today SRS 카운터가 없다. 오답함의 단어들은 시간 경과에 따라 재출제되어야 하나 (Spaced Repetition Schedule), 현재는 단순 누적 리스트. 망각 곡선 기반 스케줄링 추가 시 학습 효율 개선 가능.

음성 합성에서 eSpeak grc 의 정밀도 한계가 있다. espeak 의 `grc` 음운 dictionary 자체가 미성숙하여 특정 단어에서 부정확한 음운을 낼 가능성. 보고된 사례 누적 시 우회 매핑 (Latin 음역으로 espeak 전달) 또는 단어별 phonetic override 테이블 추가 검토.

## 9. 배포 방법

GitHub Pages 가 가장 단순하다. 모든 파일을 repo 루트에 평탄하게 배치 (v40 부터 폴더 없음), `Settings → Pages` 에서 `main` 브랜치를 source 로 지정. 변경 후 약 1–2 분 내 반영. URL 패턴: `https://{username}.github.io/{repo}/`.

Netlify Drop 도 가능하다. https://app.netlify.com/drop 에 zip 또는 폴더를 드래그하면 즉시 URL 발급. 무료 tier 충분.

학과·연구소 자체 서버 (Apache·Nginx) 사용 시 정적 파일 서빙 디렉토리에 그대로 복사. MIME type 설정에 주의 — `.wasm` (현재 사용 안 함) 또는 `.data` 파일이 `application/octet-stream` 으로 서빙되어야 한다 (Nginx 의 `default_type` 또는 `mime.types` 확인).

CSP (Content Security Policy) 헤더는 설정하지 않는 것을 권장한다. 본 앱은 동적 script 삽입 (`espeakng.min.js`), eval-free 이지만 `Function` 생성 (syntax check 용도, 프로덕션 코드에는 없음) 등을 사용한다. 필요 시 `script-src 'self' 'unsafe-inline'` 최소 설정.

배포 후 검증: 브라우저 주소창에 `https://{site}/espeakng.min.js` 입력 시 JavaScript 코드가 표시되면 정상. `https://{site}/espeakng.worker.data` 가 200 응답하면 정상 (브라우저는 다운로드를 시도할 수 있으나 응답 코드만 확인).

## 10. 유지 보수 패턴

새 버전 배포 시 두 곳의 버전 상수를 반드시 함께 올린다. `index.html` 의 `const APP_VERSION = 'vN'` 과 `sw.js` 의 `const CACHE_VERSION = 'vN'`. 둘이 어긋나면 service worker 가 새 캐시를 만들지 않아 사용자가 구버전을 계속 보게 된다.

발음 시스템 변경 시 `PRON_SYSTEMS` 객체에 카드 추가 또는 수정. 데모 버튼 (`data-demo` 속성) 과 권장 카드 (`sys !== 'espeak_grc'` 조건문) 의 시스템 키를 함께 업데이트.

elision 매핑 확장 시 `_ELISION_RESTORE` 객체에 항목 추가. Smyth, *Greek Grammar*, §70–76 의 elision 규칙과 LSJ 사전을 근거로 한다. 추가 시 대소문자 변형 (`Δ'`, `Ἀλλ'` 등) 도 함께 등록.

데이터 갱신 (전집·형태소·DCC vocabulary) 은 `data-works.js`, `data-morph.js` 의 자료 갱신과 동시에 SW 의 `DATA_BUNDLE` 리스트 확인. 새 파일 추가 시 그 경로를 `DATA_BUNDLE` 에 명시해야 백그라운드 캐시 대상이 된다.

테스트는 Node.js 스크립트로 작성한다 (`/home/claude/test-*.js` 패턴). 브라우저 환경 의존성이 없는 순수 로직은 모두 Node 에서 검증 가능하다. JSDOM 을 통한 DOM 시뮬레이션도 일부 사용 (`_setupGreekLang` 검증). 회귀 케이스가 누적되면서 v38 의 23 음역 케이스, v37 의 10 monotonic 케이스 등이 코드 변경의 안전망이 된다.

## 11. 외부 의존성 및 라이선스

eSpeak NG WASM 빌드는 Eitan Isaacson 의 emscripten port 를 Alberto Pettarin 이 CDN 용으로 정리한 것을 사용한다. GitHub: `pettarin/espeakng.js-cdn`. 라이선스 GPL-3.0-or-later. 본 PWA 가 espeak 코드를 직접 수정하지 않고 그대로 번들하는 형태이므로 GPL 의무는 espeak 파일에만 적용된다.

전집 텍스트는 Perseus Digital Library (Tufts University) 의 public domain 자료를 기반으로 한다. 인용 시 `data-works.js` 의 `editor`·`year` 메타데이터 참조.

형태소 데이터는 Ancient Greek Dependency Treebank (AGDT) 의 lemma 인덱스를 가공한 것. AGDT 는 Perseus 가 호스팅하며 CC BY-SA 라이선스다.

CSS 폰트는 Google Fonts (EB Garamond, Cardo) 를 사용하며, service worker 가 stale-while-revalidate 전략으로 캐싱한다.

## 12. 코드 컨벤션 및 패턴

상수는 `UPPER_SNAKE_CASE` (예: `PRON_SYSTEMS`, `BADGES`, `LEVELS`), 함수는 `camelCase`, 내부·헬퍼는 `_camelCase` (언더스코어 접두) 로 표기. 상태 객체는 단일 `S`. 데이터 객체는 도메인 명사 (`WORKS`, `TOPICS`).

DOM 조작은 view 영역 단위로 `innerHTML` 교체 후 `querySelectorAll` 로 이벤트 바인딩. 가상 DOM 라이브러리를 쓰지 않는다 — 이는 의도된 단순성이며, view 가 자주 갱신되는 곳에서도 충분한 성능을 보였다.

비동기 처리는 `async/await` 우선, callback 은 외부 라이브러리 (eSpeak NG, Web Speech API) 인터페이스와의 경계에서만. Promise race 또는 사용자 빠른 클릭으로 인한 stale callback 위험이 있는 곳은 sequence token (`_espeakReqSeq`) 으로 방어.

에러 처리는 사용자에게 noise 가 되지 않도록 균형을 잡는다. 음성 합성 실패는 toast 로 1회만 안내 (`_speechFallbackNoticed` 플래그). 네트워크·SW 에러는 console.error 만 출력하고 graceful degradation.

상태 마이그레이션 (이전 버전의 localStorage 호환) 은 `_ensureSpeechSettings` 같은 함수에서 `if(!S.field) S.field = default` 패턴으로 처리. 기존 사용자의 명시적 선택은 절대 덮어쓰지 않는다.

## 13. 참고 문헌 (음성·음운)

W. Sidney Allen, *Vox Graeca: A Guide to the Pronunciation of Classical Greek*, 3rd ed., Cambridge University Press, 1987. 복원 발음의 권위서.

Herbert Weir Smyth, *Greek Grammar*, revised by Gordon M. Messing, Harvard University Press, 1956. Elision 규칙 §70–76.

Carl Darling Buck, *The Greek Dialects*, University of Chicago Press, 1955. 방언별 음운 차이.

Geoffrey Horrocks, *Greek: A History of the Language and Its Speakers*, 2nd ed., Wiley-Blackwell, 2010. 통시 음운론.

Stephen G. Daitz, *The Pronunciation and Reading of Ancient Greek: A Practical Guide*, 2nd ed., Audio-Forum, 1981. 학자 녹음.

Wikipedia, *Ancient Greek phonology*. 빠른 reference 용.

## 14. 연락 및 자료 위치

본 인수인계 문서는 repo 의 `HANDOVER.md` 또는 별도 lab 위키에 보관 권장. 코드 내 주석에는 각 fix 의 학술적 근거와 버전 메모가 인라인으로 기록되어 있으므로, 의문이 생기면 먼저 해당 함수의 주석을 확인하라.

기존 테스트 스크립트는 prototype 디렉토리에 남아 있으며 (`test-translit.js`, `test-tts-fallback.js`, `test-espeak-race.js`, `test-monotonic.js`, `test-v38-fixes.js` 등), 새 기능 추가 시 회귀 테스트 작성 시 참고.

---

**v58**: 멀티 배틀 구조 전환 — 호스트 단일 실패점 제거 + 4종 게임 모드. 사용자 결정 *"3, 1, 옵션 유지, 이외 더 창의적이고 재밌는 게임 방식 구상"* 처리.

배경: v57 의 null-robustness wrapper (BATTLE_NULL_THRESHOLD=3, MIN_MS=12000) 는 *증상 완화*였지만 호스트가 진짜로 끊기면 매치 자체가 중단되는 근본 문제는 미해결. iPad Safari 환경에서 사용자가 같은 fragility 를 다시 겪음 ("방 연결 끊김" — v57 의 새 메시지). 진짜 해법은 *호스트 개념 자체를 제거*하는 것. 사용자가 결정한 세 갈래 (1) 매치 시작 트리거는 "지금 시작" 버튼 (오래된 waiter), (2) 매치 중 합류 봉쇄, (3) Private 코드방은 유지.

**(1) `_battleState.roomPath` 일반화 — 코드방·lobby 통합 path**:

기존 `_battleFetchRoom` / `_battleSaveRoom` / `_battleSubscribeSSE` 가 모두 `battles:<code>` 를 하드코딩. 이를 `_battleState.roomPath` 가 있으면 그걸 사용, 없으면 legacy 로 폴백하도록 일반화. 같은 함수가 코드방 (`battles:<code>`) 과 lobby 매치 (`lobby:matches:<mid>`) 둘 다 처리.

```js
async function _battleFetchRoom(code){
  if(!STORAGE.supportsShared) return null;
  const path = (_battleState && _battleState.roomPath) ? _battleState.roomPath : `battles:${code}`;
  // ...
}
```

SSE URL 빌더도 동일 패턴 + Firebase RTDB 의 콜론→슬래시 변환 적용 (`fbPath(k)` 와 일관):

```js
const sseTail = (_battleState && _battleState.roomPath)
  ? _battleState.roomPath.replace(/:/g,'/')
  : `battles/${code}`;
const url = `${base}/${sseTail}.json?accept=text/event-stream`;
```

`_battleLeave` 와 `renderBattleResult` 의 cleanup 도 동일하게 `roomPath || 'battles:<code>'` 로 일반화. role 에 'lobby' 추가 — lobby 매치 참가자는 host 도 guest 도 아니므로 `_battleLeave` 가 자기 player 만 제거 (방 삭제 안 함).

**(2) 4종 게임 모드 — `BATTLE_MODES`**:

기존은 vocab 모드만 존재. v58 에서 plug-in 식 모드 시스템 도입:

```js
const BATTLE_MODES = {
  vocab:  { id:'vocab',  grk:'Ἀγών',          ko:'어휘 결투',     desc:'…' },
  quote:  { id:'quote',  grk:'Μάχη Ποιητῶν',  ko:'명언의 주인',   desc:'…' },
  verse:  { id:'verse',  grk:'Στίχοι',        ko:'행 잇기',       desc:'…' },
  riddle: { id:'riddle', grk:'Σφίγξ',         ko:'역방향 추론',   desc:'…' },
};
const BATTLE_MODE_DEFAULT = 'vocab';
```

모든 모드는 동일 골격을 공유:
- 4-option MC
- 12초 타이머
- 정답 시 속도 보너스 (10 + ceil(remainSec), 최대 22)
- Q3/Q6/Q9 강탈 (8점 × N명)
- 시드 결정성 (LCG `_battleSeededRng(seed)`)

다른 점:
- (a) **풀의 출처** — vocab/riddle 은 ALL_VOCAB, quote/verse 는 CHARACTER_QUOTES
- (b) **프롬프트 렌더링** — `renderBattleGame` 의 promptBlock 이 `q.mode` 로 분기

`_battleBuildQuestions(seed, mode)` 가 dispatch:
- **`_battleBuildVocab`** — Greek → Korean. 무작위 distractors 3개.
- **`_battleBuildQuote`** — Greek 명언 → 누가 한 말? distractor 는 *같은 카테고리* 우선 (god/hero/heroine/philo/poet). 옵션은 한국어 이름 + 별칭 (예: "아테나 · 지혜의 여신").
- **`_battleBuildVerse`** — 명언 앞부분 → 뒤를 잇는 부분. 분절 알고리즘: ano teleia (·) → comma (,) → semicolon (;) → 중앙 근처 공백 우선순위. 양쪽 6자 이상 조건. distractor 는 다른 명언의 tail.
- **`_battleBuildRiddle`** — Korean → Greek. distractor 는 *같은 품사* 우선 (POS 매칭). 인출형 학습.

q 객체 shape 신·구 비교:
- 기존 (v57 이하): `{g, ko, options, correctIdx, isSteal}`
- v58: `{mode, prompt, options, correctIdx, isSteal, ...mode별 부가}`
  - vocab: `+ ko`
  - quote: `+ promptKo, src, ko`
  - verse: `+ tail, src`
  - riddle: `+ promptHint, ko, correctGreek`

`renderBattleGame` 의 promptBlock 분기:
- vocab: 32px 그리스어 + "이 단어의 뜻은?"
- quote: 22px 그리스어 + 한국어 보조 + "이 말을 한 사람은?"
- verse: 22px 그리스어 + "뒤를 잇는 구절은?"
- riddle: 24px 한국어 + 품사 힌트 + "이 뜻의 그리스어 단어는?"

옵션 표시도 분기 — verse/riddle 은 그리스어 옵션이라 `lang="grc"` + Cormorant Garamond 폰트 적용 (스크린 리더 안내).

`answered` 기록에 `mode` 필드 추가 — 결과 화면의 오답 review 가 모드별 다른 표시 (riddle 은 prompt 가 한국어, 정답은 그리스어 등). 오답함 자동 적립은 **vocab 모드만** (다른 모드는 어휘 학습 흐름이 아님).

**검증 (sandboxed)**: 50 CHARACTER_QUOTES + 200 stub VOCAB 에서 모든 4 모드가 10 questions 생성. Q3/Q6/Q9 강탈 마킹 정확. 시드=99 두 번 호출 시 결정성 ✓. 모든 q 의 정답이 options 에 존재 ✓. verse 의 q.tail === options[correctIdx] ✓. quote 의 promptKo/src 비공 ✓. riddle 의 correctGreek === options[correctIdx] ✓. prompt 가 한국어 (그리스 문자 없음) ✓.

**(3) 공개 lobby (Ἀγορά) — 호스트 없는 자율 매치**:

저장 path:
- `lobby:waiters:<uid>` — 각 대기자가 자기 키만 작성 (race-free)
- `lobby:matches:<mid>` — 매치 객체 (room shape 동일, meta.mode 추가)
- `battles:<code>` — 코드방 (legacy, 그대로 작동)

상수:
- `LOBBY_POLL_MS = 3000` — 대기실 polling 간격
- `LOBBY_WAITER_TTL_MS = 60000` — 대기자 stale 임계
- `LOBBY_HEARTBEAT_MS = 20000` — 대기자 자기 키 갱신 (TTL/3)
- `LOBBY_MATCH_TTL_MS = 360000` — 매치 6분 보존 (5분 한도 + 1분 결과)
- `LOBBY_MID_LEN = 8` — mid 길이

상태:
```js
let _lobbyState = null;
// { phase: 'idle'|'waiting'|'starting'|'inMatch',
//   pollTimer, heartbeatTimer, waiters, matches,
//   joinedAt, chosenMode, visListener, lastTick }
```

흐름:
1. 홈 → 멀티 배틀 → **공개 lobby** 진입 → `renderPublicLobby` → `_lobbyState = {phase:'idle', ...}` + 첫 fetch + 3초 interval
2. `_lobbyTick` 이 매번 (a) waiters 목록, (b) matches 목록 fetch. waiter 중 자기가 player 로 등록된 playing 매치 있으면 즉시 `_lobbyJoinExistingMatch` 트리거
3. 사용자가 "큐 입장" 버튼 → `_lobbyEnterQueue` → `_lobbyState.phase='waiting'` + `_lobbyPingWaiter` (자기 키 PUT) + 20초 heartbeat 시작
4. waiters≥2 그리고 가장 오래 기다린 (선임자) 이 자기 자신이면 "지금 시작" 버튼 활성. 모드 선택 카드 4개 (사용자가 선택, default 'vocab')
5. 선임자가 "지금 시작" 누름 → `_lobbyStartMatch(mode)`:
   - 최신 waiters 재조회 (체크-시작 race 대응)
   - waiters[0].uid === S.userId 확인 (선임자 검증)
   - `_lobbyGenMid()` 생성 + `seed = Date.now() + random` + `_battleBuildQuestions(seed, mode)` *즉시 publish*
   - 풀 부족 시 vocab 으로 폴백
   - waiters[0..6] 을 players 로 변환 (max 6명)
   - `STORAGE.setShared('lobby:matches:<mid>', matchObj)` (status='playing', startedAt 동시 publish)
   - 자기 waiter 키 삭제 + `_lobbyJoinExistingMatch(mid, matchObj)` (자기 즉시 진입)
6. 다른 waiter 의 polling tick 이 `myMatch` 발견 → 자동 합류 (waiter 키 삭제 + renderBattleGame)
7. 매치 진행 중인 동안 lobby 신규 진입자는 `activeMatches.length > 0` 이라 "큐 입장" 버튼 비활성 + "진행 중, 종료 후 입장 가능" 메시지
8. 매치 종료 시 `meta.status='finished'`, 모든 player 결과 화면. 매치 객체는 LOBBY_MATCH_TTL_MS (6분) 후 자동 표시 제외 (실제 삭제는 안 함 — Firebase TTL 정책 부재)

**Ghost player cleanup** (v57 의 defer, v58 lobby 측 처리):
- `document.addEventListener('visibilitychange', ...)` — `document.hidden` 시 `_lobbyRemoveWaiter()` fire-and-forget
- `window.addEventListener('beforeunload', ...)` — 동일
- `window.addEventListener('pagehide', ...)` — 동일 (iOS Safari 호환)
- 모든 핸들러는 `_lobbyState.phase === 'waiting'` 일 때만 실제 DELETE (idle/inMatch 시 무관)
- `_lobbyCleanup` 이 호출되면 listener 도 removeEventListener

추가 안전망: `_lobbyFetchState` 가 `lastSeen` 기준으로 stale waiter (60초 이상 ping 없음) 자동 필터링. heartbeat 가 20초 주기라 정상 사용자는 안 걸림.

**(4) 비공개 코드방 — 유지 (사용자 결정)**:

`renderBattle` 진입 화면이 v58 에서 세 부분으로 재구성:
1. **공개 lobby (강조)** — terracotta border-left, "NEW v58" 배지, 직접 노출
2. **비공개 코드방 (collapsed)** — `<details>` 로 접힘. "방 만들기" + "방 입장" 둘 다 그 안. 작은 라벨 + 약한 색조 (clay-d)
3. **하단 안내** — 매치 5분 한도 / 12초 / 강탈 / XP 보상 등 공통

기존 `renderBattleCreate`/`renderBattleJoin`/`renderBattleLobby` 와 `_battleCreateRoom` 등 코드방 코드는 변경 없이 그대로 작동. roomPath 는 자동으로 legacy `battles:<code>` 폴백.

**구현 사항**:
- `index.html`: ~840 lines 추가/변경
  - `_battleFetchRoom`/`_battleSaveRoom`/`_battleSubscribeSSE` 일반화 (~30 lines)
  - `BATTLE_MODES` + 4 빌더 함수 (~200 lines)
  - `renderBattleGame` 의 promptBlock 분기 (~50 lines 추가)
  - `_battleAnswer` answered shape 확장 (~10 lines)
  - `renderBattleResult` 의 모드별 wrong review (~30 lines)
  - `_battleLeave` / cleanup 의 roomPath 사용 (~10 lines)
  - `renderBattle` 진입 화면 재구성 (~80 lines)
  - 공개 lobby 모듈 (`renderPublicLobby` + helpers, 15 함수, ~430 lines)
- `sw.js`: CACHE_VERSION v57 → v58 (1 line)
- `index.html`: APP_VERSION v57 → v58 (1 line)
- `test-v58.js`: 신규 (~270 lines, 104 assertions — 11 섹션, sandbox 빌더 검증 포함)

**검증** (test-v58.js, 104/104 PASS):
- 버전 상수, path 일반화 4 위치, BATTLE_MODES 4종, 빌더 dispatch + 정의, sandbox 실행 4 모드 × 10 questions × Q3/Q6/Q9 강탈 × 시드 결정성, renderBattleGame mode dispatch, 5 lobby 상수, 15 lobby 함수, ghost cleanup 3 이벤트, renderBattle 3 옵션 + collapsed details, v57 invariant 7 항목 보존.

`test-v57.js` 43/45 (fail 2 = APP/CACHE_VERSION 의도된 reversal). `test-v56.js` 63/66 (fail 3 = 동일 + intro callback signature — v57 변경의 carry-over). 모두 *건강한 신호*.

**라이브 작동 검증 시나리오 (사용자 측 수동 점검 권장)**:
1. 두 브라우저 (또는 iPad+iPhone) 에서 멀티 배틀 → 공개 lobby 진입 → 양측 "큐 입장" → 선임자 (먼저 입장한 쪽) 가 모드 선택 (vocab/quote/verse/riddle) + "지금 시작" → 양측 인트로 컷 5.2초 → 10문제 → 결과
2. 셋째 브라우저가 매치 진행 중 lobby 진입 → "큐 입장" 버튼 disabled, "진행 중 매치 종료 후 입장 가능" 안내 확인
3. quote 모드 시도 — 호메로스 정형구가 4 영웅 중 누구 것인지 추론. 같은 카테고리 distractor 라 학습 가치 ↑
4. verse 모드 시도 — "πατὴρ ἀνδρῶν …" 같은 짧은 명언의 뒤 잇기
5. riddle 모드 시도 — 한국어 → 그리스어. 같은 품사 distractor 라 단순 reverse 가 아닌 의미 변별 필요
6. 한 사용자가 큐 입장 후 *기내 모드 토글 또는 탭 백그라운드* → 다른 사용자 lobby 에서 1분 이내 그 사용자가 waiters 에서 사라짐 확인 (visibilitychange 핸들러 작동)
7. 비공개 코드방 (details 접힘) 펼쳐 보고 기존 방식대로 코드 공유 매치 — legacy 호환 확인

**의도된 결과**:
- 호스트 끊김으로 인한 매치 중단 불가능 (questions 사전 publish)
- 4 게임 모드로 학습 다양성 ↑
- ghost waiter 즉시 정리 (lobby 측)
- legacy 코드방 그대로 작동 (사용자 선호 보존)

**솔직한 한계**:
- 매치 진행 중 ghost *player* 는 여전히 잔존 (v59 우선순위 3). 결과 화면의 stale player 표시만 영향 — 매치 진행에는 영향 없음 (questions 가 매치 시작 시점에 결정됐기 때문).
- 인트로 컷 5.2초 동안 lobby 의 모든 waiter 가 동기 진입한다는 보장은 없음 (polling 주기 3초 × 임계 시간). 약 3-5초 내 모두 합류하나 *완벽한 동기* 는 아님. 실제 게임 시작 자체는 자기 시점에서 진행되므로 문제 없음.
- 매치 객체의 자동 정리 (cleanup) 는 안 함 — Firebase RTDB 의 free-tier 가 시간 기반 TTL 미지원이라, 운영자가 주기적으로 console 에서 `STORAGE.listShared('lobby:matches:')` + 오래된 mid DELETE 필요. UI 카운트는 LOBBY_MATCH_TTL_MS 로 자동 필터링되어 사용자엔 영향 없음.
- 5명 이상 동시 큐 입장은 미테스트. 6명 한도는 인트로 컷 디자인 제약 (v56) — lobby 도 max 6명까지만 매치 시작.

defer (다음 라운드 후보, v59+):
- **v59 권장 = 정역 확장** (v53 부터 누적 defer, v54~v58 에서도 다른 우선순위에 밀림) — Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47
- 추가 게임 모드 (v58 의 plug-in 골격 활용) — Ἀκόντισμα (속도전, 가장 작음), Δίφθογγος (악센트), Ὀρθογραφία (받아쓰기 race), Ἑρμηνεία (정역 race), Δίκη (문맥 추론), Κλήρωσις (베팅 modifier)
- 매치 진행 중 ghost player 정리 (lobby 의 waiters cleanup 과 별개 — 매치 내 player 의 stale 표시)
- 재연결 시 인트로 컷 재진입 옵션 (`_battleIntroShown[code]` 옵트인 리셋)
- 외부 의존 3 항목 — 새 정보 없음
- BGM 확장 (음량 슬라이더, 추가 모드)
- Feedback 운영 UI
- Presence 통계
- 캐릭터 명언 TTS 자동 발화
- 사진 prefetch
- 캐릭터 잠금 시스템
- PARADIGM_LIB 분사·비교급 확장
- μι-동사 quiz 통합
- AI 기반 정역 (Anthropic API)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

---

**v59**: 멀티 배틀 silent failure 차단 + Firebase 자가진단 도구 + README 룰 안내 갱신. 사용자 보고 *"여전히 방만들기 오류, 큐 입장도 안됨. 문제해결."* — v58 에서도 같은 fragility 가 재현되어 정밀 진단 라운드.

**Root cause 진단** (코드 정밀 분석으로 도출):

v52 이후 멀티 배틀·lobby·feedback·presence 가 Firebase RTDB 의 *신규 path* 들을 사용하기 시작했음:
- `battles:<code>` — 코드방 (v52 부터)
- `lobby:waiters:<uid>` · `lobby:matches:<mid>` — 공개 lobby (v58 신규)
- `feedback:*` · `presence:*` — v56 의 보조 모듈
- `lb:*` — 라이브 순위 (v30s 부터, 기존)

그런데 **README.md v2 의 권장 Firebase 룰**:
```json
{ "rules": { "lb": { ".read": true, ".write": true } } }
```
은 `lb` 만 허용. 사용자가 README 권장대로 설정 후 v52~v58 의 신규 path 들을 추가해도, **룰을 갱신하지 않으면 Firebase 가 401/403 으로 전체 PUT/GET 차단**. 사용자의 Firebase 프로젝트 (`paideia-8e45e`) 가 이 상태일 가능성 매우 높음.

**Silent failure 두 군데 (코드 결함)**:

(a) `BACKEND.setShared` (line 4687~) 가 `r.ok=false` 일 때 HTTP status 나 body 를 *어디에도 기록하지 않고* 단순히 `null` 반환:
```js
return r.ok ? { key:k, value:v, shared:true } : null;
```
사용자도 운영자도 *왜 실패하는지* 알 길이 없음.

(b) 호출처들이 setShared 의 반환값을 *검증 안 함*. `_battleSaveRoom`:
```js
try {
  await STORAGE.setShared(path, JSON.stringify(room));
  return true;  // ← null 반환받아도 true!
}
```
`_lobbyPingWaiter` / `_lobbyStartMatch` 도 동일 패턴.

**결과로 본 사용자 증상**:
- *방 만들기 실패*: setShared null → `_battleSaveRoom` 이 true 반환 (silent) → `_battleState = {...}` 설정 → `renderBattleLobby` → `_battleSubscribe` 의 첫 fetch 가 null (방 자체가 PUT 안 됨) → `_battleHandleUpdate` 의 `everSawGood=false, nullRunCount=1` 분기 → 즉시 `onUpdate(null)` → "방 연결 끊김" 표시.
- *큐 입장 실패*: setShared null → `_lobbyPingWaiter` 가 silent 진행 → 다음 `_lobbyTick` 의 `listShared` 빈 결과 → 자기 자신이 waiters 에 안 보임 → 사용자는 "입장 안 됨" 으로 인식.

**v59 의 6 갈래 fix**:

**(1) `BACKEND.setShared/getShared/listShared` 진단 정보 캡처** — HTTP status (r.status) + body text 앞 200자 + `isPermissionDenied` 플래그 (401/403) 를 `window._battleLastError` 에 기록. `op` 필드로 어느 메서드인지 식별. setShared 의 catch 블록도 `network/exception:` 접두로 구분.

**(2) `_battleSaveRoom` 반환값 검증** — `const res = await STORAGE.setShared(...)` 후 `if(!res){...return false;}` 분기. 기존 `_battleLastError` 의 isPermissionDenied 정보 보존하면서 op 만 갱신 (`{...existing, op:'save', code, msg: existing.msg || 'setShared returned null'}`).

**(3) `_battleHandleUpdate` justCreated grace period** — `BATTLE_JUST_CREATED_GRACE_MS = 5000`. `_battleState.justCreatedAt` 설정된 호스트 본인이 막 방을 만들고 첫 fetch 가 null 인 경우 (Firebase eventual consistency, SSE 초기화 race), 5초 grace 안에서는 `everSawGood=false` 분기에서도 onUpdate(null) 호출 *안 함*. `renderBattleCreate` 가 `_battleState = { ..., justCreatedAt: Date.now() }` 로 플래그 세팅.

**(4) `_lobbyEnterQueue` 낙관적 UI + 결과 검증** — phase='waiting' 직후 자기를 waiters 에 *임시* 추가 (`_optimistic: true` 마커) + 즉시 `_lobbyDraw()` 호출 → 사용자에게 *즉각 시각 피드백*. 그 후 `_lobbyPingWaiter()` 결과가 false 면 phase 를 'idle' 로 롤백 + 자기를 waiters 에서 제거 + `isPermissionDenied` 분기로 명확한 토스트 ("Firebase 보안 규칙이 차단 (홈 → 진단)").

**(5) 진단 modal Firebase 자가진단 버튼 (`🔬 Firebase 자가진단`)** — 6 경로 (battles · lobby:waiters · lobby:matches · lb · feedback · presence) 각각에 더미 PUT → GET → DEL 시도 + 결과 표시 + verdict 분기 (allWriteOk / allDenied / partialDenied). 차단 케이스에 *권장 룰 JSON* 을 inline 코드 블록으로 표시 (사용자가 Firebase Console 에 그대로 붙여넣기 가능).

**(6) `README.md` Firebase 룰 안내 갱신** — `lb` 만 허용하는 v2 의 잘못된 안내를 *루트 수준 .read/.write 허용* 으로 교체. "v59 갱신" 주의 + 이전 룰의 위험성 (멀티 배틀·큐 입장 차단) 명시.

**부수 수정 (toast 시그니처)**: 기존 `toast(msg, type)` 에 옵션 duration 인자 추가하여 `toast(msg, 6000)` 같은 호출 (숫자 인자) 도 정상 작동. backward compatible — 문자열 인자는 여전히 type (CSS 클래스) 으로 해석.

**구현 사항**:
- `index.html`:
  - BACKEND 3 메서드 진단 캡처 (~70 lines 추가)
  - `_battleSaveRoom` !res 분기 (~25 lines)
  - `_battleHandleUpdate` justCreated grace + 상수 BATTLE_JUST_CREATED_GRACE_MS (~10 lines)
  - `renderBattleCreate` justCreatedAt 세팅 + 진단 메시지 강화 (~15 lines)
  - `_lobbyPingWaiter` boolean 반환 (~5 lines)
  - `_lobbyEnterQueue` 낙관적 UI + 롤백 + 에러 분기 (~30 lines)
  - `_lobbyStartMatch` setShared 검증 (~10 lines)
  - 진단 modal Firebase 자가진단 버튼 + 핸들러 (~120 lines)
  - toast 시그니처 확장 (~10 lines)
  - APP_VERSION v58 → v59
- `sw.js`: CACHE_VERSION v58 → v59
- `README.md`: §3 규칙 설정 블록 교체 (~15 lines)
- `test-v59.js`: 신규 (~180 lines, 43 assertions — 13 섹션, sandbox eval 로 justCreated grace 행위 검증)

**검증** (test-v59.js, 43/43 PASS):
- 버전 상수 v59 / BACKEND 3 메서드 진단 캡처 / `_battleSaveRoom` 검증 / justCreated grace 정의·사용·호스트 setter / renderBattleCreate 진단 / `_lobbyPingWaiter` boolean / `_lobbyEnterQueue` 낙관적 + 롤백 / `_lobbyStartMatch` 검증 / 자가진단 modal 6 경로 + 3 verdict / toast 확장 / README 갱신 / v58 invariants 보존 (BATTLE_MODES, lobby 상수, ghost cleanup 핸들러) / sandbox 시뮬레이션 3 시나리오 (A: justCreated grace 흡수, B: justCreated 없으면 첫 null 전달, C: 정상 후 null 임계 미달 무시).

추가: `test-v57.js` `test-v58.js` 도 함께 실행 가능 — APP_VERSION/CACHE_VERSION 의도된 reversal 외 모든 invariant 보존.

**라이브 작동 검증 시나리오 (사용자 측 수동 점검)**:
1. **Firebase 룰 갱신** (가장 중요): Firebase Console → 본 프로젝트 → Build → Realtime Database → Rules 탭 → `{ "rules": { ".read": true, ".write": true } }` Publish. 또는 진단 modal 의 자가진단 버튼으로 룰 갱신 필요 여부 자동 확인.
2. 방 만들기 → 정상 동작 (Firebase propagation race 가 grace period 로 흡수)
3. 큐 입장 → 자기 자신이 즉시 표시 (낙관적 UI). 실제 PUT 실패 시 즉시 에러 토스트 + phase 롤백.
4. 진단 modal 의 자가진단 버튼 → 6 경로 결과 표시.

**솔직한 한계**:
- v59 의 fix 들은 *root cause 자체는 해결 안 함* — Firebase 룰 설정은 여전히 운영자가 콘솔에서 갱신해야 함. v59 가 한 일은 (a) 그 진단을 명확히 노출 (silent → 명확한 에러), (b) 권장 룰 자가진단 modal 에 inline 표시, (c) README 안내 갱신. 사용자가 자가진단 버튼을 누르고 권장 룰을 콘솔에 붙여넣지 않으면 여전히 작동 안 함.
- 낙관적 UI 의 `_optimistic: true` 마커는 현재 사용 안 됨 (display 분기에 활용 가능). _lobbyTick 의 실제 데이터로 자연스럽게 덮어쓰여 사용자에게는 매끄럽게 보임.
- 진단 modal 의 자가진단은 *현재 시점* 의 상태만 확인. 룰 갱신 후 즉시 반영되지 않을 수 있음 (Firebase Console publish 후 약 5-10초 propagation).
- BACKEND.setShared 의 진단 캡처는 *직전 호출만* `_battleLastError` 에 저장 — 동시 다발 setShared (예: presence + battles + lobby 동시 PUT) 시 마지막 것만 남음. 진단 modal 의 자가진단은 순차 PUT 이라 영향 없음.

defer (다음 라운드 후보, v60+):
- 정역 확장 (v53 부터 누적) — Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47
- 추가 게임 모드 (v58 의 plug-in 골격) — Ἀκόντισμα, Δίφθογγος, Ὀρθογραφία, Ἑρμηνεία, Δίκη, Κλήρωσις
- 매치 진행 중 ghost player 정리 (v58 의 lobby waiters cleanup 과 별개)
- 재연결 시 인트로 컷 재진입 옵션
- 외부 의존 3 항목 — 새 정보 없음
- BGM 확장 (음량 슬라이더, 추가 모드)
- Feedback 운영 UI · Presence 통계
- 캐릭터 명언 TTS 자동 발화 · 사진 prefetch · 캐릭터 잠금 시스템
- PARADIGM_LIB 분사·비교급 확장 · μι-동사 quiz 통합
- AI 기반 정역 (Anthropic API)
- **(v59 신규 defer)** Firebase Auth 통합 — `.read/.write: true` 의 보안 위험 (외부 공개 시) 대비. anonymous auth + `auth != null` 또는 email/password.
- **(v59 신규 defer)** 자가진단 modal 의 *자동 룰 PUT* — 현재는 사용자가 콘솔에 수동 붙여넣기. Firebase Admin API 로 자동 갱신 가능하나 service account 키 노출 위험.

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

---

**v60**: 멀티 배틀 종료 흐름 4 갈래 fix — 사용자 보고 *"배틀 퀴즈가 끝나도 종료되지 않는 문제 수정"*. 매치가 10 문제 다 풀린 후에도 wait-others 화면에 *영구 정지*하는 증상.

**Root cause 진단** (코드 정밀 추적):

`_battleSubmitProgress` (line 15313~) 가 자기 player 객체를 `STORAGE.setShared` 로 PUT 할 때 **hardcoded path** 사용:

```js
await STORAGE.setShared(`battles:${code}:players:${S.userId}`, JSON.stringify(payload));
```

v58 에서 멀티 배틀이 두 경로로 확장됐다 — 코드방 (`battles:<code>`) + 공개 lobby 매치 (`lobby:matches:<mid>`). v58 의 changelog 는 `_battleFetchRoom` / `_battleSaveRoom` / `_battleSubscribeSSE` 의 path 일반화 (`_battleState.roomPath || 'battles:'+code`) 만 명시했고, `_battleSubmitProgress` 의 path-level setShared 는 *간과됨*. 결과:

- **공개 lobby 매치에서**: 모든 player 의 `finished: true` PUT 이 *잘못된 경로* `battles:XYZW:players:u1` 에 가서 (실제 매치 객체는 `lobby:matches:abcdef12` 에 존재) 어떤 player 도 그 정보를 못 봄. `_battleFetchRoom` 결과의 `players[*].finished` 가 영원히 false → `allDone` 체크 영구 실패 → `meta.status` 가 'finished' 로 절대 전환 안 됨 → 모든 player 가 wait-others 에 영구 정지.
- 코드방 (private) 에서는 path 가 우연히 일치하여 작동했으나 (`battles:${code}` 가 실제 roomPath 와 동일), 아키텍처적으로 깨진 상태였음.

**부차 결함 3건** (위 root cause 가 해결돼도 잠재):

(a) **Last-player race** — 자기가 마지막에 finish 했을 때, 직전 `setShared(players:me)` 와 `_battleFetchRoom()` 사이에 Firebase RTDB 의 eventual consistency 로 인해 fresh 응답에 *자기 finished:true 가 반영 안 됨* → allDone 통과 실패.

(b) **SSE/polling `answeredThisQ` 단락 가로채기** (line 14430) — 자기가 wait-others 상태일 때도 `_battleGameLocal.answeredThisQ` 가 true 면 scoreboard partial update 만 하고 `return` → `status === 'finished'` 체크 (line 14440 — 같은 분기의 *뒤*) 에 도달 못 함. 다른 player 가 transition 성공시켜도 자기 화면 갱신 안 됨.

(c) **자가 회복 watchdog 없음** — `_battleSubmitProgress` 의 status flip 이 한 번 실패하면 누구도 다시 시도하지 않음. 진정한 fail-safe 부재.

**v60 의 4 갈래 fix**:

**(1) `_battleSubmitProgress` path 일반화** — `_battleFetchRoom` / `_battleSaveRoom` 와 동일 규칙:
```js
const basePath = (_battleState && _battleState.roomPath) ? _battleState.roomPath : `battles:${code}`;
await STORAGE.setShared(`${basePath}:players:${S.userId}`, JSON.stringify(payload));
```

**(2) Last-player race 의 self-merge** — `_battleSubmitProgress` 의 allDone 체크 직전에 fresh.players 를 *spread 한 local merge* 로 자기 직전 payload 우선:
```js
const merged = { ...fresh.players };
if(S.userId && merged[S.userId]){
  merged[S.userId] = { ...merged[S.userId], ...payload };
}
const allDone = Object.values(merged).every(p => p && p.finished);
if(allDone && fresh.meta.status !== 'finished'){
  fresh.meta.status = 'finished';
  fresh.meta.finishedAt = Date.now();
  fresh.players = merged;   // ← 다른 player view 의 stale 도 해소
  await _battleSaveRoom(code, fresh);
}
```

**(3) SSE/polling onUpdate 재정렬** (`renderBattleLobby` 의 `draw(room)` 콜백, line 14425~):
- `status === 'finished'` 분기를 `playing` 보다 *먼저* 평가 — 어떤 단락보다 우선.
- `inWaitOthers = local.idx >= BATTLE_N_Q || local.finished` 변수 도입 — wait-others 상태에서는 `answeredThisQ` 단락 비활성화.

**(4) `renderBattleGame` 의 status 전환 watchdog** — wait-others 분기 직전에 *idempotent retry*:
```js
if((local.idx >= BATTLE_N_Q || local.finished)
   && room.players && room.meta.status === 'playing'
   && Object.values(room.players).every(p => p && p.finished)){
  const fresh = await _battleFetchRoom(code);
  if(fresh && Object.values(fresh.players).every(p => p && p.finished)
     && fresh.meta.status === 'playing'){
    fresh.meta.status = 'finished';
    fresh.meta.finishedAt = Date.now();
    await _battleSaveRoom(code, fresh);
    return renderBattleResult(code, fresh);
  }
}
```
어떤 player 든 status flip 을 재시도. Last-write-wins, idempotent.

**(보조 5) `_renderBattleWaitOthers` 비상 종료 버튼** — 모든 위 fix 가 실패해도 사용자에게 *수동 탈출구*:
- `local._waitOthersStartedAt` 추적
- 30초 이후 stale 알림 (미완료 N명 + 경과 시간)
- 45초 이후 또는 다른 모든 player 가 finished:true 인데도 status 가 playing 이면 **⚡ 지금 결과 보기 (매치 종료)** 버튼 노출
- 버튼 클릭 시 `meta.status = 'finished'` + `meta.forceFinishedBy = S.userId` 기록, 미완료 player 들은 현재 점수로 finished 마킹

**구현 사항**:
- `index.html`: ~110 lines 변경
  - `_battleSubmitProgress`: basePath + self-merge (~30 lines)
  - `renderBattleLobby` 의 draw 콜백: 분기 순서 재정렬 + inWaitOthers (~25 lines)
  - `renderBattleGame`: status watchdog (~25 lines)
  - `_renderBattleWaitOthers`: stale alert + force-finish 버튼 (~30 lines)
  - APP_VERSION v59 → v60
- `sw.js`: CACHE_VERSION v59 → v60
- `test-v60.js`: 신규 (~210 lines, 44 assertions — 8 섹션, 4 시나리오 sandbox 시뮬레이션)

**검증** (test-v60.js, 44/44 PASS):
- 버전 상수, hardcoded path 제거 + basePath 일반화, self-merge 5 패턴, finished 분기 순서, watchdog, wait-others 버튼·DOM id·forceFinishedBy
- v59 invariant 6 항목 보존 (`BATTLE_JUST_CREATED_GRACE_MS`, `_battleHandleUpdate`, `_lobbyEnterQueue`, `BATTLE_MODES`, `CHARACTER_QUOTES`, `_renderBattleIntro`)
- Sandbox 시뮬레이션 4 시나리오: A 코드방 정상 / B lobby 매치 path 일반화 / C race + self-merge / D 다른 player 진행 중 (status 유지)

추가: `test-v56.js` / `test-v57.js` / `test-v59.js` 도 실행 — *의도된 reversal* (APP/CACHE_VERSION 만) 외 모든 invariant 보존. test-v58.js 는 옛 디렉토리 path hardcoded 라 환경 의존 (코드 결함 아님).

**라이브 작동 검증 시나리오 (사용자 측 수동 점검)**:
1. **공개 lobby 매치** — 두 브라우저에서 큐 입장 → 선임자 시작 → 양측 10 문제 풀이 → *양측 모두 즉시 결과 화면 진입* (이전엔 영구 wait-others 였음)
2. **코드방** — 호스트가 방 생성 + 게스트 입장 → 양측 10 문제 → 양측 결과 화면 진입 (v58 까지도 작동했으나 path 일반화로 아키텍처 일관성 확보)
3. **race 시뮬레이션** — 두 player 가 거의 동시에 마지막 문제 정답 → 둘 다 결과 화면 (이전엔 어느 쪽도 안 보였을 수 있음 — self-merge + watchdog 이 보장)
4. **느린 상대** — 한 사람만 다 풀고 wait-others 진입 → 30초 후 stale 알림 + 45초 후 비상 종료 버튼 노출 → 클릭 시 즉시 결과 (미완료 상대의 현재 점수도 집계)

**솔직한 한계**:
- 4 갈래 fix 는 *증상별 layered defense*. Root cause (path 일반화) 가 가장 critical 하고 나머지는 cascade fail-safe. 운영 환경에서 어느 갈래가 실제로 발동되는지는 통계 부재 — Feedback 운영 UI (defer) 가 갖춰지면 측정 가능.
- 비상 종료 버튼은 *5분 한도 도래 전 사용자 의지로 매치 종료* 권한. 악용 시나리오 (자기가 지고 있을 때 미완료 상대 점수로 종료) 가능하나, 매치 5분 한도가 짧고 학습 보조 목적이라 정책적으로 수용. 외부 공개 시 정정 필요.
- Watchdog 의 `_battleFetchRoom` + `_battleSaveRoom` 2회 호출 비용 — wait-others 진입 player 당 1회 (idempotent 라 다회 진입해도 status 이미 finished 면 분기 안 탐).
- Self-merge 는 *자기 자신만* 보정. 다른 player 의 stale 은 그들의 watchdog 이 처리 (또는 SSE/polling 의 다음 tick 의 fresh fetch).

defer (다음 라운드 후보, v61+):
- **v61 권장 = 정역 확장** (v53 부터 누적 defer, v54~v60 에서도 다른 우선순위에 밀림) — Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47
- **(v60 세션 검토 신규)** 원문 코퍼스 확장 — 결손된 정전 작가 6 작품 (Euripides Medea prologue, Aristophanes Clouds 1-100, Thucydides 1.1-5, Plato Phaedo §57-60, Sappho fr.1+31, Hippocratic Oath). v60 세션에서 corpus inventory 분석 완료, 작품 후보 결정 단계.
- 추가 게임 모드 (v58 의 plug-in 골격) — Ἀκόντισμα, Δίφθογγος, Ὀρθογραφία, Ἑρμηνεία, Δίκη, Κλήρωσις
- 매치 진행 중 ghost player 정리 — v60 의 자동·수동 종료가 *증상* 완화. 진정한 cleanup (`presence:battle:<roomPath>:<uid>` + 30초 TTL + visibilitychange) 별도.
- 재연결 시 인트로 컷 재진입 옵션
- 외부 의존 3 항목 — 새 정보 없음
- BGM 확장 (음량 슬라이더, 추가 모드)
- Feedback 운영 UI · Presence 통계
- 캐릭터 명언 TTS 자동 발화 · 사진 prefetch · 캐릭터 잠금 시스템
- PARADIGM_LIB 분사·비교급 확장 · μι-동사 quiz 통합
- AI 기반 정역 (Anthropic API)
- Firebase Auth 통합 (v59 defer)
- 자가진단 modal 의 자동 룰 PUT (v59 defer)

영구 제외 (사용자 정책):
  · 다국어 UI (i18n)

— *finis*
