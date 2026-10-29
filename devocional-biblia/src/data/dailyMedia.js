// Curadoria de Músicas de Estúdio (YouTube Music / YouTube) e Vídeos Expositivos (BibleProject)
// Regra Estrita:
// 1. Somente faixas de estúdio (gravação em estúdio / álbum de estúdio, SEM gravações ao vivo/shows).
// 2. Artistas da curadoria preferida do usuário: Os Arrais, Projeto Sola, Leonardo Gonçalves, Marcos Almeida,
//    Vocal Livre, Eli Soares, Paulo César Baruk, Oficina G3, Mauro Henrique, Felipe Valente, Alexandre Magnani,
//    Coletivo Candieiro, Purples, PG, Fruto Sagrado, Novo Canto, Fernandinho, Thalles Roberto, Morada.
// 3. Duração estritamente inferior a 10 minutos (entre 3 e 6 minutos).
// 4. Todos os IDs verificados via oEmbed e disponíveis diretamente no YouTube Music.

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

// Músicas Devocionais de Estúdio (< 10 minutos) dos Artistas Preferidos
export const SHORT_DEVOTIONAL_TRACKS = [
  {
    title: "Esperança",
    artist: "Os Arrais",
    duration: "4:24 min",
    youtubeId: "eDflquxhedQ",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=eDflquxhedQ",
    album: "As Canções da Terra (Estúdio)",
    description: "Canção reflexiva de estúdio sobre a esperança eterna em Cristo, a graça que sustenta e a caminhada cristã.",
    theme: "Esperança & Confiança Soberana"
  },
  {
    title: "Colossenses 1",
    artist: "Projeto Sola",
    duration: "4:47 min",
    youtubeId: "gk7XWCMwO94",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=gk7XWCMwO94",
    album: "Single de Estúdio",
    description: "Meditação lírica sobre a supremacia e primazia absoluta de Cristo: 'Ele é o princípio, o primogênito dentre os mortos'.",
    theme: "A Primazia de Cristo (João 1 / Colossenses 1)"
  },
  {
    title: "Getsêmani",
    artist: "Leonardo Gonçalves",
    duration: "5:09 min",
    youtubeId: "edGwczJm_uo",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=edGwczJm_uo",
    album: "Poemas e Canções (Estúdio)",
    description: "Gravação clássica de estúdio que retrata o mistério e a agonia de Cristo em oração no Jardim do Getsêmani.",
    theme: "Oração, Entrega e Redenção (Lucas 22)"
  },
  {
    title: "Vem Me Socorrer",
    artist: "Marcos Almeida",
    duration: "4:18 min",
    youtubeId: "_kAVIQzwffg",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=_kAVIQzwffg",
    album: "Eu Sarau (Estúdio)",
    description: "Canção poética e intimista de clamor pela graça e dependência de Deus em meio às fraquezas humanas.",
    theme: "Graça dos Humildes & Dependência Divina"
  },
  {
    title: "A Começar em Mim",
    artist: "Vocal Livre",
    duration: "3:50 min",
    youtubeId: "nDXqNTyNC7A",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=nDXqNTyNC7A",
    album: "Por Toda a Terra (Estúdio)",
    description: "Harmonia vocal impecável de estúdio chamando à transformação interior genuína e discipulado prático.",
    theme: "Transformação Interior & Humildade"
  },
  {
    title: "Me Ajude a Melhorar",
    artist: "Eli Soares",
    duration: "4:35 min",
    youtubeId: "lclKOqYuvug",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=lclKOqYuvug",
    album: "Casa de Deus (Estúdio)",
    description: "Oração de estúdio sincera por quebrantamento: 'Meu coração é tão pequeno, me ajude a melhorar'.",
    theme: "Quebrantamento & Renovação Diária"
  },
  {
    title: "Jardim da Inocência",
    artist: "Paulo César Baruk",
    duration: "4:52 min",
    youtubeId: "bi9W6oZzfxk",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=bi9W6oZzfxk",
    album: "Graça (Estúdio)",
    description: "Gravação de estúdio poética sobre o retorno ao jardim da comunhão íntima e sem reservas com o Criador.",
    theme: "A Graça que Transforma e Reconcilia (Lucas 19)"
  },
  {
    title: "Incondicional",
    artist: "Oficina G3",
    duration: "3:59 min",
    youtubeId: "oYuIZLGrmcg",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=oYuIZLGrmcg",
    album: "Depois da Guerra (Estúdio)",
    description: "Versão oficial de estúdio com melodia reflexiva sobre o amor sacrificial e incondicional do Salvador na cruz.",
    theme: "O Amor Sacrificial de Cristo"
  },
  {
    title: "17 de Janeiro",
    artist: "Os Arrais",
    duration: "4:10 min",
    youtubeId: "iLLydSZOR8k",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=iLLydSZOR8k",
    album: "Mais (Estúdio)",
    description: "Folk reflexivo de estúdio sobre a revelação da graça, a partida do velho homem e o renascer em Deus.",
    theme: "Novo Nascimento & Paz com Deus"
  },
  {
    title: "Isaías 53",
    artist: "Projeto Sola",
    duration: "4:35 min",
    youtubeId: "7clLRGKd1q0",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=7clLRGKd1q0",
    album: "Homem das Dores (Estúdio)",
    description: "Exposição lírica de estúdio sobre a profecia do Servo Sofredor que levou sobre Si as nossas dores.",
    theme: "O Servo Sofredor e a Cruz"
  },
  {
    title: "Pequeninos",
    artist: "Mauro Henrique",
    duration: "3:45 min",
    youtubeId: "qMt6R88UPkQ",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=qMt6R88UPkQ",
    album: "Single de Estúdio",
    description: "Canção intimista de estúdio sobre o Reino dos Céus pertencente aos pequeninos e aos que têm fé simples.",
    theme: "A Simplicidade do Evangelho"
  },
  {
    title: "Despreocupado",
    artist: "Felipe Valente",
    duration: "3:58 min",
    youtubeId: "UZDKMpD-6wY",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=UZDKMpD-6wY",
    album: "Reversão (Estúdio)",
    description: "MPB cristã de estúdio inspirada no Sermão do Monte: confiar na providência divina e descansar da ansiedade.",
    theme: "Descanso da Ansiedade & Providência"
  },
  {
    title: "Ninguém Chega Só",
    artist: "Alexandre Magnani",
    duration: "3:42 min",
    youtubeId: "ToqPLrFb6-I",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=ToqPLrFb6-I",
    album: "O Que Realmente Importa (Estúdio)",
    description: "Melodia leve de estúdio sobre comunidade, amor fraternal e a beleza de caminhar juntos na fé.",
    theme: "Comunhão Fraternal & Unidade"
  },
  {
    title: "Arrastão",
    artist: "Coletivo Candieiro",
    duration: "3:50 min",
    youtubeId: "8AAQzkzfEb4",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=8AAQzkzfEb4",
    album: "Single de Estúdio",
    description: "Folk brasileiro de estúdio que resgata a poesia dos pescadores de homens e o chamado de Cristo.",
    theme: "O Chamado dos Discípulos (Lucas 5)"
  },
  {
    title: "Meu Lugar",
    artist: "Purples",
    duration: "4:30 min",
    youtubeId: "Q4ejKplh_ms",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=Q4ejKplh_ms",
    album: "Single de Estúdio",
    description: "Canção reflexiva de estúdio sobre encontrar o verdadeiro descanso e identidade na presença de Deus.",
    theme: "Descanso & Identidade no Pai"
  },
  {
    title: "Teu Melhor",
    artist: "Purples",
    duration: "4:15 min",
    youtubeId: "fPwhZQgk7Yc",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=fPwhZQgk7Yc",
    album: "Single de Estúdio",
    description: "Meditação lírica de estúdio sobre a entrega completa do coração à vontade sábia do Senhor.",
    theme: "Consagração & Fidelidade"
  },
  {
    title: "Posso Ouvir",
    artist: "PG",
    duration: "4:12 min",
    youtubeId: "9h126QoPIEg",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=9h126QoPIEg",
    album: "Imagem e Semelhança (Estúdio)",
    description: "Versão de estúdio sobre a sensibilidade espiritual para discernir e obedecer à voz de Deus.",
    theme: "Escuta Espiritual & Fé Viva"
  },
  {
    title: "Eu Sou Livre",
    artist: "PG",
    duration: "4:05 min",
    youtubeId: "sA7dygVU09g",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=sA7dygVU09g",
    album: "Eu Sou Livre (Estúdio)",
    description: "Canção de estúdio vibrante sobre a verdadeira liberdade concedida por Cristo.",
    theme: "Liberdade em Cristo"
  },
  {
    title: "O Que Na Verdade Somos",
    artist: "Fruto Sagrado",
    duration: "4:20 min",
    youtubeId: "8MksLBGRUpo",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=8MksLBGRUpo",
    album: "O Que na Verdade Somos (Estúdio)",
    description: "Faixa de estúdio clássica que questiona a hipocrisia e clama por uma fé sincera, transparente e sem máscaras.",
    theme: "Sinceridade de Fé & Verdade Interior"
  },
  {
    title: "O Senhor Logo Vem",
    artist: "Novo Canto",
    duration: "4:45 min",
    youtubeId: "nir1fJ9PGpg",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=nir1fJ9PGpg",
    album: "Gravação de Estúdio",
    description: "Gravação vocal de estúdio harmoniosa anunciando a promessa da volta gloriosa do Messias.",
    theme: "A Bendita Esperança do Retorno de Cristo"
  },
  {
    title: "Galileu",
    artist: "Fernandinho",
    duration: "4:10 min",
    youtubeId: "9YC8iDNpyYU",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=9YC8iDNpyYU",
    album: "Galileu (Clipe Oficial de Estúdio)",
    description: "Canção cristocêntrica de estúdio proclamando o Salvador que caminhou entre nós e transformou a história.",
    theme: "Cristo, o Salvador do Mundo"
  },
  {
    title: "Arde Outra Vez",
    artist: "Thalles Roberto",
    duration: "4:50 min",
    youtubeId: "_pnAJPnp_Jw",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=_pnAJPnp_Jw",
    album: "Saudade (Clipe Oficial de Estúdio)",
    description: "Clamor intimista de estúdio pela chama renovada do primeiro amor e pela presença viva do Espírito Santo.",
    theme: "Primeiro Amor & Renovação Espiritual"
  },
  {
    title: "É Tudo Sobre Você",
    artist: "Morada",
    duration: "4:35 min",
    youtubeId: "ePdRgBWhvog",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=ePdRgBWhvog",
    album: "Gravação de Estúdio",
    description: "Versão de estúdio cristocêntrica afirmando que toda a vida, criação e história convergem para Cristo.",
    theme: "Cristocentralidade Absoluta"
  },
  {
    title: "Emaús",
    artist: "Morada",
    duration: "5:10 min",
    youtubeId: "d7iMVvuZkyg",
    youtubeMusicUrl: "https://music.youtube.com/watch?v=d7iMVvuZkyg",
    album: "Gravação de Estúdio com Poiema Music",
    description: "Canção de estúdio inspirada nos discípulos no caminho de Emaús (Lucas 24): 'Porventura não ardia o nosso coração?'.",
    theme: "O Cristo Ressurreto em Emaús (Lucas 24)"
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
      title: "Getsêmani",
      artist: "Leonardo Gonçalves",
      duration: "5:09 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=edGwczJm_uo",
      album: "Poemas e Canções (Estúdio)",
      description: "Gravação clássica de estúdio que retrata o mistério e a agonia de Cristo em oração no Jardim do Getsêmani."
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
      title: "A Começar em Mim",
      artist: "Vocal Livre",
      duration: "3:50 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=nDXqNTyNC7A",
      album: "Por Toda a Terra (Estúdio)",
      description: "Harmonia vocal de estúdio chamando à transformação interior e pureza de motivações aos pés de Cristo."
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
      title: "Me Ajude a Melhorar",
      artist: "Eli Soares",
      duration: "4:35 min",
      youtubeId: "lclKOqYuvug",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=lclKOqYuvug",
      album: "Casa de Deus (Estúdio)",
      description: "Versão de estúdio de quebrantamento e humildade, expressando o retorno do coração arrependido ao abraço do Pai."
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
      title: "Vem Me Socorrer",
      artist: "Marcos Almeida",
      duration: "4:18 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=_kAVIQzwffg",
      album: "Eu Sarau (Estúdio)",
      description: "Canção de estúdio intimista que traduz o clamor humilde por misericórdia do publicano e a gratidão dos restaurados."
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
      title: "Jardim da Inocência",
      artist: "Paulo César Baruk",
      duration: "4:52 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=bi9W6oZzfxk",
      album: "Graça (Estúdio)",
      description: "Gravação de estúdio poética sobre o encontro transformador da graça de Cristo (Lucas 19) e a reconciliação com o Pai.",
      theme: "A Graça que Transforma e Reconcilia (Lucas 19)"
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
      title: "Emaús",
      artist: "Morada",
      duration: "5:10 min",
      youtubeId: "d7iMVvuZkyg",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=d7iMVvuZkyg",
      album: "Gravação de Estúdio com Poiema Music",
      description: "Canção oficial de estúdio sobre a revelação de Cristo aos discípulos de Emaús após a ressurreição (Lucas 24)."
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
      title: "Colossenses 1",
      artist: "Projeto Sola",
      duration: "4:47 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=gk7XWCMwO94",
      album: "Single de Estúdio",
      description: "Exposição lírica de estúdio sobre Cristo, o Verbo Eterno pelo qual todas as coisas foram criadas (João 1:1–3)."
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
      title: "Esperança",
      artist: "Os Arrais",
      duration: "4:24 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=eDflquxhedQ",
      album: "As Canções da Terra (Estúdio)",
      description: "Folk intimista de estúdio sobre o Messias que sacia a sede da alma com a água da vida eterna."
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
