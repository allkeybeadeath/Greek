# 다음 라운드 작업 계획 (v60 ~)

*현재 상태*: **v59 빌드 완료** (멀티 배틀 silent failure 차단 + Firebase 자가진단 도구 + README 룰 안내 갱신). paideia-pwa-v59.zip 배포.

*세션 정책*:
- 다국어 UI (i18n) 는 **작업 범위에서 영구 제외** — 사용자 지시 (v49 세션).
- **인수인계 (HANDOVER.md) 를 매 라운드 산출물에 동봉** — 사용자 지시 (v53 세션).
- **Wikimedia 파일명 추측 금지** (v54~v55 의 교훈) — 카테고리 페이지 listing 의 *실존 파일명* 만 채택.
- **PD 원전 인용 검증** (v56 의 교훈) — 명언·정역 모두 표준 인용으로 출처 명시.
- **단발성 null 에 보수적** (v57 의 교훈) — 외부 의존의 transient 실패가 UX 를 깨뜨리지 않게 임계점·재시도 패턴.
- **단일 실패점 회피** (v58 의 교훈) — 호스트·중앙 권한자 없는 자율 시스템 선호. 매치 questions[] 같은 자료는 *시작 시점에 결정론적으로 publish* 하여 진행 중 의존성 0.
- **(v59 신규 교훈) Silent failure 0 원칙** — 외부 API 호출 (fetch/PUT/GET) 의 실패는 *반드시* `_battleLastError` 같은 진단 채널에 캡처. 호출처는 *반드시* 반환값을 검증. 사용자에게 *반드시* 명확한 메시지. 새 STORAGE 메서드 추가 시 이 패턴을 강제.
- **(v59 신규 교훈) 외부 보안 룰 변경에 안전망** — Firebase 룰 (또는 다른 백엔드의 인증 정책) 은 운영자가 변경할 수 있고, *그 시점에 클라이언트가 작동을 중단*할 수 있다. 자가진단 도구는 *현재 작동 여부* 를 확인할 수 있어야 함. 새 path 추가 시 README 룰 안내도 동시 갱신.

---

## v59 완료 사항 (참조용)

사용자 보고 *"여전히 방만들기 오류, 큐 입장도 안됨. 문제해결."* 처리.

### A. Root cause 진단 (코드 정밀 분석)

v52 이후 추가된 Firebase RTDB 신규 path 들 (`battles:<code>` · `lobby:waiters:<uid>` · `lobby:matches:<mid>` · `feedback:*` · `presence:*`) 이 **README v2 의 권장 룰** (`lb` 만 허용) 로는 차단된다. 사용자의 Firebase 프로젝트가 이 상태로 보임.

추가로 **코드 내부 silent failure 두 군데**:
1. `BACKEND.setShared` 가 `r.ok=false` 일 때 진단 정보 0
2. `_battleSaveRoom` / `_lobbyPingWaiter` / `_lobbyStartMatch` 가 반환값 미검증

이 둘이 결합되어 사용자에게는 *"방 만들기 실패"* / *"큐 입장 안 됨"* 만 보이고, 원인 표시 없음.

### B. 6 갈래 fix
1. **BACKEND 3 메서드 진단 캡처** — HTTP status + body 200자 + `isPermissionDenied` (401/403) 를 `window._battleLastError` 에 기록
2. **호출처 반환값 검증** — `_battleSaveRoom` / `_lobbyPingWaiter` / `_lobbyStartMatch` 모두 `if(!res)` 분기 + 사용자 토스트
3. **`_battleHandleUpdate` justCreated grace period** — `BATTLE_JUST_CREATED_GRACE_MS=5000` + `_battleState.justCreatedAt`. 호스트 본인이 막 만든 방의 첫 fetch transient null 흡수 (Firebase eventual consistency 대비)
4. **`_lobbyEnterQueue` 낙관적 UI** — phase='waiting' 직후 자기를 waiters 에 즉시 추가 (`_optimistic: true` 마커) + `_lobbyDraw()` 호출. setShared 실패 시 phase='idle' 롤백 + 자기 제거 + 명확한 토스트
5. **진단 modal Firebase 자가진단 (`#diag-firebase-test`)** — 6 경로 (battles · lobby:waiters · lobby:matches · lb · feedback · presence) 각각 PUT/GET/DEL 시도. verdict allWriteOk / allDenied / partialDenied 로 분기 + 권장 룰 JSON inline 표시
6. **README §3 룰 안내 갱신** — `lb` 만 허용 → `.read/.write: true` 루트 허용 (연구실 내부용). 이전 룰의 위험성 명시

