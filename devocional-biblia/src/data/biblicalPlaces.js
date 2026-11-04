// Banco de Dados Geográfico & Arqueológico Bíblico
// Mapeamento de cidades, montes, mares e rotas históricas do Antigo e Novo Testamento

export const BIBLICAL_PLACES = {
  jerusalem: {
    id: 'jerusalem',
    name: 'Jerusalém',
    aliases: ['Jerusalém', 'Jerusalem', 'Sião', 'Sion', 'Cidade de Davi', 'Monte Sião', 'Monte Moriá'],
    region: 'Judeia',
    modernName: 'Jerusalém (Al-Quds / Yerushalayim)',
    coords: { x: 57, y: 64 }, // % relativa no mapa do Oriente Médio / Terra Santa
    localCoords: { x: 50, y: 70 }, // % no mapa específico de Israel/Galileia-Judeia
    summary: 'A Cidade Santa e centro espiritual de Israel. Local do Templo de Salomão, da crucificação e ressurreição de Jesus Cristo, e do nascimento da Igreja Primitiva no Pentecostes.',
    events: [
      'Construção do Templo por Salomão (1 Reis 6)',
      'Entrada triunfal de Jesus no Domingo de Ramos (Mateus 21)',
      'Última Ceia no Cenáculo (Lucas 22)',
      'Julgamento, Crucificação no Gólgota e Ressurreição de Jesus (João 19-20)',
      'Derramamento do Espírito Santo no Pentecostes (Atos 2)',
      'Concílio de Jerusalém sobre a fé gentílica (Atos 15)'
    ],
    journeys: ['jesus', 'paulo1', 'paulo2', 'paulo3', 'paulo_roma']
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
    journeys: ['jesus']
  },
  jerico: {
    id: 'jerico',
    name: 'Jericó',
    aliases: ['Jericó', 'Jerico', 'Cidade das Palmeiras'],
    region: 'Vale do Jordão',
    modernName: 'Jericó (Ariha), Vale do Rio Jordão',
    coords: { x: 59, y: 63 },
    localCoords: { x: 58, y: 67 },
    summary: 'Uma das cidades mais antigas e baixas do planeta (250m abaixo do nível do mar), famosa por seus oásis de palmeiras, águas termais e pelas muralhas do Antigo Testamento.',
    events: [
      'Queda milagrosa das muralhas sob a liderança de Josué (Josué 6)',
      'Purificação das águas da fonte pelo profeta Eliseu (2 Reis 2)',
      'Cura do cego Bartimeu pelo caminho (Marcos 10)',
      'Encontro transformador de Jesus com o cobrador Zaqueu (Lucas 19)'
    ],
    journeys: ['jesus', 'exodo']
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
      'Pregação do evangelista Filipe e grandes curas (Atos 8)'
    ],
    journeys: ['jesus']
  },
  damasco: {
    id: 'damasco',
    name: 'Damasco',
    aliases: ['Damasco', 'Damascus', 'Rua Direita'],
    region: 'Síria',
    modernName: 'Damasco, Síria',
    coords: { x: 64, y: 46 },
    localCoords: { x: 85, y: 12 },
    summary: 'Uma das mais antigas capitais habitadas do mundo. Cidade para onde Saulo de Tarso viajava quando teve a visão celestial que transformou sua vida para sempre.',
    events: [
      'Aparição ressurreta de Cristo a Saulo na estrada: "Saulo, Saulo, por que me persegues?" (Atos 9)',
      'Saulo recupera a visão e é batizado por Ananias na Rua Direita (Atos 9)',
      'Paulo escapa dos muros da cidade descido num cesto (Atos 9:25)'
    ],
    journeys: ['paulo1', 'paulo2', 'paulo3']
  },
  antioquia: {
    id: 'antioquia',
    name: 'Antioquia da Síria',
    aliases: ['Antioquia', 'Antioch', 'Antioquia da Síria', 'Antioquia Síria'],
    region: 'Síria / Turquia moderna',
    modernName: 'Antakya, Turquia',
    coords: { x: 62, y: 35 },
    localCoords: { x: 80, y: 5 },
    summary: 'A terceira maior metrópole do Império Romano e o centro nevrálgico das primeiras missões cristãs entre os gentios. Ponto de partida das três viagens missionárias de Paulo.',
    events: [
      'Local onde os seguidores de Jesus foram chamados de "Cristãos" pela primeira vez (Atos 11:26)',
      'Envio missionário de Paulo e Barnabé com jejum e imposição de mãos (Atos 13:1-3)',
      'Controvérsia pastoral entre Pedro e Paulo sobre a comunhão com gentios (Gálatas 2)'
    ],
    journeys: ['paulo1', 'paulo2', 'paulo3']
  },
  efeso: {
    id: 'efeso',
    name: 'Éfeso',
    aliases: ['Éfeso', 'Efeso', 'Ephesus'],
    region: 'Ásia Menor (Turquia)',
    modernName: 'Selçuk / Izmir, Turquia',
    coords: { x: 42, y: 33 },
    summary: 'Grandiosa metrópole do mundo helenístico-romano, famosa pelo Templo de Ártemis (uma das Sete Maravilhas do Mundo Antigo) e pelo teatro com capacidade para 25 mil pessoas.',
    events: [
      'Paulo passa quase três anos ensinando na Escola de Tirano (Atos 19)',
      'O grande tumulto dos ourives de prata no teatro de Éfeso (Atos 19)',
      'Carta de Paulo aos Efésios e a armadura de Deus (Efésios 6)',
      'Primeira das sete igrejas mencionadas no Apocalipse de João (Apocalipse 2)'
    ],
    journeys: ['paulo2', 'paulo3']
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
    journeys: ['paulo2', 'paulo3']
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
    journeys: ['paulo2', 'paulo3']
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
    journeys: ['paulo2']
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
    journeys: ['paulo_roma']
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
  }
};

