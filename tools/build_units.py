#!/usr/bin/env python3
"""문법 유닛 빌드 — units-src/uNN.txt → data-units.js

Chase & Phillips, *A New Introduction to Greek* 의 1~40과 진도를 따라 문법을 유닛으로 묶는다.
교재의 연습문제 문장은 옮기지 않는다(저작권 보호 — 1989 갱신 RE440155). 문제는 모두 새로 지었다.

검증 (하나라도 실패하면 data-units.js 를 쓰지 않는다)
  1. Morpheus 형태분석 — 악센트까지 맞아야 분석 결과가 나온다.
  2. 문맥 악센트 — 둔음 규칙, 전접어 앞뒤 악센트 (greek_util.check_sentence_accents).
  3. 과별 게이트 — 유닛 N 의 문장은 N과까지 나온 어휘(TEXTBOOK_W)와 N과까지 배운 문법만 쓴다.
  4. 형태 문항의 분석 코드가 Morpheus 분석과 일치.

사용
  python3 tools/build_units.py            # 검증 + 빌드
  python3 tools/build_units.py --check    # 검증만
  python3 tools/build_units.py --only 5   # 특정 유닛만 검증 (빌드 안 함)
  python3 tools/build_units.py --offline  # 캐시에 없는 낱말은 조회하지 않고 실패 처리
"""
import argparse
import glob
import hashlib
import json
import os
import random
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import greek_util as G  # noqa: E402
import morpheus  # noqa: E402

SRC_DIR = os.path.join(ROOT, 'units-src')
OUT_PATH = os.path.join(ROOT, 'data-units.js')
MANUAL_PATH = os.path.join(HERE, 'manual_forms.tsv')

# ── 한국어 라벨 ─────────────────────────────────────────────────────────────
KO = {
    'pres': '현재', 'impf': '미완료', 'fut': '미래', 'aor': '부정과거', 'perf': '완료',
    'plpf': '과거완료', 'futperf': '미래완료',
    'act': '능동', 'mid': '중간', 'pass': '수동', 'mp': '중·수동',
    'ind': '직설', 'subj': '접속', 'opt': '기원', 'imp': '명령', 'inf': '부정사', 'ptcp': '분사',
    'sg': '단수', 'pl': '복수', 'du': '쌍수',
    'nom': '주격', 'gen': '속격', 'dat': '여격', 'acc': '대격', 'voc': '호격',
    'm': '남성', 'f': '여성', 'n': '중성',
    'comp': '비교급', 'sup': '최상급',
}
TENSES = ['pres', 'impf', 'fut', 'aor', 'perf', 'plpf', 'futperf']
MOODS = ['ind', 'subj', 'opt', 'imp', 'inf', 'ptcp']
VOICES = ['act', 'mid', 'pass', 'mp']
NUMS = ['sg', 'pl', 'du']
CASES = ['nom', 'gen', 'dat', 'acc', 'voc']
GENDS = ['m', 'f', 'n']
PERSONS = ['1', '2', '3']

M_TENSE = {'present': 'pres', 'imperfect': 'impf', 'future': 'fut', 'aorist': 'aor',
           'perfect': 'perf', 'pluperfect': 'plpf', 'future perfect': 'futperf'}
M_MOOD = {'indicative': 'ind', 'subjunctive': 'subj', 'optative': 'opt', 'imperative': 'imp',
          'infinitive': 'inf', 'participle': 'ptcp'}
M_VOICE = {'active': 'act', 'middle': 'mid', 'passive': 'pass', 'mediopassive': 'mp'}
M_NUM = {'singular': 'sg', 'plural': 'pl', 'dual': 'du'}
M_CASE = {'nominative': 'nom', 'genitive': 'gen', 'dative': 'dat', 'accusative': 'acc', 'vocative': 'voc'}
M_GEND = {'masculine': 'm', 'feminine': 'f', 'neuter': 'n'}
M_PERS = {'1st': '1', '2nd': '2', '3rd': '3'}


def feats(a):
    """Morpheus 분석 → 코드 사전."""
    f = {}
    if a.get('tense'):
        f['tense'] = M_TENSE.get(a['tense'], a['tense'])
    if a.get('mood'):
        f['mood'] = M_MOOD.get(a['mood'], a['mood'])
    if a.get('voice'):
        f['voice'] = M_VOICE.get(a['voice'], a['voice'])
    if a.get('num'):
        f['num'] = M_NUM.get(a['num'], a['num'])
    if a.get('case'):
        f['case'] = M_CASE.get(a['case'], a['case'])
    if a.get('gend'):
        # 'masculine feminine' 같은 복합 표기
        gs = [M_GEND[g] for g in a['gend'].split() if g in M_GEND]
        f['gend'] = gs[0] if len(gs) == 1 else ''.join(gs)
    if a.get('pers'):
        f['pers'] = M_PERS.get(a['pers'], a['pers'])
    if a.get('comp'):
        f['deg'] = {'comparative': 'comp', 'superlative': 'sup'}.get(a['comp'], a['comp'])
    return f


def is_verbal(a):
    return 'verb' in (a.get('pofs') or '')


def label_of(f, kind):
    """코드 사전 → 한국어 라벨. kind: 'verb' | 'noun' | 'adj'."""
    if kind == 'verb':
        t, v, m = KO.get(f.get('tense'), ''), KO.get(f.get('voice'), ''), f.get('mood')
        if m == 'inf':
            return f'{t} {v} 부정사'.strip()
        if m == 'ptcp':
            return ' '.join(x for x in [t, v, '분사', KO.get(f.get('gend'), f.get('gend', '')),
                                         KO.get(f.get('num'), ''), KO.get(f.get('case'), '')] if x)
        return ' '.join(x for x in [t, v, KO.get(m, ''),
                                     (f.get('pers') + '인칭') if f.get('pers') else '',
                                     KO.get(f.get('num'), '')] if x)
    deg = KO.get(f.get('deg'), '')
    g = f.get('gend', '')
    g_ko = '/'.join(KO[c] for c in g) if g and all(c in 'mfn' for c in g) else ''
    if kind == 'noun':
        g_ko = ''
    return ' '.join(x for x in [deg, g_ko, KO.get(f.get('num'), ''), KO.get(f.get('case'), '')] if x)


