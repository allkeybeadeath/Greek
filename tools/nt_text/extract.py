import sys, re, glob, json
sys.path.insert(0, '/home/user/Greek/tools'); import locate_excerpt as L
KO = ['마태복음','마가복음','누가복음','요한복음','사도행전','로마서','고린도전서','고린도후서','갈라디아서','에베소서','빌립보서','골로새서','데살로니가전서','데살로니가후서','디모데전서','디모데후서','디도서','빌레몬서','히브리서','야고보서','베드로전서','베드로후서','요한1서','요한2서','요한3서','유다서','요한계시록']
out = []
for i, b in enumerate(KO, 1):
    p = glob.glob(f'/home/user/corpora/cgl/data/tlg0031/tlg{i:03d}/*grc2.xml')[0]
    d = {}; order = []
    for c, t in L.flatten(p):
        if c not in d: order.append(c); d[c] = ''
        d[c] += t
    for c in order:
        t = re.sub(r'\s+', ' ', d[c]).strip()
        if not t: continue
        out.append({'b': i, 'book': b, 'cite': c, 'text': t})
json.dump(out, open('verses.json', 'w'), ensure_ascii=False)
print(len(out)); print(out[0]); print(out[-1])
import collections; print(collections.Counter(len(x['text'].split()) for x in out).most_common(3), max(len(x['text'].split()) for x in out))
print(sum(1 for x in out if '[' in x['text'] or '⟦' in x['text']), 'with brackets')
print([x['cite'] for x in out if not re.match(r'^\d+\.\d+$', x['cite'])][:20])
