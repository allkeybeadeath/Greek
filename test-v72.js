// test-v72.js — 문법 유닛(Chase & Phillips 1~40과 진도) 데이터 · 커리큘럼 정렬 검증 (v72)
//
// 검증 범위:
//   1. 버전 상수 · 데이터 번들
//   2. data-units.js 구조 — 40개 유닛, 토픽 참조, 문항 모양
//   3. 기존 TOPICS 의 과 번호 교정 · 신규 토픽과 id 충돌 없음
//   4. 초보자 커리큘럼 — 문법 유닛 과제 1~39과가 한 번씩, 토픽 과제는 제 과에만
//   5. 정적 grep — 유닛 과제 디스패처 · 어휘 오타 수정 · SRS 키 이전
//
// 그리스어 형태 · 악센트 · 어휘 범위는 tools/build_units.py --check 가 검증한다 (Morpheus 캐시 필요).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
const unitsSrc = fs.readFileSync(path.join(__dirname, 'data-units.js'), 'utf8');

let pass = 0, fail = 0;
function assert(cond, msg){
  if(cond){ pass++; console.log('  ✓', msg); }
  else { fail++; console.log('  ✗', msg); }
}
function extractConst(name){
  const i = html.indexOf(`const ${name} = [`);
  if(i < 0) return null;
  const j = html.indexOf('\n];', i);
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(html.slice(i, j + 3).replace(`const ${name}`, `this.${name}`), ctx);
  return ctx[name];
}

console.log('\n=== §1. 버전 상수 · 데이터 번들 ===');
assert(/const APP_VERSION = 'v72';/.test(html), "index.html: APP_VERSION = 'v72'");
assert(/const CACHE_VERSION = 'v76';/.test(sw), "sw.js: CACHE_VERSION = 'v76'");
assert(/'\.\/data-units\.js'/.test(sw), 'sw.js DATA_BUNDLE 에 data-units.js');
assert(/<script src="data-units\.js"><\/script>/.test(html), 'index.html 이 data-units.js 를 싣는다');
assert(html.indexOf('<script src="data-units.js">') > html.indexOf('const TOPICS = ['),
  'data-units.js 는 TOPICS 정의 뒤에 실린다 (UNIT_TOPICS 를 TOPICS 에 합칠 수 있게)');

console.log('\n=== §2. data-units.js 구조 ===');
const TOPICS = extractConst('TOPICS');
assert(Array.isArray(TOPICS) && TOPICS.length > 30, `index.html TOPICS 추출 (${TOPICS ? TOPICS.length : 0}개)`);
const baseIds = new Set(TOPICS.map(t => t.id));
const ctx = {TOPICS: TOPICS.slice()};
vm.createContext(ctx);
vm.runInContext(unitsSrc + '\nthis.GRAMMAR_UNITS = GRAMMAR_UNITS; this.UNIT_TOPICS = UNIT_TOPICS;', ctx);
const U = ctx.GRAMMAR_UNITS, UT = ctx.UNIT_TOPICS;
assert(Array.isArray(U) && U.length === 40, `유닛 40개 (${U && U.length})`);
assert(U.every((u, i) => u.n === i + 1), '유닛 번호 1~40 이 순서대로');
assert(U.every(u => u.grk && u.title && u.summary && u.refs), '모든 유닛에 grk · title · summary · refs');
assert(UT.every(t => !baseIds.has(t.id)), '신규 토픽 id 가 기존 TOPICS 와 겹치지 않음');
assert(new Set(UT.map(t => t.id)).size === UT.length, '신규 토픽 id 중복 없음');
assert(ctx.TOPICS.length === TOPICS.length + UT.length, 'UNIT_TOPICS 가 TOPICS 에 합쳐짐');
const allIds = new Set(ctx.TOPICS.map(t => t.id));
const badRefs = [];
U.forEach(u => [...u.topics, ...(u.more || [])].forEach(id => { if(!allIds.has(id)) badRefs.push(`${u.n}:${id}`); }));
assert(badRefs.length === 0, `유닛의 토픽 참조가 모두 존재 ${badRefs.join(' ')}`);
assert(UT.every(t => t.lesson >= 1 && t.lesson <= 40 && t.title && t.expl), '신규 토픽의 과 번호 · 제목 · 설명');
const exU = U.filter(u => u.n >= 3);
assert(exU.every(u => u.forms.length >= 10 && u.tr.length >= 10 && u.comp.length >= 5),
  '3~40과: 형태 ≥10 · 해석 ≥10 · 작문 ≥5');
assert(U.filter(u => u.n <= 2).every(u => u.forms.length >= 10 && !u.tr.length && !u.comp.length),
  '1~2과: 글자 · 악센트 식별 문항만 (해석 · 작문 없음)');