# ── 분석 코드 (연습문제·표 항목에 쓰는 약식) ────────────────────────────────
def parse_code(code):
    """'fut ind act 1 pl' / 'm/n gen sg' / '@χώρα acc sg' → (lemma, [alt 사전...], kind)"""
    lemma = None
    slots = {}
    for tok in code.split():
        if tok.startswith('@'):
            lemma = G.nfc(tok[1:])
            continue
        alts = tok.split('/')
        key = None
        for k, vocab in (('tense', TENSES), ('mood', MOODS), ('voice', VOICES), ('num', NUMS),
                         ('case', CASES), ('gend', GENDS), ('pers', PERSONS), ('deg', ['comp', 'sup'])):
            if all(x in vocab for x in alts):
                key = k
                break
        if key is None:
            raise ValueError(f'분석 코드 해석 불가: {tok!r} in {code!r}')
        slots[key] = alts
    kind = 'verb' if ('tense' in slots or 'mood' in slots) else ('adj' if 'gend' in slots else 'noun')
    # 조합 전개
    combos = [{}]
    for k, alts in slots.items():
        combos = [dict(c, **{k: x}) for c in combos for x in alts]
    return lemma, combos, kind, slots


def code_label(code):
    lemma, combos, kind, slots = parse_code(code)
    # 대안(/)은 라벨에서도 '/' 로 합친다
    f = {k: '/'.join(v) for k, v in slots.items()}
    if kind == 'verb':
        parts = []
        t = '/'.join(KO[x] for x in slots.get('tense', []))
        v = '/'.join(KO[x] for x in slots.get('voice', []))
        m = slots.get('mood', ['ind'])
        if m == ['inf']:
            parts = [t, v, '부정사']
        elif m == ['ptcp']:
            parts = [t, v, '분사', '/'.join(KO[x] for x in slots.get('gend', [])),
                     '/'.join(KO[x] for x in slots.get('num', [])),
                     '/'.join(KO[x] for x in slots.get('case', []))]
        else:
            parts = [t, v, '/'.join(KO[x] for x in m),
                     ('/'.join(slots.get('pers', [])) + '인칭') if slots.get('pers') else '',
                     '/'.join(KO[x] for x in slots.get('num', []))]
        lab = ' '.join(p for p in parts if p)
    else:
        parts = ['/'.join(KO[x] for x in slots.get('deg', [])),
                 '/'.join(KO[x] for x in slots.get('gend', [])) if kind == 'adj' else '',
                 '/'.join(KO[x] for x in slots.get('num', [])),
                 '/'.join(KO[x] for x in slots.get('case', []))]
        lab = ' '.join(p for p in parts if p)
    if lemma:
        lab = f'{lemma} {lab}'
    return lab


def feats_match(code_f, an_f):
    for k, v in code_f.items():
        w = an_f.get(k)
        if w is None and k in ('gend', 'deg'):
            continue   # Morpheus 가 비교급의 성·급을 생략하는 경우가 있다
        if k == 'voice':
            if v == 'mp' and w in ('mp', 'mid', 'pass'):
                continue
            if v in ('mid', 'pass') and w == 'mp':
                continue
        if k == 'gend' and w and len(w) > 1:
            if v in w:
                continue
        if w != v:
            return False
    return True


# ── 어휘 (TEXTBOOK_W) ─────────────────────────────────────────────────────
def load_textbook():
    js = r"""
const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');
function grab(name){const s=src.indexOf('const '+name+' = [');let i=src.indexOf('[',s),d=0,j=i;
for(;j<src.length;j++){const c=src[j];if(c==='[')d++;else if(c===']'){d--;if(!d)break;}}
return eval(src.slice(i,j+1));}
process.stdout.write(JSON.stringify({tw:grab('TEXTBOOK_W'), topics:grab('TOPICS').map(t=>({id:t.id,lesson:t.lesson,title:t.title,cat:t.cat,items:t.items||[]}))}));
"""
    out = subprocess.check_output(['node', '-e', js, os.path.join(ROOT, 'index.html')])
    return json.loads(out)


def norm_lemma(s):
    s = G.nfc(re.sub(r'[#0-9]+.*$', '', s or '')).strip()
    s = s.replace('σσ', 'ττ')
    s = {'γίνομαι': 'γίγνομαι', 'γινώσκω': 'γιγνώσκω', 'σαυτοῦ': 'σεαυτοῦ', 'νεανίης': 'νεανίας', 'νόος': 'νοῦς', 'δέω': 'δεῖ', 'ἔξεστι': 'ἔξεστιν', 'χρύσεος': 'χρυσοῦς', 'ἀργύρεος': 'ἀργυροῦς',
         'ταὐτός': 'αὐτός', 'φάος': 'φῶς',
         'οἴομαι': 'οἴομαι', 'οἶμαι': 'οἴομαι', 'πρότερον': 'πρότερος',
         'ἑτοῖμος': 'ἕτοιμος', 'μυρίος': 'μύριοι', 'σύν-λέγω': 'συλλέγω',
         'μέλω': 'μέλει',
         # -τέος 동사형용사 → 본동사 (40과)
         'ποιητέος': 'ποιέω', 'φυλακτέος': 'φυλάττω', 'πειστέος': 'πείθω', 'πειστέον': 'πείθω',
         'πρακτέος': 'πράττω', 'λυτέος': 'λύω'}.get(s, s)
    return s


