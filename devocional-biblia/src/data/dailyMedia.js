// Curadoria Dinâmica de Músicas no YouTube Music (https://music.youtube.com/) e Vídeos Expositivos (BibleProject)
// Regras Estritas:
// 1. Busca e reprodução direcionadas especificamente para o https://music.youtube.com/ (não youtube.com comum).
// 2. Não fixar rigidamente: suporta busca dinâmica, rotação entre artistas preferidos e exploração de lançamentos recentes.
// 3. Artistas preferidos incluídos com destaque:
//    - Banda NOVA (IPAlpha)
//    - Novo Canto (IPAlpha)
//    - Os Arrais
//    - Projeto Sola
//    - Leonardo Gonçalves
//    - Marcos Almeida
//    - Paulo César Baruk
//    - Eli Soares
//    - Vocal Livre
//    - Purples
//    - Oficina G3
//    - Fruto Sagrado
//    - PG
//    - Mauro Henrique
//    - Felipe Valente
//    - Alexandre Magnani
//    - Coletivo Candieiro
//    - Morada
//    - Fernandinho
//    - Thalles Roberto

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

// Gera URL de busca dinâmica no YouTube Music (https://music.youtube.com/)
export function getYoutubeMusicSearchUrl(query) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
}

// Lista de Artistas Preferidos para Busca e Rotação Dinâmica no YouTube Music
export const PREFERRED_ARTISTS = [
  {
    id: "banda-nova",
    name: "Banda NOVA (IPAlpha)",
    shortName: "Banda NOVA",
    searchQuery: "Banda NOVA IPAlpha",
    musicSearchUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha"),
    style: "Louvor Contemporâneo & Teologia Cristocêntrica (IPAlpha)",
    sampleTrack: {
      title: "Aqui Vou Eu",
      artist: "Banda NOVA (IPAlpha)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=cGcWmX2Pz0k",
      album: "IPAlpha Nova",
      description: "Ministério jovem da IPAlpha proclamando dependência, graça e envio no Reino de Deus."
    }
  },
  {
    id: "novo-canto",
    name: "Novo Canto (IPAlpha)",
    shortName: "Novo Canto",
    searchQuery: "Novo Canto IPAlpha",
    musicSearchUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha"),
    style: "Louvor Congregacional & Hinos da Fé Reformada (IPAlpha)",
    sampleTrack: {
      title: "Castelo Forte",
      artist: "Novo Canto (IPAlpha)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=RGCzQjFKk2w",
      album: "IPAlpha Música",
      description: "Louvor da IPAlpha resgatando a segurança inabalável do Deus Soberano e Sua Palavra eterna."
    }
  },
  {
    id: "os-arrais",
    name: "Os Arrais",
    shortName: "Os Arrais",
    searchQuery: "Os Arrais estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Os Arrais estúdio"),
    style: "Folk Acústico Reflexivo",
    sampleTrack: {
      title: "Esperança",
      artist: "Os Arrais",
      duration: "4:24 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=eDflquxhedQ",
      album: "As Canções da Terra (Estúdio)",
      description: "Folk reflexivo de estúdio sobre a graça que sustenta e a bendita esperança cristã."
    }
  },
  {
    id: "projeto-sola",
    name: "Projeto Sola",
    shortName: "Projeto Sola",
    searchQuery: "Projeto Sola estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Projeto Sola estúdio"),
    style: "Folk Reformado & Poesia Bíblica",
    sampleTrack: {
      title: "Colossenses 1",
      artist: "Projeto Sola",
      duration: "4:47 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=gk7XWCMwO94",
      album: "Single de Estúdio",
      description: "Meditação lírica sobre a primazia de Cristo, o Verbo pelo qual todas as coisas foram criadas."
    }
  },
  {
    id: "leonardo-goncalves",
    name: "Leonardo Gonçalves",
    shortName: "Leonardo Gonçalves",
    searchQuery: "Leonardo Gonçalves estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Leonardo Gonçalves estúdio"),
    style: "Vocal Clássico & Poemas Sacros",
    sampleTrack: {
      title: "Getsêmani",
      artist: "Leonardo Gonçalves",
      duration: "5:09 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=edGwczJm_uo",
      album: "Poemas e Canções (Estúdio)",
      description: "Gravação de estúdio retratando o Getsêmani e a entrega voluntária do Redentor."
    }
  },
  {
    id: "marcos-almeida",
    name: "Marcos Almeida",
    shortName: "Marcos Almeida",
    searchQuery: "Marcos Almeida estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Marcos Almeida estúdio"),
    style: "MPB Poética da Graça",
    sampleTrack: {
      title: "Vem Me Socorrer",
      artist: "Marcos Almeida",
      duration: "4:18 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=_kAVIQzwffg",
      album: "Eu Sarau (Estúdio)",
      description: "Poesia intimista de clamor por socorro e descanso na fidelidade de Deus."
    }
  },
  {
    id: "paulo-cesar-baruk",
    name: "Paulo César Baruk",
    shortName: "Baruk",
    searchQuery: "Paulo César Baruk estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Paulo César Baruk estúdio"),
    style: "Adoração & Teologia da Graça",
    sampleTrack: {
      title: "Jardim da Inocência",
      artist: "Paulo César Baruk",
      duration: "4:52 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=bi9W6oZzfxk",
      album: "Graça (Estúdio)",
      description: "Gravação de estúdio poética sobre a reconciliação e intimidade restaurada com o Pai."
    }
  },
  {
    id: "eli-soares",
    name: "Eli Soares",
    shortName: "Eli Soares",
    searchQuery: "Eli Soares estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Eli Soares estúdio"),
    style: "Soul & R&B Cristão Devocional",
    sampleTrack: {
      title: "Me Ajude a Melhorar",
      artist: "Eli Soares",
      duration: "4:35 min",
      youtubeId: "lclKOqYuvug",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=lclKOqYuvug",
      album: "Casa de Deus (Estúdio)",
      description: "Oração humilde por transformação de caráter e santificação sincera."
    }
  },
  {
    id: "vocal-livre",
    name: "Vocal Livre",
    shortName: "Vocal Livre",
    searchQuery: "Vocal Livre estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Vocal Livre estúdio"),
    style: "Harmonia Vocal Cristã Contemporânea",
    sampleTrack: {
      title: "A Começar em Mim",
      artist: "Vocal Livre",
      duration: "3:50 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=nDXqNTyNC7A",
      album: "Por Toda a Terra (Estúdio)",
      description: "Arranjos vocais de estúdio convocando à mudança que começa no coração do discípulo."
    }
  },
  {
    id: "purples",
    name: "Purples",
    shortName: "Purples",
    searchQuery: "Banda Purples estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Banda Purples estúdio"),
    style: "Indie Rock Cristão & Meditação",
    sampleTrack: {
      title: "Meu Lugar",
      artist: "Purples",
      duration: "4:30 min",
      youtubeId: "Q4ejKplh_ms",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=Q4ejKplh_ms",
      album: "Single de Estúdio",
      description: "Canção reflexiva de estúdio sobre a segurança e paz encontradas na presença divina."
    }
  },
  {
    id: "oficina-g3",
    name: "Oficina G3",
    shortName: "Oficina G3",
    searchQuery: "Oficina G3 estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Oficina G3 estúdio"),
    style: "Rock / Balada Reflexiva",
    sampleTrack: {
      title: "Incondicional",
      artist: "Oficina G3",
      duration: "3:59 min",
      youtubeId: "oYuIZLGrmcg",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=oYuIZLGrmcg",
      album: "Depois da Guerra (Estúdio)",
      description: "Balada reflexiva sobre o amor incondicional demonstrado na cruz do Calvário."
    }
  },
  {
    id: "fruto-sagrado",
    name: "Fruto Sagrado",
    shortName: "Fruto Sagrado",
    searchQuery: "Fruto Sagrado estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Fruto Sagrado estúdio"),
    style: "Rock Cristão & Letras Profundas",
    sampleTrack: {
      title: "O Que Na Verdade Somos",
      artist: "Fruto Sagrado",
      duration: "4:20 min",
      youtubeId: "8MksLBGRUpo",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=8MksLBGRUpo",
      album: "O Que na Verdade Somos (Estúdio)",
      description: "Canção reflexiva sobre autenticidade espiritual e a busca pela verdade interior."
    }
  },
  {
    id: "pg",
    name: "PG",
    shortName: "PG",
    searchQuery: "Cantor PG estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Cantor PG estúdio"),
    style: "Pop Rock & Adoração Bíblica",
    sampleTrack: {
      title: "Posso Ouvir",
      artist: "PG",
      duration: "4:12 min",
      youtubeId: "9h126QoPIEg",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=9h126QoPIEg",
      album: "Imagem e Semelhança (Estúdio)",
      description: "Clamor por ouvidos sensíveis e coração obediente à direção de Deus."
    }
  },
  {
    id: "mauro-henrique",
    name: "Mauro Henrique",
    shortName: "Mauro Henrique",
    searchQuery: "Mauro Henrique estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Mauro Henrique estúdio"),
    style: "Acústico Intimista & Rock Reflexivo",
    sampleTrack: {
      title: "Pequeninos",
      artist: "Mauro Henrique",
      duration: "3:45 min",
      youtubeId: "qMt6R88UPkQ",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=qMt6R88UPkQ",
      album: "Single de Estúdio",
      description: "Poesia intimista sobre a fé pura e a graça concedida aos pequeninos."
    }
  },
  {
    id: "felipe-valente",
    name: "Felipe Valente",
    shortName: "Felipe Valente",
    searchQuery: "Felipe Valente estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Felipe Valente estúdio"),
    style: "MPB Acústica & Descanso",
    sampleTrack: {
      title: "Despreocupado",
      artist: "Felipe Valente",
      duration: "3:58 min",
      youtubeId: "UZDKMpD-6wY",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=UZDKMpD-6wY",
      album: "Reversão (Estúdio)",
      description: "Canção inspirada no Sermão do Monte sobre descansar da ansiedade nos cuidados do Pai."
    }
  },
  {
    id: "alexandre-magnani",
    name: "Alexandre Magnani",
    shortName: "Alexandre Magnani",
    searchQuery: "Alexandre Magnani estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Alexandre Magnani estúdio"),
    style: "MPB Cristã & Comunhão",
    sampleTrack: {
      title: "Ninguém Chega Só",
      artist: "Alexandre Magnani",
      duration: "3:42 min",
      youtubeId: "ToqPLrFb6-I",
      youtubeMusicUrl: "https://music.youtube.com/watch?to=ToqPLrFb6-I",
      album: "O Que Realmente Importa (Estúdio)",
      description: "Canção calorosa sobre fraternidade, unidade e caminhar juntos na caminhada da fé."
    }
  },
  {
    id: "coletivo-candieiro",
    name: "Coletivo Candieiro",
    shortName: "Coletivo Candieiro",
    searchQuery: "Coletivo Candieiro estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Coletivo Candieiro estúdio"),
    style: "Folk Regional Brasileiro",
    sampleTrack: {
      title: "Arrastão",
      artist: "Coletivo Candieiro",
      duration: "3:50 min",
      youtubeId: "8AAQzkzfEb4",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=8AAQzkzfEb4",
      album: "Single de Estúdio",
      description: "Poesia sonora brasileira celebrando a vocação e o envio dos discípulos de Jesus."
    }
  },
  {
    id: "morada",
    name: "Morada",
    shortName: "Morada",
    searchQuery: "Banda Morada estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Banda Morada estúdio"),
    style: "Adoração Contemporânea",
    sampleTrack: {
      title: "É Tudo Sobre Você",
      artist: "Morada",
      duration: "4:35 min",
      youtubeId: "ePdRgBWhvog",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=ePdRgBWhvog",
      album: "Gravação de Estúdio",
      description: "Declaração cristocêntrica de que toda a criação e vida convergem em Cristo."
    }
  },
  {
    id: "fernandinho",
    name: "Fernandinho",
    shortName: "Fernandinho",
    searchQuery: "Fernandinho estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Fernandinho estúdio"),
    style: "Louvor Cristocêntrico",
    sampleTrack: {
      title: "Galileu",
      artist: "Fernandinho",
      duration: "4:10 min",
      youtubeId: "9YC8iDNpyYU",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=9YC8iDNpyYU",
      album: "Galileu (Clipe de Estúdio)",
      description: "Hino cristocêntrico exaltando o Homem da Galileia que cura, salva e liberta."
    }
  },
  {
    id: "thalles-roberto",
    name: "Thalles Roberto",
    shortName: "Thalles Roberto",
    searchQuery: "Thalles Roberto estúdio",
    musicSearchUrl: getYoutubeMusicSearchUrl("Thalles Roberto estúdio"),
    style: "Gospel Intimista & Adoração",
    sampleTrack: {
      title: "Arde Outra Vez",
      artist: "Thalles Roberto",
      duration: "4:50 min",
      youtubeId: "_pnAJPnp_Jw",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=_pnAJPnp_Jw",
      album: "Saudade (Clipe de Estúdio)",
      description: "Clamor fervoroso pela renovação do primeiro amor e intimidade sincera com Deus."
    }
  }
];

