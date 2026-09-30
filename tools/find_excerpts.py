#!/usr/bin/env python3
"""원전 발췌 후보 찾기 — 트리뱅크(형태·구문 주석이 달린 고대 그리스어 말뭉치)에서
과별 문법 범위에 맞는 문장을 골라낸다.  (v73)

유닛의 해석 · 작문 문항은 고대 저자의 문장을 발췌해 쓴다. 이 도구는 그 후보를 뽑는 데만 쓰고,
실제 문항은 사람이 골라 units-src/uNN.txt 에 적는다 (최종 검증은 build_units.py 가 Morpheus 로 다시 한다).

말뭉치 (저장소에 넣지 않는다 — $GREEK_CORPORA, 기본 ~/corpora 아래에 clone)
  gorman/  https://github.com/vgorman1/Greek-Dependency-Trees   (크세노폰 · 플라톤 · 뤼시아스 · 데모스테네스 …)
  agldt/   https://github.com/PerseusDL/treebank_data           (이솝 · 에우튀프론 · 뤼시아스 · 투퀴디데스 …)
  proiel/  https://github.com/proiel/proiel-treebank            (신약 — Tischendorf 8판)

사용
  python3 tools/find_excerpts.py --build            # 말뭉치 → 문장 캐시 (scratch/excerpt_corpus.pkl)
  python3 tools/find_excerpts.py --lesson 8 -n 40   # 8과 후보 40개
  python3 tools/find_excerpts.py --stats            # 과별 후보 수
"""
import argparse
import glob
import os
import pickle
import re
import sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_units as B  # noqa: E402
import greek_util as G  # noqa: E402

CORPORA = os.environ.get('GREEK_CORPORA', os.path.expanduser('~/corpora'))
CACHE = os.environ.get('EXCERPT_CACHE', os.path.join(CORPORA, 'excerpt_corpus.pkl'))

# ── 저자 · 작품 ────────────────────────────────────────────────────────────
AUTHORS = {
    'tlg0032': '크세노폰', 'tlg0059': '플라톤', 'tlg0540': '뤼시아스', 'tlg0014': '데모스테네스',
    'tlg0010': '이소크라테스', 'tlg0026': '아이스키네스', 'tlg0027': '안도키데스', 'tlg0028': '안티폰',
    'tlg0017': '이사이오스', 'tlg0003': '투퀴디데스', 'tlg0016': '헤로도토스', 'tlg0086': '아리스토텔레스',
    'tlg0096': '이솝', 'tlg0007': '플루타르코스', 'tlg0543': '폴뤼비오스', 'tlg0060': '디오도로스',
    'tlg0081': '디오뉘시오스', 'tlg0526': '요세푸스', 'tlg0551': '아피아노스', 'tlg0008': '아테나이오스',
    'tlg0011': '소포클레스', 'tlg0085': '아이스퀼로스', 'tlg0012': '호메로스', 'tlg0020': '헤시오도스',
    'tlg0548': '아폴로도로스', 'tlg0013': '호메로스 찬가', 'tlg0031': '신약성서',
}
WORKS = {
    'tlg0032.tlg001': '헬레니카', 'tlg0032.tlg004': '향연', 'tlg0032.tlg006': '아나바시스',
    'tlg0032.tlg007': '퀴로스의 교육', 'tlg0032.tlg008': '히에론', 'tlg0032.tlg015': '아테나이인의 정체',
    'tlg0059.tlg001': '에우튀프론', 'tlg0059.tlg002': '소크라테스의 변론', 'tlg0059.tlg003': '크리톤',
    'tlg0086.tlg035': '정치학', 'tlg0096.tlg002': '우화', 'tlg0003.tlg001': '펠로폰네소스 전쟁사',
    'tlg0016.tlg001': '역사', 'tlg0007.tlg004': '뤼쿠르고스 전', 'tlg0007.tlg015': '알키비아데스 전',
}
# 산문 아티카 · 이솝 · 신약을 앞에 — 방언 · 시 · 후대 산문은 뒤로
PREFER = ['tlg0032', 'tlg0059', 'tlg0540', 'tlg0096', 'tlg0014', 'tlg0010', 'tlg0026', 'tlg0027',
          'tlg0028', 'tlg0017', 'tlg0031', 'tlg0086', 'tlg0003', 'tlg0007']
SKIP_AUTH = {'tlg0012', 'tlg0020', 'tlg0013', 'tlg0016'}   # 서사시 · 이오니아 방언


