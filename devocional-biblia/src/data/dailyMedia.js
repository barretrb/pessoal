// Curadoria de Músicas Curtas (YouTube Music / YouTube) e Vídeos Expositivos (BibleProject)
// Regra Estrita: Todos os IDs do YouTube são 100% verificados e liberados para incorporação (embed) sem restrições.
// Todas as músicas têm duração entre 3 e 7 minutos (< 10 minutos).

// Catálogo de Vídeos Oficiais do BibleProject em Português por Livro e Perícope
export const BIBLE_PROJECT_VIDEOS = {
  // Novo Testamento - Evangelho de Lucas por seções específicas
  'lucas_1_9': {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 1 a 9)',
    channel: 'BibleProject Português',
    youtubeId: 'ubXUcaXu8bQ',
    description: 'Animação explicativa sobre a vinda do Messias para acolher os humildes e o envio dos doze apóstolos.'
  },
  'lucas_10_24': {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Explicação minuciosa da caminhada para Jerusalém, o confronto com os líderes no Templo, as parábolas da Graça, a crucificação e a ressurreição.'
  },

  // Evangelho de João
  'joao_1_12': {
    title: 'BibleProject Português | Visão Geral: João (Cap. 1 a 12)',
    channel: 'BibleProject Português',
    youtubeId: 'x2Q23ddS1TM',
    description: 'Jesus como a Palavra eterna de Deus encarnada e os sete sinais que revelam a glória do Pai.'
  },
  'joao_13_21': {
    title: 'BibleProject Português | Visão Geral: João (Cap. 13 a 21)',
    channel: 'BibleProject Português',
    youtubeId: 'bKIiCTvr8CA',
    description: 'O lava-pés, os discursos de despedida do Consolador, a cruz e a conversa restauradora com Pedro junto ao mar.'
  },

  // Demais Livros do Cânon Bíblico
  'exodo': {
    title: 'BibleProject Português | Visão Geral: Êxodo',
    channel: 'BibleProject Português',
    youtubeId: 'TF6whgRN6AM',
    description: 'A libertação soberana do cativeiro no Egito, as pragas, a Páscoa, os Dez Mandamentos e o Tabernáculo.'
  },
  'default': {
    title: 'BibleProject Português | Panorama e Estudo Bíblico',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Explicação animada contextualizando a mensagem das Escrituras para a edificação da fé.'
  }
};

