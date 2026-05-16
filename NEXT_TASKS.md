# 다음 라운드 작업 계획 (v54 ~)

*현재 상태*: v53 빌드 완료. paideia-pwa-v53.zip 배포.
*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션). CIM Lab 다수 사용자가 한 계정을 공유하므로 세션 간 컨텍스트 회복을 위해 필수.

---

## v53 완료 사항 (참조용)

**정역 확장** 단독 라운드: 큐레이션 정역 5 → 13 발췌 (+8 entries, ~278 문장 총합):
- Plato Apology §17 (v52) → §18, §19, §20, §21, §22 (v53 추가, 연속 흐름)
- Homer Iliad 1.1-50 (v52) → 1.51-100 (v53 추가, 칼카스 예언)
- Homer Odyssey 1.1-50 (v52) → 1.51-100 (v53 추가, 아테나 탄원)
- Plato Crito §43 (v53 신규, 감옥 만남)
- 기존: Herodotus 1.1, Hesiod Theogony 1-50

**검증**: 모든 13 발췌의 한국어 sentence count = renderer 가 추출하는 그리스어 sentence count. 1:1 매핑 무결성 확보.

**메타 변경**: 인수인계 (HANDOVER.md) 동봉 정책 v53 부터 적용.

---

## 즉시 실행 후보 (자체 완결, 외부 의존 없음)

### 우선순위 1 — 정역 더 확장 (v54)
**작업 깊이**: 중간
**의존성**: v53 의 WORK_TRANSLATIONS 모델 (확장 가능 검증됨)
**목표**: 13 발췌 → ~20 발췌

**구체 작업** (학습 가치 순):
- Plato Apology §23-26 (변론 마무리 — 4 섹션, 변명 1부 종결)
- Homer Iliad 1.101-150 (공개 다툼 — 1 섹션)
- Plato Euthyphro §2-3 (법정에서의 만남 — 새 작품 도입)
- Sophocles Antigone 1-100 (헬레니즘 드라마 진입 — 안티고네-이스메네)
- Aeschylus Persae 1-100 (페르시아인들 — 페르시아 사절단 합창)
- Hesiod Works and Days 1-50 (제우스 찬미 도입)
- Xenophon Anabasis 1.2 (102 문장 — 가장 길지만 학습 가치 큼)

**검증 기준** (v53 와 동일):
- WORK_TRANSLATIONS 엔트리 13 → 20
- 각 정역의 sentence count 가 renderer 의 `[.;·?!]` 규칙과 일치 (`/tmp/check-counts.js` 통과)
- 학자 정역과의 구분 명시

---

### 우선순위 2 — 캐릭터 점진 잠금 시스템
**작업 깊이**: 중간~큼
**의존성**: v52 의 CHARACTERS + 기존 XP/배지 시스템
**목표**: 학습 동기 부여. 현재 모든 50명 즉시 선택 가능 → 일부는 학습 진척 후 잠금 해제.

(v52 NEXT_TASKS.md 참조 — D 하이브리드 권장)

---

### 우선순위 3 — AI 기반 정역 (Anthropic API 통합)
**작업 깊이**: 중간
**의존성**: Anthropic API 키
**목표**: 큐레이션 한계 보완. 사용자가 큐레이션 없는 섹션의 "📖 해석" 토글 시, 단어 풀이 폴백 대신 Claude API 로 문장 단위 번역 → localStorage 캐시.

**설계**: C 권장 — 기본 단어 풀이 + "정역 요청" 버튼 → API 호출 → 24h TTL 캐시.

---

### 우선순위 4 — PARADIGM_LIB 분사 확장 (v51 의 defer)
(v51 NEXT_TASKS.md 참조)

---

### 우선순위 5 — μι-동사 가정법/희구법 quiz (v51 의 defer)
(v51 NEXT_TASKS.md 참조)

---

## 외부 의존 (새 정보 있으면 즉시 처리)

| 항목 | 필요 정보 | 현재 상태 |
|---|---|---|
| SoundCloud rhapsodoi slugs | 실제 트랙명 검증 | 지난 7 라운드 정보 없음 |
| Plato Crito 무료 샘플 | mp3 URL | 노출 안 함 |
| ScorpioMartianus Ancient Greek Alive 001 | mp3 호스트 | Patreon Tier 유료 |

---

## 영구 정책

- **다국어 UI (i18n)** — 사용자 요청 (v49 세션) 으로 작업 범위에서 영구 제외
- **HANDOVER.md 동봉** — 사용자 요청 (v53 세션) 으로 매 라운드 산출물에 동봉. CIM Lab 다수 사용자가 한 계정 공유하므로 세션 간 컨텍스트 회복 필수.

---

## 권장 다음 라운드 묶음

**v54 = 우선순위 1 (정역 7개 추가)** 단독 라운드
- WORK_TRANSLATIONS 13 → 20
- Plato Apology §23-26 (변명 1부 종결) 우선
- Homer Iliad 1.101-150 (공개 다툼)
- Plato Euthyphro 진입, Sophocles Antigone 진입

**v55 = 우선순위 2 (캐릭터 잠금)** 단독 라운드
**v56 = 우선순위 3 (AI 기반 정역)** 단독 라운드 — 큐레이션 패러다임 보완
**v57+** = 우선순위 4, 5 또는 새 사용자 지시

---

## 시작 절차 (다음 세션)

1. `/home/claude/work/` 확인 — index.html, data-works.js, data-morph.js, data-translations.js, sw.js, HANDOVER.md
2. 현재 버전 확인: `grep "APP_VERSION = '" index.html` → `v53` 이어야 함
3. `NEXT_TASKS.md` 읽기 — 이 파일
4. **HANDOVER.md §0 (현재 상태 스냅샷) + §7 의 v53 entry** 먼저 읽기
5. 사용자 지시 확인 — 우선순위 1 (정역 더 확장) vs 묶음 vs 새 지시
6. 작업 → 검증 (test-*.js 패턴 + `/tmp/check-counts.js`) → 패키지 (**zip + HANDOVER.md 둘 다 present_files**) → HANDOVER 갱신

---

*작성: 2026-05-16 (v53 세션 종료 시점)*
*문의: HANDOVER.md 의 §7 v53 entry 또는 코드 내 WORK_TRANSLATIONS / _applyTranslationDisplay 주석 참조*
