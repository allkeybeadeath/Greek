# 다음 라운드 작업 계획 (v53 ~)

*현재 상태*: v52 빌드 완료. paideia-pwa-v52.zip 배포.
*세션 정책*: 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).

---

## v52 완료 사항 (참조용)

**캐릭터 (Παίγνια · 50명)** + **원문 해석 (Ἑρμηνεία)** 두 주요 모듈을 한 라운드로 완성:

- **CHARACTERS 50명** — 5 카테고리 SVG 메달리온 (저작권/오프라인 제약으로 사진 대신 그리스 동전 양식)
- **5 표시 위치** — 홈/프로필/명예의 전당/라이브 순위/멀티 배틀 (3 화면 모두)
- **renderCharacterPicker** — 카테고리 필터 + 검색 + 96px 그리드
- **WORK_TRANSLATIONS** — 6 큐레이션 정역 (Apology §17, Anabasis 1.1, Iliad 1, Odyssey 1, Theogony 1-50, Herodotus 1.1)
- **_buildLiteralGloss** — 나머지 539 섹션 단어 풀이 폴백 (ALL_VOCAB + MORPH_LOOKUP)
- **📖 해석 토글** — 각 .sent 아래 .trans div 삽입, 큐레이션 vs 단어 풀이 시각적 구분
- **CACHE_VERSION v52 bump** — 핫픽스: 사용자 보고 "캐릭터 사진 안 뜨는 문제" 의 근본 원인 (SW 가 v51 stale 캐시 서빙)

---

## 즉시 실행 후보 (자체 완결, 외부 의존 없음)

### 우선순위 1 — 큐레이션 정역 확장
**작업 깊이**: 중간 (한 라운드의 1/2)
**의존성**: v52 의 WORK_TRANSLATIONS 모델 재사용
**목표**: 6 발췌 → ~15 발췌. 학습 가치 큰 도입부 위주.

**구체 작업** (학습 가치 순):
- Plato Apology §18-26 (변명 본론 흐름, 9 섹션 추가) — *연속 흐름* 가치 가장 큼
- Plato Crito §43-47 (소크라테스의 결심)
- Xenophon Anabasis 1.2-1.5 (퇴각의 시작)
- Homer Iliad 1.43-100 (아킬레우스의 분노 표출)
- Homer Odyssey 1.22-100 (Telemachus 등장)
- Hesiod Works and Days 1-10 (시작 부분)
- Sappho 1 (Aphrodite Ode, 짧지만 학술적으로 중요)
- Aeschylus Persae §1-50 (페르시아 사절단)

**검증 기준**:
- WORK_TRANSLATIONS 엔트리 6 → 14-15
- 각 정역의 *문장 분할이 renderWorkSection 의 `[.;·?!]` 규칙과 일치*
- 학자 정역과의 구분 명시 (학습 보조 작업 번역)
- 한 라운드 안에 자체 완결, 다음 발췌는 v54+ 후보로 defer

---

### 우선순위 2 — 캐릭터 점진 잠금 시스템
**작업 깊이**: 중간~큼
**의존성**: v52 의 CHARACTERS + 기존 XP/배지 시스템
**목표**: 학습 동기 부여. 현재 모든 50명 즉시 선택 가능 → 일부는 학습 진척 후 *잠금 해제*.

**설계 선택지**:
- A) **XP 기반 잠금**: 카테고리별 XP 임계 (god 0XP, hero 300XP, heroine 900XP, philo 2000XP, poet 4000XP)
- B) **배지 기반 잠금**: 특정 배지 획득 시 해당 캐릭터 잠금 해제 (예: homer 배지 → Homer/Hesiod 잠금 해제)
- C) **완독 기반 잠금**: 해당 작가 작품 완독 시 그 작가 캐릭터 잠금 해제 (Plato 완독 → Socrates·Plato 잠금 해제)
- D) **하이브리드**: 기본 12 (god) 즉시 + 나머지 38은 위 조건 조합

**권장**: D 하이브리드. 학습자에게 명확한 *동기 부여* + 즉시 사용 가능한 초기 풀.

**구체 작업**:
- `CHARACTERS[i].unlock = {xp?: N, badge?: id, work?: id}` 필드 추가
- `_isCharUnlocked(id, S)` 헬퍼
- renderCharacterPicker 에서 잠긴 캐릭터는 회색 처리 + "🔒 XP 300 필요" 등 표시
- 잠금 해제 시 toast 알림 ("✦ 새 캐릭터: 아킬레우스")

**검증 기준**:
- 기본 12 (올림포스 신) 즉시 선택 가능
- XP/배지/완독 변경 시 잠금 해제 알림
- 잠긴 캐릭터 선택 시 *방어* (alert)

---

### 우선순위 3 — PARADIGM_LIB 분사 확장 (v51 의 defer)
**작업 깊이**: 중간
**의존성**: v51 의 라이브러리 모델
**목표**: 명사·형용사·대명사만 → *분사* 추가 (그리스어 문법의 세 번째 큰 산)

(v51 NEXT_TASKS.md 참조)

---

### 우선순위 4 — μι-동사 가정법/희구법 quiz (v51 의 defer)
**작업 깊이**: 중간
**의존성**: v50 의 mi-verbs 토픽 extraParadigms + v51 의 quiz 모듈

(v51 NEXT_TASKS.md 참조)

---

## 외부 의존 (새 정보 있으면 즉시 처리)

| 항목 | 필요 정보 | 현재 상태 |
|---|---|---|
| SoundCloud rhapsodoi slugs | 실제 트랙명 검증 | 지난 6 라운드 정보 없음 |
| Plato Crito 무료 샘플 | mp3 URL | ancientgreek.eu plato-crito.html 에 샘플 mp3 노출 안 함 |
| ScorpioMartianus Ancient Greek Alive 001 | mp3 호스트 | Patreon Tier 유료 |

---

## 영구 제외 (사용자 정책)

- **다국어 UI (i18n)** — 사용자 요청 (v49 세션) 으로 작업 범위에서 제외

---

## 권장 다음 라운드 묶음

**v53 = 우선순위 1 (정역 확장 ~8 발췌 추가)** 단독 라운드
- WORK_TRANSLATIONS 6 → 14-15
- Plato Apology §18-26 우선 (연속 흐름 가치)
- 한 라운드 안에 자체 완결

**v54 = 우선순위 2 (캐릭터 잠금)** 단독 라운드
- UX 설계 (회색 처리, 잠금 해제 알림)
- 학습 동기 부여 + 진척감 강화

**v55+** = 우선순위 3, 4 또는 새 사용자 지시

---

## 시작 절차 (다음 세션)

1. `/home/claude/` 작업 디렉토리 확인 — index.html, data-works.js, data-morph.js, sw.js, HANDOVER.md
2. 현재 버전 확인: `grep "APP_VERSION = '" index.html` → `v52` 이어야 함
3. `NEXT_TASKS.md` 읽기 — 이 파일
4. **HANDOVER.md §0 (현재 상태 스냅샷) + §7 의 v52 entry** 먼저 읽기
5. 사용자 지시 확인 — 우선순위 1 (정역 확장) vs 묶음 vs 새 지시
6. 작업 → 검증 (test-*.js 패턴) → 패키지 (zip + present_files) → HANDOVER 갱신

---

*작성: 2026-05-16 (v52 세션 종료 시점)*
*문의: HANDOVER.md 의 §7 v52 entry 또는 코드 내 CHARACTERS / WORK_TRANSLATIONS / renderCharacterPicker / _applyTranslationDisplay 주석 참조*
