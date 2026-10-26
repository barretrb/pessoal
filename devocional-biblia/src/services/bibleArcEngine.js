// Motor de Análise de Discurso e Arqueamento Bíblico Automático (BibleArc)
// Mapeia e entrega o arqueamento 100% pronto por temas do capítulo bíblico.
// Elimina necessidade de edição manual e marcação de versículos, permitindo degustar a análise visual e teológica.

import { BIBLE_ARC_RELATIONS } from '../data/bibleArcRelations.js';

// Temas e Arqueamentos Especializados Consagrados
const CURATED_CHAPTER_THEMES = {
  'Gênesis_2': [
    {
      id: 'gen-2-t1',
      themeTitle: '1. O Sétimo Dia: O Descanso Sagrado da Criação',
      passage: 'Gênesis 2:1-3',
      summary: 'A consumação gloriosa da criação e a instituição do descanso sagrado (sábado) por Deus.',
      propositions: [
        { id: 'p1', number: 1, text: 'Desse modo, completou-se a criação dos céus e da terra e de tudo que neles há.' },
        { id: 'p2', number: 2, text: 'No sétimo dia, Deus havia terminado sua obra de criação e descansou de todo o seu trabalho.' },
        { id: 'p3', number: 3, text: 'Deus abençoou o sétimo dia e o declarou santo, pois foi o dia em que ele descansou de toda a sua obra de criação.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Conclusão da Obra', color: '#6b7280', explanation: 'A oração 1 conclui a narrativa cósmica dos céus e terra, introduzindo a cessação do trabalho divino em [P2].' },
        { id: 'arc2', from: 3, to: 2, relation: 'ground', label: 'G', name: 'Causa / Fundamento (Ground)', color: '#3b82f6', explanation: 'A oração 3 estabelece o fundamento pelo qual Deus abençoou e santificou o sábado: porque Ele descansou de Sua obra consumada.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A consumação perfeita e o descanso soberano de Deus estabelecem o padrão eterno de descanso para toda a criação.',
      theologicalSynthesis: 'Gênesis 2:1-3 coroa o relato da criação com o descanso soberano de Deus. O Todo-Poderoso não descansa por fadiga física, mas para contemplar e celebrar a plenitude da obra consumada. A bênção e a santificação do sétimo dia [P3] repousam no fundamento [G] do repouso divino [P2], convidando o ser humano a cessar sua autossuficiência e desfrutar da aliança com o Criador.',
      practicalApplication: '1. O Descanso da Graça: O sábado bíblico nos ensina que a bênção precede o esforço; fomos criados para viver a partir do descanso de Deus.\n2. Santificação do Tempo: Separe momentos inegociáveis para desligar das correrias diárias e contemplar as obras do Senhor.\n3. Repouso em Cristo: Jesus é o nosso verdadeiro descanso sabático (Mt 11:28). Descanse sua alma na salvação que Ele já consumou.'
    },
    {
      id: 'gen-2-t2',
      themeTitle: '2. O Homem no Éden e a Ordem da Aliança',
      passage: 'Gênesis 2:7-9, 15-17',
      summary: 'A formação do homem do pó da terra, a plantação do Éden e o mandamento de obediência e vida.',
      propositions: [
        { id: 'p1', number: 1, text: 'O SENHOR Deus formou o homem do pó da terra e soprou o fôlego da vida em suas narinas, e o homem se tornou ser vivo.' },
        { id: 'p2', number: 2, text: 'O SENHOR Deus plantou um jardim no Éden e colocou o homem nele para cultivá-lo e tomar conta dele.' },
        { id: 'p3', number: 3, text: 'O SENHOR Deus lhe ordenou: "Coma à vontade dos frutos de todas as árvores do jardim,' },
        { id: 'p4', number: 4, text: 'exceto da árvore do conhecimento do bem e do mal,' },
        { id: 'p5', number: 5, text: 'se você comer desse fruto, com certeza morrerá".' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'purpose', label: 'Pur', name: 'Vocação Humana', color: '#059669', explanation: 'A vida concedida pelo sopro divino em [P1] tem como propósito o trabalho digno e o cuidado do jardim em [P2].' },
        { id: 'arc2', from: 3, to: 4, relation: 'contrast', label: 'Con', name: 'Limitação Santa', color: '#dc2626', explanation: 'A generosidade irrestrita de comer de todas as árvores é contrastada com o único limite protetor da aliança.' },
        { id: 'arc3', from: 4, to: 5, relation: 'condition', label: 'Cond', name: 'Sanção da Aliança', color: '#d97706', explanation: 'A transgressão do limite ético acarreta a certeza da morte física e espiritual.' }
      ],
      mainProp: 3,
      mainPropExplanation: 'A generosidade abundante de Deus é a premissa maior da vida humana no Éden, dentro dos limites da confiança.',
      theologicalSynthesis: 'O homem não é fruto do acaso, mas de uma formação amorosa e pessoal de Deus, dotado de fôlego vital e vocação sacerdotal no Jardim [P1-P2]. A aliança edênica reflete a generosidade transbordante do Criador [P3] com um limite protetor [P4-P5] que ensina que a verdadeira liberdade consiste em confiar na definição divina sobre o bem e o mal.',
      practicalApplication: '1. Reconheça a dignidade do seu trabalho: Cuidar do que Deus colocou em suas mãos é ato de adoração.\n2. Confie na sabedoria dos limites de Deus: As ordenanças divinas não visam nos privar, mas preservar nossa vida e comunhão com Ele.'
    },
    {
      id: 'gen-2-t3',
      themeTitle: '3. A Criação da Mulher e o Primeiro Casamento',
      passage: 'Gênesis 2:18, 21-24',
      summary: 'A insuficiência da solidão, a criação da mulher a partir da costela e a instituição da aliança conjugal.',
      propositions: [
        { id: 'p1', number: 1, text: 'O SENHOR Deus disse: "Não é bom que o homem esteja sozinho; farei alguém que o ajude e o complete".' },
        { id: 'p2', number: 2, text: 'Dessa costela o SENHOR Deus fez uma mulher e a trouxe ao homem.' },
        { id: 'p3', number: 3, text: 'Exclamou o homem: "Esta é osso dos meus ossos e carne da minha carne! Será chamada mulher, porque foi tirada do homem".' },
        { id: 'p4', number: 4, text: 'Por isso o homem deixa pai e mãe e se une à sua mulher, e os dois se tornam um só.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'purpose', label: 'Pur', name: 'Resposta Divina', color: '#059669', explanation: 'O diagnóstico da solidão humana em [P1] impulsiona o ato gracioso de Deus criar uma parceira idônea em [P2].' },
        { id: 'arc2', from: 2, to: 3, relation: 'progression', label: '+', name: 'Reconhecimento Alegre', color: '#6b7280', explanation: 'A apresentação da mulher resulta no primeiro cântico poético de júbilo da história humana.' },
        { id: 'arc3', from: 3, to: 4, relation: 'inference', label: '∴', name: 'Instituição Conjugal', color: '#2563eb', explanation: 'A igualdade ontológica expressa em [P3] fundamenta a ordenança perpétua do casamento monogâmico em [P4].' }
      ],
      mainProp: 4,
      mainPropExplanation: 'A união sagrada e indissolúvel do casamento é o clímax da relação comunitária estabelecida pelo próprio Deus.',
      theologicalSynthesis: 'Deus mesmo declara que a solidão não é boa [P1], revelando que o ser humano foi criado para a comunhão. A mulher é formada do lado do homem [P2] para ser sua igual em dignidade e parceira de vida. A resposta de Adão [P3] gera o princípio universal da família [P4], que segundo Paulo é o grande mistério que tipifica a união de Cristo e da Igreja.',
      practicalApplication: '1. Valorize e cultive a união no seu lar: O casamento foi desenhado por Deus para ser aliança de suporte e amor incondicional.\n2. Busque a verdadeira intimidade: Deixar e unir-se exige transparência diária e priorização do cônjuge acima das distrações do mundo.'
    }
  ],

  'Juízes_1': [
    {
      id: 'jui-1-t1',
      themeTitle: '1. A Consulta ao Senhor e a Promessa Soberana de Vitória',
      passage: 'Juízes 1:1-4',
      summary: 'Após a morte de Josué, Israel busca a direção divina e recebe a promessa de vitória para Judá.',
      propositions: [
        { id: 'p1', number: 1, text: 'Depois da morte de Josué, os israelitas perguntaram ao SENHOR: "Qual das tribos deve ser a primeira a atacar os cananeus?".' },
        { id: 'p2', number: 2, text: 'O SENHOR respondeu: "Judá,' },
        { id: 'p3', number: 3, text: 'pois eu entreguei a terra em suas mãos".' },
        { id: 'p4', number: 4, text: 'Os homens de Judá disseram a seus parentes da tribo de Simeão: "Venham conosco lutar contra os cananeus que vivem no território que nos foi designado como herança.' },
        { id: 'p5', number: 5, text: 'Depois ajudaremos vocês a conquistar o seu território".' },
        { id: 'p6', number: 6, text: 'Os homens de Simeão foram com Judá.' }
      ],
      arcs: [
        { id: 'arc1', from: 3, to: 2, relation: 'ground', label: 'G', name: 'Causa / Fundamento (Ground)', color: '#3b82f6', explanation: 'A promessa irrevogável de Deus ("eu entreguei a terra em suas mãos") é o fundamento [G] que garante a ordem e a vitória de Judá em [P2].' },
        { id: 'arc2', from: 1, to: 2, relation: 'progression', label: '+', name: 'Consulta e Resposta', color: '#6b7280', explanation: 'A oração humilde do povo de buscar a direção divina gera a resposta imediata do Senhor.' },
        { id: 'arc3', from: 2, to: 4, relation: 'inference', label: '∴', name: 'Obediência Ativa', color: '#2563eb', explanation: 'Confiando na palavra de Deus, Judá toma a iniciativa e convoca a tribo de Simeão em aliança fraterna.' },
        { id: 'arc4', from: 4, to: 5, relation: 'progression', label: '+', name: 'Acordo Fraterno', color: '#6b7280', explanation: 'Compromisso mútuo de socorro entre os irmãos de aliança.' },
        { id: 'arc5', from: 4, to: 6, relation: 'progression', label: '+', name: 'Ação Conjunta', color: '#6b7280', explanation: 'A unidade prática resulta no avanço conjunto de fé.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A resposta oracular e soberana de Deus direcionando o avanço de Judá com a garantia da vitória.',
      theologicalSynthesis: 'Juízes inicia mostrando a dependência de oração de Israel após a morte de Josué [P1]. A vitória prometida a Judá [P2] não descansa na bravura humana, mas na garantia prévia e soberana de Deus [P3]. A cooperação entre irmãos [P4-P6] é o fruto prático da fé que se apoia na promessa divina.',
      practicalApplication: '1. Ore antes de agir: Nunca tome grandes decisões confiando apenas na intuição; consulte ao Senhor em primeiro lugar.\n2. Descanse na promessa: A coragem nas batalhas espirituais decorre da certeza de que Deus já nos deu a vitória em Cristo.\n3. Coopere com os irmãos: Não lute sozinho; o Reino de Deus avança mediante comunhão e parceria fraterna.'
    },
    {
      id: 'jui-1-t2',
      themeTitle: '2. A Conquista de Hebrom e a Fé Fiel de Calebe',
      passage: 'Juízes 1:12-15, 19-20',
      summary: 'A tomada das montanhas por Judá e a herança concedida ao fiel Calebe conforme a promessa de Moisés.',
      propositions: [
        { id: 'p1', number: 1, text: 'O SENHOR estava com os homens de Judá, e eles tomaram posse da região montanhosa,' },
        { id: 'p2', number: 2, text: 'mas não conseguiram expulsar os habitantes da planície, porque estes tinham carros de guerra de ferro.' },
        { id: 'p3', number: 3, text: 'A cidade de Hebrom foi entregue a Calebe, exatamente como Moisés havia prometido,' },
        { id: 'p4', number: 4, text: 'e Calebe expulsou dali os três clãs dos descendentes de Enaque.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'contrast', label: 'Con', name: 'Contraste da Fé vs Medo', color: '#dc2626', explanation: 'A presença vitoriosa do Senhor nas montanhas contrasta com o temor diante dos carros de ferro dos habitantes da planície.' },
        { id: 'arc2', from: 3, to: 4, relation: 'inference', label: '∴', name: 'Fidelidade Comprovada', color: '#2563eb', explanation: 'A promessa cumprida em [P3] capacita o idoso Calebe a expulsar os gigantes mais temidos pela força da fé.' }
      ],
      mainProp: 1,
      mainPropExplanation: 'A presença do Senhor é a garantia da vitória sobre os gigantes e as circunstâncias hostis.',
      theologicalSynthesis: 'Este trecho evidencia o paradoxo espiritual de Israel: enquanto a presença do Senhor concede vitórias extraordinárias [P1], a incredulidade paralisa o povo diante dos carros de ferro [P2]. Em contraste glorioso brilha Calebe [P3-P4], cuja fé inabalável nas promessas do Senhor derrota os temidos gigantes.',
      practicalApplication: '1. Não se intimide com os "carros de ferro": Nenhuma oposição terrena pode impedir o plano de Deus para sua vida.\n2. Imite a perseverança de Calebe: A idade ou as limitações humanas não diminuem o vigor daquele que confia na Palavra do Senhor.'
    },
    {
      id: 'jui-1-t3',
      themeTitle: '3. A Falha das Tribos em Expulsar os Cananeus',
      passage: 'Juízes 1:21, 27-36',
      summary: 'O início da acomodação espiritual: as tribos toleram os idólatras e plantam as sementes da apostasia.',
      propositions: [
        { id: 'p1', number: 1, text: 'As tribos de Israel não expulsaram os cananeus de suas cidades,' },
        { id: 'p2', number: 2, text: 'em vez disso, permitiram que os cananeus continuassem a viver no meio deles,' },
        { id: 'p3', number: 3, text: 'e, quando Israel se tornou mais forte, obrigou os cananeus a fazer trabalhos forçados, mas nunca os expulsou totalmente.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Tolerância Perigosa', color: '#6b7280', explanation: 'A desobediência de não expulsar o pecado evolui para a convivência cômoda com a idolatria.' },
        { id: 'arc2', from: 2, to: 3, relation: 'inference', label: '∴', name: 'Acomodação Pragmática', color: '#2563eb', explanation: 'Em vez de obedecer integralmente a Deus, o povo prefere a vantagem econômica de trabalhos forçados.' }
      ],
      mainProp: 1,
      mainPropExplanation: 'A advertência severa contra a obediência parcial e a tolerância com aquilo que Deus ordenou erradicar.',
      theologicalSynthesis: 'O final de Juízes 1 é uma advertência dramática contra o pragmatismo carnal. As tribos acharam mais vantajoso cobrar tributos e conviver com os cananeus [P3] do que obedecer radicalmente a Deus. Essa concessão custou caro: os povos deixados se tornaram espinhos e laço de corrupção moral.',
      practicalApplication: '1. Cuidado com o pecado de estimação: Não negocie com áreas da sua vida que Deus pediu para entregar no altar.\n2. A obediência parcial é desobediência: O Senhor requer fidelidade integral, pois concessões espirituais hoje geram amargura amanhã.'
    }
  ],

  'Lucas_11': [
    {
      id: 'luc-11-t1',
      themeTitle: '1. O Modelo da Oração do Pai-Nosso',
      passage: 'Lucas 11:1-4',
      summary: 'Jesus ensina aos discípulos as prioridades da oração: o nome de Deus, o Reino e a provisão diária.',
      propositions: [
        { id: 'p1', number: 1, text: 'Um dos discípulos disse a Jesus: "Senhor, ensina-nos a orar, como João ensinou aos seus discípulos".' },
        { id: 'p2', number: 2, text: 'Jesus respondeu: "Quando vocês orarem, digam: Pai, santificado seja o teu nome, venha o teu reino.' },
        { id: 'p3', number: 3, text: 'Dá-nos cada dia o nosso pão cotidiano;' },
        { id: 'p4', number: 4, text: 'perdoa-nos os nossos pecados, pois nós também perdoamos a todos que nos ofendem.' },
        { id: 'p5', number: 5, text: 'E não nos deixes cair em tentação".' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Instrução do Mestre', color: '#6b7280', explanation: 'O pedido do discípulo abre espaço para o modelo supremo de oração cristã.' },
        { id: 'arc2', from: 2, to: 3, relation: 'progression', label: '+', name: 'Provisão Diária', color: '#6b7280', explanation: 'Da adoração ao Pai celestial desce-se para a humilde dependência do pão de cada dia.' },
        { id: 'arc3', from: 4, to: 4, relation: 'ground', label: 'G', name: 'Graça e Perdão Mútuo', color: '#3b82f6', explanation: 'O perdão que recebemos de Deus reverbera diretamente na nossa disposição de perdoar os ofensores.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A paternidade de Deus e a busca prioritária do Seu Reino e glória acima de qualquer outro pedido.',
      theologicalSynthesis: 'A oração cristã genuína começa com filiação e reverência ("Pai, santificado seja o teu nome") [P2]. O coração alinhado com o Reino de Deus aprende a depender do pão para o dia presente [P3], a viver no fluir do perdão recebido e compartilhado [P4] e a pedir guarda espiritual contra as ciladas do tentador [P5].',
      practicalApplication: '1. Centralize suas orações na glória de Deus antes de listar suas necessidades pessoais.\n2. Cultive um coração livre de mágoas: o perdão diário é o oxigênio da comunhão com o Pai.'
    },
    {
      id: 'luc-11-t2',
      themeTitle: '2. A Oração Persistente e a Generosidade do Pai',
      passage: 'Lucas 11:9-13',
      summary: 'Peçam, busquem e batam: a certeza de que o Pai Celestial acolhe e concede o Espírito Santo aos que pedem.',
      propositions: [
        { id: 'p1', number: 1, text: 'Peçam, e lhes será dado; busquem, e encontrarão; batam, e a porta lhes será aberta.' },
        { id: 'p2', number: 2, text: 'Pois todo o que pede recebe; o que busca encontra; e, a quem bate, a porta será aberta.' },
        { id: 'p3', number: 3, text: 'Se vocês, que são maus, sabem dar bons presentes a seus filhos,' },
        { id: 'p4', number: 4, text: 'quanto mais o Pai do céu dará o Espírito Santo aos que lhe pedirem!' }
      ],
      arcs: [
        { id: 'arc1', from: 2, to: 1, relation: 'ground', label: 'G', name: 'Causa / Fundamento (Ground)', color: '#3b82f6', explanation: 'A certeza e infalibilidade do acolhimento divino em [P2] é o fundamento da ordem de perseverar em oração [P1].' },
        { id: 'arc2', from: 3, to: 4, relation: 'inference', label: '∴', name: 'Argumento do Menor para o Maior', color: '#2563eb', explanation: 'Se pais humanos imperfeitos amam presentear seus filhos, o Pai Celeste, infinitamente bom, dará a dádiva suprema: o Espírito Santo.' }
      ],
      mainProp: 1,
      mainPropExplanation: 'O imperativo de Jesus conclamando os discípulos a uma postura ativa, confiante e persistente em oração.',
      theologicalSynthesis: 'Jesus convoca seus seguidores à oração contínua e audaciosa [P1], ancorada não na justiça humana, mas na certeza da fidelidade do Pai Celeste [P2]. O ponto culminante da generosidade de Deus não são riquezas passageiras, mas a concessão do próprio Espírito Santo [P4], a maior de todas as bênçãos.',
      practicalApplication: '1. Não desista de orar por suas causas espirituais: Deus tem prazer em atender ao filho que persevera com fé.\n2. Peça o enchimento do Espírito Santo: Essa é a promessa prioritária do Pai para guiar seu dia.'
    }
  ]
};

export const bibleArcEngine = {
  // Compatibilidade: retorna o tema principal de uma citação
  getStudy(passageCitation, rawText = '') {
    const parts = (passageCitation || '').trim().split(' ');
    const book = parts[0] || 'Gênesis';
    const ch = (parts[1] || '1').split(':')[0];
    const study = this.getChapterThematicStudy(book, ch);
    return study.themes[0];
  },

  // Retorna os temas e arqueamentos já estruturados de um capítulo
  getChapterThematicStudy(bookName, chapter, chapterVerses = []) {
    const cleanBook = (bookName || 'Gênesis').trim();
    const cleanChapter = String(chapter || '1').trim();
    const lookupKey = `${cleanBook}_${cleanChapter}`;

    // 1. Verifica se temos arqueamento temático pré-calculado curado
    if (CURATED_CHAPTER_THEMES[lookupKey]) {
      return {
        book: cleanBook,
        chapter: cleanChapter,
        chapterTitle: `${cleanBook} ${cleanChapter}`,
        themes: CURATED_CHAPTER_THEMES[lookupKey]
      };
    }

    // 2. Se não temos tema específico curado, gera a segmentação temática automática a partir dos versículos do capítulo
    return this.generateThematicArcsFromVerses(cleanBook, cleanChapter, chapterVerses);
  },

  // Segmentador e gerador automático por temas para qualquer livro e capítulo da Bíblia
  generateThematicArcsFromVerses(bookName, chapter, verses = []) {
    const totalVerses = verses.length;

    // Se não há versículos carregados, cria tema representativo daquele livro/capítulo
    if (totalVerses === 0) {
      return {
        book: bookName,
        chapter: chapter,
        chapterTitle: `${bookName} ${chapter}`,
        themes: [
          {
            id: `${bookName}-${chapter}-t1`,
            themeTitle: `1. Exposição Central de ${bookName} ${chapter}`,
            passage: `${bookName} ${chapter}:1-5`,
            summary: `Panorama da revelação divina e dos mandamentos centrais contidos em ${bookName} ${chapter}.`,
            propositions: [
              { id: 'p1', number: 1, text: `Proclamação inicial e contexto da aliança em ${bookName} ${chapter}.` },
              { id: 'p2', number: 2, text: `A verdade revelada por Deus para instrução e transformação do Seu povo.` },
              { id: 'p3', number: 3, text: `A resposta requerida de fé, adoração e obediência diária ao Senhor.` }
            ],
            arcs: [
              { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Revelação Divina', color: '#6b7280', explanation: 'A abertura do texto bíblico estabelece o alicerce para a verdade divina.' },
              { id: 'arc2', from: 2, to: 3, relation: 'inference', label: '∴', name: 'Chamado à Obediência', color: '#2563eb', explanation: 'A revelação do caráter de Deus exige uma resposta de fé prática daquele que ouve.' }
            ],
            mainProp: 2,
            mainPropExplanation: 'A verdade soberana de Deus manifestada neste capítulo como luz para a nossa caminhada.',
            theologicalSynthesis: `No capítulo ${chapter} de ${bookName}, o Senhor comunica Sua santidade e sabedoria. O leitor é convidado a meditar em como a revelação divina desafia o comodismo humano e aponta para a soberania do Redentor.`,
            practicalApplication: `Guardar os ensinamentos de ${bookName} ${chapter} em mente e coração, buscando viver em conformidade com a vontade de Deus hoje.`
          }
        ]
      };
    }

    // Divide os versículos do capítulo em 2 a 3 perícopes temáticas lógicas
    const chunkSize = Math.max(3, Math.ceil(totalVerses / (totalVerses > 15 ? 3 : 2)));
    const themes = [];

    for (let i = 0; i < totalVerses && themes.length < 3; i += chunkSize) {
      const slice = verses.slice(i, i + chunkSize);
      const startV = slice[0]?.number || (i + 1);
      const endV = slice[slice.length - 1]?.number || (i + slice.length);
      const themeIndex = themes.length + 1;
      const passageCitation = `${bookName} ${chapter}:${startV}-${endV}`;

      // Monta as proposições do trecho
      const combinedText = slice.map(v => v.text).join(' ');
      const rawSentences = combinedText
        .split(/(?<=[.;!?:])\s+/)
        .map(s => s.replace(/^\d+\s*/, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 5);

      const propositions = rawSentences.map((text, idx) => ({
        id: `p${idx + 1}`,
        number: idx + 1,
        text
      }));

      if (propositions.length === 0) continue;

      // Análise automática dos conectivos de discurso
      const arcs = [];
      let mainProp = 1;

      propositions.forEach((p, idx) => {
        const lower = p.text.toLowerCase();
        const currentNum = p.number;

        if (lower.startsWith('pois ') || lower.startsWith('porque ') || lower.includes(', pois ') || lower.includes(', porque ')) {
          if (currentNum > 1) {
            arcs.push({
              id: `arc_${currentNum}_g`,
              from: currentNum,
              to: currentNum - 1,
              relation: 'ground',
              label: 'G',
              name: 'Causa / Fundamento',
              color: '#3b82f6',
              explanation: `A oração [P${currentNum}] estabelece a razão ou motivo bíblico que fundamenta o que foi afirmado em [P${currentNum - 1}].`
            });
            mainProp = currentNum - 1;
          }
        } else if (lower.includes('para que ') || lower.includes('a fim de ')) {
          if (currentNum > 1) {
            arcs.push({
              id: `arc_${currentNum}_pur`,
              from: currentNum - 1,
              to: currentNum,
              relation: 'purpose',
              label: 'Pur',
              name: 'Propósito',
              color: '#059669',
              explanation: `A oração [P${currentNum}] revela o objetivo e o propósito divino a ser alcançado por meio de [P${currentNum - 1}].`
            });
          }
        } else if (lower.startsWith('mas ') || lower.startsWith('porém ') || lower.startsWith('contudo ')) {
          if (currentNum > 1) {
            arcs.push({
              id: `arc_${currentNum}_con`,
              from: currentNum - 1,
              to: currentNum,
              relation: 'contrast',
              label: 'Con',
              name: 'Contraste',
              color: '#dc2626',
              explanation: `A oração [P${currentNum}] introduz um contraste essencial com a proposição anterior, redirecionando o argumento.`
            });
          }
        } else if (lower.startsWith('portanto ') || lower.startsWith('por isso ') || lower.startsWith('assim ')) {
          if (currentNum > 1) {
            arcs.push({
              id: `arc_${currentNum}_inf`,
              from: currentNum - 1,
              to: currentNum,
              relation: 'inference',
              label: '∴',
              name: 'Inferência / Conclusão',
              color: '#2563eb',
              explanation: `A oração [P${currentNum}] é a conclusão inevitável e prática que se deduz do ensinamento precedente.`
            });
            mainProp = currentNum;
          }
        } else if (currentNum > 1 && !arcs.some(a => a.to === currentNum || a.from === currentNum)) {
          arcs.push({
            id: `arc_${currentNum}_prog`,
            from: currentNum - 1,
            to: currentNum,
            relation: 'progression',
            label: '+',
            name: 'Progressão do Discurso',
            color: '#6b7280',
            explanation: `Desenvolvimento contínuo da narrativa sagrada, avançando da oração [P${currentNum - 1}] para [P${currentNum}].`
          });
        }
      });

      const mainText = propositions.find(p => p.number === mainProp)?.text || propositions[0].text;

      themes.push({
        id: `${bookName}-${chapter}-t${themeIndex}`,
        themeTitle: `${themeIndex}. Perícope Temática (vv. ${startV}-${endV})`,
        passage: passageCitation,
        summary: `Meditação exegética dos versículos ${startV} a ${endV} de ${bookName} ${chapter}.`,
        propositions,
        arcs,
        mainProp,
        mainPropExplanation: `A tese central desta perícope concentra-se em [P${mainProp}], em torno da qual as demais orações se organizam.`,
        theologicalSynthesis: `A análise de discurso revela que o ponto nevrálgico deste trecho de ${bookName} ${chapter} repousa na proposição [P${mainProp}]: "${mainText}". As relações lógicas circundantes sustentam a fidelidade do Senhor e conclamam o crente à confiança e retidão.`,
        practicalApplication: `1. Guarde a proposição [P${mainProp}] como princípio orientador para seus pensamentos hoje.\n2. Aplique a instrução deste trecho de ${bookName} ${chapter} em atitudes concretas de amor e temor a Deus.`
      });
    }

    return {
      book: bookName,
      chapter: chapter,
      chapterTitle: `${bookName} ${chapter}`,
      themes: themes.length > 0 ? themes : [this.generateDefaultSingleTheme(bookName, chapter)]
    };
  },

  generateDefaultSingleTheme(bookName, chapter) {
    return {
      id: `${bookName}-${chapter}-default`,
      themeTitle: `1. Análise Exegética de ${bookName} ${chapter}`,
      passage: `${bookName} ${chapter}`,
      summary: `Estudo de discurso completo de ${bookName} ${chapter}.`,
      propositions: [
        { id: 'p1', number: 1, text: `A revelação e a aliança de Deus em ${bookName} ${chapter}.` },
        { id: 'p2', number: 2, text: `O propósito soberano do Senhor instruindo a vida do Seu povo.` },
        { id: 'p3', number: 3, text: `A resposta obediente de adoração e fé cristã no dia a dia.` }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Progressão da Revelação', color: '#6b7280', explanation: 'A verdade divina se desdobra em mandamento e promessa viva.' },
        { id: 'arc2', from: 2, to: 3, relation: 'inference', label: '∴', name: 'Fruto de Obediência', color: '#2563eb', explanation: 'A revelação acolhida gera frutos de temor e serviço a Deus.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A soberania e a graça de Deus como alicerce de toda a passagem bíblica.',
      theologicalSynthesis: `Em ${bookName} ${chapter}, contemplamos a fidelidade inabalável do Senhor Jesus Cristo e as ordenanças santas da Escritura para nos edificar.`,
      practicalApplication: `Dedicar momentos do dia para orar com base nas verdades de ${bookName} ${chapter}.`
    };
  }
};
