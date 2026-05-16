/* test-v58.js — Static & functional validation of v58 changes.
 *
 * Coverage:
 *   1. Version bumps (APP_VERSION, CACHE_VERSION).
 *   2. Path generalization: _battleFetchRoom / _battleSaveRoom / SSE URL all consult _battleState.roomPath.
 *   3. BATTLE_MODES constant with 4 modes (vocab / quote / verse / riddle).
 *   4. _battleBuildQuestions dispatches on mode.
 *   5. Each mode builder produces 10 well-formed questions with correct option position,
 *      Q3/Q6/Q9 steal markers, and seed-determinism.
 *   6. renderBattleGame uses q.prompt (not q.g) and switches optsAreGreek by mode.
 *   7. Lobby module: constants, functions, storage path 'lobby:waiters:' / 'lobby:matches:'.
 *   8. Visibility cleanup wiring (visibilitychange / beforeunload).
 *   9. renderBattle entry has 3 options (공개 lobby / 코드 만들기 / 코드 입장).
 *  10. _battleLeave uses roomPath (no hard-coded battles: in cleanup paths).
 *  11. v57 invariants preserved (null wrapper, intro guards, char quotes 50).
 *
 * Usage: node test-v58.js  (run from this directory; expects index.html, sw.js, data-characters.js)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname.includes('paideia-pwa-v58') ? __dirname : path.join(__dirname, 'paideia-pwa-v58');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const sw   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const dataChars = fs.readFileSync(path.join(ROOT, 'data-characters.js'), 'utf8');

let passed = 0, failed = 0;
function ok(label){ console.log('  ✓', label); passed++; }
function bad(label, extra){ console.log('  ✗', label, extra?('— '+extra):''); failed++; }
function check(label, cond, extra){ cond ? ok(label) : bad(label, extra); }
function section(name){ console.log('\n── ' + name + ' ──'); }

// ─────────────────────────────────────────────────────────────────────────────
section('1) 버전 상수');
check('APP_VERSION === v58',  /const APP_VERSION = 'v58';/.test(html));
check('CACHE_VERSION === v58', /const CACHE_VERSION = 'v58';/.test(sw));

// ─────────────────────────────────────────────────────────────────────────────
section('2) Path generalization (roomPath)');
check('_battleFetchRoom uses _battleState.roomPath',
      /_battleState && _battleState\.roomPath\) \? _battleState\.roomPath : `battles:\$\{code\}`/.test(html));
check('_battleSaveRoom uses _battleState.roomPath',
      /_battleSaveRoom/.test(html) &&
      /const path = \(_battleState && _battleState\.roomPath\) \? _battleState\.roomPath : `battles:\$\{code\}`;\s*\n\s*try \{\s*\n\s*await STORAGE\.setShared\(path/.test(html));
check('SSE URL builder uses roomPath (콜론 → 슬래시 변환)',
      /sseTail = \(_battleState && _battleState\.roomPath\) \? _battleState\.roomPath\.replace\(\/:\/g,'\/'\) : `battles\/\$\{code\}`/.test(html));
check('_battleLeave uses roomPath (no hard-coded battles:${code} in cleanup)',
      /const path = _battleState\.roomPath \|\| `battles:\$\{code\}`;\s*\n\s*_battleStopPoll/.test(html));
check('renderBattleResult cleanup uses roomPath',
      /const path = _battleState\.roomPath \|\| `battles:\$\{code\}`;\s*\n\s*setTimeout\(async \(\) => \{\s*\n\s*try \{ await STORAGE\.delShared\(path\)/.test(html));

// ─────────────────────────────────────────────────────────────────────────────
section('3) BATTLE_MODES constant');
check('BATTLE_MODES defined', /const BATTLE_MODES = \{/.test(html));
check('BATTLE_MODE_DEFAULT === vocab',
      /const BATTLE_MODE_DEFAULT = 'vocab';/.test(html));
const modeIds = ['vocab','quote','verse','riddle'];
for(const m of modeIds){
  check(`BATTLE_MODES.${m} entry present`, new RegExp(`${m}:\\s*\\{\\s*id:'${m}'`).test(html));
}
check('quote mode 한국어 라벨', /id:'quote'[^}]+Μάχη Ποιητῶν[^}]+명언의 주인/.test(html));
check('verse mode 한국어 라벨', /id:'verse'[^}]+Στίχοι[^}]+행 잇기/.test(html));
check('riddle mode 한국어 라벨', /id:'riddle'[^}]+Σφίγξ[^}]+역방향 추론/.test(html));

// ─────────────────────────────────────────────────────────────────────────────
section('4) _battleBuildQuestions dispatches on mode');
check('_battleBuildQuestions(seed, mode) 시그너처', /function _battleBuildQuestions\(seed, mode\)/.test(html));
for(const m of modeIds){
  check(`_battleBuild${m[0].toUpperCase()+m.slice(1)} 정의됨`,
        new RegExp(`function _battleBuild${m[0].toUpperCase()+m.slice(1)}`).test(html));
}

// ─────────────────────────────────────────────────────────────────────────────
section('5) 빌더 행위 (sandboxed execution)');
const sandbox = {
  window:{}, console, setTimeout, clearTimeout,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(dataChars, sandbox);
// Stub CHARACTERS_BY_ID using CHARACTER_QUOTES keys
const chById = {};
const CATS = ['god','hero','heroine','philo','poet'];
let ci = 0;
for(const id of Object.keys(sandbox.window.CHARACTER_QUOTES || {})){
  chById[id] = { id, ko: id+'_ko', ep: id+'_ep', c: CATS[ci%CATS.length] };
  ci++;
}
sandbox.CHARACTERS_BY_ID = chById;
sandbox.ALL_VOCAB = [];
for(let i=0;i<200;i++){
  sandbox.ALL_VOCAB.push({g:'g'+i, ko:'k'+i, pos:i%3===0?'N':(i%3===1?'V':'A')});
}
// Extract builder code from html
const startIdx = html.indexOf('// v58: 게임 모드 카탈로그');
const endMarker = '// v58: 강탈을 반영한 effective score';   // existing comment after riddle builder
let endIdx = html.indexOf(endMarker, startIdx);
if(endIdx < 0){
  // Try another anchor
  endIdx = html.indexOf('function _battleStopQTimer', startIdx);
}
const builderCode = html.slice(startIdx, endIdx);
const wrapper = `
const BATTLE_N_Q = 10;
const BATTLE_STEAL_INTERVAL = 3;
${builderCode}
const built = {};
for(const m of ['vocab','quote','verse','riddle']) built[m] = _battleBuildQuestions(99, m);
built;
`;
let built;
try {
  built = vm.runInContext(wrapper, sandbox);
  ok('builder 코드 sandbox 실행 OK');
} catch(e){
  bad('builder 코드 실행 실패', e.message);
  built = {};
}
for(const m of modeIds){
  const qs = built[m];
  if(!qs || qs.length === 0){ bad(`${m}: 빌더 결과 비어 있음`); continue; }
  check(`${m}: 10 questions`, qs.length === 10);
  const q0 = qs[0];
  check(`${m}: q[0].mode === '${m}'`, q0.mode === m);
  check(`${m}: q[0].options.length === 4`, Array.isArray(q0.options) && q0.options.length === 4);
  check(`${m}: q[0].correctIdx ∈ [0,3]`, q0.correctIdx >= 0 && q0.correctIdx <= 3);
  check(`${m}: q[0].prompt 비공`, !!q0.prompt);
  // Q3/Q6/Q9 강탈
  const steals = qs.map((q,i)=>q.isSteal?i+1:null).filter(Boolean);
  check(`${m}: steal Q-numbers === [3,6,9]`, steals.join(',') === '3,6,9', 'got '+steals.join(','));
  // 결정성
  const qsB = vm.runInContext(`_battleBuildQuestions(99, '${m}')`, sandbox);
  let determ = true;
  for(let i=0;i<qs.length;i++){
    if(qs[i].prompt !== qsB[i].prompt || qs[i].correctIdx !== qsB[i].correctIdx){ determ=false; break; }
  }
  check(`${m}: 시드 결정성 (seed=99 두 번 호출 동일)`, determ);
  // 정답이 옵션에 포함되는지
  let correctIn = true;
  for(const q of qs){
    const corrOpt = q.options[q.correctIdx];
    if(corrOpt == null){ correctIn = false; break; }
  }
  check(`${m}: 모든 q 의 정답이 옵션에 존재`, correctIn);
}
// Verse-specific: head + tail 분리, tail == correct option
if(built.verse && built.verse.length){
  const q = built.verse[0];
  check('verse: prompt 가 "…" 으로 끝남', /…\s*$/.test(q.prompt));
  check('verse: q.tail === options[correctIdx]',
        q.tail === q.options[q.correctIdx], `tail=${JSON.stringify(q.tail)} correct=${JSON.stringify(q.options[q.correctIdx])}`);
}
// Quote-specific
if(built.quote && built.quote.length){
  const q = built.quote[0];
  check('quote: q.promptKo 존재 (한국어 보조)', !!q.promptKo);
  check('quote: q.src 존재 (출처)', !!q.src);
  // prompt 가 그리스 문자 포함
  check('quote: prompt 그리스 문자', /[\u0370-\u03FF\u1F00-\u1FFF]/.test(q.prompt));
}
// Riddle-specific
if(built.riddle && built.riddle.length){
  const q = built.riddle[0];
  check('riddle: q.correctGreek === options[correctIdx]',
        q.correctGreek === q.options[q.correctIdx]);
  // prompt 는 한국어, options 는 그리스어
  check('riddle: prompt 가 한국어 (그리스 문자 없음)', !/[\u0370-\u03FF\u1F00-\u1FFF]/.test(q.prompt));
}

// ─────────────────────────────────────────────────────────────────────────────
section('6) renderBattleGame mode dispatch (정적 검사)');
check('q.prompt 로 변경 (q.g 직접 참조 사라짐)',
      !/\$\{q\.g\}/.test(html.split('function renderBattleGame')[1].slice(0, 3000)));
check('mode 별 promptBlock 분기',
      /if\(mode === 'quote'\)\{[\s\S]+if\(mode === 'verse'\)\{[\s\S]+if\(mode === 'riddle'\)/.test(html));
check('options 가 그리스어 모드에서 lang="grc" 부여',
      /optsAreGreek = \(mode === 'verse' \|\| mode === 'riddle'\)/.test(html));
check('answered 기록에 mode 필드',
      /mode: q\.mode \|\| 'vocab',/.test(html));
check('wrongRoom 적립은 vocab 모드만',
      /\(a\.mode \|\| 'vocab'\) === 'vocab'/.test(html));

// ─────────────────────────────────────────────────────────────────────────────
section('7) Lobby 모듈 (공개 lobby)');
const lobbyConsts = ['LOBBY_POLL_MS','LOBBY_WAITER_TTL_MS','LOBBY_HEARTBEAT_MS','LOBBY_MATCH_TTL_MS','LOBBY_MID_LEN'];
for(const c of lobbyConsts){
  check(`상수 ${c} 정의됨`, new RegExp(`const ${c}\\s*=`).test(html));
}
const lobbyFns = ['_lobbyGenMid','_lobbyStop','_lobbyCleanup','_lobbyFetchState','_lobbyPingWaiter',
  '_lobbyRemoveWaiter','_lobbyStartMatch','_lobbyJoinExistingMatch','renderPublicLobby',
  '_lobbyTick','_lobbyDraw','_lobbyEnterQueue','_lobbyExitQueue','_lobbyExit'];
for(const f of lobbyFns){
  check(`함수 ${f} 정의됨`, new RegExp(`function ${f.replace('$','\\$')}`).test(html));
}
check('공개 lobby storage 경로 "lobby:waiters:"', /lobby:waiters:/.test(html));
check('공개 lobby storage 경로 "lobby:matches:"', /lobby:matches:/.test(html));
check('renderPublicLobby 전역 노출', /window\.renderPublicLobby = renderPublicLobby/.test(html));

// ─────────────────────────────────────────────────────────────────────────────
section('8) Ghost player cleanup (visibilitychange / beforeunload)');
check('visibilitychange 핸들러 추가', /document\.addEventListener\('visibilitychange'/.test(html));
check('beforeunload 핸들러 추가', /window\.addEventListener\('beforeunload'/.test(html));
check('pagehide 핸들러 추가', /window\.addEventListener\('pagehide'/.test(html));
check('hidden 상태에서 _lobbyRemoveWaiter 호출',
      /document\.visibilityState === 'hidden'[\s\S]{0,200}_lobbyRemoveWaiter/.test(html) ||
      /_lobbyRemoveWaiter\(\)[\s\S]{0,100}\}/.test(html));

// ─────────────────────────────────────────────────────────────────────────────
section('9) renderBattle 진입 — 3 옵션');
check('공개 lobby 진입 버튼 (battle-public)', /id="battle-public"/.test(html));
check('비공개 코드방 만들기 버튼 (battle-create)', /id="battle-create"/.test(html));
check('비공개 코드방 입장 버튼 (battle-join)', /id="battle-join"/.test(html));
check('renderPublicLobby() 클릭 핸들러',
      /pb\.addEventListener\('click', \(\) => renderPublicLobby\(\)\)/.test(html));
check('비공개 옵션이 details 로 접힘 (legacy 강조 축소)',
      /<details[\s\S]{0,400}비공개 코드방/.test(html));

// ─────────────────────────────────────────────────────────────────────────────
section('10) v57 invariants preserved');
check('BATTLE_NULL_THRESHOLD === 3', /const BATTLE_NULL_THRESHOLD = 3;/.test(html));
check('BATTLE_NULL_MIN_MS === 12000', /const BATTLE_NULL_MIN_MS\s*=\s*12000;/.test(html));
check('_battleHandleUpdate wrapper 정의', /function _battleHandleUpdate/.test(html));
check('intro guards (introActive / latestRoomDuringIntro)',
      /_battleState\.introActive\b/.test(html) && /latestRoomDuringIntro/.test(html));
check('재연결 시도 버튼 (bat-retry-conn)', /id="bat-retry-conn"/.test(html));
check('CHARACTER_QUOTES 50 entries (v56)', Object.keys(sandbox.window.CHARACTER_QUOTES).length === 50);
check('CHARACTER_IMAGES 50 entries (v55)', Object.keys(sandbox.window.CHARACTER_IMAGES).length === 50);

// ─────────────────────────────────────────────────────────────────────────────
section('11) 결과');
const total = passed + failed;
console.log(`\n${passed}/${total} passed  ·  ${failed} failed`);
process.exit(failed ? 1 : 0);