// Músicas Devocionais para Rotação Diária no YouTube Music (< 10 minutos)
export const SHORT_DEVOTIONAL_TRACKS = PREFERRED_ARTISTS.map(artist => ({
  ...artist.sampleTrack,
  theme: `${artist.style} • Sugestão YouTube Music`,
  musicSearchUrl: artist.musicSearchUrl
}));

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
      musicSearchUrl: getYoutubeMusicSearchUrl("Leonardo Gonçalves Getsêmani"),
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
      title: "Aqui Vou Eu",
      artist: "Banda NOVA (IPAlpha)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=cGcWmX2Pz0k",
      musicSearchUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aqui Vou Eu"),
      album: "IPAlpha Nova",
      description: "Louvor da Banda NOVA (IPAlpha) proclamando a entrega aos pés de Cristo e a prontidão para o Reino."
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
      musicSearchUrl: getYoutubeMusicSearchUrl("Eli Soares Me Ajude a Melhorar"),
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
      musicSearchUrl: getYoutubeMusicSearchUrl("Marcos Almeida Vem Me Socorrer"),
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
      musicSearchUrl: getYoutubeMusicSearchUrl("Paulo César Baruk Jardim da Inocência"),
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
      title: "Castelo Forte",
      artist: "Novo Canto (IPAlpha)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=RGCzQjFKk2w",
      musicSearchUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte"),
      album: "IPAlpha Música",
      description: "Louvor congregacional do Novo Canto (IPAlpha) proclamando a vitória eterna do Redentor sobre a morte."
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
      musicSearchUrl: getYoutubeMusicSearchUrl("Projeto Sola Colossenses 1"),
      album: "Single de Estúdio",
      description: "Exposição lírica sobre Cristo, o Verbo Eterno pelo qual todas as coisas foram criadas (João 1:1–3)."
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
      musicSearchUrl: getYoutubeMusicSearchUrl("Os Arrais Esperança"),
      album: "As Canções da Terra (Estúdio)",
      description: "Folk intimista de estúdio sobre o Messias que sacia a sede da alma com a água da vida eterna."
    },
    video: BIBLE_PROJECT_VIDEOS['joao_1_12']
  },

  // Dia 304 - João 7, 8 e 9 (HOJE)
  304: {
    dayId: 304,
    title: "Água Viva, A Luz do Mundo e os Olhos da Fé",
    passage: "João 7–9",
    theme: "A Sede Saciada no Templo, A Graça com a Mulher Perdoada, A Verdade que Liberta e a Cura do Cego de Nascença",
    music: {
      title: "Luz do Mundo",
      artist: "Marcos Almeida",
      duration: "4:10 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Luz do Mundo estudio"),
      musicSearchUrl: getYoutubeMusicSearchUrl("Marcos Almeida Luz do Mundo estudio"),
      album: "Eu Sarau (Estúdio)",
      description: "Inspirado em João 8:12: 'Eu sou a luz do mundo; quem me segue não andará nas trevas, mas terá a luz da vida' — canção de estúdio sobre a luz da graça.",
      theme: "A Luz do Mundo que dissipa a condenação (João 8)"
    },
    video: BIBLE_PROJECT_VIDEOS['joao_1_12']
  },

  // Dia 305 - João 10, 11 e 12
  305: {
    dayId: 305,
    title: "O Bom Pastor e a Ressurreição",
    passage: "João 10–12",
    theme: "O Bom Pastor que dá a vida pelas ovelhas, A Ressurreição de Lázaro e a Unção em Betânia",
    music: {
      title: "O Bom Pastor",
      artist: "Projeto Sola",
      duration: "4:32 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola O Bom Pastor estudio"),
      musicSearchUrl: getYoutubeMusicSearchUrl("Projeto Sola O Bom Pastor estudio"),
      album: "Single de Estúdio",
      description: "Meditação lírica sobre Cristo, o Bom Pastor que cuida, protege e resgata as suas ovelhas (João 10).",
      theme: "O Bom Pastor e as Ovelhas (João 10)"
    },
    video: BIBLE_PROJECT_VIDEOS['joao_1_12']
  },

  // Dia 306 - João 13, 14 e 15
  306: {
    dayId: 306,
    title: "O Lava-pés, O Caminho e a Videira Verdadeira",
    passage: "João 13–15",
    theme: "O Exemplo de Humildade no Lava-pés, O Caminho a Verdade e a Vida e o Mandamento de Permanecer na Videira",
    music: {
      title: "O Caminho, a Verdade e a Vida",
      artist: "Paulo César Baruk",
      duration: "4:40 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk O Caminho a Verdade e a Vida estudio"),
      musicSearchUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk O Caminho a Verdade e a Vida estudio"),
      album: "Graça (Estúdio)",
      description: "Exposição poética baseada em João 14:6: 'Eu sou o caminho, e a verdade, e a vida; ninguém vem ao Pai senão por mim'.",
      theme: "Cristo, o Único Caminho (João 14)"
    },
    video: BIBLE_PROJECT_VIDEOS['joao_13_21']
  },

  // Dia 307 - João 16, 17 e 18
  307: {
    dayId: 307,
    title: "O Consolador, A Oração Sacerdotal e a Entrega",
    passage: "João 16–18",
    theme: "O Espírito da Verdade, A Oração pela Unidade da Igreja e a Prisão no Getsêmani",
    music: {
      title: "Que Sejamos Um",
      artist: "Leonardo Gonçalves",
      duration: "5:00 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Que Sejamos Um estudio"),
      musicSearchUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Que Sejamos Um estudio"),
      album: "Poemas e Canções (Estúdio)",
      description: "Vocal reflexivo traduzindo a oração sacerdotal de Jesus em João 17 pela comunhão e santificação do seu povo.",
      theme: "A Oração Sacerdotal (João 17)"
    },
    video: BIBLE_PROJECT_VIDEOS['joao_13_21']
  },

  // Dia 308 - João 19, 20 e 21
  308: {
    dayId: 308,
    title: "Está Consumado: A Cruz, A Ressurreição e o Amor",
    passage: "João 19–21",
    theme: "A Crucificação no Gólgota, O Túmulo Vazio na Manhã de Páscoa e o Diálogo Restaurador com Pedro",
    music: {
      title: "Está Consumado",
      artist: "Paulo César Baruk",
      duration: "4:35 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Esta Consumado estudio"),
      musicSearchUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Esta Consumado estudio"),
      album: "Graça (Estúdio)",
      description: "Gravação de estúdio celebrando a vitória definitiva da redenção na cruz em João 19:30: 'Está consumado!'.",
      theme: "A Obra Completa da Cruz (João 19)"
    },
    video: BIBLE_PROJECT_VIDEOS['joao_13_21']
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

