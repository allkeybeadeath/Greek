# v61 — 1차 정리 (CIM Lab 제거 · 잔재 파일 제거)

작성: 2026-05-19 · 개인 프로젝트

## 변경

### 1. 무관 프로젝트 잔재물 38개 파일 제거

업로드 zip 안에 이전 한약 학습 PWA (`方劑學`) 의 파일이 다수 혼재해 있었다. `index.html` 이 참조하지 않으며, 본 앱과 무관한 고아 파일이므로 일괄 제거.

- 코드: `app.js` (320KB · 한약 앱 메인), `admin-reset.html` (한약 앱 관리자 페이지)
- 데이터: `data-physicians.js`, `data-formulas.js`, `data-syndromes.js`, `data-factions.js`, `data-ranks.js`, `data-questions-bulk.js`
- 사진 30+ 장: `chaoyuanfang.jpg`, `chengguopeng.jpg`, `heojun.jpg`, `leejema.jpg`, `shennong.png` 외 다수 한·중 의가 인물 사진

`index.html` 의 `<script src>` 목록은 그대로 유지: `data-works.js`, `data-dialogues.js`, `data-translations.js`, `data-characters.js`, `data-morph.js` (지연 로드). 영향 없음.

### 2. CIM Lab 표기 일괄 제거

운영 주체가 더 이상 존재하지 않으므로 모든 노출·주석·문서에서 제거. 본 앱은 이제 개인 프로젝트.

- `index.html`: 헤더 `<span class="sub">CIM Lab</span>` → `고전 그리스어 학습` · DCC 주석 · 프로필 주석 · 프로필 UI 안내문 · 피드백 modal 주석 · 백업/가져오기 안내문
- `README.md`: 인트로 한 줄 · 라이선스 섹션
- `HANDOVER.md`: 제목 · §0 인트로 · §1 타깃 사용자 · §7 정책 메모 · §13 운영자 노트
- `CHANGELOG_v4/v6/v7.md`: 푸터 작성자 표기

### 3. 버전

`APP_VERSION` v60 → v61 · `CACHE_VERSION` v60 → v61.

## 다음 세션에서 이어갈 작업

### A. 오늘의 단어 (Word of the Day)

`renderHome` (~line 6151) 에 신규 카드. `DAILY_QUOTES` 옆 또는 `오늘의 빠른 복습` 위.

- 결정론적 인덱싱: `dayOfYear = Math.floor((Date.now() - new Date(yr,0,0)) / 86400000)` · `idx = dayOfYear % POOL.length`
- 풀: `TEXTBOOK_W` 의 lesson 3~8 (초보자 적합 단어 ~120개) 또는 별도 `DAILY_W` 큐레이션
- 카드 내용: 큰 그리스어 표기 + 한국어 + 품사·기본형 · "발음 듣기" 버튼 (기존 `speakGreek`) · "이 단어 시험" 버튼 (어휘 quiz 시작)
- `S.dailyWordStreak` 으로 연속 확인일 추적 (선택)

### B. 초보자용 일일 진도 커리큘럼

가장 큰 작업. 핵심 결정 사항:

1. **데이터 구조**: 새 상수 `BEGINNER_CURRICULUM = [{day, grkTitle, koTitle, desc, tasks: [...], estMin}]`
2. **1~5일차 신규 콘텐츠 필요**: 알파벳 4분할 + 발음·기식·강세 (현재 `TOPICS` 에 알파벳 토픽이 없음)
3. **6~60일차 매핑**: 기존 38과 (3~40과) 를 일 단위로 분배. 한 과당 평균 1.5일 (어휘 5~8개 + 문법 토픽 1개 + 짧은 읽기 1꼭지)
4. **상태**: `S.curriculumDay` (현재 일차) · `S.curriculumDone[day] = {completedAt, score}` · 완주 시 배지
5. **UI**:
   - 홈 화면 상단에 큰 카드 (오늘의 진도 N일차) — 진행률 바 포함
   - 새 탭 또는 `setTab('curriculum')` 진입점 — 일별 카드 리스트, 잠금 (전날 완료해야 다음 일 활성)
   - 각 일차 진입 시 단계별 안내 → 어휘 학습 → 문법 토픽 → 짧은 시험 → 완료 표시
6. **하단 nav 변경 검토**: 현재 5탭 (홈·어휘·문법·원문·명예). 커리큘럼이 핵심 기능이 되면 `홈` 자리에 통합하거나, `명예` 와 위치 교체 고려.

권장 순서: 데이터 구조 정의 → 1~5일차 콘텐츠 작성 → 6~20일차 매핑 → renderCurriculum → 홈 통합 → 잠금/완료 로직 → 21~60일차 매핑.

## 알려진 미해결 (v60 에서 이월, 본 세션 미처리)

`HANDOVER.md` §0 의 "현재 미해결·defer 상태" 블록 전체 그대로 이월. v61 은 정리 작업만 수행, 신규 기능 없음.
