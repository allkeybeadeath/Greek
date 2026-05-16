// test-v60.js — 멀티 배틀 종료 흐름 fix 검증 (v60)
//
// 검증 범위:
//   1. 버전 상수 bump
//   2. 정적 grep — Fix 1-4 의 핵심 코드가 index.html 에 존재하는지
//   3. _battleSubmitProgress 의 path 일반화 (Fix 1) 가 작동 — sandbox 시뮬레이션
//   4. last-player race 의 self-merge (Fix 1) 가 작동
//   5. SSE update 의 status='finished' 우선 체크 (Fix 2)
//   6. wait-others watchdog 의 idempotent status flip (Fix 3)
//   7. wait-others 화면의 수동 종료 버튼 (Fix 4)
//
// v56-v59 invariant 보존 검증은 기존 test-v56.js ~ test-v59.js 가 담당.

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');

let pass = 0, fail = 0;
function assert(cond, msg){
  if(cond){ pass++; console.log('  ✓', msg); }
  else { fail++; console.log('  ✗', msg); }
}

console.log('\n=== §1. 버전 상수 ===');
assert(/const APP_VERSION = 'v60';/.test(html), "index.html: APP_VERSION = 'v60'");
assert(/const CACHE_VERSION = 'v60';/.test(sw),  "sw.js: CACHE_VERSION = 'v60'");

console.log('\n=== §2. Fix 1 — path-level setShared 의 path 일반화 ===');
// 기존 hardcoded path 가 사라졌는지 + 신규 basePath 패턴이 존재하는지
const oldHardcoded = html.match(/`battles:\$\{code\}:players:\$\{S\.userId\}`/g) || [];
assert(oldHardcoded.length === 0,
  'hardcoded `battles:${code}:players:${S.userId}` 가 제거됨 (이전 v59 의 hardcoded path)');
assert(/const basePath = \(_battleState && _battleState\.roomPath\) \? _battleState\.roomPath : `battles:\$\{code\}`;/.test(html),
  '_battleSubmitProgress 안에서 basePath 가 _battleState.roomPath 로 일반화됨');
assert(/STORAGE\.setShared\(`\$\{basePath\}:players:\$\{S\.userId\}`/.test(html),
  'players setShared 호출이 basePath 사용');

console.log('\n=== §3. Fix 1 — last-player race 의 self-merge ===');
assert(/Last-player race/.test(html), 'last-player race 주석 존재');
assert(/const merged = \{ \.\.\.fresh\.players \};/.test(html),
  'fresh.players 의 spread merge 수행');
assert(/merged\[S\.userId\] = \{ \.\.\.merged\[S\.userId\], \.\.\.payload \};/.test(html),
  '자기 자신은 막 PUT 한 payload 로 local merge (Firebase eventual consistency 대응)');
assert(/const allDone = Object\.values\(merged\)\.every\(p => p && p\.finished\);/.test(html),
  'allDone 체크가 merged 결과를 사용 (fresh.players 그대로 가 아님)');
assert(/fresh\.players = merged;\s*await _battleSaveRoom/.test(html),
  'merged 결과가 _battleSaveRoom 으로 publish 됨 (다른 player 의 stale view 해소)');

console.log('\n=== §4. Fix 2 — status === "finished" 우선 체크 ===');
// 단순 ordering 확인 — 같은 onUpdate 콜백 안에서 finished 분기가 playing 보다 위
const onUpdateBlock = html.match(/const players = Object\.entries\(room\.players \|\| \{\}\);\s*const status = room\.meta\.status;[\s\S]{0,1500}?return renderBattleGame\(code, room\);\s*\}/);
assert(onUpdateBlock,
  'SSE/polling onUpdate 분기 블록 식별됨');
