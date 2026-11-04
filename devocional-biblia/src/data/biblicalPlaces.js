// Banco de Dados Geográfico & Arqueológico Bíblico
// Mapeamento de cidades, montes, mares e rotas históricas do Antigo e Novo Testamento

export const BIBLICAL_PLACES = {
  jerusalem: {
    id: 'jerusalem',
    name: 'Jerusalém',
    aliases: ['Jerusalém', 'Jerusalem', 'Sião', 'Sion', 'Cidade de Davi', 'Monte Sião', 'Monte Moriá'],
    region: 'Judeia',
    modernName: 'Jerusalém (Al-Quds / Yerushalayim)',
    coords: { x: 57, y: 64 },
    localCoords: { x: 50, y: 70 },
    summary: 'A Cidade Santa e centro espiritual de Israel. Local do Templo de Salomão, da crucificação e ressurreição de Jesus Cristo, e do nascimento da Igreja Primitiva no Pentecostes.',
    events: [
      'Construção do Templo por Salomão (1 Reis 6)',
      'Entrada triunfal de Jesus no Domingo de Ramos (Mateus 21)',
      'Última Ceia no Cenáculo (Lucas 22)',
      'Julgamento, Crucificação no Gólgota e Ressurreição de Jesus (João 19-20)',
      'Derramamento do Espírito Santo no Pentecostes (Atos 2)',
      'Concílio de Jerusalém sobre a fé gentílica (Atos 15)'
    ],
    journeys: ['jesus', 'paulo1', 'paulo2', 'paulo3', 'paulo_roma', 'paulo_todas', 'exodo', 'tribos']
  },
  cafarnaum: {
    id: 'cafarnaum',
    name: 'Cafarnaum',
    aliases: ['Cafarnaum', 'Capernaum', 'Capernaum da Galileia'],
    region: 'Galileia',
    modernName: 'Kfar Nahum, Israel (norte do Mar da Galileia)',
    coords: { x: 58, y: 55 },
    localCoords: { x: 62, y: 32 },
    summary: 'Conhecida nos Evangelhos como "a própria cidade de Jesus" (Mateus 9:1). Cidade pesqueira e comercial onde Jesus estabeleceu a sede do seu ministério galileu após sair de Nazaré.',
    events: [
      'Chamado de Pedro, André, Tiago, João e Mateus (Marcos 1-2)',
      'Cura do servo do centurião romano (Lucas 7)',
      'Cura do paralítico descido pelo teto da casa (Marcos 2)',
      'Discurso do Pão da Vida na sinagoga local (João 6)'
    ],
    journeys: ['jesus']
  },
  nazare: {
    id: 'nazare',
    name: 'Nazaré',
    aliases: ['Nazaré', 'Nazare', 'Nazareth'],
    region: 'Galileia',
    modernName: 'Nazaré, Israel',
    coords: { x: 56, y: 57 },
    localCoords: { x: 48, y: 38 },
    summary: 'Povoado nas colinas da Baixa Galileia onde Maria e José viveram e onde Jesus cresceu, trabalhando como carpinteiro até o início de seu ministério público.',
    events: [
      'A Anunciação do anjo Gabriel a Maria (Lucas 1:26)',
      'Infância e juventude de Jesus com sabedoria e graça (Lucas 2:51-52)',
      'Leitura do rolo do profeta Isaías na sinagoga e rejeição de seus conterrâneos (Lucas 4:16-30)'
    ],
    journeys: ['jesus']
  },
  belem: {
    id: 'belem',
    name: 'Belém',
    aliases: ['Belém', 'Belem', 'Belém de Judá', 'Efrata'],
    region: 'Judeia',
    modernName: 'Belém (Bet Lehem), Palestina / Cisjordânia',
    coords: { x: 57, y: 66 },
    localCoords: { x: 50, y: 74 },
    summary: 'A Cidade de Davi, situada a cerca de 8 km ao sul de Jerusalém. Berço do Rei Davi e lugar do cumprimento da profecia messiânica de Miqueias 5:2.',
    events: [
      'Casamento de Boaz e Rute, ancestrais de Davi (Rute 4)',
      'Unção de Davi pelo profeta Samuel (1 Samuel 16)',
      'Nascimento de Jesus Cristo em uma manjedoura (Lucas 2)',
      'Visita dos magos do Oriente com ouro, incenso e mirra (Mateus 2)'
    ],
    journeys: ['jesus', 'tribos']
  },
  jerico: {
    id: 'jerico',
    name: 'Jericó',
    aliases: ['Jericó', 'Jerico', 'Cidade das Palmeiras'],
    region: 'Vale do Jordão',
    modernName: 'Jericó (Ariha), Vale do Rio Jordão',
    coords: { x: 59, y: 63 },
    localCoords: { x: 58, y: 67 },
    summary: 'Uma das cidades mais antigas do planeta (250m abaixo do nível do mar), famosa por seus oásis de palmeiras, águas termais e pelas muralhas do Antigo Testamento.',
    events: [
      'Queda milagrosa das muralhas sob a liderança de Josué (Josué 6)',
      'Purificação das águas da fonte pelo profeta Eliseu (2 Reis 2)',
      'Cura do cego Bartimeu pelo caminho (Marcos 10)',
      'Encontro transformador de Jesus com o cobrador Zaqueu (Lucas 19)'
    ],
    journeys: ['jesus', 'exodo', 'tribos']
  },
  mar_galileia: {
    id: 'mar_galileia',
    name: 'Mar da Galileia',
    aliases: ['Mar da Galileia', 'Lago de Genesaré', 'Mar de Tiberíades', 'Quinerete', 'Kinneret'],
    region: 'Galileia',
    modernName: 'Lago Kinneret, Israel',
    coords: { x: 59, y: 56 },
    localCoords: { x: 65, y: 35 },
    summary: 'Lago de água doce cercado por colinas vulcânicas e montanhas, conhecido por tempestades repentinas e por ser o coração geográfico dos milagres de Jesus.',
    events: [
      'Jesus acalma a tempestade no mar: "Aquieta-te!" (Marcos 4)',
      'Jesus caminha sobre as águas em direção ao barco (Mateus 14)',
      'Primeira e segunda pesca milagrosa com redes cheias (Lucas 5; João 21)',
      'Sermão do Monte nas colinas próximas (Mateus 5-7)'
    ],
    journeys: ['jesus']
  },
  cana: {
    id: 'cana',
    name: 'Caná da Galileia',
    aliases: ['Caná', 'Cana', 'Caná da Galileia'],
    region: 'Galileia',
    modernName: 'Kafr Kanna, Galileia',
    coords: { x: 57, y: 56 },
    localCoords: { x: 52, y: 34 },
    summary: 'Povoado vizinho a Nazaré onde Jesus operou seu primeiro milagre durante uma festa de casamento, revelando sua glória a seus primeiros discípulos.',
    events: [
      'Transformação da água em vinho nas bodas de Caná (João 2:1-11)',
      'Cura à distância do filho do nobre de Cafarnaum (João 4:46-54)'
    ],
    journeys: ['jesus']
  },
  betania: {
    id: 'betania',
    name: 'Betânia',
    aliases: ['Betânia', 'Betania'],
    region: 'Judeia',
    modernName: 'Al-Eizariya, ladeira oriental do Monte das Oliveiras',
    coords: { x: 57.5, y: 64.5 },
    localCoords: { x: 52, y: 71 },
    summary: 'Aldeia acolhedora nas proximidades de Jerusalém, onde residiam os amigos íntimos de Jesus: Lázaro, Marta e Maria.',
    events: [
      'Ressurreição de Lázaro após quatro dias no sepulcro (João 11)',
      'Maria unge os pés de Jesus com nardo puro de grande valor (João 12)',
      'Ponto de partida da Ascensão de Jesus aos céus (Lucas 24:50)'
    ],
    journeys: ['jesus']
  },
  samaria: {
    id: 'samaria',
    name: 'Samaria (Sicar)',
    aliases: ['Samaria', 'Sicar', 'Poço de Jacó', 'Sebaste'],
    region: 'Samaria',
    modernName: 'Região de Nablus / Sebastia',
    coords: { x: 57, y: 60 },
    localCoords: { x: 50, y: 52 },
    summary: 'Capital do reino do norte de Israel e região intermediária entre a Galileia e a Judeia. Historicamente habitada por samaritanos em tensão religiosa com os judeus.',
    events: [
      'Diálogo de Jesus com a Mulher Samaritana junto ao Poço de Jacó: "a Água Viva" (João 4)',
      'Parábola do Bom Samaritano (Lucas 10)',
      'Filipe prega com sinais e grande avivamento em Samaria (Atos 8)'
    ],
    journeys: ['jesus', 'tribos']
  },
  cesareia: {
    id: 'cesareia',
    name: 'Cesareia Marítima',
    aliases: ['Cesareia', 'Cesareia Marítima', 'Cesarea'],
    region: 'Costa do Mediterrâneo',
    modernName: 'Cesareia, Israel',
    coords: { x: 55, y: 59 },
    localCoords: { x: 42, y: 46 },
    summary: 'Magnífica capital administrativa e porto romano construído por Herodes, o Grande. Sede dos governadores romanos (Pôncio Pilatos, Félix, Festo).',
    events: [
      'Conversão do centurião Cornélio e o batismo com o Espírito Santo entre gentios (Atos 10)',
      'Paulo passa dois anos sob custódia e defende sua fé perante o Rei Agripa (Atos 25-26)',
      'Ponto de embarque de Paulo como prisioneiro para Roma (Atos 27:1)'
    ],
    journeys: ['paulo2', 'paulo3', 'paulo_roma', 'paulo_todas']
  },
  jope: {
    id: 'jope',
    name: 'Jope (Jaffa)',
    aliases: ['Jope', 'Jaffa', 'Joppa'],
    region: 'Costa da Judeia',
    modernName: 'Tel Aviv-Yafo, Israel',
    coords: { x: 54, y: 62 },
    localCoords: { x: 40, y: 60 },
    summary: 'Antigo porto bíblico do mar Mediterrâneo, por onde chegaram os cedros do Líbano para o Templo de Salomão.',
    events: [
      'Jonas embarca em navio fugindo para Társis (Jonas 1:3)',
      'Pedro ressuscita Dorcas (Tabita), mulher cheia de boas obras (Atos 9:36-42)',
      'Pedro recebe no terraço a visão dos animais limpos e impuros (Atos 10:9-16)'
    ],
    journeys: ['tribos']
  },
  damasco: {
    id: 'damasco',
    name: 'Damasco',
    aliases: ['Damasco', 'Damascus', 'Estrada de Damasco'],
    region: 'Síria',
    modernName: 'Damasco, Síria',
    coords: { x: 62, y: 50 },
    summary: 'Uma das cidades continuamente habitadas mais antigas do mundo. Cenário da mais famosa conversão da história cristã.',
    events: [
      'A visão da luz resplandecente e o encontro de Saulo com Jesus ressurreto (Atos 9:1-9)',
      'Ananias ora por Saulo na Rua Direita e ele recupera a visão (Atos 9:10-19)',
      'Saulo é descido em um cesto pela muralha para escapar da perseguição (Atos 9:25)'
    ],
    journeys: ['paulo1', 'paulo_todas']
  },
  antioquia: {
    id: 'antioquia',
    name: 'Antioquia da Síria',
    aliases: ['Antioquia', 'Antioquia da Síria', 'Antioch'],
    region: 'Síria / Turquia moderna',
    modernName: 'Antakya (Hatay), Turquia',
    coords: { x: 60, y: 44 },
    summary: 'Terceira maior metrópole do Império Romano. Berço das missões cristãs mundiais e o lugar onde os seguidores de Jesus foram chamados de "cristãos" pela primeira vez.',
    events: [
      'Discípulos foram chamados cristãos pela primeira vez em Antioquia (Atos 11:26)',
      'Barnabé e Saulo são consagrados e enviados na 1ª viagem missionária (Atos 13:1-3)',
      'Base de retorno e relato missionário de Paulo para a igreja gentílica (Atos 14:26-28)'
    ],
    journeys: ['paulo1', 'paulo2', 'paulo3', 'paulo_todas']
  },
  efeso: {
    id: 'efeso',
    name: 'Éfeso',
    aliases: ['Éfeso', 'Efeso', 'Ephesus'],
    region: 'Ásia Menor (Jônia)',
    modernName: 'Selçuk / Izmir, Turquia',
    coords: { x: 44, y: 32 },
    summary: 'Grande empório comercial e religioso da Ásia Menor, famosa pelo Templo de Ártemis (Diana). Paulo viveu e ensinou ali por cerca de 3 anos com grande impacto.',
    events: [
      'Paulo prega na Escola de Tirano diariamente por dois anos (Atos 19:9-10)',
      'Milagres extraordinários: lenços e aventais de Paulo curavam doentes (Atos 19:11-12)',
      'O tumulto no grande teatro de Éfeso instigado pelo ourives Demétrio (Atos 19:23-41)',
      'Paulo escreve sua carta aos Efésios e despede-se emocionado dos presbíteros em Mileto (Atos 20:17-38)'
    ],
    journeys: ['paulo2', 'paulo3', 'paulo_todas']
  },
  troade: {
    id: 'troade',
    name: 'Trôade',
    aliases: ['Trôade', 'Troade', 'Troas'],
    region: 'Mísia / Noroeste da Ásia Menor',
    modernName: 'Próximo a Dalyan / Çanakkale, Turquia',
    coords: { x: 42, y: 24 },
    summary: 'Porto no mar Egeu perto das ruínas da antiga Troia. Local chave de direção espiritual para a evangelização do continente europeu.',
    events: [
      'A visão noturna do varão macedônio: "Passa à Macedônia e ajuda-nos!" (Atos 16:9)',
      'Paulo prega até a meia-noite e ressuscita o jovem Êutico que caiu da janela (Atos 20:7-12)'
    ],
    journeys: ['paulo2', 'paulo3', 'paulo_todas']
  },
  filipos: {
    id: 'filipos',
    name: 'Filipos',
    aliases: ['Filipos', 'Philippi'],
    region: 'Macedônia (Grécia)',
    modernName: 'Kavala / Filipos, Grécia',
    coords: { x: 36, y: 22 },
    summary: 'Colônia militar romana estratégica na Via Egnácia e primeira cidade da Europa continental a receber a mensagem do evangelho cristão.',
    events: [
      'Conversão de Lídia, vendedora de tecidos de púrpura, junto ao rio (Atos 16:14)',
      'Paulo e Silas oram e cantam louvores à meia-noite na prisão antes do terremoto (Atos 16:25)',
      'Conversão e batismo do carcereiro de Filipos e sua família (Atos 16:30-34)'
    ],
    journeys: ['paulo2', 'paulo3', 'paulo_todas']
  },
  tessalonica: {
    id: 'tessalonica',
    name: 'Tessalônica',
    aliases: ['Tessalônica', 'Tessalonica', 'Salônica', 'Thessalonica'],
    region: 'Macedônia (Grécia)',
    modernName: 'Salônica, Grécia',
    coords: { x: 34, y: 22 },
    summary: 'Capital e maior porto da província romana da Macedônia. Paulo pregou na sinagoga por três sábados com grande frutificação entre gentios e gregos devotos.',
    events: [
      'Paulo arrazoa nas sinagogas provando que Jesus é o Cristo (Atos 17:1-4)',
      'Escreve 1 e 2 Tessalonicenses sobre o arrebatamento e a volta de Cristo'
    ],
    journeys: ['paulo2', 'paulo_todas']
  },
  bereia: {
    id: 'bereia',
    name: 'Bereia',
    aliases: ['Bereia', 'Berea', 'Veroia'],
    region: 'Macedônia (Grécia)',
    modernName: 'Veria, Grécia',
    coords: { x: 33, y: 23 },
    summary: 'Cidade macedônia famosa pelo caráter nobre de seus cidadãos, que conferiam diariamente as Escrituras para verificar os ensinamentos de Paulo.',
    events: [
      'Elogio bíblico: "Eram mais nobres que os de Tessalônica, pois examinaram as Escrituras diariamente" (Atos 17:11)'
    ],
    journeys: ['paulo2', 'paulo_todas']
  },
  atenas: {
    id: 'atenas',
    name: 'Atenas',
    aliases: ['Atenas', 'Athens', 'Areópago'],
    region: 'Ática (Grécia)',
    modernName: 'Atenas, Grécia',
    coords: { x: 35, y: 32 },
    summary: 'O berço histórico da filosofia, das artes e da democracia grega. Repleta de templos e monumentos aos deuses pagãos.',
    events: [
      'Discurso monumental de Paulo na colina do Areópago sobre o "Deus Desconhecido" (Atos 17:22-34)',
      'Dionísio, o areopagita, e Dâmaris abraçam a fé em Cristo (Atos 17:34)'
    ],
    journeys: ['paulo2', 'paulo_todas']
  },
  corinto: {
    id: 'corinto',
    name: 'Corinto',
    aliases: ['Corinto', 'Corinth'],
    region: 'Acaia (Grécia)',
    modernName: 'Corinto, Grécia',
    coords: { x: 33, y: 31 },
    summary: 'Importante centro marítimo e comercial entre dois portos no istmo grego. Cidade cosmopolita conhecida por sua prosperidade, cultos idolátricos e grande comunidade cristã.',
    events: [
      'Paulo passa um ano e meio fundando e edificando a igreja (Atos 18)',
      'Paulo trabalha como fabricante de tendas ao lado de Áquila e Priscila (Atos 18:3)',
      'Paulo escreve as comoventes epístolas de 1 e 2 Coríntios sobre o amor cristão (1 Coríntios 13)'
    ],
    journeys: ['paulo2', 'paulo3', 'paulo_todas']
  },
  malta: {
    id: 'malta',
    name: 'Ilha de Malta',
    aliases: ['Malta', 'Melita'],
    region: 'Mediterrâneo Central',
    modernName: 'República de Malta',
    coords: { x: 23, y: 40 },
    summary: 'Ilha onde o navio que levava Paulo prisioneiro naufragou após 14 dias de tempestade violenta no mar Adriático.',
    events: [
      'Todos os 276 tripulantes e passageiros são salvos milagrosamente a nado (Atos 27:37-44)',
      'Uma víbora venenosa morde a mão de Paulo enquanto juntava lenha, mas ele sacode no fogo sem sofrer mal (Atos 28:3-6)',
      'Cura do pai de Públio e de todos os doentes da ilha (Atos 28:7-10)'
    ],
    journeys: ['paulo_roma', 'paulo_todas']
  },
  roma: {
    id: 'roma',
    name: 'Roma',
    aliases: ['Roma', 'Rome', 'César', 'Cesar'],
    region: 'Itália',
    modernName: 'Roma, Itália',
    coords: { x: 18, y: 22 },
    summary: 'A capital triunfante do maior império do mundo antigo. Para onde Paulo viajou como prisioneiro apelando a César, escrevendo epístolas da prisão que transformaram a teologia cristã.',
    events: [
      'Chegada de Paulo sob custódia militar após naufrágio em Malta (Atos 28:16)',
      'Paulo prega o Reino de Deus sob prisão domiciliar por dois anos a todos que o visitavam (Atos 28:30-31)',
      'Escrita das cartas de Efésios, Filipenses, Colossenses e Filemon',
      'Martírio do Apóstolo Paulo sob a perseguição de Nero'
    ],
    journeys: ['paulo_roma', 'paulo_todas']
  },
  monte_sinai: {
    id: 'monte_sinai',
    name: 'Monte Sinai (Horebe)',
    aliases: ['Monte Sinai', 'Sinai', 'Horebe', 'Monte Horebe'],
    region: 'Península do Sinai / Arábia',
    modernName: 'Jabal Musa, Península do Sinai, Egito',
    coords: { x: 53, y: 82 },
    summary: 'A Montanha Sagrada onde Deus revelou seu Nome ("EU SOU O QUE SOU") a Moisés na sarça ardente e onde entregou as Tábuas da Lei e as instruções do Tabernáculo.',
    events: [
      'A sarça ardente que queimava sem se consumir (Êxodo 3)',
      'Descida da glória de Deus em fogo, fumaça e trovões sobre o monte (Êxodo 19)',
      'Entrega dos Dez Mandamentos escritos pelo dedo de Deus (Êxodo 20)',
      'Construção do Tabernáculo segundo o modelo celestial mostrado no monte (Êxodo 25-40)',
      'Elias ouve a voz mansa e delicada de Deus na caverna do Horebe (1 Reis 19)'
    ],
    journeys: ['exodo']
  },
  hebrom: {
    id: 'hebrom',
    name: 'Hebrom',
    aliases: ['Hebrom', 'Hebron', 'Quiriat-Arba'],
    region: 'Montanhas de Judá',
    modernName: 'Al-Khalil / Hebron',
    coords: { x: 56, y: 68 },
    summary: 'Cidade dos patriarcas Abraão, Isaque e Jacó, onde ficava a caverna de Macpela. Primeira capital de Davi por 7 anos antes de conquistar Jerusalém.',
    events: [
      'Abraão adquire o campo e a caverna de Macpela como sepultura de Sara (Gênesis 23)',
      'Davi reina em Hebrom sobre a tribo de Judá (2 Samuel 2:1-4)'
    ],
    journeys: ['tribos']
  },
  silo: {
    id: 'silo',
    name: 'Siló',
    aliases: ['Siló', 'Silo', 'Shiloh'],
    region: 'Efraim',
    modernName: 'Khirbet Seilun, Samaria / Cisjordânia',
    coords: { x: 57, y: 61 },
    summary: 'Primeiro santuário central das tribos de Israel em Canaã após a conquista. O Tabernáculo e a Arca da Aliança permaneceram em Siló por mais de três séculos.',
    events: [
      'Josué reparte a terra prometida por sortes diante do Senhor em Siló (Josué 18:1-10)',
      'Ana ora em lágrimas por um filho e Deus lhe concede Samuel (1 Samuel 1)',
      'O jovem profeta Samuel ouve a voz audível de Deus à noite no Tabernáculo (1 Samuel 3)'
    ],
    journeys: ['tribos']
  }
};

