"""Perseus WH 본문을 장 단위로 이어 붙인 뒤, PROIEL(표준 절 구분)과 낱말 정렬로 절을 다시 나눈다.
줄바꿈 하이픈 · 띄어진 낱말(ἐπεκα- λύφθησαν, ἐπισκὲ ψασθε)도 PROIEL 낱말과 맞으면 이어 붙인다."""
import json, re, collections, unicodedata, difflib
import xml.etree.ElementTree as ET
CODES = ['MATT','MARK','LUKE','JOHN','ACTS','ROM','1COR','2COR','GAL','EPH','PHIL','COL','1THESS','2THESS','1TIM','2TIM','TIT','PHILEM','HEB','JAS','1PET','2PET','1JOHN','2JOHN','3JOHN','JUDE','REV']
def n(w):
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if not unicodedata.combining(c)).lower().replace('ς', 'σ')
    return re.sub(r'[^\w]', '', w)
root = ET.parse('/home/user/corpora/proiel/greek-nt.xml').getroot()
P = collections.defaultdict(list)          # (book, ch) -> [(verse, normtok, form)]
for t in root.iter('token'):
    c = t.get('citation-part')
    if not t.get('form') or not c: continue
    m = re.match(r'(\w+) (\d+)\.(\d+)', c)
    if m: P[(m.group(1), int(m.group(2)))].append((int(m.group(3)), n(t.get('form')), t.get('form')))
V = json.load(open('verses.json'))
bych = collections.OrderedDict()
for v in V:
    ch = int(re.match(r'(\d+)', v['cite']).group(1))
    bych.setdefault((v['b'], ch), []).append(v)
out = []; stats = collections.Counter()
for (b, ch), vs in bych.items():
    code = CODES[b - 1]
    toks = []; tagv = []
    for v in vs:
        vn0 = int(v['cite'].split('.')[1].rstrip('ab')) if re.match(r'^\d+\.\d+[ab]?$', v['cite']) else None
        for t in v['text'].split(): toks.append(t); tagv.append(vn0)
    # 하이픈 · 띄어진 낱말 잇기
    pro = P.get((code, ch))
    proset = {x[1] for x in pro} if pro else set()
    j = []; jt = []; i = 0
    while i < len(toks):
        t = toks[i]
        if i + 1 < len(toks):
            a = t[:-1] if t.endswith('-') else t
            cat = n(a + toks[i + 1])
            if (t.endswith('-') or (n(a) not in proset and n(toks[i+1]) not in proset)) and cat in proset and n(a):
                # PROIEL 꼴로 (악센트 정상) — 뒤에 붙은 문장부호는 살린다
                form = next(x[2] for x in pro if x[1] == cat)
                tail = re.search(r'[,.;·:]+$', toks[i + 1])
                j.append(form + (tail.group(0) if tail else '')); jt.append(tagv[i]); i += 2; stats['joined'] += 1; continue
            if t.endswith('-'):
                j.append(a + toks[i + 1]); jt.append(tagv[i]); i += 2; stats['joined_nohit'] += 1; continue
        j.append(t); jt.append(tagv[i]); i += 1
    toks = j; tagv = jt
    pstart = {}
    for k, vn0 in enumerate(tagv):
        if vn0 is not None and vn0 not in pstart: pstart[vn0] = k
    pv = set(pstart)
    if pro and len({x[0] for x in pro} & pv) < 0.9 * len(pv):
        pro = None
    if not pro:
        # PROIEL 없음 → Perseus 경계 그대로 (잇기만 반영하려면 다시 나눌 수 없으니 원래 절 사용)
        for v in vs: out.append(v); stats['kept'] += 1
        continue
    a = [n(t) for t in toks]; bb = [x[1] for x in pro]
    sm = difflib.SequenceMatcher(None, a, bb, autojunk=False)
    p2a = {}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): p2a[blk.b + k] = blk.a + k
    # PROIEL 각 절의 첫 토큰 → Perseus 위치
    starts = []
    seen = set()
    for idx, (vn, _, _) in enumerate(pro):
        if vn in seen: continue
        seen.add(vn)
        # 그 절의 토큰 중 처음으로 정렬된 것
        k = idx; pos = None
        while k < len(pro) and pro[k][0] == vn:
            if k in p2a: pos = p2a[k] - (k - idx); break
            k += 1
        if pos is not None: starts.append((vn, max(pos, 0)))
    # 위치 단조 증가만 남김
    clean = []; last = -1
    for vn, pos in starts:
        if pos > last: clean.append((vn, pos)); last = pos
        else: stats['dropped_start'] += 1
    # 경계 고르기: Perseus(WH) 위치 p 와 PROIEL 위치 q
    if {vn for vn, _ in clean} != pv:
        clean = sorted(((vn, pos) for vn, pos in pstart.items()), key=lambda x: x[1]); stats['chapter_perseus'] += 1
    else:
        def score(pos):
            if pos <= 0: return 3
            prev = toks[pos - 1]
            return 2 if re.search(r'[.;·]$', prev) else 1 if prev.endswith(',') else 0
        ch2 = []
        for vn, q in clean:
            p = pstart.get(vn, q)
            if p == q: ch2.append((vn, q)); continue
            if abs(p - q) > 3: ch2.append((vn, q)); stats['use_proiel_far'] += 1
            elif score(q) > score(p): ch2.append((vn, q)); stats['use_proiel_punct'] += 1
            else: ch2.append((vn, p)); stats['use_perseus'] += 1
        clean = sorted(ch2, key=lambda x: x[1])
    have = {vn for vn, _ in clean}
    for vn in pv - have:
        clean.append((vn, pstart[vn])); stats['perseus_start'] += 1
    clean.sort(key=lambda x: x[1])
    ded = []
    for vn, pos in clean:
        if ded and ded[-1][1] == pos: stats['same_pos'] += 1; print('같은 위치', vs[0]['book'], ch, ded[-1][0], vn); continue
        ded.append((vn, pos))
    clean = ded
    if clean: clean[0] = (clean[0][0], 0)
    for k, (vn, pos) in enumerate(clean):
        end = clean[k + 1][1] if k + 1 < len(clean) else len(toks)
        text = ' '.join(toks[pos:end]).strip()
        if not text: continue
        out.append({'b': b, 'book': vs[0]['book'], 'cite': f'{ch}.{vn}', 'text': text})
        stats['resplit'] += 1
    # Perseus 에만 있는 절 번호 (PROIEL 에 없는 절: WH 가 본문에 둔 절은 드묾) — 경고
    miss = pv - {vn for vn, _ in clean}
    for vn in sorted(miss): stats['perseus_only'] += 1; print('Perseus 에만 있는 절', vs[0]['book'], f'{ch}.{vn}')
json.dump(out, open('verses_split.json', 'w'), ensure_ascii=False)
print(len(out), dict(stats))