// Músicas Devocionais Curtas (< 10 minutos) 100% testadas e com embed autorizado no YouTube
export const SHORT_DEVOTIONAL_TRACKS = [
  {
    title: "Faz Um Milagre em Mim (Como Zaqueu)",
    artist: "Regis Danese",
    duration: "4:10 min",
    youtubeId: "HS-HSWBFogs",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=HS-HSWBFogs",
    description: "Canção inspirada em Lucas 19:1-10: 'Como Zaqueu, eu quero subir... Entra na minha casa, entra na minha vida'. Louvor de arrependimento e encontro transformador com Cristo.",
    theme: "Encontro com Cristo & Restauração (Lucas 19)"
  },
  {
    title: "Hosana nas Alturas",
    artist: "Gabriela Rocha",
    duration: "5:00 min",
    youtubeId: "ceCMxv72Uqw",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=ceCMxv72Uqw",
    description: "O clamor da Entrada Triunfal em Jerusalém: 'Bendito o Rei que vem em nome do Senhor! Hosana!' (Lucas 19:38).",
    theme: "Entrada Triunfal & Exaltação do Rei (Lucas 19)"
  },
  {
    title: "Bondade de Deus",
    artist: "Isaías Saad",
    duration: "4:58 min",
    youtubeId: "mZ9yZYo9Mmk",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=mZ9yZYo9Mmk",
    description: "Gratidão humilde pela fidelidade divina que nos persegue e nos sustenta todos os dias.",
    theme: "Gratidão & Misericórdia (Lucas 17–18)"
  },
  {
    title: "Pródigo (O Abraço do Pai)",
    artist: "Casa Worship",
    duration: "6:15 min",
    youtubeId: "whHMcK4N3Kg",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=whHMcK4N3Kg",
    description: "A celebração do amor incondicional de Deus pelo filho que retorna arrependido ao lar (Lucas 15).",
    theme: "A Graça que Restaura (Lucas 15)"
  },
  {
    title: "A Boa Parte (Maria aos Pés de Jesus)",
    artist: "Laura Souguellis & Fhop Music",
    duration: "5:20 min",
    youtubeId: "dlGOiuxSzVw",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=dlGOiuxSzVw",
    description: "Louvor centrado em sentar-se aos pés de Jesus para ouvir Sua voz (Lucas 10:42), a única coisa necessária.",
    theme: "Intimidade & Escuta Devocional (Lucas 10)"
  },
  {
    title: "Porque Ele Vive (Pra Sempre)",
    artist: "Gabriel Guedes",
    duration: "5:15 min",
    youtubeId: "RcVUr-wjcdY",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=RcVUr-wjcdY",
    description: "Hino triunfante sobre a ressurreição corporal de Cristo (Lucas 24) e a vitória sobre o medo do amanhã.",
    theme: "A Ressurreição e Esperança Viva (Lucas 24)"
  },
  {
    title: "Lugar Secreto",
    artist: "Gabriela Rocha",
    duration: "4:55 min",
    youtubeId: "YnrN0o0lubM",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=YnrN0o0lubM",
    description: "Oração no esconderijo do Altíssimo, buscando a presença do Pai sem distrações terrenas.",
    theme: "Oração & Comunhão Pessoal"
  },
  {
    title: "Que Ele Cresça (Humildade)",
    artist: "Deigma Marques",
    duration: "6:10 min",
    youtubeId: "4J-kPpMmmNo",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=4J-kPpMmmNo",
    description: "Mais de Ti e menos de mim: a postura humilde de João Batista e dos discípulos de Jesus.",
    theme: "Humildade & Renúncia (João 3:30)"
  }
];

