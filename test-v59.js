// v59 검증 — Firebase silent failure 차단, justCreated grace, 낙관적 UI
// node test-v59.js
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

let pass = 0, fail = 0;
function check(name, cond, hint){
  if(cond){ console.log('  ✓ ' + name); pass++; }
  else { console.log('  ✗ ' + name + (hint?' — '+hint:'')); fail++; }
}

// ────────────────────────────────────────────────────────────────────
console.log('\n[1] 버전 상수');
check('APP_VERSION = v59', /const APP_VERSION = 'v59'/.test(html));
const sw = fs.readFileSync(__dirname + '/sw.js', 'utf8');
check('CACHE_VERSION = v59', /const CACHE_VERSION = 'v59'/.test(sw));

// ────────────────────────────────────────────────────────────────────
console.log('\n[2] BACKEND silent failure 진단 캡처');
check('setShared 의 r.ok=false 분기에 isPermissionDenied 캡처',
  /setShared.*?isPermissionDenied: \(r\.status === 401/s.test(html));
check('getShared 의 r.ok=false 분기에도 isPermissionDenied',
  (html.match(/isPermissionDenied: \(r\.status === 401 \|\| r\.status === 403\)/g)||[]).length >= 3,
  '4번 (setShared, setShared catch, getShared, listShared) 또는 3번 (catch 는 false fallback)');
check('HTTP body 부분 캡처 (200자 슬라이스)', /bodyText = \(await r\.text\(\)\)\.slice\(0, 200\)/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[3] _battleSaveRoom 반환값 검증');
check('setShared 결과 res 변수에 저장', /const res = await STORAGE\.setShared\(path, JSON\.stringify\(room\)\)/.test(html));
check('!res 분기에서 false 반환', /if\(!res\)\{[\s\S]*?return false;\s*\}\s*return true;/.test(html));
check('기존 _battleLastError 보존 후 op 만 갱신', /existing\s*=\s*window\._battleLastError\s*\|\|\s*\{\}[\s\S]{0,200}\.\.\.existing/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[4] justCreated grace period');
check('BATTLE_JUST_CREATED_GRACE_MS 상수 정의', /const BATTLE_JUST_CREATED_GRACE_MS = 5000/.test(html));
check('_battleHandleUpdate 에 justCreated 분기',
  /const justCreated = _battleState\.justCreatedAt && \(Date\.now\(\) - _battleState\.justCreatedAt < BATTLE_JUST_CREATED_GRACE_MS\)/.test(html));
check('!everSawGood 분기에서 justCreated 면 return',
  /if\(!everSawGood\)\{[\s\S]{0,400}if\(justCreated\)\{[\s\S]{0,200}return;\s*\}/.test(html));
check('renderBattleCreate 가 justCreatedAt 설정',
  /_battleState = \{ roomCode: code, role: 'host', pollTimer: null, justCreatedAt: Date\.now\(\) \}/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[5] renderBattleCreate 진단 메시지 강화');
check('isPermissionDenied 분기 안내', /err && err\.isPermissionDenied[\s\S]{0,400}Firebase 보안 규칙이 차단/.test(html));
check('진단 modal 액션 힌트', /홈 → 진단 → Firebase 자가진단/.test(html));
check('이전 _battleLastError 클리어', /window\._battleLastError = null;[\s\S]{0,200}_battleSaveRoom\(code, room\)/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[6] _lobbyPingWaiter 결과 검증');
check('_lobbyPingWaiter 가 boolean 반환', /async function _lobbyPingWaiter\(\)\{[\s\S]{0,800}return !!res/.test(html));
check('Firebase 실패 시 false 반환', /async function _lobbyPingWaiter\(\)\{[\s\S]{0,800}\}\s*catch\(_\)\{ return false; \}/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[7] _lobbyEnterQueue 낙관적 UI + 결과 검증');
check('낙관적 추가 (_optimistic marker)', /_lobbyState\.waiters\.unshift\(\{[\s\S]{0,400}_optimistic: true/.test(html));
check('PUT 실패 시 phase 롤백 idle', /const ok = await _lobbyPingWaiter\(\);\s*if\(!ok\)\{[\s\S]{0,200}_lobbyState\.phase = 'idle'/.test(html));
check('실패 시 waiters 에서 자기 제거', /_lobbyState\.waiters = \(_lobbyState\.waiters \|\| \[\]\)\.filter\(w => w\.uid !== S\.userId\)/.test(html));
check('isPermissionDenied 메시지 분기 (lobby)',
  (html.match(/err && err\.isPermissionDenied/g)||[]).length >= 3,
  'renderBattleCreate, _lobbyEnterQueue, _lobbyStartMatch 셋 모두');

// ────────────────────────────────────────────────────────────────────
console.log('\n[8] _lobbyStartMatch setShared 검증');
check('setShared 결과 !!res 로 saveOk',
  /const res = await STORAGE\.setShared\(`lobby:matches:\$\{mid\}`, JSON\.stringify\(matchObj\)\);\s*saveOk = !!res/.test(html));
check('isPermissionDenied 안내 (매치 시작)', /msg \+= ' — Firebase 보안 규칙이 차단/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[9] 진단 modal Firebase 자가진단');
check('진단 버튼 #diag-firebase-test', /id="diag-firebase-test"/.test(html));
check('결과 영역 #diag-firebase-result', /id="diag-firebase-result"/.test(html));
check('6 경로 테스트 (battles·lobby:waiters·lobby:matches·lb·feedback·presence)',
  /battles \(방 만들기\)/.test(html) &&
  /lobby:waiters \(큐 입장\)/.test(html) &&
  /lobby:matches \(매치\)/.test(html) &&
  /lb \(라이브 순위\)/.test(html) &&
  /feedback \(건의 사항\)/.test(html) &&
  /presence \(동시 학습자\)/.test(html));
check('verdict 분기: allWriteOk · allDenied · partialDenied',
  /allWriteOk/.test(html) && /allDenied/.test(html) && /partialDenied/.test(html));
check('전체 차단 시 권장 규칙 표시',
  /\{\\n  "rules": \{\\n    "\.read": true,\\n    "\.write": true\\n  \}\\n\}/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[10] toast 시그니처 확장 (backward compat)');
check('toast(msg, typeOrDuration, duration)', /function toast\(msg, typeOrDuration, duration\)/.test(html));
check('숫자 인자 → duration 으로 해석', /if\(typeof typeOrDuration === 'number'\)\{\s*dur = typeOrDuration;\s*\}/.test(html));
check('문자열 인자 → type (기존 동작)', /if\(typeOrDuration\) type = typeOrDuration/.test(html));

// ────────────────────────────────────────────────────────────────────
console.log('\n[11] README Firebase 규칙 갱신');
const readme = fs.readFileSync(__dirname + '/README.md', 'utf8');
check('루트 수준 read/write 허용 권장', /"\.read": true,\s*\n\s*"\.write": true/.test(readme));
check('v59 갱신 주의', /v59 갱신/.test(readme));
check('이전 룰의 위험성 안내 (lb 만 허용 시 차단)', /이전 버전 안내.*?차단/s.test(readme));

// ────────────────────────────────────────────────────────────────────
console.log('\n[12] v58 invariants 보존 (regression 방어)');
check('BATTLE_MODES 4종', /const BATTLE_MODES =/.test(html));
check('_battleBuildVocab/Quote/Verse/Riddle 4 builder', 
  /_battleBuildVocab/.test(html) && /_battleBuildQuote/.test(html) &&
  /_battleBuildVerse/.test(html) && /_battleBuildRiddle/.test(html));
check('renderPublicLobby 진입점', /async function renderPublicLobby/.test(html));
check('LOBBY_POLL_MS / WAITER_TTL_MS / HEARTBEAT_MS 상수',
  /LOBBY_POLL_MS\s*=\s*3000/.test(html) &&
  /LOBBY_WAITER_TTL_MS\s*=\s*60000/.test(html) &&
  /LOBBY_HEARTBEAT_MS\s*=\s*20000/.test(html));
check('visibilitychange / beforeunload / pagehide 3 핸들러',
  /document\.addEventListener\('visibilitychange'/.test(html) &&
  /window\.addEventListener\('beforeunload'/.test(html) &&
  /window\.addEventListener\('pagehide'/.test(html));

// ────────────────────────────────────────────────────────────────────
// 행위 시뮬레이션 — sandbox eval 로 _battleHandleUpdate justCreated 처리 검증
console.log('\n[13] _battleHandleUpdate justCreated 행위 시뮬레이션');
{
  const fnMatch = html.match(/const BATTLE_NULL_THRESHOLD = 3;[\s\S]{0,200}?const BATTLE_JUST_CREATED_GRACE_MS = 5000;[\s\S]{0,2000}?function _battleHandleUpdate\(room, onUpdate\)\{[\s\S]*?^\}/m);
  check('함수 본문 추출 성공', !!fnMatch, fnMatch ? '' : 'regex 매칭 실패');
  if(fnMatch){
    const sandbox = `
      let _battleState = null;
      ${fnMatch[0]}
      // 시나리오 A: 호스트가 막 방을 만듦 (justCreatedAt 설정), 첫 fetch 가 null (Firebase propagation 지연)
      const recordedA = [];
      _battleState = { nullRunCount: 0, lastGoodRoom: null, lastGoodAt: 0, justCreatedAt: Date.now() };
      _battleHandleUpdate(null, r => recordedA.push(r));
      // 시나리오 B: justCreated 없이 첫 fetch 가 null — 첫 번째만 onUpdate
      const recordedB = [];
      _battleState = { nullRunCount: 0, lastGoodRoom: null, lastGoodAt: 0 };
      _battleHandleUpdate(null, r => recordedB.push(r));
      _battleHandleUpdate(null, r => recordedB.push(r));  // 두 번째 null — 무시되어야
      // 시나리오 C: 정상 1회 → null 2회 (임계 미달) → null 무시
      const recordedC = [];
      _battleState = { nullRunCount: 0, lastGoodRoom: null, lastGoodAt: 0 };
      _battleHandleUpdate({meta:{status:'lobby'}}, r => recordedC.push('GOOD'));
      _battleHandleUpdate(null, r => recordedC.push('NULL'));
      _battleHandleUpdate(null, r => recordedC.push('NULL'));
      JSON.stringify({A: recordedA.length, B: recordedB.length, C: recordedC});
    `;
    let result;
    try { result = JSON.parse(eval(sandbox)); } catch(e){ console.error('  sandbox error:', e.message); }
    if(result){
      check('A: justCreated 면 첫 null 흡수 (grace)', result.A === 0, '실제: '+result.A);
      check('B: justCreated 없으면 첫 null 만 전달', result.B === 1, '실제: '+result.B);
      check('C: 정상 1회 후 null 임계 미달 — null 무시', JSON.stringify(result.C) === '["GOOD"]', '실제: '+JSON.stringify(result.C));
    }
  }
}

// ────────────────────────────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`결과: ${pass} pass / ${fail} fail`);
if(fail > 0) process.exit(1);
