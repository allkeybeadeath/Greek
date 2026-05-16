/* data-characters.js — v55
 * ============================================================================
 * 50 캐릭터 전원의 Wikimedia Commons 사진 URL (v54 의 41 + v55 의 9).
 *
 * v54 → v55 변경 사항 (v54 hotfix 의 완결):
 *   v54 에서는 검증된 41 entries + 9 미수록 (SVG 폴백) 구조였음. v55 는
 *   미수록 9 entries (diomedes · orpheus · aeneas · penelope · atalanta ·
 *   medea · empedocles · herodotus · solon) 의 Wikimedia 파일명을
 *   카테고리 페이지에서 *실제로 listing 된* 파일들로 확보하여 재추가.
 *
 *   검증 방법론 (v54 의 추측 오류 재현 방지):
 *   1. Wikimedia Commons `Category:X` 페이지를 web search 로 직접 노출
 *   2. 페이지에 *실제로 listing 된* 파일명 (사이즈·MB 와 함께) 만 채택
 *   3. 파일명을 글자 그대로 (대소문자·언더스코어·괄호·일련번호) 보존
 *   4. 추측·외삽·기억 금지 — listing 에 없으면 다른 카테고리 검색
 *
 *   v55 신규 9 entries 의 출처 카테고리 (모두 listing 확인):
 *     diomedes    → Cat:Diomedes (Louvre, Ma 890) — Kresilas 의 5c BC 원본
 *     orpheus     → Cat:Pergamonmuseum - Orpheus mosaic — Miletus, ~200 CE
 *     aeneas      → Cat:Aeneas, Anchises, and Ascanius by Bernini — 1618-19
 *     penelope    → Cat:Penelope and the Suitors by JW Waterhouse — 1912
 *     atalanta    → Cat:Atalanta and Hippomenes by Guido Reni (Naples)
 *     medea       → Cat:Medea by Eugène Delacroix — 1838 Lille 원본
 *     empedocles  → File: 검증 — Salvator Rosa 의 *Death of Empedocles*
 *     herodotus   → Wikidata 정전 — MET DT11742 (2c AD 로마 복제)
 *     solon       → File: 검증 — Vatican Museums Solon 흉상
 *
 *   주의 (v54 의 hestia 케이스와 같은 미세 패턴):
 *     - medea, solon: 확장자가 *대문자 `.JPG`* — Wikimedia 는 case-sensitive
 *     - aeneas: 파일명에 *콤마 + 괄호* 포함 — Special:FilePath 가 처리
 *     - herodotus: `(cropped)` 괄호 — Wikidata 가 채택한 cropped 버전
 *
 *   결과: 50/50 모두 사진. v54 의 41 + 9 SVG 폴백 → v55 의 50 사진
 *   일관 표시. 캐릭터 picker, 프로필, 명예의 전당, 라이브 순위 모두 동일.
 *
 *   참조용 v53→v54 의 broken→verified 교체 사례 (변경 없음):
 *     zeus: Bust_Zeus_Otricoli_... → Zeus_Otricoli_... (불필요한 'Bust_' 제거)
 *     poseidon: 0036MAN-Poseidon → Bronze_statue_of_Zeus_or_Poseidon (단순화)
 *     ares: ...Ma866 → ...Ma_866_n01 (Commons 명명 규칙: 띄어쓰기 + n01)
 *     ajax: ...d_Ajax_05 → ...d_Ajax_01 (카테고리에 01, 02 만; 05 없음)
 *     hestia: ..._Giustiniani_Torlonia → ..._Giustiniani (불필요 suffix 제거)
 *
 * 출처: Wikimedia Commons (모든 이미지는 public domain — 고대 유물 또는
 *   복제권 만료). URL 형식: Special:FilePath (해시 계산 없이 작동).
 *
 * 구조:
 *   CHARACTER_IMAGES[id] = {url, caption, license}
 *     - url: 직접 이미지 URL (브라우저가 Special:FilePath 리다이렉트 따라감)
 *     - caption: 작품/출처 짧은 설명
 *     - license: "PD" (public domain)
 *
 * 로드 실패 시 _charMedallion 의 SVG 폴백이 자동 표시됨 (onerror).
 * 사진 자체는 SW (paideia-img-v55 캐시) 가 1회 다운로드 후 오프라인 보존.
 *
 * 표시 위치 (v52~): renderCharacterPicker 96px / renderProfiles 80px /
 *   renderHall 88px 카드. 작은 메달리온 (32/44px) 은 SVG 만 사용.
 * ============================================================================ */

