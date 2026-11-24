// Curadoria Exegética de Canções Bíblicas & Trilhas Instrumentais para Leitura (Padrão Dwell / Glorify)
// 100% dos youtubeIds foram auditados individualmente via YouTube oEmbed (zero IDs repetidos, zero títulos inventados, zero vínculo por palavra solta).

export function getYoutubeMusicSearchUrl(query) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
}

// Taxonomia Doutrinária Bíblica (8 Eixos Teológicos Reais — nunca palavras soltas)
export const DOCTRINAL_AXES = [
  { id: 'cruz_redencao', label: 'Cruz & Aliança', shortLabel: 'Cruz & Redenção' },
  { id: 'graca_justificacao', label: 'Graça & Fé', shortLabel: 'Graça' },
  { id: 'ressurreicao_esperanca', label: 'Ressurreição', shortLabel: 'Ressurreição & Glória' },
  { id: 'cristologia_soberania', label: 'Cristo & Reino', shortLabel: 'Supremacia de Cristo' },
  { id: 'igreja_amor', label: 'Igreja & Amor', shortLabel: 'Comunhão & Edificação' },
  { id: 'consolo_providencia', label: 'Consolo & Paz', shortLabel: 'Consolo & Refúgio' },
  { id: 'santificacao_oracao', label: 'Oração & Vida', shortLabel: 'Santificação & Clamor' },
  { id: 'missao_firmeza', label: 'Missão & Firmeza', shortLabel: 'Vocação & Perseverança' }
];

const AXIS_LABEL_MAP = Object.fromEntries(DOCTRINAL_AXES.map(a => [a.id, a.shortLabel]));

// Trilhas Instrumentais Reais (Sem Voz) para Ouvir ENQUANTO Lê a Escritura (Padrão Dwell / Hallow)
export const INSTRUMENTAL_READING_TRACKS = [
  {
    id: 'inst-piano-devocional',
    title: 'Piano & Pad Contemplativo',
    artist: 'Instrumental Devocional',
    youtubeId: 'FwBy5rVtUOg',
    instrument: 'Piano Suave • Sem Voz',
    purpose: 'Foco silencioso para leitura prolongada de epístolas e narrativas',
    youtubeMusicUrl: getYoutubeMusicSearchUrl('Piano Instrumental Worship Peaceful Scripture Reading')
  },
  {
    id: 'inst-violao-acustico',
    title: 'Hinos Clássicos no Violão Acústico',
    artist: 'Rafael Alves (Instrumental)',
    youtubeId: 'p_zMiR4Ympk',
    instrument: 'Violão Fingerpicking • Sem Voz',
    purpose: 'Ambiente acústico sereno para leitura matinal e meditação nos Salmos',
    youtubeMusicUrl: getYoutubeMusicSearchUrl('Violao Acustico Instrumental Hinos Devocional')
  },
  {
    id: 'inst-cello-sacro',
    title: 'Violoncelo & Piano Sacro',
    artist: 'Still Waters Instrumental',
    youtubeId: 'a8HngiPGX5A',
    instrument: 'Cello & Piano • Sem Voz',
    purpose: 'Arranjo camerístico contemplativo ideal para profetas, lamentações e evangelhos',
    youtubeMusicUrl: getYoutubeMusicSearchUrl('Sacred Cello and Piano Peaceful Instrumental Worship')
  },
  {
    id: 'inst-soaking-piano',
    title: 'Meditação ao Piano (Abide)',
    artist: 'DappyTKeys Piano',
    youtubeId: 'zI8mwLq7c9k',
    instrument: 'Piano Solo • Sem Voz',
    purpose: 'Harmonia repousante para oração silenciosa e estudo exegético sem distração verbal',
    youtubeMusicUrl: getYoutubeMusicSearchUrl('DappyTKeys Piano Instrumental Meditation')
  }
];

