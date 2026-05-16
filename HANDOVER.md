# Ἑλληνικὴ Παιδεία — CIM Lab 인수인계

본 문서는 CIM Lab에서 운영하는 고전 그리스어 학습 Progressive Web App (PWA) 의 기술적 인수인계를 위한 자료다. 신규 합류 구성원이 별도 컨텍스트 없이도 코드베이스를 이해하고 유지·확장할 수 있도록 작성했다. 최종 갱신 **v55 (2026년 5월)**.

> **다음 작업자에게**: §7 라운드별 changelog 의 *맨 마지막 항목 (v55)* 이 현재 상태다. 그 위 라운드들은 어떻게 여기까지 왔는지의 기록. 새 작업을 시작하기 전에 §7 의 가장 최근 항목과 §0 의 현재 스냅샷을 먼저 읽기.

## 0. 현재 상태 스냅샷 (v55, 2026-05)

**배포 산출물**: `index.html` (~895 KB, IIFE 약 410K chars, 14.6K lines) · `sw.js` · `data-works.js` (3 MB, 45 작품 545 섹션) · `data-morph.js` (4 MB, AGDT v2.1 37K 어형 11.8K lemma) · `data-dialogues.js` (45 KB, 10 콩트 시나리오) · `data-translations.js` (~55 KB, v53 확장 — 19 발췌 정역 ~330 문장 + 34 짧은 발췌 정역) · **`data-characters.js` (~16 KB, v55 완결 — 50 캐릭터 전원의 검증된 Wikimedia Commons 사진 메타데이터)** · `espeakng.worker.js` (760 KB) · `manifest.json` · `reset.html`.

**기능 카탈로그**:
- 어휘 학습: 교재 어휘 + DCC 523 + DAILY_W 51 + CIVIC_W 80 + 콩트 vocab 60 = 1142 어휘
- 문법 토픽: 41개 (decl/verb/particle/prep 4 카테고리)
- 콩트 시나리오: 10편 · 84 turns
- 원문 읽기: 45 작품 545 섹션, AGDT 형태분석은 Iliad 1 · Odyssey 1 · Persae 만
- 학자 낭독 매칭: 본문 7 작품 (plato-apology · xenophon-anabasis-1 · hesiod-theogony · herodotus-1 · homer-iliad-1 · homer-odyssey-1 · plato-euthyphro)
- 학자 낭독 도서관 (Ἀκρόασις): 20 자료 · 9 카테고리 (본문 외 작가·작품)
- 본문-학자 낭독 시간 동기: 3 자료 (Anabasis 11 단락, Theogony 21 행, Herodotus 14 단락 × 4 섹션) · 정확도 ±3-5초
- 발음 모드: 4종 (eSpeak NG · 현대 헬라어 · Erasmian · 복원 Attic) + Stratakis/SORGLL/Projet Homere/Ariphron 학자 발음 비교
- 학습 모드: 어휘 quiz (객관식·타이핑) · 받아쓰기 (Ἀκοή) · 악센트 학습 (Τόνος) · 옥시톤 분류 quiz · 검색·콘코던스 (Εὕρεσις) · 변화표 만들기 + 빈칸 채우기 시험 (Παράδειγμα) · 배틀 모드 · 오답함 SRS
- 변화표: 76 표제어 큐레이션 (55 명사 · 12 형용사 · 9 대명사) — Smyth/Goodwin 표준형, AGDT v2.1 실제 어형과 자동 결합 표시, 빈칸 채우기 시험 모드 (NFD/ς-σ 관용 채점, 액센트 정확 ★ 마킹)
- **캐릭터 (Παίγνια · v52 신규)**: **50 캐릭터** SVG 메달리온 (12 올림포스 신 · 12 영웅 · 8 여신/여성 영웅 · 10 철학자 · 8 시인·역사가·정치가). 카테고리별 그라데이션 팔레트 · 32 심볼 · 그리스 이니셜 + 한국어 호칭. 홈·프로필·명예의 전당·라이브 순위·멀티 배틀 5 위치에 표시. **v55: 50 캐릭터 전원이 Wikimedia Commons 사진 표시** (v54 의 41/50 + v55 신규 9: diomedes · orpheus · aeneas · penelope · atalanta · medea · empedocles · herodotus · solon). 모든 파일명은 Wikimedia 카테고리 페이지 listing 에서 검증된 실존 파일만 사용 — v53 의 추측 오류 (broken-image 23 개) 완전 해소.
- **원문 해석 (Ἑρμηνεία · v52 신규, v53 확장)**: 본문 읽기에 📖 해석 토글. 큐레이션 정역 13 발췌 (Iliad 1.1-50/1.51-100 · Odyssey 1.1-50/1.51-100 · Plato Apology §17/§18/§19/§20/§21/§22 · Plato Crito §43 · Herodotus 1.1 · Hesiod Theogony 1-50) + 짧은 발췌 34편 (`data-translations.js` 별도 파일) + ALL_VOCAB/MORPH_LOOKUP 기반 단어 풀이 폴백. 문장 단위 표시 (.sent[data-sent-idx] 그룹화). 모든 발췌의 sentence 카운트가 renderer 의 `[.;·?!]` 정규식과 일치하도록 검증.
- 접근성: aria-label 35 · title 18 · greek lang attr 자동화
- 다중 프로필 · 명예의 전당 · 책갈피·메모

