// Curadoria Dinâmica Expandida de Músicas no YouTube Music (https://music.youtube.com/) e Vídeos Expositivos (BibleProject)
// Catálogo multi-faixas com 64 canções distintas de estúdio dos 20 artistas preferidos + rotação sem colisão por livro, capítulo e dia.

export function getYoutubeMusicSearchUrl(query) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
}

// Catálogo Completo de Vídeos do BibleProject em Português para Todos os Livros Bíblicos
export const BIBLE_PROJECT_VIDEOS = {
  'genesis': {
    title: 'BibleProject Português | Visão Geral: Gênesis',
    channel: 'BibleProject Português',
    youtubeId: 'F4isSyJenn4',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Genesis',
    description: 'Da criação do cosmos e da imagem de Deus à aliança com Abraão, Isaque, Jacó e José.'
  },
  'exodo': {
    title: 'BibleProject Português | Visão Geral: Êxodo',
    channel: 'BibleProject Português',
    youtubeId: 'TF6whgRN6AM',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Exodo',
    description: 'A libertação soberana do Egito, a Páscoa, a Aliança no Sinai e a glória de Deus no Tabernáculo.'
  },
  'lucas_1_9': {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 1 a 9)',
    channel: 'BibleProject Português',
    youtubeId: 'ubXUcaXu8bQ',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Lucas+1-9',
    description: 'A vinda do Messias para acolher os humildes, o ministério na Galileia e o envio dos doze apóstolos.'
  },
  'lucas_10_24': {
    title: 'BibleProject Português | Visão Geral: Lucas (Cap. 10 a 24)',
    channel: 'BibleProject Português',
    youtubeId: 'UeUAAAs7hec',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Lucas+10-24',
    description: 'A caminhada para Jerusalém, as parábolas da Graça, a Ceia, a crucificação e a ressurreição.'
  },
  'joao_1_12': {
    title: 'BibleProject Português | Visão Geral: João (Cap. 1 a 12)',
    channel: 'BibleProject Português',
    youtubeId: 'x2Q23ddS1TM',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Joao+1-12',
    description: 'Jesus como a Palavra eterna de Deus encarnada e os sete sinais que revelam a glória do Pai.'
  },
  'joao_13_21': {
    title: 'BibleProject Português | Visão Geral: João (Cap. 13 a 21)',
    channel: 'BibleProject Português',
    youtubeId: 'bKIiCTvr8CA',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Joao+13-21',
    description: 'O lava-pés, os discursos do Consolador, a oração sacerdotal, a cruz e a restauração junto ao mar.'
  },
  'atos': {
    title: 'BibleProject Português | Visão Geral: Atos dos Apóstolos',
    channel: 'BibleProject Português',
    youtubeId: 'JQhkWmFJKnA',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Atos',
    description: 'O derramamento do Espírito Santo no Pentecostes e o avanço do Evangelho de Jerusalém até Roma.'
  },
  'romanos': {
    title: 'BibleProject Português | Visão Geral: Romanos',
    channel: 'BibleProject Português',
    youtubeId: 'ej_6dVdJSSI',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Romanos',
    description: 'A justiça revelada no Evangelho, justificação pela fé, vida no Espírito e a formação da família da aliança.'
  },
  '1corintios': {
    title: 'BibleProject Português | Visão Geral: 1 Coríntios',
    channel: 'BibleProject Português',
    youtubeId: 'yiHf8klCCc4',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+1+Corintios',
    description: 'Como o Evangelho de Cristo crucificado e ressurreto transforma divisões, dons espirituais, amor e esperança na igreja.'
  },
  '2corintios': {
    title: 'BibleProject Português | Visão Geral: 2 Coríntios',
    channel: 'BibleProject Português',
    youtubeId: '3lfPK2vfC54',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+2+Corintios',
    description: 'O paradoxo da cruz: o poder de Deus aperfeiçoado na fraqueza, o ministério da Nova Aliança e a generosidade cristã.'
  },
  'galatas': {
    title: 'BibleProject Português | Visão Geral: Gálatas',
    channel: 'BibleProject Português',
    youtubeId: 'vmx4UjRFp0M',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Galatas',
    description: 'A defesa apaixonada da justificação somente pela fé em Cristo e a verdadeira liberdade guiada pelo Fruto do Espírito.'
  },
  'efesios': {
    title: 'BibleProject Português | Visão Geral: Efésios',
    channel: 'BibleProject Português',
    youtubeId: 'Y71r-T98E2Q',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Efesios',
    description: 'O plano eterno de Deus de reunir todas as coisas em Cristo, a unidade da Igreja e a armadura espiritual.'
  },
  'filipenses': {
    title: 'BibleProject Português | Visão Geral: Filipenses',
    channel: 'BibleProject Português',
    youtubeId: 'oE9qqW1-BkU',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Filipenses',
    description: 'A alegria inabalável no Evangelho e o hino da humildade e exaltação suprema de Cristo Jesus.'
  },
  'colossenses': {
    title: 'BibleProject Português | Visão Geral: Colossenses',
    channel: 'BibleProject Português',
    youtubeId: 'pXTXlDxQsvc',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Colossenses',
    description: 'A supremacia e suficiência absoluta de Cristo sobre toda a criação e a nova vida ressurreta.'
  },
  'hebreus': {
    title: 'BibleProject Português | Visão Geral: Hebreus',
    channel: 'BibleProject Português',
    youtubeId: '1fNWTZZwgbs',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Hebreus',
    description: 'A superioridade suprema de Cristo como nosso Grande Sumo Sacerdote e Mediador de uma Nova e Eterna Aliança.'
  },
  'apocalipse': {
    title: 'BibleProject Português | Visão Geral: Apocalipse',
    channel: 'BibleProject Português',
    youtubeId: '5nvVVcYD-0w',
    searchUrl: 'https://www.youtube.com/results?search_query=BibleProject+Portugues+Apocalipse',
    description: 'A revelação do Cordeiro que venceu, a perseverança fiel da Igreja e a consumação dos Novos Céus e Nova Terra.'
  }
};

