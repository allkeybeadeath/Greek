"""WH(Perseus) 절 본문 → 앱 표기로 정리. 낱말은 바꾸지 않고 악센트 · 기호만.
- [ ] ⟦ ⟧ 괄호 제거(괄호가 있었는지 기록), ʼ → ᾽, 대시 앞뒤 띄어쓰기
- 대문자 단락 첫머리 → PROIEL 같은 절의 악센트 있는 꼴
- 문맥 악센트: 둔음/예음, 전접어 악센트 (검사기 오류를 보고 반복 교정)"""
import json, re, sys, unicodedata, collections, pickle
sys.path.insert(0, '/home/user/Greek/tools'); import greek_util as G
V = json.load(open('verses_split.json'))
CODES = ['MATT','MARK','LUKE','JOHN','ACTS','ROM','1COR','2COR','GAL','EPH','PHIL','COL','1THESS','2THESS','1TIM','2TIM','TIT','PHILEM','HEB','JAS','1PET','2PET','1JOHN','2JOHN','3JOHN','JUDE','REV']
S = pickle.load(open('/home/user/corpora/excerpt_corpus.pkl', 'rb'))
pro = collections.defaultdict(list)
for s in S:
    if s['key'] != 'tlg0031.nt': continue
    for t in s['toks']:
        pro[t.get('cite') or s['locus']].append(t['form'])
# 토큰별 인용(citation-part) 이 캐시에 없으니 문장 locus 로 묶는다 (첫 토큰 기준)
def strip(w): return G.strip_all(w).lower() if hasattr(G, 'strip_all') else w
def acc(w): return ''.join(c for c in unicodedata.normalize('NFD', w) if not unicodedata.combining(c)).lower().replace('ς', 'σ')
proforms = collections.defaultdict(set)
for k, forms in pro.items():
    m = re.match(r'(\w+) (\d+)\.', k)
    if m:
        for f in forms: proforms[(m.group(1), m.group(2))].add(f)
CAPS_MANUAL = {}
GRAVE, ACUTE = '̀', '́'
def to_grave(w):
    d = unicodedata.normalize('NFD', w); i = d.rfind(ACUTE)
    return unicodedata.normalize('NFC', d[:i] + GRAVE + d[i+1:]) if i >= 0 else w
def to_acute(w):
    d = unicodedata.normalize('NFD', w); i = d.rfind(GRAVE)
    return unicodedata.normalize('NFC', d[:i] + ACUTE + d[i+1:]) if i >= 0 else w
def drop_acc(w):
    d = unicodedata.normalize('NFD', w)
    return unicodedata.normalize('NFC', ''.join(c for c in d if c not in (ACUTE, GRAVE, '͂')))
unres = collections.Counter(); left = []
out = []
for v in V:
    t = v['text'].replace('ʼ', '᾽').replace('’', '᾽')
    br = bool(re.search(r'[\[\]⟦⟧]', t))
    t = re.sub(r'[\[\]⟦⟧]', '', t)
    t = re.sub(r'\s*—\s*', ' — ', t).strip(' —')
    t = re.sub(r'\s+([,.;·:])', r'\1', t)
    t = re.sub(r'\s+', ' ', t)
    # 대문자 낱말
    ch = v['cite'].split('.')[0]
    def fixcap(m):
        w = m.group(0)
        if (len(w) < 2 and w not in ('Ο', 'Η')) or w.upper() != w or not re.search('[Α-Ω]', w): return w
        cands = [f for f in proforms[(CODES[v['b']-1], ch)] if acc(f) == acc(w)]
        if cands:
            f = sorted(cands, key=lambda x: (x[0].islower(),))[0]
            return f
        unres[w] += 1; return w
    t = re.sub(r'[^\s,.;·:—()]+', fixcap, t)
    # 첫 글자 대문자로 시작한 대문자 낱말이었으면 첫 글자만 대문자
    for _ in range(6):
        errs = G.check_sentence_accents(G.nfc(t))
        if not errs: break
        changed = False
        for e in errs:
            w, msg = e.split(': ', 1)
            fix = None
            if '둔음이어야 함' in msg: fix = to_grave(w)
            elif '문장부호' in msg and '둔음' in msg: fix = to_acute(w)
            elif '둔음 대신 예음' in msg: fix = to_acute(w)
            elif '악센트를 잃어야 함' in msg: fix = drop_acc(w)
            elif '악센트 없음' in msg or '악센트가 2개' in msg or '이중 악센트' in msg or '개수 이상' in msg:
                cands = sorted({f for f in proforms[(CODES[v['b']-1], ch)] if acc(f) == acc(w) and f != w})
                if len(cands) == 1: fix = cands[0]
                elif w in ('Ο', 'Η'): fix = w.lower().replace('ο', 'ὁ').replace('η', 'ἡ')
            if fix and fix != w:
                t2 = re.sub(r'(?<![^\s—(])' + re.escape(w) + r'(?=[\s,.;·:—)]|$)', fix, t, count=1)
                if t2 != t: t = t2; changed = True
        if not changed: break
    rest = G.check_sentence_accents(G.nfc(t))
    if rest: left.append((v['book'], v['cite'], rest))
    out.append(dict(v, text=G.nfc(t), br=br))
json.dump(out, open('verses_norm.json', 'w'), ensure_ascii=False)
print('대문자 미해결', dict(unres))
print('남은 악센트 오류 절', len(left))
c = collections.Counter(re.sub(r'\(.*?\)', '', e.split(': ', 1)[1]) for _, _, es in left for e in es)
print(c.most_common(12))
for x in left[:25]: print(x)
