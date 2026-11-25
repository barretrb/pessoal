import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const bibliaDir = path.join(rootDir, 'public', 'biblia');
const outFile = path.join(rootDir, 'src', 'data', 'chapterTheologyIndex.json');

function norm(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const AXIS_DEFAULT_THEME = {
  criacao_louvor: 'Criação & Cântico de Louvor',
  cruz_redencao: 'Cruz, Sacrifício & Redenção',
  graca_justificacao: 'Graça, Perdão & Nova Vida',
  ressurreicao_esperanca: 'Ressurreição & Esperança Eterna',
  cristologia_soberania: 'Soberania & Glória de Deus',
  igreja_amor: 'Comunhão, Igreja & Amor Ágape',
  consolo_providencia: 'Refúgio, Cuidado & Consolo',
  arrependimento_santidade: 'Arrependimento & Santidade',
  oracao_presenca: 'Clamor, Oração & Presença',
  alianca_promessa: 'Aliança & Fidelidade de Deus',
  sabedoria_temor: 'Sabedoria & Temor do Senhor',
  missao_firmeza: 'Coragem, Missão & Firmeza'
};

const AXIS_QUERY_WORDS = {
  criacao_louvor: 'louvor criacao adoracao',
  cruz_redencao: 'cruz redencao sangue cordeiro',
  graca_justificacao: 'graca salvacao justificacao',
  ressurreicao_esperanca: 'ressurreicao esperanca eternidade',
  cristologia_soberania: 'soberania santo cristo rei',
  igreja_amor: 'amor igreja unidade comunhao',
  consolo_providencia: 'consolo refugio confianca paz',
  arrependimento_santidade: 'arrependimento santidade perdao',
  oracao_presenca: 'oracao presenca de deus clamor',
  alianca_promessa: 'alianca promessa fidelidade',
  sabedoria_temor: 'sabedoria temor do senhor',
  missao_firmeza: 'missao coragem firmeza fe'
};

// Book baselines used strictly as light tie-breaker (+8 primary, +4 secondary)
const BOOK_BASELINES = {
  genesis: ['alianca_promessa', 'criacao_louvor'],
  exodo: ['alianca_promessa', 'cruz_redencao'],
  levitico: ['cruz_redencao', 'arrependimento_santidade'],
  numeros: ['alianca_promessa', 'consolo_providencia'],
  deuteronomio: ['alianca_promessa', 'sabedoria_temor'],
  josue: ['missao_firmeza', 'alianca_promessa'],
  juizes: ['arrependimento_santidade', 'consolo_providencia'],
  rute: ['consolo_providencia', 'alianca_promessa'],
  '1samuel': ['oracao_presenca', 'cristologia_soberania'],
  '2samuel': ['alianca_promessa', 'cristologia_soberania'],
  '1reis': ['sabedoria_temor', 'cristologia_soberania'],
  '2reis': ['arrependimento_santidade', 'consolo_providencia'],
  '1cronicas': ['criacao_louvor', 'alianca_promessa'],
  '2cronicas': ['oracao_presenca', 'arrependimento_santidade'],
  esdras: ['arrependimento_santidade', 'alianca_promessa'],
  neemias: ['missao_firmeza', 'oracao_presenca'],
  ester: ['consolo_providencia', 'alianca_promessa'],
  jo: ['sabedoria_temor', 'consolo_providencia'],
  salmos: ['criacao_louvor', 'consolo_providencia'],
  proverbios: ['sabedoria_temor', 'arrependimento_santidade'],
  eclesiastes: ['sabedoria_temor', 'cristologia_soberania'],
  canticos: ['igreja_amor', 'oracao_presenca'],
  isaias: ['cruz_redencao', 'cristologia_soberania'],
  jeremias: ['arrependimento_santidade', 'alianca_promessa'],
  lamentacoes: ['consolo_providencia', 'arrependimento_santidade'],
  ezequiel: ['arrependimento_santidade', 'cristologia_soberania'],
  daniel: ['cristologia_soberania', 'missao_firmeza'],
  oseias: ['graca_justificacao', 'alianca_promessa'],
  joel: ['arrependimento_santidade', 'ressurreicao_esperanca'],
  amos: ['arrependimento_santidade', 'sabedoria_temor'],
  obadias: ['cristologia_soberania', 'missao_firmeza'],
  jonas: ['graca_justificacao', 'missao_firmeza'],
  miqueias: ['alianca_promessa', 'graca_justificacao'],
  naum: ['cristologia_soberania', 'consolo_providencia'],
  habacuque: ['consolo_providencia', 'graca_justificacao'],
  sofonias: ['criacao_louvor', 'ressurreicao_esperanca'],
  ageu: ['missao_firmeza', 'cristologia_soberania'],
  zacarias: ['cruz_redencao', 'ressurreicao_esperanca'],
  malaquias: ['arrependimento_santidade', 'alianca_promessa'],
  mateus: ['cristologia_soberania', 'sabedoria_temor'],
  marcos: ['cruz_redencao', 'cristologia_soberania'],
  lucas: ['graca_justificacao', 'oracao_presenca'],
  joao: ['cristologia_soberania', 'oracao_presenca'],
  atos: ['missao_firmeza', 'igreja_amor'],
  romanos: ['graca_justificacao', 'cruz_redencao'],
  '1corintios': ['igreja_amor', 'ressurreicao_esperanca'],
  '2corintios': ['consolo_providencia', 'graca_justificacao'],
  galatas: ['graca_justificacao', 'igreja_amor'],
  efesios: ['graca_justificacao', 'igreja_amor'],
  filipenses: ['cristologia_soberania', 'consolo_providencia'],
  colossenses: ['cristologia_soberania', 'igreja_amor'],
  '1tessalonicenses': ['ressurreicao_esperanca', 'missao_firmeza'],
  '2tessalonicenses': ['ressurreicao_esperanca', 'missao_firmeza'],
  '1timoteo': ['igreja_amor', 'sabedoria_temor'],
  '2timoteo': ['missao_firmeza', 'sabedoria_temor'],
  tito: ['graca_justificacao', 'sabedoria_temor'],
  filemom: ['igreja_amor', 'graca_justificacao'],
  hebreus: ['cruz_redencao', 'alianca_promessa'],
  tiago: ['sabedoria_temor', 'arrependimento_santidade'],
  '1pedro': ['ressurreicao_esperanca', 'consolo_providencia'],
  '2pedro': ['ressurreicao_esperanca', 'sabedoria_temor'],
  '1joao': ['igreja_amor', 'arrependimento_santidade'],
  '2joao': ['igreja_amor', 'sabedoria_temor'],
  '3joao': ['igreja_amor', 'missao_firmeza'],
  judas: ['missao_firmeza', 'cristologia_soberania'],
  apocalipse: ['ressurreicao_esperanca', 'cristologia_soberania']
};

// Weighted multi-term doctrinal stems per axis
const AXIS_LEXICON = {
  criacao_louvor: [
    ['aleluia', 8], ['louvai', 7], ['louvem', 6], ['louvarei', 6], ['cantico novo', 9],
    ['criou os ceus', 9], ['firmamento', 6], ['acoes de gracas', 7], ['harpa', 5],
    ['trombetas', 5], ['bendize', 5], ['bendito seja', 5], ['exaltado seja', 5],
    ['toda a terra', 4], ['obras das tuas maos', 7], ['gloria de deus', 4], ['adorai', 6]
  ],
  cruz_redencao: [
    ['cordeiro', 7], ['sangue', 5], ['cruz', 8], ['crucific', 9], ['expiac', 9],
    ['sacrific', 5], ['pascoa', 8], ['calice', 6], ['ceia do senhor', 10], ['redencao', 8],
    ['resgate', 7], ['traspassad', 9], ['ofertas pelo pecado', 8], ['propiciacao', 10],
    ['preco de sangue', 7], ['morreu por nos', 9]
  ],
  graca_justificacao: [
    ['justificad', 9], ['pela fe', 7], ['maravilhosa graca', 9], ['graca de deus', 6],
    ['perdoou', 6], ['nova criacao', 10], ['nascido de novo', 9], ['reconcili', 7],
    ['misericordia', 4], ['nao ha condenacao', 10], ['dom gratuito', 9], ['herdeiros', 6],
    ['filho prodigo', 9], ['perdido e foi achado', 9], ['salvos pela graca', 10]
  ],
  ressurreicao_esperanca: [
    ['ressuscit', 8], ['ressurreicao', 9], ['tumulo vazio', 9], ['vida eterna', 7],
    ['novos ceus', 10], ['nova terra', 10], ['ultima trombeta', 10], ['volta de cristo', 9],
    ['vinda do senhor', 8], ['enxugara', 8], ['primicias', 7], ['glorificad', 6],
    ['imortalidade', 8], ['triunfo sobre a morte', 9], ['nao havera mais morte', 10]
  ],
  cristologia_soberania: [
    ['reino de deus', 5], ['rei dos reis', 8], ['senhor dos exercitos', 6], ['todo-poderoso', 6],
    ['santo, santo', 9], ['trono', 5], ['eu sou', 6], ['criou todas as coisas', 8],
    ['imagem do deus invisivel', 10], ['alfa e o omega', 10], ['verbo', 7],
    ['exaltou soberanamente', 9], ['todo joelho', 9], ['majestade', 5], ['onipotente', 7]
  ],
  igreja_amor: [
    ['amem uns aos outros', 9], ['corpo de cristo', 9], ['dons espirituais', 9],
    ['unidade', 6], ['edific', 5], ['comunhao', 7], ['amor e paciente', 10],
    ['igreja', 4], ['hospitalidade', 7], ['membros', 5], ['fratern', 7],
    ['perdoem', 5], ['cuidem uns dos outros', 8], ['carreguem os fardos', 8]
  ],
  consolo_providencia: [
    ['meu pastor', 10], ['bom pastor', 10], ['refugio', 7], ['fortaleza', 6],
    ['socorro', 6], ['consol', 7], ['aflic', 5], ['nao temas', 7], ['nao tenham medo', 7],
    ['ansios', 8], ['descanso', 6], ['vale da sombra', 10], ['abrigo', 7],
    ['lagrimas', 5], ['tempestade', 6], ['sob as tuas asas', 9], ['cuidado', 4]
  ],
  arrependimento_santidade: [
    ['arrepend', 8], ['confess', 7], ['transgress', 6], ['iniquidade', 6],
    ['coracao puro', 10], ['purifica', 7], ['santific', 8], ['sejam santos', 9],
    ['quebrantad', 8], ['pecado', 3], ['perdoa-me', 9], ['lixo', 3], ['idolatria', 6],
    ['integridade', 5], ['vida santa', 8], ['hipocrisia', 6]
  ],
  oracao_presenca: [
    ['pai nosso', 10], ['oracao', 6], ['orei', 6], ['clam', 5], ['suplica', 6],
    ['tua presenca', 8], ['teu espirito', 6], ['habit', 5], ['sede de deus', 9],
    ['atrios', 8], ['santuario', 6], ['ouve a minha voz', 8], ['inclina o ouvido', 8],
    ['espirito santo', 6], ['consolador', 8], ['em teu nome', 5]
  ],
  alianca_promessa: [
    ['alianca', 7], ['promessa', 7], ['juramento', 6], ['abraao', 4], ['descendencia', 5],
    ['terra prometida', 8], ['pela fe abraao', 9], ['nuvem de testemunhas', 9],
    ['mediador', 8], ['heranca', 5], ['fidelidade', 6], ['deserto', 4], ['peregrin', 7]
  ],
  sabedoria_temor: [
    ['sabedoria', 8], ['sabio', 6], ['insensat', 7], ['tolo', 6], ['temor do senhor', 10],
    ['discernimento', 8], ['prudente', 7], ['entendimento', 5], ['instrucao', 6],
    ['conselho', 6], ['vaidade', 7], ['debaixo do sol', 9], ['disciplina', 5], ['justo', 3]
  ],
  missao_firmeza: [
    ['coragem', 8], ['forte e corajoso', 10], ['ide por todo', 10], ['discipulos', 5],
    ['evangelho', 5], ['testemunh', 6], ['armadura', 9], ['combate', 6],
    ['permanecam firmes', 9], ['envio', 6], ['porta aberta', 8], ['vigiem', 7],
    ['persever', 7], ['proclam', 6], ['nacoes', 4]
  ]
};

// Landmark canonical overrides for iconic chapters (always exact, never guesswork!)
const LANDMARK_CHAPTERS = {
  'genesis:1': { a: ['criacao_louvor', 'cristologia_soberania', 'alianca_promessa'], t: 'A Criação Soberana de Deus' },
  'genesis:2': { a: ['criacao_louvor', 'oracao_presenca', 'alianca_promessa'], t: 'O Jardim do Éden e a Criação' },
  'genesis:3': { a: ['cruz_redencao', 'arrependimento_santidade', 'graca_justificacao'], t: 'A Queda e a Promessa da Redenção' },
  'genesis:12': { a: ['alianca_promessa', 'missao_firmeza', 'graca_justificacao'], t: 'O Chamado e a Aliança com Abraão' },
  'genesis:15': { a: ['alianca_promessa', 'graca_justificacao', 'cruz_redencao'], t: 'A Aliança e a Justiça pela Fé' },
  'genesis:22': { a: ['cruz_redencao', 'alianca_promessa', 'missao_firmeza'], t: 'O Sacrifício de Isaque e a Provisão' },
  'genesis:28': { a: ['alianca_promessa', 'oracao_presenca', 'consolo_providencia'], t: 'A Escada de Jacó e o Cuidado Divino' },
  'genesis:50': { a: ['consolo_providencia', 'alianca_promessa', 'graca_justificacao'], t: 'A Providência Soberana de Deus' },
  'exodo:3': { a: ['cristologia_soberania', 'missao_firmeza', 'oracao_presenca'], t: 'A Sarça Ardente e o Grande EU SOU' },
  'exodo:12': { a: ['cruz_redencao', 'alianca_promessa', 'graca_justificacao'], t: 'A Páscoa e o Sangue do Cordeiro' },
  'exodo:14': { a: ['consolo_providencia', 'cristologia_soberania', 'alianca_promessa'], t: 'A Travessia do Mar Vermelho' },
  'exodo:15': { a: ['criacao_louvor', 'cristologia_soberania', 'consolo_providencia'], t: 'O Cântico de Moisés e Miriã' },
  'exodo:20': { a: ['arrependimento_santidade', 'alianca_promessa', 'sabedoria_temor'], t: 'Os Dez Mandamentos da Aliança' },
  'exodo:33': { a: ['oracao_presenca', 'cristologia_soberania', 'graca_justificacao'], t: 'A Presença e a Glória de Deus' },
  'exodo:34': { a: ['graca_justificacao', 'alianca_promessa', 'arrependimento_santidade'], t: 'O Caráter Misericordioso do Senhor' },
  'levitico:16': { a: ['cruz_redencao', 'arrependimento_santidade', 'graca_justificacao'], t: 'O Dia da Expiação pelo Sangue' },
  'levitico:19': { a: ['arrependimento_santidade', 'igreja_amor', 'sabedoria_temor'], t: 'Chamado à Santidade e Amor ao Próximo' },
  'numeros:6': { a: ['consolo_providencia', 'oracao_presenca', 'alianca_promessa'], t: 'A Bênção Sacerdotal de Arão' },
  'deuteronomio:6': { a: ['sabedoria_temor', 'alianca_promessa', 'oracao_presenca'], t: 'O Shemá: Amar a Deus de Todo Coração' },
  'josue:1': { a: ['missao_firmeza', 'consolo_providencia', 'alianca_promessa'], t: 'Seja Forte e Corajoso na Promessa' },
  'josue:24': { a: ['alianca_promessa', 'missao_firmeza', 'arrependimento_santidade'], t: 'Eu e Minha Casa Serviremos ao Senhor' },
  '1samuel:2': { a: ['criacao_louvor', 'oracao_presenca', 'cristologia_soberania'], t: 'O Cântico de Ana ao Deus Soberano' },
  '2samuel:7': { a: ['alianca_promessa', 'cristologia_soberania', 'oracao_presenca'], t: 'A Aliança Eterna com Davi' },
  '2cronicas:7': { a: ['oracao_presenca', 'arrependimento_santidade', 'alianca_promessa'], t: 'Se o Meu Povo se Humilhar e Orar' },
  'jo:1': { a: ['consolo_providencia', 'sabedoria_temor', 'cristologia_soberania'], t: 'Fidelidade em Meio à Provação de Jó' },
  'jo:19': { a: ['ressurreicao_esperanca', 'cruz_redencao', 'consolo_providencia'], t: 'Eu Sei que o Meu Redentor Vive' },
  'jo:38': { a: ['criacao_louvor', 'cristologia_soberania', 'sabedoria_temor'], t: 'A Majestade do Criador Responde a Jó' },
  'salmos:1': { a: ['sabedoria_temor', 'oracao_presenca', 'alianca_promessa'], t: 'Os Dois Caminhos e o Prazer na Lei' },
  'salmos:2': { a: ['cristologia_soberania', 'alianca_promessa', 'ressurreicao_esperanca'], t: 'O Reino Ungido do Filho de Deus' },
  'salmos:8': { a: ['criacao_louvor', 'cristologia_soberania', 'sabedoria_temor'], t: 'A Glória de Deus na Criação' },
  'salmos:19': { a: ['criacao_louvor', 'sabedoria_temor', 'arrependimento_santidade'], t: 'Os Céus Proclamam a Glória de Deus' },
  'salmos:22': { a: ['cruz_redencao', 'consolo_providencia', 'ressurreicao_esperanca'], t: 'O Salmo da Cruz e da Libertação' },
  'salmos:23': { a: ['consolo_providencia', 'oracao_presenca', 'graca_justificacao'], t: 'O Senhor é o Meu Bom Pastor' },
  'salmos:24': { a: ['cristologia_soberania', 'arrependimento_santidade', 'criacao_louvor'], t: 'Quem Subirá ao Monte do Rei da Glória?' },
  'salmos:27': { a: ['consolo_providencia', 'oracao_presenca', 'missao_firmeza'], t: 'O Senhor é a Minha Luz e Salvação' },
  'salmos:32': { a: ['arrependimento_santidade', 'graca_justificacao', 'consolo_providencia'], t: 'A Bem-Aventurança do Perdão' },
  'salmos:34': { a: ['consolo_providencia', 'criacao_louvor', 'oracao_presenca'], t: 'Provem e Vejam como o Senhor é Bom' },
  'salmos:40': { a: ['oracao_presenca', 'consolo_providencia', 'cruz_redencao'], t: 'Esperei com Paciência no Senhor' },
  'salmos:42': { a: ['oracao_presenca', 'consolo_providencia', 'arrependimento_santidade'], t: 'Sede de Deus como a Corça' },
  'salmos:46': { a: ['consolo_providencia', 'cristologia_soberania', 'alianca_promessa'], t: 'Deus é o Nosso Refúgio e Fortaleza' },
  'salmos:51': { a: ['arrependimento_santidade', 'graca_justificacao', 'oracao_presenca'], t: 'Confissão e Oração por Coração Puro' },
  'salmos:63': { a: ['oracao_presenca', 'criacao_louvor', 'consolo_providencia'], t: 'Teu Amor Vale Mais que a Vida' },
  'salmos:84': { a: ['oracao_presenca', 'criacao_louvor', 'consolo_providencia'], t: 'Quão Amáveis São os Teus Átrios' },
  'salmos:90': { a: ['sabedoria_temor', 'cristologia_soberania', 'consolo_providencia'], t: 'Eternidade de Deus e Sabedoria' },
  'salmos:91': { a: ['consolo_providencia', 'alianca_promessa', 'oracao_presenca'], t: 'À Sombra do Todo-Poderoso' },
  'salmos:96': { a: ['criacao_louvor', 'missao_firmeza', 'cristologia_soberania'], t: 'Cantem ao Senhor um Cântico Novo' },
  'salmos:100': { a: ['criacao_louvor', 'alianca_promessa', 'consolo_providencia'], t: 'Alegria e Ações de Graças ao Criador' },
  'salmos:103': { a: ['graca_justificacao', 'criacao_louvor', 'consolo_providencia'], t: 'Bendize, Ó Minha Alma, ao Senhor' },
  'salmos:119': { a: ['sabedoria_temor', 'oracao_presenca', 'arrependimento_santidade'], t: 'Lâmpada para os Meus Pés é a Tua Palavra' },
  'salmos:121': { a: ['consolo_providencia', 'alianca_promessa', 'oracao_presenca'], t: 'O Senhor é Quem Te Guarda' },
  'salmos:126': { a: ['consolo_providencia', 'ressurreicao_esperanca', 'criacao_louvor'], t: 'Os que Semeiam com Lágrimas Colhem com Júbilo' },
  'salmos:130': { a: ['arrependimento_santidade', 'graca_justificacao', 'oracao_presenca'], t: 'Das Profundezas Clamo por Perdão' },
  'salmos:136': { a: ['criacao_louvor', 'alianca_promessa', 'consolo_providencia'], t: 'O Seu Amor Leal Dura para Sempre' },
  'salmos:139': { a: ['oracao_presenca', 'criacao_louvor', 'arrependimento_santidade'], t: 'Onisciência e Amor do Criador' },
  'salmos:145': { a: ['criacao_louvor', 'cristologia_soberania', 'graca_justificacao'], t: 'Grande é o Senhor e Digno de Louvor' },
  'salmos:148': { a: ['criacao_louvor', 'cristologia_soberania', 'ressurreicao_esperanca'], t: 'Toda a Criação Louva ao Senhor' },
  'salmos:150': { a: ['criacao_louvor', 'cristologia_soberania', 'oracao_presenca'], t: 'Tudo o Que Respira Louve ao Senhor!' },
  'proverbios:1': { a: ['sabedoria_temor', 'arrependimento_santidade', 'alianca_promessa'], t: 'O Temor do Senhor é o Princípio da Sabedoria' },
  'proverbios:3': { a: ['sabedoria_temor', 'consolo_providencia', 'alianca_promessa'], t: 'Confia no Senhor de Todo o Coração' },
  'eclesiastes:3': { a: ['sabedoria_temor', 'consolo_providencia', 'cristologia_soberania'], t: 'Há Tempo para Tudo Sob os Céus' },
  'isaias:6': { a: ['cristologia_soberania', 'arrependimento_santidade', 'missao_firmeza'], t: 'Santo, Santo, Santo e o Chamado de Isaías' },
  'isaias:9': { a: ['cristologia_soberania', 'cruz_redencao', 'ressurreicao_esperanca'], t: 'O Príncipe da Paz e a Grande Luz' },
  'isaias:40': { a: ['consolo_providencia', 'criacao_louvor', 'cristologia_soberania'], t: 'Consolai o Meu Povo • Renovo na Esperança' },
  'isaias:53': { a: ['cruz_redencao', 'graca_justificacao', 'ressurreicao_esperanca'], t: 'O Servo Sofredor Traspassado por Nós' },
  'isaias:55': { a: ['graca_justificacao', 'oracao_presenca', 'alianca_promessa'], t: 'O Convite Gratuito da Aliança' },
  'jeremias:31': { a: ['alianca_promessa', 'graca_justificacao', 'arrependimento_santidade'], t: 'A Nova Aliança Gravada no Coração' },
  'lamentacoes:3': { a: ['consolo_providencia', 'alianca_promessa', 'arrependimento_santidade'], t: 'As Misericórdias se Renovam a Cada Manhã' },
  'ezequiel:36': { a: ['graca_justificacao', 'arrependimento_santidade', 'alianca_promessa'], t: 'Um Novo Coração e Um Novo Espírito' },
  'ezequiel:37': { a: ['ressurreicao_esperanca', 'graca_justificacao', 'alianca_promessa'], t: 'O Vale de Ossos Secos e o Sopro de Vida' },
  'habacuque:3': { a: ['consolo_providencia', 'missao_firmeza', 'criacao_louvor'], t: 'Ainda que a Figueira Não Floresça' },
  'mateus:5': { a: ['sabedoria_temor', 'arrependimento_santidade', 'igreja_amor'], t: 'As Bem-Aventuranças do Reino' },
  'mateus:6': { a: ['oracao_presenca', 'consolo_providencia', 'sabedoria_temor'], t: 'O Pai Nosso e a Vitória sobre a Ansiedade' },
  'mateus:11': { a: ['consolo_providencia', 'graca_justificacao', 'oracao_presenca'], t: 'Vinde a Mim e Eu Vos Aliviarei' },
  'mateus:26': { a: ['cruz_redencao', 'oracao_presenca', 'alianca_promessa'], t: 'A Última Ceia e o Getsêmani' },
  'mateus:27': { a: ['cruz_redencao', 'graca_justificacao', 'cristologia_soberania'], t: 'A Crucificação do Rei dos Judeus' },
  'mateus:28': { a: ['ressurreicao_esperanca', 'missao_firmeza', 'cristologia_soberania'], t: 'A Ressurreição e a Grande Comissão' },
  'marcos:4': { a: ['consolo_providencia', 'cristologia_soberania', 'sabedoria_temor'], t: 'As Parábolas e Jesus Acalma a Tempestade' },
  'lucas:15': { a: ['graca_justificacao', 'consolo_providencia', 'arrependimento_santidade'], t: 'As Parábolas da Graça e do Filho Pródigo' },
  'lucas:24': { a: ['ressurreicao_esperanca', 'cruz_redencao', 'missao_firmeza'], t: 'O Caminho de Emaús e Cristo Vivo' },
  'joao:1': { a: ['cristologia_soberania', 'criacao_louvor', 'graca_justificacao'], t: 'O Verbo Eterno Habitou Entre Nós' },
  'joao:3': { a: ['graca_justificacao', 'cruz_redencao', 'arrependimento_santidade'], t: 'O Novo Nascimento e o Amor do Pai' },
  'joao:10': { a: ['consolo_providencia', 'cruz_redencao', 'cristologia_soberania'], t: 'Eu Sou o Bom Pastor' },
  'joao:13': { a: ['igreja_amor', 'cruz_redencao', 'arrependimento_santidade'], t: 'O Lava-Pés e o Novo Mandamento' },
  'joao:14': { a: ['oracao_presenca', 'consolo_providencia', 'ressurreicao_esperanca'], t: 'O Caminho, a Verdade e a Promessa do Espírito' },
  'joao:15': { a: ['oracao_presenca', 'igreja_amor', 'missao_firmeza'], t: 'A Videira Verdadeira e o Fruto do Amor' },
  'joao:17': { a: ['igreja_amor', 'oracao_presenca', 'cristologia_soberania'], t: 'A Oração Sacerdotal de Jesus pela Unidade' },
  'joao:19': { a: ['cruz_redencao', 'cristologia_soberania', 'graca_justificacao'], t: 'Está Consumado: A Cruz de Cristo' },
  'joao:20': { a: ['ressurreicao_esperanca', 'missao_firmeza', 'graca_justificacao'], t: 'A Ressurreição de Jesus e a Paz aos Discípulos' },
  'atos:2': { a: ['igreja_amor', 'oracao_presenca', 'missao_firmeza'], t: 'O Pentecostes e a Igreja Primitiva' },
  'atos:13': { a: ['missao_firmeza', 'oracao_presenca', 'graca_justificacao'], t: 'O Envio Missionário para as Nações' },
  'romanos:3': { a: ['graca_justificacao', 'cruz_redencao', 'alianca_promessa'], t: 'Justificação pela Fé Mediante a Redenção' },
  'romanos:5': { a: ['graca_justificacao', 'cruz_redencao', 'consolo_providencia'], t: 'Paz com Deus e Amor Derramado na Cruz' },
  'romanos:7': { a: ['arrependimento_santidade', 'graca_justificacao', 'cruz_redencao'], t: 'O Conflito da Carne e a Libertação em Cristo' },
  'romanos:8': { a: ['consolo_providencia', 'graca_justificacao', 'ressurreicao_esperanca'], t: 'Nenhuma Condenação e Mais que Vencedores' },
  'romanos:11': { a: ['cristologia_soberania', 'alianca_promessa', 'criacao_louvor'], t: 'Doxologia: dEle, por Ele e para Ele' },
  'romanos:12': { a: ['igreja_amor', 'arrependimento_santidade', 'sabedoria_temor'], t: 'Sacrifício Vivo e Amor Fraternal na Igreja' },
  '1corintios:1': { a: ['cruz_redencao', 'cristologia_soberania', 'igreja_amor'], t: 'A Sabedoria da Cruz e os Humildes' },
  '1corintios:3': { a: ['oracao_presenca', 'igreja_amor', 'sabedoria_temor'], t: 'O Único Fundamento e o Templo do Espírito' },
  '1corintios:11': { a: ['cruz_redencao', 'igreja_amor', 'alianca_promessa'], t: 'A Ceia da Nova Aliança' },
  '1corintios:12': { a: ['igreja_amor', 'oracao_presenca', 'missao_firmeza'], t: 'Um Só Corpo e Muitos Dons pelo Espírito' },
  '1corintios:13': { a: ['igreja_amor', 'graca_justificacao', 'ressurreicao_esperanca'], t: 'O Caminho Mais Excelente do Amor Ágape' },
  '1corintios:14': { a: ['igreja_amor', 'oracao_presenca', 'missao_firmeza'], t: 'Culto Inteligível para Edificação da Igreja' },
  '1corintios:15': { a: ['ressurreicao_esperanca', 'cruz_redencao', 'cristologia_soberania'], t: 'A Ressurreição de Cristo e a Vitória Final' },
  '1corintios:16': { a: ['missao_firmeza', 'igreja_amor', 'ressurreicao_esperanca'], t: 'Firmes na Fé, Coragem e Maranata' },
  '2corintios:1': { a: ['consolo_providencia', 'alianca_promessa', 'oracao_presenca'], t: 'O Deus de Todo Consolo e o Sim em Cristo' },
  '2corintios:3': { a: ['cristologia_soberania', 'alianca_promessa', 'graca_justificacao'], t: 'Transformados de Glória em Glória pelo Espírito' },
  '2corintios:4': { a: ['consolo_providencia', 'cristologia_soberania', 'missao_firmeza'], t: 'O Tesouro em Vasos de Barro' },
  '2corintios:5': { a: ['graca_justificacao', 'cruz_redencao', 'ressurreicao_esperanca'], t: 'Nova Criação e Ministério da Reconciliação' },
  '2corintios:12': { a: ['consolo_providencia', 'graca_justificacao', 'oracao_presenca'], t: 'A Minha Graça Te Basta na Fraqueza' },
  'galatas:2': { a: ['graca_justificacao', 'cruz_redencao', 'missao_firmeza'], t: 'Crucificado com Cristo e Vivo pela Fé' },
  'galatas:5': { a: ['arrependimento_santidade', 'igreja_amor', 'graca_justificacao'], t: 'Liberdade em Cristo e o Fruto do Espírito' },
  'efesios:1': { a: ['graca_justificacao', 'cristologia_soberania', 'cruz_redencao'], t: 'Toda Bênção Espiritual e Redenção em Cristo' },
  'efesios:2': { a: ['graca_justificacao', 'cruz_redencao', 'igreja_amor'], t: 'Salvos pela Graça Mediante a Fé' },
  'efesios:4': { a: ['igreja_amor', 'arrependimento_santidade', 'missao_firmeza'], t: 'A Unidade do Espírito e a Nova Vida' },
  'efesios:6': { a: ['missao_firmeza', 'oracao_presenca', 'consolo_providencia'], t: 'A Armadura de Deus e a Perseverança' },
  'filipenses:1': { a: ['missao_firmeza', 'graca_justificacao', 'consolo_providencia'], t: 'Quem Começou a Boa Obra Há de Completá-la' },
  'filipenses:2': { a: ['cristologia_soberania', 'cruz_redencao', 'igreja_amor'], t: 'O Esvaziamento e a Exaltação de Cristo' },
  'filipenses:4': { a: ['consolo_providencia', 'oracao_presenca', 'missao_firmeza'], t: 'A Paz de Deus que Excede Todo Entendimento' },
  'colossenses:1': { a: ['cristologia_soberania', 'cruz_redencao', 'criacao_louvor'], t: 'A Supremacia de Cristo Sobre Toda a Criação' },
  'colossenses:3': { a: ['igreja_amor', 'arrependimento_santidade', 'criacao_louvor'], t: 'A Vida Oculta em Cristo e a Comunhão' },
  '1tessalonicenses:4': { a: ['ressurreicao_esperanca', 'arrependimento_santidade', 'consolo_providencia'], t: 'Santificação e a Esperança da Vinda do Senhor' },
  '2timoteo:4': { a: ['missao_firmeza', 'ressurreicao_esperanca', 'alianca_promessa'], t: 'Combati o Bom Combate, Guardei a Fé' },
  'hebreus:4': { a: ['consolo_providencia', 'oracao_presenca', 'cruz_redencao'], t: 'O Trono da Graça para Socorro Oportuno' },
  'hebreus:8': { a: ['alianca_promessa', 'cruz_redencao', 'graca_justificacao'], t: 'O Mediador de Uma Aliança Superior' },
  'hebreus:9': { a: ['cruz_redencao', 'alianca_promessa', 'graca_justificacao'], t: 'O Sangue Eterno da Nova Aliança' },
  'hebreus:11': { a: ['alianca_promessa', 'missao_firmeza', 'ressurreicao_esperanca'], t: 'A Nuvem de Testemunhas da Fé' },
  'hebreus:12': { a: ['missao_firmeza', 'cruz_redencao', 'consolo_providencia'], t: 'Correr a Corrida Olhando para Jesus' },
  'tiago:1': { a: ['sabedoria_temor', 'consolo_providencia', 'arrependimento_santidade'], t: 'Sabedoria na Provação e Prática da Palavra' },
  '1pedro:1': { a: ['ressurreicao_esperanca', 'graca_justificacao', 'arrependimento_santidade'], t: 'Esperança Viva pela Ressurreição de Cristo' },
  '1pedro:5': { a: ['consolo_providencia', 'sabedoria_temor', 'missao_firmeza'], t: 'Lançai Toda Ansiedade Sobre Ele' },
  '1joao:1': { a: ['arrependimento_santidade', 'graca_justificacao', 'cruz_redencao'], t: 'Andar na Luz e Confissão do Pecado' },
  '1joao:4': { a: ['igreja_amor', 'graca_justificacao', 'cruz_redencao'], t: 'Deus é Amor e o Amor Lança Fora o Medo' },
  'apocalipse:4': { a: ['criacao_louvor', 'cristologia_soberania', 'oracao_presenca'], t: 'O Trono Celestial e o Cântico Santo, Santo' },
  'apocalipse:5': { a: ['cruz_redencao', 'cristologia_soberania', 'criacao_louvor'], t: 'Digno é o Cordeiro que Foi Morto' },
  'apocalipse:21': { a: ['ressurreicao_esperanca', 'consolo_providencia', 'criacao_louvor'], t: 'Novos Céus, Nova Terra e Consolação Eterna' },
  'apocalipse:22': { a: ['ressurreicao_esperanca', 'cristologia_soberania', 'oracao_presenca'], t: 'Maranata: O Alfa e o Ômega Vem Breve' }
};

// Generic superscriptions that do not express thematic content
const GENERIC_TITLE_REGEX = /^(salmo de davi|salmo dos filhos|salmo dos descendentes|ao regente|cantico de peregr|masquil|mictam|sigaiom|saudacoes|introducao|prologo|conclusao|bencao final|instrucoes finais|interludio|para o diretor)/i;

function cleanSectionTheme(titles = [], fallbackAxis) {
  const candidates = titles
    .map(t => (t || '').trim())
    .filter(t => t.length >= 4 && !GENERIC_TITLE_REGEX.test(norm(t)));

  if (candidates.length === 0) {
    return AXIS_DEFAULT_THEME[fallbackAxis] || 'Meditação nas Escrituras';
  }
  let chosen = candidates[0];
  if (candidates.length >= 2 && (chosen.length + candidates[1].length) <= 38) {
    chosen = `${chosen} • ${candidates[1]}`;
  }
  if (chosen.length > 42) {
    chosen = chosen.slice(0, 41).replace(/\s+\S*$/, '').trim();
  }
  return chosen.replace(/[.:;]+$/, '');
}

const files = fs.readdirSync(bibliaDir).filter(f => f.endsWith('.json')).sort();
const index = {};
let chapterCount = 0;

for (const file of files) {
  const bookId = path.basename(file, '.json');
  const data = JSON.parse(fs.readFileSync(path.join(bibliaDir, file), 'utf8'));
  const chKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));

  for (const chKey of chKeys) {
    const chObj = data[chKey];
    const key = `${bookId}:${chKey}`;
    chapterCount++;

    const bookDisplay = chObj.book || bookId;
    const sections = Array.isArray(chObj.sections) ? chObj.sections : [];
    const sectionTitles = sections.map(s => s.title || '').filter(Boolean);
    const verses = sections.flatMap(s => s.verses || []);
    const verseCount = Math.max(1, verses.length);

    if (LANDMARK_CHAPTERS[key]) {
      const lm = LANDMARK_CHAPTERS[key];
      const qWords = AXIS_QUERY_WORDS[lm.a[0]] || 'louvor cristao';
      index[key] = {
        a: lm.a,
        t: lm.t,
        q: `louvor ${bookDisplay} ${chKey} ${qWords}`
      };
      continue;
    }

    const scores = {};
    for (const ax of Object.keys(AXIS_LEXICON)) scores[ax] = 0;

    // 1. Score descriptive section titles strongly (x16 weight)
    const normTitles = norm(
      sectionTitles.filter(t => !GENERIC_TITLE_REGEX.test(norm(t))).join(' ')
    );
    // 2. Score chapter verses normalized by verse count (density)
    const normText = norm(verses.map(v => v.text || '').join(' '));

    for (const [axis, stems] of Object.entries(AXIS_LEXICON)) {
      let titleScore = 0;
      let textScore = 0;
      for (const [stem, weight] of stems) {
        if (normTitles.includes(stem)) {
          titleScore += weight * 16;
        }
        // Count occurrences (capped at 5 per stem to avoid single-word skew)
        let idx = -1;
        let hits = 0;
        while ((idx = normText.indexOf(stem, idx + 1)) !== -1 && hits < 5) {
          hits++;
        }
        if (hits > 0) {
          textScore += hits * weight * (18 / Math.sqrt(verseCount));
        }
      }
      scores[axis] += titleScore + textScore;
    }

    // 3. Soft book tie-breaker (+8 / +4) so chapter signals always dominate
    const base = BOOK_BASELINES[bookId] || ['cristologia_soberania', 'graca_justificacao'];
    scores[base[0]] = (scores[base[0]] || 0) + 8;
    if (base[1]) scores[base[1]] = (scores[base[1]] || 0) + 4;

    const top3 = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([axis]) => axis);

    const theme = cleanSectionTheme(sectionTitles, top3[0]);
    const qWords = AXIS_QUERY_WORDS[top3[0]] || 'louvor cristao';

    index[key] = {
      a: top3,
      t: theme,
      q: `louvor ${bookDisplay} ${chKey} ${qWords}`
    };
  }
}

fs.writeFileSync(outFile, JSON.stringify(index), 'utf8');
const stat = fs.statSync(outFile);
console.log(`Generated ${outFile}: ${chapterCount} chapters indexed (${(stat.size / 1024).toFixed(1)} KB)`);

// Spot check key chapters to verify differentiation
const checks = [
  'salmos:1', 'salmos:23', 'salmos:51', 'salmos:91', 'salmos:150',
  'genesis:1', 'genesis:3', 'genesis:22', 'romanos:3', 'romanos:8', 'romanos:12',
  '1corintios:11', '1corintios:13', '1corintios:15', 'proverbios:1', 'proverbios:31'
];
for (const k of checks) {
  console.log(`  ${k.padEnd(16)} => [${index[k].a.join(', ')}] | ${index[k].t}`);
}