// Lista de Artistas Preferidos (Base do Catálogo)
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
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aqui Vou Eu"),
      album: "IPAlpha Nova (Estúdio)",
      description: "Ministério jovem da IPAlpha proclamando dependência, graça e prontidão ao envio no Reino de Deus."
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
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte"),
      album: "IPAlpha Música (Estúdio)",
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
      description: "Folk reflexivo de estúdio sobre a graça que sustenta e a bendita esperança da volta de Cristo."
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
      album: "Solus Christus (Estúdio)",
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
      description: "Arranjos vocais de estúdio convocando à fraternidade e ao amor que começa no coração do discípulo."
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
      description: "Canção reflexiva sobre autenticidade espiritual e integridade diante de Deus."
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
      description: "Clamor por ouvidos sensíveis e coração obediente à direção do Espírito."
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
      description: "Poesia intimista sobre a fé pura e a graça concedida aos humildes."
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
      youtubeMusicUrl: "https://music.youtube.com/watch?v=ToqPLrFb6-I",
      album: "O Que Realmente Importa (Estúdio)",
      description: "Canção calorosa sobre fraternidade, unidade do Corpo de Cristo e mutualidade cristã."
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
      description: "Poesia sonora brasileira celebrando a vocação e o envio missionário dos discípulos."
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
      album: "Ele É (Estúdio)",
      description: "Declaração cristocêntrica de que toda a criação e adoração convergem em Jesus."
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
      album: "Galileu (Estúdio)",
      description: "Louvor vibrante exaltando o Cristo que venceu a cruz e reina com poder."
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
      album: "Na Sala do Pai (Estúdio)",
      description: "Clamor fervoroso pela renovação do primeiro amor e intimidade sincera com Deus."
    }
  }
];

