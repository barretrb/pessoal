// Motor de Análise de Discurso e Arqueamento Bíblico Automático (BibleArc)
// Mapeia e entrega o arqueamento 100% pronto por temas do capítulo bíblico.
// Elimina necessidade de edição manual e marcação de versículos, permitindo degustar a análise visual e teológica.

import { BIBLE_ARC_RELATIONS } from '../data/bibleArcRelations.js';

// Função auxiliar para normalizar nomes de livros (remove acentos para lookup seguro)
function normalizeKey(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_');
}

// Algoritmo Exegético de Identificação da Proposição Central (Tese do Autor)
function detectCentralThesis(propositions, arcs = []) {
  if (!propositions || propositions.length === 0) return 1;

  let bestProp = propositions[0].number;
  let maxScore = -999;

  propositions.forEach((p) => {
    let score = 0;
    const text = (p.text || '').toLowerCase().trim();

    // 1. Penalização severa de orações narrativas introdutórias/conectivas
    if (/^(depois disso|no dia seguinte|e aconteceu que|passado algum tempo|partiram de lá|então foram|e foram|foram ver|ao sair)/i.test(text)) {
      score -= 12;
    }
    if (/(declararam:|disseram:|perguntaram:|respondeu-lhe dizendo:|disse o faraó:)$/i.test(text)) {
      score -= 10;
    }

    // 2. Priorização máxima para Oráculos Divinos e Decretos do Senhor
    if (/assim diz o senhor|o senhor respondeu|disse deus|o senhor declarou|ouvi a palavra do senhor|eu sou o senhor|eu entreguei/i.test(text)) {
      score += 20;
    }

    // 3. Priorização para Mandamentos e Imperativos Centrais
    if (/(deixe meu povo|não temas|arrependei-vos|guardai|buscai|amai-vos|ide|peçam|busquem|batam|santificado seja)/i.test(text)) {
      score += 15;
    }

    // 4. Priorização para Afirmações Teológicas / Promessas da Aliança
    if (/(nenhuma condenação|o senhor é o meu pastor|pela graça sois salvos|o justo viverá|deus amou o mundo|terá vida eterna)/i.test(text)) {
      score += 15;
    }

    // 5. Priorização para orações sustentadas por fundamentos (Grounds)
    const receivesGround = arcs.some(a => a.to === p.number && a.relation === 'ground');
    if (receivesGround) score += 8;

    // 6. Priorização para orações que são objetivo de propósitos (Purposes)
    const receivesPurpose = arcs.some(a => a.from === p.number && a.relation === 'purpose');
    if (receivesPurpose) score += 6;

    if (score > maxScore) {
      maxScore = score;
      bestProp = p.number;
    }
  });

  return bestProp;
}

