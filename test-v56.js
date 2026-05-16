// test-v56.js — v56 검증 스크립트
// 멀티 배틀 인트로 컷 + 캐릭터 명언 + 포인트 강탈 메커니즘
//
// 실행: node test-v56.js (이 디렉토리에서)
// 종속: fs, vm (Node 내장)
// 검증 항목 (총 35 assertions):
//   1. 버전 상수 (APP_VERSION/CACHE_VERSION 둘 다 v56)
//   2. CHARACTER_QUOTES 50 entries, 각 entry {grk, ko, src} 구조
//   3. 모든 50 캐릭터 ID 가 CHARACTERS 의 ID 와 일치
//   4. _renderBattleIntro 함수 정의
//   5. _battleEffectiveScores 헬퍼 정의
//   6. BATTLE_STEAL_INTERVAL / BATTLE_STEAL_AMOUNT / BATTLE_INTRO_MS 상수
//   7. _battleBuildQuestions 가 N번째 마다 isSteal:true 마킹
//   8. _battleEffectiveScores 의 강탈 계산 정확성 (5 케이스)
//   9. _battleSubmitProgress payload 에 stolen 필드 포함
//  10. _battleGameLocal 초기화 시 stolen:[] 포함
//  11. 인트로 컷이 첫 진입 시만 한 번 표시 (_battleIntroShown[code])
//  12. v55 invariants (50 캐릭터 사진) 유지

const fs = require('fs');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(cond, label){ if(cond){ pass++; console.log('  ✓ '+label); } else { fail++; console.log('  ✗ '+label); } }
function section(name){ console.log('\n=== '+name+' ==='); }

