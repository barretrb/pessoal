// Serviço Central de Comentários Bíblicos Expositivos e Teológicos
// Fornece análises expositivas estruturadas por perícopes da NVT, temas de meditação e conexão cristocêntrica para todos os 66 livros.

import { BIBLE_BOOKS_STUDY_INFO } from '../data/bibleBooksStudyInfo.js';

const CURATED_COMMENTARIES = {
  '1 Coríntios': {
    '1': {
      title: '1 Coríntios 1 — A Sabedoria da Cruz contra o Partidarismo Humano',
      overview: 'Paulo confronta as facções que dividiam a igreja de Corinto em torno de líderes humanos (Paulo, Apolo, Cefas). Ele demonstra que a mensagem da cruz, embora pareça loucura para o mundo que busca status e retórica, é o próprio poder e a sabedoria de Deus para a salvação.',
      keyThemes: [
        'A Unidade da Igreja em Torno Exclusivamente de Cristo Crucificado (vv. 10–13)',
        'A Loucura da Pregação da Cruz vs. A Sabedoria Humana (vv. 18–25)',
        'A Eleição Graciosa dos Fracos para Humilhar o Orgulho Humano (vv. 26–31)'
      ],
      christocentricKey: 'Cristo Jesus tornou-se para nós sabedoria de Deus, justiça, santificação e redenção, para que quem se glorie, glorie-se somente no Senhor (1Co 1:30–31).'
    },
    '11': {
      title: '1 Coríntios 11 — A Ordem no Culto e a Santidade da Ceia do Senhor',
      overview: 'Paulo corrige abusos graves nas reuniões públicas da igreja em Corinto, especialmente o egoísmo que profanava a celebração da Ceia do Senhor. Ele resgata as palavras solenes da instituição da Nova Aliança na noite em que Jesus foi traído e exorta ao autoexame reverente antes de participar do pão e do cálice.',
      keyThemes: [
        'Honra, Reverência e Mutualidade no Culto Congregacional (vv. 2–16)',
        'Repreensão às Divisões Sociais que Desprezavam os Pobres na Ceia (vv. 17–22)',
        'A Instituição da Ceia e a Proclamação da Morte de Cristo até que Ele Venha (vv. 23–34)'
      ],
      christocentricKey: 'O pão partido e o cálice da Nova Aliança proclamam visivelmente o corpo entregue e o sangue vicário de Cristo derramado para remissão dos nossos pecados.'
    },
    '12': {
      title: '1 Coríntios 12 — Um Só Corpo e Muitos Membros: Os Dons do Espírito',
      overview: 'O apóstolo ensina que a diversidade de dons espirituais procede de um mesmo Espírito, um mesmo Senhor e um mesmo Deus, sendo concedida visando exclusivamente ao benefício comum (edificação mútua). A metáfora do corpo humano destrói tanto o complexo de inferioridade quanto a arrogância espiritual.',
      keyThemes: [
        'A Confissão do Senhorio de Jesus pelo Espírito Santo (vv. 1–3)',
        'Unidade Trina na Diversidade de Dons, Ministérios e Operações (vv. 4–11)',
        'A Interdependência Vital dos Membros no Corpo de Cristo (vv. 12–31)'
      ],
      christocentricKey: 'A Igreja não é uma organização humana, mas o próprio Corpo místico de Cristo, batizado em um só Espírito e governado por sua Cabeça gloriosa.'
    },
    '13': {
      title: '1 Coríntios 13 — O Caminho Sobremodo Excelente: A Supremacia do Amor',
      overview: 'No coração da seção sobre os dons espirituais (capítulos 12 a 14), Paulo demonstra que qualquer dom extraordinário — línguas, profecia, ciência ou sacrifício extremo — reduz-se ao nada se for exercido sem o amor ágape. Enquanto os dons são parciais e transitórios, o amor é eterno.',
      keyThemes: [
        'A Nulidade dos Dons e Sacrifícios Desprovidos de Amor (vv. 1–3)',
        'O Caráter Prático do Amor: Paciente, Bondoso, Sem Inveja nem Soberba (vv. 4–7)',
        'A Permanência Eterna do Amor Diante da Transitoriedade dos Dons (vv. 8–13)'
      ],
      christocentricKey: 'Cada atributo de 1 Coríntios 13:4–7 é o retrato biográfico perfeito de Jesus Cristo, que nos amou até o fim e deu Sua vida por nós na cruz.'
    },
    '14': {
      title: '1 Coríntios 14 — Profecia, Línguas e Inteligibilidade para Edificação da Igreja',
      overview: 'Paulo aplica a lei do amor de 1 Coríntios 13 à prática dos dons no culto público. Ele estabelece que o critério supremo da liturgia cristã é a edificação inteligível da comunidade: a profecia (proclamação clara da verdade de Deus) supera o falar em línguas não interpretadas, pois Deus não é Deus de confusão, mas de paz e ordem.',
      keyThemes: [
        'A Prioridade da Profecia: Edificar, Encorajar e Consolar a Igreja (vv. 1–5)',
        'A Necessidade de Inteligibilidade e Maturidade no Pensamento (vv. 6–25)',
        'Ordem, Julgamento das Profecias e Paz na Reunião Congregacional (vv. 26–40)'
      ],
      christocentricKey: 'Cristo edifica Sua Igreja por meio da Palavra compreendida pelo coração e pela mente, levando até o descrente a prostrar-se e confessar: "Deus está verdadeiramente entre vocês!" (v. 25).'
    },
    '15': {
      title: '1 Coríntios 15 — O Evangelho da Ressurreição e a Vitória Final sobre a Morte',
      overview: 'O maior tratado do Novo Testamento sobre a ressurreição corporal. Paulo recorda o núcleo inegociável do Evangelho (Cristo morreu por nossos pecados e ressuscitou ao terceiro dia segundo as Escrituras), refuta os que negavam a ressurreição dos mortos, contrasta o primeiro Adão com Cristo (o Último Adão) e celebra a transformação gloriosa na vinda do Senhor.',
      keyThemes: [
        'O Credo Apostólico e as Testemunhas Oculares do Cristo Ressurreto (vv. 1–11)',
        'Cristo, as Primícias dos que Dormem, e a Tipologia Adão vs. Cristo (vv. 12–28)',
        'A Natureza do Corpo Glorificado e o Triunfo sobre a Morte (vv. 35–58)'
      ],
      christocentricKey: 'Cristo é o Último Adão, o Espírito vivificante e as primícias da nova criação: porque Ele vive e venceu o túmulo, nosso trabalho no Senhor jamais é em vão (v. 58).'
    },
    '16': {
      title: '1 Coríntios 16 — Mordomia Generosa, Cooperação Missionária e Firmeza na Fé',
      overview: 'Paulo encerra a epístola com instruções práticas sobre a coleta sistemática e proporcional para os santos necessitados em Jerusalém, compartilha seus planos missionários em Éfeso ("uma porta grande e promissora para o trabalho"), recomenda Timóteo e a família de Estéfanas, e conclui com o clamor aramaico da igreja primitiva: Maranata ("Vem, nosso Senhor!").',
      keyThemes: [
        'A Coleta Semanal Planejada e Proporcional para o Socorro dos Santos (vv. 1–4)',
        'Portas Abertas para o Evangelho em Meio a Muitos Adversários (vv. 5–12)',
        'Vigilância, Firmeza na Fé, Coragem e Tudo Feito com Amor (vv. 13–24)'
      ],
      christocentricKey: 'Todo o serviço prático, generosidade financeira e hospitalidade cristã são movidos pelo amor ao Senhor Jesus e pela ardente esperança de Sua volta ("Maranata!", v. 22).'
    }
  },
  '2 Coríntios': {
    '1': {
      title: '2 Coríntios 1 — O Deus de Todo Encorajamento e a Fidelidade das Promessas',
      overview: 'Paulo abre a sua carta mais biográfica e pastoral bendizendo ao "Pai misericordioso e Deus de todo encorajamento", que nos consola nas tribulações para que sejamos canais de consolo aos aflitos. Ele relata o livramento de morte na Ásia e defende sua integridade apostólica ancorado na fidelidade de Deus em Cristo.',
      keyThemes: [
        'O Propósito Redentor do Consolo Divino nas Aflições (vv. 3–7)',
        'A Sentença de Morte na Ásia para Não Confiarmos em Nós Mesmos (vv. 8–11)',
        'Todas as Promessas de Deus Têm em Cristo o Seu "Sim" e o "Amém" (vv. 18–22)'
      ],
      christocentricKey: 'Quantas forem as promessas feitas por Deus, todas têm em Cristo o "sim", e por meio dele dizemos o "amém" para a glória de Deus (2Co 1:20).'
    },
    '2': {
      title: '2 Coríntios 2 — Perdão Restaurador e o Bom Perfume de Cristo',
      overview: 'O apóstolo exorta a igreja a perdoar e consolar o irmão arrependido que havia sido disciplinado, para que Satanás não alcance vantagem pela dureza de coração. Em seguida, celebra o ministério apostólico como um cortejo triunfal no qual Deus espalha por toda parte a fragrância do conhecimento de Cristo.',
      keyThemes: [
        'Restauração Amorosa do Arrependido para Vencer osArdis de Satanás (vv. 5–11)',
        'O Cortejo Triunfal de Cristo e o Perfume de Vida para Vida (vv. 14–17)'
      ],
      christocentricKey: 'Para Deus, somos o bom perfume de Cristo: uma fragrância que traz vida aos que estão sendo salvos pela sinceridade da Palavra.'
    },
    '3': {
      title: '2 Coríntios 3 — Ministros da Nova Aliança do Espírito e a Glória que Transforma',
      overview: 'Paulo contrasta o ministério da Antiga Aliança, gravado em tábuas de pedra e cuja glória desvanecia no rosto de Moisés, com a glória permanente da Nova Aliança do Espírito, gravada em corações humanos. Onde está o Espírito do Senhor, ali há liberdade e transformação contínua.',
      keyThemes: [
        'Cartas Vivas de Cristo Escritas pelo Espírito do Deus Vivo (vv. 1–6)',
        'A Superioridade da Glória do Ministério do Espírito sobre a Letra (vv. 7–15)',
        'Contemplando a Glória do Senhor de Glória em Glória (vv. 16–18)'
      ],
      christocentricKey: 'Em Cristo o véu é removido: ao contemplarmos a glória do Senhor com o rosto descoberto, somos transformados à Sua própria imagem pelo Espírito.'
    },
    '4': {
      title: '2 Coríntios 4 — Tesouro em Vasos de Barro e o Peso Eterno de Glória',
      overview: 'Diante das perseguições e da fragilidade física, Paulo não desanima: a luz do Evangelho da glória de Cristo brilha em vasos de barro, para que fique evidente que a excelência do poder provém de Deus e não de nós. As leves e momentâneas tribulações produzem um peso eterno de glória.',
      keyThemes: [
        'Deus que Disse "Das Trevas Resplandeça a Luz" Brilhou em Nosso Coração (vv. 1–6)',
        'Um Tesouro Inestimável Guardado em Frágeis Vasos de Barro (vv. 7–12)',
        'Renovação Interior Diária e Olhos Fixos nas Realidades Eternas (vv. 16–18)'
      ],
      christocentricKey: 'A glória de Deus resplandece na face de Jesus Cristo, e a vida de Jesus se manifesta exatamente em nossa carne mortal quando carregamos o morrer de Jesus.'
    },
    '5': {
      title: '2 Coríntios 5 — Nova Criação e o Ministério da Reconciliação',
      overview: 'Confiante na habitação eterna nos céus, Paulo vive pelo andar da fé e pelo amor constrangedor de Cristo. Quem está em Cristo é nova criação. Deus nos reconciliou consigo mesmo por meio de Cristo e nos confiou a palavra da reconciliação como embaixadores do Rei.',
      keyThemes: [
        'O Andar por Fé e o Desejo de Agradar ao Senhor (vv. 1–10)',
        'Nova Criação em Cristo e a Embaixada da Reconciliação (vv. 14–20)',
        'A Grande Troca na Cruz: O Sem Pecado Feito Pecado por Nós (v. 21)'
      ],
      christocentricKey: 'Aquele que não conheceu pecado, Deus o fez pecado por nós, para que, nele, fôssemos feitos justiça de Deus (2Co 5:21).'
    }
  },
  'Juízes': {
    '1': {
      title: 'Juízes 1 — A Conquista Incompleta e a Dependência de Deus',
      overview: 'O livro de Juízes inicia com a transição crítica da liderança de Josué para o período dos juízes. O capítulo 1 registra a consulta espiritual de Israel ao SENHOR antes da batalha e a resposta divina que garante a vitória de Judá. Contudo, as tribos falham em expulsar totalmente os cananeus.',
      keyThemes: [
        'Consulta e Dependência em Oração antes da Tomada de Decisões',
        'A Promessa Soberana de Deus: "Eu entreguei a terra em suas mãos"',
        'O Perigo das Vitórias e Obediência Incompletas'
      ],
      christocentricKey: 'Enquanto Judá e os líderes humanos falharam em assegurar uma conquista permanente, Jesus Cristo é o verdadeiro Leão da Tribo de Judá que derrotou definitivamente o pecado e a morte na cruz.'
    },
    '2': {
      title: 'Juízes 2 — O Ciclo dos Juízes e a Paciência da Graça',
      overview: 'Prefácio teológico de todo o livro de Juízes. O Anjo do SENHOR repreende Israel por quebrar a aliança e apresenta o ciclo recorrente: Pecado ➔ Opressão ➔ Clamor ➔ Libertação pelo Juiz ➔ Recaída.',
      keyThemes: [
        'A Transmissão da Fé e da Memória de Deus às Próximas Gerações',
        'A Gravidade da Idolatria e da Assimilação Espiritual',
        'A Compaixão Incansável de Deus diante do Clamor do Povo'
      ],
      christocentricKey: 'Os juízes eram libertadores imperfeitos e temporários. Cristo é o Libertador Eterno, cuja vitória nunca é revertida.'
    }
  },
  'Gênesis': {
    '1': {
      title: 'Gênesis 1 — A Soberania Criadora e a Dignidade Humana',
      overview: 'O relato inaugural das Escrituras apresenta o Deus Altíssimo criando os céus e a terra pelo poder infalível de Sua Palavra, culminando na criação do homem e da mulher à Sua imagem e semelhança (Imago Dei).',
      keyThemes: [
        'A Autoexistência e Soberania Absoluta do Criador',
        'O Poder Eficaz da Palavra de Deus',
        'A Dignidade Sagrada de Cada Vida Humana'
      ],
      christocentricKey: 'Jesus é o Verbo Eterno (Logos) por meio de quem todas as coisas foram criadas (João 1:1–3; Colossenses 1:16).'
    },
    '2': {
      title: 'Gênesis 2 — A Aliança no Éden, o Descanso e o Matrimônio',
      overview: 'Deus institui o sábado como descanso sagrado, forma o homem e sopra o fôlego de vida, planta o Éden e institui o casamento como aliança santa e indissolúvel.',
      keyThemes: [
        'O Sábado como Descanso e Contemplação da Graça',
        'O Trabalho como Vocação Santa antes da Queda',
        'A Instituição Divina da Família e do Casamento'
      ],
      christocentricKey: 'O descanso do sábado aponta para o descanso perfeito da salvação em Cristo (Hebreus 4), e o casamento tipifica a união de Cristo e Sua Igreja (Efésios 5).'
    },
    '3': {
      title: 'Gênesis 3 — A Queda e a Promessa do Protoevangelho',
      overview: 'A entrada trágica do pecado e da morte pela desobediência. Em meio ao juízo, brilha a primeira promessa messiânica (Gênesis 3:15): o descendente da mulher que esmagará a cabeça da serpente.',
      keyThemes: [
        'A Sutileza da Tentação e a Dúvida da Palavra de Deus',
        'A Graça Soberana que Busca o Pecador ("Onde estás?")',
        'O Protoevangelho (Gênesis 3:15)'
      ],
      christocentricKey: 'Cristo é a semente prometida que, no Calvário, teve Seu calcanhar ferido, mas esmagou para sempre a cabeça do diabo.'
    }
  },
  'Romanos': {
    '1': {
      title: 'Romanos 1 — O Poder do Evangelho e a Revelação da Justiça de Deus',
      overview: 'Paulo declara que o Evangelho é o poder de Deus para salvação de todo aquele que crê, revelando a justiça de Deus pela fé e expondo a necessidade universal de redenção.',
      keyThemes: [
        'O Evangelho como Poder Salvador de Deus (vv. 16–17)',
        'O Justo Viverá por Fé',
        'A Revelação Geral na Criação e a Inexcusabilidade Humana'
      ],
      christocentricKey: 'O Evangelho é a proclamação do Filho de Deus, declarado poderoso Filho pela ressurreição dentre os mortos.'
    },
    '8': {
      title: 'Romanos 8 — A Vida no Espírito, Filiação e a Certeza do Amor Inabalável',
      overview: 'Inicia com "já não há condenação para os que estão em Cristo Jesus" e conclui com a garantia de que nada em toda a criação poderá nos separar do amor de Deus que está em Cristo Jesus.',
      keyThemes: [
        'Libertação da Lei do Pecado e da Morte (vv. 1–11)',
        'A Adoção como Filhos e Coerdeiros com Cristo (vv. 14–17)',
        'A Soberania de Deus e o Amor Inseparável em Cristo (vv. 28–39)'
      ],
      christocentricKey: 'Nossa segurança eterna repousa inteiramente na morte, ressurreição e intercessão contínua de Cristo à direita do Pai (v. 34).'
    },
    '12': {
      title: 'Romanos 12 — O Culto Racional, Renovação da Mente e Amor Fraterno',
      overview: 'Pelas misericórdias de Deus, Paulo convoca os salvos a oferecerem seus corpos como sacrifício vivo, santo e agradável a Deus, experimentando a transformação pela renovação da mente.',
      keyThemes: [
        'Consagração Integral como Verdadeiro Culto Espiritual (vv. 1–2)',
        'Humildade e Serviço Mútuo no Corpo de Cristo (vv. 3–8)',
        'Amor Sem Fingimento e Vencer o Mal com o Bem (vv. 9–21)'
      ],
      christocentricKey: 'Jesus ofereceu a si mesmo em sacrifício perfeito ao Pai, capacitando-nos pelo Espírito a viver uma vida transformada para Sua glória.'
    }
  },
  'Salmos': {
    '1': {
      title: 'Salmos 1 — Os Dois Caminhos: O Justo e o Ímpio',
      overview: 'O pórtico de todo o Saltério contrasta a vida daquele que tem prazer na lei do SENHOR e medita nela dia e noite — como árvore plantada junto a ribeiros — com a fragilidade do ímpio.',
      keyThemes: [
        'O Prazer e a Constância na Meditação da Palavra de Deus',
        'Frutificação Estável no Tempo Certo',
        'O Caminho dos Justos Conhecido e Guardado pelo Senhor'
      ],
      christocentricKey: 'Jesus Cristo é o Homem bendito e perfeitamente justo do Salmo 1; enxertados nEle, damos fruto que permanece.'
    },
    '23': {
      title: 'Salmos 23 — O Bom Pastor e a Suficiência da Graça',
      overview: 'Davi celebra o cuidado pessoal, provedor e protetor do SENHOR como Pastor que guia às águas tranquilas, restaura a alma, acompanha no vale da sombra da morte e prepara uma mesa de comunhão eterna.',
      keyThemes: [
        'Provisão e Descanso Sob o Pastoreio Divino ("De nada terei falta")',
        'A Presença de Deus que Dissipa o Medo no Vale Escuro (v. 4)',
        'Bondade e Fidelidade até a Casa do Senhor para Sempre (v. 6)'
      ],
      christocentricKey: 'Jesus Cristo declarou: "Eu sou o bom pastor; o bom pastor dá a sua vida pelas ovelhas" (João 10:11).'
    }
  }
};