### C. 부수
- toast 시그니처 확장 (`(msg, typeOrDuration, duration)` — 숫자면 duration, 문자열이면 type). backward compatible
- APP/CACHE_VERSION v58 → v59
- test-v59.js 신규 (~180 lines, 43 assertions — 13 섹션 · sandbox eval)

### D. 솔직한 한계
- v59 의 fix 들은 **root cause 자체는 해결 안 함**. 사용자가 Firebase Console 에서 룰을 갱신해야 함. v59 가 한 일은 (a) 진단 명확화, (b) 자가진단 modal 의 권장 룰 inline 표시, (c) README 갱신. **사용자에게 가장 빠른 해결책은 README §3 의 권장 룰 (혹은 자가진단 modal 의 inline 룰) 을 Firebase Console 에 붙여넣고 Publish**.
- 진단 modal 의 자가진단은 *현재 시점* 만 확인. 룰 갱신 후 약 5-10초 propagation 지연.
- BACKEND 의 진단 캡처는 *직전 호출만* `_battleLastError` 에 저장 — 동시 다발 setShared 시 마지막 것만 남음 (자가진단은 순차라 영향 없음).
- 낙관적 UI 의 `_optimistic: true` 마커는 현재 표시 분기에 활용 안 함 — _lobbyTick 의 실제 데이터로 자연스럽게 덮어쓰임.

---

## v60 우선순위 (사용자 보고 없을 시 자연스러운 다음 라운드)

### 1순위: 정역 확장 (v53 부터 누적 defer)
가장 큰 학습 가치. 19 발췌 → 25 발췌 목표:
- **Plato Apology §23-26** (변론 마무리 — v52~v53 의 §17-22 연속, 자연스러운 흐름)
- **Iliad 1.151-200+** (외교 시도 — v53 의 §1.101-150 연속)
- **Sophocles Oedipus 1-100** (안티고네에 이은 두 번째 비극)
- **Plato Crito §44-47** (탈출 권유 본격화 — v53 의 §43 연속)
- (선택) Aeschylus Agamemnon 1-100 또는 Euripides Medea 1-100

`data-translations.js` 확장 ~310 lines. 학자 정역 (강대진·천병희·정암학당) 참고하되 학습 보조 작업 번역으로 명시.

### 2순위: 매치 진행 중 ghost player 정리
v58 의 lobby waiters cleanup 과 별개. 코드방·lobby 매치 진행 중 모바일 백그라운드/탭 닫기 시 player 객체가 방에 잔존. 결과 화면의 stale 표시만 영향.

구현: `presence:battle:<roomPath>:<uid>` 별도 키 + 30초 TTL + visibilitychange 시 즉시 삭제. `renderBattleGame` 의 점수보드 렌더가 stale player 필터링.

### 3순위 이하 (defer 유지)
- 추가 게임 모드 (v58 의 plug-in 골격 활용) — Ἀκόντισμα (속도전) 가성비 가장 좋음
- 재연결 시 인트로 컷 재진입 옵션
- BGM 확장 (음량 슬라이더, 추가 모드)
- Feedback 운영 UI · Presence 통계
- 캐릭터 명언 TTS 자동 발화
- 사진 prefetch (50/50 검증 완료, 즉시 효과)
- 캐릭터 잠금 시스템 (XP/배지/완독 기반)
- PARADIGM_LIB 분사·비교급 확장
- μι-동사 quiz 통합
- AI 기반 정역 (Anthropic API)
- **(v59 신규) Firebase Auth 통합** — 외부 공개 시 보안 강화
- **(v59 신규) 자가진단 modal 의 자동 룰 PUT** — Admin API 통합 (service account 키 노출 위험)

### 영구 제외
- 다국어 UI (i18n)

### 외부 의존 (새 정보 없으면 진척 불가)
- SoundCloud rhapsodoi slugs 검증
- Plato Crito Stratakis 무료 샘플 URL
- ScorpioMartianus Ancient Greek Alive 001 호스트 확인
