"""그리스어 문자열 유틸 — 토큰화 · 악센트 판독 · 문맥 악센트(둔음·전접어) 검사.

build_units.py 가 연습문제 문장과 변화표의 그리스어를 검증할 때 쓴다.
의존: greek-accentuation (pip install greek-accentuation)
"""
import re
import unicodedata

from greek_accentuation.syllabify import syllabify

ACUTE, GRAVE, CIRCUMFLEX = '́', '̀', '͂'
ACCENTS = {ACUTE, GRAVE, CIRCUMFLEX}
SMOOTH, ROUGH = '̓', '̔'
DIAERESIS = '̈'
IOTA_SUB = 'ͅ'

# 어말 생략 부호로 쓰이는 문자들 (U+1FBD koronis-like apostrophe, U+2019, U+02BC, ASCII ')
ELISION_MARKS = '᾽’ʼ\''
# 문장부호 (그리스어 물음표 U+037E, 윗점 U+0387/U+00B7 포함)
PUNCT = '.,;;··:!?—–-"«»()[]“”‘'

GREEK_RE = re.compile('[Ͱ-Ͽἀ-῿]')


def nfc(s):
    return unicodedata.normalize('NFC', s)


def nfd(s):
    return unicodedata.normalize('NFD', s)


def is_greek(s):
    return bool(GREEK_RE.search(s))


def strip_accents(s):
    """악센트만 제거 (숨표·하기 이오타는 유지)."""
    return nfc(''.join(c for c in nfd(s) if c not in ACCENTS))


def strip_all(s):
    """모든 발음 구별 부호 제거 + 소문자 — 느슨한 비교용."""
    out = ''.join(c for c in nfd(s) if not unicodedata.combining(c))
    return out.lower().replace('ς', 'σ')


def grave_to_acute(s):
    return nfc(nfd(s).replace(GRAVE, ACUTE))


def accent_marks(word):
    """단어의 악센트 목록 [(음절위치_끝에서, 종류)] — 위치 1=ultima, 2=penult, 3=antepenult.
    종류는 'acute' / 'grave' / 'circ'. 생략부호는 무시한다."""
    w = word.rstrip(ELISION_MARKS)
    try:
        syls = syllabify(w)
    except Exception:
        return []
    out = []
    n = len(syls)
    for i, syl in enumerate(syls):
        d = nfd(syl)
        for c in d:
            if c == ACUTE:
                out.append((n - i, 'acute'))
            elif c == GRAVE:
                out.append((n - i, 'grave'))
            elif c == CIRCUMFLEX:
                out.append((n - i, 'circ'))
    return out


def n_syllables(word):
    try:
        return len(syllabify(word.rstrip(ELISION_MARKS)))
    except Exception:
        return 0


# ── 전접어·후접어 ──────────────────────────────────────────────────────────
# 사전형(악센트 있는 형태)과 문중 무악센트형을 모두 등록. 비교는 strip_accents 후.
_ENCLITIC_BASE = """
εἰμί ἐστί ἐστίν ἐσμέν ἐστέ εἰσί εἰσίν
φημί φησί φησίν φαμέν φατέ φασί φασίν
τις τι τινός τινί τινά τινές τινῶν τισί τισίν τινάς του τῳ
μου μοι με σου σοι σε
που ποθι ποθεν ποτε πως πῃ ποι
γε τε τοι νυν περ
"""
ENCLITICS = {strip_accents(nfc(w)) for w in _ENCLITIC_BASE.split()}

# 악센트가 없는 후접어(proclitic) — 문중에서 악센트 없이 쓰임
PROCLITICS = {nfc(w) for w in 'ὁ ἡ οἱ αἱ ἐν εἰς ἐς ἐκ ἐξ οὐ οὐκ οὐχ εἰ ὡς'.split()}

# 둔음 규칙에서 예외: 의문사 τίς/τί 는 둔음이 되지 않는다
NEVER_GRAVE = {nfc('τίς'), nfc('τί')}


