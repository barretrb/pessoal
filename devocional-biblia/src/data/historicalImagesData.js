// Banco de Dados de Imagens Históricas & Arqueológicas Bíblicas
// Cobre Locais, Templos, Rituais Sacerdotais, Personagens, Animais e Costumes da Época

export const HISTORICAL_IMAGES_CATALOG = [
  {
    id: 'tabernaculo_deserto',
    title: 'O Tabernáculo no Deserto',
    category: 'Locais & Templos',
    categoryEmoji: '🏛️',
    date: 'c. 1446 a.C.',
    bibleRef: 'Êxodo 25-40; Hebreus 9:1-5',
    description: 'Santuário portátil erigido pelos israelitas no deserto segundo o modelo revelado a Moisés no Monte Sinai. Composto pelo Pátio Externo (Átrio) com o Altar de Bronze e a Pia de Cobre, e pela Tenda da Congregação com o Lugar Santo (Menorá de Ouro, Mesa dos Pães da Proposição, Altar de Incenso) e o Santo dos Santos guardando a Arca da Aliança.',
    archaeologicalNotes: 'Coberto por quatro camadas protetoras de cortinas de linho fino, pelos de cabra, peles de carneiro tingidas de vermelho e peles de animais marinhos/texugos resistentes ao clima hostil do Sinai.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'tabernacle'
  },
  {
    id: 'sumo_sacerdote_vestes',
    title: 'O Sumo Sacerdote em Vestes Sagradas',
    category: 'Rituais & Sacerdócio',
    categoryEmoji: '🕯️',
    date: 'c. 1440 a.C. - 70 d.C.',
    bibleRef: 'Êxodo 28:1-43; Levítico 16; Hebreus 7',
    description: 'Vestimenta sacerdotal gloriosa composta pelo Peitoral do Juízo com doze pedras preciosas incrustadas (gravadas com os nomes das doze tribos de Israel), o Éfode azul e dourado, o Manto azul com romãs e sinos de ouro na orla, e a Mitra com a lâmina de ouro puro na testa gravada: "Santidade ao Senhor".',
    archaeologicalNotes: 'Dentro do peitoral ficavam o Urim e o Tumim, pedras sagradas usadas para discernir a vontade de Deus em decisões vitais para a nação.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'high_priest'
  },
  {
    id: 'arca_da_alianca',
    title: 'A Arca da Aliança e os Querubins',
    category: 'Rituais & Sacerdócio',
    categoryEmoji: '🕯️',
    date: 'c. 1446 a.C. - 586 a.C.',
    bibleRef: 'Êxodo 25:10-22; 1 Reis 8:1-11; Hebreus 9:4',
    description: 'O objeto mais sagrado de Israel. Uma caixa de madeira de acácia inteiramente revestida de ouro puro por dentro e por fora, encimada pelo Propiciatório (a tampa de ouro batido com dois querubins com asas estendidas). Era o trono visível da presença (Shekinah) de Deus.',
    archaeologicalNotes: 'Dentro da arca eram guardadas as duas Tábuas dos Dez Mandamentos, o vaso de ouro com o Maná do deserto e a Vara de Arão que floresceu.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'ark_covenant'
  },
  {
    id: 'templo_salomao',
    title: 'O Templo de Salomão em Jerusalém',
    category: 'Locais & Templos',
    categoryEmoji: '🏛️',
    date: 'c. 960 a.C. - 586 a.C.',
    bibleRef: '1 Reis 6-8; 2 Crônicas 3-5',
    description: 'Edificado sobre o Monte Moriá em Jerusalém com pedras polidas na pedreira para que nenhum som de martelo ou ferro fosse ouvido durante a construção. Revestido inteiramente de cedro do Líbano esculpido com querubins, palmeiras e flores abertas, coberto de ouro fino de Parvaim.',
    archaeologicalNotes: 'Na entrada erguiam-se as monumentais colunas de bronze Jaquim ("Ele estabelecerá") e Boaz ("Nele está a força"), cada uma com mais de 8 metros de altura.',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'temple_solomon'
  },
  {
    id: 'paulo_prisoes_roma',
    title: 'Paulo Escrevendo nas Prisões de Roma',
    category: 'Personagens & História',
    categoryEmoji: '👤',
    date: 'c. 60 - 62 d.C.',
    bibleRef: 'Atos 28:30-31; Filipenses 1:12-14; 2 Timóteo 4:6-18',
    description: 'O Apóstolo Paulo sob guarda militar romana escrevendo com pena de junco sobre rolos de papiro e pergaminho. Durante o cativeiro, redigiu as Cartas da Prisão (Efésios, Filipenses, Colossenses e Filemon), transmitindo vigor e esperança a toda a Cristandade.',
    archaeologicalNotes: 'Paulo alugou uma moradia própria sob custódia da guarda pretoriana ("prisão domiciliar"), acorrentado a um soldado, antes de seu segundo julgamento imperial.',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'paul_writing'
  },
  {
    id: 'pescador_galileia',
    title: 'O Barco e o Pescador do Mar da Galileia',
    category: 'Personagens & História',
    categoryEmoji: '👤',
    date: 'Século I d.C.',
    bibleRef: 'Mateus 4:18-22; Lucas 5:1-11; João 21:1-8',
    description: 'Reconstrução da vida diária de pescadores como Simão Pedro, André, Tiago e João. Os barcos mediam cerca de 8,2 metros de comprimento e 2,3 metros de largura, construídos com pranchas de cedro e costelas de carvalho, equipados com mastro para vela redonda e quatro remos.',
    archaeologicalNotes: 'Em 1986, durante uma seca histórica no Mar da Galileia, foi descoberto soterrado na lama o célebre "Barco de Jesus", datado por carbono-14 e cerâmica entre 50 a.C. e 70 d.C.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'galilee_boat'
  },
  {
    id: 'pastor_ovelhas_judeia',
    title: 'O Pastor e as Ovelhas nos Montes da Judeia',
    category: 'Fauna, Flora & Cotidiano',
    categoryEmoji: '🐑',
    date: 'Tradição Milenar Bíblica',
    bibleRef: 'Salmo 23; Isaías 40:11; João 10:1-18',
    description: 'A figura central do pastoreio no Oriente Médio. O pastor conhecia cada ovelha pelo nome, conduzia o rebanho com o cajado para defender de feras (ursos, lobos e leões) e com o bordão para resgatar ovelhas presas nas encostas rochosas do deserto de Judá.',
    archaeologicalNotes: 'À noite, os pastores recolhiam as ovelhas em apriscos de pedras soltas sem porta fixa; o próprio pastor deitava-se na abertura, tornando-se literalmente "a porta das ovelhas" (João 10:7).',
    imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'shepherd_sheep'
  },
  {
    id: 'prensa_azeite_getsemani',
    title: 'Getsêmani: A Antiga Prensa de Azeite',
    category: 'Fauna, Flora & Cotidiano',
    categoryEmoji: '🌿',
    date: 'Século I d.C.',
    bibleRef: 'Mateus 26:36-46; Marcos 14:32; Lucas 22:39-44',
    description: 'Getsêmani (em hebraico Gat Shmanim) significa literalmente "Prensa de Azeite". Um olival centenário na ladeira leste do vale de Cedrom, em Jerusalém, onde as azeitonas eram prensadas sob imensas pedras de moinho para extração do óleo puro.',
    archaeologicalNotes: 'Jesus agonizou em oração neste local sob uma pressão espiritual imensurável, suando gotas de sangue antes de ser preso e levado à condenação.',
    imageUrl: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'gethsemane_press'
  },
  {
    id: 'cordeiro_pascal',
    title: 'O Cordeiro Pascal e o Dia da Expiação',
    category: 'Rituais & Sacerdócio',
    categoryEmoji: '🕯️',
    date: 'c. 1446 a.C. - 33 d.C.',
    bibleRef: 'Êxodo 12:1-13; Isaías 53:7; João 1:29; 1 Coríntios 5:7',
    description: 'O cordeiro de um ano, macho e sem defeito, cujo sangue foi aspergido nos umbrais das portas na noite do Êxodo no Egito para que o destruidor passasse por cima. Sombra profética de Jesus Cristo, anunciado por João Batista como "o Cordeiro de Deus que tira o pecado do mundo".',
    archaeologicalNotes: 'No Templo de Jerusalém, durante a Páscoa, centenas de milhares de peregrinos traziam seus cordeiros, examinados rigorosamente pelos sacerdotes para garantir ausência de mácula física.',
    imageUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'paschal_lamb'
  },
  {
    id: 'centuriao_romano_judeia',
    title: 'O Centurião Romano da Guarnição da Judeia',
    category: 'Personagens & História',
    categoryEmoji: '👤',
    date: 'Século I d.C.',
    bibleRef: 'Mateus 8:5-13; Lucas 7:1-10; Atos 10 (Cornélio)',
    description: 'Comandante veterano responsável por uma centúria (cerca de 80 a 100 soldados legionários). Equipado com lorica segmentata (armadura de ferro articulada), elmo de bronze com crista transversal vermelha, escudo retangular (scutum) e espada curta (gládio).',
    archaeologicalNotes: 'Nos Evangelhos e em Atos, os centuriões são retratados com nobreza e fé impressionante, como o oficial de Cafarnaum ("nem mesmo em Israel achei fé como esta") e Cornélio em Cesaréia.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    fallbackArt: 'roman_centurion'
  }
];