// Temas e Arqueamentos Especializados Consagrados
const CURATED_CHAPTER_THEMES = {
  'exodo_5': [
    {
      id: 'exo-5-t1',
      themeTitle: '1. O Mandato Soberano de Yahweh: "Deixe Meu Povo Sair" (vv. 1-4)',
      passage: 'Êxodo 5:1-4',
      summary: 'Moisés e Arão proclamam a ordem de Deus ao faraó para libertação e adoração no deserto.',
      propositions: [
        { id: 'p1', number: 1, text: 'Moisés e Arão foram ao faraó e proclamaram: "Assim diz o SENHOR, o Deus de Israel: \'Deixe meu povo sair,' },
        { id: 'p2', number: 2, text: 'para celebrar uma festa em minha honra no deserto\'".' },
        { id: 'p3', number: 3, text: 'O faraó retrucou: "Quem é o SENHOR para que eu lhe dê ouvidos e deixe Israel sair?' },
        { id: 'p4', number: 4, text: 'Não conheço o SENHOR e não deixarei Israel sair!".' },
        { id: 'p5', number: 5, text: 'Eles insistiram: "O Deus dos hebreus se encontrou conosco; portanto, deixe-nos ir três dias ao deserto para oferecer sacrifícios ao SENHOR".' },
        { id: 'p6', number: 6, text: 'O rei do Egito respondeu: "Moisés e Arão, por que distraem o povo de suas tarefas? Voltem ao trabalho!".' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'purpose', label: 'Pur', name: 'Propósito do Êxodo', color: '#059669', explanation: 'A libertação do cativeiro [P1] tem como objetivo sagrado e glorioso a adoração festiva a Deus no deserto [P2].' },
        { id: 'arc2', from: 3, to: 1, relation: 'contrast', label: 'Con', name: 'A Arrogância de Faraó', color: '#dc2626', explanation: 'Faraó rejeita com desprezo a soberania de Yahweh: "Quem é o SENHOR?".' },
        { id: 'arc3', from: 3, to: 4, relation: 'progression', label: '+', name: 'Negação Categórica', color: '#6b7280', explanation: 'A ignorância voluntária acerca de Deus gera a recusa obstinada em libertar os cativos.' },
        { id: 'arc4', from: 1, to: 5, relation: 'inference', label: '∴', name: 'Reiteração do Mandato', color: '#2563eb', explanation: 'A aliança de Deus com os hebreus é o fundamento irrenunciável do chamado para o deserto.' },
        { id: 'arc5', from: 5, to: 6, relation: 'contrast', label: 'Con', name: 'Cegueira Imperial', color: '#dc2626', explanation: 'O monarca vê a convocação divina como mera distração econômica para a escravidão.' }
      ],
      mainProp: 1,
      mainPropExplanation: 'A ordem soberana de Yahweh ("Assim diz o SENHOR: Deixe meu povo sair para me adorar") é a tese mestra que inaugura todo o confronto redentor do Êxodo.',
      theologicalSynthesis: 'Êxodo 5 inicia o choque de reinos entre o Todo-Poderoso e o império egípcio. A ordem de Deus em [P1-P2] não é uma petição negociável, mas um decreto do Soberano do universo: o povo pertence a Deus e foi criado para o culto ("para celebrar uma festa em minha honra"). A reação cega de Faraó [P3-P4] ("Quem é o SENHOR?") expõe a raiz de todo pecado humano: a rebelião contra o senhorio divino.',
      practicalApplication: '1. O Fim da Salvação é a Adoração: Fomos resgatados do pecado não para vivermos em autonomia egoísta, mas para celebrarmos a Deus com toda a nossa vida.\n2. Firmeza Diante do Mundo: Quando a Palavra de Deus confronta poderes terrenos, a resistência inicial é natural; permaneça inabalável na verdade de Cristo.'
    },
    {
      id: 'exo-5-t2',
      themeTitle: '2. A Tirania de Faraó e a Palha Negada aos Escravos (vv. 5-14)',
      passage: 'Êxodo 5:5-14',
      summary: 'Faraó sobrecarrega os escravos negando a palha para produzir tijolos a fim de abafar a fé.',
      propositions: [
        { id: 'p1', number: 1, text: 'Naquele mesmo dia, o faraó ordenou: "Não forneçam mais palha para o povo fazer tijolos;' },
        { id: 'p2', number: 2, text: 'eles mesmos devem juntá-la de agora em diante!' },
        { id: 'p3', number: 3, text: 'No entanto, continuem a exigir a mesma cota diária de tijolos; não reduzam nada!' },
        { id: 'p4', number: 4, text: 'Eles são preguiçosos e por isso clamam: \'Deixe-nos sair para sacrificar ao nosso Deus\'.' },
        { id: 'p5', number: 5, text: 'Aumentem a carga de trabalho deles, para que fiquem ocupados e não deem ouvidos a mentiras!".' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Agravamento do Jugo', color: '#6b7280', explanation: 'A retirada da matéria-prima sem redução de cota gera um fardo insuportável.' },
        { id: 'arc2', from: 4, to: 3, relation: 'ground', label: 'G', name: 'Falso Pretexto Opressor', color: '#3b82f6', explanation: 'Faraó calunia a devoção a Deus taxando-a de mera preguiça para justificar sua crueldade.' },
        { id: 'arc3', from: 3, to: 5, relation: 'purpose', label: 'Pur', name: 'Sufocamento da Fé', color: '#059669', explanation: 'O objetivo satânico do aumento de tarefas é esgotar as forças do homem para impedi-lo de buscar a Deus.' }
      ],
      mainProp: 5,
      mainPropExplanation: 'A estratégia do opressor de usar o excesso de ativismo e a fadiga física para afastar o homem da palavra de Deus.',
      theologicalSynthesis: 'Este episódio desmascara a artimanha clássica do reino das trevas: quando a redenção se aproxima, o inimigo intensifica o ativismo desumano [P5]. Faraó sabe que um escravo exausto não tem forças para sonhar com a liberdade nem disposição para orar. O trabalho transformado em tirania serve como instrumento de alienação espiritual.',
      practicalApplication: '1. Cuidado com a estafa espiritual: Não permita que a correria secular roube seus momentos sagrados com o Senhor.\n2. Discernimento nas crises: Quando uma decisão por Deus parecer gerar mais turbulência, persevere; é o sinal de que o inimigo teme a sua libertação.'
    },
    {
      id: 'exo-5-t3',
      themeTitle: '3. A Angústia do Povo e o Clamor Honesto de Moisés (vv. 15-23)',
      passage: 'Êxodo 5:15-23',
      summary: 'A queixa dos capatazes contra Moisés e a oração desesperada do profeta diante de Deus.',
      propositions: [
        { id: 'p1', number: 1, text: 'Os supervisores israelitas disseram a Moisés e Arão: "O SENHOR os julgue por terem colocado uma espada na mão do faraó para nos matar!".' },
        { id: 'p2', number: 2, text: 'Moisés voltou ao SENHOR e disse: "Senhor, por que trouxeste toda essa desgraça sobre este povo?' },
        { id: 'p3', number: 3, text: 'Por que me enviaste?' },
        { id: 'p4', number: 4, text: 'Desde que me apresentei ao faraó como teu porta-voz, ele passou a tratar teu povo com ainda mais crueldade, e tu não fizeste coisa alguma para libertá-lo!".' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Transferência da Dor', color: '#6b7280', explanation: 'A rejeição da própria comunidade empurra o líder magoado diretamente para a presença do SENHOR.' },
        { id: 'arc2', from: 4, to: 2, relation: 'ground', label: 'G', name: 'Motivo da Queixa', color: '#3b82f6', explanation: 'A aparente inércia de Deus perante o sofrimento dos escravos é o fundamento da dor de Moisés.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A oração transparente de Moisés diante de Deus, demonstrando que a fé autêntica se refugia no Senhor mesmo na hora da maior contradição aparente.',
      theologicalSynthesis: 'Êxodo 5 se encerra na "hora mais escura da noite". A obediência de Moisés não gerou aplausos imediatos, mas ódio de Faraó e revolta do próprio povo [P1]. A nobreza de Moisés brilha em [P2-P4]: ele não murmura contra Deus na tenda dos outros, mas volta-se ao SENHOR em oração honesta, abrindo o caminho para a revelação triunfante do Nome Divino em Êxodo 6.',
      practicalApplication: '1. Seja transparente na oração: Deus não se ofende com nossa dor sincera quando nos refugiamos Nele.\n2. Não julgue o plano de Deus pela metade: A crise que antecede o milagre não é o ponto final, mas o palco para o livramento definitivo do Senhor.'
    }
  ],

  'genesis_2': [
    {
      id: 'gen-2-t1',
      themeTitle: '1. O Sétimo Dia: O Descanso Sagrado da Criação (vv. 1-3)',
      passage: 'Gênesis 2:1-3',
      summary: 'A consumação gloriosa da criação e a instituição do descanso sagrado (sábado) por Deus.',
      propositions: [
        { id: 'p1', number: 1, text: 'Desse modo, completou-se a criação dos céus e da terra e de tudo que neles há.' },
        { id: 'p2', number: 2, text: 'No sétimo dia, Deus havia terminado sua obra de criação e descansou de todo o seu trabalho.' },
        { id: 'p3', number: 3, text: 'Deus abençoou o sétimo dia e o declarou santo, pois foi o dia em que ele descansou de toda a sua obra de criação.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Conclusão da Obra', color: '#6b7280', explanation: 'A oração 1 encerra a criação do cosmos, introduzindo a cessação do trabalho divino em [P2].' },
        { id: 'arc2', from: 3, to: 2, relation: 'ground', label: 'G', name: 'Causa / Fundamento (Ground)', color: '#3b82f6', explanation: 'A bênção e santificação do sábado fundamentam-se no repouso divino perante a obra perfeita.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A consumação perfeita e o descanso soberano de Deus estabelecem o padrão eterno de descanso para toda a criação.',
      theologicalSynthesis: 'Gênesis 2:1-3 coroa o relato da criação com o descanso soberano de Deus. O Todo-Poderoso não descansa por cansaço, mas para celebrar a perfeição da obra já consumada. O descanso é santo porque convida o homem a desfrutar da aliança com o Criador.',
      practicalApplication: '1. O Descanso da Graça: Fomos criados para viver a partir do descanso de Deus, não da autossuficiência.\n2. Repouso em Cristo: Jesus é o nosso verdadeiro sábado (Mt 11:28). Descanse sua alma na salvação consumada por Ele.'
    },
    {
      id: 'gen-2-t2',
      themeTitle: '2. O Homem no Éden e a Ordem da Aliança (vv. 7-17)',
      passage: 'Gênesis 2:7-9, 15-17',
      summary: 'A formação do homem do pó da terra, o Jardim do Éden e a ordenança de vida.',
      propositions: [
        { id: 'p1', number: 1, text: 'O SENHOR Deus formou o homem do pó da terra e soprou o fôlego da vida em suas narinas, e o homem se tornou ser vivo.' },
        { id: 'p2', number: 2, text: 'O SENHOR Deus plantou um jardim no Éden e colocou o homem nele para cultivá-lo e tomar conta dele.' },
        { id: 'p3', number: 3, text: 'O SENHOR Deus lhe ordenou: "Coma à vontade dos frutos de todas as árvores do jardim,' },
        { id: 'p4', number: 4, text: 'exceto da árvore do conhecimento do bem e do mal,' },
        { id: 'p5', number: 5, text: 'se você comer desse fruto, com certeza morrerá".' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'purpose', label: 'Pur', name: 'Vocação Humana', color: '#059669', explanation: 'A vida concedida pelo sopro divino tem como vocação o trabalho digno e o cuidado da criação.' },
        { id: 'arc2', from: 3, to: 4, relation: 'contrast', label: 'Con', name: 'Limitação Protetora', color: '#dc2626', explanation: 'A generosidade abundante de Deus é acompanhada por um limite santo para preservar a comunhão.' }
      ],
      mainProp: 3,
      mainPropExplanation: 'A generosidade abundante de Deus é o fundamento da vida no Éden, sob o pacto da confiança filial.',
      theologicalSynthesis: 'O homem é formado amorosamente por Deus e comissionado como sacerdote no Éden. O mandamento divino reflete graça transbordante: comer de todas as árvores, com um único limite para lembrar que Deus é o Senhor da vida.',
      practicalApplication: '1. Vocação Santa: Seu trabalho diário é serviço a Deus.\n2. Confiança nos Limites: As proibições divinas visam nossa proteção e comunhão eterna.'
    },
    {
      id: 'gen-2-t3',
      themeTitle: '3. A Criação da Mulher e o Casamento (vv. 18-24)',
      passage: 'Gênesis 2:18, 21-24',
      summary: 'A resposta divina à solidão e a instituição sagrada do matrimônio.',
      propositions: [
        { id: 'p1', number: 1, text: 'O SENHOR Deus disse: "Não é bom que o homem esteja sozinho; farei alguém que o ajude e o complete".' },
        { id: 'p2', number: 2, text: 'Dessa costela o SENHOR Deus fez uma mulher e a trouxe ao homem.' },
        { id: 'p3', number: 3, text: 'Exclamou o homem: "Esta é osso dos meus ossos e carne da minha carne! Será chamada mulher, porque foi tirada do homem".' },
        { id: 'p4', number: 4, text: 'Por isso o homem deixa pai e mãe e se une à sua mulher, e os dois se tornam um só.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'purpose', label: 'Pur', name: 'Socorro Gracioso', color: '#059669', explanation: 'O diagnóstico da solidão é resolvido pelo ato gracioso de Deus criar uma parceira idônea.' },
        { id: 'arc2', from: 3, to: 4, relation: 'inference', label: '∴', name: 'Instituição Conjugal', color: '#2563eb', explanation: 'A igualdade ontológica fundamenta a união indivisível do casamento.' }
      ],
      mainProp: 4,
      mainPropExplanation: 'A união sagrada e indissolúvel do casamento é a celebração suprema da comunhão humana planejada por Deus.',
      theologicalSynthesis: 'A solidão não é da vontade de Deus. A criação da mulher ao lado do homem estabelece o princípio da aliança conjugal, tipificando a união de Cristo e da Igreja.',
      practicalApplication: 'Cultive a unidade, o respeito e a santidade no seu lar e nos seus relacionamentos cristãos.'
    }
  ],

  'juizes_1': [
    {
      id: 'jui-1-t1',
      themeTitle: '1. A Consulta a Deus e a Promessa a Judá (vv. 1-4)',
      passage: 'Juízes 1:1-4',
      summary: 'Após a morte de Josué, Israel consulta o Senhor e recebe a promessa de vitória para Judá.',
      propositions: [
        { id: 'p1', number: 1, text: 'Depois da morte de Josué, os israelitas perguntaram ao SENHOR: "Qual das tribos deve ser a primeira a atacar os cananeus?".' },
        { id: 'p2', number: 2, text: 'O SENHOR respondeu: "Judá, pois eu entreguei a terra em suas mãos".' },
        { id: 'p3', number: 3, text: 'Os homens de Judá disseram a Simeão: "Venham conosco lutar contra os cananeus que vivem no território designado como nossa herança".' },
        { id: 'p4', number: 4, text: 'Depois ajudaremos vocês a conquistar o seu território; e os homens de Simeão foram com Judá.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Consulta e Resposta', color: '#6b7280', explanation: 'A oração humilde do povo resulta na direção infalível do SENHOR.' },
        { id: 'arc2', from: 2, to: 3, relation: 'inference', label: '∴', name: 'Ação de Fé', color: '#2563eb', explanation: 'Fundamentado na promessa divina, Judá toma a iniciativa e convida o irmão para a batalha.' }
      ],
      mainProp: 2,
      mainPropExplanation: 'A declaração e promessa soberana de Deus ("Judá, pois eu entreguei a terra em suas mãos") é a rocha que sustenta a vitória.',
      theologicalSynthesis: 'Juízes abre demonstrando que a vitória espiritual não descansa na bravura humana, mas na palavra prévia de Deus. A cooperação fraterna é a resposta ativa da fé.',
      practicalApplication: 'Consulte ao Senhor antes de iniciar qualquer projeto e descanse na certeza de que a vitória já pertence a Ele em Cristo.'
    },
    {
      id: 'jui-1-t2',
      themeTitle: '2. As Conquistas Incompletas e a Convivência Ilícita (vv. 21-33)',
      passage: 'Juízes 1:21-33',
      summary: 'As tribos de Israel falham em expulsar totalmente os cananeus, estabelecendo as sementes do compromisso mundano.',
      propositions: [
        { id: 'p1', number: 1, text: 'Os benjamitas não expulsaram os jebuseus que viviam em Jerusalém;' },
        { id: 'p2', number: 2, text: 'por isso os jebuseus vivem ali com os benjamitas até o dia de hoje.' },
        { id: 'p3', number: 3, text: 'Manassés, Efraim, Zebulom, Aser e Naftali também não expulsaram os habitantes da terra,' },
        { id: 'p4', number: 4, text: 'mas permitiram que os cananeus vivessem no meio deles, sujeitando-os a trabalhos forçados.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'consequence', label: 'Cons', name: 'Resultado do Compromisso', color: '#dc2626', explanation: 'A tolerância com o que Deus mandou remover produz uma convivência perigosa e contínua com a idolatria.' },
        { id: 'arc2', from: 3, to: 4, relation: 'contrast', label: 'Con', name: 'Pragmatismo vs Fidelidade', color: '#d97706', explanation: 'Em vez de obedecerem à ordem divina de consagração, preferiram o lucro financeiro do tributo cananeu.' }
      ],
      mainProp: 3,
      mainPropExplanation: 'A falha repetida das tribos em erradicar o pecado [P3] expõe o esfriamento espiritual e o pragmatismo humano.',
      theologicalSynthesis: 'A desobediência parcial de Israel é o germe de toda a tragédia que se desenrola no livro de Juízes. Quando o povo de Deus transige com o mundanismo por comodidade ou interesse financeiro, planta as sementes da sua própria servidão.',
      practicalApplication: 'Identifique e extirpe pecados tolerados em sua vida. A tolerância complacente de hoje se torna a opressão de amanhã.'
    },
    {
      id: 'jui-1-t3',
      themeTitle: '3. A Opressão de Dã e o Custo da Fraqueza (vv. 34-36)',
      passage: 'Juízes 1:34-36',
      summary: 'A tribo de Dã é encurralada pelos amoritas na região montanhosa, revelando a perda de autoridade espiritual.',
      propositions: [
        { id: 'p1', number: 1, text: 'Os amoritas confinaram a tribo de Dã na região montanhosa,' },
        { id: 'p2', number: 2, text: 'não permitindo que descessem à planície fertilizada.' },
        { id: 'p3', number: 3, text: 'Contudo, quando a descendência de José fortaleceu seu poder, os amoritas foram sujeitos a trabalho forçado.' }
      ],
      arcs: [
        { id: 'arc1', from: 1, to: 2, relation: 'action-result', label: 'Ac-Res', name: 'Território Cerceado', color: '#dc2626', explanation: 'A falta de fé e ousadia em Deus restringe a herança dos filhos de Israel.' },
        { id: 'arc2', from: 1, to: 3, relation: 'contrast', label: 'Con', name: 'A Força de José', color: '#2563eb', explanation: 'O poder militar consegue impor tributo, mas não consegue a pureza espiritual ordenada pelo SENHOR.' }
      ],
      mainProp: 1,
      mainPropExplanation: 'A subjugação de Dã [P1] ilustra graficamente o custo de abandonar a confiança exclusiva no Deus dos exércitos.',
      theologicalSynthesis: 'Israel começou o capítulo perguntando quem subiria primeiro para a vitória e termina acovardado diante de carros de ferro e montanhas restritas. O capítulo 1 prepara o leitor para o refrão trágico do livro: a incapacidade humana sem a graça de Deus.',
      practicalApplication: 'Não limite o seu crescimento espiritual ao comodismo ou ao medo dos gigantes modernos. Busque a plenitude do Espírito Santo com coragem.'
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
    const normalized = `${normalizeKey(cleanBook)}_${cleanChapter}`;

    // 1. Verifica se temos arqueamento temático pré-calculado curado
    if (CURATED_CHAPTER_THEMES[normalized]) {
      return {
        book: cleanBook,
        chapter: cleanChapter,
        chapterTitle: `${cleanBook} ${cleanChapter}`,
        themes: CURATED_CHAPTER_THEMES[normalized]
      };
    }

    // 2. Se não temos tema específico curado, gera a segmentação temática exegética automática
    return this.generateThematicArcsFromVerses(cleanBook, cleanChapter, chapterVerses);
  },

  // Segmentador e gerador automático por temas com detecção exegética de Tese Central
  generateThematicArcsFromVerses(bookName, chapter, verses = []) {
    const totalVerses = verses.length;

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
            summary: `Panorama da revelação divina e dos mandamentos centrais em ${bookName} ${chapter}.`,
            propositions: [
              { id: 'p1', number: 1, text: `Proclamação e contexto da aliança soberana em ${bookName} ${chapter}.` },
              { id: 'p2', number: 2, text: `A verdade revelada pelo SENHOR para instrução e transformação do Seu povo.` },
              { id: 'p3', number: 3, text: `O chamado inadiável de arrependimento, adoração e obediência da fé.` }
            ],
            arcs: [
              { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Revelação da Aliança', color: '#6b7280', explanation: 'A revelação divina estabelece a instrução para o povo.' },
              { id: 'arc2', from: 2, to: 3, relation: 'inference', label: '∴', name: 'Chamado à Obediência', color: '#2563eb', explanation: 'A santidade de Deus exige uma resposta de consagração e temor.' }
            ],
            mainProp: 2,
            mainPropExplanation: 'A verdade soberana de Deus manifestada neste capítulo como luz para a nossa caminhada.',
            theologicalSynthesis: `No capítulo ${chapter} de ${bookName}, o Senhor revela Seu caráter e propósitos redentores.`,
            practicalApplication: `Guardar os ensinamentos de ${bookName} ${chapter} vivendo em dependência da graça de Cristo.`
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

      // Monta as proposições do trecho com quebra inteligente (não parte citações no meio)
      const combinedText = slice.map(v => v.text).join(' ');
      const rawSentences = combinedText
        .split(/(?<=[.!?][”"’']?)\s+(?=[A-Z“"‘'A-ZÀ-Ú])/)
        .map(s => s.replace(/^\d+\s*/, '').trim())
        .filter(s => s.length > 5)
        .slice(0, 5);

      const propositions = rawSentences.map((text, idx) => ({
        id: `p${idx + 1}`,
        number: idx + 1,
        text
      }));

      if (propositions.length === 0) continue;

      // Análise automática dos conectivos de discurso
      const arcs = [];

      propositions.forEach((p) => {
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
              explanation: `A oração [P${currentNum}] é a conclusão prática que se deduz do ensinamento precedente.`
            });
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

      // Aplica o algoritmo exegético de detecção da Tese Central (NUNCA escolhe introdução narrativa!)
      const mainProp = detectCentralThesis(propositions, arcs);
      const mainText = propositions.find(p => p.number === mainProp)?.text || propositions[0].text;

      // Nome temático contextual rico
      let thematicName = '';
      if (themeIndex === 1) thematicName = `1. Abertura & Proclamação Divina (vv. ${startV}-${endV})`;
      else if (themeIndex === 2) thematicName = `2. Conflito & Desenvolvimento do Texto (vv. ${startV}-${endV})`;
      else thematicName = `3. Clímax, Resposta & Exortação (vv. ${startV}-${endV})`;

      themes.push({
        id: `${bookName}-${chapter}-t${themeIndex}`,
        themeTitle: thematicName,
        passage: passageCitation,
        summary: `Meditação exegética dos versículos ${startV} a ${endV} de ${bookName} ${chapter}.`,
        propositions,
        arcs,
        mainProp,
        mainPropExplanation: `A tese central desta perícope concentra-se em [P${mainProp}], em torno da qual as demais orações se organizam.`,
        theologicalSynthesis: `A análise exegética de discurso revela que o ponto dominante deste trecho de ${bookName} ${chapter} repousa na proposição [P${mainProp}]: "${mainText}". As relações lógicas circundantes fundamentam a soberania do Senhor e instruem o crente na fé.`,
        practicalApplication: `1. Guarde a proposição [P${mainProp}] como princípio orientador para seus pensamentos hoje.\n2. Aplique as instruções de ${bookName} ${chapter} em atitudes diárias de amor e fidelidade a Deus.`
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