// Função Principal de Obtenção de Mídia do Dia (com URLs no YouTube Music)
export function getMediaForDay(dayId, dayData = null) {
  const numericDay = Number(dayId) || 300;

  // 1. Verifica se há curadoria manual rica para o dia
  if (dailyMedia[numericDay]) {
    const item = dailyMedia[numericDay];
    return {
      ...item,
      music: {
        ...item.music,
        musicSearchUrl: item.music.musicSearchUrl || getYoutubeMusicSearchUrl(`${item.music.artist} ${item.music.title}`)
      }
    };
  }

  // 2. Se não há entrada manual fixa, gera dinamicamente com base nas leituras do dia
  const readings = dayData?.readings || [];
  const { bookName, chapters, passageStr } = parseReadingsInfo(readings);

  // Seleciona o artista a partir de rotação estrita por dia
  const artistIndex = Math.abs(numericDay) % PREFERRED_ARTISTS.length;
  const artist = PREFERRED_ARTISTS[artistIndex];
  const track = {
    ...artist.sampleTrack,
    theme: `${artist.style} • Sugestão YouTube Music`,
    musicSearchUrl: artist.musicSearchUrl
  };

  // Seleciona o vídeo do BibleProject específico para o livro e capítulo da leitura
  const selectedVideo = resolveBibleProjectVideo(bookName, chapters);

  return {
    dayId: numericDay,
    title: `Dia ${numericDay} • ${passageStr}`,
    passage: passageStr,
    theme: `${bookName} (Cap. ${chapters.join(', ')}) • Meditação Devocional`,
    music: track,
    video: selectedVideo
  };
}

