# 다음 라운드 작업 계획 (v56 ~)

*현재 상태*: v55 빌드 완료 (9 캐릭터 사진 재추가 — v54 hotfix 의 완결). paideia-pwa-v55.zip 배포.
*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션). CIM Lab 다수 사용자가 한 계정을 공유하므로 세션 간 컨텍스트 회복을 위해 필수.

---

## v55 완료 사항 (참조용)

**9 캐릭터 사진 재추가** 단독 라운드 — v54 hotfix 의 완결. v54 까지 SVG 폴백이었던 9 ID 의 Wikimedia 파일명을 카테고리 페이지 listing 으로 검증 후 entry 재추가.

검증된 9 파일명:
- `diomedes` → `Diomedes_Louvre_Ma890_n2.jpg` (Cat:Diomedes_(Louvre,_Ma_890))
- `orpheus` → `Berlin-Pergamonmuseum-18-Orpheus-Mosaik-2016-gje.jpg` (Cat:Pergamonmuseum_-_Orpheus_mosaic)
- `aeneas` → `Aeneas,_Anchises,_and_Ascanius_by_Bernini,_Galleria_Borghese_(44686152210).jpg` (Cat:Aeneas,_Anchises,_and_Ascanius_by_Bernini)
- `penelope` → `JohnWilliamWaterhouse-PenelopeandtheSuitors(1912).jpg` (File 직접 검증)
- `atalanta` → `Guido_Reni_-_Atalanta_and_Hippomenes_-_Google_Art_Project.jpg` (Cat:Atalanta_and_Hippomenes_by_Guido_Reni_(Naples))
- `medea` → `Lille_PdBA_delacroix_medee.JPG` (File 직접 검증, *대문자 .JPG*)
- `empedocles` → `The_Death_of_Empedocles_by_Salvator_Rosa.jpg` (File 직접 검증)
- `herodotus` → `Marble_bust_of_Herodotos_MET_DT11742_(cropped).jpg` (Wikidata Q26825 정전 이미지)
- `solon` → `Solon_in_Vatican_Museums.JPG` (File 직접 검증, *대문자 .JPG*)

`APP_VERSION` v54 → v55, `CACHE_VERSION` v54 → v55 (`IMG_CACHE` 자동 bump).

**검증**: `test-v55.js` (27/27 PASS): 50 entries, 9 신규 ID 정확한 파일명 검증, v54 보존 41 ID regression 없음, URL 패턴 일치, `_charPhotoMedallion` 폴백 보존.

**결과**: 50/50 캐릭터 사진 표시 — v54 의 41 + 9 SVG 폴백 혼재 상태 완전 해소.

---

## 즉시 실행 후보 (자체 완결, 외부 의존 없음)

### 우선순위 1 — 정역 더 확장 (v53 의 defer, v56 권장)
**작업 깊이**: 중간
**의존성**: v53 의 `WORK_TRANSLATIONS` 모델 (별도 파일 `data-translations.js`)
**목표**: 19 발췌 → 25 발췌

**구체 작업** (학습 가치 + v53 연속성 순):

1. **Plato Apology §23-26** (변론 마무리) — v52~v53 의 §17-22 자연스러운 연속. 4 섹션 ~80 문장 예상. 소크라테스의 변론 클라이맥스 (당당함, 신탁의 의미).
2. **Homer Iliad 1.151-200+** (외교 시도) — v53 의 §1.101-150 연속. 네스토르의 중재 시도. ~25 문장.
3. **Sophocles Oedipus 1-100** — 안티고네 (v53) 에 이은 두 번째 비극. 오이디푸스 진입, 백성의 탄원. ~15 문장.
4. **Plato Crito §44-47** — v53 의 §43 연속. 크리톤의 탈출 권유 본격화. ~30 문장.
5. **Aeschylus Agamemnon 1-100** (옵션) — 불 신호 도착. 비극 정전.
6. **Euripides Medea 1-100** (옵션) — 유모의 탄식. 메데이아 비극의 시작.

