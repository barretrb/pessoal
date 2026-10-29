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
