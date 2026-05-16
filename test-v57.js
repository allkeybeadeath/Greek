// v57 — 멀티 배틀 "방이 닫혔습니다" fragility 핫픽스 검증
//
// 목적:
//   1. _battleHandleUpdate 의 연속 null 임계점 동작 시뮬레이션
//   2. 인트로 컷 보호 (introActive) 가 transient room update 를 흡수
//   3. 재연결 버튼 + 진단 메시지 코드 존재
//   4. 버전 상수 v57
//   5. v56 의 SSE/polling 구조가 유지되면서 wrapper 만 추가됨

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const sw   = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');

let pass = 0, fail = 0;
const log = (ok, name, info) => {
  if(ok){ pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (info ? ' — ' + info : '')); }
};

// ===== 1. 버전 상수 =====
console.log('\n[1] 버전 상수');
log(/const APP_VERSION = 'v57'/.test(html),     "APP_VERSION = 'v57'");
log(/const CACHE_VERSION = 'v57'/.test(sw),      "CACHE_VERSION = 'v57'");

// ===== 2. _battleHandleUpdate wrapper 존재 =====
console.log('\n[2] _battleHandleUpdate null robustness wrapper');
log(/function _battleHandleUpdate\(room, onUpdate\)/.test(html),
    "_battleHandleUpdate 함수 정의");
log(/const BATTLE_NULL_THRESHOLD = 3/.test(html),
    "BATTLE_NULL_THRESHOLD = 3");
log(/const BATTLE_NULL_MIN_MS\s*=\s*12000/.test(html),
    "BATTLE_NULL_MIN_MS = 12000 (12초)");
log(/_battleState\.nullRunCount/.test(html),
    "_battleState.nullRunCount 추적");
log(/_battleState\.lastGoodRoom/.test(html),
    "_battleState.lastGoodRoom 보존");
log(/_battleState\.lastGoodAt/.test(html),
    "_battleState.lastGoodAt 타임스탬프");

// ===== 3. 모든 onUpdate 진입 경로가 wrapper 경유 =====
console.log('\n[3] onUpdate 진입 경로가 wrapper 경유');

// _battleStartPolling 의 첫 fetch + interval
const startPollingBody = html.match(/function _battleStartPolling\([^)]*\)\s*\{[\s\S]*?(?=\n\}\n)/);
if(startPollingBody){
  const body = startPollingBody[0];
  log(/_battleFetchRoom\(code\)\.then\(r => _battleHandleUpdate\(r, onUpdate\)\)/.test(body),
      "_battleStartPolling 즉시 fetch 가 wrapper 경유");
  log(/const r = await _battleFetchRoom\(code\);[\s\S]*?_battleHandleUpdate\(r, onUpdate\)/.test(body),
      "_battleStartPolling interval 도 wrapper 경유");
  // 옛 패턴 (직접 onUpdate(r) 또는 .then(onUpdate)) 잔존 없음
  log(!/_battleFetchRoom\(code\)\.then\(onUpdate\)/.test(body),
      "_battleStartPolling 에 옛 .then(onUpdate) 잔존 없음");
} else {
  log(false, "_battleStartPolling 함수를 찾지 못함");
}

// _battleSubscribe 의 즉시 fetch
const subscribeBody = html.match(/function _battleSubscribe\(code, onUpdate\)\s*\{[\s\S]*?(?=\n\}\n)/);
if(subscribeBody){
  const body = subscribeBody[0];
  log(/_battleFetchRoom\(code\)\.then\(r => _battleHandleUpdate\(r, onUpdate\)\)/.test(body),
      "_battleSubscribe 즉시 fetch 가 wrapper 경유");
  log(/_battleState\.nullRunCount = 0/.test(body) && /_battleState\.lastGoodAt = 0/.test(body),
      "_battleSubscribe 시작 시 카운터 초기화");
} else {
  log(false, "_battleSubscribe 함수를 찾지 못함");
}

// SSE 핸들러 안에서 path='/'+null 분기가 wrapper 경유
log(/if\(payload === null\)\{[^}]*_battleHandleUpdate\(null, onUpdate\)/.test(html),
    "SSE path='/'+payload=null 도 wrapper 경유");
log(/cached = payload;\s*_battleHandleUpdate\(payload, onUpdate\)/.test(html),
    "SSE path='/'+payload 정상도 wrapper 경유");
log(/_battleHandleUpdate\(cached, onUpdate\)/.test(html),
    "SSE 부분 갱신 후 wrapper 경유");

