# 절 경계 고치기. 사용: mv.py BOOK A B N  — A 의 끝 낱말 N 개를 B 앞으로 (N<0 이면 B 의 앞 낱말 -N 개를 A 끝으로)
import json, sys
p = '/home/user/Greek/units-src/nt/wh.json'
V = json.load(open(p, encoding='utf-8'))
b, a, c, n = int(sys.argv[1]), sys.argv[2], sys.argv[3], int(sys.argv[4])
va = next(v for v in V if v['b'] == b and v['cite'] == a)
vc = next(v for v in V if v['b'] == b and v['cite'] == c)
wa, wc = va['text'].split(), vc['text'].split()
if n > 0:
    mv = wa[-n:]; wa = wa[:-n]; wc = mv + wc
else:
    mv = wc[:-n]; wc = wc[-n:]; wa = wa + mv
va['text'], vc['text'] = ' '.join(wa), ' '.join(wc)
# 문장 첫 대문자 정리: 옮긴 뒤 B 첫 글자가 소문자 이어붙음은 그대로 둔다
with open(p, 'w', encoding='utf-8') as f:
    f.write('[\n' + ',\n'.join(json.dumps(v, ensure_ascii=False) for v in V) + '\n]\n')
print(a, va['text']); print(c, vc['text'])