def is_enclitic_form(tok):
    """토큰이 전접어로 쓰였는가. 전접어 어형이라도 penult 에 악센트가 있으면
    (ἔστι, ἔστιν — 존재·강조의 orthotone) 전접어가 아니다."""
    if strip_accents(tok) not in ENCLITICS:
        return False
    marks = accent_marks(tok)
    if marks and n_syllables(tok) == 1:
        # 악센트 있는 단음절은 전접어가 아니다: 관사 τοῦ, 의문사 τίς/τί/ποῦ/πῶς, 강조형 σοῦ/σοί/σέ
        return False
    return all(pos == 1 for pos, _ in marks)


# ── 토큰화 ─────────────────────────────────────────────────────────────────
def tokenize(sentence):
    """문장을 [(word, punct_after)] 로. punct_after 는 단어 뒤 문장부호 문자열('' 가능).
    생략 부호(᾽)는 단어에 붙여 둔다."""
    s = nfc(sentence)
    out = []
    for raw in s.split():
        # 앞쪽 문장부호 제거
        lead = ''
        while raw and raw[0] in PUNCT:
            lead += raw[0]
            raw = raw[1:]
        # 뒤쪽 문장부호 분리 (생략 부호는 단어의 일부)
        trail = ''
        while raw and raw[-1] in PUNCT:
            trail = raw[-1] + trail
            raw = raw[:-1]
        if lead and out:
            # 앞 단어 뒤에 붙은 것으로 취급 (따옴표 등)
            w, p = out[-1]
            out[-1] = (w, p + lead)
        if raw:
            out.append((raw, trail))
        elif trail and out:
            w, p = out[-1]
            out[-1] = (w, p + trail)
    return out


def greek_words(text):
    """텍스트에서 그리스어 낱말만 뽑는다 (표 셀·항목 검증용)."""
    s = nfc(text)
    # 괄호 표기 (ν), (ς) 는 지운다: παιδεύουσι(ν) → παιδεύουσι
    s = re.sub(r'\((ν|ς|σ)\)', '', s)
    words = []
    s = re.sub(r'[/·|+→←=~…,]', ' ', s)
    # 어미(-σι) · 어간(δο-) 표기는 낱말이 아니다 — 문장부호를 떼기 전에 거른다
    s = ' '.join(t for t in s.split() if not (t.startswith('-') or t.rstrip(')').endswith('-')))
    for w, _ in tokenize(s):
        if w and is_greek(w) and not re.search('[A-Za-z가-힣0-9]', w):
            words.append(w)
    return words


