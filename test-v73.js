// test-v73.js — 문법 유닛 해석 · 작문 문항의 원전 발췌 전환 검증 (v73)
//
// 검증 범위:
//   1. 버전 상수 · 데이터 번들
//   2. data-units.js 구조 — 40개 유닛, 토픽 참조, 문항 모양 (v72 와 같은 틀)
//   3. 원전 발췌 — 3~40과 해석 · 작문 문항 모두 출처('s'), 출처 형식, 저자 · 작품 고루, 문장 중복 없음
//   4. 뜻풀이 행 (gl) — [형태, 표제어, 뜻, 분석, 새 낱말 1/0], 새 낱말엔 뜻이 있다, 작문 조각 규칙
//   5. 커리큘럼 · 기존 TOPICS (v72 에서 이어지는 회귀 검사)
//   6. 도구 · 원본 — find_excerpts · locate_excerpt · glossary · manual_forms · 악센트 규칙
//   7. 정적 grep — UI 의 출처 · 뜻풀이 표시, 안내 문구
//
// 그리스어 형태 · 악센트 · 과별 문법 범위는 tools/build_units.py 가 검증한다 (Morpheus 캐시 필요).

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
const unitsSrc = fs.readFileSync(path.join(__dirname, 'data-units.js'), 'utf8');
const util = fs.readFileSync(path.join(__dirname, 'tools', 'greek_util.py'), 'utf8');
const build = fs.readFileSync(path.join(__dirname, 'tools', 'build_units.py'), 'utf8');

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
assert(/const APP_VERSION = 'v73';/.test(html), "index.html: APP_VERSION = 'v73'");
assert(/const CACHE_VERSION = 'v77';/.test(sw), "sw.js: CACHE_VERSION = 'v77'");
assert(/'\.\/data-units\.js'/.test(sw), 'sw.js DATA_BUNDLE 에 data-units.js');
assert(/<script src="data-units\.js"><\/script>/.test(html), 'index.html 이 data-units.js 를 싣는다');

