/* data-characters.js — v53
 * ============================================================================
 * 50 캐릭터의 사진 (Wikimedia Commons URL). v53 신규.
 *
 * 출처: Wikimedia Commons (모든 이미지는 public domain — 고대 유물 또는
 *   복제권 만료). URL 형식: Special:FilePath (해시 계산 없이 작동).
 *
 * 구조:
 *   CHARACTER_IMAGES[id] = {url, caption, license}
 *     - url: 직접 이미지 URL (브라우저가 Special:FilePath 리다이렉트 따라감)
 *     - caption: 작품/출처 짧은 설명
 *     - license: "PD" (public domain) — 고대 유물 사진은 미국 법상 PD,
 *       Wikimedia 공동체 표준에 따라
 *
 * 로드 실패 시 _charMedallion 의 SVG 폴백이 자동 표시됨.
 * 사진 자체는 SW (paideia-img-v52 캐시) 가 1회 다운로드 후 오프라인 보존.
 *
 * 표시 위치 (v53): renderCharacterPicker 의 96px 카드, renderProfiles 의 80px
 *   "내 캐릭터" 카드, renderHall 의 88px 명예의 전당 카드. 작은 메달리온
 *   (32/44px) 은 SVG 만 사용 (사진은 가독성 떨어짐).
 * ============================================================================ */