// Rotas e Viagens Missionárias Estruturadas com Associação ao Mapa Histórico Autêntico
export const BIBLICAL_JOURNEYS = [
  {
    id: 'jesus',
    name: 'Passos e Ministério de Jesus',
    category: 'Evangelhos',
    period: 'c. 4 a.C. - 33 d.C.',
    mapImage: '/mapas/palestina_jesus.jpg',
    mapTitle: 'Mapa Histórico da Palestina no Tempo de Jesus (Galileia, Samaria, Judeia, Pereia e Decápolis)',
    color: '#ea580c',
    route: [
      { placeId: 'belem', stage: 1, label: 'Nascimento em Belém', note: 'Lucas 2:1-20' },
      { placeId: 'nazare', stage: 2, label: 'Crescimento em Nazaré', note: 'Lucas 2:39-52' },
      { placeId: 'cana', stage: 3, label: 'Primeiro Milagre nas Bodas', note: 'João 2:1-11' },
      { placeId: 'cafarnaum', stage: 4, label: 'Sede do Ministério Galileu', note: 'Mateus 4:13' },
      { placeId: 'mar_galileia', stage: 5, label: 'Tempestade Acalmada & Pesca', note: 'Marcos 4; João 21' },
      { placeId: 'samaria', stage: 6, label: 'Mulher Samaritana no Poço', note: 'João 4:1-42' },
      { placeId: 'jerico', stage: 7, label: 'Cura de Bartimeu & Zaqueu', note: 'Lucas 18-19' },
      { placeId: 'betania', stage: 8, label: 'Ressurreição de Lázaro', note: 'João 11' },
      { placeId: 'jerusalem', stage: 9, label: 'Última Ceia, Cruz & Ressurreição', note: 'João 18-20' }
    ]
  },
  {
    id: 'paulo1',
    name: '1ª Viagem Missionária de Paulo',
    category: 'Atos dos Apóstolos',
    period: 'c. 46 - 48 d.C.',
    mapImage: '/mapas/paulo_viagem_1.svg',
    mapTitle: 'Mapa da 1ª Viagem Missionária de Paulo (Antioquia, Chipre, Perge e Galácia do Sul)',
    color: '#0284c7',
    route: [
      { placeId: 'antioquia', stage: 1, label: 'Envio pela Igreja de Antioquia', note: 'Atos 13:1-3' },
      { placeId: 'damasco', stage: 2, label: 'Testemunho e Ministério na Síria', note: 'Atos 9:20' },
      { placeId: 'jerusalem', stage: 3, label: 'Retorno ao Concílio de Jerusalém', note: 'Atos 15' }
    ]
  },
  {
    id: 'paulo2',
    name: '2ª Viagem Missionária de Paulo',
    category: 'Atos dos Apóstolos',
    period: 'c. 49 - 52 d.C.',
    mapImage: '/mapas/paulo_viagem_2.svg',
    mapTitle: 'Mapa da 2ª Viagem Missionária de Paulo (Trôade, Filipos, Atenas, Corinto e Éfeso)',
    color: '#16a34a',
    route: [
      { placeId: 'antioquia', stage: 1, label: 'Partida com Silas', note: 'Atos 15:36-41' },
      { placeId: 'troade', stage: 2, label: 'Visão do Varão Macedônio', note: 'Atos 16:9' },
      { placeId: 'filipos', stage: 3, label: 'Entrada na Europa: Lídia & Prisão', note: 'Atos 16:11-40' },
      { placeId: 'tessalonica', stage: 4, label: 'Pregação na Sinagoga', note: 'Atos 17:1-9' },
      { placeId: 'bereia', stage: 5, label: 'Os Nobres Bereanos', note: 'Atos 17:10-14' },
      { placeId: 'atenas', stage: 6, label: 'Discurso no Areópago', note: 'Atos 17:16-34' },
      { placeId: 'corinto', stage: 7, label: '18 meses de ministério', note: 'Atos 18:1-18' },
      { placeId: 'efeso', stage: 8, label: 'Primeiro contato com a igreja', note: 'Atos 18:19-21' },
      { placeId: 'jerusalem', stage: 9, label: 'Saudação à igreja de Jerusalém', note: 'Atos 18:22' }
    ]
  },
  {
    id: 'paulo3',
    name: '3ª Viagem Missionária de Paulo',
    category: 'Atos dos Apóstolos',
    period: 'c. 53 - 57 d.C.',
    mapImage: '/mapas/paulo_viagem_3.svg',
    mapTitle: 'Mapa da 3ª Viagem Missionária de Paulo (Permanência em Éfeso e Circuito no Egeu)',
    color: '#8b5cf6',
    route: [
      { placeId: 'antioquia', stage: 1, label: 'Fortalecendo os discípulos', note: 'Atos 18:23' },
      { placeId: 'efeso', stage: 2, label: 'Permanência de quase 3 anos', note: 'Atos 19:1-41' },
      { placeId: 'corinto', stage: 3, label: 'Inverno na Grécia e Epístolas', note: 'Atos 20:2-3' },
      { placeId: 'filipos', stage: 4, label: 'Revisita à Macedônia', note: 'Atos 20:6' },
      { placeId: 'troade', stage: 5, label: 'Ceia e Ressurreição de Êutico', note: 'Atos 20:7-12' },
      { placeId: 'cesareia', stage: 6, label: 'Profecia de Ágabo sobre a prisão', note: 'Atos 21:8-14' },
      { placeId: 'jerusalem', stage: 7, label: 'Prisão no Templo', note: 'Atos 21:17-36' }
    ]
  },
  {
    id: 'paulo_roma',
    name: 'Viagem de Paulo a Roma',
    category: 'Atos dos Apóstolos',
    period: 'c. 59 - 62 d.C.',
    mapImage: '/mapas/paulo_viagem_roma.svg',
    mapTitle: 'Mapa da Viagem de Paulo Prisioneiro a Roma (Cesareia, Creta, Naufrágio em Malta e Roma)',
    color: '#dc2626',
    route: [
      { placeId: 'jerusalem', stage: 1, label: 'Prisão e Apelo a César', note: 'Atos 25:11' },
      { placeId: 'cesareia', stage: 2, label: 'Defesa perante o Rei Agripa', note: 'Atos 26' },
      { placeId: 'malta', stage: 3, label: 'Naufrágio e Cura dos Nativos', note: 'Atos 28:1-10' },
      { placeId: 'roma', stage: 4, label: 'Pregação sob Custódia em Roma', note: 'Atos 28:16-31' }
    ]
  },
  {
    id: 'paulo_todas',
    name: 'Todas as Viagens de Paulo',
    category: 'Atos dos Apóstolos',
    period: 'c. 46 - 62 d.C.',
    mapImage: '/mapas/paulo_viagens_todas.svg',
    mapTitle: 'Visão Geral Panorâmica de Todas as Viagens do Apóstolo Paulo no Império Romano',
    color: '#2563eb',
    route: [
      { placeId: 'jerusalem', stage: 1, label: 'Igreja Mãe e Concílio', note: 'Atos 15' },
      { placeId: 'antioquia', stage: 2, label: 'Base Missionária', note: 'Atos 13:1' },
      { placeId: 'efeso', stage: 3, label: 'Centro na Ásia Menor', note: 'Atos 19' },
      { placeId: 'corinto', stage: 4, label: 'Grande Igreja na Acaia', note: 'Atos 18' },
      { placeId: 'atenas', stage: 5, label: 'Discurso no Areópago', note: 'Atos 17' },
      { placeId: 'roma', stage: 6, label: 'Testemunho no Centro do Império', note: 'Atos 28' }
    ]
  },
  {
    id: 'exodo',
    name: 'Peregrinação do Êxodo e Sinai',
    category: 'Pentateuco',
    period: 'c. 1446 a.C.',
    mapImage: '/mapas/rota_exodo.jpg',
    mapTitle: 'Mapa Cartográfico do Êxodo: Da Terra de Gósen pelo Mar Vermelho ao Monte Sinai e Canaã',
    color: '#d97706',
    route: [
      { placeId: 'monte_sinai', stage: 1, label: 'Entrega da Lei & Tabernáculo', note: 'Êxodo 19-40' },
      { placeId: 'jerico', stage: 2, label: 'Travessia do Jordão & Queda dos Muros', note: 'Josué 3-6' },
      { placeId: 'jerusalem', stage: 3, label: 'Entrada na Terra Prometida', note: 'Josué 1' }
    ]
  },
  {
    id: 'tribos',
    name: 'As 12 Tribos de Israel',
    category: 'Antigo Testamento',
    period: 'c. 1400 a.C. - 1000 a.C.',
    mapImage: '/mapas/doze_tribos_israel.svg',
    mapTitle: 'Mapa da Distribuição Geográfica das Doze Tribos de Israel na Terra Prometida',
    color: '#059669',
    route: [
      { placeId: 'hebrom', stage: 1, label: 'Tribo de Judá (Davi & Patriarcas)', note: 'Josué 15' },
      { placeId: 'jerusalem', stage: 2, label: 'Fronteira de Benjamim & Judá', note: 'Josué 18' },
      { placeId: 'silo', stage: 3, label: 'Tribo de Efraim (Tabernáculo Inicial)', note: 'Josué 18:1' },
      { placeId: 'samaria', stage: 4, label: 'Tribo de Manassés', note: 'Josué 17' },
      { placeId: 'jope', stage: 5, label: 'Território da Tribo de Dã', note: 'Josué 19:40-48' }
    ]
  }
];

// Função auxiliar para encontrar referências a locais bíblicos em um texto de capítulo
export function findBiblicalPlacesInText(text) {
  if (!text || typeof text !== 'string') return [];
  
  const foundPlaces = [];

  Object.values(BIBLICAL_PLACES).forEach(place => {
    const hasMatch = place.aliases.some(alias => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('(^|[^\\p{L}\\p{N}])' + escaped + '([^\\p{L}\\p{N}]|$)', 'iu');
      return regex.test(text);
    });

    if (hasMatch && !foundPlaces.some(p => p.id === place.id)) {
      foundPlaces.push(place);
    }
  });

  return foundPlaces;
}
