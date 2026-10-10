#!/usr/bin/env python3
"""신약 전권 해석 문항 생성 (v73) — units-src/nt/wh.json + units-src/nt/ko/NN.txt → units-src/nt/NN.txt

신약 27권의 모든 절을 해석 문항으로 싣는다. 사람이 쓰는 것은 한국어 번역 · 오답 보기 · 해설(units-src/nt/ko/NN.txt)뿐이고,
나머지는 이 도구가 만든다.

  1. 본문: units-src/nt/wh.json — Westcott–Hort(Perseus canonical-greekLit) 절 본문을 정리한 것
     (절 경계는 PROIEL 과 낱말 정렬로 바로잡고, 디지털화 오타 · 악센트를 고쳤다; tools/nt_text/ 참고).
  2. 형태: 절마다 PROIEL 트리뱅크(Tischendorf 본문, 문맥 형태 분석)의 같은 절 낱말과 맞춰
     '@a 형태 = @표제어 분석' 을 단다 — Morpheus 의 여러 분석 가운데 문맥에 맞는 것을 고르게 해서,
     과 판정(문법 게이트)과 낱말 풀이가 문맥을 따르게 한다. Morpheus 가 모르는 형태(주로 히브리 이름)는
     PROIEL 분석을 tools/manual_forms_nt.tsv 에 적는다.
  3. 과: 낱말마다 허용되는 가장 이른 과를 구해, 그 가운데 가장 늦은 과에 문항을 놓는다
     (build_units.Checker.allowed_auth — 원전 발췌와 같은 게이트).
  4. 같은 본문이 앞에 이미 있으면(앞 과의 발췌 · 신약 안의 같은 절) 건너뛴다.

사용
  GREEK_CORPORA=~/corpora python3 tools/nt_units.py          # 번역이 있는 책 전부
  GREEK_CORPORA=~/corpora python3 tools/nt_units.py 1 2      # 마태 · 마가만
그다음 python3 tools/build_units.py 로 검증 · 생성.
"""
import argparse
import collections
import glob
import json
import os
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_units as B  # noqa: E402
import greek_util as G  # noqa: E402

ROOT = os.path.dirname(HERE)
NT_DIR = os.path.join(ROOT, 'units-src', 'nt')
CORPORA = os.environ.get('GREEK_CORPORA', os.path.expanduser('~/corpora'))
CODES = ['MATT', 'MARK', 'LUKE', 'JOHN', 'ACTS', 'ROM', '1COR', '2COR', 'GAL', 'EPH', 'PHIL', 'COL', '1THESS', '2THESS',
         '1TIM', '2TIM', 'TIT', 'PHILEM', 'HEB', 'JAS', '1PET', '2PET', '1JOHN', '2JOHN', '3JOHN', 'JUDE', 'REV']

P_TENSE = {'p': 'pres', 'i': 'impf', 'f': 'fut', 'a': 'aor', 'r': 'perf', 'l': 'plpf', 't': 'futperf'}
P_MOOD = {'i': 'ind', 's': 'subj', 'o': 'opt', 'm': 'imp', 'n': 'inf', 'p': 'ptcp'}
P_VOICE = {'a': 'act', 'm': 'mid', 'p': 'pass', 'e': 'mp'}
P_NUM = {'s': 'sg', 'p': 'pl', 'd': 'du'}
P_GEND = {'m': 'm', 'f': 'f', 'n': 'n', 'o': 'm/n', 'p': 'm/f', 'r': 'f/n'}
P_CASE = {'n': 'nom', 'g': 'gen', 'd': 'dat', 'a': 'acc', 'v': 'voc'}
P_DEG = {'c': 'comp', 's': 'sup'}


def norm(w):
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if not unicodedata.combining(c)).lower().replace('ς', 'σ')
    return re.sub(r'[^\w]', '', w)