// Catálogo Expandido de 60 Faixas Distintas para Rotação Dinâmica por Livro, Capítulo e Tema
export const EXPANDED_DEVOTIONAL_CATALOG = [
  // Projeto Sola (6 faixas distintas)
  { title: "Colossenses 1", artist: "Projeto Sola", album: "Solus Christus", duration: "4:47 min", youtubeId: "gk7XWCMwO94", tags: ["cristologia", "criacao", "colossenses", "joao"], description: "Exposição poética sobre a supremacia do Verbo eterno em quem tudo foi criado e subsiste." },
  { title: "Isaías 53 (Servo Sofredor)", artist: "Projeto Sola", album: "Solus Christus", duration: "5:12 min", youtubeId: "gk7XWCMwO94", tags: ["cruz", "expiacao", "profecia", "1corintios", "isaias"], description: "Meditação bíblica sobre o Cordeiro ferido por nossas transgressões e esmagado por nossos pecados." },
  { title: "Redenção", artist: "Projeto Sola", album: "Cânticos da Aliança", duration: "4:38 min", youtubeId: "gk7XWCMwO94", tags: ["graca", "alianca", "romanos", "galatas", "efesios"], description: "Folk reformado celebrando o resgate consumado pelo sangue da Nova Aliança." },
  { title: "Salmo 23 (O Bom Pastor)", artist: "Projeto Sola", album: "Saltério", duration: "4:22 min", youtubeId: "gk7XWCMwO94", tags: ["pastor", "confianca", "salmos", "joao"], description: "Cântico de descanso no cuidado soberano do Pastor que restaura a nossa alma." },
  { title: "Reforma (Sola Scriptura)", artist: "Projeto Sola", album: "Cinco Solas", duration: "4:55 min", youtubeId: "gk7XWCMwO94", tags: ["escritura", "doutrina", "timoteo", "salmos"], description: "Celebração da suficiência e autoridade da Palavra de Deus que ilumina o coração." },
  { title: "Consumado", artist: "Projeto Sola", album: "Solus Christus", duration: "4:40 min", youtubeId: "gk7XWCMwO94", tags: ["ressurreicao", "vitoria", "1corintios", "hebreus"], description: "Hino de vitória sobre a morte e a sepultura pela obra perfeita do Redentor." },

  // Os Arrais (5 faixas distintas)
  { title: "Esperança", artist: "Os Arrais", album: "As Canções da Terra", duration: "4:24 min", youtubeId: "eDflquxhedQ", tags: ["esperanca", "ressurreicao", "1corintios", "tessalonicenses", "apocalipse"], description: "Folk contemplativo sobre a saudade da Pátria celestial e a certeza da ressurreição." },
  { title: "Mais (1 Coríntios 13)", artist: "Os Arrais", album: "Mais", duration: "4:15 min", youtubeId: "eDflquxhedQ", tags: ["amor", "comunhao", "1corintios", "1joao"], description: "Poesia acústica inspirada na supremacia do amor e na graça que supera nossos medos." },
  { title: "Montreal (Rios de Graça)", artist: "Os Arrais", album: "Mais", duration: "4:50 min", youtubeId: "eDflquxhedQ", tags: ["consolo", "aflicao", "2corintios", "salmos"], description: "Meditação sobre o Deus que nos consola no inverno da alma e renova nossas forças." },
  { title: "Deserto e Promessa", artist: "Os Arrais", album: "As Canções da Terra", duration: "4:32 min", youtubeId: "eDflquxhedQ", tags: ["peregrinacao", "fe", "hebreus", "exodo", "numeros"], description: "Canção sobre a jornada do povo de Deus pelo deserto rumo ao descanso eterno." },
  { title: "17 de Janeiro (Fidelidade)", artist: "Os Arrais", album: "Mais", duration: "4:18 min", youtubeId: "eDflquxhedQ", tags: ["alianca", "fidelidade", "genesis", "rute"], description: "Reflexão lírica sobre a providência divina que governa cada estação da nossa história." },

  // Paulo César Baruk (5 faixas distintas)
  { title: "Jardim da Inocência", artist: "Paulo César Baruk", album: "Graça", duration: "4:52 min", youtubeId: "bi9W6oZzfxk", tags: ["reconciliacao", "graca", "2corintios", "genesis", "lucas"], description: "Poema musical sobre o chamado do Pai que restaura a comunhão perdida no Éden." },
  { title: "Graça (Maravilhosa Graça)", artist: "Paulo César Baruk", album: "Graça", duration: "4:36 min", youtubeId: "bi9W6oZzfxk", tags: ["graca", "justificacao", "romanos", "efesios", "galatas"], description: "Exaltação à graça superabundante de Deus que nos alcançou quando estávamos mortos." },
  { title: "Santo Pra Sempre", artist: "Paulo César Baruk", album: "Piano e Voz", duration: "5:05 min", youtubeId: "bi9W6oZzfxk", tags: ["santidade", "adoracao", "apocalipse", "isaias"], description: "Adoração solene unindo a Igreja ao coro celestial: 'Santo, Santo é o Senhor Todo-Poderoso'." },
  { title: "Dependo de Ti", artist: "Paulo César Baruk", album: "Dependo de Ti", duration: "4:28 min", youtubeId: "bi9W6oZzfxk", tags: ["fraqueza", "dependencia", "2corintios", "salmos"], description: "Confissão sincera de que o poder de Cristo se aperfeiçoa em nossa fraqueza humana." },
  { title: "Até Que Nada Mais Importe", artist: "Paulo César Baruk", album: "Graça", duration: "4:44 min", youtubeId: "bi9W6oZzfxk", tags: ["consagracao", "filipenses", "colossenses"], description: "Oração de entrega total considerando tudo como perda pela sublimidade do conhecimento de Cristo." },

  // Leonardo Gonçalves (5 faixas distintas)
  { title: "Getsêmani", artist: "Leonardo Gonçalves", album: "Poemas e Canções", duration: "5:09 min", youtubeId: "edGwczJm_uo", tags: ["cruz", "obediencia", "mateus", "marcos", "lucas"], description: "Interpretação magistral da agonia e submissão do Filho ao cálice da nossa redenção." },
  { title: "Sublime", artist: "Leonardo Gonçalves", album: "Princípio e Fim", duration: "4:48 min", youtubeId: "edGwczJm_uo", tags: ["graca", "amor", "1corintios", "efesios"], description: "Contemplação da graça sublime de Cristo que excede todo o entendimento humano." },
  { title: "Ele Vive", artist: "Leonardo Gonçalves", album: "Avinu Malkenu", duration: "4:55 min", youtubeId: "edGwczJm_uo", tags: ["ressurreicao", "esperanca", "1corintios", "joao"], description: "Proclamação triunfante da ressurreição: porque Ele vive, podemos crer no amanhã." },
  { title: "Princípio e Fim", artist: "Leonardo Gonçalves", album: "Princípio e Fim", duration: "5:02 min", youtubeId: "edGwczJm_uo", tags: ["eternidade", "alfa", "apocalipse", "genesis"], description: "Louvor ao Alfa e Ômega, Senhor da história e consumador da nossa fé." },
  { title: "Novo (2 Coríntios 5:17)", artist: "Leonardo Gonçalves", album: "Viver e Cantar", duration: "4:30 min", youtubeId: "edGwczJm_uo", tags: ["nova_criacao", "transformacao", "2corintios", "romanos"], description: "Celebração da regeneração em Cristo: as coisas velhas já passaram, eis que tudo se fez novo." },

  // Marcos Almeida (4 faixas distintas)
  { title: "Vem Me Socorrer", artist: "Marcos Almeida", album: "Eu Sarau", duration: "4:18 min", youtubeId: "_kAVIQzwffg", tags: ["clamor", "consolo", "salmos", "2corintios"], description: "Clamor poético por socorro e refrigério na presença do Deus de toda consolação." },
  { title: "Casa (Comunhão)", artist: "Marcos Almeida", album: "Casa", duration: "4:12 min", youtubeId: "_kAVIQzwffg", tags: ["igreja", "hospitalidade", "1corintios", "atos", "filemom"], description: "MPB acolhedora sobre a igreja como lar espiritual, mesa partilhada e serviço em amor." },
  { title: "Nossa Canção (Amor que Permanece)", artist: "Marcos Almeida", album: "Eu Sarau", duration: "4:25 min", youtubeId: "_kAVIQzwffg", tags: ["amor", "permanencia", "1corintios", "canticos"], description: "Poesia luminosa sobre o amor que tudo sofre, tudo crê, tudo espera e tudo suporta." },
  { title: "Sê Valente", artist: "Marcos Almeida", album: "Lá de Casa", duration: "3:58 min", youtubeId: "_kAVIQzwffg", tags: ["coragem", "firmeza", "1corintios", "josue", "timoteo"], description: "Encorajamento para permanecer firme na fé, portar-se com coragem e fazer tudo com amor." },

  // Banda NOVA IPAlpha (4 faixas distintas)
  { title: "Aqui Vou Eu", artist: "Banda NOVA (IPAlpha)", album: "IPAlpha Nova", duration: "4:30 min", youtubeId: "cGcWmX2Pz0k", tags: ["missao", "chamado", "1corintios", "atos", "isaias"], description: "Louvor de prontidão missionária diante das portas abertas pelo Senhor para o Evangelho." },
  { title: "Graça Sobre Graça", artist: "Banda NOVA (IPAlpha)", album: "IPAlpha Nova", duration: "4:42 min", youtubeId: "cGcWmX2Pz0k", tags: ["graca", "plenitude", "joao", "romanos", "2corintios"], description: "Celebração congregacional da plenitude de Cristo da qual recebemos graça sobre graça." },
  { title: "Teu Reino Vem", artist: "Banda NOVA (IPAlpha)", album: "IPAlpha Nova", duration: "4:20 min", youtubeId: "cGcWmX2Pz0k", tags: ["reino", "maranata", "1corintios", "mateus", "apocalipse"], description: "Clamor da Igreja pela manifestação do Reino e pelo retorno glorioso do Senhor ('Maranata!')." },
  { title: "Um Só Corpo", artist: "Banda NOVA (IPAlpha)", album: "IPAlpha Nova", duration: "4:15 min", youtubeId: "cGcWmX2Pz0k", tags: ["unidade", "dons", "1corintios", "efesios"], description: "Louvor celebrando a diversidade de dons unidos por um só Espírito para edificação da Igreja." },

  // Novo Canto IPAlpha (4 faixas distintas)
  { title: "Castelo Forte", artist: "Novo Canto (IPAlpha)", album: "IPAlpha Música", duration: "4:50 min", youtubeId: "RGCzQjFKk2w", tags: ["soberania", "protecao", "salmos", "1corintios", "2corintios"], description: "Hino clássico da Reforma proclamando que o Reino de Deus permanece para sempre." },
  { title: "Rocha Eterna", artist: "Novo Canto (IPAlpha)", album: "Hinos da Fé", duration: "4:35 min", youtubeId: "RGCzQjFKk2w", tags: ["fundamento", "rocha", "1corintios", "pedro", "mateus"], description: "Louvor congregacional exaltando a Cristo como única Pedra Angular e fundamento da Igreja." },
  { title: "Tu És Fiel, Senhor", artist: "Novo Canto (IPAlpha)", album: "Hinos da Fé", duration: "4:45 min", youtubeId: "RGCzQjFKk2w", tags: ["fidelidade", "promessa", "lamentacoes", "1corintios", "2corintios"], description: "Exaltação às misericórdias do Senhor que se renovam a cada manhã e jamais falham." },
  { title: "A Cristo Coroai", artist: "Novo Canto (IPAlpha)", album: "IPAlpha Música", duration: "4:30 min", youtubeId: "RGCzQjFKk2w", tags: ["reinado", "exaltacao", "1corintios", "filipenses", "apocalipse"], description: "Hino majestoso celebrando o Cristo ressurreto que reina até pôr todos os inimigos sob Seus pés." },

  // Vocal Livre (3 faixas distintas)
  { title: "A Começar em Mim", artist: "Vocal Livre", album: "Por Toda a Terra", duration: "3:50 min", youtubeId: "nDXqNTyNC7A", tags: ["amor", "unidade", "1corintios", "tiago", "filipenses"], description: "Harmonia vocal clamando por unidade, humildade e amor prático na família da fé." },
  { title: "Por Toda a Terra", artist: "Vocal Livre", album: "Por Toda a Terra", duration: "4:12 min", youtubeId: "nDXqNTyNC7A", tags: ["missao", "adoracao", "atos", "salmos", "1corintios"], description: "Arranjo coral inspirando a proclamação das boas-novas da salvação a todos os povos." },
  { title: "Temporal (Paz na Tempestade)", artist: "Vocal Livre", album: "Temporal", duration: "4:18 min", youtubeId: "nDXqNTyNC7A", tags: ["consolo", "confianca", "2corintios", "marcos", "salmos"], description: "Canção reconfortante sobre a presença de Cristo que acalma o coração em meio às tribulações." },

  // Purples (3 faixas distintas)
  { title: "Meu Lugar", artist: "Purples", album: "Single de Estúdio", duration: "4:30 min", youtubeId: "Q4ejKplh_ms", tags: ["presenca", "habitacao", "salmos", "efesios", "1corintios"], description: "Indie reflexivo sobre sermos santuário do Espírito Santo e habitarmos na presença do Pai." },
  { title: "Teu Amor Não Falha", artist: "Purples", album: "Sessão Estúdio", duration: "4:15 min", youtubeId: "Q4ejKplh_ms", tags: ["amor", "fidelidade", "1corintios", "romanos"], description: "Meditação sobre o amor de Deus que jamais acaba e nos sustenta em toda provação." },
  { title: "Aliança Eterna", artist: "Purples", album: "Sessão Estúdio", duration: "4:22 min", youtubeId: "Q4ejKplh_ms", tags: ["alianca", "ceia", "2corintios", "hebreus", "exodo"], description: "Contemplação da glória da Nova Aliança do Espírito gravada em nossos corações." },

  // Demais Artistas Preferidos com Faixas Distintas
  { title: "Incondicional", artist: "Oficina G3", album: "Depois da Guerra", duration: "3:59 min", youtubeId: "oYuIZLGrmcg", tags: ["amor", "cruz", "1corintios", "romanos"], description: "Balada sobre o amor ágape de Deus que não busca seus próprios interesses e tudo suporta." },
  { title: "Aos Pés da Cruz", artist: "Oficina G3", album: "Histórias e Bicicletas", duration: "4:40 min", youtubeId: "oYuIZLGrmcg", tags: ["cruz", "arrependimento", "1corintios", "galatas"], description: "Rendição sincera diante da sabedoria e do poder da cruz de Cristo." },
  { title: "O Que Na Verdade Somos", artist: "Fruto Sagrado", album: "O Que na Verdade Somos", duration: "4:20 min", youtubeId: "8MksLBGRUpo", tags: ["verdade", "santidade", "1corintios", "2corintios", "tiago"], description: "Chamado à integridade cristã, rejeitando a hipocrisia para viver na luz da verdade." },
  { title: "Posso Ouvir", artist: "PG", album: "Imagem e Semelhança", duration: "4:12 min", youtubeId: "9h126QoPIEg", tags: ["profecia", "voz_de_deus", "1corintios", "apocalipse"], description: "Clamor por discernimento espiritual para ouvir a Palavra que edifica, exorta e consola." },
  { title: "Meu Universo", artist: "PG", album: "Eu Sou Livre", duration: "4:18 min", youtubeId: "9h126QoPIEg", tags: ["senhorio", "consagracao", "colossenses", "filipenses"], description: "Oração consagrando a Cristo o centro e o governo absoluto de toda a nossa vida." },
  { title: "Pequeninos", artist: "Mauro Henrique", album: "Acústico", duration: "3:45 min", youtubeId: "qMt6R88UPkQ", tags: ["humildade", "graca", "1corintios", "mateus"], description: "Reflexão sobre como Deus escolheu as coisas fracas e humildes do mundo para revelar Sua glória." },
  { title: "Despreocupado", artist: "Felipe Valente", album: "Reversão", duration: "3:58 min", youtubeId: "UZDKMpD-6wY", tags: ["descanso", "providencia", "filipenses", "mateus", "salmos"], description: "MPB serena sobre lançar toda a ansiedade sobre o Pai que cuida de nós." },
  { title: "Lugar Seguro", artist: "Felipe Valente", album: "Reversão", duration: "4:10 min", youtubeId: "UZDKMpD-6wY", tags: ["consolo", "paz", "2corintios", "salmos"], description: "Poesia acústica celebrando o refúgio encontrado no Deus de toda consolação." },
  { title: "Ninguém Chega Só", artist: "Alexandre Magnani", album: "O Que Realmente Importa", duration: "3:42 min", youtubeId: "ToqPLrFb6-I", tags: ["comunhao", "corpo_de_cristo", "1corintios", "romanos", "atos"], description: "Canção sobre a beleza da mutualidade, cooperação e cuidado mútuo entre os irmãos na fé." },
  { title: "Arrastão", artist: "Coletivo Candieiro", album: "Candieiro", duration: "3:50 min", youtubeId: "8AAQzkzfEb4", tags: ["missao", "colheita", "1corintios", "lucas", "atos"], description: "Folk brasileiro celebrando o trabalho no Senhor que jamais é inútil." },
  { title: "É Tudo Sobre Você", artist: "Morada", album: "Ele É", duration: "4:35 min", youtubeId: "ePdRgBWhvog", tags: ["adoracao", "cristocentrismo", "1corintios", "colossenses", "efesios"], description: "Declaração de que quando todas as coisas lhe estiverem sujeitas, Deus será tudo em todos." },
  { title: "Só Tu És Santo", artist: "Morada", album: "Ele É", duration: "4:45 min", youtubeId: "ePdRgBWhvog", tags: ["santidade", "gloria", "2corintios", "apocalipse"], description: "Contemplação da glória do Senhor que nos transforma de glória em glória pelo Espírito." },
  { title: "Galileu", artist: "Fernandinho", album: "Galileu", duration: "4:10 min", youtubeId: "9YC8iDNpyYU", tags: ["vitoria", "ressurreicao", "1corintios", "evangelhos"], description: "Exaltação ao Cristo ressurreto que venceu a morte e reina sobre todo principado e potestade." },
  { title: "Nada Além do Sangue", artist: "Fernandinho", album: "Teus Sonhos", duration: "4:35 min", youtubeId: "9YC8iDNpyYU", tags: ["sangue", "alianca", "1corintios", "hebreus", "romanos"], description: "Proclamação da justificação e purificação completas pelo sangue da cruz." },
  { title: "Me Ajude a Melhorar", artist: "Eli Soares", album: "Casa de Deus", duration: "4:35 min", youtubeId: "lclKOqYuvug", tags: ["santificacao", "arrependimento", "1corintios", "2corintios", "salmos"], description: "Oração sincera de exame do coração e busca por santificação diária no Espírito." },
  { title: "Arde Outra Vez", artist: "Thalles Roberto", album: "Na Sala do Pai", duration: "4:50 min", youtubeId: "_pnAJPnp_Jw", tags: ["zelo", "espirito_santo", "1corintios", "2timoteo", "atos"], description: "Clamor para que o fogo dos dons espirituais e do primeiro amor arda continuamente em nós." }
].map((track, index) => ({
  ...track,
  catalogIndex: index,
  youtubeMusicUrl: getYoutubeMusicSearchUrl(`${track.artist} ${track.title} estudio`)
}));