# 문법 단원이 도입하는 기능어 — 어휘 목록에 없지만 해당 과부터 쓸 수 있다
GRAMMAR_WORDS = {
    'μέν': (3, '한편 (μέν … δέ)'), 'δέ': (3, '그리고, 한편'),
    'ἐγώ': (16, '나'), 'σύ': (16, '너'), 'ἡμεῖς': (16, '우리'), 'ὑμεῖς': (16, '너희'),
    'ἐμαυτοῦ': (27, '나 자신'), 'σεαυτοῦ': (27, '너 자신'), 'ἑαυτοῦ': (27, '그 자신'),
    'ἀλλήλων': (27, '서로'),
    'ἐμός': (27, '나의'), 'σός': (27, '너의'), 'ἡμέτερος': (27, '우리의'), 'ὑμέτερος': (27, '너희의'),
    'ἐάν': (22, '만일 ~하면 (+접속법)'), 'ἄν': (24, '(가능·비현실의 불변사)'),
    'εἴθε': (23, '~라면 좋으련만 (소원)'),
    'φημί': (40, '말하다, 단언하다'), 'οἶδα': (40, '알다'), 'εἶμι': (39, '가다'),
    'εἷς': (37, '하나'), 'τρεῖς': (37, '셋'), 'τέτταρες': (37, '넷'), 'μηδείς': (37, '아무도 (~않다)'),
    # 37과 수사 목록 (교재 37.1–37.3)
    'ἕξ': (37, '여섯'), 'ἑπτά': (37, '일곱'), 'ὀκτώ': (37, '여덟'), 'ἐννέα': (37, '아홉'),
    'ἕνδεκα': (37, '열하나'), 'δώδεκα': (37, '열둘'), 'εἴκοσι': (37, '스물'), 'τριάκοντα': (37, '서른'),
    'ἑκατόν': (37, '백'), 'διακόσιοι': (37, '이백'), 'χίλιοι': (37, '천'), 'μύριοι': (37, '만'),
    'τρίτος': (37, '세 번째'), 'τέταρτος': (37, '네 번째'), 'πέμπτος': (37, '다섯 번째'), 'δέκατος': (37, '열 번째'),
    'ἅπαξ': (37, '한 번'), 'τρίς': (37, '세 번'),
    'ὅταν': (22, '~할 때마다 (+접속법)'), 'ἐπειδάν': (22, '~한 뒤에 (+접속법)'),
    'βαίνω': (38, '가다, 걷다'), 'δύω': (38, '들어가다, 잠기다'),
}

# 고유명사 — 해당 곡용을 배운 뒤부터
NAMES = {
    'Ὅμηρος': (3, '호메로스'), 'Κῦρος': (3, '퀴로스'), 'Ἡρόδοτος': (3, '헤로도토스'),
    'Ἀθῆναι': (4, '아테나이'), 'Ἀθηναῖος': (5, '아테나이인'),
    'Πλάτων': (6, '플라톤'), 'Ξενοφῶν': (6, '크세노폰'), 'Σόλων': (6, '솔론'),
    'Σωκράτης': (7, '소크라테스'), 'Ἕλλην': (7, '그리스인'), 'Ἑλλάς': (29, '그리스'),
    'Πέρσης': (4, '페르시아인'), 'Ἱπποκράτης': (7, '히포크라테스'),
    'Ἄργος': (22, '아르고스 (오뒷세우스의 개)'),
}


class Vocab:
    def __init__(self, tw):
        self.unit = {}     # 정규 lemma → 과
        self.ko = {}       # 정규 lemma → 한국어
        self.disp = {}     # 정규 lemma → 표제어 표시
        for w in tw:
            g, l = G.nfc(w['g']), w['l']
            if not isinstance(l, int):
                continue
            parts = re.split(r'\s*/\s*|,\s*|\s*…\s*', g)
            if g == 'πράττω καλῶς':
                parts = ['πράττω']
            elif g == 'κακῶς ἔχω':
                parts = ['ἔχω', 'κακῶς']
            for p in parts:
                p = re.sub(r'\((ν|ς)\)', '', p).strip()
                if not p:
                    continue
                key = norm_lemma(p)
                special = {'Ἀθηναῖοι': 'Ἀθηναῖος', 'πολέμιοι': 'πολέμιος', 'οὐκ': 'οὐ', 'οὐχ': 'οὐ',
                           'ἐξ': 'ἐκ', 'ἡ': 'ὁ', 'τό': 'ὁ', 'ἥ': 'ὅς', 'ὅ': 'ὅς', 'ἥδε': 'ὅδε',
                           'τόδε': 'ὅδε', 'αὕτη': 'οὗτος', 'τοῦτο': 'οὗτος', 'τί': 'τίς', 'τι': 'τις',
                           'οὕτω': 'οὕτως'}.get(p)
                if special:
                    key = special
                if key not in self.unit or l < self.unit[key]:
                    self.unit[key] = l
                    self.ko[key] = w.get('ko', '')
                    self.disp[key] = g
        # 정관사·관계대명사·지시사 표제
        for k, v in GRAMMAR_WORDS.items():
            kk = norm_lemma(k)
            if kk not in self.unit or v[0] < self.unit[kk]:
                self.unit[kk] = v[0]
                self.ko.setdefault(kk, v[1])
                self.disp.setdefault(kk, k)
        for k, v in NAMES.items():
            kk = norm_lemma(k)
            self.unit.setdefault(kk, v[0])
            self.ko.setdefault(kk, v[1])
            self.disp.setdefault(kk, k)


# ── 게이트 ──────────────────────────────────────────────────────────────────
# 불규칙 비교급·최상급 — Morpheus 는 따로 표제어를 세운다
SUPPLETIVE_COMP = {
    'ἀμείνων': 'ἀγαθός', 'βελτίων': 'ἀγαθός', 'βέλτιστος': 'ἀγαθός', 'κρείττων': 'ἀγαθός',
    'κράτιστος': 'ἀγαθός', 'χείρων': 'κακός', 'χείριστος': 'κακός', 'κακίων': 'κακός',
    'κάκιστος': 'κακός', 'ἥττων': 'κακός', 'ἐλάττων': 'μικρός', 'ἐλάχιστος': 'μικρός',
    'μείζων': 'μέγας', 'μέγιστος': 'μέγας', 'πλείων': 'πολύς', 'πλεῖστος': 'πολύς',
    'καλλίων': 'καλός', 'κάλλιστος': 'καλός', 'ἡδίων': 'ἡδύς', 'ἥδιστος': 'ἡδύς',
    'ῥᾴων': 'ῥᾴδιος', 'ῥᾷστος': 'ῥᾴδιος',
}

MI_LEMMAS = {'ἵστημι', 'δίδωμι', 'τίθημι', 'ἵημι', 'δείκνυμι', 'προδίδωμι', 'κατατίθημι',
             'ἐπιδείκνυμι', 'ἀποδίδωμι', 'παραδίδωμι', 'διατίθημι', 'ἐπιτίθημι', 'ἀφίημι',
             'διαδίδωμι', 'ἀνίστημι', 'ἀπόλλυμι', 'ἀνοίγνυμι', 'σκεδάννυμι', 'δύναμαι',
             'ἐπίσταμαι', 'κεῖμαι', 'κάθημαι'}


