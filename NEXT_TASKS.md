# 다음 라운드 작업 계획 (v61 ~)

*현재 상태*: **v60 빌드 완료** (멀티 배틀 종료 흐름 4 갈래 fix — path 일반화 + last-player race self-merge + SSE 분기 재정렬 + status 전환 watchdog + 수동 비상 종료). paideia-pwa-v60.zip 배포.

*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션).
- **Wikimedia 파일명 추측 금지** (v54~v55 의 교훈) — 카테고리 페이지 listing 의 *실존 파일명* 만 채택.
- **PD 원전 인용 검증** (v56 의 교훈) — 명언·정역·신규 작품 본문 모두 표준 인용으로 출처 명시.
- **단발성 null 에 보수적** (v57 의 교훈) — 외부 의존의 transient 실패가 UX 를 깨뜨리지 않게 임계점·재시도 패턴.
- **단일 실패점 회피** (v58 의 교훈) — 호스트·중앙 권한자 없는 자율 시스템 선호.
- **Silent failure 0 원칙** (v59 의 교훈) — 외부 API 호출의 실패는 진단 채널에 캡처, 반환값 검증, 사용자 명확한 메시지.
- **(v60 신규 교훈) Path 일반화 invariant** — `_battleState.roomPath` 같은 동적 경로 도입 후, *모든* `STORAGE.setShared/getShared` 호출은 동일 규칙 (`_battleState.roomPath || legacy`) 사용. v58 에서 `_battleSubmitProgress` 만 빠진 게 v59~v60 의 *원인 불명* fragility 의 root cause 였음. 새 path 도입 시 *모든 호출처를 grep 점검* 강제.
- **(v60 신규 교훈) Layered fail-safe** — 분산 시스템의 상태 전환 (예: meta.status='finished') 은 *단일 호출 성공에만 의존하지 말고* watchdog · idempotent retry · 수동 탈출구 셋이 모두 있어야 견고. v60 의 4 갈래는 이 패턴을 멀티 배틀 종료에 적용한 사례.

---

## v60 완료 사항 (참조용)

사용자 보고 *"배틀 퀴즈가 끝나도 종료되지 않는 문제 수정"*. 매치 10 문제 완료 후 wait-others 화면 영구 정지.

### A. Root cause 진단 (코드 정밀 추적)
`_battleSubmitProgress` 의 path-level setShared 가 **hardcoded** `battles:${code}:players:${S.userId}`.
v58 에서 `_battleFetchRoom`/`_battleSaveRoom` 는 `_battleState.roomPath` 로 일반화됐는데 `_battleSubmitProgress` 만 빠짐.
→ 공개 lobby 매치 (path: `lobby:matches:<mid>`) 에서 모든 player 의 `finished:true` PUT 이 잘못된 경로 로 가서 실제 매치에 반영 안 됨 → `allDone` 영구 실패 → status 전환 안 됨 → 영구 wait-others.

부차 결함 3: last-player race / SSE answeredThisQ 단락 / 자가 회복 부재.

### B. 4 갈래 fix
1. **Path 일반화** — `_battleSubmitProgress` 의 basePath = `_battleState.roomPath || 'battles:'+code`
2. **Self-merge** — last-player race 대응. fresh.players spread + 자기 payload 우선
3. **SSE 분기 재정렬** — `status==='finished'` 를 `playing` 보다 먼저 평가 + `inWaitOthers` 단락 비활성
4. **Watchdog** — `renderBattleGame` 에 idempotent status flip retry
5. **(보조) 수동 비상 종료** — wait-others 화면에 30/45초 stale alert + 매치 종료 버튼

### C. 검증
- test-v60.js 44/44 PASS (8 섹션, 4 시나리오 sandbox 시뮬레이션)
- test-v56/57/59 도 실행 — 의도된 reversal (APP/CACHE_VERSION) 외 invariant 보존

### D. 솔직한 한계
- 4 fix 는 layered defense. 운영 환경에서 어느 갈래가 발동되는지 통계 부재 (Feedback 운영 UI 가 갖춰지면 측정 가능)
- 비상 종료 버튼의 잠재적 악용 (외부 공개 시 정정 필요)
- Self-merge 는 자기 자신만 보정. 다른 player 의 stale 은 그들의 watchdog 또는 SSE 다음 tick 이 처리