def work_label(urn_key, locus):
    a = urn_key.split('.')[0]
    au = AUTHORS.get(a, a)
    wk = WORKS.get(urn_key)
    if a == 'tlg0014':
        wk = f'{int(urn_key.split(".tlg")[1])}번 연설'
    elif a == 'tlg0540':
        wk = f'{int(urn_key.split(".tlg")[1])}번 연설'
    elif a in ('tlg0026', 'tlg0027', 'tlg0028', 'tlg0017'):
        wk = f'{int(urn_key.split(".tlg")[1])}번 연설'
    return f'{au}, 『{wk}』 {locus}' if wk else f'{au} {urn_key} {locus}'


def urn_key(doc_id, fname):
    m = re.search(r'(tlg\d{4})\.(tlg\d{3})', doc_id or '')
    if m:
        return f'{m.group(1)}.{m.group(2)}'
    m = re.match(r'^(\d{4})-(\d{3})$', doc_id or '')
    if m:
        return f'tlg{m.group(1)}.tlg{m.group(2)}'
    low = fname.lower()
    if 'isocrates_18' in low:
        return 'tlg0010.tlg018'
    return '?'


# ── 토큰 ────────────────────────────────────────────────────────────────────
AG_POS = {'n': 'noun', 'v': 'verb', 't': 'ptcp', 'a': 'adj', 'd': 'adv', 'l': 'art', 'g': 'part',
          'c': 'conj', 'r': 'prep', 'p': 'pron', 'm': 'num', 'i': 'intj', 'e': 'intj', 'u': 'punct', 'x': 'other'}
TENSE = {'p': 'pres', 'i': 'impf', 'r': 'perf', 'l': 'plpf', 't': 'futperf', 'f': 'fut', 'a': 'aor'}
MOOD = {'i': 'ind', 's': 'subj', 'o': 'opt', 'n': 'inf', 'm': 'imp', 'p': 'ptcp'}
VOICE = {'a': 'act', 'p': 'pass', 'm': 'mid', 'e': 'mp'}
NUM = {'s': 'sg', 'p': 'pl', 'd': 'du'}
CASE = {'n': 'nom', 'g': 'gen', 'd': 'dat', 'a': 'acc', 'v': 'voc'}
GEND = {'m': 'm', 'f': 'f', 'n': 'n'}
DEG = {'c': 'comp', 's': 'sup'}


def ag_feats(tag):
    tag = (tag or '').ljust(9, '-')
    f = {'pos': AG_POS.get(tag[0], 'other')}
    for i, (k, mp) in enumerate([('pers', {'1': '1', '2': '2', '3': '3'}), ('num', NUM), ('tense', TENSE),
                                 ('mood', MOOD), ('voice', VOICE), ('gend', GEND), ('case', CASE), ('deg', DEG)], 1):
        v = mp.get(tag[i])
        if v:
            f[k] = v
    if f['pos'] == 'verb' and f.get('mood') == 'ptcp':
        f['pos'] = 'ptcp'
    return f


PR_POS = {'A-': 'adj', 'Df': 'adv', 'Dq': 'adv', 'Du': 'adv', 'S-': 'art', 'Ma': 'num', 'Mo': 'adj',
          'Nb': 'noun', 'Ne': 'noun', 'C-': 'conj', 'G-': 'conj', 'R-': 'prep', 'V-': 'verb', 'I-': 'intj',
          'F-': 'other', 'Pd': 'pron', 'Px': 'pron', 'Pp': 'pron', 'Pk': 'pron', 'Ps': 'pron', 'Pi': 'pron',
          'Pr': 'pron', 'Pc': 'pron', 'Pt': 'pron'}


def pr_feats(pos, morph):
    m = (morph or '').ljust(10, '-')
    f = {'pos': PR_POS.get(pos, 'other')}
    if m[0] in '123':
        f['pers'] = m[0]
    if m[1] in NUM:
        f['num'] = NUM[m[1]]
    if m[2] in TENSE:
        f['tense'] = TENSE[m[2]]
    if m[3] in MOOD:
        f['mood'] = MOOD[m[3]]
    if m[4] in VOICE:
        f['voice'] = VOICE[m[4]]
    if m[5] in GEND:
        f['gend'] = m[5]
    if m[6] in CASE:
        f['case'] = CASE[m[6]]
    if m[7] in DEG:
        f['deg'] = DEG[m[7]]
    if f['pos'] == 'verb' and f.get('mood') == 'ptcp':
        f['pos'] = 'ptcp'
    return f


APOS = '᾽'


def clean_form(s):
    s = G.nfc(s or '').strip()
    s = re.sub('[’ʼ\'᾿]$', APOS, s)
    return s