def lemma_unit(a, voc):
    """이 분석의 lemma 가 쓸 수 있게 되는 과 (없으면 None)."""
    hd = norm_lemma(a.get('hdwd'))
    t, m = a.get('tense'), a.get('mood')
    if hd == 'εἰμί':
        p, n = a.get('pers'), a.get('num')
        if m == 'indicative' and t == 'present' and p == '3rd' and n == 'singular':
            return 3
        if m == 'infinitive' and t == 'present':
            return 5
        if m == 'indicative' and t in ('present', 'imperfect'):
            return 12
        if t == 'future':
            return 25
        return {'participle': 19, 'subjunctive': 22, 'optative': 23, 'imperative': 39}.get(m, 12)
    if hd == 'ἔρχομαι' and t == 'aorist':
        return voc.unit.get('ἦλθον', 8)
    if hd in ('ὁράω', 'εἶδον', 'εἴδω') and t == 'aorist':
        return voc.unit.get('εἶδον', 12)
    if hd == 'εἶπον':
        return voc.unit.get('λέγω')
    if hd in SUPPLETIVE_COMP:
        base = voc.unit.get(SUPPLETIVE_COMP[hd])
        return None if base is None else max(base, 9)
    if hd == 'οὐδείς' and a.get('gend') == 'neuter' and a.get('num') == 'singular' \
            and a.get('case') in ('nominative', 'accusative'):
        return voc.unit.get('οὐδέν', voc.unit.get('οὐδείς'))
    if hd in ('φέρω',) and t in ('future', 'aorist'):
        return 99  # οἴσω / ἤνεγκα — 교재 범위에서 피한다
    if hd in voc.unit:
        return voc.unit[hd]
    # 탈형 동사: Morpheus 는 φοβέομαι 를 능동형 표제어 φοβέω 로 세운다
    if hd.endswith('ω') and (hd[:-1] + 'ομαι') in voc.unit:
        return voc.unit[hd[:-1] + 'ομαι']
    return None


def feature_unit(a):
    """이 분석의 문법 범주를 배우는 과."""
    pofs = a.get('pofs') or ''
    f = feats(a)
    st = a.get('stemtype') or ''
    hd = norm_lemma(a.get('hdwd'))
    if f.get('num') == 'du' and hd != 'δύο':
        return 99   # 쌍수는 다루지 않는다 (δύο 는 형태상 쌍수라 예외)
    u = 1
    if pofs == 'noun':
        u = {'2nd': 3, '1st': 3, '3rd': 6}.get(a.get('decl'), 3)  # 1변화 -η 는 3과(3.13), 나머지 유형은 어휘가 4과
    elif pofs == 'adjective':
        decl = a.get('decl') or ''
        u = 3
        if decl == '3rd' and not f.get('deg'):
            u = 17
        if st in ('ous_a_oun', 'ous_h_oun', 'ous_oun'):
            u = 17
        if f.get('deg') and not G.strip_all(a.get('_form', '')).startswith('αριστ'):
            u = max(u, 9)
        if hd in ('μέγας', 'πολύς', 'πᾶς', 'ἅπας'):
            u = max(u, 18)
        if st.startswith('verb_adj'):
            u = 40
    elif is_verbal(a):
        t, m, v = f.get('tense'), f.get('mood'), f.get('voice')
        act = v == 'act'
        aor2 = st in ('aor2',) or st.startswith('ath_') or st.endswith('_aor')
        if m in ('ind', 'inf'):
            if t in ('pres', 'fut'):
                u = 5 if act else 25
                # 3과 어휘 γράφω — 동사 활용(5과) 전이라도 3인칭 현재 γράφει/γράφουσι 는 쓴다
                if m == 'ind' and t == 'pres' and act and f.get('pers') == '3':
                    u = 3
            elif t == 'impf':
                u = 8 if act else 26
            elif t == 'aor':
                if act:
                    u = 8
                elif v == 'pass':
                    u = 30
                else:
                    u = 26 if aor2 else 27
            elif t in ('perf', 'plpf', 'futperf'):
                u = 31 if act else 32
        elif m == 'ptcp':
            if t in ('pres', 'fut'):
                u = 19 if act else 25
            elif t == 'aor':
                if act:
                    u = 19 if aor2 else 20
                elif v == 'pass':
                    u = 30
                else:
                    u = 26 if aor2 else 27
            elif t in ('perf', 'futperf'):
                u = 31 if act else 32
        elif m == 'subj':
            u = 22 if act else 28
            if t == 'perf':
                u = max(u, 31)
        elif m == 'opt':
            u = 23 if act else 29
            if t == 'perf':
                u = max(u, 31)
        elif m == 'imp':
            u = 34
            if hd in MI_LEMMAS:
                u = 35
        if v == 'pass' and t in ('aor', 'fut'):
            u = max(u, 30)
        if st in ('aw_pr', 'ew_pr'):
            u = max(u, 15)
        if st == 'ow_pr':
            u = max(u, 16)
        if st == 'ew_fut':
            u = max(u, 16)
        if hd in MI_LEMMAS:
            u = max(u, 13)
            if m == 'ptcp':
                u = max(u, 20)
        if st.startswith('ath_') and hd not in MI_LEMMAS and f.get('tense') == 'aor':
            u = max(u, 38)   # 어근 부정과거 ἔβην · ἔγνων · ἔδυν (38과)
        if st.startswith('perfp') and st != 'perfp_vow':
            u = max(u, 33)
    return u


def attic_ok(a):
    """호메로스식(무증음·시어) 분석만 뺀다.
    Morpheus 의 dial 태그는 아티카 표준형에도 'Ionic'·'epic' 을 붙이는 일이 잦아
    (ἡμέραι, ποιητοῦ, φύλαξι) 판정 근거로 쓰지 않는다 — 방언은 사람이 쓰는 단계에서 관리."""
    # 'poetic' 도 믿을 수 없다 (아티카 산문의 λάβοιεν · μάθοιμεν 에 붙는다) — 'unaugmented'(증음 없는 호메로스식 직설법)만 뺀다
    morph = a.get('morph') or ''
    return 'unaugmented' not in morph


