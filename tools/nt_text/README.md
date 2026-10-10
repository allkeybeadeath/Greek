# 신약 본문 (units-src/nt/wh.json) 만들기

Westcott–Hort 본문 (Perseus canonical-greekLit tlg0031, CC BY-SA 4.0) 에서 절 단위 본문을 만든 과정. 작업 폴더에서 차례로 실행한다 (`GREEK_CORPORA` 아래 corpora 필요).

1. `extract.py` — Perseus TEI 에서 절을 뽑는다 → `verses.json`
2. `resplit.py` — Perseus 의 절 표지가 어긋난 곳을 PROIEL(Tischendorf, 표준 절 구분)과 맞춰 다시 나눈다 → `verses_split.json`
3. `normalize.py` — 악센트 · 대문자 · 디지털화 오타 정리 → `verses_norm.json`
4. `fixes.py` — 손으로 고친 것 (어순, 비문 대문자, 전접어 연쇄 `acc_ok`) → `verses_final.json` → `units-src/nt/wh.json`

그 뒤 번역하며 찾은 오류는 `wh.json` 을 직접 고쳤다:

- `sub.py BOOK CITE OLD NEW` — 절 안의 문자열 바꾸기 (숨표 빠진 낱말, 깨진 첫 글자 등)
- `mv.py BOOK A B N` — 절 경계 옮기기 (A 끝 낱말 N 개를 B 앞으로, N<0 이면 반대)

번역은 `units-src/nt/ko/NN.txt` (NN = 책 번호), 뜻풀이는 `units-src/nt/glossary.tsv`, 유닛 원본은 `tools/nt_units.py` 가 `units-src/nt/NN.txt` 로 만든다.