let formsOk = true, trOk = true, compOk = true;
U.forEach(u => {
  u.forms.forEach(f => {
    if(!f.f || !f.a || !Array.isArray(f.o) || f.o.length !== 3 || f.o.includes(f.a) || new Set(f.o).size !== 3) formsOk = false;
  });
  u.tr.forEach(t => {
    if(!t.g || !t.k || !Array.isArray(t.w) || t.w.length !== 2 || t.w.includes(t.k) || !Array.isArray(t.gl)) trOk = false;
  });
  u.comp.forEach(c => {
    if(!c.k || !Array.isArray(c.c) || c.c.length < 2 || !Array.isArray(c.x) || !c.x.length) compOk = false;
    if(c.x.some(x => c.c.includes(x))) compOk = false;
    if(c.fx !== undefined && !(c.fx >= 0 && c.fx < c.c.length)) compOk = false;
    if(c.lx !== undefined && !(c.lx >= 0 && c.lx < c.c.length)) compOk = false;
    if(!['.', ';'].includes(c.e)) compOk = false;
  });
});
assert(formsOk, '형태 문항: 정답 1 + 서로 다른 오답 3');
assert(trOk, '해석 문항: 정답 1 + 오답 2 + 낱말 풀이');
assert(compOk, '작문 문항: 조각 ≥2 · 오답 조각 · 고정 위치 색인 · 문장 끝 부호');
const totalQ = U.reduce((a, u) => a + u.forms.length + u.tr.length + u.comp.length, 0);
assert(totalQ >= 1100, `연습문제 총 ${totalQ}문항`);
assert(/연습문제는 모두 새로 지은 것이다/.test(unitsSrc), '데이터 머리말: 교재 문장 복제 없음 명시');

console.log('\n=== §3. 기존 TOPICS 과 번호 교정 (교재 순서) ===');
const L = Object.fromEntries(TOPICS.map(t => [t.id, t.lesson]));
const expect = {
  'impf-act':8, 'aor1-act':8, 'aor2-act':8, 'pres-mp':25, 'didomi-pres':13, 'perf-act':31, 'infinitives':36,
  'comparison':9, 'numerals':37, 'fut-mid':25, 'aor1-mid':27, 'aor-pass':30, 'ptcp-pres-act':19, 'perf-mp':32,
  'ptcp-aor1-act':20, 'conditionals':27, 'subord-clauses':26, 'irreg-nouns':7, 'gen-abs':21, 'men-de':3,
};
const wrong = Object.entries(expect).filter(([id, l]) => L[id] !== l).map(([id, l]) => `${id}=${L[id]}(≠${l})`);
assert(wrong.length === 0, `교정된 과 번호 ${wrong.join(' ')}`);
// 유닛이 참조하는 기존 토픽은 그 유닛의 과보다 늦지 않아야 한다
const late = [];
U.forEach(u => u.topics.forEach(id => {
  const t = ctx.TOPICS.find(x => x.id === id);
  if(t && t.lesson < 99 && t.lesson > u.n) late.push(`${u.n}:${id}(${t.lesson})`);
}));
assert(late.length === 0, `유닛 토픽이 뒤 과의 내용을 앞당기지 않음 ${late.join(' ')}`);
const tblk = html.slice(html.indexOf('const TOPICS = ['), html.indexOf('\n];', html.indexOf('const TOPICS = [')));
assert(!/단순과거|불완료|가정법|희구법/.test(tblk), '문법 용어 통일 (부정과거 · 미완료 · 접속법 · 기원법)');
assert(tblk.includes('σοφώτερος ἢ σύ') && tblk.includes('ἀληθές ἐστιν') && tblk.includes('ὁ μὲν ἀνήρ … ὁ δὲ ἀνήρ'),
  '악센트 교정 (ἢ σύ · ἀληθές ἐστιν · μὲν/δὲ 둔음)');
assert(!/λῦσαι 는 ᾱ 위에/.test(tblk) && !/-οις는 αι\/οι를 단모음/.test(tblk), '악센트 설명 오류 제거 (λῦσαι · -οις)');