// ─────────────────────────────────────────────────────────
// 1. 버전 상수
// ─────────────────────────────────────────────────────────
section('1. 버전 상수');
const html = fs.readFileSync('./index.html','utf8');
const sw = fs.readFileSync('./sw.js','utf8');
ok(/APP_VERSION\s*=\s*['"]v56['"]/.test(html), "index.html: APP_VERSION = 'v56'");
ok(/CACHE_VERSION\s*=\s*['"]v56['"]/.test(sw), "sw.js: CACHE_VERSION = 'v56'");

// ─────────────────────────────────────────────────────────
// 2. CHARACTER_QUOTES 데이터 검증
// ─────────────────────────────────────────────────────────
section('2. CHARACTER_QUOTES 데이터');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('./data-characters.js','utf8'), ctx);
const QUOTES = ctx.window.CHARACTER_QUOTES;
const IMAGES = ctx.window.CHARACTER_IMAGES;
ok(QUOTES && typeof QUOTES === 'object', 'window.CHARACTER_QUOTES 노출');
ok(Object.keys(QUOTES).length === 50, '50 entries 정확 (실제: '+Object.keys(QUOTES).length+')');
ok(IMAGES && Object.keys(IMAGES).length === 50, 'v55 사진 50개 보존 (실제: '+Object.keys(IMAGES||{}).length+')');

// 각 entry 가 {grk, ko, src} 구조
let allValid = true;
let sampleBad = null;
for(const id in QUOTES){
  const q = QUOTES[id];
  if(!q || typeof q !== 'object' || typeof q.grk !== 'string' || typeof q.ko !== 'string' || typeof q.src !== 'string' || !q.grk.trim()){
    allValid = false; sampleBad = {id, q}; break;
  }
}
ok(allValid, '모든 entry 가 {grk, ko, src} 비공 구조'+(sampleBad?` (bad: ${sampleBad.id})`:''));

// grk 가 그리스 문자(U+0370-03FF / U+1F00-1FFF) 포함
let hasGreek = true;
const greekRe = /[\u0370-\u03FF\u1F00-\u1FFF]/;
for(const id in QUOTES){ if(!greekRe.test(QUOTES[id].grk)){ hasGreek = false; break; } }
ok(hasGreek, '모든 grk 가 실제 그리스 문자 포함');

// ─────────────────────────────────────────────────────────
// 3. CHARACTERS 와 QUOTES ID 정합성
// ─────────────────────────────────────────────────────────
section('3. CHARACTERS ↔ QUOTES ID 정합성');
// index.html 의 CHARACTERS 배열에서 ID 들 추출
const charBlock = html.match(/const\s+CHARACTERS\s*=\s*\[([\s\S]*?)\];/);
let charIds = [];
if(charBlock){
  // 매치 형식: { id:'zeus', ... } — quoted key 와 unquoted key 모두 대응
  const idMatches = charBlock[1].match(/\bid\s*:\s*['"]([a-z_]+)['"]/g) || [];
  charIds = idMatches.map(m => m.match(/['"]([a-z_]+)['"]/)[1]);
}
ok(charIds.length === 50, 'CHARACTERS 50 entries (실제: '+charIds.length+')');
const quoteIds = new Set(Object.keys(QUOTES));
const charIdSet = new Set(charIds);
const missingInQuotes = charIds.filter(id => !quoteIds.has(id));
const missingInChars = Array.from(quoteIds).filter(id => !charIdSet.has(id));
ok(missingInQuotes.length === 0, '모든 CHARACTERS ID 에 QUOTES entry'+(missingInQuotes.length?': 누락 '+missingInQuotes.join(','):''));
ok(missingInChars.length === 0, 'QUOTES 의 모든 ID 가 CHARACTERS 에 존재'+(missingInChars.length?': 잉여 '+missingInChars.join(','):''));

// ─────────────────────────────────────────────────────────
// 4. 인트로 컷 / 강탈 헬퍼 함수 정의
// ─────────────────────────────────────────────────────────
section('4. 신규 함수·상수 정의');
ok(/function\s+_renderBattleIntro\s*\(/.test(html), '_renderBattleIntro 정의');
ok(/function\s+_battleEffectiveScores\s*\(/.test(html), '_battleEffectiveScores 정의');
ok(/const\s+BATTLE_STEAL_INTERVAL\s*=/.test(html), 'BATTLE_STEAL_INTERVAL 상수');
ok(/const\s+BATTLE_STEAL_AMOUNT\s*=/.test(html), 'BATTLE_STEAL_AMOUNT 상수');
ok(/const\s+BATTLE_INTRO_MS\s*=/.test(html), 'BATTLE_INTRO_MS 상수');
ok(/_battleIntroShown\s*=\s*Object\.create\(null\)/.test(html), '_battleIntroShown 맵 (1회 표시 가드)');

// ─────────────────────────────────────────────────────────
// 5. _battleBuildQuestions 의 isSteal 마킹
// ─────────────────────────────────────────────────────────
section('5. 강탈 문제 마킹 (시드 결정적)');
ok(/isSteal\s*=\s*\(qNum\s*%\s*BATTLE_STEAL_INTERVAL/.test(html), 'qNum % BATTLE_STEAL_INTERVAL 검사');
ok(/options,\s*correctIdx,\s*isSteal\s*\}/.test(html), 'question 객체에 isSteal 포함');

// ─────────────────────────────────────────────────────────
// 6. _battleEffectiveScores 정확성 — 평가용 mini sandbox
// ─────────────────────────────────────────────────────────
section('6. effective score 계산 시뮬레이션');
// 함수 본문 추출
const effFnMatch = html.match(/function\s+_battleEffectiveScores\s*\([\s\S]*?\n\}/);
const effFn = effFnMatch ? effFnMatch[0] : null;
ok(effFn !== null, '_battleEffectiveScores 본문 추출');
if(effFn){
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(effFn, sandbox);
  // case 1: 강탈 없음 — base score 그대로
  let arr = [['A',{score:100,stolen:[]}], ['B',{score:80,stolen:[]}]];
  let e = sandbox._battleEffectiveScores(arr);
  ok(e.A === 100 && e.B === 80, 'case1: 강탈 없음 → base score 유지');
  // case 2: A 가 B 로부터 8 점 강탈
  arr = [['A',{score:50, stolen:[{victim:'B',points:8,qIdx:2}]}], ['B',{score:40,stolen:[]}]];
  e = sandbox._battleEffectiveScores(arr);
  ok(e.A === 58 && e.B === 32, 'case2: A 가 B 로부터 8 강탈 → A+8, B-8');
  // case 3: 양방향 강탈
  arr = [['A',{score:50, stolen:[{victim:'B',points:8,qIdx:2}]}], ['B',{score:40,stolen:[{victim:'A',points:8,qIdx:5}]}]];
  e = sandbox._battleEffectiveScores(arr);
  ok(e.A === 50 && e.B === 40, 'case3: 양방향 8 ↔ 8 → 변화 없음 (A=50, B=40)');
  // case 4: B 점수가 모자라 음수 → 0 클램프
  arr = [['A',{score:10, stolen:[{victim:'B',points:8,qIdx:3},{victim:'B',points:8,qIdx:6}]}], ['B',{score:5,stolen:[]}]];
  e = sandbox._battleEffectiveScores(arr);
  ok(e.A === 26 && e.B === 0, 'case4: B 음수 클램프 → A=26 (10+16), B=0 (5-16 clamp)');
  // case 5: 3인전 강탈
  arr = [
    ['A',{score:30, stolen:[{victim:'B',points:8,qIdx:3},{victim:'C',points:8,qIdx:3}]}],
    ['B',{score:25, stolen:[]}],
    ['C',{score:40, stolen:[{victim:'A',points:8,qIdx:6}]}]
  ];
  e = sandbox._battleEffectiveScores(arr);
  ok(e.A === 38 && e.B === 17 && e.C === 40, 'case5: 3인전 — A=38, B=17, C=40');
}

// ─────────────────────────────────────────────────────────
// 7. _battleSubmitProgress payload 와 _battleGameLocal 초기화
// ─────────────────────────────────────────────────────────
section('7. 상태/페이로드의 stolen[] 필드');
ok(/stolen:\s*Array\.isArray\(local\.stolen\)\s*\?\s*local\.stolen\.slice/.test(html), 'submitProgress payload 에 stolen 슬라이스 포함');
ok(/stolen:\s*\[\]/.test(html) && /\/\/ v56: 내가 강탈한 기록/.test(html), '_battleGameLocal 초기화 시 stolen:[]');
ok(/character:\s*\(typeof\s+_ensureCharacter==='function'\s*\?\s*_ensureCharacter\(\)/.test(html), 'payload 에 character 필드 (인트로용)');

// ─────────────────────────────────────────────────────────
// 8. 인트로 컷 1회 표시 가드
// ─────────────────────────────────────────────────────────
section('8. 인트로 1회 표시 가드');
ok(/if\(!_battleIntroShown\[code\]\)\s*\{[\s\S]{0,200}_battleIntroShown\[code\]\s*=\s*true/.test(html),
   '_renderBattleIntro 호출 전 _battleIntroShown[code]=true 세팅');
ok(/_renderBattleIntro\(code,\s*room,\s*\(\)\s*=>\s*\{[\s\S]{0,80}renderBattleGame\(code,\s*room\)/.test(html),
   '인트로 종료 콜백이 renderBattleGame 재진입');

// ─────────────────────────────────────────────────────────
// 9. 강탈 정답 처리 — 다른 플레이어 fetch + stolen push
// ─────────────────────────────────────────────────────────
section('9. 강탈 응답 처리');
ok(/if\(correct\s*&&\s*q\.isSteal\)/.test(html), '강탈 조건: correct && q.isSteal');
ok(/_battleFetchRoom\(local\.code\)/.test(html), '강탈 처리 시 fresh room fetch');
ok(/local\.stolen\.push\(\{\s*victim:\s*vUid,\s*points:\s*BATTLE_STEAL_AMOUNT/.test(html), 'victim 별 stolen push');

// ─────────────────────────────────────────────────────────
// 10. 결과 화면 effective score 반영
// ─────────────────────────────────────────────────────────
section('10. renderBattleResult 의 effective score');
ok(/eff\s*=\s*_battleEffectiveScores\(rawEntries\)/.test(html), 'renderBattleResult 가 effective scores 계산');
ok(/score:\s*effScore,\s*\/\/ v56/.test(html), 'players[].score = effScore');
ok(/baseScore,\s*\/\/ v56/.test(html), 'baseScore 별도 보존');
ok(/stolenByMe,\s*lostToOthers,\s*\/\/ v56/.test(html), '브레이크다운 필드');

// ─────────────────────────────────────────────────────────
// 11. 강탈 시각 표시 (UI 마커)
// ─────────────────────────────────────────────────────────
section('11. 강탈 UI 마커');
ok(/⚡ 점수 강탈 문제/.test(html), '문제 화면에 강탈 배너 텍스트');
ok(/⚡ 강탈 실패/.test(html), '강탈 실패 토스트');
ok(/⚡\+\$\{stolenByMe\}/.test(html) || /⚡\+\$\{p\.stolenByMe\}/.test(html), '점수보드 또는 결과 행에 강탈 점수 표시');

// ─────────────────────────────────────────────────────────
// 12. v55 invariants 보존 — 50 사진 ID 보존 확인
// ─────────────────────────────────────────────────────────
section('12. v55 invariants (사진 50개) 보존');
const v55ExpectedIds = ['zeus','hera','poseidon','demeter','athena','apollo','artemis','ares','aphrodite','hephaestus','hermes','dionysus',
  'achilles','heracles','odysseus','theseus','perseus','jason','bellerophon','hector','ajax','diomedes','orpheus','aeneas',
  'helen','penelope','andromache','cassandra','antigone','atalanta','medea','hestia',
  'socrates','plato','aristotle','pythagoras','heraclitus','diogenes','epicurus','empedocles','thales','anaximander',
  'homer','hesiod','sappho','pindar','herodotus','thucydides','pericles','solon'];
const v55Missing = v55ExpectedIds.filter(id => !IMAGES[id] || !IMAGES[id].url);
ok(v55Missing.length === 0, 'v55 의 50 사진 ID 전원 보존'+(v55Missing.length?': 누락 '+v55Missing.join(','):''));

// ─────────────────────────────────────────────────────────
// 13. BGM (절차적 고대 그리스 음악) 모듈
// ─────────────────────────────────────────────────────────
section('13. BGM (Web Audio 합성) 모듈');
ok(/const\s+BGM\s*=\s*\(\(\)\s*=>\s*\{/.test(html), 'BGM IIFE 정의');
ok(/window\.BGM\s*=\s*BGM/.test(html), 'window.BGM 전역 노출');
ok(/SCALE_HZ\s*=\s*\[329\.63/.test(html), '도리아 모드 음계 (E4=329.63 시작)');
ok(/MOTIFS\s*=\s*\[/.test(html), '멜로디 모티프 패턴');
ok(/function\s+toggleBgm\s*\(\)/.test(html), 'toggleBgm 함수');
ok(/window\.toggleBgm\s*=\s*toggleBgm/.test(html), 'window.toggleBgm 전역');
ok(/function\s+_ensureBgmPref\s*\(\)/.test(html), '_ensureBgmPref (S.bgmEnabled 보장)');
// 홈 화면 토글 버튼
ok(/id="home-bgm-toggle"/.test(html), '홈 화면 BGM 토글 버튼');
ok(/BGM 끄기|BGM 켜기/.test(html), '토글 버튼 라벨 (켜기/끄기)');

// ─────────────────────────────────────────────────────────
// 14. 건의 사항 modal
// ─────────────────────────────────────────────────────────
section('14. 건의 사항 (feedback) 모듈');
ok(/async\s+function\s+openFeedbackModal\s*\(\)/.test(html), 'openFeedbackModal async 함수');
ok(/window\.openFeedbackModal\s*=\s*openFeedbackModal/.test(html), 'window.openFeedbackModal 전역');
ok(/id="feedback-modal"/.test(html) || /'feedback-modal'/.test(html), 'feedback-modal 컨테이너 id');
ok(/'feedback:'\s*\+\s*payload\.ts/.test(html), 'STORAGE 키 형식: feedback:<ts>:<userId>');
ok(/paideia\.feedbackQueue/.test(html), '오프라인 큐 (localStorage 안전망)');
ok(/id="feedback-link"/.test(html), '홈 푸터에 건의 링크');

// ─────────────────────────────────────────────────────────
// 15. presence (현재 공부 중) 모듈
// ─────────────────────────────────────────────────────────
section('15. presence (동시 사용자 카운트) 모듈');
ok(/const\s+PRESENCE_TTL_MS\s*=/.test(html), 'PRESENCE_TTL_MS 상수');
ok(/const\s+PRESENCE_PING_MS\s*=/.test(html), 'PRESENCE_PING_MS 상수');
ok(/async\s+function\s+pingPresence\s*\(\)/.test(html), 'pingPresence async 함수');
ok(/function\s+startPresenceHeartbeat\s*\(\)/.test(html), 'startPresenceHeartbeat 함수');
ok(/async\s+function\s+fetchPresenceCount\s*\(\)/.test(html), 'fetchPresenceCount async 함수');
ok(/'presence:'\s*\+\s*S\.userId/.test(html), 'presence:<userId> 키 형식');
ok(/startPresenceHeartbeat\(\)/.test(html), 'init 시 heartbeat 시작');
ok(/id="home-presence-text"/.test(html), '홈 화면 presence 카운트 슬롯');
ok(/현재\s*<b style="color:var\(--terracotta-d\)">\$\{count\}명<\/b>이 공부 중입니다/.test(html), 'N명 공부 중 표시 문구');

// ─────────────────────────────────────────────────────────
// 16. presence count 계산 정확성 시뮬레이션
// ─────────────────────────────────────────────────────────
section('16. presence TTL 5분 필터링 로직 (개념 검증)');
// fetchPresenceCount 의 핵심 로직: (now - ts) < PRESENCE_TTL_MS 만 카운트
const presenceTtlMatch = html.match(/const\s+PRESENCE_TTL_MS\s*=\s*(\d+)\s*\*\s*(\d+)\s*\*\s*(\d+)/);
if(presenceTtlMatch){
  const ttl = parseInt(presenceTtlMatch[1]) * parseInt(presenceTtlMatch[2]) * parseInt(presenceTtlMatch[3]);
  ok(ttl === 5*60*1000, 'PRESENCE_TTL_MS = 5분 (실제: '+ttl+'ms)');
}
const pingFreqMatch = html.match(/const\s+PRESENCE_PING_MS\s*=\s*(\d+)\s*\*\s*(\d+)\s*\*\s*(\d+)/);
if(pingFreqMatch){
  const freq = parseInt(pingFreqMatch[1]) * parseInt(pingFreqMatch[2]) * parseInt(pingFreqMatch[3]);
  ok(freq < 5*60*1000, 'PRESENCE_PING_MS (4분) < TTL (5분) — 누락 방지');
}

// ─────────────────────────────────────────────────────────
// 결과
// ─────────────────────────────────────────────────────────
console.log('\n===============================================');
console.log(`TOTAL: ${pass} pass, ${fail} fail`);
console.log('===============================================');
process.exit(fail > 0 ? 1 : 0);
