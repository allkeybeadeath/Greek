# 다음 라운드 작업 계획 (v52 ~)

*현재 상태*: v51 빌드 완료. paideia-pwa-v51.zip 배포 예정.
*세션 정책*: 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).

---

## v51 완료 사항 (참조용)

**Παράδειγμα · 변화표 만들기 + 빈칸 채우기 시험** — v50 까지 defer 였던 *가장 학습 가치 높은* 신규 모듈을 두 세션 통합 라운드로 완성:

- PARADIGM_LIB 76 표제어 큐레이션 (명사 55 · 형용사 12 · 대명사 9) — Smyth/Goodwin/HQ/Pharr 표준형
- AGDT v2.1 실제 출현 어형 매칭 — attested vs 패러다임 외 별도 그룹 (방언/시문체/축약/비교급/지시 -ί)
- 3단계 검색 (직접 → 정규화 → MORPH_LOOKUP 어형 환원)
- 빈칸 채우기 시험 모드 — NFD/ς-σ 관용 채점 + 액센트 정확 ★ 마킹
- TOPICS 카운트 정정 (§0 의 "42" 는 v47 부터의 문서 오기, 실제 41)

---

## 즉시 실행 후보 (자체 완결, 외부 의존 없음)

### 우선순위 1 — PARADIGM_LIB 분사 확장
**작업 깊이**: 중간 (한 라운드의 1/2)
**의존성**: v51 의 라이브러리 모델 재사용
**목표**: 현재 명사·형용사·대명사만. *분사* (현재능동·부정과거능동·중수동·완료) 추가는 그리스어 문법의 *세 번째 큰 산* (mi-verbs · 부정사 · 분사).

**구체 작업**:
- `PARADIGM_LIB` 에 `pos: 'ptcp'` 항목 추가 — 약 8-12 표제어
  · 현재 능동 (λύων, -ουσα, -ον)
  · 현재 중수동 (λυόμενος, -η, -ον — 1·2변화 형용사 패턴)
  · 부정과거 능동 (λύσας, λύσασα, λῦσαν)
  · 부정과거 중간 (λυσάμενος)
  · 부정과거 수동 (λυθείς, λυθεῖσα, λυθέν)
  · 완료 능동 (λελυκώς, -υῖα, -ός)
  · 완료 중수동 (λελυμένος)
  · μι-동사 분사 일부 (διδούς, -οῦσα, -όν / τιθείς, -εῖσα, -έν / ἱστάς, -ᾶσα, -άν)
- `renderParadigmBuilder` 의 `_renderParadigmSuggestions` 카테고리에 "분사 · 시제별" 추가
- quiz 모드 자동 호환 (3-gender 패턴)

**검증 기준**:
- PARADIGM_LIB 76 → ~85 표제어
- 모든 분사 quiz 가능 (Fisher-Yates 후보 ≥ 4)
- 학술 출처: Smyth §301-318 (분사 형태), Goodwin §820-878 (분사 구문)

---

### 우선순위 2 — 비교급·최상급 형용사 라이브러리
**작업 깊이**: 작음~중간
**의존성**: v51 라이브러리 모델
**목표**: AGDT xref 에서 *비교급·최상급은 패러다임 외 어형* 으로 분류되어 누락. μέγας → μείζων → μέγιστος 가 자주 등장하나 라이브러리 미수록.

**구체 작업**:
- `pos: 'adj_cmp'` 또는 PARADIGM_LIB 의 entry 에 `comparative`/`superlative` 필드 부착
- 5 ~ 8 가장 흔한 비교급:
  · μείζων (μέγας), ἥττων (κακός), ἥδιον (ἡδύς), βελτίων (ἀγαθός), πλείων (πολύς)
- 최상급 6 ~ 8개: μέγιστος, ἥδιστος, βέλτιστος, πλεῖστος, ἄριστος, κράτιστος, κάλλιστος, σοφώτατος
- 비교급 활용 (3변화 -ων 어간) 표 + 최상급 (1·2변화) 표 추가
- AGDT attestation 데이터 풍부 (xref 결과: μέγας 비교급 형태들 약 30+ 출현)

**검증 기준**:
- 비교급 ων/ονος 어간 정확 (Smyth §293-294)
- 최상급은 ος/η/ον 표준 (Smyth §319)

---

### 우선순위 3 — μι-동사 가정법/희구법 quiz 통합
**작업 깊이**: 중간
**의존성**: v50 의 mi-verbs 토픽 extraParadigms + v51 의 quiz 모듈
**목표**: v50 추가한 5 표는 현재 *학습용 표시만*. quiz 가 없어 active recall 불가. Παράδειγμα 의 quiz 모듈이 *명사·형용사·대명사 패러다임 모델* 에 특화되어 *동사 패러다임* 과 호환 안 됨.