const CHARACTER_IMAGES = {

  // ── 올림포스 신 12명 ────────────────────────────────────────────────
  zeus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bust_Zeus_Otricoli_Pio-Clementino_Inv257.jpg?width=240',
    caption: '제우스 — 오트리콜리 흉상 (Vatican Museums, 4세기 BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  hera: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hera_Campana_Louvre_Ma2283.jpg?width=240',
    caption: '헤라 — 캄파나 헤라 (Louvre Ma2283, 헬레니즘 원본의 로마 복제)',
    license: 'PD'
  },
  poseidon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/0036MAN-Poseidon.jpg?width=240',
    caption: '포세이돈 — 아르테미시온 청동상 (NAMA Athens, 460 BC경)',
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
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ares_Borghese_Louvre_Ma866.jpg?width=240',
    caption: '아레스 — 보르게세의 아레스 (Louvre Ma866, 5세기 BC 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  aphrodite: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venus_de_Milo_Louvre_Ma399_n4.jpg?width=240',
    caption: '아프로디테 — 밀로의 아프로디테 (Louvre Ma399, 130 BC경)',
    license: 'PD'
  },
  hephaestus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hephaistos_Vulcan_at_forge.jpg?width=240',
    caption: '헤파이스토스 — 대장간의 헤파이스토스 (도기 그림)',
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

  // ── 영웅 12명 ───────────────────────────────────────────────────────
  achilles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Akhilleus_Patroklos_Antikensammlung_Berlin_F2278.jpg?width=240',
    caption: '아킬레우스 — 파트로클로스를 치료하는 아킬레우스 (적색 도기, Berlin F2278)',
    license: 'PD'
  },
  heracles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hercules_Farnese_3637104088_9c95d7fce3_b.jpg?width=240',
    caption: '헤라클레스 — 파르네세의 헤라클레스 (Naples MAN, 3세기 AD 글뤼콘의 모각)',
    license: 'PD'
  },
  odysseus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Head_Odysseus_MAR_Sperlonga.jpg?width=240',
    caption: '오디세우스 — 스페르론가의 오뒷세우스 두상 (Sperlonga Museum, 1세기 BC)',
    license: 'PD'
  },
  theseus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Theseus_Minotaur_BM_Vase_E84.jpg?width=240',
    caption: '테세우스 — 미노타우로스를 죽이는 테세우스 (British Museum E84)',
    license: 'PD'
  },
  perseus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Perseus_Cellini_Loggia.jpg?width=240',
    caption: '페르세우스 — 첼리니의 페르세우스와 메두사 (Loggia dei Lanzi, Florence)',
    license: 'PD'
  },
  jason: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jason_-_Bertel_Thorvaldsen.jpg?width=240',
    caption: '이아손 — 토르발드센의 이아손 (Thorvaldsens Museum, 1803)',
    license: 'PD'
  },
  bellerophon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bellerophon_Pegasus_Chimera_mosaic.jpg?width=240',
    caption: '벨레로폰 — 페가소스와 키마이라 (모자이크)',
    license: 'PD'
  },
  hector: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hector_brought_back_to_Troy_Cdm_Paris_355.jpg?width=240',
    caption: '헥토르 — 트로이로 옮겨지는 헥토르 (Cabinet des Médailles 355)',
    license: 'PD'
  },
  ajax: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Exekias_Suicide_d_Ajax_05.jpg?width=240',
    caption: '아이아스 — 엑세키아스의 아이아스의 자결 (Boulogne-sur-Mer 558)',
    license: 'PD'
  },
  diomedes: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Diomedes_Glyptothek_Munich_304.jpg?width=240',
    caption: '디오메데스 — 글뤼프토테크의 디오메데스 (Munich 304, 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  orpheus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Orpheus_Mosaic.jpg?width=240',
    caption: '오르페우스 — 동물을 매혹하는 오르페우스 모자이크',
    license: 'PD'
  },
  aeneas: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aeneas_flees_burning_Troy_by_Federico_Barocci.jpg?width=240',
    caption: '아이네이아스 — 트로이를 떠나는 아이네이아스 (바로치, Galleria Borghese)',
    license: 'PD'
  },

  // ── 여신·여성 영웅 8명 ──────────────────────────────────────────────
  helen: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Helene_Paris_Louvre_K6.jpg?width=240',
    caption: '헬레네 — 파리스와 헬레네 (적색 도기, Louvre K6)',
    license: 'PD'
  },
  penelope: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pénélope_Stuck_Louvre_RF2782.jpg?width=240',
    caption: '페넬로페 — 슬퍼하는 페넬로페 (Vatican Museums, 5세기 BC 원본의 로마 복제)',
    license: 'PD'
  },
  andromache: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Andromache_David.jpg?width=240',
    caption: '안드로마케 — 자크-루이 다비드의 안드로마케 (Louvre)',
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
  atalanta: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atalanta_Lansdowne.jpg?width=240',
    caption: '아탈란테 — 랜스다운의 아탈란테 (대영박물관)',
    license: 'PD'
  },
  medea: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Medea_meditating_Eugene_Delacroix.jpg?width=240',
    caption: '메데이아 — 메데이아의 분노 (들라크루아, Louvre)',
    license: 'PD'
  },
  hestia: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hestia_Giustiniani_Torlonia.jpg?width=240',
    caption: '헤스티아 — 주스티니아니의 헤스티아 (Torlonia Museum, 5세기 BC 원본의 로마 복제)',
    license: 'PD'
  },

  // ── 철학자 10명 ─────────────────────────────────────────────────────
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
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Empédocle.jpg?width=240',
    caption: '엠페도클레스 — 19세기 판화에 의한 상상 초상',
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

  // ── 시인·역사가·정치가 8명 ──────────────────────────────────────────
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
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sappho_fresco_Pompeii.jpg?width=240',
    caption: '사포 — 폼페이의 사포 프레스코 (Naples MAN, 1세기 AD)',
    license: 'PD'
  },
  pindar: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pindar_Musei_Capitolini_MC586.jpg?width=240',
    caption: '핀다로스 — 카피톨리니의 핀다로스 흉상 (MC586)',
    license: 'PD'
  },
  herodotus: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Herodot_Met_91.8.jpg?width=240',
    caption: '헤로도토스 — 메트로폴리탄의 헤로도토스 두상 (Met 91.8, 4세기 BC 원본의 로마 복제)',
    license: 'PD'
  },
  thucydides: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Thucydides_pushkin02.jpg?width=240',
    caption: '투키디데스 — 헤르마 흉상 (Pushkin Museum, 그리스 원본의 로마 복제)',
    license: 'PD'
  },
  pericles: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Perikles_altes_Museum.jpg?width=240',
    caption: '페리클레스 — 페리클레스 흉상 (Altes Museum Berlin, 크레실라스의 원본의 로마 복제)',
    license: 'PD'
  },
  solon: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Solon_lawgiver_of_Athens.jpg?width=240',
    caption: '솔론 — 솔론의 19세기 판화',
    license: 'PD'
  },

};

// 전역 노출 — index.html 의 IIFE 가 캡처
if (typeof window !== 'undefined') {
  window.CHARACTER_IMAGES = CHARACTER_IMAGES;
}