// ===== 4. 인트로 컷 보호 =====
console.log('\n[4] 인트로 컷 보호 (introActive 플래그)');
const introBody = html.match(/function _renderBattleIntro\([^)]*\)\s*\{[\s\S]*?(?=\nfunction )/);
if(introBody){
  const body = introBody[0];
  log(/_battleState\.introActive = true/.test(body),
      "_renderBattleIntro 시작 시 introActive = true");
  log(/_battleState\.introActive = false/.test(body),
      "advance() 에서 introActive = false");
  log(/_battleState\.latestRoomDuringIntro/.test(body),
      "latestRoomDuringIntro 보존");
  log(/onContinue\(nextRoom\)/.test(body),
      "advance() 가 최신 room 으로 onContinue 호출");
} else {
  log(false, "_renderBattleIntro 함수를 찾지 못함");
}

// renderBattleLobby 의 draw 가 introActive 처리
const drawBody = html.match(/const draw = \(room\) => \{[\s\S]*?return renderBattleResult\(code, room\);[\s\S]*?\}[\s\S]*?\};/);
if(drawBody){
  const body = drawBody[0];
  log(/_battleState\.introActive/.test(body),
      "draw 콜백이 introActive 체크");
  log(/_battleState\.latestRoomDuringIntro = room/.test(body),
      "draw 가 인트로 중 room 을 latestRoomDuringIntro 에 보존");
} else {
  log(false, "renderBattleLobby 의 draw 콜백을 찾지 못함");
}