class Manual:
    """Morpheus 가 모르는 형태 — 사람이 확인한 것만 (tools/manual_forms.tsv)."""
    def __init__(self):
        self.rows = {}
        if os.path.exists(MANUAL_PATH):
            for line in open(MANUAL_PATH, encoding='utf-8'):
                line = line.rstrip('\n')
                if not line or line.startswith('#'):
                    continue
                form, lemma, code, *_ = line.split('\t')
                lemma_, combos, kind, _ = parse_code(code)
                for c in combos:
                    a = {'hdwd': lemma, 'manual': True}
                    inv = {'tense': {v: k for k, v in M_TENSE.items()}, 'mood': {v: k for k, v in M_MOOD.items()},
                           'voice': {v: k for k, v in M_VOICE.items()}, 'num': {v: k for k, v in M_NUM.items()},
                           'case': {v: k for k, v in M_CASE.items()}, 'gend': {v: k for k, v in M_GEND.items()},
                           'pers': {v: k for k, v in M_PERS.items()}}
                    for k, v in c.items():
                        if k in inv:
                            a[k] = inv[k][v]
                        elif k == 'deg':
                            a['comp'] = {'comp': 'comparative', 'sup': 'superlative'}[v]
                    a['pofs'] = 'verb' if kind == 'verb' else ('adjective' if kind == 'adj' else 'noun')
                    if c.get('mood') == 'ptcp':
                        a['pofs'] = 'verb participle'
                    self.rows.setdefault(G.nfc(form), []).append(a)


class Checker:
    def __init__(self, voc, offline=False):
        self.voc = voc
        self.offline = offline
        self.manual = Manual()
        self.errors = []

    def analyses(self, tok):
        q = G.query_form(tok)
        res = []
        if q in self.manual.rows:
            res = list(self.manual.rows[q])
        try:
            if self.offline and q not in morpheus._load():
                return res
            res = res + morpheus.analyses(q)
        except Exception as e:
            self.errors.append(f'Morpheus 조회 실패 {q}: {e}')
        if not res and q[:1].isupper():
            low = q[:1].lower() + q[1:]
            try:
                res = morpheus.analyses(low)
            except Exception:
                pass
        return res

    def allowed(self, tok, unit):
        """(ok, 허용 분석 목록, 이유)"""
        an = self.analyses(tok)
        if not an:
            return False, [], 'Morpheus 분석 없음 (악센트·철자 확인)'
        good, why = [], []
        for a in an:
            a = dict(a, _form=G.query_form(tok))
            if not attic_ok(a) and not a.get('manual'):
                why.append('방언형')
                continue
            lu = lemma_unit(a, self.voc)
            if lu is None:
                why.append(f'어휘 밖 lemma {a.get("hdwd")}')
                continue
            fu = feature_unit(a)
            need = max(lu, fu)
            if need > unit:
                why.append(f'{a.get("hdwd")} {label_of(feats(a), "verb" if is_verbal(a) else "adj")} → {need}과')
                continue
            good.append(a)
        if good:
            return True, good, ''
        return False, [], '; '.join(sorted(set(why)))[:300]

    def gloss(self, tok, good):
        """낱말 풀이 [form, 표제, 한국어, 분석]"""
        labels, lemma = [], None
        for a in good:
            hd = norm_lemma(a.get('hdwd'))
            if lemma is None:
                lemma = hd
            if hd != lemma:
                continue
            f = feats(a)
            kind = 'verb' if is_verbal(a) else ('noun' if a.get('pofs') == 'noun' else 'adj')
            if a.get('pofs') in ('adverb', 'conjunction', 'particle', 'preposition', 'article') and not f:
                continue
            lab = label_of(f, kind) if f else ''
            if lab and lab not in labels:
                labels.append(lab)
        # 성별만 다른 분석(남/중성 속격 등)은 합친다
        labels = merge_labels(labels)
        # 능동 분석을 앞에 (γιγνώσκει: 능동 3인칭 단수가 중·수동 2인칭 단수보다 흔하다)
        labels.sort(key=lambda lab: 0 if '능동' in lab else 1)
        if lemma not in self.voc.disp and lemma and lemma.endswith('ω') and (lemma[:-1] + 'ομαι') in self.voc.disp:
            lemma = lemma[:-1] + 'ομαι'   # 탈형 동사는 -ομαι 표제어로 보인다
        for a in good:
            hd = norm_lemma(a.get('hdwd'))
            if hd in SUPPLETIVE_COMP and lemma == hd:
                lemma = SUPPLETIVE_COMP[hd]   # ἀμείνων → ἀγαθός
        disp = self.voc.disp.get(lemma, lemma)
        ko = self.voc.ko.get(lemma, '')
        if lemma == 'ἔρχομαι':
            disp, ko = 'ἔρχομαι (ἦλθον)', self.voc.ko.get('ἦλθον', '가다, 오다')
        return [G.nfc(tok), disp, ko, ' / '.join(labels[:3])]


def merge_labels(labels):
    """'남성 단수 속격' + '중성 단수 속격' → '남성/중성 단수 속격'."""
    out = []
    groups = {}
    for lab in labels:
        m = re.match(r'^(.*?)(남성|여성|중성)( .*)$', lab)
        if m:
            key = (m.group(1), m.group(3))
            groups.setdefault(key, []).append(m.group(2))
            if key not in [g for g, _ in out if isinstance(g, tuple)]:
                out.append((key, None))
        else:
            out.append((lab, None))
    res = []
    order = ['남성', '여성', '중성']
    for g, _ in out:
        if isinstance(g, tuple):
            gs = sorted(set(groups[g]), key=order.index)
            res.append(f'{g[0]}{"/".join(gs)}{g[1]}')
        else:
            res.append(g)
    return res


# ── DSL 파서 ────────────────────────────────────────────────────────────────
SINGLE_KEYS = {'lesson', 'cat', 'ref', 'title', 'desc', 'note', 'grk', 'summary', 'topics', 'more', 'refs', 'nocheck'}
MULTI_KEYS = {'expl', 'table', 'items', 'forms', 'tr', 'comp', 'allow'}


