// Serviço Central de Comentários Bíblicos Expositivos e Teológicos
// Fornece análises expositivas, temas de meditação e conexão cristocêntrica para todos os livros da Bíblia.

import { BIBLE_BOOKS_STUDY_INFO } from '../data/bibleBooksStudyInfo.js';

// Comentários expositivos especializados para livros e capítulos de destaque
const CURATED_COMMENTARIES = {
  'Juízes': {
    '1': {
      title: 'Juízes 1 - A Conquista Incompleta e a Dependência de Deus',
      overview: 'O livro de Juízes inicia com a transição crítica da liderança de Josué para o período dos juízes. O capítulo 1 registra a consulta espiritual de Israel ao SENHOR antes da batalha e a resposta divina que garante a vitória de Judá. Contudo, ao longo do avanço militar, as tribos começam a falhar em expulsar totalmente os cananeus, estabelecendo as raízes do declínio moral e espiritual que marcará este período da história de Israel.',
      keyThemes: [
        'Consulta e Dependência em Oração antes da Tomada de Decisões',
        'A Promessa Soberana de Deus: "Eu entreguei a terra em suas mãos"',
        'Cooperação Fraterna entre as Tribos (Judá e Simeão)',
        'O Perigo das Vitórias e Obediência Incompletas'
      ],
      christocentricKey: 'Enquanto Judá e os líderes humanos falharam em assegurar uma conquista permanente, Jesus Cristo é o verdadeiro Leão da Tribo de Judá que derrotou definitivamente todos os principados e potestades na cruz.'
    },
    '2': {
      title: 'Juízes 2 - O Ciclo dos Juízes e a Paciência da Graça',
      overview: 'Este capítulo serve como o prefácio teológico de todo o livro de Juízes. O Anjo do SENHOR repreende Israel por quebrar a aliança. Apresenta-se o padrão recorrente que definirá a nação: Pecado ➔ Opressão ➔ Clamor ➔ Libertação pelo Juiz ➔ Recaída após a morte do libertador.',
      keyThemes: [
        'A Memória Espiritual que Não Pode Ser Esquecida pelas Próximas Gerações',
        'A Gravidade da Idolatria e da Mistura Cultural',
        'A Paciência Incansável de Deus diante do Clamor do Povo'
      ],
      christocentricKey: 'Os juízes eram libertadores imperfeitos e temporários. Cristo é o Juiz e Libertador Eterno, cuja vitória nunca é revertida pela fraqueza da carne.'
    }
  },
  'Gênesis': {
    '1': {
      title: 'Gênesis 1 - A Soberania Criadora e a Dignidade Humana',
      overview: 'O relato inaugural das Escrituras apresenta o Deus Altíssimo criando os céus e a terra pelo poder infalível de Sua Palavra ("Haja... e houve"). O caos primitivo é ordenado com majestade e beleza, culminando na criação do homem e da mulher à Sua imagem e semelhança (Imago Dei).',
      keyThemes: [
        'A Autoexistência e Soberania Absoluta do Criador',
        'O Poder Eficaz da Palavra de Deus',
        'A Dignidade Sagrada de Cada Vida Humana',
        'A Criação Originalmente Boa e Perfeita'
      ],
      christocentricKey: 'Jesus é o Verbo Eterno (Logos) por meio de quem todas as coisas foram criadas (João 1:1-3; Colossenses 1:16).'
    },
    '2': {
      title: 'Gênesis 2 - A Aliança no Éden, o Descanso e o Matrimônio',
      overview: 'Gênesis 2 foca na intimidade da relação entre Deus e o ser humano. Deus institui o sábado como descanso sagrado, sopra o fôlego da vida no homem de barro, planta o Jardim do Éden e institui o casamento como aliança santa e indissolúvel.',
      keyThemes: [
        'O Sábado como Descanso e Contemplação da Graça',
        'O Trabalho como Vocação Santa antes da Queda',
        'A Instituição Divina da Família e do Casamento'
      ],
      christocentricKey: 'O descanso do sábado aponta para o descanso perfeito da salvação em Cristo (Hebreus 4), e o casamento tipifica a união de Cristo e Sua Igreja (Efésios 5).'
    },
    '3': {
      title: 'Gênesis 3 - A Queda, a Maldição e a Promessa do Protoevangelho',
      overview: 'A entrada trágica do pecado e da morte na experiência humana pela desobediência a Deus. Em meio à sentença e expulsão do Jardim, brilha a primeira promessa messiânica da história (Protoevangelho): o descendente da mulher que esmagará a cabeça da serpente.',
      keyThemes: [
        'A Sutileza da Tentação e a Dúvida da Palavra de Deus',
        'As Consequências Devastadoras do Pecado',
        'A Graça Soberana que Busca o Pecador ("Onde estás?")',
        'O Protoevangelho (Gênesis 3:15)'
      ],
      christocentricKey: 'Cristo é a semente prometida que, no Calvário, teve Seu calcanhar ferido, mas esmagou para sempre a cabeça do diabo.'
    }
  },
  'Romanos': {
    '1': {
      title: 'Romanos 1 - O Poder do Evangelho e a Revelação da Justiça de Deus',
      overview: 'Paulo introduz sua magnum opus teológica declarando que não se envergonha do Evangelho, pois ele é o poder de Deus para salvação de todo o que crê. A passagem expõe a justa ira divina contra a idolatria e a supressão deliberada da verdade.',
      keyThemes: [
        'O Evangelho como Dinamismo Transformador de Deus',
        'A Justificação pela Fé: "O justo viverá pela fé"',
        'A Gravidade da Rejeição à Verdade Revelada na Criação'
      ],
      christocentricKey: 'O Evangelho é a proclamação das boas novas acerca do Filho de Deus, ressuscitado dentre os mortos para nossa redenção.'
    },
    '8': {
      title: 'Romanos 8 - A Vida no Espírito, Filiação e a Certeza do Amor Inabalável',
      overview: 'Considerado um dos capítulos mais sublimes de toda a Bíblia. Inicia com "nenhuma condenação há para os que estão em Cristo Jesus" e conclui com a garantia de que nada neste universo poderá nos separar do amor de Deus que está em Cristo.',
      keyThemes: [
        'Libertação da Lei do Pecado e da Morte',
        'A Adoção como Filhos de Deus pelo Espírito Santo',
        'A Esperança da Glória Futura em meio aos Sofrimentos Presentes',
        'A Intercessão do Espírito Santo e a Segurança Eterna'
      ],
      christocentricKey: 'Nossa segurança repousa inteiramente na obra consumada de Cristo e em Sua intercessão contínua à destra do Pai.'
    },
    '12': {
      title: 'Romanos 12 - O Culto Racional, Renovação da Mente e Vida em Comunidade',
      overview: 'A transição da alta teologia dogmática para a ética prática cristã. Paulo roga pelas misericórdias de Deus para que ofereçamos nossos corpos em sacrifício vivo, rejeitando a conformação ao mundo e servindo com dons na igreja.',
      keyThemes: [
        'Consagração Integral como Culto Espiritual',
        'Renovação Mental pelo Espírito Santo',
        'Uso Humilde dos Dons Espirituais no Corpo de Cristo',
        'O Amor Genuíno e a Vencimento do Mal pelo Bem'
      ],
      christocentricKey: 'Jesus é o modelo perfeito do sacrifício vivo e agradável a Deus, chamando-nos a refletir Seu caráter sacrificial.'
    }
  },
  'Salmos': {
    '1': {
      title: 'Salmos 1 - Os Dois Caminhos: O Justo e o Ímpio',
      overview: 'O pórtico de entrada de todo o saltério. Contrasta a vida do bem-aventurado, que medita dia e noite na lei do SENHOR e floresce como árvore junto a ribeiros, com o caminho dos ímpios, que são como palha levada pelo vento.',
      keyThemes: [
        'A Delícia e o Poder da Meditação Diária na Palavra',
        'A Fertilidade Espiritual daquele que Permanece em Deus',
        'O Julgamento e a Instabilidade do Caminho dos Descrentes'
      ],
      christocentricKey: 'Cristo é o único Homem perfeitamente justo de Salmos 1, e nós nos tornamos justos unidos a Ele.'
    },
    '23': {
      title: 'Salmos 23 - O Bom Pastor e a Abundância da Graça',
      overview: 'O hino de confiança mais amado da história humana. Davi expressa a segurança total no cuidado de Jeová Rohi (O Senhor Meu Pastor), que guia, restaura, acompanha no vale da sombra da morte e prepara um banquete perene na presença dos adversários.',
      keyThemes: [
        'O Cuidado Pessoal e Suficiente de Deus ("Nada me faltará")',
        'Descanso e Restauração para a Alma Cansada',
        'A Presença Confortadora de Deus nos Momentos de Aflição',
        'A Bondade e a Misericórdia como Companheiras Diárias'
      ],
      christocentricKey: 'Jesus Cristo declara explicitamente: "Eu sou o Bom Pastor; o bom pastor dá a vida pelas suas ovelhas" (João 10:11).'
    }
  }
};

