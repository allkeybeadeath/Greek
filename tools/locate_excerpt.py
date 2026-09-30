#!/usr/bin/env python3
"""원전 발췌의 위치 확인 — Perseus canonical-greekLit(TEI)에서 문장을 찾아 절 번호와 편집본 원문을 돌려준다. (v73)

발췌 문장은 이 도구로 편집본 원문과 한 글자씩 대조하고, 출처(@src)의 절 번호를 정한다.

말뭉치: $GREEK_CORPORA/cgl  ← https://github.com/PerseusDL/canonical-greekLit (sparse checkout)
        $GREEK_CORPORA/f1k  ← https://github.com/OpenGreekAndLatin/First1KGreek (이솝 등, 선택)

사용
  python3 tools/locate_excerpt.py "ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ"            # 전체에서 찾기
  python3 tools/locate_excerpt.py --work tlg0059.tlg002 "ἀνεξέταστος βίος"                # 작품 지정
  python3 tools/locate_excerpt.py --show tlg0032.tlg006 1.1.1                             # 절 본문 보기
"""
import argparse
import glob
import os
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET

CORPORA = os.environ.get('GREEK_CORPORA', os.path.expanduser('~/corpora'))
TEI = '{http://www.tei-c.org/ns/1.0}'
SKIP = {'note', 'bibl', 'head', 'label', 'ref', 'del', 'orig', 'sic', 'speaker'}


def norm(s):
    """비교용: 발음 구별 부호 · 문장부호 제거, 소문자, 종성 시그마 통일"""
    s = re.sub("[ʼ’'᾽ʹ῾]", '', s)   # 모음 탈락 부호는 지운다 (δʼ ↔ δ᾽)
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace('ς', 'σ')
    s = re.sub(r'[^\w\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def flatten(path):
    """TEI → [(인용 번호, 원문 조각)]"""
    root = ET.parse(path).getroot()
    body = root.find(f'.//{TEI}body')
    if body is None:
        return []
    out = []
    parts = []        # textpart n 스택
    mile = {}         # milestone 최신값 (unit → n)

    def cite():
        c = '.'.join(p for p in parts if p)
        sec = mile.get('section') or mile.get('verse')
        if sec:
            # 플라톤: 스테파누스 쪽(17a) — textpart 번호 뒤에 ':' 로 붙인다
            return f'{c}:{sec}' if c else sec
        return c

    def walk(el):
        tag = el.tag.replace(TEI, '')
        if tag in SKIP:
            if el.tail:
                out.append((cite(), el.tail))
            return
        pushed = False
        if tag == 'div' and el.get('type') == 'textpart':
            parts.append(el.get('n') or '')
            pushed = True
            # 새 textpart 가 열리면 그 아래 수준 milestone 은 무효
            mile.pop('section', None)
        if tag == 'milestone' and el.get('unit') in ('section', 'verse', 'chapter', 'para', 'card'):
            mile[el.get('unit')] = el.get('n') or ''
        if tag == 'l' and el.get('n'):
            # 운문: 행 번호 (비극 · 희극)
            mile['section'] = el.get('n')
        if el.text and tag not in ('milestone', 'pb', 'lb'):
            out.append((cite(), el.text))
        for ch in el:
            walk(ch)
        if pushed:
            parts.pop()
        if el.tail:
            out.append((cite(), el.tail))

    walk(body)
    return out


_cache = {}


def work_files(key=None):
    pats = []
    for base in ('cgl', 'f1k'):
        d = os.path.join(CORPORA, base, 'data')
        if key:
            tg, wk = key.split('.')[:2]
            pats += glob.glob(os.path.join(d, tg, wk, f'{tg}.{wk}.*grc*.xml'))
        else:
            pats += glob.glob(os.path.join(d, '*', '*', '*grc*.xml'))
    return sorted(pats)


def load(path):
    if path not in _cache:
        segs = flatten(path)
        text, index = '', []
        for c, t in segs:
            t = re.sub(r'\s+', ' ', t)
            if not t.strip():
                if text and not text.endswith(' '):
                    text += ' '
                continue
            index.append((len(text), c))
            text += t
        _cache[path] = (text, index)
    return _cache[path]


def find(excerpt, key=None, limit=5):
    """→ [(파일, 인용, 원문 발췌, 앞뒤 문맥)]"""
    q = norm(excerpt)
    hits = []
    for p in work_files(key):
        text, index = load(p)
        # 정규화 문자열 ↔ 원문 위치 대응표
        nt, pos = [], []
        for i, ch in enumerate(text):
            for c2 in norm(ch) if ch.strip() else ' ':
                nt.append(c2)
                pos.append(i)
        ns = ''.join(nt)
        ns2 = re.sub(r' +', ' ', ns)
        # 공백 압축에 따른 위치 보정
        comp, cpos, prev_sp = [], [], False
        for c2, i in zip(nt, pos):
            if c2 == ' ':
                if prev_sp:
                    continue
                prev_sp = True
            else:
                prev_sp = False
            comp.append(c2)
            cpos.append(i)
        ns2 = ''.join(comp)
        start = 0
        while True:
            k = ns2.find(q, start)
            if k < 0:
                break
            a, b = cpos[k], cpos[min(k + len(q) - 1, len(cpos) - 1)] + 1
            c = ''
            for off, ci in index:
                if off <= a:
                    c = ci
                else:
                    break
            hits.append((os.path.basename(p), c, text[a:b], text[max(0, a - 80):a] + '【' + text[a:b] + '】' + text[b:b + 80]))
            start = k + 1
            if len(hits) >= limit:
                return hits
    return hits


def show(key, citation):
    for p in work_files(key):
        text, index = load(p)
        spans = []
        for n, (off, c) in enumerate(index):
            if c == citation or c.startswith(citation + '.'):
                end = index[n + 1][0] if n + 1 < len(index) else len(text)
                spans.append(text[off:end])
        if spans:
            print(os.path.basename(p), citation)
            print(''.join(spans).strip())
            return
    print('없음', key, citation)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('excerpt', nargs='?')
    ap.add_argument('--work')
    ap.add_argument('--show', nargs=2, metavar=('WORK', 'CITE'))
    ap.add_argument('-n', type=int, default=5)
    a = ap.parse_args()
    if a.show:
        show(*a.show)
        return
    for f, c, t, ctx in find(a.excerpt, a.work, a.n):
        print(f'{f}  [{c}]  {t}')
        print('    …' + ctx.replace('\n', ' ') + '…')


if __name__ == '__main__':
    main()