// renderBattleGame 의 onContinue 가 latestRoom 받음
const renderGameBody = html.match(/async function renderBattleGame\(code, room\)\s*\{[\s\S]*?const local = _battleGameLocal;/);
if(renderGameBody){
  const body = renderGameBody[0];
  log(/_renderBattleIntro\(code, room, \(latestRoom\) =>/.test(body),
      "renderBattleGame 의 onContinue 가 latestRoom 인자 수신");
  log(/renderBattleGame\(code, latestRoom \|\| room\)/.test(body),
      "본 게임 진입 시 latestRoom 우선");
} else {
  log(false, "renderBattleGame 함수 진입부를 찾지 못함");
}

// ===== 5. 방 닫힘 메시지 개선 =====
console.log('\n[5] 방 닫힘 메시지 개선');
log(/방 연결 끊김/.test(html),
    "메시지 타이틀이 '방이 닫혔습니다' → '방 연결 끊김' 으로 완곡");
log(/약 \$\{sinceGood\}초 동안 응답 없음/.test(html),
    "진단 정보 (sinceGood 초) 표시");
log(/bat-retry-conn/.test(html),
    "재연결 시도 버튼 (bat-retry-conn) 존재");
log(/🔄 다시 연결 시도/.test(html),
    "재연결 버튼 라벨");
log(/_battleSubscribe\(_battleState\.roomCode, draw\)/.test(html),
    "재연결 시 _battleSubscribe 재호출");

// ===== 6. _battleCleanup 가 신규 상태 정리 =====
console.log('\n[6] _battleCleanup 가 v57 신규 상태 정리');
const cleanupBody = html.match(/function _battleCleanup\(\)\s*\{[\s\S]*?\}/);
if(cleanupBody){
  const body = cleanupBody[0];
  log(/_battleState\.nullRunCount = 0/.test(body),
      "cleanup 에서 nullRunCount 리셋");
  log(/_battleState\.lastGoodRoom = null/.test(body),
      "cleanup 에서 lastGoodRoom 리셋");
  log(/_battleState\.introActive = false/.test(body),
      "cleanup 에서 introActive 리셋");
  log(/_battleState\.latestRoomDuringIntro = null/.test(body),
      "cleanup 에서 latestRoomDuringIntro 리셋");
} else {
  log(false, "_battleCleanup 함수를 찾지 못함");
}

// ===== 7. v56 의 기존 invariant 보존 =====
console.log('\n[7] v56 기존 invariant 보존 (regression 방지)');
log(/_battleIntroShown/.test(html),                "v56 인트로 1회 가드 유지");
log(/BATTLE_INTRO_MS\s*=\s*5200/.test(html),       "v56 BATTLE_INTRO_MS = 5200 유지");
log(/BATTLE_STEAL_AMOUNT\s*=\s*8/.test(html),      "v56 강탈 금액 = 8 유지");
log(/BATTLE_STEAL_INTERVAL\s*=\s*3/.test(html),    "v56 강탈 주기 = 3 유지");
log(/window\.BGM/.test(html),                       "v56 BGM 모듈 유지");
log(/openFeedbackModal/.test(html),                 "v56 feedback modal 유지");
log(/startPresenceHeartbeat/.test(html),            "v56 presence heartbeat 유지");
log(/CHARACTER_QUOTES/.test(html),                  "v56 캐릭터 명언 데이터 유지");

// ===== 8. _battleHandleUpdate 의 시뮬레이션 (행위 검증) =====
console.log('\n[8] _battleHandleUpdate 동작 시뮬레이션');
// 함수 본문을 추출해서 실제 행위를 검증
const handleSnippet = html.match(/function _battleHandleUpdate\(room, onUpdate\)\s*\{[\s\S]*?\n\}/);
if(handleSnippet){
  // 모의 환경 만들어서 실행
  const sandbox = `
    const BATTLE_NULL_THRESHOLD = 3;
    const BATTLE_NULL_MIN_MS = 12000;
    let _battleState = {};
    ${handleSnippet[0]}
    // 시나리오 A: 처음부터 정상 응답
    let updates = [];
    _battleHandleUpdate({meta:{status:'pending'}, players:{u1:{name:'A'}}}, (r) => updates.push(r));
    // 정상 응답 1회면 nullRunCount=0, lastGoodRoom 보존
    const sA = { gotUpdate: updates.length, nullCount: _battleState.nullRunCount, hadGood: !!_battleState.lastGoodRoom };

    // 시나리오 B: 정상 1회 후 null 2회 — 임계점 (3) 미달이므로 onUpdate 호출 안 됨
    updates = [];
    _battleHandleUpdate({meta:{status:'pending'}, players:{}}, (r) => updates.push(r));
    _battleHandleUpdate(null, (r) => updates.push(r));
    _battleHandleUpdate(null, (r) => updates.push(r));
    const sB = { gotUpdate: updates.length, nullCount: _battleState.nullRunCount };

    // 시나리오 C: 시간 임계점 — 정상 1회 후 14초 경과 시뮬 (lastGoodAt 을 과거로) + null 3회
    _battleState.nullRunCount = 0;
    _battleState.lastGoodRoom = {meta:{}};
    _battleState.lastGoodAt = Date.now() - 13000;  // 13초 전
    updates = [];
    _battleHandleUpdate(null, (r) => updates.push(r));   // 1
    _battleHandleUpdate(null, (r) => updates.push(r));   // 2
    _battleHandleUpdate(null, (r) => updates.push(r));   // 3 — 임계점 도달
    const sC = { gotUpdate: updates.length, lastIsNull: updates[updates.length-1] === null };

    // 시나리오 D: 첫 응답부터 null (정상 응답 이력 없음) — 첫 번째 null 만 전달
    _battleState = {};
    updates = [];
    _battleHandleUpdate(null, (r) => updates.push(r));   // 1: 전달
    _battleHandleUpdate(null, (r) => updates.push(r));   // 2: 무시
    _battleHandleUpdate(null, (r) => updates.push(r));   // 3: 무시
    const sD = { gotUpdate: updates.length, lastIsNull: updates[0] === null };

    JSON.stringify({sA, sB, sC, sD})
  `;
  try {
    const result = JSON.parse(eval(sandbox));
    log(result.sA.gotUpdate === 1 && result.sA.nullCount === 0 && result.sA.hadGood,
        '시나리오 A: 정상 응답 → onUpdate 1회, nullCount=0, lastGoodRoom 보존', JSON.stringify(result.sA));
    log(result.sB.gotUpdate === 1 && result.sB.nullCount === 2,
        '시나리오 B: 정상 1회 + null 2회 (임계 미달) → onUpdate 1회만 (정상만)', JSON.stringify(result.sB));
    log(result.sC.gotUpdate === 1 && result.sC.lastIsNull,
        '시나리오 C: 시간 임계 (13초) + null 3회 → 임계점 도달, onUpdate(null) 호출', JSON.stringify(result.sC));
    log(result.sD.gotUpdate === 1 && result.sD.lastIsNull,
        '시나리오 D: 첫 응답부터 null → 첫 번째만 전달 (사용자에게 즉시 알림)', JSON.stringify(result.sD));
  } catch(e){
    log(false, '시뮬레이션 실행 실패: ' + e.message);
  }
}

// ===== 결과 =====
console.log('\n=========================');
console.log(`${pass} pass / ${fail} fail (총 ${pass+fail})`);
console.log('=========================');
process.exit(fail === 0 ? 0 : 1);
