// Curadoria de Músicas (YouTube Music / YouTube) e Vídeos (BibleProject / Estudos) conectados a cada dia de leitura

export const dailyMedia = {
  // Dia 297 - Lucas 10, 11 e 12
  297: {
    dayId: 297,
    title: "A Boa Parte & O Coração do Pai",
    passage: "Lucas 10–12",
    theme: "O Bom Samaritano, Maria aos Pés de Jesus, A Oração do Pai Nosso e a Liberdade da Ansiedade",
    music: {
      title: "Aos Pés da Cruz / A Boa Parte (Maria aos Pés de Jesus)",
      artist: "Laura Souguellis & Gabriel Guedes",
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

  // Dia 298 - Lucas 13, 14 e 15 (Hoje)
  298: {
    dayId: 298,
    title: "A Festa da Graça: O Abraço do Pai",
    passage: "Lucas 13–15",
    theme: "A Porta Estreita, O Grande Banquete, A Ovelha Perdida e a Parábola do Filho Pródigo",
    music: {
      title: "Pródigo (O Abraço do Pai)",
      artist: "Casa Worship",
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

  // Fallback padrão para outros dias
  default: {
    music: {
      title: "Pra Onde Eu Irei? / Graça Maravilhosa",
      artist: "Morada",
      youtubeId: "JPXjpqstzng",
      youtubeMusicUrl: "https://music.youtube.com/watch?v=JPXjpqstzng",
      description: "Momento de adoração para acalmar o coração e preparar a mente para ouvir a voz de Deus nas Escrituras."
    },
    video: {
      title: "Como Ler a Bíblia com Profundidade Devocional",
      channel: "BibleProject Português",
      youtubeId: "UeUAAAs7hec",
      description: "Guia prático para meditar e internalizar a mensagem viva da Palavra de Deus no dia a dia."
    }
  }
};

export function getMediaForDay(dayId) {
  return dailyMedia[dayId] || {
    ...dailyMedia.default,
    dayId,
    title: `Dia ${dayId}`,
    theme: "Meditação e Oração nas Escrituras"
  };
}
