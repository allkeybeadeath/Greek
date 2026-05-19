# v62 — 초보자 일일 진도 커리큘럼 (Day 1~20)

작성: 2026-05-19 · 개인 프로젝트

v61 이 정리 라운드였고 신규 기능을 다음 라운드로 이월하면서 두 트랙 (A: 오늘의 단어 / B: 초보자 커리큘럼) 을 후보로 제시한 상태였다. 본 라운드는 사용자 결정에 따라 **트랙 B** 를 선택하여 **20일 분량의 초보자 일일 진도 시스템** 을 신설했다. Phase 5 (Day 21~60 매핑) 와 Word of the Day 트랙은 다음 라운드로 이월.

## 변경 요약

- 신규 데이터: 알파벳 24글자 · 이음 9 · 기식 2 · 강세 3 · 20일 커리큘럼 (총 ~16 KB 데이터)
- 신규 로직: 진행 상태 · 잠금 · 시험 (3 종) · task dispatcher · 6 종 task renderer
- 홈 통합: presence card 와 quote card 사이에 "오늘의 진도" 카드 신설 — 카드 전체와 버튼이 모두 `renderCurriculum` 진입점
- 상태 확장: `S.curriculumDay` · `S.curriculumDone[N] = {completedAt, score}`
- 버전: `APP_VERSION` v61 → v62 · `CACHE_VERSION` v61 → v62 (service worker 갱신 트리거)

## 1. 데이터: 알파벳·이음·구별부호

`index.html` 의 `BADGES` 정의 직후, `S` 상태 객체 직전에 4 개의 새 상수를 주입했다.

### `GREEK_ALPHABET` (24)
24 글자 각각에 대해 8 필드 — `cap` / `low` / `name` (그리스어 이름) / `nameKo` (한국어 표기) / `sound` (Erasmian IPA 약식) / `soundKo` (한국어 음가) / `tip` (학습 팁) / `mnemonic` (기억 보조). 한국어 표기는 학술 관례를 따랐다 (예: ψ → "프시", υ → "윕실론"). 음가는 Erasmian 기준이며 현대 헬라어·복원 Attic 차이는 기존 발음 모드 토글에서 처리.

대표적 정합성 결정:
- ζ: Erasmian 기준 `zd / dz` 두 표기 병기 (영어 lazy 의 z 가 *아님* 을 명시)
- γ: 비음 변이 (γγ·γκ·γχ·γξ 앞 [ŋ]) 를 tip 에 명시
- ρ: 어두 거센기식 ῥ 의무성을 tip 에 명시
- σ vs ς: 어말 알로글리프 명시
- η · ω: μέγα / ψιλόν 의 의미 (큰/단순한) 와 ε · ο 와의 짝 관계 강조

### `GREEK_DIPHTHONGS` (9)
αι · ει · οι · υι · αυ · ευ · ηυ · ου · iota subscriptum 묶음 (ᾳ ῃ ῳ). 각 항목에 `glyph` / `koSound` / `tip` / `ex` (예시 단어). iota subscriptum 은 디프통이 아니지만 학습 흐름상 같은 화면에 묶어 처리 — 고전기 운율 잔영이라는 점을 tip 에서 명시.

### `GREEK_BREATHINGS` (2)
부드러운 기식 (psilon, ᾿) · 거센 기식 (dasy, ῾). 어두 모음·디프통·ρ 위 의무성, dasy 의 [h] 음 추가를 명시.