# ── 적재 ────────────────────────────────────────────────────────────────────
def load_aldt(path, corpus):
    out = []
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as e:
        print('XML 오류', path, e, file=sys.stderr)
        return out
    fname = os.path.basename(path)
    for s in root.iter('sentence'):
        key = urn_key(s.get('document_id'), fname)
        toks, arts = [], {}
        for w in s.iter('word'):
            if w.get('artificial') or w.get('insertion_id'):
                arts[w.get('id')] = {'rel': w.get('relation') or '', 'head': w.get('head'), 'lemma': w.get('lemma') or ''}
                continue
            form = clean_form(w.get('form'))
            if not form:
                continue
            f = ag_feats(w.get('postag'))
            toks.append({'id': w.get('id'), 'form': form, 'lemma': B.norm_lemma(w.get('lemma') or ''),
                         'head': w.get('head'), 'rel': w.get('relation') or '', **f})
        if toks:
            out.append({'corpus': corpus, 'key': key, 'locus': s.get('subdoc') or '', 'file': fname, 'toks': toks,
                        'arts': arts})
    return out


def load_proiel(path, corpus='proiel'):
    out = []
    root = ET.parse(path).getroot()
    src = root.find('.//source')
    sid = src.get('id') if src is not None else ''
    key = {'greek-nt': 'tlg0031.nt'}.get(sid, sid)
    for s in root.iter('sentence'):
        toks, cite = [], None
        for t in s.iter('token'):
            if t.get('empty-token-sort') or not t.get('form'):
                continue
            cite = cite or t.get('citation-part')
            f = pr_feats(t.get('part-of-speech'), t.get('morphology'))
            form = clean_form(t.get('form'))
            toks.append({'id': t.get('id'), 'form': form, 'lemma': B.norm_lemma(t.get('lemma') or ''),
                         'head': t.get('head-id'), 'rel': t.get('relation') or '', **f,
                         'after': t.get('presentation-after') or ' ', 'before': t.get('presentation-before') or ''})
        if toks:
            out.append({'corpus': corpus, 'key': key, 'locus': cite or '', 'file': os.path.basename(path), 'toks': toks,
                        'arts': {}})
    return out


def build_cache():
    sents = []
    for p in sorted(glob.glob(os.path.join(CORPORA, 'gorman', 'xml versions', '*.xml'))):
        sents += load_aldt(p, 'gorman')
    for p in sorted(glob.glob(os.path.join(CORPORA, 'agldt', 'v2.1', 'Greek', 'texts', '*.xml'))):
        sents += load_aldt(p, 'agldt')
    nt = os.path.join(CORPORA, 'proiel', 'greek-nt.xml')
    if os.path.exists(nt):
        sents += load_proiel(nt)
    with open(CACHE, 'wb') as f:
        pickle.dump(sents, f)
    print('문장', len(sents), '→', CACHE)


def load_cache():
    with open(CACHE, 'rb') as f:
        return pickle.load(f)


# ── 본문 재구성 ─────────────────────────────────────────────────────────────
NO_SPACE_BEFORE = set(',.·;:!?)]»”’᾽') | {'·', ';'}


def text_of(toks):
    if toks and 'after' in toks[0]:
        out = ''.join(t.get('before', '') + t['form'] + t.get('after', ' ') for t in toks)
        return re.sub(r'\s+', ' ', out).strip()
    out = ''
    for i, t in enumerate(toks):
        w = t['form']
        if t['pos'] == 'punct' or (len(w) == 1 and w in NO_SPACE_BEFORE):
            out = out.rstrip() + w + ' '
            continue
        if w in ('(', '[', '«', '“'):
            out += w
            continue
        out += w + ' '
    out = re.sub(r'\s+', ' ', out).strip()
    return out


# ── 과 판정 (build_units.feature_unit 의 트리뱅크판) ─────────────────────────
VOC = None


def voc():
    global VOC
    if VOC is None:
        VOC = B.Vocab(B.load_textbook()['tw'])
    return VOC


