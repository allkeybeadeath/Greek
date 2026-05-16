#!/usr/bin/env node
/* test-v54.js — v54 캐릭터 사진 broken-image 핫픽스 검증
 * ============================================================================
 * v54 변경사항 회귀 테스트:
 *   1. 50 캐릭터 ID 가 CHARACTERS 배열에 모두 보존 (구조 변경 없음)
 *   2. CHARACTER_IMAGES 정확히 41 entries
 *   3. 9 미수록 ID set 이 예상과 일치
 *   4. 41 entries 모두 Special:FilePath 패턴 + width=240 + caption + license 보유
 *   5. APP_VERSION = 'v54', CACHE_VERSION = 'v54'
 *   6. _charPhotoMedallion 의 SVG 폴백 분기 보존 (CHARACTER_IMAGES[id] === undefined → _charMedallion)
 *
 * 실행: node test-v54.js
 * 종료 코드: 0 (전체 통과), 1 (실패 있음)
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ANSI 색상
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', C = '\x1b[36m', X = '\x1b[0m';

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) {
    console.log(`  ${G}✓${X} ${name}${detail ? `  ${C}${detail}${X}` : ''}`);
    pass++;
  } else {
    console.log(`  ${R}✗${X} ${name}${detail ? `  ${R}${detail}${X}` : ''}`);
    fail++;
  }
}

console.log(`\n${C}══ v54 회귀 테스트 ══${X}\n`);

// ─────────────────────────────────────────────────────────────────
// (1) data-characters.js 로드 및 구조 검증
// ─────────────────────────────────────────────────────────────────
console.log(`${Y}[1] data-characters.js 구조${X}`);

const dcPath = path.join(ROOT, 'data-characters.js');
const dcSrc = fs.readFileSync(dcPath, 'utf8');

// 브라우저 window 시뮬레이션
global.window = {};
eval(dcSrc);
const CHARACTER_IMAGES = global.window.CHARACTER_IMAGES;

check('window.CHARACTER_IMAGES 존재', typeof CHARACTER_IMAGES === 'object' && CHARACTER_IMAGES !== null);

const photoIds = Object.keys(CHARACTER_IMAGES);
check('CHARACTER_IMAGES entry 수 == 41', photoIds.length === 41, `실제: ${photoIds.length}`);

// 헤더에 v54 명시
check('헤더에 v54 명시', /v54/.test(dcSrc.split('\n').slice(0, 30).join('\n')));

// 예상 미수록 9 IDs (entry 자체 제거됨)
const expectedRemoved = ['diomedes','orpheus','aeneas','penelope','atalanta','medea','empedocles','herodotus','solon'];
for (const id of expectedRemoved) {
  check(`'${id}' entry 제거됨 (SVG 폴백 대상)`, CHARACTER_IMAGES[id] === undefined);
}

// ─────────────────────────────────────────────────────────────────
// (2) 41 entry 의 url/caption/license 구조 검증
// ─────────────────────────────────────────────────────────────────
console.log(`\n${Y}[2] 41 entry url/caption/license 무결성${X}`);

const URL_PREFIX = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const URL_SUFFIX = '?width=240';

let urlValid = 0, urlInvalid = [];
let captionValid = 0, captionMissing = [];
let licenseValid = 0, licenseMissing = [];

for (const id of photoIds) {
  const e = CHARACTER_IMAGES[id];
  if (e.url && e.url.startsWith(URL_PREFIX) && e.url.endsWith(URL_SUFFIX)) urlValid++;
  else urlInvalid.push(id);

  if (typeof e.caption === 'string' && e.caption.length > 0) captionValid++;
  else captionMissing.push(id);

  if (typeof e.license === 'string' && e.license.length > 0) licenseValid++;
  else licenseMissing.push(id);
}

check('41 entry 모두 Special:FilePath 패턴 + ?width=240', urlValid === 41, urlInvalid.length ? `위반: ${urlInvalid.join(',')}` : '');
check('41 entry 모두 caption 보유', captionValid === 41, captionMissing.length ? `누락: ${captionMissing.join(',')}` : '');
check('41 entry 모두 license 보유', licenseValid === 41, licenseMissing.length ? `누락: ${licenseMissing.join(',')}` : '');

// ─────────────────────────────────────────────────────────────────
// (3) v54 정정된 14 entry url 확인 (회귀 방지)
// ─────────────────────────────────────────────────────────────────
console.log(`\n${Y}[3] v54 정정된 14 파일명 회귀 방지${X}`);

const v54Fixes = {
  zeus: 'Zeus_Otricoli_Pio-Clementino_Inv257.jpg',
  poseidon: 'Bronze_statue_of_Zeus_or_Poseidon.jpg',
  ares: 'Ares_Borghese_Louvre_Ma_866_n01.jpg',
  hephaestus: 'Jouvenet_Forge_of_Vulcan.jpg',
  heracles: 'Herakles_Farnese_MAN_Napoli_Inv6001_n01.jpg',
  ajax: 'Exekias_Suicide_d_Ajax_01.jpg',
  hestia: 'Hestia_Giustiniani.jpg',
};

for (const [id, expectedFile] of Object.entries(v54Fixes)) {
  const e = CHARACTER_IMAGES[id];
  const expectedUrl = URL_PREFIX + expectedFile + URL_SUFFIX;
  check(`'${id}' url == v54 정정 파일명`, e && e.url === expectedUrl, e ? `현재: ${e.url}` : 'entry 없음');
}

// v53 의 잘못된 패턴이 *다시 나타나면* fail
const badPatterns = [
  { id: 'zeus',    bad: 'Bust_Zeus_Otricoli' },
  { id: 'ares',    bad: 'Ma866' },             // 언더스코어 없는 형식
  { id: 'hestia',  bad: 'Hestia_Giustiniani_Torlonia' },
  { id: 'ajax',    bad: 'Ajax_05' },           // 존재 안 함
];
for (const { id, bad } of badPatterns) {
  const e = CHARACTER_IMAGES[id];
  check(`'${id}' url 에 v53 잘못된 패턴 '${bad}' 없음`, e && !e.url.includes(bad));
}

// ─────────────────────────────────────────────────────────────────
// (4) index.html 의 50 캐릭터 ID 보존 + 폴백 로직 보존
// ─────────────────────────────────────────────────────────────────
console.log(`\n${Y}[4] index.html — CHARACTERS 배열 + 폴백 로직${X}`);

const idxPath = path.join(ROOT, 'index.html');
const idxSrc = fs.readFileSync(idxPath, 'utf8');

// APP_VERSION
const appVerMatch = idxSrc.match(/const APP_VERSION = '(v[0-9]+)';/);
check('APP_VERSION == v54', appVerMatch && appVerMatch[1] === 'v54', appVerMatch ? `현재: ${appVerMatch[1]}` : '미발견');

// CHARACTERS 배열에서 ID 추출 (간단 휴리스틱: id:'xxx' 패턴)
const charsRegion = idxSrc.match(/const CHARACTERS\s*=\s*\[([\s\S]*?)\];/);
let charIds = [];
if (charsRegion) {
  const m = charsRegion[1].match(/id:\s*['"]([a-z_]+)['"]/g) || [];
  charIds = m.map(s => s.replace(/id:\s*['"]([a-z_]+)['"]/, '$1'));
}
check('CHARACTERS 배열에 정확히 50 ID', charIds.length === 50, `실제: ${charIds.length}`);

// 41 photo IDs 가 모두 CHARACTERS 에 있어야 함
const missingFromChars = photoIds.filter(id => !charIds.includes(id));
check('41 photo ID 가 CHARACTERS 배열에 모두 존재', missingFromChars.length === 0, missingFromChars.length ? `누락: ${missingFromChars.join(',')}` : '');

// 9 SVG 폴백 ID 도 CHARACTERS 에 있어야 함 (캐릭터 자체는 보존)
const fallbackMissing = expectedRemoved.filter(id => !charIds.includes(id));
check('9 SVG 폴백 ID 도 CHARACTERS 배열에 보존', fallbackMissing.length === 0, fallbackMissing.length ? `누락: ${fallbackMissing.join(',')}` : '');

// _charPhotoMedallion 함수에 폴백 분기 보존
check('_charPhotoMedallion 함수 존재', idxSrc.includes('_charPhotoMedallion'));
check('SVG 폴백 분기 (!meta || !meta.url → _charMedallion) 보존',
  /if\s*\(\s*!meta\s*\|\|\s*!meta\.url\s*\)\s*return\s+_charMedallion/.test(idxSrc));

// ─────────────────────────────────────────────────────────────────
// (5) sw.js — CACHE_VERSION
// ─────────────────────────────────────────────────────────────────
console.log(`\n${Y}[5] sw.js — CACHE_VERSION${X}`);

const swPath = path.join(ROOT, 'sw.js');
const swSrc = fs.readFileSync(swPath, 'utf8');

const cacheVerMatch = swSrc.match(/const CACHE_VERSION\s*=\s*'(v[0-9]+)';/);
check('CACHE_VERSION == v54', cacheVerMatch && cacheVerMatch[1] === 'v54', cacheVerMatch ? `현재: ${cacheVerMatch[1]}` : '미발견');

// IMG_CACHE 자동 bump (paideia-img-v54)
check('IMG_CACHE 가 CACHE_VERSION 으로 자동 bump 되는 구조',
  /IMG_CACHE\s*=\s*`paideia-img-\$\{CACHE_VERSION\}`/.test(swSrc));

// DATA_BUNDLE 에 data-characters.js 포함
check('DATA_BUNDLE 에 data-characters.js 포함', swSrc.includes('data-characters.js'));

// ─────────────────────────────────────────────────────────────────
// 결과 요약
// ─────────────────────────────────────────────────────────────────
console.log(`\n${C}══ 결과: ${G}${pass} pass${X} / ${fail > 0 ? R : C}${fail} fail${X} ══\n`);
process.exit(fail > 0 ? 1 : 0);