export const bibleCommentaryService = {
  getCommentary(bookName, chapter, verses = [], sections = []) {
    const cleanBook = (bookName || '').trim();
    const cleanChapter = String(chapter || '1').trim();

    // 1. Verifica comentário dedicado curado
    if (CURATED_COMMENTARIES[cleanBook]?.[cleanChapter]) {
      const curated = CURATED_COMMENTARIES[cleanBook][cleanChapter];
      const secTitles = (sections || []).map(s => s.title).filter(Boolean);
      return {
        ...curated,
        sectionOutline: secTitles
      };
    }

    // 2. Busca informações panorâmicas do livro
    const bookStudy = BIBLE_BOOKS_STUDY_INFO.find(b => 
      b.name.toLowerCase() === cleanBook.toLowerCase() || 
      b.id.toLowerCase() === cleanBook.toLowerCase()
    );

    // 3. Extrai os títulos reais das perícopes da NVT e versículos-chave do capítulo
    const sectionTitles = (sections || [])
      .map(s => (s.title || '').trim())
      .filter(Boolean);

    const allVerses = (verses && verses.length > 0)
      ? verses
      : (sections || []).flatMap(s => s.verses || []);

    const firstVerseText = allVerses[0]?.text || '';
    const keyVerseObj = allVerses.find(v => v.isJesusWords || (v.crossReferences && v.crossReferences.length >= 2)) || allVerses[Math.min(2, allVerses.length - 1)] || allVerses[0];

    const headerSubtitle = sectionTitles.length > 0
      ? sectionTitles.slice(0, 2).join(' • ')
      : (bookStudy?.category || 'Exposição & Contexto Bíblico');

    const perícopeSummary = sectionTitles.length > 0
      ? `Este capítulo desenvolve ${sectionTitles.length === 1 ? 'a perícope central' : 'as perícopes'} "${sectionTitles.join('", "')}". `
      : '';

    const keyQuote = keyVerseObj?.text
      ? ` Destaca-se no texto o versículo ${keyVerseObj.number}: "${keyVerseObj.text.slice(0, 180)}${keyVerseObj.text.length > 180 ? '...' : ''}".`
      : '';

    const dynamicThemes = sectionTitles.length > 0
      ? sectionTitles.map((t, idx) => `Perícope ${idx + 1}: ${t}`)
      : (bookStudy?.centralThemes || ['A Soberania e Fidelidade de Deus', 'Obediência e Fé Prática']);

    return {
      title: `${cleanBook} ${cleanChapter} — ${headerSubtitle}`,
      overview: `${perícopeSummary}Inserido em ${cleanBook} (${bookStudy?.category || 'Escrituras Sagradas'}, escrito por ${bookStudy?.author || 'inspiração divina'}), o capítulo ${cleanChapter} avança o propósito central do livro: ${(bookStudy?.purpose || 'revelar o caráter e a aliança redentora de Deus').replace(/\.$/, '')}.${keyQuote}`,
      keyThemes: [
        ...dynamicThemes,
        ...(bookStudy?.centralThemes ? bookStudy.centralThemes.slice(0, 2) : [])
      ].slice(0, 5),
      sectionOutline: sectionTitles,
      christocentricKey: bookStudy?.christConnection || `Em ${cleanBook} ${cleanChapter}, a revelação bíblica aponta para a suficiência da graça e da obra redentora de Jesus Cristo, em quem todas as promessas de Deus encontram seu cumprimento perfeito.`
    };
  }
};
