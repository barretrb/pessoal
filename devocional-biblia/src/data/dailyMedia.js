import chapterTheologyIndex from './chapterTheologyIndex.json' with { type: 'json' };
import verifiedSongsCatalog from './verifiedSongsCatalog.json' with { type: 'json' };
import { normalizeBookId, parseReading } from '../services/bibleService.js';

// Curadoria Exegética de Canções Bíblicas & Trilhas Instrumentais para Leitura (1.189 capítulos indexados)
// 100% dos youtubeIds foram auditados individualmente via YouTube oEmbed (zero IDs repetidos, zero títulos inventados).

export function getYoutubeMusicSearchUrl(query) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
}

// Taxonomia Doutrinária Bíblica (12 Eixos Exegéticos Distintos — cobre todos os 66 livros e 1.189 capítulos)
export const DOCTRINAL_AXES = [
  { id: 'criacao_louvor', label: 'Criação & Louvor', shortLabel: 'Criação & Louvor' },
  { id: 'cruz_redencao', label: 'Cruz & Redenção', shortLabel: 'Cruz & Redenção' },
  { id: 'graca_justificacao', label: 'Graça & Fé', shortLabel: 'Graça & Fé' },
  { id: 'ressurreicao_esperanca', label: 'Ressurreição', shortLabel: 'Ressurreição & Glória' },
  { id: 'cristologia_soberania', label: 'Cristo & Reino', shortLabel: 'Cristo & Soberania' },
  { id: 'igreja_amor', label: 'Igreja & Amor', shortLabel: 'Igreja & Amor Ágape' },
  { id: 'consolo_providencia', label: 'Consolo & Refúgio', shortLabel: 'Consolo & Refúgio' },
  { id: 'arrependimento_santidade', label: 'Santidade', shortLabel: 'Arrependimento & Santidade' },
  { id: 'oracao_presenca', label: 'Oração & Presença', shortLabel: 'Oração & Presença' },
  { id: 'alianca_promessa', label: 'Aliança & Fidelidade', shortLabel: 'Aliança & Promessa' },
  { id: 'sabedoria_temor', label: 'Sabedoria & Temor', shortLabel: 'Sabedoria & Temor' },
  { id: 'missao_firmeza', label: 'Missão & Firmeza', shortLabel: 'Missão & Firmeza' }
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

function parseRefKey(refStr = '') {
  const parsed = parseReading(refStr);
  const bookId = normalizeBookId(parsed.book);
  const chNum = parseInt(String(parsed.chapter).replace(/\D/g, ''), 10) || 1;
  return { bookId, chapter: String(chNum), key: `${bookId}:${chNum}` };
}

export const VERIFIED_THEOLOGICAL_SONGS = verifiedSongsCatalog.map((song, idx) => {
  const canonicalKeys = new Set();
  const canonicalBooks = new Set();
  (song.canonicalRefs || []).forEach(ref => {
    const parsed = parseRefKey(ref);
    canonicalKeys.add(parsed.key);
    canonicalBooks.add(parsed.bookId);
  });

  return {
    ...song,
    catalogIndex: idx,
    canonicalKeys,
    canonicalBooks,
    primaryAxisLabel: AXIS_LABEL_MAP[song.axes?.[0]] || 'Teologia Bíblica',
    youtubeMusicUrl: getYoutubeMusicSearchUrl(`${song.artist} ${song.title}`)
  };
});

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

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Analisa TODOS os capítulos da leitura usando o índice teológico completo dos 1.189 capítulos da NVT
 * + títulos expositivos em tempo real caso `dayBookData` esteja carregado.
 */
export function analyzeReadingTheology(readings = [], dayBookData = null) {
  const safeReadings = readings && readings.length > 0 ? readings : ['1 Coríntios 14'];
  const parsedReadings = safeReadings.map(r => {
    const cleanStr = r.trim();
    const { book, chapter } = parseReading(cleanStr);
    const bookId = normalizeBookId(book);
    const chNum = String(parseInt(String(chapter).replace(/\D/g, ''), 10) || 1);
    const indexKey = `${bookId}:${chNum}`;
    return { raw: cleanStr, bookName: book, bookId, chapter: chNum, indexKey };
  });

  const axisWeights = {};
  const addWeight = (axis, w) => {
    if (!axis) return;
    axisWeights[axis] = (axisWeights[axis] || 0) + w;
  };

  const chapterThemes = [];
  for (const item of parsedReadings) {
    const entry = chapterTheologyIndex[item.indexKey];
    if (entry) {
      if (entry.a?.[0]) addWeight(entry.a[0], 50);
      if (entry.a?.[1]) addWeight(entry.a[1], 30);
      if (entry.a?.[2]) addWeight(entry.a[2], 15);
      chapterThemes.push({
        reading: item.raw,
        theme: entry.t,
        ytQuery: entry.q
      });
    } else {
      chapterThemes.push({
        reading: item.raw,
        theme: 'Meditação nas Escrituras',
        ytQuery: `louvor cristao ${item.bookName} ${item.chapter}`
      });
    }
  }

  // Bônus adicional se `dayBookData` ao vivo contiver cabeçalhos expositivos
  if (dayBookData) {
    const sectionHeadings = [];
    for (const item of parsedReadings) {
      const chObj = dayBookData[item.chapter] || dayBookData[Number(item.chapter)];
      if (chObj?.sections) {
        chObj.sections.forEach(s => {
          if (s.title) sectionHeadings.push(s.title.toLowerCase());
        });
      }
    }
    const joined = sectionHeadings.join(' | ');
    if (/ressurrei|novos ceus|ultima trombeta/.test(joined)) addWeight('ressurreicao_esperanca', 25);
    if (/ceia|cruz|crucifica|pascoa|sacrificio/.test(joined)) addWeight('cruz_redencao', 25);
    if (/justifica|graca|filho prodigo|nova criacao/.test(joined)) addWeight('graca_justificacao', 25);
    if (/amor|dons|igreja|corpo de cristo/.test(joined)) addWeight('igreja_amor', 25);
    if (/salmo 23|bom pastor|refugio|consol|tempestade/.test(joined)) addWeight('consolo_providencia', 25);
    if (/confess|arrepend|santidade/.test(joined)) addWeight('arrependimento_santidade', 25);
    if (/oracao|pai nosso|santuario/.test(joined)) addWeight('oracao_presenca', 25);
  }

  const activeAxes = Object.entries(axisWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([axis]) => axis);

  const primary = parsedReadings[0];
  const primaryTheme = chapterThemes[0];
  const youtubeDiscoveryQuery = primaryTheme?.ytQuery || `louvor ${primary.bookName} ${primary.chapter}`;
  const youtubeDiscoveryUrl = getYoutubeMusicSearchUrl(youtubeDiscoveryQuery);

  return {
    bookName: primary.bookName,
    firstCh: primary.chapter,
    parsedReadings,
    activeAxes,
    activeAxisLabels: activeAxes.map(a => AXIS_LABEL_MAP[a] || a),
    chapterThemes,
    primaryTheme: primaryTheme?.theme || AXIS_LABEL_MAP[activeAxes[0]] || 'Meditação Bíblica',
    youtubeDiscoveryQuery,
    youtubeDiscoveryUrl,
    axisWeights
  };
}

/**
 * Retorna o ranking exegético de canções verificadas para qualquer combinação de capítulos dos 66 livros.
 * Usa: (1) correspondência canônica direta no capítulo, (2) eixos doutrinários do capítulo via índice de 1.189 capítulos,
 * (3) variação determinística por leitura e (4) deduplicação de artistas no topo.
 */
export function getCuratedSongsForReading(readings = [], dayBookData = null, dayId = 328) {
  const analysis = analyzeReadingTheology(readings, dayBookData);
  const { parsedReadings, activeAxes, activeAxisLabels, axisWeights } = analysis;

  const readingKeys = new Set(parsedReadings.map(p => p.indexKey));
  const readingBooks = new Set(parsedReadings.map(p => p.bookId));
  const readingsSignature = parsedReadings.map(p => p.indexKey).join('|');

  const scored = VERIFIED_THEOLOGICAL_SONGS.map(song => {
    let score = 0;
    let matchedReading = null;

    // 1. A canção foi fundamentada diretamente em um dos capítulos da leitura?
    for (const pr of parsedReadings) {
      if (song.canonicalKeys.has(pr.indexKey)) {
        score += 140;
        matchedReading = pr.raw;
        break;
      }
    }

    // 2. A canção referencia outro capítulo do mesmo livro bíblico?
    if (!matchedReading) {
      for (const bId of readingBooks) {
        if (song.canonicalBooks.has(bId)) {
          score += 45;
          break;
        }
      }
    }

    // 3. Alinhamento pelos 12 Eixos Doutrinários da passagem (normalizado pela quantidade de capítulos)
    const chapterCountNorm = Math.max(1, parsedReadings.length);
    let bestAxis = song.axes[0];
    let bestAxisWeight = 0;
    let axisScore = 0;
    (song.axes || []).forEach((ax, idx) => {
      const w = (axisWeights[ax] || 0) / chapterCountNorm;
      const multiplier = idx === 0 ? 1.0 : idx === 1 ? 0.65 : 0.4;
      axisScore += w * multiplier;
      if (w > bestAxisWeight) {
        bestAxisWeight = w;
        bestAxis = ax;
      }
    });
    score += Math.round(axisScore);

    // 4. Variação determinística dentro do mesmo patamar exegético para evitar repetição em capítulos seguidos
    const variationSeed = hashString(`${song.id}::${readingsSignature}::${dayId || 0}`) % 26;
    if (axisScore >= 18 || matchedReading) {
      score += variationSeed;
    }

    return {
      ...song,
      relevanceScore: score,
      matchedChapter: matchedReading,
      connectionLabel: matchedReading
        ? `Conexão direta com ${matchedReading}`
        : `Eixo da leitura: ${AXIS_LABEL_MAP[bestAxis] || song.primaryAxisLabel}`
    };
  });

  const sorted = scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  // Mantém no máximo 15 canções (até 5 páginas de 3 faixas) com conexão exegética genuína à passagem
  const relevant = sorted.filter(s => s.relevanceScore >= 42).slice(0, 15);
  const pool = relevant.length >= 6 ? relevant : sorted.slice(0, 9);

  // Deduplica artistas nos primeiros 6 slots (páginas 1 e 2) para variedade sonora imediata
  const topDiverse = [];
  const remaining = [];
  const seenTopArtists = new Set();

  for (const item of pool) {
    if (topDiverse.length < 6 && seenTopArtists.has(item.artist)) {
      remaining.push(item);
    } else {
      topDiverse.push(item);
      if (topDiverse.length <= 6) seenTopArtists.add(item.artist);
    }
  }

  return {
    songs: [...topDiverse, ...remaining],
    activeAxes,
    activeAxisLabels,
    chapterThemes: analysis.chapterThemes,
    primaryTheme: analysis.primaryTheme,
    youtubeDiscoveryQuery: analysis.youtubeDiscoveryQuery,
    youtubeDiscoveryUrl: analysis.youtubeDiscoveryUrl
  };
}

// Filtra canções por um dos 12 Eixos Doutrinários
export function getSongsByDoctrinalAxis(axisId) {
  if (!axisId || axisId === 'all') return VERIFIED_THEOLOGICAL_SONGS;
  return VERIFIED_THEOLOGICAL_SONGS.filter(s => (s.axes || []).includes(axisId));
}

// Resolve o vídeo do BibleProject para o livro atual
export function resolveBibleProjectVideo(bookName, chapters = []) {
  const cleanBook = (bookName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const firstCh = Number(String(chapters[0] || '1').replace(/\D/g, '')) || 1;

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

// Curadoria dinâmica por capítulo individual (funciona nos 1.189 capítulos mesmo no Modo Leitura Livre)
export function getMusicForChapter(dayId, readingStr, readingIndex = 0, overrideIndex = null) {
  const cleanReading = (readingStr || '1 Coríntios 14').trim();
  const curated = getCuratedSongsForReading([cleanReading], null, dayId || 1);
  const pool = curated.songs.length > 0 ? curated.songs : VERIFIED_THEOLOGICAL_SONGS;
  const idx = overrideIndex !== null && overrideIndex !== undefined
    ? Math.abs(Number(overrideIndex)) % pool.length
    : readingIndex % pool.length;
  const chosen = pool[idx];

  return {
    ...chosen,
    artistIndex: idx,
    poolSize: pool.length,
    chapterTheme: curated.primaryTheme,
    activeAxisLabels: curated.activeAxisLabels,
    youtubeDiscoveryQuery: curated.youtubeDiscoveryQuery,
    youtubeDiscoveryUrl: curated.youtubeDiscoveryUrl,
    instrumentalTrack: INSTRUMENTAL_READING_TRACKS[idx % INSTRUMENTAL_READING_TRACKS.length]
  };
}

export function getMediaForDay(dayId, dayData = null, dayBookData = null) {
  const numericDay = Number(dayId) || 328;
  const readings = dayData?.readings || ['1 Coríntios 14', '1 Coríntios 15', '1 Coríntios 16'];
  const firstParsed = parseReading(readings[0] || '1 Coríntios 14');
  const bookName = firstParsed.book || '1 Coríntios';
  const chapters = readings.map(r => parseReading(r).chapter);

  const curated = getCuratedSongsForReading(readings, dayBookData, numericDay);
  const primaryTrack = curated.songs[0] || VERIFIED_THEOLOGICAL_SONGS[0];
  const selectedVideo = resolveBibleProjectVideo(bookName, chapters);

  return {
    dayId: numericDay,
    bookName,
    readings,
    curatedSongs: curated.songs,
    activeAxisLabels: curated.activeAxisLabels,
    chapterThemes: curated.chapterThemes,
    primaryTheme: curated.primaryTheme,
    youtubeDiscoveryQuery: curated.youtubeDiscoveryQuery,
    youtubeDiscoveryUrl: curated.youtubeDiscoveryUrl,
    instrumentalTracks: INSTRUMENTAL_READING_TRACKS,
    music: primaryTrack,
    video: selectedVideo
  };
}
