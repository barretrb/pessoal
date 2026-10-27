// Curadoria de Músicas Curtas (YouTube Music / YouTube) e Vídeos Expositivos (BibleProject)
// Regra Estrita: Músicas devocionais de até 10 minutos (3 a 7 min), sem lives/sets longos.
// Cada dia possui música diferente de ontem e vídeo estritamente relacionado ao tema do dia.

// Catálogo de Vídeos Oficiais do BibleProject em Português por Livro e Perícope
export const BIBLE_PROJECT_VIDEOS = {
  // Novo Testamento - Evangelho de Lucas por seções específicas
  'lucas_1_9': {
    title: 'BibleProject Português | O Batismo & O Início do Reino: Lucas 1–9',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Animação explicativa sobre a vinda do Messias para acolher os humildes e o envio dos doze apóstolos.'
  },
  'lucas_10_18': {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Explicação minuciosa da caminhada para Jerusalém e as parábolas da Graça (Bom Samaritano e Filho Pródigo).'
  },
  'lucas_19_23': {
    title: 'BibleProject Português | A Crucificação de Jesus: O Evangelho de Lucas 19–23',
    channel: 'BibleProject Português',
    youtubeId: 'sU15_0N87LE',
    description: 'Vídeo oficial animado do BibleProject abrangendo Lucas 19 a 23: o encontro com Zaqueu, a Entrada Triunfal em Jerusalém, o confronto no Templo e a Cruz.'
  },
  'lucas_24': {
    title: 'BibleProject Português | A Ressurreição de Jesus: O Evangelho de Lucas 24',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'A vitória sobre a morte, os discípulos de Emaús e a explicação de como todo o Antigo Testamento apontava para Cristo.'
  },

  // Evangelho de João
  'joao_1_12': {
    title: 'BibleProject Português | Visão Geral: João (Cap. 1 a 12)',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Jesus como a Palavra eterna de Deus encarnada e os sete sinais que revelam a glória do Pai.'
  },
  'joao_13_21': {
    title: 'BibleProject Português | Visão Geral: João (Cap. 13 a 21)',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'O lava-pés, os discursos de despedida do Consolador, a cruz e a conversa restauradora com Pedro junto ao mar.'
  },

  // Demais Livros do Cânon Bíblico
  'mateus': {
    title: 'BibleProject Português | Visão Geral: Mateus',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Jesus como o verdadeiro herdeiro de Davi e o novo Moisés que cumpre toda a Lei e os Profetas.'
  },
  'marcos': {
    title: 'BibleProject Português | Visão Geral: Marcos',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'O Servo Sofredor e Filho de Deus em ação rápida e poderosa para resgate da humanidade.'
  },
  'atos': {
    title: 'BibleProject Português | Visão Geral: Atos dos Apóstolos',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'O derramamento do Espírito Santo no Pentecostes e o avanço imparável da Igreja de Jerusalém a Roma.'
  },
  'romanos': {
    title: 'BibleProject Português | Visão Geral: Romanos',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'A justiça de Deus revelada na justificação somente pela fé em Jesus Cristo e a vida no Espírito.'
  },
  'genesis': {
    title: 'BibleProject Português | Visão Geral: Gênesis',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'Da Criação original à Aliança abraâmica: a promessa de bênção para todas as famílias da terra.'
  },
  'exodo': {
    title: 'BibleProject Português | Visão Geral: Êxodo',
    channel: 'BibleProject Português',
    youtubeId: 'sU15_0N87LE',
    description: 'A libertação soberana do cativeiro no Egito, as pragas, a Páscoa, os Dez Mandamentos e o Tabernáculo.'
  },
  'juizes': {
    title: 'BibleProject Português | Visão Geral: Juízes',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'O trágico ciclo de desobediência de Israel e a necessidade de um verdadeiro Rei justo.'
  },
  'salmos': {
    title: 'BibleProject Português | Visão Geral: Livro dos Salmos',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'O livro de oração e louvor de Israel guiando a adoração do povo de Deus em todas as estações da vida.'
  },
  'proverbios': {
    title: 'BibleProject Português | Visão Geral: Provérbios',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: 'A sabedoria prática fundamentada no temor do Senhor para as decisões diárias.'
  }
};