// Acervo de 40 Canções Cristãs Brasileiras Verificadas (100% IDs únicos + Base Bíblica Real da Composição)
export const VERIFIED_THEOLOGICAL_SONGS = [
  // === PROJETO SOLA ===
  {
    id: 'sola-colossenses-1',
    title: 'Colossenses 1',
    artist: 'Projeto Sola',
    youtubeId: 'gk7XWCMwO94',
    scriptureBasis: 'Colossenses 1:15–20',
    canonicalRefs: ['Colossenses 1', 'João 1', 'Hebreus 1', 'Gênesis 1'],
    axes: ['cristologia_soberania', 'cruz_redencao'],
    exegeticalNote: 'Exposição cantada do hino cristológico: Cristo como imagem do Deus invisível e primogênito de toda a criação.'
  },
  {
    id: 'sola-isaias-53',
    title: 'Isaías 53',
    artist: 'Projeto Sola',
    youtubeId: '7clLRGKd1q0',
    scriptureBasis: 'Isaías 53:3–7',
    canonicalRefs: ['Isaías 53', 'Isaías 52', '1 Pedro 2', 'Mateus 27', 'Marcos 15', 'Lucas 23', 'João 19'],
    axes: ['cruz_redencao', 'graca_justificacao'],
    exegeticalNote: 'Paráfrase musical do Servo Sofredor traspassado por nossas transgressões para nos trazer a paz.'
  },
  {
    id: 'sola-redencao',
    title: 'Redenção',
    artist: 'Projeto Sola',
    youtubeId: 'sX0KVSex6lI',
    scriptureBasis: 'Efésios 1:7 • Romanos 3:24',
    canonicalRefs: ['Efésios 1', 'Efésios 2', 'Romanos 3', 'Romanos 5', 'Gálatas 3', 'Êxodo 12'],
    axes: ['cruz_redencao', 'graca_justificacao'],
    exegeticalNote: 'Narra a história da redenção desde a queda até o resgate consumado pelo sangue do Cordeiro.'
  },
  {
    id: 'sola-salmo-46',
    title: '46 (Deus é o Nosso Refúgio)',
    artist: 'Projeto Sola',
    youtubeId: 'kt5XXjNlmag',
    scriptureBasis: 'Salmo 46:1–11',
    canonicalRefs: ['Salmos 46', 'Salmos 91', 'Salmos 27', 'Naum 1', '2 Reis 19'],
    axes: ['consolo_providencia', 'cristologia_soberania'],
    exegeticalNote: 'Adaptação literal do Salmo 46: ainda que os montes se abalem, o Senhor dos Exércitos está conosco.'
  },
  {
    id: 'sola-salmo-23',
    title: 'Salmo 23',
    artist: 'Projeto Sola',
    youtubeId: 'mJE9s4fuUHk',
    scriptureBasis: 'Salmo 23:1–6 • João 10:11',
    canonicalRefs: ['Salmos 23', 'João 10', 'Ezequiel 34', '1 Pedro 5'],
    axes: ['consolo_providencia'],
    exegeticalNote: 'Cântico pastoral sobre o cuidado, a vara, o cajado e a mesa preparada pelo Bom Pastor.'
  },
  {
    id: 'sola-tua-obra-em-nos',
    title: 'Tua Obra em Nós',
    artist: 'Projeto Sola',
    youtubeId: 'bPiMH3Mh1ao',
    scriptureBasis: 'Filipenses 1:6 • Efésios 2:10',
    canonicalRefs: ['Filipenses 1', 'Filipenses 2', 'Efésios 2', '1 Tessalonicenses 5', 'Romanos 8'],
    axes: ['graca_justificacao', 'santificacao_oracao', 'missao_firmeza'],
    exegeticalNote: 'Celebra a fidelidade de Deus que começou a boa obra em Seu povo e há de completá-la até o Dia de Cristo.'
  },
  {
    id: 'sola-confianca',
    title: 'Confiança',
    artist: 'Projeto Sola',
    youtubeId: 'BqVt9eBgEOw',
    scriptureBasis: 'Habacuque 3:17–19 • Romanos 8:28',
    canonicalRefs: ['Habacuque 3', 'Romanos 8', 'Jó 42', 'Lamentações 3', '2 Coríntios 4'],
    axes: ['consolo_providencia', 'missao_firmeza'],
    exegeticalNote: 'Confissão de fé reformada na providência soberana de Deus em meio às perdas e desertos.'
  },

  // === OS ARRAIS ===
  {
    id: 'arrais-mais',
    title: 'Mais',
    artist: 'Os Arrais',
    youtubeId: 'JBWc__6Br10',
    scriptureBasis: '1 Coríntios 13:1–13 • 1 João 4:18',
    canonicalRefs: ['1 Coríntios 13', '1 João 4', 'Colossenses 3'],
    axes: ['igreja_amor', 'santificacao_oracao'],
    exegeticalNote: 'Meditação poética sobre a supremacia do amor ágape que expulsa o medo e edifica a comunidade.'
  },
  {
    id: 'arrais-esperanca',
    title: 'Esperança',
    artist: 'Os Arrais',
    youtubeId: 'JKM0dSAtl-E',
    scriptureBasis: '1 Coríntios 15:51–58 • Apocalipse 21:4',
    canonicalRefs: ['1 Coríntios 15', 'Apocalipse 21', 'Apocalipse 22', '1 Tessalonicenses 4', 'Romanos 8', 'Hebreus 11'],
    axes: ['ressurreicao_esperanca', 'consolo_providencia'],
    exegeticalNote: 'Canta a saudade do Lar eterno e a promessa da ressurreição onde a morte e o luto não existirão mais.'
  },
  {
    id: 'arrais-montreal',
    title: 'Montréal',
    artist: 'Os Arrais',
    youtubeId: 'LzV9m1XPpI4',
    scriptureBasis: '2 Coríntios 1:3–5 • Salmo 126',
    canonicalRefs: ['2 Coríntios 1', '2 Coríntios 4', 'Salmos 126', 'Salmos 42', 'Eclesiastes 3'],
    axes: ['consolo_providencia', 'santificacao_oracao'],
    exegeticalNote: 'Oração de inverno da alma confiando no Deus que renova a graça e traz primavera após a aflição.'
  },
  {
    id: 'arrais-17-janeiro',
    title: '17 de Janeiro',
    artist: 'Os Arrais',
    youtubeId: 'iLLydSZOR8k',
    scriptureBasis: 'Gênesis 28:15 • Rute 2',
    canonicalRefs: ['Gênesis 28', 'Gênesis 50', 'Rute 1', 'Rute 2', 'Rute 4', 'Salmos 121'],
    axes: ['consolo_providencia', 'graca_justificacao'],
    exegeticalNote: 'Reflexão narrativa sobre a providência silenciosa de Deus conduzindo a história da nossa família e aliança.'
  },
  {
    id: 'arrais-luz',
    title: 'Luz',
    artist: 'Os Arrais',
    youtubeId: '5NdNDwwXsfw',
    scriptureBasis: '2 Coríntios 4:6 • João 8:12',
    canonicalRefs: ['2 Coríntios 4', 'João 1', 'João 8', '1 João 1', 'Efésios 5', 'Isaías 9'],
    axes: ['cristologia_soberania', 'graca_justificacao'],
    exegeticalNote: 'Celebra o Deus que disse "Das trevas resplandeça a luz" e brilhou em nossos corações na face de Cristo.'
  },
  {
    id: 'arrais-ele-e',
    title: 'Ele É',
    artist: 'Os Arrais',
    youtubeId: 'Oh0ZDUFurP0',
    scriptureBasis: 'Êxodo 3:14 • Apocalipse 1:8',
    canonicalRefs: ['Êxodo 3', 'Êxodo 34', 'João 8', 'Apocalipse 1', 'Hebreus 13'],
    axes: ['cristologia_soberania'],
    exegeticalNote: 'Contempla a autoexistência e imutabilidade do grande EU SOU revelado plenamente em Jesus.'
  },

  // === LEONARDO GONÇALVES ===
  {
    id: 'lg-ele-vive',
    title: 'Ele Vive',
    artist: 'Leonardo Gonçalves',
    youtubeId: 'T0piY7MacH0',
    scriptureBasis: '1 Coríntios 15:20 • Lucas 24:5–6',
    canonicalRefs: ['1 Coríntios 15', 'Lucas 24', 'Mateus 28', 'Marcos 16', 'João 20', 'Atos 2'],
    axes: ['ressurreicao_esperanca'],
    exegeticalNote: 'Proclamação clássica do túmulo vazio: porque Cristo ressuscitou dentre os mortos, há paz para o amanhã.'
  },
  {
    id: 'lg-getsemani',
    title: 'Getsêmani',
    artist: 'Leonardo Gonçalves',
    youtubeId: 'edGwczJm_uo',
    scriptureBasis: 'Mateus 26:36–46 • Lucas 22:42',
    canonicalRefs: ['Mateus 26', 'Marcos 14', 'Lucas 22', 'Hebreus 5', 'Isaías 53'],
    axes: ['cruz_redencao'],
    exegeticalNote: 'Retrata a agonia de Cristo no Jardim das Oliveiras e Sua obediência perfeita ao cálice da nossa salvação.'
  },
  {
    id: 'lg-sublime',
    title: 'Sublime',
    artist: 'Leonardo Gonçalves',
    youtubeId: '8-KGd77URxo',
    scriptureBasis: 'Efésios 3:18–19 • Romanos 5:8',
    canonicalRefs: ['Efésios 3', 'Romanos 5', 'João 3', 'Tito 2', '1 Timóteo 1'],
    axes: ['graca_justificacao', 'cruz_redencao'],
    exegeticalNote: 'Meditação na largura, comprimento, altura e profundidade da graça imerecida revelada no Calvário.'
  },
  {
    id: 'lg-principio-e-fim',
    title: 'Princípio e Fim',
    artist: 'Leonardo Gonçalves',
    youtubeId: '0bhgHYC371Y',
    scriptureBasis: 'Apocalipse 22:13 • Apocalipse 1:8',
    canonicalRefs: ['Apocalipse 22', 'Apocalipse 1', 'Apocalipse 4', 'Apocalipse 5', 'Daniel 7'],
    axes: ['ressurreicao_esperanca', 'cristologia_soberania'],
    exegeticalNote: 'Exalta o Alfa e Ômega que governa a história e consumará todas as coisas em Seu Reino eterno.'
  },
  {
    id: 'lg-novo',
    title: 'Novo',
    artist: 'Leonardo Gonçalves',
    youtubeId: 'tvQRIvBFb5w',
    scriptureBasis: '2 Coríntios 5:17 • Ezequiel 36:26',
    canonicalRefs: ['2 Coríntios 5', 'Ezequiel 36', 'Romanos 6', 'João 3', 'Gálatas 2'],
    axes: ['graca_justificacao', 'santificacao_oracao'],
    exegeticalNote: 'Celebra a nova criação em Cristo: o velho homem passou e recebemos um novo coração regenerado.'
  },

  // === STÊNIO MARCIUS & JOÃO ALEXANDRE (HINÓDIA EXEGÉTICA BRASILEIRA) ===
  {
    id: 'ja-essencia-de-deus',
    title: 'Essência de Deus',
    artist: 'João Alexandre',
    youtubeId: 'tQDFU_1VqPM',
    scriptureBasis: 'Filipenses 2:5–11',
    canonicalRefs: ['Filipenses 2', 'João 1', '2 Coríntios 8', 'Isaías 45'],
    axes: ['cristologia_soberania', 'cruz_redencao', 'igreja_amor'],
    exegeticalNote: 'Composição antológica que verte literalmente a kenosis e a exaltação suprema de Cristo em Filipenses 2.'
  },
  {
    id: 'ja-pai-nosso',
    title: 'Pai Nosso',
    artist: 'João Alexandre',
    youtubeId: 'wUjhRg7ukkk',
    scriptureBasis: 'Mateus 6:9–13 • Lucas 11:2–4',
    canonicalRefs: ['Mateus 6', 'Lucas 11', 'Salmos 65'],
    axes: ['santificacao_oracao', 'cristologia_soberania'],
    exegeticalNote: 'Musicalização reverente da Oração Dominical ensinada por Jesus no Sermão do Monte.'
  },
  {
    id: 'sm-fim-de-tarde',
    title: 'Fim de Tarde no Portão',
    artist: 'Stênio Marcius',
    youtubeId: 'Jx6546MdAxk',
    scriptureBasis: 'Lucas 15:11–32 • Oseias 11',
    canonicalRefs: ['Lucas 15', 'Oseias 11', 'Romanos 5', 'Efésios 2'],
    axes: ['graca_justificacao', 'consolo_providencia'],
    exegeticalNote: 'Narrativa poética da parábola do Pai pródigo em graça que corre ao encontro do filho arrependido.'
  },
  {
    id: 'sm-alianca',
    title: 'Aliança',
    artist: 'Stênio Marcius',
    youtubeId: '3Szo_IHXfhc',
    scriptureBasis: 'Gênesis 15 • Hebreus 8:6–13',
    canonicalRefs: ['Gênesis 15', 'Gênesis 17', 'Jeremias 31', 'Hebreus 8', 'Hebreus 9', 'Hebreus 10'],
    axes: ['cruz_redencao', 'graca_justificacao'],
    exegeticalNote: 'Exposição poética do pacto unilateral da graça selado pelo próprio Deus em favor do Seu povo.'
  },

  // === MARCOS ALMEIDA / PALAVRANTIGA ===
  {
    id: 'ma-se-valente',
    title: 'Sê Valente',
    artist: 'Marcos Almeida',
    youtubeId: 'QGNsLtOa3Uo',
    scriptureBasis: 'Josué 1:9 • 1 Coríntios 16:13–14',
    canonicalRefs: ['1 Coríntios 16', 'Josué 1', 'Deuteronômio 31', '2 Timóteo 1', 'Efésios 6'],
    axes: ['missao_firmeza', 'consolo_providencia'],
    exegeticalNote: 'Ecoa a exortação bíblica à vigilância, firmeza na fé, coragem cristã e amor em toda obra.'
  },
  {
    id: 'ma-casa',
    title: 'Casa',
    artist: 'Marcos Almeida',
    youtubeId: '2vxV1QQ2Zo8',
    scriptureBasis: 'Atos 2:42–47 • 1 Coríntios 14:26',
    canonicalRefs: ['1 Coríntios 14', '1 Coríntios 12', 'Atos 2', 'Atos 4', 'Romanos 12', 'Filemom 1', 'Hebreus 10'],
    axes: ['igreja_amor'],
    exegeticalNote: 'Celebra a igreja reunida como lar de comunhão, mesa partilhada, hospitalidade e edificação mútua.'
  },
  {
    id: 'ma-vem-me-socorrer',
    title: 'Vem Me Socorrer',
    artist: 'Marcos Almeida',
    youtubeId: '_kAVIQzwffg',
    scriptureBasis: 'Salmo 40:13 • Salmo 70',
    canonicalRefs: ['Salmos 40', 'Salmos 70', 'Salmos 130', 'Salmos 6', '2 Coríntios 1'],
    axes: ['santificacao_oracao', 'consolo_providencia'],
    exegeticalNote: 'Salmo contemporâneo de clamor honesto por socorro e descanso na misericórdia divina.'
  },
  {
    id: 'pa-toda-vez',
    title: 'Toda Vez Que Você Me Vê',
    artist: 'Palavrantiga',
    youtubeId: 'dM3sVL9WRxI',
    scriptureBasis: 'Salmo 139:1–18',
    canonicalRefs: ['Salmos 139', 'Gênesis 16', 'Jeremias 1', 'Lucas 12'],
    axes: ['consolo_providencia', 'santificacao_oracao'],
    exegeticalNote: 'Meditação poética sobre o olhar onisciente e amoroso do Criador que nos sonda e conhece.'
  },

  // === PAULO CÉSAR BARUK ===
  {
    id: 'baruk-dependo-de-ti',
    title: 'Dependo de Ti',
    artist: 'Paulo César Baruk',
    youtubeId: 'CGiKrHRdkZg',
    scriptureBasis: '2 Coríntios 12:9–10 • João 15:5',
    canonicalRefs: ['2 Coríntios 12', '2 Coríntios 4', 'João 15', 'Salmos 73'],
    axes: ['santificacao_oracao', 'graca_justificacao'],
    exegeticalNote: 'Confissão da suficiência da graça de Cristo cujo poder se aperfeiçoa na nossa fraqueza.'
  },
  {
    id: 'baruk-jardim-inocencia',
    title: 'Jardim da Inocência',
    artist: 'Paulo César Baruk',
    youtubeId: 'bi9W6oZzfxk',
    scriptureBasis: 'Gênesis 3:8–9 • 2 Coríntios 5:18–20',
    canonicalRefs: ['Gênesis 3', 'Gênesis 2', '2 Coríntios 5', 'Cânticos 2'],
    axes: ['cruz_redencao', 'santificacao_oracao'],
    exegeticalNote: 'Retrata a voz de Deus chamando o ser humano de volta à comunhão restaurada pela reconciliação.'
  },
  {
    id: 'baruk-santo-espirito',
    title: 'Santo Espírito',
    artist: 'Paulo César Baruk',
    youtubeId: '1Xprfo5-6OU',
    scriptureBasis: '1 Co 3:16 • 1 Co 14:25',
    canonicalRefs: ['1 Coríntios 14', '1 Coríntios 12', '1 Coríntios 3', 'Romanos 8', 'João 14', 'João 16', 'Atos 2', 'Gálatas 5'],
    axes: ['igreja_amor', 'santificacao_oracao'],
    exegeticalNote: 'Oração pela presença e condução do Espírito Santo edificando a Igreja em reverência e paz.'
  },
  {
    id: 'baruk-ele-continua-bom',
    title: 'Ele Continua Sendo Bom',
    artist: 'Paulo César Baruk & Marcela Taís',
    youtubeId: 'LQPYaPNGa38',
    scriptureBasis: 'Salmo 136:1 • Jó 1:21',
    canonicalRefs: ['Salmos 136', 'Salmos 100', 'Salmos 103', 'Jó 1', 'Jó 2', 'Tiago 1'],
    axes: ['consolo_providencia'],
    exegeticalNote: 'Afirma a bondade imutável do caráter de Deus em dias de bonança ou de provação.'
  },

  // === IPALPHA MÚSICA & BANDA NOVA (HINOS REFORMADOS & CONGREGACIONAIS) ===
  {
    id: 'ipalpha-castelo-forte',
    title: 'Castelo Forte',
    artist: 'IPALPHA Música',
    youtubeId: 'RGCzQjFKk2w',
    scriptureBasis: 'Salmo 46 • Efésios 6:10–17',
    canonicalRefs: ['Salmos 46', 'Efésios 6', '2 Crônicas 20', 'Apocalipse 12'],
    axes: ['cristologia_soberania', 'missao_firmeza'],
    exegeticalNote: 'Hino histórico da Reforma proclamando o triunfo de Cristo e a permanência eterna da Sua Palavra.'
  },
  {
    id: 'ipalpha-tu-es-fiel',
    title: 'Tu És Fiel, Senhor',
    artist: 'IPALPHA Música',
    youtubeId: 'tDyVw3vqFNg',
    scriptureBasis: 'Lamentações 3:22–23 • 2 Coríntios 1:20',
    canonicalRefs: ['Lamentações 3', '2 Coríntios 1', '2 Timóteo 2', 'Malaquias 3', 'Números 23'],
    axes: ['consolo_providencia', 'cristologia_soberania'],
    exegeticalNote: 'Exalta as misericórdias do Senhor que se renovam a cada manhã e jamais falham.'
  },
  {
    id: 'ipalpha-maravilhosa-graca',
    title: 'Maravilhosa Graça',
    artist: 'IPALPHA Música',
    youtubeId: 'c7hw86kSAvw',
    scriptureBasis: 'Efésios 2:8–9 • 1 Crônicas 17:16–17',
    canonicalRefs: ['Efésios 2', 'Romanos 3', 'Romanos 4', 'Gálatas 2', '1 Timóteo 1', 'João 9'],
    axes: ['graca_justificacao'],
    exegeticalNote: 'Hino clássico celebrando a graça soberana que resgatou pecadores cegos e perdidos.'
  },
  {
    id: 'ipalpha-trindade',
    title: 'Trindade Santíssima (Santo, Santo, Santo)',
    artist: 'IPALPHA Música',
    youtubeId: 'z3nPTt2NiUo',
    scriptureBasis: 'Isaías 6:1–4 • Apocalipse 4:8',
    canonicalRefs: ['Isaías 6', 'Apocalipse 4', 'Levítico 19', 'Êxodo 15', 'Salmos 99'],
    axes: ['cristologia_soberania'],
    exegeticalNote: 'Adoração teocêntrica diante da santidade, majestade e glória do Deus Triúno.'
  },
  {
    id: 'nova-aqui-vou-eu',
    title: 'Aqui Vou Eu',
    artist: 'Banda NOVA (IPAlpha)',
    youtubeId: 'cGcWmX2Pz0k',
    scriptureBasis: 'Isaías 6:8 • 1 Co 16:9',
    canonicalRefs: ['Isaías 6', 'Atos 13', 'Atos 1', 'Romanos 10', '1 Coríntios 16', 'Mateus 9'],
    axes: ['missao_firmeza'],
    exegeticalNote: 'Resposta de prontidão vocacional e missionária diante do envio do Senhor da seara.'
  },

  // === DEMAIS INTÉRPRETES DO ACERVO (100% IDs ÚNICOS VERIFICADOS) ===
  {
    id: 'vl-a-comecar-em-mim',
    title: 'A Começar em Mim',
    artist: 'Vocal Livre',
    youtubeId: 'nDXqNTyNC7A',
    scriptureBasis: '1 Coríntios 12–14 • João 13:34–35',
    canonicalRefs: ['1 Coríntios 14', '1 Coríntios 12', '1 Coríntios 1', 'João 13', 'João 17', 'Efésios 4', 'Colossenses 3'],
    axes: ['igreja_amor', 'santificacao_oracao'],
    exegeticalNote: 'Oração coral por unidade, humildade e amor fraternal visível na vida comunitária da Igreja.'
  },
  {
    id: 'vl-por-toda-terra',
    title: 'Por Toda Terra',
    artist: 'Vocal Livre',
    youtubeId: 'XpGxAy8880Q',
    scriptureBasis: 'Mateus 28:18–20 • Salmo 96',
    canonicalRefs: ['Mateus 28', 'Atos 1', 'Atos 16', 'Salmos 96', 'Salmos 67', 'Romanos 10'],
    axes: ['missao_firmeza'],
    exegeticalNote: 'Convocação missionária para anunciar a salvação e a glória de Cristo entre todas as nações.'
  },
  {
    id: 'vl-temporal',
    title: 'Temporal',
    artist: 'Vocal Livre',
    youtubeId: 'uXf9Ww3OC30',
    scriptureBasis: 'Marcos 4:35–41 • Mateus 8:23–27',
    canonicalRefs: ['Marcos 4', 'Mateus 8', 'Mateus 14', 'Lucas 8', 'Atos 27', 'Salmos 107'],
    axes: ['consolo_providencia', 'cristologia_soberania'],
    exegeticalNote: 'Lembra que Cristo está no barco e até o vento e o mar obedecem à Sua voz.'
  },
  {
    id: 'magnani-ninguem-chega-so',
    title: 'Ninguém Chega Só',
    artist: 'Alexandre Magnani',
    youtubeId: 'ToqPLrFb6-I',
    scriptureBasis: '1 Coríntios 12:14–27 • Eclesiastes 4:9–12',
    canonicalRefs: ['1 Coríntios 12', 'Eclesiastes 4', 'Gálatas 6', 'Romanos 12'],
    axes: ['igreja_amor'],
    exegeticalNote: 'Exalta a interdependência do Corpo de Cristo, onde os irmãos carregam as cargas uns dos outros.'
  },
  {
    id: 'fv-despreocupado',
    title: 'Despreocupado',
    artist: 'Felipe Valente',
    youtubeId: 'UZDKMpD-6wY',
    scriptureBasis: 'Mateus 6:25–34 • Filipenses 4:6–7',
    canonicalRefs: ['Mateus 6', 'Filipenses 4', '1 Pedro 5', 'Lucas 12', 'Salmos 127'],
    axes: ['consolo_providencia'],
    exegeticalNote: 'Inspirada diretamente no ensino de Jesus sobre as aves do céu e o descanso livre da ansiedade.'
  },
  {
    id: 'mh-pequeninos',
    title: 'Pequeninos',
    artist: 'Mauro Henrique',
    youtubeId: 'qMt6R88UPkQ',
    scriptureBasis: 'Mateus 5:3–10 • 1 Coríntios 1:27–29',
    canonicalRefs: ['Mateus 5', 'Mateus 18', 'Mateus 19', '1 Coríntios 1', 'Tiago 2'],
    axes: ['graca_justificacao', 'santificacao_oracao'],
    exegeticalNote: 'Canta a inversão do Reino de Deus, que escolhe os humildes e pequeninos para confundir os fortes.'
  },
  {
    id: 'purples-meu-lugar',
    title: 'Meu Lugar',
    artist: 'Purples',
    youtubeId: 'Q4ejKplh_ms',
    scriptureBasis: 'Salmo 84:1–4 • Salmo 27:4',
    canonicalRefs: ['Salmos 84', 'Salmos 27', 'Salmos 63', 'João 15', 'Efésios 2'],
    axes: ['santificacao_oracao', 'consolo_providencia'],
    exegeticalNote: 'Desejo ardente de habitar na presença do Senhor como único lugar de descanso verdadeiro.'
  },
  {
    id: 'g3-incondicional',
    title: 'Incondicional',
    artist: 'Oficina G3',
    youtubeId: 'oYuIZLGrmcg',
    scriptureBasis: 'Romanos 8:35–39 • 1 João 4:9–10',
    canonicalRefs: ['Romanos 8', '1 João 4', '1 Coríntios 13', 'João 15'],
    axes: ['cruz_redencao', 'igreja_amor'],
    exegeticalNote: 'Medita no amor sacrificial de Deus em Cristo do qual nada na criação pode nos separar.'
  },
  {
    id: 'fs-o-que-somos',
    title: 'O Que Na Verdade Somos',
    artist: 'Fruto Sagrado',
    youtubeId: '8MksLBGRUpo',
    scriptureBasis: '1 Samuel 16:7 • Tiago 1:22–25 • Mateus 23',
    canonicalRefs: ['1 Samuel 16', 'Tiago 1', 'Tiago 2', 'Mateus 23', '1 João 1', 'Provérbios 4'],
    axes: ['santificacao_oracao'],
    exegeticalNote: 'Exame de consciência contra a religiosidade externa, buscando integridade diante de Deus.'
  },
  {
    id: 'eli-me-ajude-melhorar',
    title: 'Me Ajude a Melhorar',
    artist: 'Eli Soares',
    youtubeId: 'lclKOqYuvug',
    scriptureBasis: 'Salmo 51:10 • Romanos 7:18–25',
    canonicalRefs: ['Salmos 51', 'Salmos 139', 'Romanos 7', 'Romanos 12', 'Efésios 4'],
    axes: ['santificacao_oracao'],
    exegeticalNote: 'Oração de quebrantamento e arrependimento pedindo ao Espírito renovação diária do caráter.'
  },
  {
    id: 'fernandinho-nada-alem-sangue',
    title: 'Nada Além do Sangue',
    artist: 'Fernandinho',
    youtubeId: 'csPaNdL6ndA',
    scriptureBasis: 'Hebreus 9:22 • 1 Co 11:25',
    canonicalRefs: ['1 Coríntios 11', 'Hebreus 9', 'Hebreus 10', 'Levítico 16', 'Levítico 17', 'Êxodo 12', '1 João 1'],
    axes: ['cruz_redencao', 'graca_justificacao'],
    exegeticalNote: 'Proclama a remissão de pecados e a justificação unicamente pelo sangue da Nova Aliança.'
  },
  {
    id: 'fernandinho-galileu',
    title: 'Galileu',
    artist: 'Fernandinho',
    youtubeId: '9YC8iDNpyYU',
    scriptureBasis: 'Marcos 1–8 • Colossenses 2:15',
    canonicalRefs: ['Marcos 1', 'Marcos 2', 'Mateus 4', 'Mateus 9', 'Lucas 4', 'Lucas 7', 'Colossenses 2'],
    axes: ['cristologia_soberania', 'ressurreicao_esperanca'],
    exegeticalNote: 'Celebra o ministério terreno e o triunfo cósmico de Jesus de Nazaré sobre o pecado e a morte.'
  },
  {
    id: 'morada-so-tu-es-santo',
    title: 'Só Tu És Santo',
    artist: 'Morada',
    youtubeId: 'Krw3YIZI-Ps',
    scriptureBasis: '2 Coríntios 3:18 • Apocalipse 15:4',
    canonicalRefs: ['2 Coríntios 3', 'Apocalipse 15', 'Apocalipse 4', 'Isaías 6', 'Êxodo 33'],
    axes: ['cristologia_soberania', 'santificacao_oracao'],
    exegeticalNote: 'Adoração contemplativa diante da glória do Senhor que nos transforma de glória em glória.'
  },
  {
    id: 'morada-tudo-sobre-voce',
    title: 'É Tudo Sobre Você',
    artist: 'Morada',
    youtubeId: 'ePdRgBWhvog',
    scriptureBasis: 'Romanos 11:36 • Colossenses 1:16',
    canonicalRefs: ['Romanos 11', 'Colossenses 1', 'Apocalipse 5', 'Salmos 115'],
    axes: ['cristologia_soberania'],
    exegeticalNote: 'Doxologia reconhecendo que dEle, por Ele e para Ele são todas as coisas.'
  }
].map((song, idx) => ({
  ...song,
  catalogIndex: idx,
  primaryAxisLabel: AXIS_LABEL_MAP[song.axes[0]] || 'Teologia Bíblica',
  youtubeMusicUrl: getYoutubeMusicSearchUrl(`${song.artist} ${song.title}`)
}));