**두 접근**:

A) **동사용 별도 quiz 모듈** — `startVerbParadigmQuiz` 신규. mi-verbs 토픽 entry 의 paradigm/extraParadigms 객체를 받아 빈칸 처리. 변화 차원이 person × number (3 × 2) 또는 person × number × mood (3 × 2 × 4) 로 다름.

B) **통합 라이브러리 확장** — PARADIGM_LIB 에 `pos: 'verb'` 항목 추가 + 셀 좌표 모델 확장 ({mood, voice, tense, person, number}). 일관성 ↑, 복잡도 ↑.

**권장**: A) 가 작업 부담 작고 한 라운드 안에 자체 완결. B) 는 v55+ 정도에 라이브러리 대대적 리팩토링 시 고려.

---

## 외부 의존 (새 정보 있으면 즉시 처리)

| 항목 | 필요 정보 | 현재 상태 |
|---|---|---|
| SoundCloud rhapsodoi slugs | 실제 트랙명 검증 | 지난 5 라운드 정보 없음 |
| Plato Crito 무료 샘플 | mp3 URL | ancientgreek.eu plato-crito.html 에 샘플 mp3 노출 안 함 |
| ScorpioMartianus Ancient Greek Alive 001 | mp3 호스트 | Patreon Tier 유료. 무료 공개분의 mp3 직접 URL 미확인 |

→ 다음 세션에서 사용자가 외부 정보를 제공하면 즉시 처리. 없으면 defer 유지.

---

## 영구 제외 (사용자 정책)

- **다국어 UI (i18n)** — 사용자 요청 (v49 세션) 으로 작업 범위에서 제외

---

## 권장 다음 라운드 묶음

**v52 = 우선순위 1 (분사 확장)** 단독 라운드
- PARADIGM_LIB 분사 ~10 항목 추가
- AGDT xref 로 attestation 검증
- quiz 자동 호환 확인
- 패키지 paideia-pwa-v52.zip

**v53 = 우선순위 2 (비교급·최상급) + 우선순위 3 (mi-verb quiz)** 묶음
- 비교급·최상급 라이브러리 (작음~중간)
- μι-동사 quiz 별도 모듈 (중간)
- 둘 다 자체 완결, 학습 가치 ↑
- 패키지 paideia-pwa-v53.zip

**v54~** = 외부 정보가 들어오면 외부 의존 항목, 또는 사용자 우선순위 새 지시.

---

## 시작 절차 (다음 세션)

1. `/home/claude/` 작업 디렉토리 확인 — index.html, data-works.js, data-morph.js, sw.js, HANDOVER.md
2. 현재 버전 확인: `grep "APP_VERSION = '" index.html` → `v51` 이어야 함
3. `NEXT_TASKS.md` 읽기 — 이 파일
4. **HANDOVER.md §0 (현재 상태 스냅샷) + §7 의 v51 entry** 먼저 읽기 — 현재 상태 한눈에
5. 사용자 지시 확인 — 우선순위 1 (분사) vs 묶음 (v53) vs 새 지시
6. 작업 → 검증 (test-*.js 패턴) → 패키지 (zip + present_files) → HANDOVER 갱신

---

## 작업 디렉토리 정리 노트

v51 작업 중 임시 파일들이 `/home/claude/` 에 남아 있음. 다음 세션에서 *참조용으로 유지* 또는 *정리* 결정:
- `paradigm-lib-draft.js` (40 KB) — PARADIGM_LIB 의 standalone 사본. index.html 통합 후엔 *historical 참조* 로만 의미. 다음 분사 확장 시 *체크 sample* 로 활용 가능
- `validate-paradigm.js` (2 KB) — PARADIGM_LIB 구조 검증. 분사 추가 시 *재사용 가능*. 유지 권장
- `xref-agdt.js` (2.7 KB) — AGDT 매칭 커버리지 확인. 라이브러리 확장 시 *재사용 핵심*. 유지 권장
- `xref-topics.js` (6.5 KB) — 기존 TOPICS 변화표와 PARADIGM_LIB 일관성 검증. 라이브러리 갱신 시 *재실행 권장*. 유지
- `test-paradigm-v51.js` (3.5 KB) — 통합 검증. 다음 라운드도 동일 검증 후 새 케이스 추가 권장
- `test-quiz.js` (5 KB) — quiz 모듈 검증. 동사 quiz 추가 시 *템플릿* 으로 활용

이 6 파일은 *배포 zip 에 포함하지 않음* (개발 산출물). 작업 디렉토리에만 유지하며 다음 라운드에서 활용.

---

*작성: 2026-05-16 (v51 세션 종료 시점)*
*문의: HANDOVER.md 의 §7 v51 entry 또는 코드 내 PARADIGM_LIB / startParadigmQuiz 주석 참조*