# 문법이 도입하는 기능어 — 뜻풀이로 앞당겨 쓰지 않는다 (엄격 게이트)
STRICT = {
    'ὁ': 3, 'ὅς': 4, 'οὗτος': 10, 'ὅδε': 10, 'ἐκεῖνος': 10, 'τίς': 11, 'τις': 11, 'ὅστις': 11,
    'αὐτός': 12, 'ἕκαστος': 12, 'ἕτερος': 12, 'οὐδείς': 12, 'μηδείς': 37, 'ἐγώ': 16, 'σύ': 16,
    'ἡμεῖς': 16, 'ὑμεῖς': 16, 'ἐμαυτοῦ': 27, 'σεαυτοῦ': 27, 'ἑαυτοῦ': 27, 'αὑτοῦ': 27, 'ἀλλήλων': 27,
    'ἐμός': 27, 'σός': 27, 'ἡμέτερος': 27, 'ὑμέτερος': 27, 'τοιοῦτος': 13, 'τοσοῦτος': 25, 'ὅσος': 23,
    'οἷος': 31, 'ὅτι': 9, 'ὡς': 7, 'εἰ': 9, 'ἐάν': 22, 'ἤν': 22, 'ἄν': 24, 'ὅταν': 22, 'ἐπειδάν': 22,
    'ἵνα': 23, 'ὅπως': 23, 'ὥστε': 6, 'ἐπεί': 13, 'ἐπειδή': 13, 'ὅτε': 13, 'ἡνίκα': 13, 'πρίν': 26,
    'μέχρι': 26, 'ἕως': 26, 'ἔστε': 26, 'καίπερ': 23, 'εἴθε': 23, 'φημί': 40, 'οἶδα': 40, 'εἶμι': 39,
    'μή': 6, 'δύο': 12, 'εἷς': 37, 'τρεῖς': 37, 'τέτταρες': 37, 'πέντε': 37, 'δέκα': 37,
    'ἕξ': 37, 'ἑπτά': 37, 'ὀκτώ': 37, 'ἐννέα': 37, 'ἑκατόν': 37, 'χίλιοι': 37, 'μύριοι': 37,
    'εἴκοσι': 37, 'τριάκοντα': 37, 'διακόσιοι': 37, 'τρίτος': 37, 'ὦ': 11, 'ὅστισοῦν': 99,
    'ὁπότε': 26, 'ὁπόσος': 23, 'ὁποῖος': 31, 'πότερος': 27, 'ποῖος': 27, 'πόσος': 27,
    'ἐκεῖ': 10, 'ἐνθάδε': 10,
}
SUBORD = {'ὅτι', 'ὡς', 'εἰ', 'ἐάν', 'ἤν', 'ὅταν', 'ἐπειδάν', 'ἵνα', 'ὅπως', 'ὥστε', 'ἐπεί', 'ἐπειδή', 'ὅτε',
          'ἡνίκα', 'πρίν', 'μέχρι', 'ἕως', 'ἔστε', 'ὁπότε', 'διότι', 'ὅπου', 'ὅθεν', 'οὗ', 'ἐπάν', 'ἐπήν'}

AOR2_BASES = ['λαμβάνω', 'λείπω', 'βάλλω', 'ἄγω', 'ἔρχομαι', 'λέγω', 'ὁράω', 'ἔχω', 'πάσχω', 'μανθάνω',
              'φεύγω', 'πίπτω', 'θνῄσκω', 'θνήσκω', 'τυγχάνω', 'εὑρίσκω', 'αἱρέω', 'ἁμαρτάνω', 'ἱκνέομαι',
              'γίγνομαι', 'πυνθάνομαι', 'αἰσθάνομαι', 'ἕπομαι', 'ἐσθίω', 'πίνω', 'τρέχω', 'τίκτω', 'κάμνω',
              'λανθάνω', 'τέμνω', 'εἶπον', 'εἶδον', 'ἦλθον', 'ἔλαβον', 'τρέπω', 'ἐρωτάω', 'ἔρομαι', 'ὀφείλω',
              'ἀγείρω', 'ἐλαύνω']
ROOT_AOR = ['βαίνω', 'γιγνώσκω', 'γινώσκω', 'δύω', 'ἁλίσκομαι', 'βιόω', 'φύω', 'σβέννυμι']
LIQUID_END = ('ῶ', 'εῖς', 'εῖ', 'οῦμεν', 'εῖτε', 'οῦσι', 'οῦσιν', 'εῖν', 'ῶν', 'οῦσα', 'οῦν', 'οῦντα', 'οῦντες',
              'οῦμαι', 'εῖται', 'ούμεθα', 'εῖσθε', 'οῦνται', 'εῖσθαι', 'ούμενος', 'ούμενοι', 'οῦντος', 'οῦντι',
              'οῦντας', 'ούντων', 'οῦσαν', 'ούσης')
NAME_3RD = ('κράτης', 'σθένης', 'φάνης', 'γένης', 'μένης', 'κλῆς', 'τέλης', 'μήδης', 'πείθης', 'φάνης')
MI = set(B.MI_LEMMAS) | {'ἵστημι', 'καθίστημι', 'ἀφίστημι', 'ἐφίστημι', 'συνίστημι', 'παρίστημι', 'προΐστημι',
                          'μεθίστημι', 'ἀνίστημι', 'ἐπιδίδωμι', 'μεταδίδωμι', 'ἐκδίδωμι', 'ἐνδίδωμι',
                          'προστίθημι', 'ἀνατίθημι', 'μετατίθημι', 'συντίθημι', 'παρατίθημι', 'ὑποτίθημι',
                          'προΐημι', 'ἀνίημι', 'μεθίημι', 'συνίημι', 'ἐφίημι', 'παρίημι', 'ἀποδείκνυμι',
                          'ὄμνυμι', 'ζεύγνυμι', 'ῥήγνυμι', 'μείγνυμι', 'ὄλλυμι', 'ἀπόλλυμι', 'δείκνυμι'}