console.log('\n=== §2. data-units.js 구조 ===');
const TOPICS = extractConst('TOPICS');
assert(Array.isArray(TOPICS) && TOPICS.length > 30, `index.html TOPICS 추출 (${TOPICS ? TOPICS.length : 0}개)`);
const baseIds = new Set(TOPICS.map(t => t.id));
const ctx = {TOPICS: TOPICS.slice()};
vm.createContext(ctx);
vm.runInContext(unitsSrc + '\nthis.GRAMMAR_UNITS = GRAMMAR_UNITS; this.UNIT_TOPICS = UNIT_TOPICS;', ctx);
const U = ctx.GRAMMAR_UNITS, UT = ctx.UNIT_TOPICS;
assert(Array.isArray(U) && U.length === 40 && U.every((u, i) => u.n === i + 1), '유닛 40개, 번호 1~40 순서대로');
assert(U.every(u => u.grk && u.title && u.summary && u.refs), '모든 유닛에 grk · title · summary · refs');
assert(UT.every(t => !baseIds.has(t.id)) && new Set(UT.map(t => t.id)).size === UT.length, '신규 토픽 id 가 기존 · 서로와 겹치지 않음');
const allIds = new Set(ctx.TOPICS.map(t => t.id));
const badRefs = [];
U.forEach(u => [...u.topics, ...(u.more || [])].forEach(id => { if(!allIds.has(id)) badRefs.push(`${u.n}:${id}`); }));
assert(badRefs.length === 0, `유닛의 토픽 참조가 모두 존재 ${badRefs.join(' ')}`);
const exU = U.filter(u => u.n >= 3);
assert(exU.every(u => u.forms.length >= 10 && u.tr.length >= 10 && u.comp.length >= 5), '3~40과: 형태 ≥10 · 해석 ≥10 · 작문 ≥5');
assert(U.filter(u => u.n <= 2).every(u => u.forms.length >= 10 && !u.tr.length && !u.comp.length), '1~2과: 글자 · 악센트 식별 문항만');
let formsOk = true, trOk = true, compOk = true;
U.forEach(u => {
  u.forms.forEach(f => {
    if(!f.f || !f.a || !Array.isArray(f.o) || f.o.length !== 3 || f.o.includes(f.a) || new Set(f.o).size !== 3) formsOk = false;
  });
  u.tr.forEach(t => {
    if(!t.g || !t.k || !Array.isArray(t.w) || t.w.length !== 2 || t.w.includes(t.k) || new Set(t.w).size !== 2 || !Array.isArray(t.gl)) trOk = false;
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
assert(trOk, '해석 문항: 정답 1 + 서로 다른 오답 2 + 낱말 풀이');
assert(compOk, '작문 문항: 조각 ≥2 · 오답 조각 · 고정 위치 색인 · 문장 끝 부호');
const nTr = U.reduce((a, u) => a + u.tr.length, 0), nComp = U.reduce((a, u) => a + u.comp.length, 0);
const totalQ = U.reduce((a, u) => a + u.forms.length + u.tr.length + u.comp.length, 0);
assert(nTr >= 600 && nComp >= 220 && totalQ >= 1300, `연습문제 총 ${totalQ}문항 (해석 ${nTr} · 작문 ${nComp})`);

console.log('\n=== §3. 원전 발췌 — 출처 ===');
const sourced = U.flatMap(u => [...u.tr, ...u.comp].map(x => ({u: u.n, x})));
const noSrc = sourced.filter(r => typeof r.x.s !== 'string' || !r.x.s.trim());
assert(noSrc.length === 0, `3~40과 해석 · 작문 문항 모두 출처 's' (${sourced.length}문항, 없는 것 ${noSrc.length})`);
const AUTHORS = ['크세노폰', '위(僞)크세노폰', '플라톤', '뤼시아스', '데모스테네스', '아이스키네스', '안티폰', '안도키데스',
  '투퀴디데스', '아리스토텔레스', '아이스퀼로스', '소포클레스', '플루타르코스', '디오게네스 라에르티오스', '신약',
  '호메로스', '헤시오도스', '헤로도토스', '에우리피데스', '아리스토파네스', '히포크라테스'];
const SRC_RE = new RegExp(`^(${AUTHORS.map(a => a.replace(/[()]/g, '\\$&')).join('|')}), 『[^』]+』 \\S.*$|^이솝 우화 \\((Halm|Chambry) \\d+\\) 「[^」]+」( \\(일부\\))?$`);
const badSrc = sourced.filter(r => !SRC_RE.test(r.x.s || '')).map(r => `${r.u}:${r.x.s}`);
assert(badSrc.length === 0, `출처 형식 '저자, 『작품』 위치' 또는 '이솝 우화 (판 번호) 「제목」' ${badSrc.slice(0, 3).join(' | ')}`);
const ntBad = sourced.filter(r => /^신약, /.test(r.x.s) && !/^신약, 『[^』]+』 \d+:\d+(–\d+)?( \(일부\))?$/.test(r.x.s)).map(r => r.x.s);
assert(ntBad.length === 0, `신약 출처는 '장:절' ${ntBad.slice(0, 3).join(' | ')}`);
const byAuthor = {};
const works = new Set();
sourced.forEach(r => {
  const m = /^([^,]+), (『[^』]+』)/.exec(r.x.s);
  const a = m ? m[1] : '이솝 우화';
  byAuthor[a] = (byAuthor[a] || 0) + 1;
  works.add(m ? m[1] + m[2] : r.x.s.replace(/ \(일부\)$/, ''));
});
assert(Object.keys(byAuthor).length >= 12, `저자 ${Object.keys(byAuthor).length}명 — ${Object.entries(byAuthor).sort((a, b) => b[1] - a[1]).map(([a, n]) => a + ' ' + n).join(' · ')}`);
assert(works.size >= 60, `작품 ${works.size}편에서 발췌`);
// 빠진 저작 없이 — 신약 27권과 읽기 서재(WORK_GROUPS)의 모든 작품에서 한 문장 이상
const srcs = sourced.map(r => r.x.s);
const NT_BOOKS = ['마태복음', '마가복음', '누가복음', '요한복음', '사도행전', '로마서', '고린도전서', '고린도후서', '갈라디아서',
  '에베소서', '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서', '디모데후서', '디도서', '빌레몬서',
  '히브리서', '야고보서', '베드로전서', '베드로후서', '요한1서', '요한2서', '요한3서', '유다서', '요한계시록'];
const ntMissing = NT_BOOKS.filter(b => !srcs.some(s => s.startsWith(`신약, 『${b}』 `)));
assert(ntMissing.length === 0, `신약 27권 모두에서 발췌 (빠진 책: ${ntMissing.join(' · ') || '없음'})`);
// 장 단위로도 빠짐없이 — 신약 260장 모두 (책별 장 수, 표준 장 구분)
const NT_CH = [28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
const chHave = new Set(srcs.map(s => /^신약, 『([^』]+)』 (\d+):/.exec(s)).filter(Boolean).map(m => `${m[1]} ${m[2]}`));
const chMissing = NT_BOOKS.flatMap((b, i) => Array.from({length: NT_CH[i]}, (_, k) => `${b} ${k + 1}`)).filter(c => !chHave.has(c));
assert(NT_CH.reduce((a, b) => a + b, 0) === 260 && chMissing.length === 0, `신약 260장 모두에서 발췌 (빠진 장: ${chMissing.slice(0, 8).join(' · ') || '없음'})`);
const LIB = {
  'homer-iliad': '호메로스, 『일리아스』', 'homer-odyssey': '호메로스, 『오뒷세이아』',
  'hesiod-theogony': '헤시오도스, 『신통기』', 'hesiod-wd': '헤시오도스, 『일과 날』',
  'aeschylus-persians': '아이스퀼로스, 『페르시아인들』', 'sophocles-antigone': '소포클레스, 『안티고네』',
  'sophocles-oedipus': '소포클레스, 『오이디푸스 왕』', 'euripides-medea': '에우리피데스, 『메데이아』',
  'aristophanes-clouds': '아리스토파네스, 『구름』', 'plato-euthyphro': '플라톤, 『에우튀프론』',
  'plato-apology': '플라톤, 『소크라테스의 변론』', 'plato-crito': '플라톤, 『크리톤』', 'plato-phaedo': '플라톤, 『파이돈』',
  'herodotus-1': '헤로도토스, 『역사』 1.', 'thucydides-1': '투퀴디데스, 『펠로폰네소스 전쟁사』 1.',
  'xenophon-anabasis-1': '크세노폰, 『아나바시스』 1.', 'plutarch-themistocles': '플루타르코스, 『테미스토클레스 전』',
  'hippocrates-epidemics': '히포크라테스, 『유행병』', 'hippocrates-aphorisms': '히포크라테스, 『잠언』',
  'hippocrates-oath': '히포크라테스, 『선서』'};
const wg = html.slice(html.indexOf('const WORK_GROUPS = ['), html.indexOf('function _resolveWork'));
const libIds = [...new Set([...wg.matchAll(/works:\[([^\]]*)\]/g)].flatMap(m => [...m[1].matchAll(/'([a-z0-9-]+)'/g)].map(x => x[1])))]
  .filter(id => !id.startsWith('nt-'));
const libKey = id => Object.keys(LIB).find(k => id === k || id.startsWith(k + '-'));
const libMissing = libIds.filter(id => !libKey(id) || !srcs.some(s => s.startsWith(LIB[libKey(id)])));
assert(libIds.length >= 20 && libMissing.length === 0, `읽기 서재 작품 ${libIds.length}개 모두 발췌가 있음 (빠진 것: ${libMissing.join(' · ') || '없음'})`);
const maxShare = Math.max(...Object.values(byAuthor)) / sourced.length;
assert(maxShare < 0.4, `한 저자가 40% 를 넘지 않음 (최대 ${(maxShare * 100).toFixed(1)}%)`);
const seenG = {};
const dupTr = [];
U.forEach(u => u.tr.forEach(t => { if(seenG[t.g]) dupTr.push(`${seenG[t.g]}/${u.n}`); seenG[t.g] = u.n; }));
assert(dupTr.length === 0, `해석 문장이 유닛 사이에 겹치지 않음 ${dupTr.join(' ')}`);
const seenC = {};
const dupComp = [];
U.forEach(u => u.comp.forEach(c => { const j = c.c.join(' '); if(seenC[j]) dupComp.push(`${seenC[j]}/${u.n}`); seenC[j] = u.n; }));
assert(dupComp.length === 0, `작문 조각 묶음이 겹치지 않음 ${dupComp.join(' ')}`);
assert(U.every(u => u.tr.every(t => /[Ͱ-Ͽἀ-῿]/.test(t.g))), '해석 문항 g 는 그리스어');
assert(/해석 · 작문 문장은 고대 저자의 원전에서 발췌했다 \(문항마다 출처 's'\)\. 교재 문장 복제 없음\./.test(unitsSrc),
  '데이터 머리말: 원전 발췌 · 교재 문장 복제 없음 명시');
assert(!/연습문제는 모두 새로 지은 것이다/.test(unitsSrc), '머리말에서 v72 의 "모두 새로 지었다" 문구 제거');

console.log('\n=== §4. 뜻풀이 행 · 작문 조각 ===');
let glShape = true, glNewOk = true, glEvery = true;
sourced.forEach(({x}) => {
  if(!Array.isArray(x.gl) || !x.gl.length){ glEvery = false; return; }
  x.gl.forEach(r => {
    if(!Array.isArray(r) || r.length !== 5 || typeof r[0] !== 'string' || !r[0] || typeof r[1] !== 'string'
       || typeof r[2] !== 'string' || typeof r[3] !== 'string' || ![0, 1].includes(r[4])) glShape = false;
    else if(r[4] === 1 && !r[2].trim()) glNewOk = false;
  });
});
assert(glEvery, '해석 · 작문 문항마다 낱말 풀이 (gl) 가 있다');
assert(glShape, 'gl 행 = [형태, 표제어, 뜻, 분석, 새 낱말 0/1]');
assert(glNewOk, '새 낱말 (뒤 과 · 교재 밖) 에는 반드시 뜻풀이');
const glOk2 = sourced.every(({x}) => x.gl.every(r => !r[2].includes(';;')));
assert(glOk2, '뜻풀이 문자열 오염 없음');
const POSTPOS = ['δέ', 'δὲ', 'γάρ', 'γὰρ', 'μέν', 'μὲν', 'οὖν', 'δή', 'δὴ', 'τε', 'γε', 'ἄν', 'ἂν', 'τοι', 'μέντοι', 'δ᾽', 'τ᾽', 'γ᾽'];
const badHead = U.flatMap(u => u.comp.flatMap(c => [...c.c, ...c.x].filter(ch => POSTPOS.includes(ch.split(' ')[0])).map(ch => `${u.n}:${ch}`)));
assert(badHead.length === 0, `작문 조각이 후치사 · 전접어로 시작하지 않음 ${badHead.slice(0, 4).join(' ')}`);
const graveEnd = U.flatMap(u => u.comp.flatMap(c => [...c.c, ...c.x].filter(ch => /̀$/.test(ch.normalize('NFD').split(' ').pop()))));
assert(graveEnd.length === 0, `조각 끝 낱말은 둔음이 아니라 예음으로 적는다 ${graveEnd.slice(0, 4).join(' ')}`);
const strict = U.flatMap(u => u.comp).filter(c => c.seq).length;
// 모범 답안(c 의 순서)이 자기 어순 제약을 만족해야 한다 — 맨 앞 고정 fx 는 0, 맨 뒤 고정 lx 는 마지막 (v73: τε 조각이 fx 3 이 되어 정답이 오답 처리되던 버그)
const selfBad = U.flatMap(u => u.comp.filter(c => (c.fx !== undefined && c.fx !== 0) || (c.lx !== undefined && c.lx !== c.c.length - 1)).map(c => `${u.n}:${c.c.join('/')}`));
assert(selfBad.length === 0, `작문 모범 답안이 자기 어순 제약(fx · lx)을 만족 ${selfBad.slice(0, 3).join(' | ')}`);
assert(/WORD_POSTPOSITIVES = \{'τε', 'γε', 'τοι'\}/.test(fs.readFileSync(path.join(__dirname, 'tools/build_units.py'), 'utf8')),
  '빌드: τε · γε · τοι 는 작문 조각 자리를 고정하지 않는다 (WORD_POSTPOSITIVES)');
assert(strict >= 10, `순서를 고정한 작문 (후치사 조각 둘 이상 · '순서' 주석) ${strict}문항`);

console.log('\n=== §5. 커리큘럼 · 기존 TOPICS (회귀) ===');
const L = Object.fromEntries(TOPICS.map(t => [t.id, t.lesson]));
const expect = {'impf-act':8, 'aor1-act':8, 'pres-mp':25, 'perf-act':31, 'infinitives':36, 'numerals':37, 'aor-pass':30, 'perf-mp':32, 'gen-abs':21};
const wrong = Object.entries(expect).filter(([id, l]) => L[id] !== l).map(([id, l]) => `${id}=${L[id]}(≠${l})`);
assert(wrong.length === 0, `기존 토픽의 과 번호 ${wrong.join(' ')}`);
const CUR = extractConst('BEGINNER_CURRICULUM');
const tasks = CUR.flatMap(d => d.tasks.map(t => ({day: d.day, t, d})));
const unitNs = tasks.filter(x => x.t.type === 'unit').map(x => x.t.unit);
assert(CUR.length === 60 && unitNs.length === 39 && unitNs.every((n, i) => n === i + 1), '60일차 과정에 문법 유닛 과제 1~39과가 순서대로');
assert(tasks.filter(x => x.t.type === 'topic').every(x => allIds.has(x.t.topicId)), '토픽 과제의 topicId 가 모두 존재');

console.log('\n=== §6. 도구 · 원본 ===');
['find_excerpts.py', 'locate_excerpt.py', 'build_units.py', 'greek_util.py', 'manual_forms.tsv'].forEach(f =>
  assert(fs.existsSync(path.join(__dirname, 'tools', f)), `tools/${f}`));
const gloss = fs.readFileSync(path.join(__dirname, 'units-src', 'glossary.tsv'), 'utf8').split('\n').filter(l => l && !l.startsWith('#'));
assert(gloss.length >= 500 && gloss.every(l => l.split('\t').length === 2 && l.split('\t')[1].trim()), `units-src/glossary.tsv ${gloss.length}행 (표제어<TAB>뜻)`);
const glossKeys = gloss.map(l => l.split('\t')[0].replace(/^!/, ''));
const dupGloss = glossKeys.filter((k, i) => glossKeys.indexOf(k) !== i);
assert(dupGloss.length === 0, `뜻풀이 표제어 중복 없음 ${dupGloss.slice(0, 5).join(' ')}`);
const manual = fs.readFileSync(path.join(__dirname, 'tools', 'manual_forms.tsv'), 'utf8').split('\n').filter(l => l && !l.startsWith('#'));
assert(manual.every(l => l.split('\t').length >= 4 && l.split('\t')[3].trim()), `manual_forms.tsv ${manual.length}행 — 모두 근거 열이 있다`);
const unitSrcFiles = fs.readdirSync(path.join(__dirname, 'units-src')).filter(f => /^u\d\d\.txt$/.test(f));
assert(unitSrcFiles.length === 40, 'units-src/u01~u40.txt');
const srcLines = unitSrcFiles.filter(f => +f.slice(1, 3) >= 3).map(f => fs.readFileSync(path.join(__dirname, 'units-src', f), 'utf8'));
assert(srcLines.every(s => /^@src /m.test(s)), '3~40과 원본마다 @src 줄');
assert(/ELIDED_ENCLITICS = \{'γ', 'τ', 'θ', 'μ', 'σ'\}/.test(util) && /ELIDED_ESTI = \{'εστ', 'εσθ'\}/.test(util),
  '악센트 규칙: 생략된 전접어 (γ᾽ · τ᾽ · μ᾽ · σ᾽ · ἐστ᾽ · ἐσθ᾽)');
assert(/EIMI_AFTER_NEG = /.test(util) && /'아니오' 라는 낱말로 쓴 οὐ/.test(util), "악센트 규칙: οὐκ + εἰμί 의 제 악센트 · '아니오' 로 쓴 οὒ οὔ");
assert(/DISPREFER = \{/.test(build) && /def allowed_auth\(/.test(build), '빌드: 원전 발췌 게이트 (allowed_auth) · 드문 표제어 뒤로 (DISPREFER)');
assert(!/'μυρίος': 'μύριοι'/.test(build), "μυρίος '수없이 많은' 을 μύριοι '1만' 에 합치지 않는다");

console.log('\n=== §7. 정적 grep — UI ===');
assert(/function _unitSrcHtml\(s\)\{/.test(html) && /<div class="u-src">— \$\{escapeHtml\(s\)\}<\/div>/.test(html), '출처 표시 _unitSrcHtml (.u-src)');
assert(/function _unitNewWordsHtml\(gl\)\{/.test(html) && /class="u-new"><span class="k">뜻풀이<\/span>/.test(html), '새 낱말 뜻풀이 _unitNewWordsHtml (.u-new)');
assert((html.match(/\$\{_unitSrcHtml\(d\.s\)\}/g) || []).length === 2 && (html.match(/\$\{_unitNewWordsHtml\(d\.gl\)\}/g) || []).length === 2,
  '해석 · 작문 화면 둘 다 출처와 뜻풀이를 답하기 전에 보여 준다');
assert(/\.u-src\{/.test(html) && /\.u-new\{/.test(html), '.u-src · .u-new 스타일');
assert(/해석 · 작문 문장은 크세노폰 · 플라톤 · 뤼시아스 · 이솝 · 신약 같은 고대 원전에서 \$\{n\}과까지 배운 문법에 맞는 것만 골라 발췌했습니다/.test(html),
  '유닛 화면 안내: 원전 발췌 · 그 과까지의 문법');
assert(/해석 · 작문 문장은 v73 부터 고대 원전 발췌다/.test(html), '코드 주석의 v72 문구 갱신');

console.log(`\n결과: ${pass} 통과 · ${fail} 실패`);
process.exit(fail ? 1 : 0);