// Rotas e Viagens Missionárias Estruturadas
export const BIBLICAL_JOURNEYS = [
  {
    id: 'jesus',
    name: 'Passos e Ministério de Jesus',
    category: 'Evangelhos',
    period: 'c. 4 a.C. - 33 d.C.',
    color: '#ea580c',
    route: [
      { placeId: 'belem', stage: 1, label: 'Nascimento de Jesus', note: 'Lucas 2:1-20' },
      { placeId: 'nazare', stage: 2, label: 'Infância & Juventude', note: 'Lucas 2:39-52' },
      { placeId: 'cana', stage: 3, label: 'Primeiro Sinal: Água em Vinho', note: 'João 2:1-11' },
      { placeId: 'cafarnaum', stage: 4, label: 'Quartel-General do Ministério', note: 'Mateus 4:13' },
      { placeId: 'mar_galileia', stage: 5, label: 'Tempestade Acalmada & Pesca', note: 'Marcos 4; João 21' },
      { placeId: 'samaria', stage: 6, label: 'A Mulher Samaritana no Poço', note: 'João 4:1-42' },
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
    color: '#0284c7',
    route: [
      { placeId: 'antioquia', stage: 1, label: 'Envio pela Igreja de Antioquia', note: 'Atos 13:1-3' },
      { placeId: 'damasco', stage: 2, label: 'Testemunho na Síria', note: 'Atos 9:20' },
      { placeId: 'jerusalem', stage: 3, label: 'Retorno para o Concílio', note: 'Atos 15' }
    ]
  },
  {
    id: 'paulo2',
    name: '2ª Viagem Missionária de Paulo',
    category: 'Atos dos Apóstolos',
    period: 'c. 49 - 52 d.C.',
    color: '#16a34a',
    route: [
      { placeId: 'antioquia', stage: 1, label: 'Partida com Silas', note: 'Atos 15:36-41' },
      { placeId: 'filipos', stage: 2, label: 'Entrada na Europa: Lídia & Prisão', note: 'Atos 16:11-40' },
      { placeId: 'atenas', stage: 3, label: 'Discurso no Areópago', note: 'Atos 17:16-34' },
      { placeId: 'corinto', stage: 4, label: '18 meses de ministério', note: 'Atos 18:1-18' },
      { placeId: 'efeso', stage: 5, label: 'Primeiro contato com a igreja', note: 'Atos 18:19-21' },
      { placeId: 'jerusalem', stage: 6, label: 'Saudação à igreja de Jerusalém', note: 'Atos 18:22' }
    ]
  },
  {
    id: 'paulo3',
    name: '3ª Viagem Missionária de Paulo',
    category: 'Atos dos Apóstolos',
    period: 'c. 53 - 57 d.C.',
    color: '#8b5cf6',
    route: [
      { placeId: 'antioquia', stage: 1, label: 'Fortalecendo os discípulos', note: 'Atos 18:23' },
      { placeId: 'efeso', stage: 2, label: 'Permanência de quase 3 anos', note: 'Atos 19:1-41' },
      { placeId: 'corinto', stage: 3, label: 'Inverno na Grécia e Epístolas', note: 'Atos 20:2-3' },
      { placeId: 'filipos', stage: 4, label: 'Revisita à Macedônia', note: 'Atos 20:6' },
      { placeId: 'jerusalem', stage: 5, label: 'Prisão no Templo', note: 'Atos 21:17-36' }
    ]
  },
  {
    id: 'paulo_roma',
    name: 'Viagem de Paulo Prisioneiro a Roma',
    category: 'Atos dos Apóstolos',
    period: 'c. 59 - 62 d.C.',
    color: '#dc2626',
    route: [
      { placeId: 'jerusalem', stage: 1, label: 'Prisão e Apelo a César', note: 'Atos 25:11' },
      { placeId: 'roma', stage: 2, label: 'Pregação sob custódia em Roma', note: 'Atos 28:16-31' }
    ]
  },
  {
    id: 'exodo',
    name: 'A Peregrinação do Êxodo no Deserto',
    category: 'Pentateuco',
    period: 'c. 1446 a.C. ou 1260 a.C.',
    color: '#d97706',
    route: [
      { placeId: 'monte_sinai', stage: 1, label: 'Entrega da Lei & Tabernáculo', note: 'Êxodo 19-40' },
      { placeId: 'jerico', stage: 2, label: 'Travessia do Jordão & Conquista', note: 'Josué 3-6' },
      { placeId: 'jerusalem', stage: 3, label: 'Terra Prometida de Canaã', note: 'Gênesis 12; Juízes 1' }
    ]
  }
];

// Função auxiliar para encontrar referências a locais bíblicos em um texto de capítulo
export function findBiblicalPlacesInText(text) {
  if (!text || typeof text !== 'string') return [];
  
  const foundPlaces = [];

  Object.values(BIBLICAL_PLACES).forEach(place => {
    const hasMatch = place.aliases.some(alias => {
      // Cria regex case-insensitive considerando limites de palavra Unicode
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