def base_match(lemma, bases):
    return any(lemma == b or (lemma.endswith(b[1:]) and len(lemma) > len(b)) for b in bases)


IRREG7 = {'ἀνήρ', 'πατήρ', 'μήτηρ', 'θυγάτηρ', 'γαστήρ', 'γυνή', 'κύων', 'Ζεύς', 'βοῦς', 'γραῦς', 'χείρ',
          'ὕδωρ', 'οὖς', 'φῶς', 'πῦρ', 'δόρυ', 'γόνυ', 'ἄστυ', 'κρέας', 'γῆρας', 'τέρας', 'κέρας'}


def noun_decl(lemma, gend):
    """명사를 배우는 과: 2변화 · 1변화 -η 3과, 그 밖의 1변화 4과, 3변화 자음 어간 6과,
    3변화 중성 · 불규칙 · ι/ευ 어간 7과, ναῦς 23과"""
    if lemma == 'ναῦς':
        return 23
    if lemma in IRREG7:
        return 7
    s = G.strip_all(lemma)
    if s.endswith('μα'):
        return 7
    if s.endswith('οσ'):
        return 7 if gend == 'n' else 3
    if s.endswith('ον'):
        return 3
    if s.endswith('ουσ'):
        return 3 if s in ('νουσ', 'πλουσ', 'ρουσ') else 7
    if s.endswith('η'):
        return 3
    if s.endswith('α'):
        return 4
    if s.endswith('ασ'):
        if gend == 'n':
            return 7
        if G.nfc(lemma).endswith('άς'):
            return 6
        return 4
    if s.endswith('ησ'):
        if lemma.endswith(NAME_3RD) or s in ('τριηρησ',) or G.nfc(lemma).endswith('ῆς'):
            return 6
        return 4
    if s.endswith('ευσ'):
        return 7
    if s.endswith(('σισ', 'ξισ', 'ψισ', 'μισ', 'βρισ')) or s == 'πολισ':
        return 7
    if s.endswith(('υ', 'ι', 'ω')) or (s.endswith('υσ') and gend != 'f'):
        return 7
    return 6


def adj_level(t):
    lemma, f = t['lemma'], t
    s = G.strip_all(lemma)
    u = 3
    if s.endswith(('ησ', 'υσ', 'ων', 'ην')) and s not in ('πολυσ',):
        u = 17
    if s.endswith('ουσ'):
        u = 17
    if lemma in B.SUPPLETIVE_COMP or f.get('deg'):
        if not s.startswith('αριστ'):
            u = max(u, 9)
    if lemma in ('μέγας', 'πολύς', 'πᾶς', 'ἅπας', 'σύμπας'):
        u = max(u, 18)
    if s.endswith(('τεοσ', 'τεον')):
        u = 40
    return u


def verb_level(t):
    lemma = t['lemma']
    tn, m, v = t.get('tense'), t.get('mood'), t.get('voice')
    act = v == 'act'
    form = t['form']
    if lemma == 'εἰμί':
        if m == 'ind' and tn == 'pres' and t.get('pers') == '3' and t.get('num') == 'sg':
            return 3
        if m == 'inf' and tn == 'pres':
            return 5
        if m == 'ind' and tn in ('pres', 'impf'):
            return 12
        if tn == 'fut':
            return 25
        return {'ptcp': 19, 'subj': 22, 'opt': 23, 'imp': 39}.get(m, 12)
    if lemma in ('φημί', 'οἶδα'):
        return 40
    if lemma == 'εἶμι' or (lemma.endswith('ειμι') and v == 'act' and G.strip_all(form)[:1] in 'ιῃ'):
        return 39
    if lemma == 'δεῖ':
        return 11
    if lemma == 'χρή':
        return 17
    aor2 = base_match(lemma, AOR2_BASES)
    u = 1
    if m in ('ind', 'inf'):
        if tn in ('pres', 'fut'):
            u = 5 if act else 25
            if m == 'ind' and tn == 'pres' and act and t.get('pers') == '3':
                u = 3
        elif tn == 'impf':
            u = 8 if act else 26
        elif tn == 'aor':
            u = 8 if act else (30 if v == 'pass' else (26 if aor2 else 27))
        elif tn in ('perf', 'plpf', 'futperf'):
            u = 31 if act else 32
    elif m == 'ptcp':
        if tn in ('pres', 'fut'):
            u = 19 if act else 25
        elif tn == 'aor':
            u = (19 if aor2 else 20) if act else (30 if v == 'pass' else (26 if aor2 else 27))
        elif tn in ('perf', 'futperf', 'plpf'):
            u = 31 if act else 32
    elif m == 'subj':
        u = 22 if act else 28
        if tn == 'perf':
            u = max(u, 31)
    elif m == 'opt':
        u = 23 if act else 29
        if tn == 'perf':
            u = max(u, 31)
    elif m == 'imp':
        u = 35 if lemma in MI else 34
    if v == 'pass' and tn in ('aor', 'fut'):
        u = max(u, 30)
    s = G.nfc(lemma)
    if tn in ('pres', 'impf'):
        if s.endswith(('άω', 'έω', 'ῶ')) and not s.endswith('ζῶ'):
            u = max(u, 15)
        if s.endswith(('άομαι', 'έομαι')):
            u = max(u, 25)
        if s.endswith('όω'):
            u = max(u, 16)
    if tn == 'fut' and form.endswith(LIQUID_END):
        u = max(u, 16)
    if lemma in MI or s.endswith('μι') and s not in ('εἰμί', 'φημί', 'εἶμι'):
        u = max(u, 14 if base_match(lemma, ['τίθημι', 'ἵημι', 'δείκνυμι']) else 13)
        if m == 'ptcp':
            u = max(u, 20)
    if tn == 'aor' and act and base_match(lemma, ROOT_AOR):
        u = max(u, 38)
    if tn in ('perf', 'plpf') and not act:
        st = G.strip_all(lemma)
        if not st.endswith(('αω', 'εω', 'οω', 'υω', 'ιω', 'ευω', 'αυω', 'ουω', 'ομαι')) or st.endswith(('ζομαι', 'γομαι', 'κομαι', 'χομαι', 'πομαι', 'φομαι', 'ττομαι', 'σσομαι')):
            u = max(u, 33)
    return u