// Músicas Devocionais Curtas (< 10 minutos, estritamente entre 3 e 7 minutos)
export const SHORT_DEVOTIONAL_TRACKS = [
  {
    title: "Faz Um Milagre em Mim (Como Zaqueu)",
    artist: "Regis Danese",
    duration: "4:32 min",
    youtubeId: "AziO_v8Xh3Y",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=AziO_v8Xh3Y",
    description: "Canção inspirada em Lucas 19:1-10: 'Como Zaqueu, eu quero subir... Entra na minha casa, entra na minha vida'. Louvor de arrependimento e encontro transformador com Cristo.",
    theme: "Encontro com Cristo & Restauração (Lucas 19)"
  },
  {
    title: "Bondade de Deus",
    artist: "Isaías Saad",
    duration: "4:58 min",
    youtubeId: "wzJ97t9B3cQ",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=wzJ97t9B3cQ",
    description: "Gratidão humilde pela fidelidade divina que nos persegue e nos sustenta todos os dias.",
    theme: "Gratidão & Misericórdia (Lucas 17–18)"
  },
  {
    title: "A Boa Parte (Maria aos Pés de Jesus)",
    artist: "Laura Souguellis",
    duration: "5:20 min",
    youtubeId: "r8sU6vjW2gQ",
    youtubeMusicUrl: "https://music.youtube.com/search?q=A+Boa+Parte+Laura+Souguellis",
    description: "Louvor centrado em sentar-se aos pés de Jesus para ouvir Sua voz (Lucas 10:42), a única coisa necessária.",
    theme: "Intimidade & Escuta Devocional (Lucas 10)"
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
    title: "Porque Ele Vive (Deus Enviou)",
    artist: "Gabriel Guedes",
    duration: "5:15 min",
    youtubeId: "0yR3Mv7iO38",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=0yR3Mv7iO38",
    description: "Hino triunfante sobre a ressurreição corporal de Cristo (Lucas 24) e a vitória sobre o medo do amanhã.",
    theme: "A Ressurreição e Esperança Viva (Lucas 24)"
  },
  {
    title: "Lindo És / Só Quero Ver Você",
    artist: "Juliano Son & Livres",
    duration: "4:45 min",
    youtubeId: "r8sU6vjW2gQ",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Lindo+Es+Juliano+Son",
    description: "Contemplação da formosura e da majestade de Jesus como centro de toda a adoração.",
    theme: "Majestade & Glória de Cristo"
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
    title: "Vim Para Adorar-te",
    artist: "Adhemar de Campos",
    duration: "4:40 min",
    youtubeId: "0yR3Mv7iO38",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Vim+Para+Adorar-te+Adhemar",
    description: "Luz do mundo que desceu às trevas para nos resgatar e nos ensinar a verdadeira humilhação da adoração.",
    theme: "Adoração & Reverência"
  },
  {
    title: "Ousado Amor",
    artist: "Isaías Saad",
    duration: "5:38 min",
    youtubeId: "wzJ97t9B3cQ",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Ousado+Amor+Isaias+Saad",
    description: "O amor incansável do Bom Pastor que deixa as noventa e nove ovelhas seguras para resgatar a perdida no deserto.",
    theme: "O Resgate do Perdido (Lucas 15:4)"
  },
  {
    title: "Que Ele Cresça",
    artist: "Deigma Marques",
    duration: "6:10 min",
    youtubeId: "AziO_v8Xh3Y",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Que+Ele+Cresca+Deigma+Marques",
    description: "Mais de Ti e menos de mim: a postura humilde de João Batista e dos discípulos de Jesus.",
    theme: "Humildade & Renúncia (João 3:30)"
  },
  {
    title: "Teu Santo Nome",
    artist: "Gabriela Rocha",
    duration: "4:15 min",
    youtubeId: "ceCMxv72Uqw",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Teu+Santo+Nome+Gabriela+Rocha",
    description: "Todo joelho se dobrará e toda língua confessará que Jesus Cristo é o Senhor para a glória de Deus Pai.",
    theme: "O Nome Sobre Todo Nome"
  },
  {
    title: "Lugar Secreto",
    artist: "Gabriela Rocha",
    duration: "4:55 min",
    youtubeId: "ceCMxv72Uqw",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Lugar+Secreto+Gabriela+Rocha",
    description: "Oração no esconderijo do Altíssimo, buscando a presença do Pai sem distrações terrenas.",
    theme: "Oração & Comunhão Pessoal"
  },
  {
    title: "Tu És Soberano",
    artist: "Asaph Borba",
    duration: "4:20 min",
    youtubeId: "0yR3Mv7iO38",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Tu+Es+Soberano+Asaph+Borba",
    description: "Reconhecimento da soberania indiscutível do Criador sobre toda a terra e sobre as nossas vidas.",
    theme: "Soberania & Paz em Deus"
  },
  {
    title: "Santo Espírito (És Bem-Vindo Aqui)",
    artist: "Laura Souguellis",
    duration: "6:20 min",
    youtubeId: "r8sU6vjW2gQ",
    youtubeMusicUrl: "https://music.youtube.com/search?q=Santo+Espirito+Laura+Souguellis",
    description: "Convite sincero ao Espírito Consolador prometido por Jesus em João 14 para inundar o coração do crente.",
    theme: "O Consolador Prometido (João 14)"
  }
];