// Gerador contextual dinâmico de comentários para qualquer livro e capítulo da Bíblia
export const bibleCommentaryService = {
  getCommentary(bookName, chapter, verses = []) {
    const cleanBook = (bookName || '').trim();
    const cleanChapter = String(chapter || '1').trim();

    // 1. Verifica se já temos comentário dedicado pré-escrito
    if (CURATED_COMMENTARIES[cleanBook]?.[cleanChapter]) {
      return CURATED_COMMENTARIES[cleanBook][cleanChapter];
    }

    // 2. Busca informações panorâmicas do livro
    const bookStudy = BIBLE_BOOKS_STUDY_INFO.find(b => 
      b.name.toLowerCase() === cleanBook.toLowerCase() || 
      b.id.toLowerCase() === cleanBook.toLowerCase()
    );

    // 3. Se for um capítulo de Lucas, utiliza as diretrizes já conhecidas do Evangelho
    if (cleanBook.toLowerCase() === 'lucas') {
      return {
        title: `Lucas ${cleanChapter} - O Evangelho da Graça aos Humildes`,
        overview: `Capítulo ${cleanChapter} do Evangelho de Lucas na Nova Versão Transformadora (NVT). O médico amado apresenta Jesus como o Filho do Homem que veio buscar e salvar o perdido, enfatizando oração, a ação do Espírito Santo e a compaixão divina pelos necessitados.`,
        keyThemes: [
          'A Revelação do Caráter Compassivo de Cristo',
          'O Chamado ao Discipulado Radical e Oração',
          'O Reino de Deus Presente e Operante'
        ],
        christocentricKey: 'Lucas revela Jesus como o Salvador compassivo que acolhe os pecadores arrependidos e restaura a dignidade dos marginalizados.'
      };
    }

    // 4. Constrói comentário contextual sólido e teológico para qualquer livro e capítulo
    const authorText = bookStudy?.author ? `escrito sob a inspiração divina por ${bookStudy.author}` : '';
    const purposeText = bookStudy?.purpose || 'revelar a aliança, a fidelidade e a redenção de Deus para o Seu povo';
    const category = bookStudy?.category || 'as Sagradas Escrituras';

    const sampleThemes = (bookStudy?.centralThemes && bookStudy.centralThemes.length > 0)
      ? bookStudy.centralThemes.slice(0, 3)
      : [
          'A Soberania e Santidade de Deus',
          'A Obediência de Fé e o Arrependimento',
          'A Fidelidade às Promessas da Aliança'
        ];

    return {
      title: `${cleanBook} ${cleanChapter} - Exposição & Contexto Bíblico`,
      overview: `No capítulo ${cleanChapter} do livro de ${cleanBook} (${category}), o texto sagrado ${authorText} desenvolve a revelação divina com o propósito de ${purposeText.toLowerCase().replace(/\.$/, '')}. A passagem convida o leitor a meditar profundamente na fidelidade de Deus em meio às circunstâncias humanas, destacando a necessidade de fé perseverante, submissão à vontade soberana do Senhor e discernimento espiritual para a vida diária.`,
      keyThemes: [
        ...sampleThemes,
        `Meditação e Aplicação Pessoal de ${cleanBook} ${cleanChapter}`
      ],
      christocentricKey: `Toda a Escritura converge para Cristo. Neste capítulo de ${cleanBook}, vemos sombras, tipos ou mandamentos que nos conduzem à dependência da graça consumada em Jesus Cristo nosso Senhor.`
    };
  }
};