def is_crasis(form):
    d = G.nfd(form)
    if not d or d[0].lower() not in 'κτθχ':
        return False
    return any(c in (G.SMOOTH, G.ROUGH) for c in d[1:4]) and len(form) > 2


def tok_level(t):
    """(문법 과, 이유)"""
    pos, lemma = t['pos'], t['lemma']
    if t.get('num') == 'du' and lemma != 'δύο':
        return 99, '쌍수'
    if is_crasis(t['form']):
        return 17, '융합'
    if lemma in STRICT:
        u = STRICT[lemma]
        if pos in ('verb', 'ptcp'):
            u = max(u, verb_level(t))
        return u, lemma
    if pos == 'noun':
        return noun_decl(lemma, t.get('gend')), ''
    if pos == 'adj':
        return adj_level(t), ''
    if pos in ('verb', 'ptcp'):
        return verb_level(t), ''
    if pos == 'pron':
        return 10, '대명사'
    if pos == 'art':
        return 3, ''
    return 1, ''


def sent_level(toks):
    """문장 문법 과 · 구문 표지"""
    byid = {t['id']: t for t in toks}
    lv, why = 1, []
    tags = set()
    for t in toks:
        u, r = tok_level(t)
        if u > lv:
            lv = u
        if u >= 3 and r:
            why.append(f'{t["form"]}:{u}')
    for t in toks:
        h = byid.get(t['head'])
        lem = t['lemma']
        if lem == 'ἄν' and h is not None:
            if h.get('mood') == 'ind' and h.get('tense') in ('impf', 'aor', 'plpf'):
                lv = max(lv, 27); tags.add('ἄν+과거직설')
            elif h.get('mood') == 'opt':
                lv = max(lv, 24); tags.add('ἄν+기원')
        if lem == 'εἰ' and h is not None and h.get('mood') == 'opt':
            lv = max(lv, 24); tags.add('εἰ+기원')
        if t['pos'] == 'ptcp' and t.get('case') == 'gen' and t['rel'].startswith('ADV'):
            lv = max(lv, 21); tags.add('속격절대')
        if t['pos'] == 'art' and h is not None and h.get('mood') == 'inf':
            lv = max(lv, 15); tags.add('관사+부정사')
        if t['pos'] == 'ptcp' and h is not None and h['lemma'] in ('τυγχάνω', 'λανθάνω', 'φθάνω'):
            lv = max(lv, 21); tags.add('보충분사')
        if lem == 'ὅπως' and any(x['head'] == t['id'] and x.get('tense') == 'fut' and x.get('mood') == 'ind' for x in toks):
            lv = max(lv, 40); tags.add('노력절')
        if t.get('mood') == 'subj' and t.get('tense') == 'aor' and t.get('pers') == '2' and \
                any(x['lemma'] == 'μή' and x['head'] == t['id'] for x in toks) and t['rel'].startswith('PRED'):
            lv = max(lv, 34); tags.add('금지')
        if t.get('mood') == 'subj' and t.get('pers') == '1' and t.get('num') == 'pl' and t['rel'].startswith('PRED'):
            tags.add('권유')
        if t.get('mood') == 'opt' and t['rel'].startswith('PRED') and not any(x['lemma'] == 'ἄν' for x in toks):
            tags.add('소원?')
    return lv, why, tags