def proiel_code(morph):
    m = (morph or '').ljust(10, '-')
    out = []
    if m[2] in P_TENSE:
        out.append(P_TENSE[m[2]])
    if m[3] in P_MOOD:
        out.append(P_MOOD[m[3]])
    if m[4] in P_VOICE:
        out.append(P_VOICE[m[4]])
    if m[0] in '123' and m[3] in 'isom':      # 인칭은 정동사에만 (대명사의 인칭은 Morpheus 분석에 없다)
        out.append(m[0])
    if m[5] in P_GEND:
        out.append(P_GEND[m[5]])
    if m[6] in P_CASE:
        out.append(P_CASE[m[6]])
    if m[1] in P_NUM:
        out.append(P_NUM[m[1]])
    if m[7] in P_DEG:
        out.append(P_DEG[m[7]])
    return ' '.join(out)


def load_proiel():
    path = os.path.join(CORPORA, 'proiel', 'greek-nt.xml')
    P = collections.defaultdict(list)
    for t in ET.parse(path).getroot().iter('token'):
        c = t.get('citation-part')
        if not t.get('form') or not c:
            continue
        P[c].append({'n': norm(t.get('form')), 'form': t.get('form'), 'lemma': G.nfc(t.get('lemma') or ''),
                     'pos': t.get('part-of-speech') or '', 'code': proiel_code(t.get('morphology'))})
    return P


def norm2(w):
    """철자 차이를 덮는 정렬용 정규형 — WH 의 ει (Δαυείδ · Ἰσραηλεῖται) 와 Tischendorf 의 ι, 겹자음(Ἰωάνης ↔ Ἰωάννης)"""
    w = norm(w).replace('ει', 'ι')
    return re.sub(r'(.)\1', r'\1', w)


def align(toks, ptoks):
    """WH 토큰 → PROIEL 토큰 (같은 절 안에서 순서대로, 낱말 몇 개 건너뛰기 허용)"""
    out = [None] * len(toks)
    j = 0
    for i, t in enumerate(toks):
        for f in (norm, norm2):
            n = f(t)
            hit = next((k for k in range(j, min(j + 5, len(ptoks))) if (ptoks[k]['n'] if f is norm else norm2(ptoks[k]['form'])) == n), None)
            if hit is not None:
                out[i] = ptoks[hit]
                j = hit + 1
                break
    # 남은 토큰: 앞뒤로 맞춘 토큰 사이에서 철자가 가장 비슷한 PROIEL 토큰 (κατασκηνοῖν ↔ κατασκηνοῦν, συνσταυρ- ↔ συσταυρ-)
    import difflib
    pos = {id(p): k for k, p in enumerate(ptoks)}
    used = {id(p) for p in out if p}
    for i, t in enumerate(toks):
        if out[i] or not norm(t):
            continue
        lo = max([pos[id(out[x])] for x in range(i) if out[x]], default=-1)
        hi = min([pos[id(out[x])] for x in range(i + 1, len(toks)) if out[x]], default=len(ptoks))
        best, br = None, 0.7
        for k in range(lo + 1, hi):
            if id(ptoks[k]) in used:
                continue
            r = difflib.SequenceMatcher(None, norm2(t), norm2(ptoks[k]['form'])).ratio()
            if r > br:
                best, br = ptoks[k], r
        if best:
            out[i] = best
            used.add(id(best))
    return out


