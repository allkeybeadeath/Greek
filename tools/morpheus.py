"""Morpheus 형태분석 조회 (Perseids 공개 서비스) + 로컬 캐시.

Morpheus 는 악센트를 엄격히 본다 — 잘못 찍힌 악센트는 분석 결과가 0건.
캐시(tools/morpheus_cache.json)를 저장소에 함께 두어 네트워크 없이도 재검증할 수 있게 한다.
"""
import json
import os
import threading
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_PATH = os.path.join(HERE, 'morpheus_cache.json')
URL = 'https://services.perseids.org/bsp/morphologyservice/analysis/word'
KEEP = ('pofs', 'tense', 'mood', 'voice', 'pers', 'num', 'case', 'gend',
        'dial', 'comp', 'stemtype', 'decl', 'derivtype', 'morph')

_lock = threading.Lock()
_cache = None


def _load():
    global _cache
    if _cache is None:
        if os.path.exists(CACHE_PATH):
            with open(CACHE_PATH, encoding='utf-8') as f:
                _cache = json.load(f)
        else:
            _cache = {}
    return _cache


def save():
    with _lock:
        c = _load()
        tmp = CACHE_PATH + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(c, f, ensure_ascii=False, sort_keys=True, indent=0)
        os.replace(tmp, CACHE_PATH)


def _fetch(word):
    q = urllib.parse.urlencode({'lang': 'grc', 'engine': 'morpheusgrc', 'word': word})
    last = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(URL + '?' + q, timeout=40) as r:
                d = json.load(r)
            break
        except Exception as e:  # 네트워크 일시 오류 — 지수 백오프
            last = e
            time.sleep(2 ** attempt)
    else:
        raise RuntimeError(f'Morpheus 조회 실패: {word}: {last}')
    body = d['RDF']['Annotation'].get('Body')
    if not body:
        return []
    if isinstance(body, dict):
        body = [body]
    out = []
    for b in body:
        e = b['rest']['entry']
        hd = (e.get('dict') or {}).get('hdwd', {})
        hd = hd.get('$') if isinstance(hd, dict) else hd
        infl = e.get('infl', [])
        if isinstance(infl, dict):
            infl = [infl]
        for i in infl:
            a = {'hdwd': hd}
            for k in KEEP:
                v = i.get(k)
                if isinstance(v, dict):
                    v = v.get('$')
                if v:
                    a[k] = v
            out.append(a)
    return out


def analyses(word):
    c = _load()
    if word in c:
        return c[word]
    res = _fetch(word)
    with _lock:
        c[word] = res
    return res


def prefetch(words, workers=4):
    """캐시에 없는 낱말을 병렬 조회."""
    c = _load()
    todo = sorted({w for w in words if w not in c})
    if not todo:
        return 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for i, _ in enumerate(ex.map(analyses, todo)):
            if i % 50 == 49:
                save()
    save()
    return len(todo)


if __name__ == '__main__':
    import sys
    for w in sys.argv[1:]:
        print(w, json.dumps(analyses(w), ensure_ascii=False, indent=1))
    save()