def gloss_need(toks, lesson):
    """뜻풀이가 필요한 낱말 (그 과까지 어휘 목록에 없는 것)"""
    v = voc()
    out = []
    for t in toks:
        if t['pos'] in ('punct',) or not G.is_greek(t['form']):
            continue
        lem = t['lemma']
        if lem in STRICT:
            continue
        u = v.unit.get(lem)
        if u is None and lem.endswith('ω') and (lem[:-1] + 'ομαι') in v.unit:
            u = v.unit[lem[:-1] + 'ομαι']
        if u is None or u > lesson:
            out.append(lem)
    return out


# ── 발췌 구간 ───────────────────────────────────────────────────────────────
CORE = ('SBJ', 'OBJ', 'PNOM', 'OCOMP', 'sub', 'obj', 'xobj', 'ag', 'arg', 'obl', 'narg')


def is_word(t):
    return t['pos'] != 'punct' and G.is_greek(t['form'])


def main_clause_ok(sent, span_ids, root):
    """root 가 주절의 술어인가 (종속접속사 아래가 아닌가)"""
    byid = {t['id']: t for t in sent['toks']}
    seen = set()
    cur = root
    while cur is not None and cur['id'] not in seen:
        seen.add(cur['id'])
        if cur is not root and (cur['lemma'] in SUBORD or cur['rel'].startswith('AuxC')):
            return False
        h = cur.get('head')
        if h in byid:
            cur = byid[h]
        else:
            a = sent['arts'].get(h)
            if a and (a['rel'].startswith(('ADV', 'OBJ', 'ATR')) and a['head'] in byid and
                      (byid[a['head']]['lemma'] in SUBORD or byid[a['head']]['rel'].startswith('AuxC'))):
                return False
            cur = None
    return True


def spans(sent, maxw=16):
    """(시작, 끝, 부분 여부) — 문장 전체 또는 구두점 경계의 닫힌 절"""
    toks = sent['toks']
    words = [i for i, t in enumerate(toks) if is_word(t)]
    n = len(words)
    if n == 0:
        return
    if n <= maxw:
        yield 0, len(toks), False
    bounds = [0] + [i + 1 for i, t in enumerate(toks) if t['pos'] == 'punct' and t['form'] in (',', '·', ';', '.', ':')] + [len(toks)]
    if 'after' in toks[0]:
        bounds = [0] + [i + 1 for i, t in enumerate(toks) if re.search(r'[,·;.:]', t.get('after', ''))] + [len(toks)]
    bounds = sorted(set(bounds))
    byid = {t['id']: t for t in toks}
    for a in range(len(bounds)):
        for b in range(a + 1, len(bounds)):
            i, j = bounds[a], bounds[b]
            if i == 0 and j == len(toks):
                continue
            seg = [t for t in toks[i:j] if is_word(t)]
            if len(seg) < 3 or len(seg) > maxw:
                continue
            ids = {t['id'] for t in toks[i:j]}
            ext = [t for t in seg if t['head'] not in ids]
            heads = {t['head'] for t in ext}
            root = None
            if len(ext) == 1 and ext[0]['rel'].upper().startswith('PRED'):
                root = ext[0]
            elif len(heads) == 1:
                h = next(iter(heads))
                art = sent['arts'].get(h)
                if art and art['rel'].upper().startswith('PRED') and not art['head'] in byid:
                    root = ext[0]
            if root is None or not main_clause_ok(sent, ids, root):
                continue
            bad = False
            for t in toks:
                if t['id'] in ids or not is_word(t):
                    continue
                if t['head'] in ids and t['rel'].split('_')[0] in CORE:
                    bad = True
                    break
            for t in seg:
                if t['pos'] == 'prep' and not any(x['head'] == t['id'] for x in seg):
                    bad = True
            if not bad:
                yield i, j, True


def fix_final_accent(text):
    """발췌 끝 낱말의 둔음 → 예음"""
    m = re.search(r'(\S+?)([.,·;:]*)\s*$', text)
    if not m:
        return text
    w = m.group(1)
    if G.GRAVE in G.nfd(w):
        text = text[:m.start(1)] + G.grave_to_acute(w) + text[m.end(1):]
    return text


SPANS = os.path.join(CORPORA, 'excerpt_spans.pkl')