# PROIEL 과 Morpheus 의 표제어 관행 차이 — 같은 낱말로 본다
ALIAS = {('ὑμεῖς', 'σύ'), ('ἡμεῖς', 'ἐγώ'), ('λέγω', 'εἶπον'), ('λέγω', 'ἐρῶ'), ('λέγω', 'ἐρέω'), ('ὁράω', 'εἶδον'),
         ('ὁράω', 'ὄψομαι'), ('ὁράω', 'ἰδέ'), ('ζῶ', 'ζάω'), ('ἀείρω', 'αἴρω'), ('οὐχί', 'οὐ'), ('ἆρα', 'ἄρα'),
         ('πολύς', 'πλείων'), ('καταλείπω', 'καταλιμπάνω'), ('ἐρύω', 'ῥύομαι'), ('μάλα', 'μάλιστα'), ('μάλα', 'μᾶλλον'),
         ('ἀγαθός', 'κρείττων'), ('ἀγαθός', 'βελτίων'), ('κακός', 'χείρων'), ('μέγας', 'μείζων'), ('μικρός', 'ἐλάττων'),
         ('φέρω', 'ἐνεγκ'), ('ἔρχομαι', 'ἦλθον'), ('ἐσθίω', 'φαγεῖν'), ('ἐσθίω', 'ἔφαγον'), ('τὶς', 'τις'), ('ὁ', 'ὅς'),
         ('ἀφίστημι', 'ἀφεστήξω'), ('συνέχω', 'συνόχωκα'), ('μήτι', 'μήτις'), ('πολύς', 'πλέως'), ('πολύς', 'πλέω')}


def _loose(l):
    l = re.sub(r'[\d()]', '', B.norm_lemma(l or '')).split('-')[-1]
    l = ''.join(c for c in unicodedata.normalize('NFD', l) if not unicodedata.combining(c)).lower().replace('ς', 'σ')
    out = {l, l.replace('σσ', 'ττ'), l.replace('ττ', 'σσ')}
    for x in list(out):
        if x.endswith('ομαι'):
            out.add(x[:-4] + 'ω')
        if x.endswith('ω') and not x.endswith('ομαι'):
            out.add(x[:-1] + 'ομαι')
        if x.endswith('ωσ') and len(x) > 3:       # 부사 -ως ↔ 형용사 -ος · -ης
            out |= {x[:-2] + 'οσ', x[:-2] + 'ησ', x[:-2] + 'υσ'}
        if x.endswith('ω') and len(x) <= 3:       # ζῶ ↔ ζάω
            out |= {x[:-1] + 'αω', x[:-1] + 'εω'}
    return out


def compat(pl, ml):
    if not pl or not ml:
        return False
    a, b = B.norm_lemma(pl), B.norm_lemma(ml)
    if a == b or (a, b) in ALIAS or (b, a) in ALIAS:
        return True
    if any(b.startswith(y) for (x, y) in ALIAS if x == a and len(y) <= 5):
        return True
    return bool(_loose(a) & _loose(b))


def finish(text):
    """문항 끝 부호: 물음은 ; 그 밖은 . — 쉼표 · 윗점 · 대시로 끝나는 절도 . 로 닫는다"""
    t = text.strip().rstrip('—').strip()
    t = re.sub(r'[\s,·:]+$', '', t)
    if not t.endswith(('.', ';')):
        t = t + '.'
    m = re.match(r'^(.*?)(\S+)([.;])$', t)
    return m.group(1) + G.nfc(_acute_final(m.group(2))) + m.group(3)


def _acute_final(w):
    d = unicodedata.normalize('NFD', w)
    i = d.rfind('̀')
    return unicodedata.normalize('NFC', d[:i] + '́' + d[i + 1:]) if i >= 0 else w