def parse_file(path):
    blocks = []
    cur = None
    section = None
    lines = open(path, encoding='utf-8').read().split('\n')
    for ln_no, raw in enumerate(lines, 1):
        line = raw.rstrip()
        if line.startswith('//'):
            continue
        m = re.match(r'^===\s*(topic|unit)\s+(\S+)\s*$', line)
        if m:
            cur = {'kind': m.group(1), 'id': m.group(2), 'file': os.path.basename(path), 'line': ln_no,
                   'tables': [], 'items': [], 'forms': [], 'tr': [], 'comp': [], 'allow': [], 'expl': []}
            blocks.append(cur)
            section = None
            continue
        if line.startswith('==='):
            cur, section = None, None
            continue
        if cur is None:
            continue
        m = re.match(r'^([a-z]+):\s?(.*)$', line)
        if m and (m.group(1) in SINGLE_KEYS or m.group(1) in MULTI_KEYS):
            key, val = m.group(1), m.group(2)
            if key in SINGLE_KEYS:
                cur[key] = val.strip()
                section = None
            elif key == 'table':
                cells = [c.strip() for c in val.split('|')]
                cur['tables'].append({'caption': cells[0], 'cols': cells[1:], 'sections': [], 'line': ln_no})
                section = 'table'
            else:
                section = key
                if key == 'expl' and val.strip():
                    cur['expl'].append(val)
            continue
        if section is None:
            if line.strip():
                raise SyntaxError(f'{path}:{ln_no}: 섹션 밖의 줄: {line!r}')
            continue
        if section == 'expl':
            cur['expl'].append(line)
            continue
        if not line.strip():
            continue
        if section == 'table':
            t = cur['tables'][-1]
            if line.startswith('#'):
                t['sections'].append({'label': line[1:].strip(), 'rows': []})
            else:
                if not t['sections']:
                    t['sections'].append({'label': '', 'rows': []})
                t['sections'][-1]['rows'].append([c.strip() for c in line.split('|')])
            continue
        if section in ('items', 'forms'):
            cur[section].append((ln_no, line.strip()))
            continue
        if section in ('tr', 'comp', 'allow'):
            cur[section].append((ln_no, line.strip()))
            continue
    return blocks


def md_expl(lines):
    txt = '\n'.join(lines).strip('\n')
    return txt


# ── 빌드 ────────────────────────────────────────────────────────────────────
def seeded(s):
    return random.Random(int(hashlib.sha1(s.encode('utf-8')).hexdigest()[:12], 16))


def variant_codes(code):
    """분석 코드에서 한 자질씩 바꾼 오답 후보들."""
    lemma, combos, kind, slots = parse_code(code)
    base = {k: v[0] for k, v in slots.items()}
    cands = []

    def emit(d):
        s = ' '.join(([f'@{lemma}'] if lemma else []) + [d[k] for k in
                     ('deg', 'tense', 'mood', 'voice', 'gend', 'pers', 'num', 'case') if k in d])
        cands.append((s, d))

    if kind == 'verb':
        for k, pool in (('pers', PERSONS), ('num', ['sg', 'pl']), ('tense', ['pres', 'impf', 'fut', 'aor', 'perf', 'plpf']),
                        ('voice', ['act', 'mp', 'mid', 'pass']), ('mood', ['ind', 'subj', 'opt']),
                        ('case', CASES[:4]), ('gend', GENDS)):
            if k not in base:
                continue
            for x in pool:
                if x != base[k] and x not in slots.get(k, []):
                    emit(dict(base, **{k: x}))
    else:
        for k, pool in (('case', CASES[:4]), ('num', ['sg', 'pl']), ('gend', GENDS), ('deg', ['comp', 'sup'])):
            if k not in base:
                continue
            for x in pool:
                if x != base[k] and x not in slots.get(k, []):
                    emit(dict(base, **{k: x}))
    return cands