if(onUpdateBlock){
  const block = onUpdateBlock[0];
  const finishedIdx = block.indexOf("status === 'finished'");
  const playingIdx  = block.indexOf("status === 'playing'");
  assert(finishedIdx > -1 && playingIdx > -1,
    "두 분기 모두 존재 (finished idx=" + finishedIdx + ", playing idx=" + playingIdx + ")");
  assert(finishedIdx < playingIdx,
    "finished 분기가 playing 분기 보다 먼저 평가됨");
}
assert(/inWaitOthers = !!\(_battleGameLocal && _battleGameLocal\.code === code &&/.test(html),
  'wait-others 상태 식별 변수 존재');
assert(/if\(!inWaitOthers && _battleGameLocal && _battleGameLocal\.answeredThisQ\)/.test(html),
  'answeredThisQ 단락이 wait-others 상태에서는 비활성 (status 전환 watchdog 도달 보장)');

console.log('\n=== §5. Fix 3 — wait-others watchdog (자가 회복) ===');
assert(/status 전환 watchdog/.test(html), 'watchdog 주석 존재');
assert(/playersArr\.every\(p => p && p\.finished\)/.test(html),
  'room.players 의 every-finished 검사');
assert(/fresh\.meta\.status = 'finished';\s*fresh\.meta\.finishedAt = Date\.now\(\);\s*await _battleSaveRoom\(code, fresh\)/.test(html),
  'watchdog 분기에서 status flip + save 수행');
assert(/return renderBattleResult\(code, fresh\);/.test(html),
  'watchdog flip 성공 시 자기 자신 즉시 결과 화면 진입');

console.log('\n=== §6. Fix 4 — wait-others 화면의 수동 종료 ===');
assert(/_renderBattleWaitOthers/.test(html), '_renderBattleWaitOthers 함수 존재');
assert(/local\._waitOthersStartedAt/.test(html), 'wait 시작 시각 추적');
assert(/showStaleHint/.test(html), 'stale 알림 분기 존재');
assert(/showForceEnd/.test(html), '수동 종료 버튼 표시 분기 존재');
assert(/id="bat-force-finish"/.test(html), '수동 종료 버튼 DOM id');
assert(/forceFinishedBy/.test(html), '수동 종료 시 누가 종료했는지 기록 (forceFinishedBy)');
assert(/지금 결과 보기/.test(html), '수동 종료 버튼 라벨 한국어');
assert(/id="bat-scoreboard-wrap"/.test(html), '점수보드 wrap div 가 wait-others 에 존재 (SSE partial update 호환)');

console.log('\n=== §7. v59 invariant 보존 (regression 방지) ===');
assert(/BATTLE_JUST_CREATED_GRACE_MS\s*=\s*5000/.test(html),
  'v59 justCreated grace 상수 보존');
assert(/_battleHandleUpdate/.test(html), 'v57 null-robustness wrapper 보존');
assert(/_lobbyEnterQueue/.test(html), 'v58 lobby 진입 함수 보존');
assert(/BATTLE_MODES/.test(html), 'v58 4 게임 모드 보존');
assert(/CHARACTER_QUOTES/.test(html) || /window\.CHARACTER_QUOTES/.test(html),
  'v56 캐릭터 명언 참조 보존');
assert(/_renderBattleIntro/.test(html), 'v56 인트로 컷 보존');

console.log('\n=== §8. Sandbox 시뮬레이션 — 종료 흐름 ===');
// _battleSubmitProgress 의 핵심 로직을 추출하여 격리 실행
// (실제 함수는 STORAGE / _battleFetchRoom / _battleSaveRoom 등에 의존하므로 mock)
//
// 시나리오 A: 코드방 (legacy battles:<code>) — 마지막 player 가 PUT 후 status flip
// 시나리오 B: lobby 매치 (lobby:matches:<mid>) — 마지막 player 가 PUT 후 status flip
// 시나리오 C: last-player race — fresh.players[me] 가 아직 finished:false 인 stale 응답, merge 가 보정

function runSubmitProgress(scenario){
  const calls = { setShared: [], saveRoom: [], fetchRoom: 0 };
  // mock storage backend
  let roomState = scenario.initialRoom;
  const mockSTORAGE = {
    async setShared(key, val){
      calls.setShared.push({ key, val: JSON.parse(val) });
      // 코드방·lobby 매치 다 적용 — path 가 정확하면 player 객체 업데이트
      const m = key.match(/^(.*):players:(.+)$/);
      if(m){
        const expectedBase = scenario.roomPath || `battles:${scenario.code}`;
        if(m[1] === expectedBase){
          if(!roomState.players) roomState.players = {};
          roomState.players[m[2]] = JSON.parse(val);
        }
      }
      return { key, value: val, shared: true };
    }
  };
  async function mockFetchRoom(){
    calls.fetchRoom++;
    // race 시나리오 — 자기 직전 PUT 이 propagate 안 됨
    if(scenario.staleSelfInFetch){
      const r = JSON.parse(JSON.stringify(roomState));
      if(r.players && r.players[scenario.myId]){
        r.players[scenario.myId].finished = false;  // stale!
      }
      return r;
    }
    return JSON.parse(JSON.stringify(roomState));
  }
  async function mockSaveRoom(code, room){
    calls.saveRoom.push(JSON.parse(JSON.stringify(room)));
    roomState = JSON.parse(JSON.stringify(room));
    return true;
  }

  // _battleSubmitProgress 핵심 로직 재구성 (path 일반화 + self-merge)
  async function submitProgress(code, local, finished, fakeState){
    const payload = {
      name: 'me',
      score: local.score,
      correctCount: local.correctCount || 0,
      currentQ: local.idx,
      ready: true,
      finished: !!finished,
      stolen: [],
    };
    const basePath = (fakeState && fakeState.roomPath) ? fakeState.roomPath : `battles:${code}`;
    try {
      await mockSTORAGE.setShared(`${basePath}:players:${scenario.myId}`, JSON.stringify(payload));
    } catch(_){}
    if(finished){
      try {
        const fresh = await mockFetchRoom();
        if(fresh && fresh.players){
          const merged = { ...fresh.players };
          if(scenario.myId && merged[scenario.myId]){
            merged[scenario.myId] = { ...merged[scenario.myId], ...payload };
          } else if(scenario.myId){
            merged[scenario.myId] = payload;
          }
          const allDone = Object.values(merged).every(p => p && p.finished);
          if(allDone && fresh.meta && fresh.meta.status !== 'finished'){
            fresh.meta.status = 'finished';
            fresh.meta.finishedAt = Date.now();
            fresh.players = merged;
            await mockSaveRoom(code, fresh);
          }
        }
      } catch(_){}
    }
  }

  return submitProgress(scenario.code, scenario.local, true,
                         scenario.roomPath ? { roomPath: scenario.roomPath } : null)
    .then(() => ({ calls, finalRoom: roomState }));
}

(async () => {
  // 시나리오 A: 코드방, 다른 player 도 이미 finished:true
  let r = await runSubmitProgress({
    code: 'ABCD',
    myId: 'u1',
    local: { idx: 10, score: 80, correctCount: 8 },
    initialRoom: {
      meta: { status: 'playing', seed: 1, mode: 'vocab' },
      players: {
        u1: { name:'me', score:80, finished:false },
        u2: { name:'foe', score:60, finished:true }
      }
    }
  });
  assert(r.calls.setShared.length === 1, 'A: 코드방 — setShared 1회');
  assert(r.calls.setShared[0].key === 'battles:ABCD:players:u1',
    'A: 코드방 — setShared key = battles:ABCD:players:u1');
  assert(r.calls.saveRoom.length === 1, 'A: 코드방 — saveRoom 1회 (status flip)');
  assert(r.finalRoom.meta.status === 'finished', 'A: 코드방 — meta.status = finished');

  // 시나리오 B: lobby 매치 (path 일반화 검증)
  r = await runSubmitProgress({
    code: 'XYZW',
    myId: 'u1',
    roomPath: 'lobby:matches:abcdef12',
    local: { idx: 10, score: 90, correctCount: 9 },
    initialRoom: {
      meta: { status: 'playing', seed: 2, mode: 'quote' },
      players: {
        u1: { name:'me', score:90, finished:false },
        u2: { name:'foe', score:70, finished:true },
        u3: { name:'foe2', score:80, finished:true }
      }
    }
  });
  assert(r.calls.setShared[0].key === 'lobby:matches:abcdef12:players:u1',
    'B: lobby 매치 — setShared key 가 roomPath 기반 (v59 버그 fix 의 핵심)');
  assert(r.finalRoom.meta.status === 'finished',
    'B: lobby 매치 — meta.status = finished (이전 v59 에서는 path 오류로 영구 playing)');

  // 시나리오 C: last-player race — 자기 직전 PUT 이 propagate 안 됐는데도 merge 가 보정
  r = await runSubmitProgress({
    code: 'RACE',
    myId: 'u1',
    staleSelfInFetch: true,
    local: { idx: 10, score: 100, correctCount: 10 },
    initialRoom: {
      meta: { status: 'playing', seed: 3, mode: 'vocab' },
      players: {
        u1: { name:'me', score:100, finished:false },  // stale 응답에서 false 로 돌아옴
        u2: { name:'foe', score:50, finished:true }
      }
    }
  });
  assert(r.finalRoom.meta.status === 'finished',
    'C: race — fresh.players[me] 이 stale (finished:false) 이어도 self-merge 로 allDone 통과');
  assert(r.calls.saveRoom.length === 1 && r.calls.saveRoom[0].players.u1.finished === true,
    'C: race — saveRoom 시 fresh.players[me] 도 finished:true 로 반영 (다른 player view 도 정상)');

  // 시나리오 D: 다른 player 가 아직 진행 중 — status flip 안 함
  r = await runSubmitProgress({
    code: 'WAIT',
    myId: 'u1',
    local: { idx: 10, score: 60, correctCount: 6 },
    initialRoom: {
      meta: { status: 'playing', seed: 4, mode: 'vocab' },
      players: {
        u1: { name:'me', score:60, finished:false },
        u2: { name:'foe', score:30, finished:false }  // 아직 진행 중
      }
    }
  });
  assert(r.finalRoom.meta.status === 'playing', 'D: 다른 player 진행 중이면 status 유지 (playing)');
  assert(r.calls.saveRoom.length === 0, 'D: saveRoom 안 호출');
  // 그러나 자기 player 객체는 정확히 finished:true 로 PUT 됨
  assert(r.finalRoom.players.u1.finished === true, 'D: 자기 finished:true 는 PUT 됨 (다른 player 의 watchdog 이 후속 처리)');

  console.log('\n========================================');
  console.log(`  ${pass} pass / ${fail} fail`);
  console.log('========================================');
  if(fail > 0) process.exit(1);
})();
