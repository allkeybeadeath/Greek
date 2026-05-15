# Ἑλληνικὴ Παιδεία — CIM Lab 인수인계

본 문서는 CIM Lab에서 운영하는 고전 그리스어 학습 Progressive Web App (PWA) 의 기술적 인수인계를 위한 자료다. 신규 합류 구성원이 별도 컨텍스트 없이도 코드베이스를 이해하고 유지·확장할 수 있도록 작성했다. 최종 갱신 v40 (2026년 5월).

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