# ── 문맥 악센트 검사 ───────────────────────────────────────────────────────
def check_sentence_accents(sentence):
    """문장 단위 악센트 규칙 검사. 오류 메시지 리스트를 돌려준다.

    검사 항목
      1) 둔음: 어말 예음(oxytone)은 뒤에 (전접어가 아닌) 낱말이 이어지면 둔음이어야 하고,
         둔음은 문장부호·문장 끝 앞에 올 수 없다.
      2) 전접어 앞 낱말: 전접어가 붙으면 proparoxytone·properispomenon 은 ultima 에
         예음을 하나 더 얹고, oxytone 은 예음을 유지한다.
      3) 악센트 개수: 일반 낱말은 악센트 1개 (전접어 앞 2개 허용). 후접어는 0개.
    """
    errs = []
    # 'ὅ τι' (ὅστις 의 중성을 띄어 쓴 꼴)은 한 낱말 ὅτι 처럼 본다 — 뒤의 전접어(τις …)는 paroxytone 뒤 규칙
    sentence = re.sub(nfc('ὅ τι(?=[\\s,.;·])'), nfc('ὅτι'), nfc(sentence))
    toks = tokenize(sentence)
    for i, (w, p) in enumerate(toks):
        marks = accent_marks(w)
        base = strip_accents(w)
        nxt = toks[i + 1][0] if i + 1 < len(toks) else None
        joined = nxt is not None and not p          # 뒤 낱말과 문장부호 없이 이어짐
        nxt_enclitic = joined and is_enclitic_form(nxt)
        elided = w[-1] in ELISION_MARKS

        # 전접어 자신: 앞 낱말(host)의 악센트 유형에 따라 자기 악센트 유무가 정해진다
        if is_enclitic_form(w):
            prev_w, prev_p = (toks[i - 1] if i > 0 else (None, '.'))
            if prev_w is None or prev_p:
                if not marks and base not in {strip_accents(nfc(x)) for x in ['τε', 'γε', 'τοι', 'περ']}:
                    errs.append(f'{w}: 문두/구두점 뒤 전접어에 악센트가 없음')
                continue
            hmarks = accent_marks(prev_w)
            h_elided = prev_w[-1] in ELISION_MARKS
            if h_elided:
                # 어말이 생략된 낱말 뒤의 전접어는 제 악센트를 지닌다 (ταῦτ᾽ ἐστί, ποῦ ποτ᾽ ἐστέ — Smyth §187)
                if not marks:
                    errs.append(f'{w}: 생략된 낱말({prev_w}) 뒤 전접어는 악센트를 유지')
                elif marks[-1][1] == 'grave' and not joined:
                    errs.append(f'{w}: 문장부호 앞 둔음')
                elif marks[-1][1] == 'acute' and marks[-1][0] == 1 and joined and not nxt_enclitic:
                    errs.append(f'{w}: 뒤에 낱말이 이어지므로 둔음이어야 함')
                continue
            # host 가 paroxytone(예음 1개, penult) 이고 전접어가 2음절이면 전접어는 ultima 악센트 유지
            if (len(hmarks) == 1 and hmarks[0] == (2, 'acute')
                    and n_syllables(w) >= 2):
                if not marks:
                    errs.append(f'{w}: paroxytone({prev_w}) 뒤 2음절 전접어는 악센트를 유지')
                else:
                    kind = marks[0][1]
                    if kind == 'grave' and not joined:
                        errs.append(f'{w}: 문장부호 앞 둔음')
                    if kind == 'acute' and joined and not (nxt and is_enclitic_form(nxt)):
                        errs.append(f'{w}: 뒤에 낱말이 이어지므로 둔음이어야 함')
            elif is_enclitic_form(prev_w) and not accent_marks(prev_w):
                # 전접어 연속 (εἴ τίς τινα) — 사람이 확인
                errs.append(f'{w}: 전접어 연속 — 수동 확인 필요')
            else:
                if marks:
                    errs.append(f'{w}: 이 자리의 전접어는 악센트를 잃어야 함 (host {prev_w})')
            continue

        # 후접어 (ὁ, ἐν, οὐ …) — 악센트가 있는 ὅ · ἥ · οἵ · αἵ 는 관계대명사라 일반 낱말로 본다
        rel = marks and base.lower() in {nfc(x) for x in ('ὁ', 'ἡ', 'οἱ', 'αἱ')}
        if not rel and (nfc(w).lower() in PROCLITICS or base.lower() in PROCLITICS):
            if not joined and base.lower() in {'ου', 'ουκ', 'ουχ'} and not marks:
                errs.append(f'{w}: 절 끝의 οὐ 는 악센트를 얻어 οὔ')
            if nxt_enclitic:
                # εἴ τις, οὔ φημι — 후접어가 예음을 얻는다
                if not marks:
                    errs.append(f'{w}: 전접어 앞 후접어에 예음이 필요')
            elif marks and not (not joined):
                errs.append(f'{w}: 후접어에 악센트가 있음')
            continue

        if elided:
            continue
        if not marks:
            errs.append(f'{w}: 악센트 없음')
            continue

        graves = [m for m in marks if m[1] == 'grave']
        if graves:
            if not joined:
                errs.append(f'{w}: 문장부호/문장 끝 앞의 둔음')
            elif nxt_enclitic:
                errs.append(f'{w}: 전접어 앞에서는 둔음 대신 예음')
        if nxt_enclitic:
            first = marks[0]
            kind = first[1]
            pos = first[0]
            if len(marks) == 2:
                # 두 번째 악센트는 ultima 예음이어야 하고, 첫째는 proparoxytone/properispomenon
                second = marks[1]
                if not (second == (1, 'acute') and ((pos == 3 and kind == 'acute') or (pos == 2 and kind == 'circ'))):
                    errs.append(f'{w}: 전접어 앞 이중 악센트 형태가 잘못됨')
            elif len(marks) == 1:
                if (pos == 3 and kind == 'acute') or (pos == 2 and kind == 'circ'):
                    errs.append(f'{w}: 전접어 앞에서 ultima 에 예음을 더 얹어야 함 ({nxt})')
            else:
                errs.append(f'{w}: 악센트 개수 이상')
        else:
            if len(marks) != 1:
                errs.append(f'{w}: 악센트가 {len(marks)}개')
            else:
                pos, kind = marks[0]
                if pos == 1 and kind == 'acute' and joined and nfc(w).lower() not in NEVER_GRAVE:
                    errs.append(f'{w}: 뒤에 낱말이 이어지므로 둔음이어야 함')
    return errs