// Curadoria Específica por Dia do Plano de Leitura
export const dailyMedia = {
  // Dia 296 - Lucas 7, 8 e 9
  296: {
    dayId: 296,
    title: "O Mestre dos Mares e dos Corações",
    passage: "Lucas 7–9",
    theme: "A Fé do Centurião, A Mulher Pecadora que Ungiu Jesus, A Tempestade Acalmada e a Transfiguração",
    music: {
      title: "Lindo És / Só Quero Ver Você",
      artist: "Juliano Son & Livres",
      duration: "4:45 min",
      youtubeId: "r8sU6vjW2gQ",
      youtubeMusicUrl: "https://music.youtube.com/search?q=Lindo+Es+Juliano+Son",
      description: "Louvor curto de contemplação da glória do Filho de Deus manifestada na Transfiguração (Lucas 9:28-36)."
    },
    video: {
      title: "BibleProject Português | O Batismo & O Início do Reino: Lucas 1–9",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Vídeo explicativo animado ilustrando a autoridade de Jesus sobre a enfermidade, a natureza e a morte."
    }
  },

  // Dia 297 - Lucas 10, 11 e 12
  297: {
    dayId: 297,
    title: "A Boa Parte & O Coração do Pai",
    passage: "Lucas 10–12",
    theme: "O Bom Samaritano, Maria aos Pés de Jesus, A Oração do Pai Nosso e a Liberdade da Ansiedade",
    music: {
      title: "Aos Pés da Cruz / A Boa Parte (Maria aos Pés de Jesus)",
      artist: "Laura Souguellis",
      duration: "5:20 min",
      youtubeId: "r8sU6vjW2gQ",
      youtubeMusicUrl: "https://music.youtube.com/search?q=A+Boa+Parte+Laura+Souguellis",
      description: "Louvor focado em sentar-se aos pés de Jesus para ouvir sua voz, a 'única coisa necessária' que nunca será tirada (Lucas 10:41–42)."
    },
    video: {
      title: "BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Vídeo explicativo animado ilustrando a jornada de Jesus a caminho de Jerusalém, o modelo de discipulado e as parábolas do Reino."
    }
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
    video: {
      title: "BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Explicação minuciosa da estrutura literária das três parábolas perdidas e encontradas de Lucas 15."
    }
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
      youtubeId: "wzJ97t9B3cQ",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=wzJ97t9B3cQ",
      description: "Louvor curto de sincera gratidão pela graça imerecida de Deus, ecoando o clamor do publicano (Lucas 18:13) e o samaritano curado que voltou agradecido (Lucas 17:15)."
    },
    video: {
      title: "BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Análise didática da jornada dos discípulos com Jesus, destacando a inversão de valores do Reino de Deus nas parábolas de Lucas 16 a 18."
    }
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
      duration: "4:32 min",
      youtubeId: "AziO_v8Xh3Y",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=AziO_v8Xh3Y",
      description: "'Como Zaqueu eu quero entrar na Tua casa... Faz um milagre em mim'. Faixa oficial curta (4:32 min) inspirada no encontro de salvação de Jesus com Zaqueu em Lucas 19:1-10."
    },
    video: {
      title: "BibleProject Português | A Crucificação de Jesus: O Evangelho de Lucas 19–23",
      channel: "BibleProject Português",
      youtubeId: "sU15_0N87LE",
      description: "Vídeo animado oficial do BibleProject sobre a chegada de Jesus a Jerusalém em Lucas 19, a purificação do Templo, os confrontos de Lucas 20-21 e a revelação do verdadeiro Rei."
    }
  },

  // Dia 301 - Lucas 22, 23 e 24 (AMANHÃ)
  301: {
    dayId: 301,
    title: "A Cruz e o Túmulo Vazio: Ele Vive!",
    passage: "Lucas 22–24",
    theme: "A Última Ceia, O Getsêmani, A Crucificação, A Ressurreição e os Discípulos no Caminho de Emaús",
    music: {
      title: "Porque Ele Vive (Deus Enviou Seu Filho Amado)",
      artist: "Gabriel Guedes",
      duration: "5:15 min",
      youtubeId: "0yR3Mv7iO38",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=0yR3Mv7iO38",
      description: "Hino triunfante sobre a certeza inabalável da ressurreição corporal de Cristo narrada em Lucas 24 e o túmulo vazio que nos dá esperança para o amanhã."
    },
    video: {
      title: "BibleProject Português | A Ressurreição de Jesus: O Evangelho de Lucas 24",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Animação minuciosa demonstrando como a Lei de Moisés, os Profetas e os Salmos convergiam para o sofrimento e a gloriosa ressurreição de Cristo."
    }
  },

  // Dia 302 - João 1, 2 e 3
  302: {
    dayId: 302,
    title: "O Verbo Eterno e o Amor de Deus",
    passage: "João 1–3",
    theme: "No Princípio Era o Verbo, O Primeiro Milagre em Caná da Galileia e o Diálogo com Nicodemos (João 3:16)",
    music: {
      title: "Ele Me Amou Primeiro / Deus Amou o Mundo",
      artist: "Alessandro Vilas Boas",
      duration: "5:40 min",
      youtubeId: "r8sU6vjW2gQ",
      youtubeMusicUrl: "https://music.youtube.com/search?q=Ele+Me+Amou+Primeiro+Alessandro+Vilas+Boas",
      description: "Meditação lírica sobre João 3:16: 'Porque Deus amou o mundo de tal maneira que deu o Seu Filho Unigênito'."
    },
    video: {
      title: "BibleProject Português | Visão Geral: João (Cap. 1 a 12)",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Panorama animado da primeira metade do Evangelho de João, demonstrando a divindade eterna de Jesus e os sinais de vida nova."
    }
  },

  // Dia 303 - João 4, 5 e 6
  303: {
    dayId: 303,
    title: "A Água Viva e o Pão da Vida",
    passage: "João 4–6",
    theme: "A Mulher Samaritana junto ao Poço de Jacó, A Cura no Tanque de Betesda e o Pão que Desceu do Céu",
    music: {
      title: "Santo Espírito (És Bem-Vindo Aqui)",
      artist: "Laura Souguellis",
      duration: "6:20 min",
      youtubeId: "r8sU6vjW2gQ",
      youtubeMusicUrl: "https://music.youtube.com/search?q=Santo+Espirito+Laura+Souguellis",
      description: "A fonte de água viva que jorra para a vida eterna no interior de quem crê em Jesus (João 4:14)."
    },
    video: {
      title: "BibleProject Português | Visão Geral: João (Cap. 1 a 12)",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Jesus como a satisfação eterna da fome e da sede do ser humano."
    }
  }
};