**번역 기조** (v53 헤더 그대로): 직역 우선, 자연스러운 한국어 절충. 시문체 산문 풀이, 학습 맥락의 작업 번역.

**검증 기준** (v53 와 동일): 각 정역의 sentence count 가 renderer 의 `[.;·?!]` 정규식과 일치. `_getCuratedTranslation` lookup 정확성.

**예상 산출물**: `data-translations.js` 55 KB → ~75 KB (~20 KB 증가). 검증 스크립트 `test-v56.js` (lookup 정확성 + sentence count 일치).

---

### 우선순위 2 — 캐릭터 사진 prefetch (v53 의 defer)
**작업 깊이**: 작음
**의존성**: 없음 (v55 에서 50/50 모두 검증됨)
**목표**: 사용자가 character picker 열기 *전에* 50 사진을 백그라운드로 prefetch → 첫 picker 열림 속도 개선.

**구현 옵션**:
- (a) `<link rel="prefetch">` 태그 50 개를 `<head>` 에 동적 삽입 (앱 init 시점)
- (b) Service Worker pre-cache (DATA_BUNDLE 에 추가 — 캐시 키 `paideia-img-v56`)

옵션 (a) 가 단순하고 SW 부담 적음. 옵션 (b) 는 오프라인 첫 사용에서도 사진 표시 가능 (더 robust 하지만 초기 다운로드 부담).

**관찰**: v55 에서 50/50 검증되어 prefetch 의 효과가 *명확해짐*. v54 까지는 9/50 이 SVG 폴백이라 prefetch 시 broken-image 가 캐시될 위험이 있었음.

---

### 우선순위 3 — 캐릭터 점진 잠금 시스템 (v52~v54 의 defer)
**작업 깊이**: 중간~큼
**의존성**: 기존 XP/배지 시스템 + CHARACTERS 배열
**목표**: 학습 동기 부여. 현재 모든 50명 즉시 선택 가능 → 일부는 학습 진척 후 잠금 해제.

설계 후보 D 하이브리드 (v52 NEXT_TASKS.md):
- 기본 캐릭터 15명 (5 카테고리 × 3) 즉시 선택 가능
- 35명 잠금: 5작품 완독, 34 문법 토픽 학습, 100 어휘, 10 배틀 승리 등 다양한 조건

**UX 설계 결정 필요**:
- "잠긴" 캐릭터를 picker 에 어떻게 표시할지 (그레이아웃 + 잠금 조건 툴팁?)
- 기존 사용자의 character 가 잠금 대상이 되는 경우 처리 (자동 retain? 강제 reset?)

---

### 우선순위 4 — AI 기반 정역 (Anthropic API 통합, v53 의 defer)
**작업 깊이**: 중간
**의존성**: Anthropic API 키 + 비용 모델 결정
**목표**: 큐레이션 한계 보완. 사용자가 큐레이션 없는 섹션의 "📖 해석" 토글 시, Claude API 로 문장 단위 번역 → localStorage 24h 캐시.

---

### 우선순위 5 — PARADIGM_LIB 분사·비교급 확장 (v51 의 defer)
**작업 깊이**: 중간
**목표**: PARADIGM_LIB 76 → ~95 (분사 8 + 비교급·최상급 5 + 추가 3변화 명사 6).
- 현재분사 m/f/n (현재능동·중수): λύων / λύουσα / λῦον
- 부정과거 분사: λύσας · λυθείς
- 비교급·최상급: μείζων (불규칙) · κρείττων (어근 변화) · ἥδιστος (-ιστος)
- 추가 3변화: πούς · χείρ · κύων · ἧπαρ

---

### 우선순위 6 — μι-동사 가정법/희구법 quiz 통합 (v51 의 defer)
**작업 깊이**: 중간
**목표**: v50 의 5 mi-verb 가정법/희구법 표를 `startParadigmQuiz` 에 통합.

---

## 외부 의존 (새 정보 있으면 즉시 처리)