const CHARACTER_IMAGES = {

  // ── 올림포스 신 12명 (전원 사진) ────────────────────────────────────
  zeus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zeus_Otricoli_Pio-Clementino_Inv257.jpg?width=240',
    caption: '제우스 — 오트리콜리 흉상 (Vatican Museums, 4세기 BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  hera: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hera_Campana_Louvre_Ma2283.jpg?width=240',
    caption: '헤라 — 캄파나 헤라 (Louvre Ma2283, 헬레니즘 원본의 로마 복제)',
    license: 'PD'
  },
  poseidon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bronze_statue_of_Zeus_or_Poseidon.jpg?width=240',
    caption: '포세이돈 — 아르테미시온 청동상 (NAMA Athens, 460 BC경 — Zeus 또는 Poseidon 으로 추정)',
    license: 'PD'
  },
  demeter: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Demeter_Altemps_Inv8596.jpg?width=240',
    caption: '데메테르 — 알템프스 데메테르 (Palazzo Altemps Inv8596)',
    license: 'PD'
  },
  athena: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mattei_Athena_Louvre_Ma530_n2.jpg?width=240',
    caption: '아테나 — 마테이 아테나 (Louvre Ma530, 4세기 BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  apollo: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Apollo_of_the_Belvedere.jpg?width=240',
    caption: '아폴론 — 벨베데레의 아폴론 (Vatican Museums, 2세기 AD 로마 복제)',
    license: 'PD'
  },
  artemis: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Diane_de_Versailles_Leochares.jpg?width=240',
    caption: '아르테미스 — 베르사유의 디아나 (Louvre Mr152, 4세기 BC 레오카레스 원본의 로마 복제)',
    license: 'PD'
  },
  ares: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ares_Borghese_Louvre_Ma_866_n01.jpg?width=240',
    caption: '아레스 — 보르게세의 아레스 (Louvre Ma 866, 5세기 BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  aphrodite: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venus_de_Milo_Louvre_Ma399_n4.jpg?width=240',
    caption: '아프로디테 — 밀로의 아프로디테 (Louvre Ma399, 130 BC경)',
    license: 'PD'
  },
  hephaestus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jouvenet_Forge_of_Vulcan.jpg?width=240',
    caption: '헤파이스토스 — 주브네의 대장간의 헤파이스토스 (Jean-Baptiste Jouvenet)',
    license: 'PD'
  },
  hermes: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hermes_di_Prassitele,_at_Olimpia,_front.jpg?width=240',
    caption: '헤르메스 — 프락시텔레스의 헤르메스 (Olympia, 340 BC경)',
    license: 'PD'
  },
  dionysus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dionysos_Louvre_Ma87_n2.jpg?width=240',
    caption: '디오니소스 — 디오뉘소스 흉상 (Louvre Ma87)',
    license: 'PD'
  },

  // ── 영웅 12명 (9 사진 + 3 SVG 폴백 — diomedes, orpheus, aeneas) ─────
  achilles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg?width=240',
    caption: '아킬레우스 — 파트로클로스를 치료하는 아킬레우스 (적색 도기, Berlin F2278)',
    license: 'PD'
  },
  heracles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Herakles_Farnese_MAN_Napoli_Inv6001_n01.jpg?width=240',
    caption: '헤라클레스 — 파르네세의 헤라클레스 (Naples MAN Inv6001, 3세기 AD 글뤼콘의 모각)',
    license: 'PD'
  },
  odysseus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Head_Odysseus_MAR_Sperlonga.jpg?width=240',
    caption: '오디세우스 — 스페르론가의 오뒷세우스 두상 (Sperlonga Museum, 1세기 BC)',
    license: 'PD'
  },
  theseus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Henry_Fuseli_-_Ariadne_Watching_the_Struggle_of_Theseus_with_the_Minotaur_-_Google_Art_Project.jpg?width=240',
    caption: '테세우스 — 아리아드네가 지켜보는 테세우스와 미노타우로스의 결투 (헨리 푸셀리)',
    license: 'PD'
  },
  perseus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Loggia_dei_Lanzi_-_Perseus_with_the_Head_of_Medusa_-_Florence_04_2024_0738.jpg?width=240',
    caption: '페르세우스 — 첼리니의 페르세우스와 메두사 (Loggia dei Lanzi, Florence)',
    license: 'PD'
  },
  jason: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jason_with_the_Golden_Fleece_by_Bertel_Thorvaldsen.jpg?width=240',
    caption: '이아손 — 황금 양털을 든 이아손 (토르발드센, Thorvaldsens Museum)',
    license: 'PD'
  },
  bellerophon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bellerophon_killing_Chimaera_(mosaic_from_Rhodes).jpg?width=240',
    caption: '벨레로폰 — 키마이라를 죽이는 벨레로폰 (로도스 모자이크)',
    license: 'PD'
  },
  hector: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Preller_Hektors_Abschied.jpg?width=240',
    caption: '헥토르 — 헥토르의 이별 (프리드리히 프렐러)',
    license: 'PD'
  },
  ajax: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Exekias_Suicide_d_Ajax_01.jpg?width=240',
    caption: '아이아스 — 엑세키아스의 아이아스의 자결 (Boulogne-sur-Mer, 530 BC경)',
    license: 'PD'
  },
  // diomedes, orpheus, aeneas — v55 신규 추가
  diomedes: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Diomedes_Louvre_Ma890_n2.jpg?width=240',
    caption: '디오메데스 — Louvre Ma 890 (Kresilas 의 5c BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  orpheus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Berlin-Pergamonmuseum-18-Orpheus-Mosaik-2016-gje.jpg?width=240',
    caption: '오르페우스 — 밀레토스의 오르페우스 모자이크 (Pergamon Museum, ~200 CE)',
    license: 'PD'
  },
  aeneas: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aeneas,_Anchises,_and_Ascanius_by_Bernini,_Galleria_Borghese_(44686152210).jpg?width=240',
    caption: '아이네이아스 — 베르니니의 아이네이아스, 안키세스, 아스카니오스 (Galleria Borghese, 1618-19)',
    license: 'PD'
  },

  // ── 여신·여성 영웅 8명 (전원 사진 · v55) ────────────────────────────
  helen: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Helene_Paris_Louvre_K6.jpg?width=240',
    caption: '헬레네 — 파리스와 헬레네 (적색 도기, Louvre K6)',
    license: 'PD'
  },
  penelope: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/JohnWilliamWaterhouse-PenelopeandtheSuitors(1912).jpg?width=240',
    caption: '페넬로페 — 페넬로페와 구혼자들 (J.W. Waterhouse, 1912, Aberdeen Art Gallery)',
    license: 'PD'
  },
  andromache: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jacques-Louis_David-_Andromache_Mourning_Hector.JPG?width=240',
    caption: '안드로마케 — 헥토르를 애도하는 안드로마케 (자크-루이 다비드, 1783)',
    license: 'PD'
  },
  cassandra: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cassandra1.jpeg?width=240',
    caption: '카산드라 — 에브린 드 모건의 카산드라 (1898)',
    license: 'PD'
  },
  antigone: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lytras_nikiforos_antigone_polynices.jpeg?width=240',
    caption: '안티고네 — 폴뤼네이케스의 시신 곁의 안티고네 (니키포로스 뤼트라스)',
    license: 'PD'
  },
  // atalanta, medea — v55 신규 추가
  atalanta: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Guido_Reni_-_Atalanta_and_Hippomenes_-_Google_Art_Project.jpg?width=240',
    caption: '아탈란테 — 귀도 레니의 아탈란테와 히포메네스 (Capodimonte Naples, 1620-25)',
    license: 'PD'
  },
  medea: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lille_PdBA_delacroix_medee.JPG?width=240',
    caption: '메데이아 — 들라크루아의 자식을 죽이려는 메데이아 (Palais des Beaux-Arts de Lille, 1838 원본)',
    license: 'PD'
  },
  hestia: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hestia_Giustiniani.jpg?width=240',
    caption: '헤스티아 — 주스티니아니의 헤스티아 (5세기 BC 원본의 로마 복제)',
    license: 'PD'
  },

  // ── 철학자 10명 (전원 사진 · v55) ─────────────────────────────────────
  socrates: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Socrates_Louvre.jpg?width=240',
    caption: '소크라테스 — 소크라테스 흉상 (Louvre, 4세기 BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  plato: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Plato_Silanion_Musei_Capitolini_MC1377.jpg?width=240',
    caption: '플라톤 — 실라니온의 플라톤 (Musei Capitolini MC1377, 4세기 BC 원본의 로마 복제)',
    license: 'PD'
  },
  aristotle: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aristotle_Altemps_Inv8575.jpg?width=240',
    caption: '아리스토텔레스 — 알템프스의 아리스토텔레스 (Palazzo Altemps Inv8575)',
    license: 'PD'
  },
  pythagoras: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kapitolinischer_Pythagoras_adjusted.jpg?width=240',
    caption: '피타고라스 — 카피톨리누스의 피타고라스 (Musei Capitolini)',
    license: 'PD'
  },
  heraclitus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Utrecht_Moreelse_Heraclite.JPG?width=240',
    caption: '헤라클레이토스 — 모렐서의 헤라클레이토스 (1630, Centraal Museum)',
    license: 'PD'
  },
  diogenes: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Léon_Gérôme_-_Diogenes_-_Walters_37131.jpg?width=240',
    caption: '디오게네스 — 제롬의 디오게네스 (Walters Art Museum)',
    license: 'PD'
  },
  epicurus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Epicurus_bust2.jpg?width=240',
    caption: '에피쿠로스 — 에피쿠로스 흉상 (대영박물관, 3세기 BC 원본의 로마 복제)',
    license: 'PD'
  },
  empedocles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Death_of_Empedocles_by_Salvator_Rosa.jpg?width=240',
    caption: '엠페도클레스 — 살바토르 로사의 엠페도클레스의 죽음 (17세기, 에트나 화산 투신 전설)',
    license: 'PD'
  },
  thales: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Illustrerad_Verldshistoria_band_I_Ill_107.jpg?width=240',
    caption: '탈레스 — 19세기 백과사전의 탈레스',
    license: 'PD'
  },
  anaximander: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anaximander_Mosaic.jpg?width=240',
    caption: '아낙시만드로스 — 모자이크 (Trier, 3세기 AD)',
    license: 'PD'
  },

  // ── 시인·역사가·정치가 8명 (전원 사진 · v55) ───────────────────────
  homer: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Homer_British_Museum.jpg?width=240',
    caption: '호메로스 — 호메로스 흉상 (대영박물관, 헬레니즘 원본의 로마 복제)',
    license: 'PD'
  },
  hesiod: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pseudo-Seneca_BM_GR1962.8-24.1.jpg?width=240',
    caption: '헤시오도스 — 의(擬)세네카 흉상 (대영박물관, 헬레니즘 원본의 로마 복제)',
    license: 'PD'
  },
  sappho: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Herkulaneischer_Meister_002.jpg?width=240',
    caption: '사포 — 폼페이의 사포 프레스코 (Naples MAN, 1세기 AD)',
    license: 'PD'
  },
  pindar: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pindar_Musei_Capitolini_MC586.jpg?width=240',
    caption: '핀다로스 — 카피톨리니의 핀다로스 흉상 (MC586)',
    license: 'PD'
  },
  herodotus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Marble_bust_of_Herodotos_MET_DT11742_(cropped).jpg?width=240',
    caption: '헤로도토스 — MET 의 헤로도토스 흉상 (2세기 AD, 4세기 BC 그리스 청동상의 로마 복제)',
    license: 'PD'
  },
  thucydides: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Thucydides_pushkin02.jpg?width=240',
    caption: '투키디데스 — 헤르마 흉상 (Pushkin Museum, 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  pericles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Perikles_altes_Museum.jpg?width=240',
    caption: '페리클레스 — 페리클레스 흉상 (Altes Museum Berlin, 크레실라스 원본의 로마 복제)',
    license: 'PD'
  },
  solon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Solon_in_Vatican_Museums.JPG?width=240',
    caption: '솔론 — Vatican Museums 의 솔론 흉상 (그리스 원본의 로마 복제, c.1 BCE)',
    license: 'PD'
  },

};

// 전역 노출 — index.html 의 IIFE 가 캡처
if (typeof window !== 'undefined') {
  window.CHARACTER_IMAGES = CHARACTER_IMAGES;
}