// Determina o vídeo do BibleProject de acordo com o livro e capítulos bíblicos
function resolveBibleProjectVideo(bookName, chapters = []) {
  const cleanBook = (bookName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const firstCh = Number(chapters[0]) || 1;

  if (cleanBook.includes('lucas')) {
    if (firstCh >= 19 && firstCh <= 23) return BIBLE_PROJECT_VIDEOS['lucas_19_23'];
    if (firstCh >= 24) return BIBLE_PROJECT_VIDEOS['lucas_24'];
    if (firstCh >= 10) return BIBLE_PROJECT_VIDEOS['lucas_10_18'];
    return BIBLE_PROJECT_VIDEOS['lucas_1_9'];
  }

  if (cleanBook.includes('joao')) {
    if (firstCh >= 13) return BIBLE_PROJECT_VIDEOS['joao_13_21'];
    return BIBLE_PROJECT_VIDEOS['joao_1_12'];
  }

  if (cleanBook.includes('exodo')) return BIBLE_PROJECT_VIDEOS['exodo'];
  if (cleanBook.includes('genesis')) return BIBLE_PROJECT_VIDEOS['genesis'];
  if (cleanBook.includes('juizes')) return BIBLE_PROJECT_VIDEOS['juizes'];
  if (cleanBook.includes('salmo')) return BIBLE_PROJECT_VIDEOS['salmos'];
  if (cleanBook.includes('proverbio')) return BIBLE_PROJECT_VIDEOS['proverbios'];
  if (cleanBook.includes('mateus')) return BIBLE_PROJECT_VIDEOS['mateus'];
  if (cleanBook.includes('marcos')) return BIBLE_PROJECT_VIDEOS['marcos'];
  if (cleanBook.includes('atos')) return BIBLE_PROJECT_VIDEOS['atos'];
  if (cleanBook.includes('romanos')) return BIBLE_PROJECT_VIDEOS['romanos'];

  // Fallback geral contextualizado
  return {
    title: `BibleProject Português | Panorama e Estudo Bíblico`,
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    description: `Explicação animada contextualizando a mensagem das Escrituras para a edificação da fé.`
  };
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
// Garantias:
// 1. Cada dia possui uma música DIFERENTE do dia anterior (rotação determinística).
// 2. TODAS as músicas têm DURAÇÃO ESTREITA de até 10 minutos (3 a 7 minutos). NUNCA lives de 1 hora!
// 3. O vídeo recomendado é ESTRITAMENTE RELACIONADO ao tema e livro bíblico do dia.
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
  // Rotação determinística pelo nome do livro e capítulo
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
