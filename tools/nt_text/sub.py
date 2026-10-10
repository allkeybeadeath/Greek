# 본문 고치기: sub.py BOOK CITE OLD NEW
import json, sys
p = '/home/user/Greek/units-src/nt/wh.json'
V = json.load(open(p, encoding='utf-8'))
b, c, old, new = int(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4]
v = next(v for v in V if v['b'] == b and v['cite'] == c)
assert v['text'].count(old) == 1, v['text']
v['text'] = v['text'].replace(old, new)
with open(p, 'w', encoding='utf-8') as f:
    f.write('[\n' + ',\n'.join(json.dumps(v, ensure_ascii=False) for v in V) + '\n]\n')
print(c, v['text'])