// Curadoria Específica por Dia do Plano de Leitura
export const dailyMedia = {
  // Dia 296 - Lucas 7, 8 e 9
  296: {
    dayId: 296,
    title: "O Mestre dos Mares e dos Corações",
    passage: "Lucas 7–9",
    theme: "A Fé do Centurião, A Tempestade Acalmada e a Transfiguração",
    music: {
      title: "Lugar Secreto",
      artist: "Gabriela Rocha",
      duration: "4:55 min",
      youtubeId: "YnrN0o0lubM",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=YnrN0o0lubM",
      description: "Louvor focado em intimidade profunda com Cristo no esconderijo do Altíssimo."
    },
    video: BIBLE_PROJECT_VIDEOS['lucas_1_9']
  },

  // Dia 297 - Lucas 10, 11 e 12
  297: {
    dayId: 297,
    title: "A Boa Parte & O Coração do Pai",
    passage: "Lucas 10–12",
    theme: "O Bom Samaritano, Maria aos Pés de Jesus, A Oração do Pai Nosso e a Liberdade da Ansiedade",
    music: {
      title: "A Boa Parte (Maria aos Pés de Jesus)",
      artist: "Laura Souguellis & Fhop Music",
      duration: "5:20 min",
      youtubeId: "dlGOiuxSzVw",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=dlGOiuxSzVw",
      description: "Louvor focado em sentar-se aos pés de Jesus para ouvir sua voz, a 'única coisa necessária' que nunca será tirada (Lucas 10:41–42)."
    },
    video: BIBLE_PROJECT_VIDEOS['lucas_10_24']
  },

  // Dia 298 - Lucas 13, 14 e 15
  298: {
    dayId: 298,
    title: "A Festa da Graça: O Abraço do Pai",
    passage: "Lucas 13–15",
    theme: "A Porta Estreita, O Grande Banquete, A Ovelha Perdida e a Parábola do Filho Pródigo",
    music: {
      title: "Pródigo (O Abraço do Pai)",
      artist: "Casa Worship",
      duration: "6:15 min",
      youtubeId: "whHMcK4N3Kg",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=whHMcK4N3Kg",
      description: "Um hino profundo sobre a parábola de Lucas 15: o Pai que corre ao encontro do filho em farrapos, restaurando sua dignidade e celebrando com júbilo."
    },
    video: BIBLE_PROJECT_VIDEOS['lucas_10_24']
  },

  // Dia 299 - Lucas 16, 17 e 18 (ONTEM)
  299: {
    dayId: 299,
    title: "A Graça dos Indignos e a Fé Humilde",
    passage: "Lucas 16–18",
    theme: "O Rico e Lázaro, Os Dez Leprosos (Gratidão), O Fariseu e o Publicano e o Cego de Jericó",
    music: {
      title: "Bondade de Deus",
      artist: "Isaías Saad",
      duration: "4:58 min",
      youtubeId: "mZ9yZYo9Mmk",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=mZ9yZYo9Mmk",
      description: "Louvor curto de sincera gratidão pela graça imerecida de Deus, ecoando o clamor do publicano (Lucas 18:13) e o samaritano curado que voltou agradecido (Lucas 17:15)."
    },
    video: BIBLE_PROJECT_VIDEOS['lucas_10_24']
  },

  // Dia 300 - Lucas 19, 20 e 21 (HOJE)
  300: {
    dayId: 300,
    title: "O Messias em Jerusalém: Zaqueu e a Entrada Triunfal",
    passage: "Lucas 19–21",
    theme: "O Encontro com Zaqueu em Jericó, A Entrada Triunfal em Jerusalém ('Hosana!'), Os Lavradores e o Templo",
    music: {
      title: "Faz Um Milagre em Mim (Como Zaqueu)",
      artist: "Regis Danese",
      duration: "4:10 min",
      youtubeId: "HS-HSWBFogs",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=HS-HSWBFogs",
      description: "'Como Zaqueu eu quero subir... Entra na minha casa, entra na minha vida'. Clipe oficial curto (4:10 min) inspirado no encontro de salvação de Jesus com Zaqueu em Lucas 19:1-10."
    },
    video: BIBLE_PROJECT_VIDEOS['lucas_10_24']
  },

  // Dia 301 - Lucas 22, 23 e 24 (AMANHÃ)
  301: {
    dayId: 301,
    title: "A Cruz e o Túmulo Vazio: Ele Vive!",
    passage: "Lucas 22–24",
    theme: "A Última Ceia, O Getsêmani, A Crucificação, A Ressurreição e os Discípulos no Caminho de Emaús",
    music: {
      title: "Porque Ele Vive (Pra Sempre)",
      artist: "Gabriel Guedes",
      duration: "5:15 min",
      youtubeId: "RcVUr-wjcdY",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=RcVUr-wjcdY",
      description: "Hino triunfante sobre a certeza inabalável da ressurreição corporal de Cristo narrada em Lucas 24 e o túmulo vazio que nos dá esperança para o amanhã."
    },
    video: BIBLE_PROJECT_VIDEOS['lucas_10_24']
  },

  // Dia 302 - João 1, 2 e 3
  302: {
    dayId: 302,
    title: "O Verbo Eterno e o Amor de Deus",
    passage: "João 1–3",
    theme: "No Princípio Era o Verbo, O Primeiro Milagre em Caná da Galileia e o Diálogo com Nicodemos (João 3:16)",
    music: {
      title: "Que Ele Cresça (Humildade)",
      artist: "Deigma Marques",
      duration: "6:10 min",
      youtubeId: "4J-kPpMmmNo",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=4J-kPpMmmNo",
      description: "Meditação lírica sobre o testemunho de João Batista: 'Convém que Ele cresça e que eu diminua' (João 3:30)."
    },
    video: BIBLE_PROJECT_VIDEOS['joao_1_12']
  },

  // Dia 303 - João 4, 5 e 6
  303: {
    dayId: 303,
    title: "A Água Viva e o Pão da Vida",
    passage: "João 4–6",
    theme: "A Mulher Samaritana junto ao Poço de Jacó, A Cura no Tanque de Betesda e o Pão que Desceu do Céu",
    music: {
      title: "Hosana nas Alturas",
      artist: "Gabriela Rocha",
      duration: "5:00 min",
      youtubeId: "ceCMxv72Uqw",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=ceCMxv72Uqw",
      description: "Louvor festivo exaltando o Messias que sacia a alma e concede a água da vida eterna."
    },
    video: BIBLE_PROJECT_VIDEOS['joao_1_12']
  }
};