def all_spans(sents, maxw=16):
    """모든 발췌 구간의 과 판정 — 한 번 계산해 캐시"""
    if os.path.exists(SPANS) and os.path.getmtime(SPANS) > os.path.getmtime(__file__):
        with open(SPANS, 'rb') as f:
            return pickle.load(f)
    out = []
    seen = set()
    for si, s in enumerate(sents):
        auth = s['key'].split('.')[0]
        if auth in SKIP_AUTH:
            continue
        for i, j, part in spans(s, maxw):
            toks = s['toks'][i:j]
            lv, why, tags = sent_level(toks)
            if lv > 40:
                continue
            words = [t for t in toks if is_word(t)]
            text = text_of(toks)
            text = re.sub(r'^[,·;.:\s]+', '', text)
            text = re.sub(r'[,·:\s]+$', '', text)
            if part:
                text = fix_final_accent(text)
            if text in seen:
                continue
            seen.add(text)
            pref = PREFER.index(auth) if auth in PREFER else len(PREFER)
            rels = [t['rel'].upper() for t in words]
            finite = any(t.get('mood') in ('ind', 'subj', 'opt', 'imp') for t in words)
            complete = finite or (any(r.startswith('SBJ') for r in rels) and any(r.startswith('PNOM') for r in rels))
            out.append({'si': si, 'i': i, 'j': j, 'part': part, 'text': text, 'n': len(words),
                        'lv': lv, 'lemmas': [t['lemma'] for t in words], 'why': why, 'tags': sorted(tags),
                        'src': work_label(s['key'], s['locus']), 'pref': pref, 'key': s['key'],
                        'complete': complete})
    with open(SPANS, 'wb') as f:
        pickle.dump(out, f)
    return out


def gloss_lemmas(lemmas, lesson):
    v = voc()
    out = []
    for lem in lemmas:
        if lem in STRICT:
            continue
        u = v.unit.get(lem)
        if u is None and lem.endswith('ω') and (lem[:-1] + 'ομαι') in v.unit:
            u = v.unit[lem[:-1] + 'ομαι']
        if u is None or u > lesson:
            out.append(lem)
    return out


def candidates(sents, lesson, maxw=16, exact=True, minw=4):
    out = []
    for c in all_spans(sents, 16):
        if (c['lv'] != lesson) if exact else (c['lv'] > lesson):
            continue
        if c['n'] < minw or c['n'] > maxw or not c['complete']:
            continue
        c = dict(c, gloss=gloss_lemmas(c['lemmas'], lesson))
        out.append(c)
    return out


def score(c):
    return (len(c['gloss']) * 3 + abs(c['n'] - 8) * 0.5 + c['pref'] * 0.8 + (1.5 if c['part'] else 0))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--build', action='store_true')
    ap.add_argument('--lesson', type=int)
    ap.add_argument('-n', type=int, default=40)
    ap.add_argument('--maxgloss', type=int, default=4)
    ap.add_argument('--maxw', type=int, default=16)
    ap.add_argument('--minw', type=int, default=4)
    ap.add_argument('--stats', action='store_true')
    ap.add_argument('--grep', help='정규식으로 본문 필터')
    ap.add_argument('--tag', help='구문 표지 필터 (예: 속격절대)')
    ap.add_argument('--author', help='tlg 번호 필터 (예: tlg0032)')
    ap.add_argument('--upto', action='store_true', help='그 과 이하 전부 (기본: 그 과에서 새로 배우는 것이 든 문장만)')
    ap.add_argument('--lemma', help='이 표제어가 든 문장만 (쉼표로 여럿)')
    args = ap.parse_args()
    if args.build:
        build_cache()
        return
    sents = load_cache()
    if args.stats:
        for L in range(3, 41):
            cs = [c for c in candidates(sents, L, args.maxw) if len(c['gloss']) <= args.maxgloss]
            print(L, len(cs), sum(1 for c in cs if not c['part']))
        return
    cs = [c for c in candidates(sents, args.lesson, args.maxw, exact=not args.upto, minw=args.minw)
          if len(c['gloss']) <= args.maxgloss]
    if args.grep:
        cs = [c for c in cs if re.search(args.grep, c['text'])]
    if args.tag:
        cs = [c for c in cs if args.tag in c['tags']]
    if args.author:
        cs = [c for c in cs if c['key'].startswith(tuple(args.author.split(',')))]
    if args.lemma:
        want = set(args.lemma.split(','))
        cs = [c for c in cs if want & set(c['lemmas'])]
    cs.sort(key=score)
    for c in cs[:args.n]:
        print(f"[{c['si']}:{c['i']}-{c['j']}{' 부분' if c['part'] else ''}] {c['text']}")
        print(f"    — {c['src']} · 풀이 {len(c['gloss'])}: {' '.join(c['gloss'])} · {' '.join(c['why'][:6])} {' '.join(c['tags'])}")


if __name__ == '__main__':
    main()