### `GREEK_ACCENTS` (3)
acute (oxeia, ´) · grave (bareia, ` ) · circumflex (perispomeni, ῀). 각각의 위치 규칙 (ultima·penult·antepenult), grave 의 단독 비출현 조건, circumflex 의 장모음·디프통 한정을 명시.

## 2. 데이터: 커리큘럼 20일

`BEGINNER_CURRICULUM` 은 `{day, grkTitle, koTitle, desc, estMin, tasks: [...]}` 의 배열. `BEGINNER_CURRICULUM_TOTAL_DAYS = 20` 으로 길이 상수 분리 (미래 확장 시 둘 다 갱신해야 정합성 유지).

### Day 1~5 (신규 콘텐츠 — 알파벳·발음)
- Day 1~4: 알파벳 6글자씩 4 분할 — Α–Ζ / Η–Μ / Ν–Σ / Τ–Ω. 각 일차에 학습 task + 6 문제 객관식 시험 (kind: `alphabet`)
- Day 5: 이음 + 기식 + 강세 통합. 4 개 task (diphthong · breathing · accent · 종합 시험). 종합 시험 (kind: `diacritic`) 은 9 문제, 글리프 → 한국어 이름 매칭

각 그리스어 제목은 그리스 수 표기 사용: `Ἀλφάβητος Αʹ–Δʹ`, `Δίφθογγοι καὶ Τόνοι`.

### Day 6~20 (기존 레슨 3~7 매핑)
38 레슨 중 가장 밀도가 높은 앞쪽 5 레슨을 15 일에 분배. 한 레슨당 일수는 어휘·토픽 양에 따라 가변:

| Day | 매핑 | 어휘 학습 | 문법 토픽 |
|---|---|---|---|
| 6 | 레슨 3 (1/2) | 명사 12 | — |
| 7 | 레슨 3 (2/2) | 형용사·기타 12 | `art` (정관사) |
| 8 | 레슨 3 — 명사 변화 | — | `decl2m` · `decl2n` |
| 9 | 레슨 3 — 형용사 | — | `adj-agathos` |
| 10 | 레슨 4 (1/2) | 11 | — |
| 11 | 레슨 4 (2/2) | 10 | `decl1f` (1변화 여성) |
| 12 | 레슨 4 — 관계대명사 | — | `relpron` |
| 13 | 레슨 5 — 동사 도입 | 15 (λύω 등) | — |
| 14 | 레슨 5 — 현재·미래 | — | `pres-act` · `fut-act` |
| 15 | 레슨 5 — 단순과거 | — | `aor1-act` |
| 16 | 레슨 6 (1/2) | 10 | — |
| 17 | 레슨 6 (2/2) | 9 | `impf-act` (불완료) |
| 18 | 레슨 6 — 3변화 | — | `decl3` |
| 19 | 레슨 7 (1/2) | 10 | — |
| 20 | 레슨 7 (2/2) | 10 | `decl3n` (3변화 중성) |

총 학습 시간 추정 ≈ **5.7 시간** (일차당 평균 17 분).

### 정합성

생성 시 모든 `vocab.words[]`, `quiz.kind=vocab .items[]`, `topic.topicId` 가 실제 `TEXTBOOK_W` · `TOPICS` 에 존재하는지 검증. 결과 — **0 missing**. 빌드 시 Python 스크립트 (`gen_curriculum.py`) 가 같은 검증을 수행하므로 향후 확장 시 회귀 차단.

### task 종류 카탈로그

| `type` | 필드 | 설명 |
|---|---|---|
| `alphabet` | `letters[]` | 알파벳 카드 그리드, 탭 시 발음 (`speakGreek`) |
| `diphthong` | — | `GREEK_DIPHTHONGS` 전체 리스트 |
| `breathing` | — | `GREEK_BREATHINGS` 전체 리스트 |
| `accent` | — | `GREEK_ACCENTS` 전체 리스트 |
| `vocab` | `words[]` | `TEXTBOOK_W` 에서 `g` 키로 검색해 카드 표시 |
| `topic` | `topicId` | 기존 `renderTopic(id)` 위임 + 완료 바 부착 |
| `quiz` | `kind` ∈ {alphabet, vocab, diacritic} + `items[]` | 4-option MC, 70% 이상 통과 |

## 3. 로직: 상태·잠금·진행률

### S 상태 (`let S = {...}` 객체에 2 필드 추가)
```js
curriculumDay: 1,         // 현재 진행 중 일차 (1부터)
curriculumDone: {},       // {[day]: {completedAt:ms, score?:0~100}}
```

`_ensureCurriculumState()` 는 마이그레이션 + 보정 — 필드 부재 시 초기화, `curriculumDay < (max(done) + 1)` 이면 자동 전진, `> TOTAL_DAYS` 면 캡. 기존 사용자 (v61 까지) 의 state 에는 이 필드가 없으므로 자동 마이그레이션이 트리거된다.

### 잠금 규칙
- Day 1 은 항상 열림
- Day N (N ≥ 2) 은 Day N-1 이 완료된 경우에만 열림
- 이미 완료한 일차는 자유 재방문 (잠기지 않음)

### 일차 완료 (`markCurriculumDayDone(n, score)`)
1. `S.curriculumDone[n] = {completedAt: Date.now(), score}`
2. `n` 이 현재 일차이면 `S.curriculumDay` 를 `n+1` 로 (총 일수 초과 금지)
3. `S.xp += 5` (XP 보상)
4. `saveState()` 호출 (localStorage + leaderboard push)

### task 단위 진행
`_curriculumTaskState = {}` 는 **세션 휘발성** 객체로 `{day:taskIdx}` 의 완료 여부만 추적. 새로고침 시 풀림. 의도된 한계 — Day 단위 완료만 영구 보존하여 state 비대화 방지. 추후 라운드에서 영구화 필요 시 `S.curriculumTaskDone` 으로 승격 가능 (구조 그대로 직렬화 가능).

모든 task 완료 시 자동으로 `markCurriculumDayDone(day)` 호출 + toast 알림.

## 4. 렌더러: 3 단 진입 (홈 → 일정 → 일차)

### 홈 카드 (renderHome 패치)
`<div id="home-presence-card">` 와 `<div class="quote-card">` 사이에 IIFE 블록 삽입. `BEGINNER_CURRICULUM` 미정의 시 빈 문자열 반환 — 데이터 누락 상황에서 silent skip.

- 카드 클래스 `card warm` + 왼쪽 테라코타 보더 (presence card 와 시각적 호환)
- 오늘의 진도 라벨 + Day N · 한국어 제목 + 그리스어 부제 + estMin
- 진행률 바 (4px) + 비율 텍스트
- "시작" / "다시" / "복습" 3 가지 라벨 동적 (미시작 / 완료된 일차 재방문 / 전 일차 완주)
- 카드 전체와 버튼 모두 클릭 가능 — `e.stopPropagation()` 으로 중복 호출 방지

이벤트 바인딩은 `bgmBtn` 핸들러 직후에 위치 (`v62: 커리큘럼 카드` 주석으로 표시).

### `renderCurriculum()` — 일정 화면
헤더 + 오늘의 카드 (홈과 같은 정보지만 더 큼) + 전체 20일 리스트. 각 일차 행은:
- 잠긴 일차: 옵라시티 .45, disabled, 자물쇠 🔒
- 완료한 일차: `var(--ivory-d)` 배경, 취소선, ✓
- 현재 일차: 왼쪽 테라코타 보더로 강조

`← 홈` 버튼은 `setTab('home')` 호출.

### `renderCurriculumDay(n)` — 일차 화면
잠긴 일차에 직접 접근 시 toast 경고 후 `renderCurriculum()` 으로 리디렉트 (예: URL 직접 호출 시도). 태스크 리스트 + 일차 설명 + 진행률 바. 모든 task 완료 시 "🏛️ N일차 완주" 카드 + "다음 일차" / "일정 보기" 버튼.

### task dispatcher (`openCurriculumTask(day, idx)`)
`t.type` 으로 분기 → 7 개 sub-renderer 호출. 미지원 type 은 toast 로 경고만 (silent failure 방지).

### task 별 sub-renderer
- **`renderAlphabetTask`** — auto-fit 그리드 (`repeat(auto-fit, minmax(140px, 1fr))`). 각 카드 탭 → `speakGreek(low)` 호출. "학습 완료" 버튼이 mark.
- **`renderDiphthongTask` / `renderBreathingTask` / `renderAccentTask`** — `_renderDiacriticTaskCommon` 헬퍼로 공통화. 항목별 큰 글리프 + 한국어 음가 + tip + 예시.
- **`renderCurriculumVocabTask`** — `TEXTBOOK_W` 에서 `g` 키로 lookup. 그리스어 + `r` (변화 어미) + 품사 칩 + 한국어 + 영어 + `pp` (기본형 5 시제) + note. 탭 시 `speakGreek(g)`.
- **`renderCurriculumTopicTask`** — 기존 `renderTopic(id)` 그대로 위임 + 화면 상단에 sticky 바 (← Day N + 학습 완료 버튼). 완료 시 `S.topicsStudied` 에도 적립 (기존 시스템과 호환).
- **`renderCurriculumQuizTask`** — 3 가지 kind:
  - `alphabet`: 글리프 → 한국어 이름 매칭 (오답 3 개는 다른 글자 이름에서 추출)
  - `vocab`: 그리스어 → 한국어 뜻 (오답은 TEXTBOOK_W 의 다른 단어 ko 에서)
  - `diacritic`: 부호 → 이름 매칭
  - 옵션 4 개 shuffle, 답 클릭 시 정답 강조 0.7 초 후 다음 문제
  - 결과 화면 — 70% 이상 통과 시 "완료" 버튼 활성, 미달 시 "다시 풀기"

## 5. 검증 결과

### 신택스
- 12 개 인라인 `<script>` 블록 모두 `node --check` 통과 (가장 큰 메인 블록 599,884 chars)
- `sw.js` 통과
- 콘솔 노이즈 없음

### 동작 (Node 환경, DOM 스텁)
- 데이터 카운트: 알파벳 24 / 이음 9 / 기식 2 / 강세 3 / 커리큘럼 20
- 잠금: Day 1 열림 / Day 2 잠김 → Day 1 완료 후 Day 2 열림 → Day 3 잠김 (순차 진행 정상)
- 진행률: Day 1~5 순차 완료 후 `current=6, percent=25, XP=25` (5 XP × 5 일차)
- 캡: Day 20 완료 후 `S.curriculumDay` 가 20 으로 캡 (총수 초과 방지)
- Day 7 task 구조: `[vocab, topic, quiz]` · topicId `art` 정합

### 정합성 (Python 교차 참조)
- 모든 `words[]` 와 `kind=vocab .items[]` 가 TEXTBOOK_W 에 존재 — **0 missing**
- 모든 `topicId` 가 TOPICS 에 존재 — **0 missing**

## 6. 알려진 한계 (v62 시점)

- **task 단위 진행 휘발성**: 새로고침 시 일차 내 진행 풀림. Day 단위 완료만 영구. → 추후 `S.curriculumTaskDone` 으로 승격 후 영구화.
- **시험 점수 미기록**: `S.curriculumDone[n].score` 필드는 객체 shape 으로 예약했으나 현재 quiz 결과에서 호출 시 `null` 로 들어감. 사용자의 강세 진행 표시에 활용 가능하지만 현 UI 는 표시 안 함.
- **알파벳 task 시험 후 학습 시간 표시 없음**: estMin 기준은 학습 + 시험 평균. 실측 미시(未施).
- **Day 21~60 미정의**: 레슨 8~40 의 33 레슨 매핑이 다음 라운드로 이월. `BEGINNER_CURRICULUM_TOTAL_DAYS` 만 갱신하면 확장 가능한 구조.
- **시험 문제 풀 부족 시 대체**: kind=`diacritic` 의 4 옵션 생성에서 풀이 부족하면 하드코딩 후보 목록에서 채움 — 다소 부자연스러울 수 있으나 정확한 정답 식별엔 영향 없음.

## 7. 파일 변경 요약

| 파일 | Δ |
|---|---|
| `index.html` | 17,370 lines (+830 lines) · 857,933 bytes (+~43 KB) |
| `sw.js` | CACHE_VERSION `'v61'` → `'v62'` (1 line) |

## 8. 다음 세션에서 이어갈 작업

### 본 트랙 (B) 의 잔여
- **Day 21~60 매핑**: 레슨 8~40. 각 일차당 어휘 8~12 + 토픽 0~2. 추정 ~33~40 일.
  - 레슨 8 (13 vocab, `aor2-act`) · 9 (14, `pres-mp`) · 10 (9, `houtos`) — 각 1~2 일
  - 레슨 11~13 — 어휘만, 각 1 일
  - 레슨 14 (`tithemi-pres` · `didomi-pres`) · 15 (`perf-act`) · 17 (`adj3` · `aor-pass`) · 18~19 (분사·부정사) — 핵심 동사 변화, 각 2~3 일
  - 레슨 22~33 — 비교급·수사·중간·완료·분사·속격 절대·조건·종속절·불규칙 명사
  - 레슨 34~40 — `lesson:99` 의 일반 토픽 7 개 통합 (men-de, aor-impf, cond, opt, mi-verbs, acc-abs, syn-meta)
- **task 진행 영구화**: `S.curriculumTaskDone` 도입 + `_curriculumTaskState` 의 read-through 캐시화
- **시험 점수 표시**: 일차 카드에 별 1~3 개 (70/85/100 기준)
- **커리큘럼 배지**: `BADGES` 에 신규 — `alpha-complete` (Day 5 완료), `lesson3-complete` (Day 9), 그리고 `paideia-complete` (Day 60)
- **읽기 task type**: 현 매핑에 짧은 발췌 읽기가 빠짐. 레슨별 1~2 줄 짧은 예문 (`READINGS` 활용 또는 신규 큐레이션) 을 어휘·문법 학습 사이에 끼워 넣는 게 교수학적으로 자연. v62 의 매핑 표는 reading task 없이 vocab·topic·quiz 만으로 구성된 상태.

### v61 에서 이월된 트랙 (이번 라운드 미처리)
- **A. 오늘의 단어** — 홈 카드. 결정론적 일자 인덱싱. ~150 lines.
- **원문 코퍼스 확장** — Euripides Medea, Aristophanes Clouds, Thucydides 1.1-5, Plato Phaedo, Sappho fr.1/31, Hippocratic Oath 등
- **정역 확장** — 19 발췌 → 25 발췌

### 더 먼 작업 (HANDOVER §0 의 v60 defer 블록 그대로 유효)
캐릭터 잠금, 사진 prefetch, AI 정역, BGM 모드 확장, Feedback 운영 UI, Presence 통계, 코드방 ghost 정리, Firebase Auth, 자가진단 자동 룰 PUT.

## 알려진 미해결 (v61 에서 이월, 본 세션 미처리)

`HANDOVER.md` §0 의 "현재 미해결·defer 상태" 블록 — 본 라운드에서 트랙 B 만 처리. 트랙 A 와 원문/정역 확장은 그대로 이월.