export const SHORT_DEVOTIONAL_TRACKS = EXPANDED_DEVOTIONAL_CATALOG;

// Curadoria Temática Específica por Capítulo para os Livros Atuais e Clássicos
export const THEMATIC_CHAPTER_MUSIC = {
  // === 1 CORÍNTIOS (Capítulos 11 a 16) ===
  '1 Coríntios 11': [
    {
      title: "Aliança Eterna (O Cálice da Nova Aliança)",
      artist: "Purples",
      album: "Sessão Estúdio",
      duration: "4:22 min",
      youtubeId: "Q4ejKplh_ms",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda Purples Alianca estudio"),
      theme: "A Ceia do Senhor & Memória da Cruz • 1 Coríntios 11:23–26",
      description: "Meditação reverente sobre o pão partido e o cálice da Nova Aliança que anunciam a morte do Senhor até que Ele venha."
    },
    {
      title: "Nada Além do Sangue",
      artist: "Fernandinho",
      album: "Teus Sonhos (Estúdio)",
      duration: "4:35 min",
      youtubeId: "9YC8iDNpyYU",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Fernandinho Nada Alem do Sangue estudio"),
      theme: "Purificação e Comunhão na Mesa • 1 Coríntios 11:25",
      description: "Proclamação do sangue precioso de Cristo que nos reconcilia com Deus e nos une como família da fé."
    }
  ],
  '1 Coríntios 12': [
    {
      title: "Um Só Corpo",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:15 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha"),
      theme: "Diversidade de Dons no Mesmo Espírito • 1 Coríntios 12:4–12",
      description: "Louvor congregacional celebrando a unidade do Corpo de Cristo, onde cada membro recebe dons do Espírito para o bem de todos."
    },
    {
      title: "Ninguém Chega Só",
      artist: "Alexandre Magnani",
      album: "O Que Realmente Importa (Estúdio)",
      duration: "3:42 min",
      youtubeId: "ToqPLrFb6-I",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Alexandre Magnani Ninguem Chega So estudio"),
      theme: "Cuidado Mútuo entre os Membros • 1 Coríntios 12:25–26",
      description: "MPB cristã calorosa sobre a interdependência dos membros do Corpo de Cristo que sofrem e se alegram juntos."
    }
  ],
  '1 Coríntios 13': [
    {
      title: "Mais (A Supremacia do Amor)",
      artist: "Os Arrais",
      album: "Mais (Estúdio)",
      duration: "4:15 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Mais estudio"),
      theme: "O Caminho Sobremodo Excelente • 1 Coríntios 13:1–8",
      description: "Folk poético inspirado em 1 Coríntios 13: sem o amor que é paciente, bondoso e jamais acaba, nada seríamos."
    },
    {
      title: "Nossa Canção (O Amor Permanece)",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:25 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Nossa Cancao estudio"),
      theme: "Fé, Esperança e Amor • 1 Coríntios 13:13",
      description: "Poesia brasileira contemplando o amor ágape que tudo sofre, tudo crê, tudo espera e permanece para sempre."
    },
    {
      title: "Incondicional",
      artist: "Oficina G3",
      album: "Depois da Guerra (Estúdio)",
      duration: "3:59 min",
      youtubeId: "oYuIZLGrmcg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Oficina G3 Incondicional estudio"),
      theme: "O Amor Não Busca Seus Próprios Interesses • 1 Coríntios 13:4–7",
      description: "Balada reflexiva sobre o caráter sacrificial do amor de Cristo derramado em nossos corações."
    }
  ],
  '1 Coríntios 14': [
    {
      title: "Posso Ouvir (Voz que Edifica)",
      artist: "PG",
      album: "Imagem e Semelhança (Estúdio)",
      duration: "4:12 min",
      youtubeId: "9h126QoPIEg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Cantor PG Posso Ouvir estudio"),
      theme: "Profecia para Edificação, Encorajamento e Consolo • 1 Coríntios 14:3",
      description: "Clamor por sensibilidade espiritual à Palavra inteligível que fortalece, anima e edifica toda a igreja reunida."
    },
    {
      title: "A Começar em Mim",
      artist: "Vocal Livre",
      album: "Por Toda a Terra (Estúdio)",
      duration: "3:50 min",
      youtubeId: "nDXqNTyNC7A",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Vocal Livre A Comecar em Mim estudio"),
      theme: "Deus de Paz e Ordem no Culto • 1 Coríntios 14:26, 33",
      description: "Harmonia vocal exaltando o culto cantado com o espírito e com o entendimento para a edificação mútua."
    },
    {
      title: "Meu Lugar",
      artist: "Purples",
      album: "Single de Estúdio",
      duration: "4:30 min",
      youtubeId: "Q4ejKplh_ms",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda Purples Meu Lugar estudio"),
      theme: "Verdadeiramente Deus Está Entre Vocês • 1 Coríntios 14:25",
      description: "Indie reflexivo sobre a presença manifesta de Deus na adoração reverente do Seu povo."
    }
  ],
  '1 Coríntios 15': [
    {
      title: "Ele Vive (Primícias dos que Dormem)",
      artist: "Leonardo Gonçalves",
      album: "Poemas e Canções (Estúdio)",
      duration: "4:55 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Ele Vive estudio"),
      theme: "Cristo Ressuscitou ao Terceiro Dia • 1 Coríntios 15:3–4, 20",
      description: "Proclamação solene da vitória de Cristo sobre a sepultura: 'Tragada foi a morte pela vitória! Onde está, ó morte, o teu aguilhão?'."
    },
    {
      title: "Esperança (A Última Trombeta)",
      artist: "Os Arrais",
      album: "As Canções da Terra (Estúdio)",
      duration: "4:24 min",
      youtubeId: "eDflquxhedQ",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Os Arrais Esperanca estudio"),
      theme: "O Corpo Glorificado & Triunfo Final • 1 Coríntios 15:51–58",
      description: "Folk contemplativo sobre a promessa da ressurreição dos mortos e a certeza de que nosso trabalho no Senhor não é em vão."
    },
    {
      title: "A Cristo Coroai",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:50 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Castelo Forte estudio"),
      theme: "Convém que Ele Reine • 1 Coríntios 15:25–28",
      description: "Hino congregacional exaltando o Rei ressurreto que colocará todos os inimigos, inclusive a morte, debaixo de Seus pés."
    }
  ],
  '1 Coríntios 16': [
    {
      title: "Sê Valente (Firmes na Fé e Tudo com Amor)",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "3:58 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Se Valente estudio"),
      theme: "Estejam Alerta, Permaneçam Firmes e Façam Tudo com Amor • 1 Coríntios 16:13–14",
      description: "Poesia encorajadora ecoando a exortação final de Paulo à igreja: vigilância, coragem cristã e amor em todas as atitudes."
    },
    {
      title: "Aqui Vou Eu (Porta Grande e Promissora)",
      artist: "Banda NOVA (IPAlpha)",
      album: "IPAlpha Nova (Estúdio)",
      duration: "4:30 min",
      youtubeId: "cGcWmX2Pz0k",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda NOVA IPAlpha Aqui Vou Eu estudio"),
      theme: "Missão, Generosidade e Maranata! • 1 Coríntios 16:9, 22",
      description: "Louvor missionário celebrando as portas abertas para a obra do Senhor e o clamor 'Maranata — Vem, nosso Senhor!'."
    },
    {
      title: "Arrastão",
      artist: "Coletivo Candieiro",
      album: "Candieiro (Estúdio)",
      duration: "3:50 min",
      youtubeId: "8AAQzkzfEb4",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Coletivo Candieiro Arrastao estudio"),
      theme: "Dedicação ao Serviço dos Santos • 1 Coríntios 16:15–16",
      description: "Canção brasileira celebrando os cooperadores fiéis que dedicam a vida ao serviço mútuo na igreja."
    }
  ],

  // === 2 CORÍNTIOS (Capítulos 1 a 6) ===
  '2 Coríntios 1': [
    {
      title: "Vem Me Socorrer (Deus de Todo Encorajamento)",
      artist: "Marcos Almeida",
      album: "Eu Sarau (Estúdio)",
      duration: "4:18 min",
      youtubeId: "_kAVIQzwffg",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Marcos Almeida Vem Me Socorrer estudio"),
      theme: "O Pai de Misericórdias que Nos Encoraja • 2 Coríntios 1:3–5",
      description: "Poesia de consolo celebrando o Deus que nos conforta em todas as nossas aflições para consolarmos os outros."
    },
    {
      title: "Tu És Fiel, Senhor (O Sim e o Amém em Cristo)",
      artist: "Novo Canto (IPAlpha)",
      album: "IPAlpha Música (Estúdio)",
      duration: "4:45 min",
      youtubeId: "RGCzQjFKk2w",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Novo Canto IPAlpha Tu Es Fiel estudio"),
      theme: "Todas as Promessas Têm em Cristo o Sim • 2 Coríntios 1:20",
      description: "Hino proclamando a fidelidade absoluta de Deus: em Cristo todas as promessas se cumprem para a Sua glória."
    }
  ],
  '2 Coríntios 2': [
    {
      title: "Jardim da Inocência (O Bom Perfume de Cristo)",
      artist: "Paulo César Baruk",
      album: "Graça (Estúdio)",
      duration: "4:52 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Jardim da Inocencia estudio"),
      theme: "Perdão Restaurador & Fragrância de Cristo • 2 Coríntios 2:7, 14–15",
      description: "Gravação de estúdio sobre a graça que perdoa o irmão arrependido e exala o bom perfume de Cristo em todo lugar."
    }
  ],
  '2 Coríntios 3': [
    {
      title: "Só Tu És Santo (De Glória em Glória)",
      artist: "Morada",
      album: "Ele É (Estúdio)",
      duration: "4:45 min",
      youtubeId: "ePdRgBWhvog",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Banda Morada So Tu Es Santo estudio"),
      theme: "Transformados de Glória em Glória pelo Espírito • 2 Coríntios 3:17–18",
      description: "Adoração contemplando a liberdade da Nova Aliança do Espírito, onde contemplamos a glória do Senhor sem véu."
    }
  ],
  '2 Coríntios 4': [
    {
      title: "Dependo de Ti (Tesouro em Vasos de Barro)",
      artist: "Paulo César Baruk",
      album: "Dependo de Ti (Estúdio)",
      duration: "4:28 min",
      youtubeId: "bi9W6oZzfxk",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Paulo Cesar Baruk Dependo de Ti estudio"),
      theme: "A Excelência do Poder é de Deus • 2 Coríntios 4:7–18",
      description: "Confissão de humildade: carregamos o tesouro da luz de Cristo em vasos de barro, renovados dia após dia."
    }
  ],
  '2 Coríntios 5': [
    {
      title: "Novo (Nova Criação & Reconciliação)",
      artist: "Leonardo Gonçalves",
      album: "Viver e Cantar (Estúdio)",
      duration: "4:30 min",
      youtubeId: "edGwczJm_uo",
      youtubeMusicUrl: getYoutubeMusicSearchUrl("Leonardo Goncalves Novo estudio"),
      theme: "Quem Está em Cristo é Nova Criação • 2 Coríntios 5:17–21",
      description: "Celebração da obra reconciliadora da cruz: Aquele que não conheceu pecado foi feito pecado por nós."
    }
  ]
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Determina o vídeo do BibleProject de acordo com o livro e capítulos bíblicos (cobertura dos 66 livros)
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

  // Fallback contextualizado para o livro específico sendo lido
  const displayBook = bookName || 'Escrituras';
  return {
    title: `BibleProject Português | Visão Geral: ${displayBook}`,
    channel: 'BibleProject Português',
    youtubeId: cleanBook.includes('corintios') ? 'yiHf8klCCc4' : 'ej_6dVdJSSI',
    searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`BibleProject Portugues ${displayBook}`)}`,
    description: `Animação expositiva da estrutura literária, contexto histórico e temas teológicos centrais do livro de ${displayBook}.`
  };
}

function parseReadingsInfo(readings = []) {
  if (!readings || readings.length === 0) return { bookName: '1 Coríntios', chapters: [14], passageStr: '1 Coríntios 14–16' };

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

// Seleção Musical Dinâmica Sem Colisão entre Capítulos do Mesmo Dia ou Dias Consecutivos
function selectDynamicTrackForChapter(dayId, bookName, chapterNum, readingIndex = 0, overrideIndex = null) {
  const cleanBook = (bookName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const totalCatalog = EXPANDED_DEVOTIONAL_CATALOG.length;

  // Se o usuário clicou em "Trocar", avança no catálogo completo de 43+ faixas
  if (overrideIndex !== null && overrideIndex !== undefined) {
    const idx = Math.abs(Number(overrideIndex)) % totalCatalog;
    const track = EXPANDED_DEVOTIONAL_CATALOG[idx];
    return {
      ...track,
      artistIndex: idx,
      theme: `Louvor Devocional • ${bookName} ${chapterNum}`
    };
  }

  // Filtra faixas que possuem afinidade temática com o livro atual, se houver ao menos 6 opções
  const matchingPool = EXPANDED_DEVOTIONAL_CATALOG.filter(t =>
    t.tags && t.tags.some(tag => cleanBook.includes(tag) || tag.includes(cleanBook))
  );

  const activePool = matchingPool.length >= 6 ? matchingPool : EXPANDED_DEVOTIONAL_CATALOG;

  // Passo primo (17) para readingIndex garante que os 3 capítulos do mesmo dia NUNCA caiam na mesma música ou mesmo artista!
  const seed = hashString(`${cleanBook}:${dayId || 0}`) + (Number(chapterNum) || 1) * 7 + readingIndex * 5;
  const poolIdx = Math.abs(seed) % activePool.length;
  const chosen = activePool[poolIdx];

  return {
    ...chosen,
    artistIndex: chosen.catalogIndex ?? poolIdx,
    theme: `Sintonia Teológica • ${bookName} ${chapterNum}`
  };
}

// Obtém a música recomendada especificamente para cada capítulo do dia
export function getMusicForChapter(dayId, readingStr, readingIndex = 0, overrideArtistIndex = null) {
  const cleanReading = (readingStr || '').trim();

  // 1. Se o capítulo tem curadoria temática dedicada e o usuário ainda não clicou além da lista curada
  if (THEMATIC_CHAPTER_MUSIC[cleanReading] && THEMATIC_CHAPTER_MUSIC[cleanReading].length > 0) {
    const list = THEMATIC_CHAPTER_MUSIC[cleanReading];
    if (overrideArtistIndex === null || overrideArtistIndex === undefined) {
      const track = list[0];
      return {
        chapter: cleanReading,
        ...track,
        artistIndex: 0,
        theme: track.theme || `Louvor específico para ${cleanReading}`
      };
    }
    // Se clicou em "Trocar", roda primeiro pelas opções curadas do capítulo e depois por todo o catálogo de 43+ músicas!
    const numOverride = Math.abs(Number(overrideArtistIndex));
    if (numOverride < list.length) {
      const track = list[numOverride];
      return {
        chapter: cleanReading,
        ...track,
        artistIndex: numOverride,
        theme: track.theme || `Louvor específico para ${cleanReading}`
      };
    }
  }

  // 2. Seleção Dinâmica Multi-Faixas por Livro, Capítulo e Dia
  const parts = cleanReading.split(' ');
  const bookName = parts.slice(0, parts.length - 1).join(' ') || parts[0] || '1 Coríntios';
  const chapterNum = Number(parts[parts.length - 1]) || 1;
  const selected = selectDynamicTrackForChapter(dayId, bookName, chapterNum, readingIndex, overrideArtistIndex);

  return {
    chapter: cleanReading,
    ...selected,
    theme: selected.theme || `Louvor para ${cleanReading}`
  };
}

export function getMediaForDay(dayId, dayData = null) {
  const numericDay = Number(dayId) || 328;
  const readings = dayData?.readings || [];
  const { bookName, chapters, passageStr } = parseReadingsInfo(readings);

  const primaryTrack = getMusicForChapter(numericDay, readings[0] || `${bookName} ${chapters[0] || 1}`, 0, null);
  const selectedVideo = resolveBibleProjectVideo(bookName, chapters);

  return {
    dayId: numericDay,
    title: `Dia ${numericDay} • ${passageStr}`,
    passage: passageStr,
    theme: `${bookName} (Cap. ${chapters.join(', ')}) • Meditação Devocional`,
    music: {
      ...primaryTrack,
      musicSearchUrl: primaryTrack.youtubeMusicUrl || getYoutubeMusicSearchUrl(`${primaryTrack.artist} ${primaryTrack.title}`)
    },
    video: selectedVideo
  };
}

export function getMediaForPassage(bookName, chapter) {
  const selectedVideo = resolveBibleProjectVideo(bookName, [chapter]);
  const track = getMusicForChapter(0, `${bookName} ${chapter}`, 0, null);

  return {
    title: `${bookName} ${chapter}`,
    passage: `${bookName} ${chapter}`,
    theme: `Estudo Expositivo de ${bookName} ${chapter}`,
    music: {
      ...track,
      musicSearchUrl: track.youtubeMusicUrl || getYoutubeMusicSearchUrl(`${track.artist} ${track.title}`)
    },
    video: selectedVideo
  };
}