**핵심 데이터 인덱스**:
- 어휘: `TEXTBOOK_W`, `DCC_W`, `DAILY_W`, `CIVIC_W` + `ALL_VOCAB` 통합
- 작품·섹션: `WORKS` (data-works.js 에서 정의)
- 형태분석: `MORPH_LOOKUP` (data-morph.js, 비동기 lazy-load)
- 문법 토픽: `TOPICS` 배열 (41)
- 변화표 라이브러리: `PARADIGM_LIB` 객체 (76 표제어, index.html line 3385~)
- 콩트: `DIALOGUES` (data-dialogues.js)
- 학자 낭독: `SCHOLAR_AUDIO` (본문 매칭) + `SCHOLAR_LIBRARY` (도서관)
- 악센트 분류: `_classifyAccent()` 함수 (NFD 기반 다이아크리틱 분석)
- **캐릭터 라이브러리 (v52)**: `CHARACTERS` (50 항목) · `CHARACTERS_BY_ID` 인덱스 · `CHAR_SYMBOLS` (32 SVG path) · `CHAR_PALETTES` (5 카테고리) · `_charMedallion(idOrObj, size)` 렌더러
- **정역 라이브러리 (v52)**: 별도 파일 `data-translations.js` 가 `window.WORK_TRANSLATIONS` (5 발췌, `workId:secN` → 문장 인덱스 배열) + `window.READING_TRANSLATIONS` (12 짧은 발췌) 노출. index.html 의 IIFE 가 `window.WORK_TRANSLATIONS` 를 캡처 (없으면 빈 객체 폴백). 헬퍼: `_getCuratedTranslation()` 조회 · `_buildLiteralGloss()` 단어 풀이 폴백 · `_applyTranslationDisplay()` DOM 삽입

**현재 미해결·defer 상태** (§7 의 v55 끝 defer 블록 참조):
- 외부 의존 3 항목 (SoundCloud slugs · Plato Crito sample · ScorpioMartianus) — 새 정보 없음
- 단어 단위 시간 동기 (현재 행/단락 — 더 정밀은 큰 측정 부담)
- plato-apology Stratakis cue points 측정 (mp3 길이 미확정으로 보류)
- PARADIGM_LIB 확장 — 비교급·최상급 형용사, 분사 (현재 명사·형용사·대명사만)
- μι-동사 가정법/희구법 quiz 통합 (v50 의 5 표는 학습만, Παράδειγμα 시험과 별개)
- **정역 확장 (v53)**: 현재 19 발췌 큐레이션 (data-translations.js). 나머지 ~525 섹션은 단어 풀이 폴백. 다음 우선순위 (v56 권장): Plato Apology §23-26 (변론 마무리), Iliad 1.151-200+ (외교 시도), Sophocles Oedipus 1-100, Plato Crito §44-47
- **캐릭터 잠금 시스템 (v52)**: 현재 모든 50 캐릭터 즉시 선택 가능. XP/배지/완독 기반 점진 잠금 해제는 다음 라운드 후보 (학습 동기 부여)
- **캐릭터 사진 prefetch (v53 의 defer)**: 사용자가 picker 열기 전에 50 사진 미리 캐시 (`<link rel=prefetch>` 또는 SW pre-cache). 첫 picker 열림 속도 개선용. v55 에서 50/50 사진이 모두 검증되어 prefetch 의 효과가 명확해짐.
- **캐릭터 사진 라이선스 정밀화 (v53 의 defer)**: 일부 CC BY 사진 (회화) 의 attribution 화면 표시. 현재는 caption 필드의 작가/박물관 명시로 *사실상의 attribution*.

**영구 제외** (사용자 정책):
- 다국어 UI (i18n)

## 1. 프로젝트 개요

본 앱은 고전 그리스어(주로 5–4세기 BCE Attic, 일부 Ionic·Doric·Aeolic·Homeric·Koine) 학습용 PWA다. 단일 HTML 파일에 모든 기능이 포함된 self-contained 구조이며, 외부 의존성은 (a) 그리스어 형태소 데이터 (AGDT 19,875 lemma), (b) 표준 그리스어 전집 텍스트, (c) eSpeak NG WASM 음성 합성 엔진 셋이다.

핵심 기능은 어휘 학습 (교재 단위 및 DCC core vocabulary 523), 문법 토픽 학습, 원문 읽기 (전집 + 발췌), 배틀 모드 (시간제 객관식), 오답함 SRS, 명예의 전당, 다중 프로필, 그리고 4종 발음 시스템 (eSpeak NG · 현대 헬라어 · Erasmian · 복원 Attic) 이다.

타깃 사용자는 CIM Lab 구성원과 외부 학습자이며, 주요 사용 플랫폼은 iOS Safari (한국 iPad 환경 우선 검증) 와 데스크탑 Chromium 계열이다.

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

**(3) HANDOVER 동봉 정책 (재확인)**: 사용자 지시 *"인수인계도 매 세션 같이 보내"* (v53 라운드 1) + *"인수인계도 매 세션 같이 보내"* (v53 라운드 2, 재강조) → 모든 산출물 패키지에 `HANDOVER.md` 동봉 + `present_files` 로 HANDOVER 별도 노출. CIM Lab 다수 사용자가 본 계정을 공유하므로, 한 세션에서 산출한 zip 만 받아도 다음 세션 작업자가 즉시 컨텍스트 회복 가능.

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


## 8. 알려진 미해결 사항 및 향후 작업

표제어 (lemma) 검색·콘코던스 기능이 아직 없다. 사용자가 단어를 클릭하면 형태 분석이 modal 로 표시되나, 그 단어의 다른 출현 위치를 탐색하는 기능은 미구현. `data-morph.js` 의 19,875 lemma 인덱스를 활용한 역방향 검색이 자연스러운 다음 단계.

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

— *finis*