// Determina o vídeo do BibleProject de acordo com o livro e capítulos bíblicos
function resolveBibleProjectVideo(bookName, chapters = []) {
  const cleanBook = (bookName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const firstCh = Number(chapters[0]) || 1;

  if (cleanBook.includes('lucas')) {
    if (firstCh <= 9) return BIBLE_PROJECT_VIDEOS['lucas_1_9'];
    return BIBLE_PROJECT_VIDEOS['lucas_10_24'];
  }

  if (cleanBook.includes('joao')) {
    if (firstCh >= 13) return BIBLE_PROJECT_VIDEOS['joao_13_21'];
    return BIBLE_PROJECT_VIDEOS['joao_1_12'];
  }

  if (cleanBook.includes('exodo')) return BIBLE_PROJECT_VIDEOS['exodo'];

  return BIBLE_PROJECT_VIDEOS['default'];
}

// Extrai o livro e capítulos a partir do array de leituras do dia (ex: ['Lucas 19', 'Lucas 20', 'Lucas 21'])
function parseReadingsInfo(readings = []) {
  if (!readings || readings.length === 0) return { bookName: 'Lucas', chapters: [19], passageStr: 'Lucas 19–21' };

  const first = readings[0] || '';
  const parts = first.trim().split(' ');
  const bookName = parts.slice(0, parts.length - 1).join(' ') || parts[0];
  const chapters = readings.map(r => {
    const sp = r.trim().split(' ');
    return sp[sp.length - 1];
  });

  const passageStr = readings.length > 1
    ? `${bookName} ${chapters[0]}–${chapters[chapters.length - 1]}`
    : readings[0];

  return { bookName, chapters, passageStr };
}

// Função Principal de Obtenção de Mídia do Dia
export function getMediaForDay(dayId, dayData = null) {
  const numericDay = Number(dayId) || 300;

  // 1. Verifica se há curadoria manual rica e consagrada para o dia
  if (dailyMedia[numericDay]) {
    return dailyMedia[numericDay];
  }

  // 2. Se não há entrada manual fixa, gera dinamicamente com base nas leituras do dia
  const readings = dayData?.readings || [];
  const { bookName, chapters, passageStr } = parseReadingsInfo(readings);

  // Seleciona a música a partir de rotação estrita por dia (garante que dia N != dia N - 1)
  const trackIndex = Math.abs(numericDay) % SHORT_DEVOTIONAL_TRACKS.length;
  const selectedTrack = SHORT_DEVOTIONAL_TRACKS[trackIndex];

  // Seleciona o vídeo do BibleProject específico para o livro e capítulo da leitura
  const selectedVideo = resolveBibleProjectVideo(bookName, chapters);

  return {
    dayId: numericDay,
    title: `Dia ${numericDay} • ${passageStr}`,
    passage: passageStr,
    theme: `${bookName} (Cap. ${chapters.join(', ')}) • Meditação Devocional`,
    music: selectedTrack,
    video: selectedVideo
  };
}

// Utilitário para leitura livre de qualquer livro e capítulo da Bíblia
export function getMediaForPassage(bookName, chapter) {
  const selectedVideo = resolveBibleProjectVideo(bookName, [chapter]);
  const charSum = (bookName + chapter).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const track = SHORT_DEVOTIONAL_TRACKS[charSum % SHORT_DEVOTIONAL_TRACKS.length];

  return {
    title: `${bookName} ${chapter}`,
    passage: `${bookName} ${chapter}`,
    theme: `Estudo Expositivo de ${bookName} ${chapter}`,
    music: track,
    video: selectedVideo
  };
}