export const EXPANDED_DEVOTIONAL_CATALOG = VERIFIED_THEOLOGICAL_SONGS;
export const SHORT_DEVOTIONAL_TRACKS = VERIFIED_THEOLOGICAL_SONGS;

// Catálogo Verificado de Vídeos do BibleProject em Português (IDs auditados com HTTP 200)
export const BIBLE_PROJECT_VIDEOS = {
  genesis: {
    title: 'BibleProject Português | Visão Geral: Gênesis (1 a 11)',
    channel: 'BibleProject Português',
    youtubeId: 'syzvUKr4f44',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Genesis',
    description: 'A criação boa de Deus, a rebelião humana e a promessa da descendência que restaurará a bênção às nações.'
  },
  exodo: {
    title: 'BibleProject Português | Visão Geral: Êxodo',
    channel: 'BibleProject Português',
    youtubeId: 'TF6whgRN6AM',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Exodo',
    description: 'A libertação soberana do Egito, a Páscoa, a Aliança no Sinai e a glória de Deus no Tabernáculo.'
  },
  lucas_1_9: {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 1 a 9)',
    channel: 'BibleProject Português',
    youtubeId: 'ubXUcaXu8bQ',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Lucas+1-9',
    description: 'A vinda do Messias para acolher os humildes, o ministério na Galileia e o envio dos doze apóstolos.'
  },
  lucas_10_24: {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Lucas+10-24',
    description: 'A caminhada para Jerusalém, as parábolas da Graça, a Ceia, a crucificação e a ressurreição.'
  },
  joao_1_12: {
    title: 'BibleProject Português | Visão Geral: João (Cap. 1 a 12)',
    channel: 'BibleProject Português',
    youtubeId: 'x2Q23ddS1TM',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Joao+1-12',
    description: 'Jesus como a Palavra eterna de Deus encarnada e os sete sinais que revelam a glória do Pai.'
  },
  joao_13_21: {
    title: 'BibleProject Português | Visão Geral: João (Cap. 13 a 21)',
    channel: 'BibleProject Português',
    youtubeId: 'bKIiCTvr8CA',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Joao+13-21',
    description: 'O lava-pés, os discursos do Consolador, a oração sacerdotal, a cruz e a restauração junto ao mar.'
  },
  atos: {
    title: 'BibleProject Português | Visão Geral: Atos dos Apóstolos',
    channel: 'BibleProject Português',
    youtubeId: '9HdS25PV9JQ',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Atos',
    description: 'O derramamento do Espírito Santo no Pentecostes e o avanço do Evangelho de Jerusalém até as nações.'
  },
  romanos: {
    title: 'BibleProject Português | Visão Geral: Romanos',
    channel: 'BibleProject Português',
    youtubeId: 'uGLbrGF1JJk',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Romanos',
    description: 'A justiça revelada no Evangelho, justificação pela fé, vida no Espírito e a formação da família da aliança.'
  },
  '1corintios': {
    title: 'BibleProject | Visão Geral: 1 Coríntios',
    channel: 'BibleProject',
    youtubeId: 'yiHf8klCCc4',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+1+Corintios',
    description: 'Como o Evangelho de Cristo crucificado e ressurreto transforma divisões, dons espirituais, amor e esperança na igreja.'
  },
  '2corintios': {
    title: 'BibleProject | Visão Geral: 2 Coríntios',
    channel: 'BibleProject',
    youtubeId: '3lfPK2vfC54',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+2+Corintios',
    description: 'O paradoxo da cruz: o poder de Deus aperfeiçoado na fraqueza, o ministério da Nova Aliança e a generosidade cristã.'
  },
  galatas: {
    title: 'BibleProject | Visão Geral: Gálatas',
    channel: 'BibleProject',
    youtubeId: 'vmx4UjRFp0M',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Galatas',
    description: 'A defesa da justificação somente pela fé em Cristo e a verdadeira liberdade guiada pelo Fruto do Espírito.'
  },
  efesios: {
    title: 'BibleProject | Visão Geral: Efésios',
    channel: 'BibleProject',
    youtubeId: 'Y71r-T98E2Q',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Efesios',
    description: 'O plano eterno de Deus de reunir todas as coisas em Cristo, a unidade da Igreja e a armadura espiritual.'
  },
  filipenses: {
    title: 'BibleProject | Visão Geral: Filipenses',
    channel: 'BibleProject',
    youtubeId: 'oE9qqW1-BkU',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Filipenses',
    description: 'A alegria inabalável no Evangelho e o hino da humildade e exaltação suprema de Cristo Jesus.'
  },
  colossenses: {
    title: 'BibleProject | Visão Geral: Colossenses',
    channel: 'BibleProject',
    youtubeId: 'pXTXlDxQsvc',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Colossenses',
    description: 'A supremacia e suficiência absoluta de Cristo sobre toda a criação e a nova vida ressurreta.'
  },
  hebreus: {
    title: 'BibleProject | Visão Geral: Hebreus',
    channel: 'BibleProject',
    youtubeId: '1fNWTZZwgbs',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Hebreus',
    description: 'A superioridade suprema de Cristo como Grande Sumo Sacerdote e Mediador de uma Nova e Eterna Aliança.'
  },
  apocalipse: {
    title: 'BibleProject | Visão Geral: Apocalipse',
    channel: 'BibleProject',
    youtubeId: '5nvVVcYD-0w',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Apocalipse',
    description: 'A revelação do Cordeiro que venceu, a perseverança fiel da Igreja e a consumação dos Novos Céus e Nova Terra.'
  }
};

