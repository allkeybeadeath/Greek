# 다음 라운드 작업 계획 (v57 ~)

*현재 상태*: v56 빌드 완료 (멀티 배틀 인트로·강탈 + BGM + 건의 + presence 카운트). paideia-pwa-v56.zip 배포.
*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션).
- **Wikimedia 파일명 추측 금지** (v54~v55 의 교훈) — 카테고리 페이지 listing 의 *실존 파일명* 만 채택.
- **PD 원전 인용 검증** (v56 의 교훈) — 명언·정역 모두 표준 인용 (Hom. Il. X.Y, DK 단편 번호 등) 으로 출처 명시.

---

## v56 완료 사항 (참조용)

사용자 요청 *2 라운드 통합* (멀티 확장 3 + 학습 동반 모듈 3):

1. **멀티 인트로 컷** (`_renderBattleIntro`) — 적·나 캐릭터 사진 + 중앙 VS 메달리온 + 캐릭터별 명언 말풍선. 2명/3+명 분기 레이아웃. 5.2초 자동 진행 + 바로 시작 / 명언 듣기 (TTS) 버튼.
2. **CHARACTER_QUOTES 50 entries** — 모든 50 캐릭터의 PD 원전 명언 (`{grk, ko, src}`). 호메로스·플라톤·소포클레스·DK 단편 등.
3. **점수 강탈** — Q3/Q6/Q9 가 결정적 강탈 문제 (시드 기반, 모든 플레이어 동일 인덱스). 정답 시 다른 모든 플레이어로부터 8점 강탈. Race-free 설계: 자기 `stolen[]` 에만 push, `_battleEffectiveScores` 가 계산 시 차감 + 음수 클램프.
4. **BGM (Web Audio API)** — 절차적 도리아 모드 음악 + 키타라 톤 + 드론. 양식적 모방 (재현 아님) 명시. 홈 화면 토글 버튼.
5. **건의 사항 modal** — STORAGE.setShared('feedback:<ts>:<uid>') + localStorage 큐 안전망. 운영자는 console 에서 listShared 로 수집.
6. **동시 학습자 카운트** — 4분 간격 presence ping, 5분 TTL, 60초 카운트 캐시. 홈 카드에 N명 공부 중.

`APP_VERSION`/`CACHE_VERSION` v55 → v56. `test-v56.js` (66/66 PASS).

---

## 즉시 실행 후보 (자체 완결)

### 우선순위 1 — 정역 더 확장 (v53 defer, v56 의 원래 권장 작업)
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

### 우선순위 2 — BGM 확장 (v56 신규 defer)
**작업 깊이**: 작음~중간
**구현 옵션 (우선순위 순)**:
- **(d) 음량 슬라이더** — 현재 고정 0.045. 사용자 조절 가능하도록. *매우 작은 작업*.
- **(b) 모티프 다양화** — 현재 5종 → 12-15종. 변주 (역행, 전위, 리듬 변경).
- **(a) 추가 모드** — Phrygian/Lydian/Mixolydian. 그리스 음악 이론 학습 모듈로 확장 가능.
- **(c) 외부 학자 복원 mp3** — Seikilos Epitaph 의 *진짜* 멜로디. 외부 호스팅. 라이선스 검증 필요.

---

### 우선순위 3 — Feedback 운영 UI (v56 신규 defer)
**작업 깊이**: 중간
**목표**: 운영자가 console 없이 UI 에서 건의 사항 조회·답변·완료 마킹.

**설계**:
- `/?admin=<token>` 쿼리. 토큰은 `admin:` STORAGE 키.
- 리스트 UI: 시간순 정렬, 미처리/처리완료 필터.
- 처리 완료 마킹: `feedback:<ts>:<uid>` value 에 `resolved: true` 추가.

---

### 우선순위 4 — 캐릭터 잠금 시스템 (v52~v54 defer)
**작업 깊이**: 중간~큼
- 기본 15명 (5 카테고리 × 3) 즉시 가능
- 35명 잠금: 5작품 완독, 34 문법 토픽 학습, 100 어휘, 10 배틀 승리 등

---