// Utilitário para leitura livre de qualquer livro e capítulo da Bíblia
export function getMediaForPassage(bookName, chapter) {
  const selectedVideo = resolveBibleProjectVideo(bookName, [chapter]);
  const charSum = (bookName + chapter).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const artist = PREFERRED_ARTISTS[charSum % PREFERRED_ARTISTS.length];
  const track = {
    ...artist.sampleTrack,
    theme: `${artist.style} • Estudo de ${bookName} ${chapter}`,
    musicSearchUrl: getYoutubeMusicSearchUrl(`${artist.name} ${bookName} ${chapter}`)
  };

  return {
    title: `${bookName} ${chapter}`,
    passage: `${bookName} ${chapter}`,
    theme: `Estudo Expositivo de ${bookName} ${chapter}`,
    music: track,
    video: selectedVideo
  };
}

// Catálogo Temático de Músicas Conectadas Especificamente ao Texto e Mensagem de Cada Capítulo Bíblico
// Prioriza gravações de estúdio, conexão exegética direta e direcionamento ao YouTube Music (https://music.youtube.com/)
export const THEMATIC_CHAPTER_MUSIC = {
  // === EVANGELHO DE JOÃO (Capítulos 1 a 21) ===
  'João 1': [
    {
      title: "Colossenses 1 / O Verbo Eterno",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:47 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Colossenses 1 estudio"),
      theme: "No Princípio era o Verbo • João 1:1–14",
      description: "Meditação lírica em estúdio sobre a primazia de Cristo, o Verbo eterno pelo qual todas as coisas foram criadas (João 1:1-3)."
    },
    {
      title: "Verbo Vivo",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:25 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Verbo Vivo estudio"),
      theme: "A Palavra que se Fez Carne • João 1:14",
      description: "Louvor congregacional da IPAlpha proclamando a encarnação do Filho de Deus cheio de graça e verdade."
    },
    {
      title: "Eis o Cordeiro de Deus",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:15 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Eis o Cordeiro de Deus estudio"),
      theme: "O Cordeiro que Tira o Pecado • João 1:29",
      description: "Hino da fé reformada exaltando o testemunho de João Batista: 'Eis o Cordeiro de Deus que tira o pecado do mundo'."
    }
  ],
  'João 2': [
    {
      title: "Aqui Vou Eu (Vinho Novo)",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aqui Vou Eu estudio"),
      theme: "As Bodas de Caná & O Primeiro Sinal • João 2",
      description: "Louvor cristocêntrico celebrando a alegria do Reino inaugurado no milagre da transformação da água em vinho."
    },
    {
      title: "Transformação",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:30 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Transformacao estudio"),
      theme: "O Poder Transformador de Cristo • João 2",
      description: "Gravação de estúdio sobre como Cristo renova a nossa história e purifica o templo do nosso coração."
    },
    {
      title: "Zelo Por Tua Casa",
      artist: "Purples",
      album: "Single de Estúdio",
      duration: "4:10 min",
      youtubeId: "Q4ejKplh_ms",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda Purples Zelo Por Tua Casa estudio"),
      theme: "A Purificação do Templo • João 2:13–22",
      description: "Indie reflexivo contemplando a santidade e o zelo ardente do Senhor pela pureza da adoração."
    }
  ],
  'João 3': [
    {
      title: "Amor Sem Igual (João 3:16)",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Amor Sem Igual João 3:16 estudio"),
      theme: "Deus Amou o Mundo de Tal Maneira • João 3:16",
      description: "Hino congregacional baseado em João 3:16 sobre o amor incondicional do Pai entregando o Seu Filho unigênito."
    },
    {
      title: "Nascer de Novo",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "4:40 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Nascer de Novo estudio"),
      theme: "O Diálogo com Nicodemos • João 3:3–8",
      description: "Poema sacro de estúdio sobre a regeneração e o sopro soberano do Espírito que dá vida nova."
    },
    {
      title: "Vento do Espírito",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:15 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Vento do Espirito estudio"),
      theme: "O Vento Sopra Onde Quer • João 3:8",
      description: "Poesia intimista contemplando a ação invisível e transformadora da graça soberana."
    }
  ],
  'João 4': [
    {
      title: "Em Espírito e em Verdade",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:35 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Em Espirito e em Verdade estudio"),
      theme: "A Mulher Samaritana & Adoração • João 4:23–24",
      description: "Louvor sobre os verdadeiros adoradores que o Pai procura, celebrando a adoração que brota de um coração restaurado."
    },
    {
      title: "Água Viva",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:20 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Agua Viva estudio"),
      theme: "A Fonte a Jorrar para a Vida Eterna • João 4:14",
      description: "Folk bíblico contemplando Cristo junto ao poço de Jacó oferecendo a água que sacia para sempre."
    },
    {
      title: "Esperança",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:24 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Esperança estudio"),
      theme: "O Encontro que Restaura • João 4",
      description: "Folk intimista de estúdio sobre a graça que acolhe os marginalizados e restaura a dignidade."
    }
  ],
  'João 5': [
    {
      title: "Me Ajude a Melhorar",
      artist: "Eli Soares",
      album: "Casa de Deus (Estúdio)",
      duration: "4:35 min",
      youtubeId: "lclKOqYuvug",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Eli Soares Me Ajude a Melhorar estudio"),
      theme: "A Cura no Tanque de Betesda • João 5:1–15",
      description: "Oração sincera de quebrantamento e cura, inspirada na compaixão de Jesus pelo homem paralítico há 38 anos."
    },
    {
      title: "Levanta e Anda",
      artist: "Mauro Henrique",
      album: "Single de Estúdio",
      duration: "4:15 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Mauro Henrique Levanta e Anda estudio"),
      theme: "A Ordem de Graça e Poder • João 5:8",
      description: "Interpretação marcante sobre a voz de Cristo que ressuscita os mortos e põe de pé os abatidos."
    },
    {
      title: "A Voz do Filho de Deus",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:28 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk A Voz do Filho de Deus estudio"),
      theme: "Quem Ouve a Minha Palavra Tem a Vida • João 5:24",
      description: "Canção de estúdio exaltando a passagem da morte para a vida operada pela autoridade do Filho."
    }
  ],
  'João 6': [
    {
      title: "Pão da Vida",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:30 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Pao da Vida estudio"),
      theme: "Eu Sou o Pão da Vida • João 6:35",
      description: "Meditação lírica sobre a multiplicação dos pães e a declaração de Cristo: 'Aquele que vem a mim jamais terá fome'."
    },
    {
      title: "Palavras de Vida Eterna",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:40 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Palavras de Vida Eterna estudio"),
      theme: "Para Quem Iremos Nós? • João 6:68",
      description: "Hino congregacional baseado na confissão de Pedro: 'Senhor, para quem iremos nós? Tu tens as palavras da vida eterna'."
    },
    {
      title: "O Pão do Céu",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "4:50 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves O Pao do Ceu estudio"),
      theme: "O Verdadeiro Alimento Espiritual • João 6:51",
      description: "Poema sacro de estúdio sobre a entrega voluntária do corpo e sangue de Cristo para a vida do mundo."
    }
  ],

  // === JOÃO 7, 8 e 9 (LEITURA DE HOJE - DIA 304) ===
  'João 7': [
    {
      title: "Águas Vivas",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aguas Vivas estudio"),
      theme: "Rios de Água Viva no Templo • João 7:37–38",
      description: "Inspirado em João 7:37–38: 'Se alguém tem sede, venha a mim e beba. Do seu interior fluirão rios de água viva' — louvor congregacional proclamando a sede saciada no Espírito."
    },
    {
      title: "Fonte de Águas Vivas",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:15 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Fonte de Aguas Vivas estudio"),
      theme: "A Rocha que Sacía no Deserto • João 7",
      description: "Folk contemplativo em estúdio retratando Cristo como o manancial eterno proclamado no último e grande dia da Festa dos Tabernáculos."
    },
    {
      title: "Quem Tem Sede",
      artist: "Asaph Borba",
      album: "Cânticos de Louvor (Estúdio)",
      duration: "4:45 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Asaph Borba Quem Tem Sede estudio"),
      theme: "O Grande Convite de Jesus • João 7:37",
      description: "Clássico da adoração cristã evocando o clamor de Jesus aos peregrinos sedentos em Jerusalém."
    }
  ],
  'João 8': [
    {
      title: "Luz do Mundo",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:10 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Luz do Mundo estudio"),
      theme: "A Luz da Vida & Perdão da Mulher • João 8:12",
      description: "Inspirado em João 8:12: 'Eu sou a luz do mundo; quem me segue não andará nas trevas, mas terá a luz da vida' — reflexão intimista sobre a graça que dissipa a condenação."
    },
    {
      title: "Verdadeiramente Livres",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:40 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Verdadeiramente Livres estudio"),
      theme: "A Verdade que Liberta • João 8:32, 36",
      description: "Baseado em João 8:36: 'Se, pois, o Filho vos libertar, verdadeiramente sereis livres' — proclamação da quebra do cativeiro do pecado pela verdade da cruz."
    },
    {
      title: "Nem Eu Te Condeno (Graça)",
      artist: "Eli Soares",
      album: "Casa de Deus (Estúdio)",
      duration: "4:20 min",
      youtubeId: "lclKOqYuvug",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Eli Soares Nem Eu Te Condeno estudio"),
      theme: "O Perdão da Adúltera • João 8:1–11",
      description: "Meditação lírica sobre a misericórdia de Cristo perante os acusadores fariseus: 'Aquele que dentre vós estiver sem pecado atire a primeira pedra'."
    }
  ],
  'João 9': [
    {
      title: "Graça Maravilhosa (Eu Era Cego e Agora Vejo)",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:45 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Graca Maravilhosa estudio"),
      theme: "A Cura do Cego de Siloé • João 9:25",
      description: "Inspirado em João 9:25: 'Uma coisa sei: eu era cego, mas agora vejo!' — hino congregacional em estúdio celebrando a iluminação dos olhos operada por Cristo."
    },
    {
      title: "Abre os Olhos do Meu Coração",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "4:35 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Abre os Olhos estudio"),
      theme: "Visão Espiritual e Adoração ao Filho • João 9:38",
      description: "Interpretação comovente clamando para ver a santidade de Cristo e adorá-lo de joelhos como o cego curado."
    },
    {
      title: "Novo Olhar",
      artist: "Vocal Livre",
      album: "Por Toda a Terra (Estúdio)",
      duration: "3:55 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Vocal Livre Novo Olhar estudio"),
      theme: "Das Trevas Para a Luz • João 9",
      description: "Arranjos vocais de estúdio exaltando o milagre que remove a cegueira e revela a fidelidade eterna de Deus."
    }
  ],

  // === JOÃO 10 a 21 ===
  'João 10': [
    {
      title: "O Bom Pastor",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:32 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola O Bom Pastor estudio"),
      theme: "O Pastor que Dá a Vida • João 10:11",
      description: "Folk bíblico contemplando a voz do Bom Pastor que chama as suas ovelhas pelo nome e as protege."
    },
    {
      title: "As Minhas Ovelhas",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:30 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha As Minhas Ovelhas estudio"),
      theme: "Segurança Eterna nas Mãos do Pai • João 10:28–29",
      description: "Hino da fé reformada sobre a segurança inabalável das ovelhas de Cristo que jamais perecerão."
    },
    {
      title: "Ovelhas do Seu Pastoreio",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:20 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Ovelhas estudio"),
      theme: "O Cuidado Diário do Pastor • João 10",
      description: "Folk contemplativo sobre o pastoreio generoso e o descanso seguro nos pastos verdejantes."
    }
  ],
  'João 11': [
    {
      title: "Ressurreição e Vida",
      artist: "Morada",
      album: "Single de Estúdio",
      duration: "4:40 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Morada Ressurreicao e Vida estudio"),
      theme: "Eu Sou a Ressurreição e a Vida • João 11:25",
      description: "Louvor expressivo proclamando a vitória de Cristo sobre a morte no túmulo de Lázaro: 'Aquele que crê em mim viverá'."
    },
    {
      title: "Vem Para Fora",
      artist: "Mauro Henrique",
      album: "Single de Estúdio",
      duration: "4:15 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Mauro Henrique Vem Para Fora estudio"),
      theme: "A Ordem que Vence a Morte • João 11:43",
      description: "Canção intimista sobre a voz do Mestre chamando os seus filhos da sepultura para a vida plena."
    },
    {
      title: "Ele Chora Conosco",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:12 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Ele Chora Conosco estudio"),
      theme: "Jesus Chorou • João 11:35",
      description: "Poesia profunda meditando na empatia e compaixão sincera do Salvador diante do sofrimento humano."
    }
  ],
  'João 12': [
    {
      title: "Digno de Louvor (O Grão de Trigo)",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Digno de Louvor estudio"),
      theme: "O Grão que Morre para Dar Fruto • João 12:24",
      description: "Louvor congregacional sobre a entrega sacrificial de Cristo e a entrada triunfal com ramos de palmeira em Jerusalém."
    },
    {
      title: "Derramar Meu Perfume",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "4:50 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Derramar Meu Perfume estudio"),
      theme: "A Unção de Maria em Betânia • João 12:1–8",
      description: "Vocal lírico de consagração e devoção irrestrita aos pés de Jesus."
    },
    {
      title: "Quando Eu For Levantado",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:25 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Quando Eu For Levantado estudio"),
      theme: "Atrairei Todos a Mim • João 12:32",
      description: "Folk bíblico contemplando a cruz glorificada que atrai pecadores de todas as nações."
    }
  ],
  'João 13': [
    {
      title: "A Começar em Mim (Lava-pés)",
      artist: "Vocal Livre",
      album: "Por Toda a Terra (Estúdio)",
      duration: "3:50 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Vocal Livre A Começar em Mim estudio"),
      theme: "O Lava-pés & O Servo Humilde • João 13:14–15",
      description: "Harmonias vocais inspiradas no exemplo do Mestre: 'Se eu, o Senhor e Mestre, lavei os vossos pés, vós deveis também lavar os pés uns dos outros'."
    },
    {
      title: "Um Novo Mandamento",
      artist: "Asaph Borba",
      album: "Cânticos de Louvor (Estúdio)",
      duration: "4:20 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Asaph Borba Um Novo Mandamento estudio"),
      theme: "O Mandamento do Amor • João 13:34–35",
      description: "Cântico clássico sobre a marca distintiva dos discípulos de Jesus: o amor sincero e sacrificial."
    },
    {
      title: "Servir ao Rei",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:30 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Servir ao Rei estudio"),
      theme: "Humildade no Reino de Deus • João 13",
      description: "Hino reformado convocando a igreja ao serviço abnegado e à compaixão cristã."
    }
  ],
  'João 14': [
    {
      title: "O Caminho, a Verdade e a Vida",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:40 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk O Caminho a Verdade e a Vida estudio"),
      theme: "Eu Sou o Caminho • João 14:6",
      description: "Exposição poética sobre a exclusividade de Cristo como o único mediador entre Deus e os homens."
    },
    {
      title: "A Minha Paz Vos Dou",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:15 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais A Minha Paz Vos Dou estudio"),
      theme: "Não se Turbe o Vosso Coração • João 14:1, 27",
      description: "Folk intimista de consolo transmitindo a paz celestial que o mundo não pode dar nem tirar."
    },
    {
      title: "O Consolador",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:25 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha O Consolador estudio"),
      theme: "A Promessa do Espírito Santo • João 14:16–26",
      description: "Louvor congregacional celebrando a presença contínua do Espírito da Verdade habitando em nós."
    }
  ],
  'João 15': [
    {
      title: "Permanecer em Ti (A Videira)",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:35 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Permanecer em Ti estudio"),
      theme: "A Videira Verdadeira • João 15:1–8",
      description: "Folk bíblico contemplando a dependência vital dos ramos no tronco: 'Sem mim nada podeis fazer'."
    },
    {
      title: "A Videira Verdadeira",
      artist: "Purples",
      album: "Single de Estúdio",
      duration: "4:20 min",
      youtubeId: "Q4ejKplh_ms",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda Purples A Videira estudio"),
      theme: "Dar Muito Fruto • João 15:5",
      description: "Canção de estúdio sobre a alegria de habitar nas palavras de Cristo e produzir frutos de justiça."
    },
    {
      title: "Amigos de Deus",
      artist: "Felipe Valente",
      album: "Single de Estúdio",
      duration: "4:10 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Felipe Valente Amigos de Deus estudio"),
      theme: "Já Não Vos Chamo Servos • João 15:14–15",
      description: "Poesia acústica contemplando a intimidade e amizade redentora selada por Cristo."
    }
  ],
  'João 16': [
    {
      title: "O Espírito da Verdade",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:35 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha O Espirito da Verdade estudio"),
      theme: "O Consolador que Convence e Guia • João 16:7–14",
      description: "Hino congregacional sobre a obra regeneradora do Espírito Santo guiando os crentes em toda a verdade."
    },
    {
      title: "Tende Bom Ânimo",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:15 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Tende Bom Animo estudio"),
      theme: "Eu Venci o Mundo • João 16:33",
      description: "Canção intimista de esperança e coragem diante das aflições passageiras deste mundo presente."
    },
    {
      title: "Vencedor",
      artist: "Oficina G3",
      album: "Histórias e Bicicletas (Estúdio)",
      duration: "4:45 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Oficina G3 Vencedor estudio"),
      theme: "A Vitória Inabalável de Cristo • João 16:33",
      description: "Rock devocional de estúdio proclamando o triunfo do Salvador sobre a morte e o medo."
    }
  ],
  'João 17': [
    {
      title: "Que Sejamos Um (Oração Sacerdotal)",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "5:00 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Que Sejamos Um estudio"),
      theme: "A Oração pela Unidade da Igreja • João 17:21",
      description: "Vocal reflexivo traduzindo o clamor do Sumo Sacerdote para que a igreja resplandeça na unidade do Pai e do Filho."
    },
    {
      title: "Santifica-os na Verdade",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:30 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Santifica-os na Verdade estudio"),
      theme: "A Tua Palavra é a Verdade • João 17:17",
      description: "Folk bíblico contemplando o envio dos discípulos ao mundo sustentados pela verdade das Escrituras."
    },
    {
      title: "A Glória Eterna",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:40 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha A Gloria Eterna estudio"),
      theme: "A Glória Antes da Fundação do Mundo • João 17:5",
      description: "Louvor congregacional contemplando a majestade pré-eterna do Verbo junto ao Pai."
    }
  ],
  'João 18': [
    {
      title: "O Cálice do Pai",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:30 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola O Calice do Pai estudio"),
      theme: "Não Beberei Eu o Cálice? • João 18:11",
      description: "Folk de estúdio sobre a obediência voluntária de Jesus ao beber o cálice da ira divina em favor do seu povo."
    },
    {
      title: "Reino Sem Fim",
      artist: "Fruto Sagrado",
      album: "Single de Estúdio",
      duration: "4:15 min",
      youtubeId: "_pnAJPnp_Jw",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Fruto Sagrado Reino Sem Fim estudio"),
      theme: "O Meu Reino Não é Deste Mundo • João 18:36",
      description: "Canção reflexiva de estúdio proclamando a soberania eterna do Reino de Deus diante dos poderes terrestres."
    },
    {
      title: "A Verdade Perante os Homens",
      artist: "PG",
      album: "Imagem e Semelhança (Estúdio)",
      duration: "4:20 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("PG A Verdade Perante os Homens estudio"),
      theme: "Que é a Verdade? • João 18:37–38",
      description: "Interpretação marcante sobre Cristo como o Rei que veio para dar testemunho da verdade eterna."
    }
  ],
  'João 19': [
    {
      title: "Está Consumado",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:35 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Esta Consumado estudio"),
      theme: "A Obra Perfeita da Cruz • João 19:30",
      description: "Gravação de estúdio celebrando a consumação da dívida do pecado pelo sacrifício pleno do Cordeiro."
    },
    {
      title: "Na Cruz",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:40 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Na Cruz estudio"),
      theme: "O Cordeiro Traspassado • João 19:34–37",
      description: "Folk lírico meditando na contemplação daquele a quem traspassaram e de cujo lado brotou sangue e água."
    },
    {
      title: "Pela Cruz",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:45 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Pela Cruz estudio"),
      theme: "A Reconciliação Definitiva • João 19",
      description: "Hino congregacional da IPAlpha exaltando a cruz onde a justiça e a misericórdia de Deus se beijaram."
    }
  ],
  'João 20': [
    {
      title: "Ele Vive (O Túmulo Vazio)",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Ele Vive estudio"),
      theme: "A Ressurreição e o Túmulo Vazio • João 20:1–18",
      description: "Proclamação festiva da vitória de Cristo rompendo os grilhões da morte: 'Por que choras? Ele ressuscitou!'."
    },
    {
      title: "Paz Seja Convosco",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "4:35 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Paz Seja Convosco estudio"),
      theme: "Jesus no Meio dos Discípulos • João 20:19–23",
      description: "Interpretação poética da saudação daquele que traz a paz eterna e sopra o Espírito sobre os seus enviados."
    },
    {
      title: "Senhor Meu e Deus Meu",
      artist: "Morada",
      album: "Single de Estúdio",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Morada Senhor Meu e Deus Meu estudio"),
      theme: "A Confissão de Tomé • João 20:28",
      description: "Louvor expressivo culminando na confissão mais alta da fé: 'Senhor meu e Deus meu!'."
    }
  ],
  'João 21': [
    {
      title: "Tu Me Amas?",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:15 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Tu Me Amas estudio"),
      theme: "A Restauração de Pedro • João 21:15–17",
      description: "Poesia intimista de estúdio sobre a pergunta de Jesus junto às brasas no mar de Tiberíades e a restauração do pastor arrependido."
    },
    {
      title: "Junto ao Mar de Tiberíades",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:25 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Mar de Tiberiades estudio"),
      theme: "A Pesca Maravilhosa & O Banheiro na Praia • João 21",
      description: "Folk reflexivo contemplando a fidelidade incondicional de Jesus que prepara o peixe e convida: 'Vinde, comei'."
    },
    {
      title: "Segue-me Tu",
      artist: "Vocal Livre",
      album: "Por Toda a Terra (Estúdio)",
      duration: "4:00 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Vocal Livre Segue-me Tu estudio"),
      theme: "O Chamado Pessoal do Discípulo • João 21:22",
      description: "Arranjo vocal contemplando a ordem de Cristo a cada seguidor: fixar os olhos exclusivamente nEle e perseverar até o fim."
    }
  ],

  // === EVANGELHO DE LUCAS (Capítulos 19 a 24) ===
  'Lucas 19': [
    {
      title: "Jardim da Inocência (Zaqueu)",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:52 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Jardim da Inocencia estudio"),
      theme: "Zaqueu & Entrada Triunfal • Lucas 19",
      description: "Gravação de estúdio poética sobre o encontro transformador da graça de Cristo e a entrada triunfal em Jerusalém."
    },
    {
      title: "Vem Me Socorrer",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:18 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Vem Me Socorrer estudio"),
      theme: "O Filho do Homem Veio Salvar o Perdido • Lucas 19:10",
      description: "Poesia intimista de socorro e reconciliação aos pés do Salvador."
    }
  ],
  'Lucas 20': [
    {
      title: "Pedra Angular / Castelo Forte",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte estudio"),
      theme: "A Pedra que os Edificadores Rejeitaram • Lucas 20:17",
      description: "Louvor congregacional proclamando a soberania da Rocha Inabalável que sustenta o seu povo."
    },
    {
      title: "Esperança",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:24 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Esperança estudio"),
      theme: "Deus Não é Deus de Mortos, mas de Vivos • Lucas 20:38",
      description: "Folk contemplativo sobre a promessa irrevogável da ressurreição."
    }
  ],
  'Lucas 21': [
    {
      title: "A Começar em Mim",
      artist: "Vocal Livre",
      album: "Por Toda a Terra (Estúdio)",
      duration: "3:50 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Vocal Livre A Começar em Mim estudio"),
      theme: "A Oferta da Viúva & A Redenção Próxima • Lucas 21",
      description: "Harmonias vocais sobre a entrega total do coração e a vigilância esperançosa no retorno de Cristo."
    },
    {
      title: "Colossenses 1",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:47 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Colossenses 1 estudio"),
      theme: "O Céu e a Terra Passarão • Lucas 21:33",
      description: "Meditação lírica sobre a Palavra eterna que jamais passará."
    }
  ],
  'Lucas 22': [
    {
      title: "Getsêmani",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "5:09 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Getsemani estudio"),
      theme: "A Ceia e a Agonia no Jardim • Lucas 22:39–44",
      description: "Gravação clássica de estúdio retratando a angústia vicária e a entrega voluntária de Cristo no Getsêmani: 'Não seja feita a minha vontade, mas a tua'."
    },
    {
      title: "Cálice de Amor",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:20 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Calice estudio"),
      theme: "O Novo Pacto no Meu Sangue • Lucas 22:20",
      description: "Folk bíblico sobre a instituição da Ceia e o sangue derramado por nós."
    }
  ],
  'Lucas 23': [
    {
      title: "Na Cruz (Isaías 53)",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:40 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Na Cruz estudio"),
      theme: "A Crucificação & O Perdão na Cruz • Lucas 23:34",
      description: "Exposição comovente sobre a oração de Jesus na cruz: 'Pai, perdoa-lhes, porque não sabem o que fazem'."
    },
    {
      title: "Está Consumado",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:35 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Esta Consumado estudio"),
      theme: "Pai, nas Tuas Mãos Entrego o Meu Espírito • Lucas 23:46",
      description: "Celebração em estúdio da redenção perfeita consumada no Calvário."
    }
  ],
  'Lucas 24': [
    {
      title: "Castelo Forte / Ele Vive",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte estudio"),
      theme: "A Ressurreição & Os Discípulos de Emaús • Lucas 24",
      description: "Hino da fé reformada celebrando a vitória triunfante sobre a sepultura: 'Ele não está aqui, mas ressuscitou!'."
    },
    {
      title: "Esperança (Caminho de Emaús)",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:24 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Esperança estudio"),
      theme: "O Coração que Ardia no Caminho • Lucas 24:32",
      description: "Folk contemplativo sobre os olhos que se abrem ao partir do pão na presença do Ressurreto."
    }
  ]
};