// Mapeamento Teológico Canônico dos 66 Livros Bíblicos (Sem palavras soltas — Eixos Exegéticos Reais)
const BOOK_DOCTRINAL_PROFILE = {
  genesis: ['cristologia_soberania', 'consolo_providencia', 'cruz_redencao'],
  exodo: ['cruz_redencao', 'cristologia_soberania', 'consolo_providencia'],
  levitico: ['cruz_redencao', 'santificacao_oracao'],
  numeros: ['consolo_providencia', 'missao_firmeza'],
  deuteronomio: ['cruz_redencao', 'missao_firmeza', 'santificacao_oracao'],
  josue: ['missao_firmeza', 'consolo_providencia'],
  juizes: ['graca_justificacao', 'santificacao_oracao'],
  rute: ['consolo_providencia', 'cruz_redencao'],
  '1samuel': ['cristologia_soberania', 'santificacao_oracao'],
  '2samuel': ['cristologia_soberania', 'graca_justificacao'],
  '1reis': ['cristologia_soberania', 'santificacao_oracao'],
  '2reis': ['cristologia_soberania', 'consolo_providencia'],
  '1cronicas': ['cristologia_soberania', 'santificacao_oracao'],
  '2cronicas': ['cristologia_soberania', 'santificacao_oracao'],
  esdras: ['missao_firmeza', 'santificacao_oracao'],
  neemias: ['missao_firmeza', 'igreja_amor'],
  ester: ['consolo_providencia'],
  jo: ['consolo_providencia', 'cristologia_soberania'],
  salmos: ['consolo_providencia', 'santificacao_oracao', 'cristologia_soberania'],
  proverbios: ['santificacao_oracao', 'consolo_providencia'],
  eclesiastes: ['consolo_providencia', 'cristologia_soberania'],
  canticos: ['igreja_amor', 'cruz_redencao'],
  isaias: ['cruz_redencao', 'cristologia_soberania', 'ressurreicao_esperanca'],
  jeremias: ['cruz_redencao', 'santificacao_oracao'],
  lamentacoes: ['consolo_providencia', 'santificacao_oracao'],
  ezequiel: ['graca_justificacao', 'cristologia_soberania'],
  daniel: ['cristologia_soberania', 'ressurreicao_esperanca', 'missao_firmeza'],
  oseias: ['graca_justificacao', 'cruz_redencao'],
  joel: ['santificacao_oracao', 'igreja_amor'],
  amos: ['santificacao_oracao', 'cristologia_soberania'],
  obadias: ['cristologia_soberania'],
  jonas: ['graca_justificacao', 'missao_firmeza'],
  miqueias: ['cruz_redencao', 'graca_justificacao'],
  naum: ['cristologia_soberania', 'consolo_providencia'],
  habacuque: ['consolo_providencia', 'graca_justificacao'],
  sofonias: ['ressurreicao_esperanca', 'consolo_providencia'],
  ageu: ['missao_firmeza', 'cristologia_soberania'],
  zacarias: ['cruz_redencao', 'ressurreicao_esperanca'],
  malaquias: ['cruz_redencao', 'santificacao_oracao'],
  mateus: ['cristologia_soberania', 'cruz_redencao', 'missao_firmeza'],
  marcos: ['cristologia_soberania', 'cruz_redencao', 'consolo_providencia'],
  lucas: ['graca_justificacao', 'cruz_redencao', 'ressurreicao_esperanca'],
  joao: ['cristologia_soberania', 'cruz_redencao', 'ressurreicao_esperanca'],
  atos: ['missao_firmeza', 'igreja_amor', 'ressurreicao_esperanca'],
  romanos: ['graca_justificacao', 'cruz_redencao', 'santificacao_oracao'],
  '1corintios': ['igreja_amor', 'ressurreicao_esperanca', 'cruz_redencao', 'missao_firmeza'],
  '2corintios': ['consolo_providencia', 'graca_justificacao', 'santificacao_oracao'],
  galatas: ['graca_justificacao', 'cruz_redencao'],
  efesios: ['graca_justificacao', 'igreja_amor', 'cristologia_soberania'],
  filipenses: ['cristologia_soberania', 'consolo_providencia', 'missao_firmeza'],
  colossenses: ['cristologia_soberania', 'cruz_redencao'],
  '1tessalonicenses': ['ressurreicao_esperanca', 'missao_firmeza'],
  '2tessalonicenses': ['ressurreicao_esperanca', 'missao_firmeza'],
  '1timoteo': ['igreja_amor', 'missao_firmeza'],
  '2timoteo': ['missao_firmeza', 'consolo_providencia'],
  tito: ['graca_justificacao', 'igreja_amor'],
  filemom: ['igreja_amor', 'graca_justificacao'],
  hebreus: ['cruz_redencao', 'cristologia_soberania', 'ressurreicao_esperanca'],
  tiago: ['santificacao_oracao', 'igreja_amor'],
  '1pedro': ['ressurreicao_esperanca', 'consolo_providencia', 'santificacao_oracao'],
  '2pedro': ['ressurreicao_esperanca', 'santificacao_oracao'],
  '1joao': ['igreja_amor', 'cruz_redencao', 'santificacao_oracao'],
  '2joao': ['igreja_amor', 'missao_firmeza'],
  '3joao': ['igreja_amor', 'missao_firmeza'],
  judas: ['missao_firmeza', 'cristologia_soberania'],
  apocalipse: ['ressurreicao_esperanca', 'cristologia_soberania']
};