def build(args):
    data = load_textbook()
    voc = Vocab(data['tw'])
    old_topics = {t['id']: t for t in data['topics']}
    ck = Checker(voc, offline=args.offline)

    files = sorted(glob.glob(os.path.join(SRC_DIR, 'u*.txt')))
    blocks = []
    for p in files:
        blocks += parse_file(p)
    topics = [b for b in blocks if b['kind'] == 'topic']
    units = [b for b in blocks if b['kind'] == 'unit']
    if args.only:
        units = [u for u in units if int(u['id']) in args.only]

    # 모든 그리스어 토큰을 미리 조회 (병렬)
    toks = set()
    for t in topics:
        for tb in t['tables']:
            for sec in tb['sections']:
                for row in sec['rows']:
                    for c in row[1:]:
                        toks.update(G.query_form(w) for w in G.greek_words(c))
        for _, line in t['items']:
            form = line.split('=')[0].strip()
            toks.update(G.query_form(w) for w in G.greek_words(form))
    for u in units:
        for _, line in u['forms']:
            toks.add(G.query_form(line.split('=')[0].strip()))
        for _, line in u['tr']:
            toks.update(G.query_form(w) for w, _ in G.tokenize(line.split('|')[0]))
        for _, line in u['comp']:
            parts = line.split('|')
            for ch in parts[1].split('/') + (parts[2].split('/') if len(parts) > 2 else []):
                toks.update(G.query_form(w) for w, _ in G.tokenize(ch))
    toks = {t for t in toks if t and G.is_greek(t)}
    if not args.offline:
        n = morpheus.prefetch(toks)
        if n:
            print(f'Morpheus 신규 조회 {n}건')

    errors = []
    warns = []

    def err(where, msg):
        errors.append(f'{where}: {msg}')

    # ── 토픽 ──
    out_topics = []
    topic_ids = set(old_topics)
    for t in topics:
        where = f"{t['file']}:{t['line']} topic {t['id']}"
        if t['id'] in topic_ids:
            err(where, '중복 id')
        topic_ids.add(t['id'])
        for key in ('lesson', 'cat', 'title', 'desc'):
            if not t.get(key):
                err(where, f'{key} 누락')
        tables = []
        for tb in t['tables']:
            ncol = len(tb['cols'])
            for sec in tb['sections']:
                for row in sec['rows']:
                    if len(row) != ncol:
                        err(f"{t['file']}:{tb['line']}", f'표 열 수 불일치 {row} (cols {ncol})')
                    for c in row[1:]:
                        if t.get('nocheck'):
                            continue
                        for w in G.greek_words(c):
                            if len(G.strip_all(w)) < 2 or (len(w) <= 3 and G.strip_all(w) == w):
                                continue   # 낱글자 (ψ, ξ …) · 부호 없는 모음 묶음 (ηυ, αι …)
                            if not ck.analyses(w):
                                err(where, f'표 형태 분석 없음: {w}')
                        # 여러 낱말로 된 구(句)는 문맥 악센트까지 본다 — '/' '·' 는 대안 구분
                        for seg in re.split(r'\s+[/·→]\s+|;', c):
                            if len(G.greek_words(seg)) >= 2 and not re.search('[가-힣A-Za-z]', seg):
                                for e in G.check_sentence_accents(seg):
                                    err(where, f'표 구 악센트: {e}  «{seg}»')
                            elif len(G.greek_words(seg)) == 1 and len(G.strip_all(G.greek_words(seg)[0])) > 1 \
                                    and G.greek_words(seg)[0] != G.strip_all(G.greek_words(seg)[0]):
                                w = G.greek_words(seg)[0]
                                if len(G.accent_marks(w)) != 1 and not G.is_enclitic_form(w) \
                                        and G.nfc(w) not in G.PROCLITICS and w[-1] not in G.ELISION_MARKS:
                                    warns.append(f'{where}: 표 형태 악센트 개수 확인: {w}')
            tables.append({'caption': tb['caption'], 'cols': tb['cols'], 'sections': tb['sections']})
        items = []
        for ln, line in t['items']:
            if '==' in line:
                form, info = [x.strip() for x in line.split('==', 1)]
                items.append({'form': form, 'info': info})
                continue
            form, code = [x.strip() for x in line.split('=', 1)]
            codes = [c.strip() for c in code.split(';') if c.strip()]
            try:
                parsed = [parse_code(c) for c in codes]
            except ValueError as e:
                err(f"{t['file']}:{ln}", str(e))
                continue
            an = [a for a in ck.analyses(form) if attic_ok(a) or a.get('manual')]
            for c, (lemma, combos, kind, _) in zip(codes, parsed):
                if not any(feats_match(cb, feats(a)) for cb in combos for a in an):
                    err(f"{t['file']}:{ln}", f'항목 분석 불일치: {form} = {c}  (Morpheus: '
                        + '; '.join(sorted({label_of(feats(a), "verb" if is_verbal(a) else "adj") for a in an}))[:200] + ')')
            items.append({'form': form, 'info': ' · '.join(code_label(c) for c in codes)})
        obj = {'id': t['id'], 'lesson': int(t['lesson']), 'cat': t['cat'], 'title': t['title'],
               'desc': t['desc'], 'expl': md_expl(t['expl'])}
        if t.get('ref'):
            obj['ref'] = t['ref']
        if tables:
            obj['paradigm'] = tables[0]
        if len(tables) > 1:
            obj['paradigmAlt'] = tables[1]
        if len(tables) > 2:
            obj['extraParadigms'] = tables[2:]
        if t.get('note'):
            obj['note'] = t['note']
        if items:
            obj['items'] = items
        out_topics.append(obj)

    # ── 유닛 ──
    out_units = []
    seen_n = set()
    for u in sorted(units, key=lambda x: int(x['id'])):
        n = int(u['id'])
        where = f"{u['file']} unit {n}"
        if n in seen_n:
            err(where, '유닛 번호 중복')
        seen_n.add(n)
        for key in ('grk', 'title', 'summary', 'topics'):
            if not u.get(key):
                err(where, f'{key} 누락')
        tids = (u.get('topics') or '').split()
        more = (u.get('more') or '').split()
        for tid in tids + more:
            if tid not in topic_ids:
                err(where, f'없는 토픽 id: {tid}')
        # 유닛 전용 허용어
        extra = {}
        for ln, line in u['allow']:
            w, gl = [x.strip() for x in line.split('=', 1)]
            extra[norm_lemma(w)] = gl
        saved = {k: voc.unit.get(k) for k in extra}
        for k, gl in extra.items():
            voc.unit[k] = min(voc.unit.get(k, 99), n)
            voc.ko.setdefault(k, gl)

        # 그리스어 제목 검증 (형태·악센트)
        if u.get('grk'):
            for e in G.check_sentence_accents(u['grk']):
                err(where, f'제목 악센트: {e}')
            for tok, _ in G.tokenize(u['grk']):
                if G.is_greek(tok) and not ck.analyses(tok):
                    err(where, f'제목 낱말 분석 없음: {tok}')

        forms = []
        for ln, line in u['forms']:
            w = f"{u['file']}:{ln}"
            if '==' in line:
                # 자유 라벨 문항:  제시 == 정답 || 오답1 ; 오답2 ; 오답3 [|| 질문]
                f_, rest = line.split('==', 1)
                parts = [x.strip() for x in rest.split('||')]
                opts = [x.strip() for x in parts[1].split(';')] if len(parts) > 1 else []
                if len(opts) != 3 or len({parts[0], *opts}) != 4:
                    err(w, f'자유 문항은 정답 1 + 서로 다른 오답 3 이 필요: {line}')
                item = {'f': G.nfc(f_.strip()), 'a': parts[0], 'o': opts}
                if len(parts) > 2 and parts[2]:
                    item['q'] = parts[2]
                forms.append(item)
                continue
            form, code = [x.strip() for x in line.split('=', 1)]
            codes = [c.strip() for c in code.split(';') if c.strip()]
            try:
                parsed = [parse_code(c) for c in codes]
            except ValueError as e:
                err(w, str(e))
                continue
            ok_, good, why = ck.allowed(form, n)
            an = [a for a in ck.analyses(form) if attic_ok(a) or a.get('manual')]
            if not ok_:
                err(w, f'형태 {form}: {why}')
                continue
            bad = [c for c, (_, combos, _, _) in zip(codes, parsed)
                   if not any(feats_match(cb, feats(a)) for cb in combos for a in good)]
            if bad:
                err(w, f'형태 {form} = {" ; ".join(bad)} 가 분석과 불일치 (허용 분석: '
                    + '; '.join(sorted({label_of(feats(a), "verb" if is_verbal(a) else "adj") for a in good})) + ')')
                continue
            # 오답: 한 자질만 바꾼 라벨 중, 이 형태의 어떤 (아티카) 분석과도 맞지 않는 것
            rng = seeded(form + code)
            cands = variant_codes(codes[0])
            rng.shuffle(cands)
            answer = ' · '.join(code_label(c) for c in codes)
            picked, seen_lab = [], {answer} | {code_label(c) for c in codes}
            for s, d in cands:
                if any(feats_match(d, feats(a)) for a in an):
                    continue
                lab = code_label(s)
                if lab in seen_lab:
                    continue
                # 같은 자질을 바꾼 오답이 몰리지 않게
                picked.append(lab)
                seen_lab.add(lab)
                if len(picked) == 3:
                    break
            if len(picked) < 3:
                err(w, f'형태 {form}: 오답 후보 부족')
            forms.append({'f': G.nfc(form), 'a': answer, 'o': picked})

        trs = []
        for ln, line in u['tr']:
            w = f"{u['file']}:{ln}"
            parts = [x.strip() for x in line.split('|')]
            if len(parts) < 4:
                err(w, '해석 문항 필드 부족 (그리스어 | 한국어 | 오답1 | 오답2 [| 주석])')
                continue
            grc, ko, w1, w2 = parts[:4]
            note = parts[4] if len(parts) > 4 else ''
            for e in G.check_sentence_accents(grc):
                err(w, f'악센트: {e}  «{grc}»')
            gl = []
            for tok, _ in G.tokenize(grc):
                ok_, good, why = ck.allowed(tok, n)
                if not ok_:
                    err(w, f'{tok}: {why}  «{grc}»')
                else:
                    gl.append(ck.gloss(tok, good))
            if len({ko, w1, w2}) < 3:
                err(w, '해석 선택지 중복')
            trs.append({'g': G.nfc(grc), 'k': ko, 'w': [w1, w2], 'n': note, 'gl': gl})

        comps = []
        for ln, line in u['comp']:
            w = f"{u['file']}:{ln}"
            parts = [x.strip() for x in line.split('|')]
            if len(parts) < 3:
                err(w, '작문 문항 필드 부족 (한국어 | 조각 / 조각 | 오답조각 / … [| 주석])')
                continue
            ko = parts[0]
            raw_chunks = [c.strip() for c in parts[1].split(' / ') if c.strip()]
            # ^조각 = 맨 앞 고정, $조각 = 맨 뒤 고정
            first_fixed = [i for i, c in enumerate(raw_chunks) if c.startswith('^')]
            last_fixed = [i for i, c in enumerate(raw_chunks) if c.startswith('$')]
            chunks = [c.lstrip('^$').strip() for c in raw_chunks]
            dis = [c.strip() for c in parts[2].split(' / ') if c.strip()]
            note = parts[3] if len(parts) > 3 else ''
            end = ';' if ko.rstrip().endswith('?') else '.'
            # 조각은 인용형(문장 끝 악센트)으로 적고, 이어 붙일 때 둔음 변환 — 앱과 같은 규칙
            full = G.join_chunks(chunks) + end
            for e in G.check_sentence_accents(full):
                err(w, f'악센트: {e}  «{full}»')
            gl = []
            for tok, _ in G.tokenize(full):
                ok_, good, why = ck.allowed(tok, n)
                if not ok_:
                    err(w, f'{tok}: {why}  «{full}»')
                else:
                    gl.append(ck.gloss(tok, good))
            for c in chunks + dis:
                first = c.split()[0]
                if G.is_enclitic_form(first) or G.is_postpositive(first):
                    err(w, f'조각이 전접어/후치사로 시작하면 안 됨: «{c}»')
                # 조각 끝 낱말은 인용형(예음)으로 — 둔음 변환은 앱이 이어 붙일 때 한다
                for e in G.check_sentence_accents(c if c[-1] in G.PUNCT else c + '.'):
                    err(w, f'조각 악센트: {e}  «{c}»')
            for d in dis:
                for tok, _ in G.tokenize(d):
                    ok_, _, why = ck.allowed(tok, n)
                    if not ok_:
                        err(w, f'오답 조각 {tok}: {why}')
                if d in chunks:
                    err(w, f'오답 조각이 정답 조각과 같음: {d}')
            # 어순: 후치사(δέ, γάρ …)를 품은 조각은 맨 앞. 둘 이상이면 모범 어순 그대로
            post = [i for i, c in enumerate(chunks) if any(G.is_postpositive(x) for x in c.split()[1:])]
            item = {'k': ko, 'c': chunks, 'x': dis, 'e': end, 'n': note, 'gl': gl}
            firsts = sorted(set(post) | set(first_fixed))
            if len(firsts) > 1 or '순서' in note:
                item['seq'] = 1
            elif firsts:
                item['fx'] = firsts[0]
            if last_fixed and not item.get('seq'):
                item['lx'] = last_fixed[0]
            if len(last_fixed) > 1:
                err(w, '$ 조각은 하나만')
            comps.append(item)

        for k, v in saved.items():
            if v is None:
                voc.unit.pop(k, None)
            else:
                voc.unit[k] = v

        out_units.append({'n': n, 'grk': u.get('grk', ''), 'title': u.get('title', ''),
                          'summary': u.get('summary', ''), 'refs': u.get('refs', ''),
                          'topics': tids, 'more': more, 'forms': forms, 'tr': trs, 'comp': comps})

    morpheus.save()
    for x in warns:
        print('경고', x)
    if errors:
        print(f'\n오류 {len(errors)}건')
        for e in errors:
            print(' -', e)
        return 1
    stats = {
        'units': len(out_units), 'topics_new': len(out_topics),
        'forms': sum(len(u['forms']) for u in out_units), 'tr': sum(len(u['tr']) for u in out_units),
        'comp': sum(len(u['comp']) for u in out_units),
    }
    print('검증 통과', json.dumps(stats, ensure_ascii=False))
    if args.check or args.only:
        return 0
    write_js(out_topics, out_units, stats)
    print('작성:', OUT_PATH)
    return 0