POSTPOSITIVES = {strip_accents(nfc(w)) for w in 'γάρ δέ μέν οὖν τε γε ἄρα δή μέντοι τοίνυν αὖ τοι'.split()}


def is_postpositive(w):
    return strip_accents(nfc(w).rstrip(PUNCT)) in POSTPOSITIVES


def to_grave(word):
    """어말 예음(oxytone)을 둔음으로. 조건이 안 맞으면 그대로."""
    if nfc(word).lower() in NEVER_GRAVE or word[-1:] in PUNCT:
        return word
    marks = accent_marks(word)
    if marks != [(1, 'acute')]:
        return word
    d = nfd(word)
    i = d.rfind(ACUTE)
    return nfc(d[:i] + GRAVE + d[i + 1:])


def join_chunks(chunks):
    """작문 조각을 이어 붙이며 조각 끝 oxytone 을 둔음으로 바꾼다 (앱 런타임과 같은 규칙)."""
    words = []
    for i, ch in enumerate(chunks):
        ws = ch.split()
        if i < len(chunks) - 1:
            nxt = chunks[i + 1].split()[0]
            if not is_enclitic_form(nxt):
                ws[-1] = to_grave(ws[-1])
        words += ws
    return ' '.join(words)


def query_form(tok):
    """Morpheus 조회용 정규형: 둔음→예음, 전접어 때문에 붙은 두 번째 예음 제거."""
    w = nfc(tok)
    marks = accent_marks(w)
    if len(marks) == 2 and marks[1] == (1, 'acute'):
        # ultima 의 (두 번째) 예음 제거
        syls = syllabify(w.rstrip(ELISION_MARKS))
        last = nfd(syls[-1]).replace(ACUTE, '', 1)
        syls[-1] = nfc(last)
        w = nfc(''.join(syls)) + w[len(w.rstrip(ELISION_MARKS)):]
    w = grave_to_acute(w)
    return w


if __name__ == '__main__':
    tests = [
        'ὁ ἄνθρωπος καλός ἐστιν.',
        'ὁ ἄνθρωπός ἐστι καλός.',
        'τὸ δῶρόν ἐστι καλόν.',
        'καλὸς ὁ λόγος.',
        'καλός ὁ λόγος.',
        'ὁ λόγος καλὸς.',
        'λόγος ἐστὶ καλός.',
        'τίς ἐστιν;',
        'εἴ τις ταῦτα λέγει, οὐκ ἔστι σοφός.',
    ]
    for t in tests:
        print(t, check_sentence_accents(t))
    print(query_form('ἄνθρωπός'), query_form('καλὸς'), query_form('δῶρόν'))