export const INSPIRATION_PROMPTS = [
  {
    title: 'A Travessia do Mar Vermelho',
    prompt: 'Moisés estendendo seu cajado ao amanhecer sobre as águas divididas do Mar Vermelho, colunas imensas de água cristalina como muralhas à direita e à esquerda, o povo de Israel marchando com tochas e carretas, atmosfera mística e iluminação dourada épica.',
    category: '📜 Cenas & Milagres Históricos',
    style: '📸 Cinematografia Épica 8K'
  },
  {
    title: 'O Sumo Sacerdote no Santo dos Santos',
    prompt: 'O Sumo Sacerdote de Israel com peitoral incrustado de doze pedras preciosas brilhantes e éfode de ouro, entrando descalço no Santo dos Santos com um incensário dourado emitindo nuvens de incenso perfumado diante da Arca da Aliança e da Shekinah divina.',
    category: '🕯️ Rituais, Templos & Sacerdócio',
    style: '🎨 Pintura a Óleo Renascentista (Rembrandt & Caravaggio)'
  },
  {
    title: 'Paulo no Areópago de Atenas',
    prompt: 'O Apóstolo Paulo com vestes gregas simples de linho discursando com gestos firmes na colina rochosa de Marte (Areópago) em Atenas, cercado por filósofos estoicos e epicureus atentos, com o Partenon e a Acrópole iluminados ao fundo.',
    category: '👤 Personagens & Vestimentas',
    style: '🏛️ Reconstrução Arqueológica Realista'
  },
  {
    title: 'O Templo de Salomão ao Pôr do Sol',
    prompt: 'O Templo de Salomão em Jerusalém visto do Monte das Oliveiras na luz dourada do crepúsculo, detalhes ornamentais em cedro do Líbano e placas de ouro polido refletindo o sol, as duas colunas gigantescas de bronze Jaquim e Boaz na entrada com fumaça subindo do Altar.',
    category: '🏛️ Locais & Arquitetura Antiga',
    style: '📸 Cinematografia Épica 8K'
  },
  {
    title: 'Tempestade no Mar da Galileia',
    prompt: 'Um barco de pesca rústico do século I com velas rasgadas navegando em ondas revoltas sob tempestade escura no Mar da Galileia, Jesus de pé na proa estendendo a mão com autoridade acalmando o vento e o mar, discípulos maravilhados com temor e reverência.',
    category: '📜 Cenas & Milagres Históricos',
    style: '🎨 Pintura a Óleo Renascentista (Rembrandt & Caravaggio)'
  },
  {
    title: 'O Pastor e Suas Ovelhas em Águas Tranquilas',
    prompt: 'Um pastor judeu jovem com cajado de madeira rústica conduzindo um rebanho de ovelhas brancas por um vale verdejante ao lado de um riacho cristalino calmo nos montes da Judeia (Salmo 23), luz suave da manhã, oliveiras antigas na encosta.',
    category: '🐑 Animais & Natureza Bíblica',
    style: '📜 Enciclopédia Histórica Iluminada'
  }
];