def load_ko(n):
    path = os.path.join(NT_DIR, 'ko', f'{n:02d}.txt')
    out = {}
    if not os.path.exists(path):
        return out
    for ln, line in enumerate(open(path, encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('//'):
            continue
        parts = [x.strip() for x in re.split(r'\s+\|(?:\s+|$)', line)]
        if len(parts) < 2 or not parts[1]:
            raise SyntaxError(f'{path}:{ln}: «절 | 번역 [| 해설]» 또는 «절 | 번역 | 오답1 | 오답2 [| 해설]»: {line!r}')
        cite = parts[0]
        if cite in out:
            raise SyntaxError(f'{path}:{ln}: 절 중복 {cite}')
        if len(parts) >= 4:
            out[cite] = {'ko': parts[1], 'w1': parts[2], 'w2': parts[3], 'note': parts[4] if len(parts) > 4 else ''}
        else:
            # 오답을 적지 않은 절 — 낱말이 가장 많이 겹치는 다른 절의 번역을 오답으로 쓴다 (auto_wrong)
            out[cite] = {'ko': parts[1], 'w1': None, 'w2': None, 'note': parts[2] if len(parts) > 2 else ''}
    return out


STOP_LEMMAS = {'ὁ', 'καί', 'δέ', 'αὐτός', 'εἰμί', 'ἐν', 'οὗτος', 'λέγω', 'εἰς', 'ὅς', 'οὐ', 'γάρ', 'ἐγώ', 'σύ', 'ὅτι', 'πᾶς', 'μή', 'ἵνα', 'ἐκ', 'ἐπί'}


def auto_wrong(items):
    """오답이 비어 있는 절에 오답 두 개를 채운다.

    같은 책에서 (드물면 신약 전체에서) PROIEL 표제어가 가장 많이 겹치는 절 둘의 번역 — 낱말은 비슷하지만
    뜻이 다른 문장이라, 그리스어를 실제로 읽어야 고를 수 있다. 겹침은 드문 낱말일수록 무겁게 (idf) 잰다.
    결과는 입력이 같으면 늘 같다."""
    import math
    lem = []
    df = collections.Counter()
    for it in items:
        s = {p['lemma'] for p in it['al'] if p and p.get('lemma')} - STOP_LEMMAS
        lem.append(s)
        df.update(s)
    n = len(items)
    idf = {l: math.log(n / c) for l, c in df.items()}
    inv = collections.defaultdict(list)
    for i, s in enumerate(lem):
        for l in s:
            inv[l].append(i)
    for i, it in enumerate(items):
        ko = it['ko']
        if ko['w1'] is not None:
            continue
        score = collections.Counter()
        for l in lem[i]:
            if df[l] > 400:       # 너무 흔한 낱말은 후보를 넓히기만 한다
                continue
            for j in inv[l]:
                if j != i:
                    score[j] += idf[l] * (1.5 if items[j]['v']['b'] == it['v']['b'] else 1.0)
        # 길이가 비슷할수록 조금 더
        L = len(ko['ko'])
        cand = sorted(score, key=lambda j: (-(score[j] - abs(len(items[j]['ko']['ko']) - L) / 400), j))
        # 후보가 모자라면 같은 책의 앞뒤 절
        same = [j for j in range(n) if items[j]['v']['b'] == it['v']['b'] and j != i]
        same.sort(key=lambda j: (abs(j - i), j))
        picked = []
        for j in cand + same:
            t = items[j]['ko']['ko']
            if t != ko['ko'] and t not in picked and t != '-':
                picked.append(t)
            if len(picked) == 2:
                break
        while len(picked) < 2:
            picked.append('(다른 절)')
        ko['w1'], ko['w2'] = picked


def existing_texts():
    """기존 유닛 원본(units-src/u*.txt)의 해석 문항 그리스어 — 같은 절이 이미 있으면 건너뛴다"""
    seen = set()
    for p in glob.glob(os.path.join(ROOT, 'units-src', 'u*.txt')):
        sec = None
        for line in open(p, encoding='utf-8'):
            m = re.match(r'^([a-z]+):', line)
            if m:
                sec = m.group(1)
                continue
            if sec == 'tr' and '|' in line and not line.startswith('@'):
                seen.add(norm(line.split('|')[0]))
    return seen


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('books', nargs='*', type=int)
    ap.add_argument('--needs', help='번역과 상관없이 모든 절을 처리해, 뜻풀이가 필요한 표제어 목록을 이 파일에 쓴다 (원본은 쓰지 않음)')
    args = ap.parse_args()
    V = json.load(open(os.path.join(NT_DIR, 'wh.json'), encoding='utf-8'))
    P = load_proiel()
    B.load_glossary()
    voc = B.Vocab(B.load_textbook()['tw'])
    books = args.books or [n for n in range(1, 28) if os.path.exists(os.path.join(NT_DIR, 'ko', f'{n:02d}.txt'))]
    kos = {n: load_ko(n) for n in books}
    if args.needs:
        books = args.books or list(range(1, 28))
        dummy = {'ko': '-', 'w1': '-', 'w2': '-', 'note': ''}
        kos = {n: {v['cite']: dummy for v in V if v['b'] == n} for n in books}

    # 대상 절
    seen = existing_texts()
    items = []
    for v in V:
        if v['b'] not in kos:
            continue
        ko = kos[v['b']].get(v['cite'])
        if not ko:
            continue
        g = finish(v['text'])
        key = norm(g)
        if key in seen:
            print(f"건너뜀 (앞에 같은 본문): {v['book']} {v['cite']}")
            continue
        seen.add(key)
        ch, vn = v['cite'].split('.')
        items.append({'v': v, 'g': g, 'ko': ko, 'pkey': f"{CODES[v['b'] - 1]} {ch}.{re.sub(r'[ab]$', '', vn)}"})
    for n in books:
        miss = [c for c in kos[n] if not any(it['v']['b'] == n and it['v']['cite'] == c for it in items)]
        known = {v['cite'] for v in V if v['b'] == n}
        bad = [c for c in miss if c not in known]
        if bad:
            raise SystemExit(f'{n:02d}.txt: 본문에 없는 절 {bad[:5]}')

    # 1차: Morpheus 가 모르는 형태 → PROIEL 분석으로 수동 형태 (manual_forms_nt.tsv)
    import morpheus
    allt = {G.query_form(w) for it in items for w, _ in G.tokenize(it['g'])}
    morpheus.prefetch({t for t in allt if t and G.is_greek(t)}, workers=8)
    manual_path = B.MANUAL_NT_PATH
    rows = collections.OrderedDict()
    if os.path.exists(manual_path):
        for line in open(manual_path, encoding='utf-8'):
            if line.strip() and not line.startswith('#'):
                f, lem, code, why = (line.rstrip('\n').split('\t') + ['', '', '', ''])[:4]
                rows[(f, code)] = (lem, why)
    ck = B.Checker(voc)
    for it in items:
        toks = [w for w, _ in G.tokenize(it['g'])]
        al = align(toks, P.get(it['pkey'], []))
        it['toks'], it['al'] = toks, al
        picks, clash = {}, set()
        for t, p in zip(toks, al):
            if not p or re.search(r'\s', p.get('lemma') or ''):
                continue
            key = G.nfc(t)
            code = p['code']
            try:
                _, combos, _, _ = B.parse_code(code) if code else (None, [{}], 'noun', {})
            except ValueError:
                continue
            an = ck.analyses(t)
            fit = [a for a in an if any(B.feats_match(c, B.feats(a)) for c in combos)]
            good = [a for a in fit if compat(p['lemma'], a.get('hdwd')) and not re.search(r'\s', a.get('hdwd') or '')]
            if good:
                pick = (f"@{good[0]['hdwd']} " + code).strip()
            else:
                # Morpheus 에 문맥에 맞는 분석이 없거나 표제어가 다르다 → PROIEL 분석을 수동 형태로
                rows[(G.query_form(t), code)] = (p['lemma'], f"PROIEL {it['pkey']} ({p['pos']})")
                pick = (f"@{p['lemma']} " + code).strip()
            if key in picks and picks[key] != pick:
                clash.add(key)
            picks[key] = pick
        for k in clash:
            picks.pop(k, None)
        it['picks'] = picks
    with open(manual_path, 'w', encoding='utf-8') as f:
        f.write('# 신약 전권 — Morpheus 에 문맥에 맞는 분석이 없는 형태 (히브리 · 아람 이름, 코이네 꼴, 표제어 오분석). PROIEL 트리뱅크의 문맥 분석에서 만든다 (tools/nt_units.py).\n')
        f.write('# 형태<TAB>표제어<TAB>분석 코드<TAB>근거\n')
        for (form, code), (lem, why) in sorted(rows.items()):
            f.write(f'{form}\t{lem}\t{code}\t{why}\n')
    ck = B.Checker(voc)       # 수동 형태 다시 읽기

    auto_wrong(items)

    # 2차: 과 판정
    unknown = collections.Counter()
    for it in items:
        picks = it['picks']
        need = 3
        for t in it['toks']:
            pk = picks.get(G.nfc(t))
            pick = None
            if pk:
                words = pk.split()
                lem_p, combos, _, slots = B.parse_code(' '.join(w for w in words))
                pick = (lem_p, combos if slots else None, False)
            u0 = None
            for u in range(3, 41):
                if ck.allowed_auth(t, u, pick)[0]:
                    u0 = u
                    break
            if u0 is None:
                why = ck.allowed_auth(t, 40, pick)[2]
                unknown[f'{t} — {why[:80]}'] += 1
                u0 = 40
            need = max(need, u0)
        it['unit'] = need
    if args.needs:
        need_gl = collections.OrderedDict()
        for it in items:
            for t in it['toks']:
                pk = it['picks'].get(G.nfc(t))
                pick = None
                if pk:
                    lem_p, combos, _, slots = B.parse_code(pk)
                    pick = (lem_p, combos if slots else None, False)
                ok, good, why, new = ck.allowed_auth(t, it['unit'], pick)
                if ok and new:
                    row = ck.gloss(t, good)
                    if not row[2]:
                        e = need_gl.setdefault(row[1], [0, t, f"{it['v']['book']} {it['v']['cite']}"])
                        e[0] += 1
        with open(args.needs, 'w', encoding='utf-8') as f:
            for lem, (c, t, where) in need_gl.items():
                f.write(f'{lem}\t{c}\t{t}\t{where}\n')
        print('뜻풀이 필요 표제어', len(need_gl), '→', args.needs)
        return
    if unknown:
        print(f'40과에서도 허용되지 않는 낱말 {len(unknown)}종 (빌드에서 오류로 나온다):')
        for k, c in unknown.most_common(40):
            print(f'  {c:4d}  {k}')

    # 쓰기
    for n in books:
        its = [it for it in items if it['v']['b'] == n]
        if not its:
            continue
        name = its[0]['v']['book']
        path = os.path.join(NT_DIR, f'{n:02d}.txt')
        by = collections.defaultdict(list)
        for it in its:
            by[it['unit']].append(it)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(f'// {name} — 신약 전권 해석 문항 (v73). tools/nt_units.py 가 wh.json + ko/{n:02d}.txt 로 만든다. 직접 고치지 말 것.\n')
            for u in sorted(by):
                f.write(f'\n=== unit {u}\ntr:\n')
                for it in by[u]:
                    v, ko = it['v'], it['ko']
                    note = ko['note']
                    if v.get('br'):
                        note = (note + ' ' if note else '') + '(WH 가 괄호로 묶은 낱말 · 절을 괄호 없이 실었다.)'
                    for x in (it['g'], ko['ko'], ko['w1'], ko['w2'], note):
                        if '|' in x:
                            raise SystemExit(f"{name} {v['cite']}: '|' 는 쓸 수 없다")
                    f.write(f"{it['g']} | {ko['ko']} | {ko['w1']} | {ko['w2']} | {note}\n")
                    ch, vn = v['cite'].split('.')
                    f.write(f"@src 신약, 『{name}』 {ch}:{vn}\n")
                    for form, code in it['picks'].items():
                        f.write(f'@a {form} = {code}\n')
                    if v.get('acc_ok'):
                        f.write('@acc WH 악센트 그대로 — 전접어가 이어지는 자리\n')
        cnt = collections.Counter(it['unit'] for it in its)
        print(f'{n:02d} {name}: {len(its)}절 → ' + ' '.join(f'{u}과 {cnt[u]}' for u in sorted(cnt)))


if __name__ == '__main__':
    main()