def write_js(topics, units, stats):
    head = f"""/* data-units.js — 문법 유닛 (Chase & Phillips, A New Introduction to Greek 1~40과 진도)
   생성: tools/build_units.py ← units-src/u*.txt   ※ 직접 고치지 말고 원본을 고친 뒤 다시 빌드
   유닛 {stats['units']} · 신규 문법 토픽 {stats['topics_new']} · 형태 {stats['forms']} · 해석 {stats['tr']} · 작문 {stats['comp']}
   연습문제는 모두 새로 지은 것이다 (교재 문장 복제 없음). 그리스어는 Morpheus(Perseids)로 형태·악센트를 검증했다. */
"""
    body = ('const UNIT_TOPICS = ' + json.dumps(topics, ensure_ascii=False, separators=(',', ':')) + ';\n'
            + 'const GRAMMAR_UNITS = ' + json.dumps(units, ensure_ascii=False, separators=(',', ':')) + ';\n'
            + """(function(){
  if(typeof TOPICS === 'undefined') return;
  const have = new Set(TOPICS.map(t => t.id));
  for(const t of UNIT_TOPICS){ if(!have.has(t.id)) TOPICS.push(t); }
})();
""")
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        f.write(head + body)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--offline', action='store_true')
    ap.add_argument('--only', type=int, nargs='*')
    sys.exit(build(ap.parse_args()))