### 우선순위 5 — PARADIGM_LIB 분사·비교급 확장 (v51 defer)
**목표**: 76 → ~95.

---

### 우선순위 6 — AI 기반 정역 (v53 defer)
**의존성**: Anthropic API + 비용 모델
**목표**: 큐레이션 한계 보완 — 사용자가 큐레이션 없는 섹션의 📖 토글 시 Claude API 로 번역.

---

## v56 신규 미해결

- **사진 prefetch** (v53 defer 유지) — 50/50 검증되어 효과 명확. 작업 비용 작음.
- **BGM 음량 슬라이더** — 단일 라인 변경, 매우 작은 작업.
- **명언 자동 TTS** — 현재는 클릭 시 발화. 옵션으로 자동 시작 가능.
- **Presence 통계** — 시간대·요일 분포. 운영자 전용.

---

## 외부 의존 (새 정보 있으면 즉시 처리)

| 항목 | 필요 정보 | 현재 상태 |
|---|---|---|
| SoundCloud rhapsodoi slugs | 실제 트랙명 검증 | 지난 10 라운드 정보 없음 |
| Plato Crito 무료 샘플 | mp3 URL | 노출 안 함 |
| ScorpioMartianus Ancient Greek Alive 001 | mp3 호스트 | Patreon Tier 유료 |
| Seikilos Epitaph 학자 복원 mp3 | 무료 PD 음원 호스팅 | v56 의 BGM 확장 검토 |

---

## 영구 정책

- **다국어 UI (i18n)** — 영구 제외
- **HANDOVER.md 동봉** — 매 라운드
- **Wikimedia 파일명 추측 금지** (v54~v55)
- **PD 원전 인용 검증** (v56) — Hom. Il. X.Y / DK 단편 / Stephanus 페이지

---

## 권장 다음 라운드 묶음

**v57 = 우선순위 1 (정역 더 확장)** 단독 라운드 — 19 → ~25 발췌
- v56 에서 사용자가 멀티·UI 확장으로 옮겨갔으므로 정역은 v57 의 자연스러운 회귀
- `data-translations.js` 만 수정, index.html 코드 변경 없음

**v58 = 우선순위 2 (BGM 확장) 또는 5 (PARADIGM_LIB 분사)** — 학술 라운드

**v59+** = 우선순위 3 (Feedback UI) 또는 4 (캐릭터 잠금) — 운영·UX 결정 시점

---

## 시작 절차 (다음 세션)

1. 작업 디렉토리 확인
2. 현재 버전: `grep "APP_VERSION = '" index.html` → `v56`. `grep "CACHE_VERSION = '" sw.js` → `v56`.
3. `NEXT_TASKS.md` 읽기 — 이 파일
4. **HANDOVER.md §0 (현재 상태 스냅샷) + §7 의 v56 entry** 먼저 읽기
5. 사용자 지시 확인 — 우선순위 1 (정역 확장) vs 새 지시
6. 작업 → 검증 → 패키지 (zip + HANDOVER.md 둘 다 present_files) → HANDOVER 갱신

---

## v57 라운드 시작 시 핵심 방법론 메모 (정역 확장)

**번역 기조** (v52~v53 일관 정책):
1. 직역 우선, 자연스러운 한국어 절충
2. 시문체 산문 풀이로 의미 전달 집중
3. 학자 정역 참고하되 본 앱 학습 맥락에 맞게 재번역

**검증 절차**:
1. 각 발췌의 그리스어 본문을 `WORKS` 의 해당 섹션에서 추출
2. renderer 의 `[.;·?!]` 정규식으로 문장 분할
3. 정역 배열의 길이가 분할 결과와 일치하는지 확인
4. `_getCuratedTranslation(workId, secN)` lookup 으로 1:1 매핑 확인

**v53 sentence count 함정**: 헬라어 본문에는 `·` (middle dot) 가 마침표 역할도 함. `;` 는 의문문 종결.

---

*작성: 2026-05-16 (v56 세션 종료 시점)*
*문의: HANDOVER.md 의 §7 v56 entry, 또는 코드 내 `_renderBattleIntro` / `BGM` IIFE / `openFeedbackModal` / `fetchPresenceCount` 주석 참조*