| 항목 | 필요 정보 | 현재 상태 |
|---|---|---|
| SoundCloud rhapsodoi slugs | 실제 트랙명 검증 | 지난 9 라운드 정보 없음 |
| Plato Crito 무료 샘플 | mp3 URL | 노출 안 함 |
| ScorpioMartianus Ancient Greek Alive 001 | mp3 호스트 | Patreon Tier 유료 |

---

## 영구 정책

- **다국어 UI (i18n)** — 사용자 요청 (v49 세션) 으로 작업 범위에서 영구 제외
- **HANDOVER.md 동봉** — 사용자 요청 (v53 세션) 으로 매 라운드 산출물에 동봉. CIM Lab 다수 사용자가 한 계정 공유하므로 세션 간 컨텍스트 회복 필수.
- **Wikimedia 파일명 추측 금지** (v54~v55 의 교훈) — 카테고리 페이지 listing 의 *실존 파일명* 만 채택. 추측·외삽·기억 금지.

---

## 권장 다음 라운드 묶음

**v56 = 우선순위 1 (정역 더 확장)** 단독 라운드 — 19 → ~25 발췌
- Plato Apology §23-26 + Iliad §1.151-200 + Sophocles Oedipus 1-100 + Plato Crito §44-47 (+ 옵션 1-2)
- `data-translations.js` 만 수정, index.html 코드 변경 없음 (renderer 이미 모든 발췌 처리 가능)

**v57 = 우선순위 2 (사진 prefetch)** 가벼운 라운드 또는 **우선순위 5 (PARADIGM_LIB 분사)** 학술 라운드

**v58+** = 우선순위 3 (캐릭터 잠금) 또는 4 (AI 정역) — 사용자 지시 또는 우선순위 합의 시점에서 결정

---

## 시작 절차 (다음 세션)

1. 작업 디렉토리 확인 — `index.html`, `data-works.js`, `data-morph.js`, `data-translations.js`, `data-characters.js`, `sw.js`, `HANDOVER.md`
2. 현재 버전 확인: `grep "APP_VERSION = '" index.html` → `v55` 이어야 함. `grep "CACHE_VERSION = '" sw.js` 도 v55.
3. `NEXT_TASKS.md` 읽기 — 이 파일
4. **HANDOVER.md §0 (현재 상태 스냅샷) + §7 의 v55 entry** 먼저 읽기
5. 사용자 지시 확인 — 우선순위 1 (정역 확장) vs 묶음 vs 새 지시
6. 작업 → 검증 (`test-*.js` 패턴) → 패키지 (**zip + HANDOVER.md 둘 다 present_files**) → HANDOVER 갱신

---

## v56 라운드 시작 시 핵심 방법론 메모 (정역 확장)

**번역 기조** (v52~v53 의 일관 정책):
1. 직역 우선, 자연스러운 한국어 절충
2. 시문체 (호메로스·헤시오도스·비극) 는 라틴어 운율 살리려 하지 않고 산문으로 풀어 의미 전달에 집중
3. 학자 정역 (강대진 일리아스, 천병희 변명·비극, 정암학당 플라톤) 참고하되 본 앱 학습 맥락에 맞게 재번역
4. 학습용이므로 직역에 가까운 형태

**검증 절차**:
1. 각 발췌의 그리스어 본문을 `WORKS` 의 해당 섹션에서 추출
2. renderer 의 `[.;·?!]` 정규식으로 문장 분할
3. 정역 배열의 길이가 분할 결과와 일치하는지 확인
4. `_getCuratedTranslation(workId, secN)` lookup 으로 1:1 매핑 확인

**v53 의 sentence count 함정**: 헬라어 본문에는 `·` (middle dot, U+00B7) 가 마침표 역할도 함. `;` 는 의문문 종결. 정규식이 이를 모두 포함하므로 정역 배열 길이를 *실제 문장 단위*로 일치시킬 것.

---

*작성: 2026-05-16 (v55 세션 종료 시점)*
*문의: HANDOVER.md 의 §7 v55 entry 또는 코드 내 `_charPhotoMedallion` (index.html line 5380~5390) 폴백 로직 주석 참조*