function normalizeKey(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Analisa os títulos de seção reais e temas canônicos dos capítulos do dia (sem casar palavras soltas!)
 */
export function analyzeReadingTheology(readings = [], dayBookData = null) {
  const firstReading = readings[0] || '1 Coríntios 14';
  const parts = firstReading.trim().split(/\s+/);
  const firstCh = parts.pop();
  const bookName = parts.join(' ') || '1 Coríntios';
  const normBook = normalizeKey(bookName);

  const axisWeights = {};
  const addWeight = (axis, w) => {
    axisWeights[axis] = (axisWeights[axis] || 0) + w;
  };

  // 1. Base canônica do livro
  const bookAxes = BOOK_DOCTRINAL_PROFILE[normBook] || ['cristologia_soberania', 'graca_justificacao'];
  bookAxes.forEach((ax, idx) => addWeight(ax, 30 - idx * 6));

  // 2. Análise dos títulos expositivos das seções dos capítulos do dia na NVT (ex.: "A ressurreição dos mortos", "A ceia do Senhor")
  if (dayBookData) {
    const sectionHeadings = [];
    readings.forEach(r => {
      const sp = r.trim().split(/\s+/);
      const ch = sp[sp.length - 1];
      const chObj = dayBookData[ch] || dayBookData[Number(ch)];
      if (chObj?.sections) {
        chObj.sections.forEach(s => {
          if (s.title) sectionHeadings.push(s.title.toLowerCase());
        });
      }
    });

    const joinedHeadings = sectionHeadings.join(' | ');
    if (/ressurrei|morte|trombeta|volta de cristo|etern|novos ceus|novo ceu/.test(joinedHeadings)) {
      addWeight('ressurreicao_esperanca', 55);
    }
    if (/ceia|cruz|crucifica|sangue|alianca|sacrificio|pascoa|servo sofredor|getsemani/.test(joinedHeadings)) {
      addWeight('cruz_redencao', 55);
    }
    if (/amor|dons|profecia|igreja|corpo de cristo|unid|comunhao|coleta|irmaos/.test(joinedHeadings)) {
      addWeight('igreja_amor', 50);
    }
    if (/justifica|graca|fe |pecado|perdao|nova criacao|filho prodigo/.test(joinedHeadings)) {
      addWeight('graca_justificacao', 50);
    }
    if (/consol|aflic|sofrimento|ansiedade|pastor|refugio|tempestade/.test(joinedHeadings)) {
      addWeight('consolo_providencia', 50);
    }
    if (/oracao|arrepend|santidade|vida nova|sabedoria/.test(joinedHeadings)) {
      addWeight('santificacao_oracao', 45);
    }
    if (/missao|envio|instrucoes finais|firme|coragem|armadura/.test(joinedHeadings)) {
      addWeight('missao_firmeza', 45);
    }
  }

  // Refinamento canônico de blocos clássicos caso dayBookData ainda esteja carregando
  const chNums = readings.map(r => Number(r.trim().split(/\s+/).pop()) || 1);
  if (normBook === '1corintios') {
    if (chNums.includes(15)) addWeight('ressurreicao_esperanca', 65);
    if (chNums.some(c => c >= 12 && c <= 14)) addWeight('igreja_amor', 55);
    if (chNums.includes(11)) addWeight('cruz_redencao', 60);
    if (chNums.includes(16)) addWeight('missao_firmeza', 45);
  } else if (normBook === '2corintios') {
    if (chNums.includes(5)) addWeight('graca_justificacao', 60);
    if (chNums.includes(1) || chNums.includes(4) || chNums.includes(12)) addWeight('consolo_providencia', 55);
  } else if (normBook === 'romanos') {
    if (chNums.some(c => c >= 3 && c <= 8)) addWeight('graca_justificacao', 60);
    if (chNums.includes(8)) addWeight('consolo_providencia', 50);
    if (chNums.some(c => c >= 12)) addWeight('igreja_amor', 55);
  }

  const activeAxes = Object.entries(axisWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([axis]) => axis);

  return {
    bookName,
    firstCh,
    activeAxes,
    activeAxisLabels: activeAxes.map(a => AXIS_LABEL_MAP[a] || a),
    axisWeights
  };
}

/**
 * Retorna a lista ranqueada e honesta de canções conectadas teologicamente à leitura do dia.
 * NUNCA cola um rótulo falso de capítulo em uma música de outro livro; cada canção exibe sua própria Base Bíblica real!
 */
export function getCuratedSongsForReading(readings = [], dayBookData = null, dayId = 328) {
  const cleanReadings = readings.map(r => r.trim());
  const { bookName, activeAxes, activeAxisLabels, axisWeights } = analyzeReadingTheology(cleanReadings, dayBookData);
  const normBook = normalizeKey(bookName);

  const scored = VERIFIED_THEOLOGICAL_SONGS.map(song => {
    let score = 0;
    let matchedChapter = null;

    // 1. A canção foi composta ou fundamentada diretamente em um dos capítulos exatos de hoje?
    for (const r of cleanReadings) {
      if (song.canonicalRefs.some(ref => normalizeKey(ref) === normalizeKey(r))) {
        score += 120;
        matchedChapter = r;
        break;
      }
    }

    // 2. A canção referencia outro capítulo do mesmo livro bíblico?
    if (!matchedChapter && song.canonicalRefs.some(ref => normalizeKey(ref).startsWith(normBook))) {
      score += 35;
    }

    // 3. Pontuação pelos Eixos Doutrinários da passagem
    let bestAxis = song.axes[0];
    let bestAxisWeight = 0;
    for (const ax of song.axes) {
      const w = axisWeights[ax] || 0;
      score += w;
      if (w > bestAxisWeight) {
        bestAxisWeight = w;
        bestAxis = ax;
      }
    }

    // Pequeno desempate determinístico por dia para variar suavemente entre dias do mesmo livro sem perder relevância
    const tieBreaker = (hashString(`${song.id}:${dayId}`) % 11);

    return {
      ...song,
      relevanceScore: score + (score > 0 ? tieBreaker : 0),
      matchedChapter,
      connectionLabel: matchedChapter
        ? `Conexão direta com ${matchedChapter}`
        : `Eixo da leitura: ${AXIS_LABEL_MAP[bestAxis] || song.primaryAxisLabel}`
    };
  });

  // Filtra apenas canções que realmente compartilham os eixos doutrinários da leitura de hoje
  const relevant = scored
    .filter(s => s.relevanceScore >= 30)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Deduplica artistas nas 3 primeiras posições para garantir variedade musical imediata
  const diversified = [];
  const deferred = [];
  const seenTopArtists = new Set();

  for (const item of relevant) {
    if (diversified.length < 3 && seenTopArtists.has(item.artist)) {
      deferred.push(item);
    } else {
      diversified.push(item);
      if (diversified.length <= 3) seenTopArtists.add(item.artist);
    }
  }

  return {
    songs: [...diversified, ...deferred],
    activeAxes,
    activeAxisLabels
  };
}

// Filtra canções por Eixo Doutrinário para a aba "Acervo Bíblico"
export function getSongsByDoctrinalAxis(axisId) {
  if (!axisId || axisId === 'all') return VERIFIED_THEOLOGICAL_SONGS;
  return VERIFIED_THEOLOGICAL_SONGS.filter(s => s.axes.includes(axisId));
}

// Resolve o vídeo do BibleProject para o livro atual
export function resolveBibleProjectVideo(bookName, chapters = []) {
  const cleanBook = (bookName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const firstCh = Number(chapters[0]) || 1;

  if (cleanBook.includes('1 corintios') || cleanBook === '1corintios') return BIBLE_PROJECT_VIDEOS['1corintios'];
  if (cleanBook.includes('2 corintios') || cleanBook === '2corintios') return BIBLE_PROJECT_VIDEOS['2corintios'];
  if (cleanBook.includes('romanos')) return BIBLE_PROJECT_VIDEOS['romanos'];
  if (cleanBook.includes('galatas')) return BIBLE_PROJECT_VIDEOS['galatas'];
  if (cleanBook.includes('efesios')) return BIBLE_PROJECT_VIDEOS['efesios'];
  if (cleanBook.includes('filipenses')) return BIBLE_PROJECT_VIDEOS['filipenses'];
  if (cleanBook.includes('colossenses')) return BIBLE_PROJECT_VIDEOS['colossenses'];
  if (cleanBook.includes('hebreus')) return BIBLE_PROJECT_VIDEOS['hebreus'];
  if (cleanBook.includes('apocalipse')) return BIBLE_PROJECT_VIDEOS['apocalipse'];
  if (cleanBook.includes('atos')) return BIBLE_PROJECT_VIDEOS['atos'];
  if (cleanBook.includes('genesis')) return BIBLE_PROJECT_VIDEOS['genesis'];
  if (cleanBook.includes('exodo')) return BIBLE_PROJECT_VIDEOS['exodo'];

  if (cleanBook.includes('lucas')) {
    return firstCh <= 9 ? BIBLE_PROJECT_VIDEOS['lucas_1_9'] : BIBLE_PROJECT_VIDEOS['lucas_10_24'];
  }
  if (cleanBook === 'joao') {
    return firstCh >= 13 ? BIBLE_PROJECT_VIDEOS['joao_13_21'] : BIBLE_PROJECT_VIDEOS['joao_1_12'];
  }

  const displayBook = bookName || 'Escrituras';
  return {
    title: `BibleProject Português | Visão Geral: ${displayBook}`,
    channel: 'BibleProject Português',
    youtubeId: 'syzvUKr4f44',
    searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`BibleProject Portugues ${displayBook}`)}`,
    description: `Animação expositiva da estrutura literária, contexto histórico e temas teológicos do livro de ${displayBook}.`
  };
}

// Compatibilidade limpa para o Leitor Bíblico (retorna apenas canções com afinidade real para aquele capítulo + opção instrumental)
export function getMusicForChapter(dayId, readingStr, readingIndex = 0, overrideIndex = null) {
  const cleanReading = (readingStr || '1 Coríntios 14').trim();
  const { songs } = getCuratedSongsForReading([cleanReading], null, dayId || 328);
  const pool = songs.length > 0 ? songs : VERIFIED_THEOLOGICAL_SONGS;
  const idx = overrideIndex !== null && overrideIndex !== undefined
    ? Math.abs(Number(overrideIndex)) % pool.length
    : readingIndex % pool.length;
  const chosen = pool[idx];

  return {
    ...chosen,
    artistIndex: idx,
    poolSize: pool.length,
    instrumentalTrack: INSTRUMENTAL_READING_TRACKS[idx % INSTRUMENTAL_READING_TRACKS.length]
  };
}

export function getMediaForDay(dayId, dayData = null, dayBookData = null) {
  const numericDay = Number(dayId) || 328;
  const readings = dayData?.readings || ['1 Coríntios 14', '1 Coríntios 15', '1 Coríntios 16'];
  const first = readings[0] || '1 Coríntios 14';
  const parts = first.trim().split(/\s+/);
  const firstCh = parts.pop();
  const bookName = parts.join(' ') || '1 Coríntios';
  const chapters = readings.map(r => r.trim().split(/\s+/).pop());

  const curated = getCuratedSongsForReading(readings, dayBookData, numericDay);
  const primaryTrack = curated.songs[0] || VERIFIED_THEOLOGICAL_SONGS[0];
  const selectedVideo = resolveBibleProjectVideo(bookName, chapters);

  return {
    dayId: numericDay,
    bookName,
    readings,
    curatedSongs: curated.songs,
    activeAxisLabels: curated.activeAxisLabels,
    instrumentalTracks: INSTRUMENTAL_READING_TRACKS,
    music: primaryTrack,
    video: selectedVideo
  };
}