console.log('\n=== §4. 초보자 커리큘럼 ===');
const CUR = extractConst('BEGINNER_CURRICULUM');
assert(Array.isArray(CUR) && CUR.length === 60, `60일차 (${CUR && CUR.length})`);
const tasks = CUR.flatMap(d => d.tasks.map(t => ({day: d.day, t, d})));
const unitTasks = tasks.filter(x => x.t.type === 'unit');
const unitNs = unitTasks.map(x => x.t.unit);
assert(unitNs.length === 39 && unitNs.every((n, i) => n === i + 1), '문법 유닛 과제 1~39과가 순서대로 한 번씩');
assert(unitTasks.every(x => U.some(u => u.n === x.t.unit)), '유닛 과제가 존재하는 유닛을 가리킴');
const topicTasks = tasks.filter(x => x.t.type === 'topic');
assert(topicTasks.every(x => allIds.has(x.t.topicId)), '토픽 과제의 topicId 가 모두 존재');
// 일차 제목의 '레슨 N' 과 토픽 · 유닛의 과가 맞는지
const lessonOf = d => { const m = /레슨 (\d+)/.exec(d.koTitle); return m ? +m[1] : null; };
const misplaced = topicTasks.filter(x => { const l = lessonOf(x.d); const t = TOPICS.find(y => y.id === x.t.topicId); return l && t && t.lesson !== l; })
  .map(x => `Day${x.day}:${x.t.topicId}`);
assert(misplaced.length === 0, `토픽 과제가 제 과의 일차에만 ${misplaced.join(' ')}`);
const unitMis = unitTasks.filter(x => { const l = lessonOf(x.d); return l && l !== x.t.unit; }).map(x => `Day${x.day}:${x.t.unit}`);
assert(unitMis.length === 0, `유닛 과제가 제 과의 일차에 ${unitMis.join(' ')}`);
// 유닛 과제는 그 과의 마지막 일차에 (어휘를 다 배운 뒤)
const lastDayOfLesson = {};
CUR.forEach(d => { const l = lessonOf(d); if(l) lastDayOfLesson[l] = d.day; });
const early = unitTasks.filter(x => x.t.unit >= 3 && lastDayOfLesson[x.t.unit] && x.day !== lastDayOfLesson[x.t.unit])
  .map(x => `${x.t.unit}과@Day${x.day}`);
assert(early.length === 0, `유닛 과제는 그 과의 마지막 일차 ${early.join(' ')}`);
assert(!CUR.some(d => /단순과거|불완료/.test(d.koTitle + d.desc + d.tasks.map(t => t.title).join(''))), '일차 제목 · 설명의 용어 통일');

console.log('\n=== §5. 정적 grep ===');
assert(/} else if\(t\.type === 'unit'\)\{\s*renderCurriculumUnitTask\(day, taskIdx, t\.unit\);/.test(html), 'openCurriculumTask: unit 과제 분기');
assert(/function renderCurriculumUnitTask\(day, idx, n\)/.test(html), 'renderCurriculumUnitTask 정의');
assert(/function _unitCurriculumBar\(n\)/.test(html) && /_unitCurriculumBar\(n\);\s*view\.scrollTop = 0;/.test(html),
  '유닛 화면에 일차 과제 막대 (연습 뒤 복귀해도 유지)');
assert(/function renderGrammar\(\)\{\s*window\._unitCurriculumCtx = null;/.test(html), '문법 탭 진입 시 과제 맥락 해제');
assert(/function renderCurriculumDay\(n\)\{\s*window\._unitCurriculumCtx = null;/.test(html), '일차 화면 진입 시 과제 맥락 해제');
assert(/\{g:"ἁμαρτάνω",r:"\+속격",pos:"V",l:26/.test(html) && !/\{g:"ἀμαρτάνω"/.test(html), '교재 어휘 표제어 오타 수정 (ἁμαρτάνω)');
assert(/if\(S\.srs\['ἀμαρτάνω'\]\)\{/.test(html), 'SRS 기록을 새 표제어 키로 이전');
const tw = html.slice(html.indexOf('const TEXTBOOK_W = ['), html.indexOf('\n];', html.indexOf('const TEXTBOOK_W = [')));
['ἀεί', 'ἀλήθεια', 'ἄνεμος', 'τείνω', 'ἐθέλω', 'στρατηγός', 'αἰσχρός', 'δίδωμι', 'κακῶς ἔχω', 'ἀγνοέω', 'ἀγωνίζομαι']
  .forEach(g => assert(tw.includes(`{g:"${g}"`), `교재 어휘 보충: ${g}`));
assert(/낱말 끝의 -αι 는 악센트 규칙에서 짧게/.test(html) && /낱말 끝의 -οι 는 악센트 규칙에서 짧게/.test(html),
  '이중모음 팁 교정 (끝의 -αι · -οι 는 짧게)');
assert(fs.existsSync(path.join(__dirname, 'tools', 'build_units.py')) && fs.existsSync(path.join(__dirname, 'units-src', 'u40.txt')),
  '빌드 도구와 유닛 원본 (tools/build_units.py · units-src/)');

console.log(`\n결과: ${pass} 통과 · ${fail} 실패`);
process.exit(fail ? 1 : 0);