---

## v61 우선순위

### 1순위: 원문 코퍼스 확장 (v60 세션에서 후보 도출 완료)

현 corpus 45 작품 중 26 작품이 NT 코이네. 고전 그리스어 정전 결손 — 다음 작가 *전체 부재*:
- **Euripides** (셋째 대비극가)
- **Aristophanes** (Plato Apology §19 의 직접 reference)
- **Thucydides** (역사 서술의 양대 산맥 중 하나)
- **Demosthenes**, **Aristotle**, **Lysias**
- **Sappho · Pindar** (학자 낭독 도서관엔 있으나 본문 WORKS 엔 없음)
- **Plato Phaedo** (소크라테스 4부작의 마지막)
- **Hippocratic Oath** (정전 윤리 텍스트)

v60 세션 제안 6 작품 / 10 섹션 신규:

| 작가 | 작품 | 섹션 | 학술적 근거 |
|---|---|---|---|
| Euripides | *Medea* 1-100 (Prologue) | 2 | 가장 유명한 도입부, Nurse 의 ἧς γὰρ κατέστην... |
| Aristophanes | *Clouds* 1-100 | 2 | Plato Apology §19 의 reference, 짝 학습 |
| Thucydides | *Histories* 1.1-5 (Archaeology) | 2 | "Θουκυδίδης Ἀθηναῖος συνέγραψε..." |
| Plato | *Phaedo* §57-60 | 2 | 트릴로지 완결 (Euthyphro → Apology → Crito → **Phaedo**) |
| Sappho | fr.1 (To Aphrodite) + fr.31 | 1 | 서정시 신장르 (현 corpus 는 epic·drama·prose 만) |
| Hippocrates | *Oath* | 1 | 짧고 정전, 학습 부담 작음 |

총 ~5-6 KB Greek text 추가, 모두 Perseus Digital Library (PerseusDL/canonical-greekLit) 기반.

`data-works.js` 의 `WORKS` 배열 확장. `index.html`/`sw.js` 의 UI 코드 변경 없음 (스키마 호환).

검증: id 유니크 · 그리스 문자 비율 95%+ · ALL_VOCAB 어휘 교집합 통계 · 신규 lemma 가 MORPH_LOOKUP 에 얼마나 커버되는지.

### 2순위: 정역 확장 (v53 부터 누적)

신규 작품 6 의 정역 큐레이션 함께 진행 가능:
- Euripides Medea 1-25 (Nurse 독백 시작)
- Sappho fr.31 ("φαίνεταί μοι..." — 가장 유명한 lyric)
- Hippocratic Oath 전문 (~250자, 의대생 학습 가치)
- 기존 누적 항목: Apology §23-26, Iliad 1.151-200+, Sophocles Oedipus 1-100, Plato Crito §44-47

`data-translations.js` 확장 ~400 lines.

### 3순위 이하 (defer 유지)
- 매치 진행 중 ghost player 정리 (v60 의 자동·수동 종료는 *증상* 완화. 진정한 cleanup 별도)
- 추가 게임 모드 (Ἀκόντισμα 등)
- 재연결 시 인트로 컷 재진입 옵션
- BGM 확장
- Feedback 운영 UI · Presence 통계
- 캐릭터 명언 TTS 자동 발화
- 사진 prefetch (50/50 검증 완료, 즉시 효과)
- 캐릭터 잠금 시스템
- PARADIGM_LIB 분사·비교급 확장
- μι-동사 quiz 통합
- AI 기반 정역 (Anthropic API)
- Firebase Auth 통합
- 자가진단 modal 의 자동 룰 PUT

### 영구 제외
- 다국어 UI (i18n)

### 외부 의존 (새 정보 없으면 진척 불가)
- SoundCloud rhapsodoi slugs 검증
- Plato Crito Stratakis 무료 샘플 URL
- ScorpioMartianus Ancient Greek Alive 001 호스트 확인