// Resolução de Fallback Temático Inteligente para qualquer livro e capítulo da Bíblia
function resolveThematicFallback(bookName, chapterNum, readingIndex = 0, overrideIndex = null) {
  const clean = (bookName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const index = overrideIndex !== null && overrideIndex !== undefined ? Math.abs(overrideIndex) : (chapterNum + readingIndex);

  // Evangelhos e Atos
  if (clean.includes('mateus') || clean.includes('marcos') || clean.includes('lucas') || clean.includes('atos')) {
    const list = [
      {
        title: "Castelo Forte",
        artist: "Novo Canto (IPAlpha)",
        album: "IPAlpha Música (Estúdio)",
        duration: "4:50 min",
        youtubeId: "RGCzQjFKk2w",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte estudio"),
        description: "Hino congregacional da fé reformada sobre a soberania triunfante do Reino de Deus."
      },
      {
        title: "Aqui Vou Eu",
        artist: "Banda NOVA (IPAlpha)",
        album: "IPAlpha Nova (Estúdio)",
        duration: "4:30 min",
        youtubeId: "cGcWmX2Pz0k",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aqui Vou Eu estudio"),
        description: "Louvor jovem de consagração e disponibilidade ao chamado do Reino de Cristo."
      },
      {
        title: "Vem Me Socorrer",
        artist: "Marcos Almeida",
        album: "Eu Sarau (Estúdio)",
        duration: "4:18 min",
        youtubeId: "_kAVIQzwffg",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Vem Me Socorrer estudio"),
        description: "Clamor poético e sincero por graça e restauração aos pés do Redentor."
      }
    ];
    return list[index % list.length];
  }

  // Cartas Paulinas e Gerais
  if (clean.includes('romanos') || clean.includes('corintios') || clean.includes('galatas') || clean.includes('efesios') || clean.includes('filipenses') || clean.includes('colossenses') || clean.includes('hebreus')) {
    const list = [
      {
        title: "Colossenses 1",
        artist: "Projeto Sola",
        album: "Single de Estúdio",
        duration: "4:47 min",
        youtubeId: "gk7XWCMwO94",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Colossenses 1 estudio"),
        description: "Exposição lírica da doutrina da justificação e supremacia de Cristo."
      },
      {
        title: "Jardim da Inocência (Graça)",
        artist: "Paulo César Baruk",
        album: "Graça (Estúdio)",
        duration: "4:52 min",
        youtubeId: "bi9W6oZzfxk",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Jardim da Inocencia estudio"),
        description: "Gravação de estúdio celebrando a paz com Deus mediante a justificação pela fé."
      },
      {
        title: "Esperança",
        artist: "Os Arrais",
        album: "As Canções da Terra (Estúdio)",
        duration: "4:24 min",
        youtubeId: "eDflquxhedQ",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Esperança estudio"),
        description: "Folk bíblico contemplando a firme esperança da glória eterna prometida nas Escrituras."
      }
    ];
    return list[index % list.length];
  }

  // Salmos e Sabedoria
  if (clean.includes('salmo') || clean.includes('proverbios') || clean.includes('eclesiastes')) {
    const list = [
      {
        title: "Castelo Forte (Salmo 46)",
        artist: "Novo Canto (IPAlpha)",
        album: "IPAlpha Música (Estúdio)",
        duration: "4:50 min",
        youtubeId: "RGCzQjFKk2w",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte estudio"),
        description: "Deus é o nosso refúgio e fortaleza, socorro bem presente nas tribulações."
      },
      {
        title: "Esperança",
        artist: "Os Arrais",
        album: "As Canções da Terra (Estúdio)",
        duration: "4:24 min",
        youtubeId: "eDflquxhedQ",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Esperança estudio"),
        description: "Oração lírica e contemplativa baseada nos cânticos de confiança nos Salmos."
      },
      {
        title: "A Começar em Mim",
        artist: "Vocal Livre",
        album: "Por Toda a Terra (Estúdio)",
        duration: "3:50 min",
        youtubeId: "nDXqNTyNC7A",
        youtubeMusicUrl: getYoutubeMusicSearchUrl("Vocal Livre A Começar em Mim estudio"),
        description: "Súplica sincera pela renovação de um coração puro e espírito inabalável."
      }
    ];
    return list[index % list.length];
  }

  // Antigo Testamento Geral
  const generalList = [
    {
      title: "Castelo Forte",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte estudio"),
      description: "Louvor congregacional proclamando a aliança eterna e a soberania do Senhor dos Exércitos."
    },
    {
      title: "Aqui Vou Eu",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aqui Vou Eu estudio"),
      description: "Louvor celebrando a obediência e prontidão ao chamado de Deus."
    },
    {
      title: "Colossenses 1",
      artist: "Projeto Sola",
      album: "Single de Estúdio",
      duration: "4:47 min",
      youtubeId: "gk7XWCMwO94",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Projeto Sola Colossenses 1 estudio"),
      description: "Poesia bíblica conectando a promessa das Escrituras ao Cordeiro Eterno."
    }
  ];
  return generalList[index % generalList.length];
}

// Obtém a música recomendada especificamente para cada capítulo do dia com base no tema exegético do texto
export function getMusicForChapter(dayId, readingStr, readingIndex = 0, overrideArtistIndex = null) {
  const cleanReading = (readingStr || '').trim();

  // 1. Prioridade Máxima: Catálogo Temático Específico por Capítulo Bíblico
  if (THEMATIC_CHAPTER_MUSIC[cleanReading] && THEMATIC_CHAPTER_MUSIC[cleanReading].length > 0) {
    const list = THEMATIC_CHAPTER_MUSIC[cleanReading];
    const index = overrideArtistIndex !== null && overrideArtistIndex !== undefined
      ? Math.abs(overrideArtistIndex) % list.length
      : 0;
    const track = list[index];
    return {
      chapter: cleanReading,
      ...track,
      artistIndex: index,
      theme: track.theme || `Louvor específico para ${cleanReading}`
    };
  }

  // 2. Fallback Contextual Inteligente por Livro e Capítulo
  const parts = cleanReading.split(' ');
  const bookName = parts.slice(0, parts.length - 1).join(' ') || parts[0] || 'Lucas';
  const chapterNum = Number(parts[parts.length - 1]) || 1;
  const fallback = resolveThematicFallback(bookName, chapterNum, readingIndex, overrideArtistIndex);

  return {
    chapter: cleanReading,
    ...fallback,
    theme: fallback.theme || `Louvor para ${cleanReading}`,
    artistIndex: overrideArtistIndex !== null && overrideArtistIndex !== undefined ? overrideArtistIndex : readingIndex
  };
}
