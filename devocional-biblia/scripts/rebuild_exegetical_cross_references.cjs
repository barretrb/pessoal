/**
 * Motor Exegético de Reconstrução, Curadoria e Classificação Hermenêutica de Referências Cruzadas
 * Corrige:
 * 1. [BLOCKER 1] Cruzamentos puramente lexicais (concordância de palavras isoladas da KJV/TSK sem vínculo teológico).
 * 2. [BLOCKER 2] Truncamento destrutivo de intervalos (12.446 referências que exibiam apenas o 1º versículo da perícope ou cortavam em 220 chars).
 * 3. [BLOCKER 3] Inflação artificial em versículos puramente narrativos/transitórios.
 * 4. [ALTA FRICÇÃO 4] Referências circulares ou adjacentes dentro do mesmo capítulo.
 * 5. [ALTA FRICÇÃO 6] Classificação explícita da Ponte Hermenêutica (category) em cada referência.
 */

const fs = require('fs');
const path = require('path');

const bibleDir = path.resolve(__dirname, '../public/biblia');
const lucasSrcPath = path.resolve(__dirname, '../src/data/lucas_nvt.json');

// Mapeamento de nomes de livros em português para IDs dos arquivos JSON
const BOOK_NAME_TO_ID = {
  'Gênesis': 'genesis',
  'Êxodo': 'exodo',
  'Levítico': 'levitico',
  'Números': 'numeros',
  'Deuteronômio': 'deuteronomio',
  'Josué': 'josue',
  'Juízes': 'juizes',
  'Rute': 'rute',
  '1 Samuel': '1samuel',
  '2 Samuel': '2samuel',
  '1 Reis': '1reis',
  '2 Reis': '2reis',
  '1 Crônicas': '1cronicas',
  '2 Crônicas': '2cronicas',
  'Esdras': 'esdras',
  'Neemias': 'neemias',
  'Ester': 'ester',
  'Jó': 'jo',
  'Salmos': 'salmos',
  'Salmo': 'salmos',
  'Provérbios': 'proverbios',
  'Eclesiastes': 'eclesiastes',
  'Cânticos': 'canticos',
  'Cântico dos Cânticos': 'canticos',
  'Cantares': 'canticos',
  'Isaías': 'isaias',
  'Jeremias': 'jeremias',
  'Lamentações': 'lamentacoes',
  'Ezequiel': 'ezequiel',
  'Daniel': 'daniel',
  'Oséias': 'oseias',
  'Oseias': 'oseias',
  'Joel': 'joel',
  'Amós': 'amos',
  'Obadias': 'obadias',
  'Jonas': 'jonas',
  'Miqueias': 'miqueias',
  'Naum': 'naum',
  'Habacuque': 'habacuque',
  'Sofonias': 'sofonias',
  'Ageu': 'ageu',
  'Zacarias': 'zacarias',
  'Malaquias': 'malaquias',
  'Mateus': 'mateus',
  'Marcos': 'marcos',
  'Lucas': 'lucas',
  'João': 'joao',
  'Atos': 'atos',
  'Atos dos Apóstolos': 'atos',
  'Romanos': 'romanos',
  '1 Coríntios': '1corintios',
  '2 Coríntios': '2corintios',
  'Gálatas': 'galatas',
  'Efésios': 'efesios',
  'Filipenses': 'filipenses',
  'Colossenses': 'colossenses',
  '1 Tessalonicenses': '1tessalonicenses',
  '2 Tessalonicenses': '2tessalonicenses',
  '1 Timóteo': '1timoteo',
  '2 Timóteo': '2timoteo',
  'Tito': 'tito',
  'Filemom': 'filemom',
  'Hebreus': 'hebreus',
  'Tiago': 'tiago',
  '1 Pedro': '1pedro',
  '2 Pedro': '2pedro',
  '1 João': '1joao',
  '2 João': '2joao',
  '3 João': '3joao',
  'Judas': 'judas',
  'Apocalipse': 'apocalipse'
};

const ID_TO_CANONICAL_NAME = {};
for (const [name, id] of Object.entries(BOOK_NAME_TO_ID)) {
  if (!ID_TO_CANONICAL_NAME[id]) ID_TO_CANONICAL_NAME[id] = name;
}

const OT_BOOKS = new Set([
  'genesis','exodo','levitico','numeros','deuteronomio','josue','juizes','rute',
  '1samuel','2samuel','1reis','2reis','1cronicas','2cronicas','esdras','neemias','ester',
  'jo','salmos','proverbios','eclesiastes','canticos','isaias','jeremias','lamentacoes',
  'ezequiel','daniel','oseias','joel','amos','obadias','jonas','miqueias','naum',
  'habacuque','sofonias','ageu','zacarias','malaquias'
]);

const GOSPELS = new Set(['mateus', 'marcos', 'lucas', 'joao']);
const PAULINE = new Set([
  'romanos','1corintios','2corintios','galatas','efesios','filipenses','colossenses',
  '1tessalonicenses','2tessalonicenses','1timoteo','2timoteo','tito','filemom'
]);
const HISTORICAL_PARALLELS = [
  new Set(['1samuel', '2samuel', '1reis', '2reis', '1cronicas', '2cronicas']),
  new Set(['exodo', 'levitico', 'numeros', 'deuteronomio']),
  new Set(['esdras', 'neemias', 'ageu', 'zacarias']),
  new Set(['isaias', '2reis', '2cronicas'])
];

// Taxonomia de Clusters Teológicos e Exegéticos (evita falso-positivo por palavra solta)
const THEOLOGICAL_CLUSTERS = [
  { id: 'logos_criacao', terms: ['principio', 'palavra', 'verbo', 'criou', 'criadas', 'criador', 'mundo', 'ceus', 'terra', 'haja', 'luz', 'escuridao', 'trevas', 'existia', 'subsiste', 'harmonia', 'invisivel'] },
  { id: 'encarnacao_messias', terms: ['virgem', 'gravida', 'filho', 'menino', 'emanuel', 'belem', 'davi', 'trono', 'carne', 'habitou', 'gloria', 'unigenito', 'humilhou', 'servo', 'ungido', 'messias'] },
  { id: 'expiacao_cruz', terms: ['cruz', 'crucificado', 'sangue', 'morreu', 'morte', 'pecados', 'transgressoes', 'iniquidades', 'rebeldia', 'cordeiro', 'sacrificio', 'resgate', 'ferido', 'feridas', 'esmagado', 'curados', 'culpa', 'perdao', 'perdoou'] },
  { id: 'ressurreicao_vida', terms: ['ressuscitou', 'ressurreicao', 'ressuscitado', 'mortos', 'terceiro dia', 'sepultado', 'tumulo', 'vivera', 'vive', 'primicias', 'primeiro fruto', 'colheita', 'imortalidade', 'aguilhao', 'vitoria', 'apodreca'] },
  { id: 'adanico_tipologia', terms: ['adao', 'um so homem', 'unico homem', 'entrou no mundo', 'todos morrem', 'todos pecaram', 'ultimo adao', 'espirito que da vida', 'po da terra', 'ser vivente', 'ser vivo', 'imagem'] },
  { id: 'justificacao_graca_fe', terms: ['justificado', 'justica', 'justo', 'pela fe', 'graca', 'salvo', 'salvacao', 'obras', 'lei', 'dadiva', 'dom de deus', 'condenacao', 'livre', 'liberdade', 'escravo'] },
  { id: 'espirito_santo', terms: ['espirito santo', 'encorajador', 'consolador', 'espirito da verdade', 'batizados', 'batizara', 'derramarei', 'poder do ceu', 'revestidos', 'ungiu', 'habita', 'santuario', 'templo'] },
  { id: 'dons_culto_profecia', terms: ['dons', 'dom', 'profetizar', 'profecia', 'profetas', 'linguas', 'interpretar', 'edificar', 'fortalecer', 'revelacao', 'igreja', 'reuniao', 'avaliem', 'ponham a prova', 'calar', 'ordem', 'paz', 'membros', 'corpo'] },
  { id: 'amor_agape', terms: ['amor', 'amar', 'amem', 'amou', 'paciente', 'bondoso', 'ciumento', 'orgulhoso', 'rancoroso', 'perdoa', 'compaixao', 'proximo', 'irmaos', 'permanece', 'maior'] },
  { id: 'unidade_harmonia', terms: ['harmonia', 'divisoes', 'unidos', 'mesmo parecer', 'um so corpo', 'um so espirito', 'um so senhor', 'um so batismo', 'comunhao', 'desentendimentos', 'humildes'] },
  { id: 'ceia_nova_alianca', terms: ['pao', 'calice', 'meu corpo', 'meu sangue', 'nova alianca', 'memoria de mim', 'partiu', 'anunciam a morte', 'examinar', 'indignamente', 'pascoa'] },
  { id: 'escatologia_reino', terms: ['volta', 'vinda', 'nuvens', 'trombeta', 'arcanjo', 'transformados', 'piscar de olhos', 'reino de deus', 'inimigos', 'debaixo de seus pes', 'direita', 'eternidade', 'julgamento', 'tribunal'] },
  { id: 'escritura_revelacao', terms: ['escrituras', 'palavra de deus', 'inspirada', 'lei do senhor', 'mandamentos', 'preceitos', 'verdade', 'ensino', 'sabedoria', 'lampada', 'medita'] },
  { id: 'oracao_confianca_pastor', terms: ['orar', 'oracao', 'suplica', 'clamar', 'pastor', 'ovelhas', 'nada terei falta', 'refugio', 'fortaleza', 'nao temas', 'ansiosos', 'paz de deus', 'guardar'] },
  { id: 'santidade_pureza', terms: ['santo', 'santos', 'santificou', 'santidade', 'imoralidade', 'impureza', 'comprados', 'preco', 'glorifiquem', 'corpo', 'consciencia', 'arrependimento', 'arrepender'] },
  { id: 'apostolado_missao', terms: ['apostolo', 'apostolos', 'chamado', 'enviado', 'testemunhas', 'boas-novas', 'evangelho', 'pregar', 'pregacao', 'confins da terra', 'nacoes', 'gentios', 'perseguido', 'sofrimento'] },
  { id: 'soberania_alianca', terms: ['soberano', 'todo-poderoso', 'escolheu', 'predestinou', 'fiel', 'alianca', 'promessa', 'juramento', 'abraao', 'isaque', 'jaco', 'israel', 'heranca', 'descendencia'] },
  { id: 'generosidade_mordomia', terms: ['oferta', 'coleta', 'contribuir', 'generosos', 'generosidade', 'pobres', 'semeia', 'colhera', 'alegria', 'suprira', 'riquezas'] }
];

const STOPWORDS = new Set([
  'para', 'como', 'mais', 'seus', 'suas', 'isso', 'este', 'esta', 'esse', 'essa',
  'pelo', 'pela', 'pelos', 'pelas', 'dele', 'dela', 'deles', 'delas', 'quem', 'quando',
  'onde', 'porque', 'pois', 'entao', 'assim', 'tambem', 'ainda', 'mesmo', 'tudo', 'todos',
  'todas', 'outro', 'outra', 'outros', 'outras', 'muito', 'muita', 'muitos', 'muitas',
  'entre', 'sobre', 'depois', 'antes', 'agora', 'disse', 'dizer', 'dizem', 'falar',
  'falou', 'foram', 'estava', 'estavam', 'serao', 'seja', 'sejam', 'fazer', 'feito',
  'voces', 'nosso', 'nossa', 'nossos', 'nossas', 'aquele', 'aquela', 'aqueles', 'aquilo',
  'qualquer', 'algum', 'alguma', 'alguns', 'nada', 'ninguem', 'cada', 'meio', 'modo',
  'parte', 'tempo', 'coisa', 'coisas', 'homem', 'homens', 'povo', 'terra', 'vida',
  'senhor', 'deus' // Muito frequentes em toda a Bíblia; exigimos termos específicos além deles
]);

function normalizeText(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function extractTokens(str) {
  const norm = normalizeText(str);
  return norm
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOPWORDS.has(w));
}

function getWordStems(tokens) {
  return new Set(tokens.map(t => t.slice(0, Math.min(t.length, 6))));
}

function getActiveClusters(str) {
  const norm = normalizeText(str);
  const active = new Set();
  for (const cluster of THEOLOGICAL_CLUSTERS) {
    let hits = 0;
    for (const term of cluster.terms) {
      if (norm.includes(term)) {
        hits++;
      }
    }
    if (hits >= 1) {
      active.add(cluster.id);
    }
  }
  return active;
}

function hasExplicitCitationCue(str) {
  const norm = normalizeText(str);
  return /escrituras|esta escrito|profeta|moises|lei diz|salmo|cumpriu|cumprisse|disse o senhor|diz o senhor/.test(norm);
}

// Referências Canônicas Curadas de Alta Precisão Exegética (sobrepõem qualquer ruído do TSK)
// As passagens aqui listadas terão seus textos extraídos integralmente da Bíblia NVT local.
const CURATED_EXEGETICAL_REFS = {
  // === JOÃO 1 ===
  'joao:1:1': [
    { ref: 'Gênesis 1:1', category: 'Tipologia & Aliança' },
    { ref: 'Colossenses 1:16–17', category: 'Harmonia Doutrinária' },
    { ref: '1 João 1:1–2', category: 'Passagem Paralela' },
    { ref: 'Apocalipse 19:13', category: 'Harmonia Doutrinária' }
  ],
  'joao:1:2': [
    { ref: 'João 17:5', category: 'Harmonia Doutrinária' },
    { ref: 'Provérbios 8:22–23', category: 'Tipologia & Aliança' },
    { ref: '1 João 1:2', category: 'Passagem Paralela' }
  ],
  'joao:1:3': [
    { ref: 'Colossenses 1:16', category: 'Harmonia Doutrinária' },
    { ref: 'Hebreus 1:2–3', category: 'Harmonia Doutrinária' },
    { ref: 'Salmos 33:6', category: 'Citação & Cumprimento' }
  ],
  'joao:1:14': [
    { ref: 'Isaías 7:14', category: 'Citação & Cumprimento' },
    { ref: 'Filipenses 2:6–8', category: 'Harmonia Doutrinária' },
    { ref: 'Êxodo 40:34', category: 'Tipologia & Aliança' },
    { ref: '1 Timóteo 3:16', category: 'Harmonia Doutrinária' }
  ],
  'joao:1:29': [
    { ref: 'Isaías 53:7', category: 'Citação & Cumprimento' },
    { ref: 'Êxodo 12:21–23', category: 'Tipologia & Aliança' },
    { ref: '1 Pedro 1:18–19', category: 'Harmonia Doutrinária' },
    { ref: 'Apocalipse 5:6', category: 'Harmonia Doutrinária' }
  ],

  // === 1 CORÍNTIOS 1 ===
  '1corintios:1:1': [
    { ref: 'Atos 18:1, 17', singleRef: 'Atos 18:17', category: 'Passagem Paralela' },
    { ref: 'Romanos 1:1', category: 'Passagem Paralela' },
    { ref: '2 Coríntios 1:1', category: 'Passagem Paralela' }
  ],
  '1corintios:1:2': [
    { ref: 'Efésios 1:1', category: 'Passagem Paralela' },
    { ref: 'Romanos 10:12–13', category: 'Harmonia Doutrinária' },
    { ref: '1 Pedro 1:15–16', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:1:4': [
    { ref: 'Romanos 1:8', category: 'Passagem Paralela' },
    { ref: 'Filipenses 1:3–5', category: 'Passagem Paralela' },
    { ref: 'Efésios 1:3', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:1:9': [
    { ref: 'Deuteronômio 7:9', category: 'Citação & Cumprimento' },
    { ref: '1 João 1:3', category: 'Harmonia Doutrinária' },
    { ref: '1 Tessalonicenses 5:24', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:1:10': [
    { ref: 'Filipenses 2:2', category: 'Passagem Paralela' },
    { ref: 'Efésios 4:3–6', category: 'Harmonia Doutrinária' },
    { ref: 'Romanos 12:16', category: 'Passagem Paralela' }
  ],
  '1corintios:1:11': [
    { ref: '1 Coríntios 11:18', category: 'Passagem Paralela' },
    { ref: 'Tiago 3:16', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:1:12': [
    { ref: '1 Coríntios 3:4–6', category: 'Passagem Paralela' },
    { ref: 'Atos 18:24–28', category: 'Passagem Paralela' }
  ],
  '1corintios:1:18': [
    { ref: 'Romanos 1:16', category: 'Harmonia Doutrinária' },
    { ref: '2 Coríntios 2:15–16', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:1:19': [
    { ref: 'Isaías 29:14', category: 'Citação & Cumprimento' }
  ],
  '1corintios:1:31': [
    { ref: 'Jeremias 9:23–24', category: 'Citação & Cumprimento' },
    { ref: '2 Coríntios 10:17', category: 'Passagem Paralela' }
  ],

  // === 1 CORÍNTIOS 11, 12, 13 ===
  '1corintios:11:23': [
    { ref: 'Lucas 22:19', category: 'Passagem Paralela' },
    { ref: 'Mateus 26:26', category: 'Passagem Paralela' }
  ],
  '1corintios:11:25': [
    { ref: 'Lucas 22:20', category: 'Passagem Paralela' },
    { ref: 'Jeremias 31:31–33', category: 'Citação & Cumprimento' },
    { ref: 'Êxodo 24:8', category: 'Tipologia & Aliança' }
  ],
  '1corintios:12:12': [
    { ref: 'Romanos 12:4–5', category: 'Passagem Paralela' },
    { ref: 'Efésios 4:4, 15–16', singleRef: 'Efésios 4:15–16', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:12:13': [
    { ref: 'Gálatas 3:28', category: 'Passagem Paralela' },
    { ref: 'Efésios 4:4–5', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:1': [
    { ref: '1 Timóteo 1:5', category: 'Harmonia Doutrinária' },
    { ref: '1 João 4:7–8', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:2': [
    { ref: 'Mateus 17:20', category: 'Passagem Paralela' },
    { ref: 'Mateus 7:22–23', category: 'Harmonia Doutrinária' },
    { ref: '1 Coríntios 8:1', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:3': [
    { ref: 'Mateus 6:1–2', category: 'Harmonia Doutrinária' },
    { ref: '1 João 3:16–18', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:4': [
    { ref: 'Gálatas 5:22–23', category: 'Harmonia Doutrinária' },
    { ref: 'Efésios 4:2, 32', singleRef: 'Efésios 4:32', category: 'Harmonia Doutrinária' },
    { ref: 'Colossenses 3:12–14', category: 'Passagem Paralela' }
  ],
  '1corintios:13:5': [
    { ref: 'Filipenses 2:3–4', category: 'Harmonia Doutrinária' },
    { ref: '1 Coríntios 10:24', category: 'Passagem Paralela' },
    { ref: '2 Coríntios 5:19', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:6': [
    { ref: 'Romanos 12:9', category: 'Passagem Paralela' },
    { ref: 'Efésios 4:15, 25', singleRef: 'Efésios 4:15', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:7': [
    { ref: '1 Pedro 4:8', category: 'Harmonia Doutrinária' },
    { ref: 'Provérbios 10:12', category: 'Citação & Cumprimento' },
    { ref: 'Gálatas 6:2', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:12': [
    { ref: '1 João 3:2', category: 'Harmonia Doutrinária' },
    { ref: 'Números 12:8', category: 'Tipologia & Aliança' },
    { ref: '2 Coríntios 5:7', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:13:13': [
    { ref: '1 Tessalonicenses 1:3', category: 'Passagem Paralela' },
    { ref: 'Colossenses 1:4–5', category: 'Passagem Paralela' },
    { ref: 'Colossenses 3:14', category: 'Harmonia Doutrinária' }
  ],

  // === 1 CORÍNTIOS 14 ===
  '1corintios:14:1': [
    { ref: '1 Coríntios 12:31', category: 'Passagem Paralela' },
    { ref: '1 Tessalonicenses 5:19–20', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:2': [
    { ref: 'Atos 2:4, 11', singleRef: 'Atos 2:4', category: 'Passagem Paralela' },
    { ref: 'Atos 10:46', category: 'Passagem Paralela' }
  ],
  '1corintios:14:3': [
    { ref: 'Atos 15:32', category: 'Passagem Paralela' },
    { ref: '1 Tessalonicenses 5:11', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:4': [
    { ref: 'Efésios 4:11–12', category: 'Harmonia Doutrinária' },
    { ref: '1 Coríntios 12:7', category: 'Passagem Paralela' }
  ],
  '1corintios:14:5': [
    { ref: 'Números 11:29', category: 'Tipologia & Aliança' },
    { ref: 'Efésios 4:12', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:6': [
    { ref: '1 Coríntios 12:8–10', category: 'Passagem Paralela' },
    { ref: 'Efésios 1:17', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:12': [
    { ref: 'Efésios 4:12, 16', singleRef: 'Efésios 4:16', category: 'Harmonia Doutrinária' },
    { ref: '1 Pedro 4:10–11', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:15': [
    { ref: 'Efésios 5:19', category: 'Passagem Paralela' },
    { ref: 'Colossenses 3:16', category: 'Passagem Paralela' },
    { ref: 'Salmos 47:7', category: 'Citação & Cumprimento' }
  ],
  '1corintios:14:20': [
    { ref: 'Mateus 10:16', category: 'Passagem Paralela' },
    { ref: 'Romanos 16:19', category: 'Passagem Paralela' },
    { ref: 'Efésios 4:14', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:21': [
    { ref: 'Isaías 28:11–12', category: 'Citação & Cumprimento' },
    { ref: 'Deuteronômio 28:49', category: 'Citação & Cumprimento' }
  ],
  '1corintios:14:25': [
    { ref: 'Isaías 45:14', category: 'Citação & Cumprimento' },
    { ref: 'Zacarias 8:23', category: 'Citação & Cumprimento' },
    { ref: 'João 4:19, 29', singleRef: 'João 4:29', category: 'Passagem Paralela' }
  ],
  '1corintios:14:26': [
    { ref: 'Colossenses 3:16', category: 'Passagem Paralela' },
    { ref: 'Efésios 4:29', category: 'Harmonia Doutrinária' },
    { ref: '2 Coríntios 12:19', category: 'Passagem Paralela' }
  ],
  '1corintios:14:29': [
    { ref: '1 Tessalonicenses 5:19–21', category: 'Harmonia Doutrinária' },
    { ref: '1 João 4:1', category: 'Harmonia Doutrinária' },
    { ref: '1 Coríntios 12:10', category: 'Passagem Paralela' }
  ],
  '1corintios:14:30': [
    { ref: '1 Tessalonicenses 5:19–20', category: 'Harmonia Doutrinária' },
    { ref: '1 Pedro 4:10–11', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:14:31': [
    { ref: 'Romanos 15:4', category: 'Harmonia Doutrinária' },
    { ref: '1 Tessalonicenses 5:11', category: 'Passagem Paralela' }
  ],
  '1corintios:14:33': [
    { ref: 'Romanos 15:33', category: 'Harmonia Doutrinária' },
    { ref: 'Tiago 3:16–18', category: 'Harmonia Doutrinária' },
    { ref: '1 Tessalonicenses 5:23', category: 'Passagem Paralela' }
  ],
  '1corintios:14:40': [
    { ref: 'Colossenses 2:5', category: 'Passagem Paralela' }
  ],

  // === 1 CORÍNTIOS 15 ===
  '1corintios:15:1': [
    { ref: 'Gálatas 1:11–12', category: 'Passagem Paralela' },
    { ref: 'Romanos 5:2', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:2': [
    { ref: 'Colossenses 1:23', category: 'Passagem Paralela' },
    { ref: 'Hebreus 3:14', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:3': [
    { ref: 'Isaías 53:5–6', category: 'Citação & Cumprimento' },
    { ref: '1 Pedro 2:24', category: 'Harmonia Doutrinária' },
    { ref: 'Romanos 4:25', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:4': [
    { ref: 'Salmos 16:10', category: 'Citação & Cumprimento' },
    { ref: 'Oséias 6:2', category: 'Citação & Cumprimento' },
    { ref: 'Mateus 12:40', category: 'Passagem Paralela' },
    { ref: 'Atos 2:25–27, 31', singleRef: 'Atos 2:31', category: 'Citação & Cumprimento' }
  ],
  '1corintios:15:5': [
    { ref: 'Lucas 24:34', category: 'Passagem Paralela' },
    { ref: 'Lucas 24:36', category: 'Passagem Paralela' },
    { ref: 'João 20:19', category: 'Passagem Paralela' }
  ],
  '1corintios:15:6': [
    { ref: 'Mateus 28:10, 16–17', singleRef: 'Mateus 28:16–17', category: 'Passagem Paralela' },
    { ref: '1 Tessalonicenses 4:13–14', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:7': [
    { ref: 'Atos 1:3–4', category: 'Passagem Paralela' },
    { ref: 'Gálatas 1:19', category: 'Passagem Paralela' }
  ],
  '1corintios:15:8': [
    { ref: 'Atos 9:3–5', category: 'Passagem Paralela' },
    { ref: '1 Coríntios 9:1', category: 'Passagem Paralela' }
  ],
  '1corintios:15:9': [
    { ref: 'Atos 8:3', category: 'Passagem Paralela' },
    { ref: '1 Timóteo 1:13', category: 'Passagem Paralela' },
    { ref: 'Efésios 3:8', category: 'Passagem Paralela' }
  ],
  '1corintios:15:10': [
    { ref: 'Efésios 3:7–8', category: 'Passagem Paralela' },
    { ref: 'Gálatas 2:8', category: 'Harmonia Doutrinária' },
    { ref: 'Filipenses 2:13', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:12': [
    { ref: 'Atos 17:32', category: 'Passagem Paralela' },
    { ref: '2 Timóteo 2:17–18', category: 'Passagem Paralela' }
  ],
  '1corintios:15:13': [
    { ref: '1 Tessalonicenses 4:14', category: 'Harmonia Doutrinária' },
    { ref: 'Romanos 8:11', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:14': [
    { ref: 'Romanos 4:25', category: 'Harmonia Doutrinária' },
    { ref: '1 Pedro 1:3', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:17': [
    { ref: 'Romanos 4:25', category: 'Harmonia Doutrinária' },
    { ref: 'Romanos 5:10', category: 'Harmonia Doutrinária' },
    { ref: 'Atos 5:31', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:20': [
    { ref: 'Colossenses 1:18', category: 'Harmonia Doutrinária' },
    { ref: 'Apocalipse 1:5', category: 'Harmonia Doutrinária' },
    { ref: 'Levítico 23:10–11', category: 'Tipologia & Aliança' }
  ],
  '1corintios:15:21': [
    { ref: 'Romanos 5:12', category: 'Passagem Paralela' },
    { ref: 'Gênesis 3:19', category: 'Tipologia & Aliança' },
    { ref: 'João 11:25', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:22': [
    { ref: 'Romanos 5:18–19', category: 'Passagem Paralela' },
    { ref: 'Gênesis 2:17', category: 'Tipologia & Aliança' }
  ],
  '1corintios:15:23': [
    { ref: '1 Tessalonicenses 4:15–16', category: 'Harmonia Doutrinária' },
    { ref: 'Filipenses 3:20–21', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:24': [
    { ref: 'Daniel 7:14, 27', singleRef: 'Daniel 7:14', category: 'Citação & Cumprimento' },
    { ref: 'Efésios 1:20–22', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:25': [
    { ref: 'Salmos 110:1', category: 'Citação & Cumprimento' },
    { ref: 'Hebreus 1:13', category: 'Passagem Paralela' },
    { ref: 'Hebreus 10:12–13', category: 'Passagem Paralela' }
  ],
  '1corintios:15:26': [
    { ref: '2 Timóteo 1:10', category: 'Harmonia Doutrinária' },
    { ref: 'Apocalipse 20:14', category: 'Citação & Cumprimento' },
    { ref: 'Apocalipse 21:4', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:27': [
    { ref: 'Salmos 8:6', category: 'Citação & Cumprimento' },
    { ref: 'Hebreus 2:8', category: 'Passagem Paralela' },
    { ref: 'Efésios 1:22', category: 'Passagem Paralela' }
  ],
  '1corintios:15:28': [
    { ref: 'Filipenses 2:9–11', category: 'Harmonia Doutrinária' },
    { ref: 'Efésios 1:23', category: 'Harmonia Doutrinária' },
    { ref: '1 Coríntios 3:23', category: 'Passagem Paralela' }
  ],
  '1corintios:15:32': [
    { ref: 'Isaías 22:13', category: 'Citação & Cumprimento' },
    { ref: '2 Coríntios 1:8–9', category: 'Passagem Paralela' }
  ],
  '1corintios:15:45': [
    { ref: 'Gênesis 2:7', category: 'Citação & Cumprimento' },
    { ref: 'Romanos 5:14', category: 'Tipologia & Aliança' },
    { ref: 'João 5:21', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:47': [
    { ref: 'Gênesis 3:19', category: 'Tipologia & Aliança' },
    { ref: 'João 3:13, 31', singleRef: 'João 3:31', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:49': [
    { ref: 'Gênesis 5:3', category: 'Tipologia & Aliança' },
    { ref: 'Romanos 8:29', category: 'Harmonia Doutrinária' },
    { ref: 'Filipenses 3:21', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:51': [
    { ref: '1 Tessalonicenses 4:15–17', category: 'Passagem Paralela' },
    { ref: 'Filipenses 3:21', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:52': [
    { ref: '1 Tessalonicenses 4:16', category: 'Passagem Paralela' },
    { ref: 'Mateus 24:31', category: 'Passagem Paralela' }
  ],
  '1corintios:15:54': [
    { ref: 'Isaías 25:8', category: 'Citação & Cumprimento' },
    { ref: '2 Coríntios 5:4', category: 'Passagem Paralela' },
    { ref: 'Apocalipse 21:4', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:55': [
    { ref: 'Oséias 13:14', category: 'Citação & Cumprimento' },
    { ref: 'Hebreus 2:14–15', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:56': [
    { ref: 'Romanos 6:23', category: 'Harmonia Doutrinária' },
    { ref: 'Romanos 7:7–13', singleRef: 'Romanos 7:8', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:57': [
    { ref: 'Romanos 7:25', category: 'Passagem Paralela' },
    { ref: 'Romanos 8:37', category: 'Harmonia Doutrinária' },
    { ref: '1 João 5:4–5', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:15:58': [
    { ref: 'Gálatas 6:9', category: 'Passagem Paralela' },
    { ref: 'Colossenses 1:23', category: 'Passagem Paralela' },
    { ref: 'Hebreus 6:10', category: 'Harmonia Doutrinária' }
  ],

  // === 1 CORÍNTIOS 16 ===
  '1corintios:16:1': [
    { ref: 'Atos 11:29–30', category: 'Passagem Paralela' },
    { ref: 'Romanos 15:25–26', category: 'Passagem Paralela' },
    { ref: 'Gálatas 2:10', category: 'Passagem Paralela' }
  ],
  '1corintios:16:2': [
    { ref: 'Atos 20:7', category: 'Passagem Paralela' },
    { ref: '2 Coríntios 8:11–12', category: 'Passagem Paralela' },
    { ref: '2 Coríntios 9:7', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:16:9': [
    { ref: 'Atos 19:8–10, 23', singleRef: 'Atos 19:8–10', category: 'Passagem Paralela' },
    { ref: '2 Coríntios 2:12', category: 'Passagem Paralela' },
    { ref: 'Colossenses 4:3', category: 'Passagem Paralela' }
  ],
  '1corintios:16:13': [
    { ref: 'Efésios 6:10, 13', singleRef: 'Efésios 6:10', category: 'Harmonia Doutrinária' },
    { ref: 'Josué 1:9', category: 'Tipologia & Aliança' },
    { ref: '1 Pedro 5:8–9', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:16:14': [
    { ref: '1 Coríntios 13:1–3', category: 'Passagem Paralela' },
    { ref: '1 Pedro 4:8', category: 'Harmonia Doutrinária' },
    { ref: 'Colossenses 3:14', category: 'Harmonia Doutrinária' }
  ],
  '1corintios:16:19': [
    { ref: 'Atos 18:2, 26', singleRef: 'Atos 18:2', category: 'Passagem Paralela' },
    { ref: 'Romanos 16:3–5', category: 'Passagem Paralela' }
  ],
  '1corintios:16:22': [
    { ref: 'Efésios 6:24', category: 'Passagem Paralela' },
    { ref: 'Apocalipse 22:20', category: 'Harmonia Doutrinária' }
  ]
};

// Parseia uma string de referência em português como "Isaías 53:1–12" ou "1 João 1:5–7"
function parsePortugueseRef(refStr) {
  if (!refStr) return null;
  const clean = refStr.trim();
  const m = clean.match(/^(.+?)\s+(\d+):(\d+)(?:[–-](\d+))?$/);
  if (!m) return null;
  const bookName = m[1].trim();
  const bookId = BOOK_NAME_TO_ID[bookName];
  if (!bookId) return null;
  return {
    bookId,
    bookName: ID_TO_CANONICAL_NAME[bookId] || bookName,
    chapter: m[2],
    startVerse: parseInt(m[3], 10),
    endVerse: m[4] ? parseInt(m[4], 10) : null
  };
}

// Classifica a Ponte Hermenêutica entre origem e destino
function classifyHermeneuticBridge(sourceBookId, sourceText, targetBookId, targetText) {
  const srcIsOT = OT_BOOKS.has(sourceBookId);
  const tgtIsOT = OT_BOOKS.has(targetBookId);

  // 1. Citação do AT no NT ou Profecia do AT cumprida no NT
  if (srcIsOT !== tgtIsOT) {
    if (hasExplicitCitationCue(sourceText) || hasExplicitCitationCue(targetText)) {
      return 'Citação & Cumprimento';
    }
    const srcClusters = getActiveClusters(sourceText);
    const tgtClusters = getActiveClusters(targetText);
    if (
      (srcClusters.has('encarnacao_messias') && tgtClusters.has('encarnacao_messias')) ||
      (srcClusters.has('expiacao_cruz') && tgtClusters.has('expiacao_cruz')) ||
      (srcClusters.has('ressurreicao_vida') && tgtClusters.has('ressurreicao_vida')) ||
      (srcClusters.has('espirito_santo') && tgtClusters.has('espirito_santo'))
    ) {
      return 'Citação & Cumprimento';
    }
    return 'Tipologia & Aliança';
  }

  // 2. Paralelo Sinótico (Evangelhos entre si)
  if (GOSPELS.has(sourceBookId) && GOSPELS.has(targetBookId) && sourceBookId !== targetBookId) {
    return 'Passagem Paralela';
  }

  // 3. Paralelo Histórico (Samuel/Reis <-> Crônicas, Atos <-> Epístolas)
  if (
    (sourceBookId === 'atos' && PAULINE.has(targetBookId)) ||
    (targetBookId === 'atos' && PAULINE.has(sourceBookId))
  ) {
    return 'Passagem Paralela';
  }
  for (const group of HISTORICAL_PARALLELS) {
    if (group.has(sourceBookId) && group.has(targetBookId) && sourceBookId !== targetBookId) {
      return 'Passagem Paralela';
    }
  }

  // 4. Epístolas Gêmeas / Mesmo Autor
  if (PAULINE.has(sourceBookId) && PAULINE.has(targetBookId)) {
    return 'Harmonia Doutrinária';
  }

  return 'Harmonia Doutrinária';
}

// Calcula score de afinidade exegética entre o versículo de origem e o texto de destino
function computeExegeticalAffinity(sourceBookId, sourceCh, sourceV, sourceText, targetBookId, targetCh, targetStartV, targetText) {
  if (!sourceText || !targetText) return -100;

  // Regra 1: Proibir auto-referência e referências adjacentes no mesmo capítulo (distância <= 8)
  if (sourceBookId === targetBookId && String(sourceCh) === String(targetCh)) {
    const dist = Math.abs(Number(sourceV) - Number(targetStartV));
    if (dist <= 8) return -100;
  }

  let score = 0;

  // 1. Sobreposição de Clusters Teológicos
  const srcClusters = getActiveClusters(sourceText);
  const tgtClusters = getActiveClusters(targetText);
  let sharedClusters = 0;
  for (const c of srcClusters) {
    if (tgtClusters.has(c)) sharedClusters++;
  }
  score += sharedClusters * 18;

  // 2. Sobreposição de radicais significativos (stems >= 5 letras, sem stopwords)
  const srcTokens = extractTokens(sourceText);
  const tgtTokens = extractTokens(targetText);
  const srcStems = getWordStems(srcTokens);
  const tgtStems = getWordStems(tgtTokens);
  let sharedStems = 0;
  for (const s of srcStems) {
    if (tgtStems.has(s)) sharedStems++;
  }
  score += sharedStems * 10;

  // 3. Bônus para Citação Explícita do AT no NT
  const srcIsOT = OT_BOOKS.has(sourceBookId);
  const tgtIsOT = OT_BOOKS.has(targetBookId);
  if (srcIsOT !== tgtIsOT && hasExplicitCitationCue(sourceText)) {
    score += 16;
  }

  // 4. Bônus para Paralelos Sinóticos e Epistolares
  if (GOSPELS.has(sourceBookId) && GOSPELS.has(targetBookId) && sourceBookId !== targetBookId) {
    score += 12;
  }
  if (PAULINE.has(sourceBookId) && PAULINE.has(targetBookId)) {
    score += 8;
  }

  // 5. Penalização severa para colisão lexical isolada:
  // Se não compartilham NENHUM cluster teológico e compartilham <= 1 radical significativo,
  // ou se o versículo de destino vem de um gênero distante (ex: Jó <-> Epístola sobre ordem de culto) sem cluster em comum
  if (sharedClusters === 0 && sharedStems <= 1 && !hasExplicitCitationCue(sourceText)) {
    score -= 35;
  }

  if (PAULINE.has(sourceBookId) && targetBookId === 'jo' && !hasExplicitCitationCue(sourceText) && sharedClusters === 0) {
    score -= 40;
  }

  // Penalizar mesmo capítulo mesmo a distância > 8 para priorizar conexões inter-bíblicas
  if (sourceBookId === targetBookId && String(sourceCh) === String(targetCh)) {
    score -= 10;
  }

  return score;
}

// Resolve um intervalo (ex: Isaías 53:1–12 ou 1 Tessalonicenses 5:19–21) para o texto completo ou o núcleo exegético exato
function resolveTargetPassage(parsed, sourceText, verseMap) {
  const { bookId, bookName, chapter, startVerse, endVerse } = parsed;

  if (!endVerse || endVerse <= startVerse) {
    const txt = verseMap.get(`${bookId}:${chapter}:${startVerse}`);
    return {
      ref: `${bookName} ${chapter}:${startVerse}`,
      startVerse,
      text: txt || null
    };
  }

  const span = endVerse - startVerse + 1;

  // Se o intervalo for de 2 a 4 versículos (ex: 1Ts 5:19-21, Nm 11:28-29, Cl 1:16-17),
  // concatenar TODOS os versículos do intervalo sem descartar os versículos finais!
  if (span <= 4) {
    const parts = [];
    for (let v = startVerse; v <= endVerse; v++) {
      const t = verseMap.get(`${bookId}:${chapter}:${v}`);
      if (t) parts.push(t);
    }
    const combined = parts.join(' ');
    if (combined.length <= 580) {
      return {
        ref: `${bookName} ${chapter}:${startVerse}–${endVerse}`,
        startVerse,
        text: combined
      };
    }
  }

  // Se o intervalo for longo (ex: Isaías 53:1–12, Atos 1:2–14, Efésios 4:1–7) ou > 580 chars,
  // encontrar a janela de 1 ou 2 versículos consecutivos dentro de [startVerse..endVerse]
  // que possui a MAIOR afinidade exegética com o versículo de origem!
  const srcTokens = extractTokens(sourceText);
  const srcStems = getWordStems(srcTokens);
  const srcClusters = getActiveClusters(sourceText);

  let bestWindow = { vStart: startVerse, vEnd: Math.min(endVerse, startVerse + 1), score: -999, text: '' };

  for (let v = startVerse; v <= endVerse; v++) {
    const t1 = verseMap.get(`${bookId}:${chapter}:${v}`);
    if (!t1) continue;

    // Avaliar janela de 1 versículo e janela de 2 versículos
    const candidates = [{ vStart: v, vEnd: v, text: t1 }];
    if (v + 1 <= endVerse) {
      const t2 = verseMap.get(`${bookId}:${chapter}:${v + 1}`);
      if (t2 && (t1.length + t2.length <= 520)) {
        candidates.push({ vStart: v, vEnd: v + 1, text: `${t1} ${t2}` });
      }
    }

    for (const cand of candidates) {
      const cClusters = getActiveClusters(cand.text);
      const cStems = getWordStems(extractTokens(cand.text));
      let s = 0;
      for (const cl of srcClusters) if (cClusters.has(cl)) s += 20;
      for (const st of srcStems) if (cStems.has(st)) s += 12;
      // Leve preferência por janela de 2 versículos quando adiciona sentido
      if (cand.vEnd > cand.vStart) s += 4;

      if (s > bestWindow.score) {
        bestWindow = { ...cand, score: s };
      }
    }
  }

  if (bestWindow.text) {
    const formattedRef = bestWindow.vEnd > bestWindow.vStart
      ? `${bookName} ${chapter}:${bestWindow.vStart}–${bestWindow.vEnd}`
      : `${bookName} ${chapter}:${bestWindow.vStart}`;
    return {
      ref: formattedRef,
      startVerse: bestWindow.vStart,
      text: bestWindow.text
    };
  }

  const fallbackTxt = verseMap.get(`${bookId}:${chapter}:${startVerse}`);
  return {
    ref: `${bookName} ${chapter}:${startVerse}`,
    startVerse,
    text: fallbackTxt || null
  };
}

function main() {
  console.log('1. Carregando todos os 66 livros da Bíblia NVT...');
  const booksData = {};
  const verseMap = new Map();

  const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const bookId = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(bibleDir, file), 'utf8'));
    booksData[bookId] = data;

    for (const [chKey, chData] of Object.entries(data)) {
      for (const sec of (chData.sections || [])) {
        for (const v of (sec.verses || [])) {
          verseMap.set(`${bookId}:${chKey}:${v.number}`, (v.text || '').trim());
        }
      }
    }
  }

  console.log(`Indexados ${verseMap.size} versículos NVT em ${files.length} livros.`);

  let totalVerses = 0;
  let versesWithCleanRefs = 0;
  let totalRefsKept = 0;
  let totalRefsDroppedNoise = 0;
  let totalRangesRefined = 0;

  for (const [bookId, bookData] of Object.entries(booksData)) {
    for (const [chKey, chData] of Object.entries(bookData)) {
      for (const sec of (chData.sections || [])) {
        for (const v of (sec.verses || [])) {
          totalVerses++;
          const vKey = `${bookId}:${chKey}:${v.number}`;
          const sourceText = v.text || '';

          // 1. Verificar se este versículo possui Curadoria Exegética Mestra
          if (CURATED_EXEGETICAL_REFS[vKey]) {
            const curatedList = [];
            for (const item of CURATED_EXEGETICAL_REFS[vKey]) {
              const lookupRef = item.singleRef || item.ref;
              const parsed = parsePortugueseRef(lookupRef);
              if (!parsed) continue;
              const resolved = resolveTargetPassage(parsed, sourceText, verseMap);
              if (resolved.text) {
                curatedList.push({
                  ref: resolved.ref,
                  text: resolved.text,
                  category: item.category || classifyHermeneuticBridge(bookId, sourceText, parsed.bookId, resolved.text)
                });
              }
            }
            v.crossReferences = curatedList;
            if (curatedList.length > 0) {
              versesWithCleanRefs++;
              totalRefsKept += curatedList.length;
            }
            continue;
          }

          // 2. Processar e auditar referências existentes com o Motor Exegético
          const rawRefs = Array.isArray(v.crossReferences) ? v.crossReferences : [];
          if (rawRefs.length === 0) continue;

          // Verificar se o versículo de origem é puramente conectivo/trivial muito curto sem substância doutrinária
          const srcClusters = getActiveClusters(sourceText);
          const srcTokens = extractTokens(sourceText);
          const isShortTransitional = sourceText.length < 48 && srcClusters.size === 0 && !hasExplicitCitationCue(sourceText);

          const scoredCandidates = [];
          const seenResolvedRefs = new Set();

          for (const rawItem of rawRefs) {
            const parsed = parsePortugueseRef(rawItem.ref);
            if (!parsed) continue;

            const resolved = resolveTargetPassage(parsed, sourceText, verseMap);
            if (!resolved.text) continue;

            if (resolved.ref !== rawItem.ref || resolved.text !== rawItem.text) {
              totalRangesRefined++;
            }

            if (seenResolvedRefs.has(resolved.ref)) continue;

            const affinity = computeExegeticalAffinity(
              bookId,
              chKey,
              v.number,
              sourceText,
              parsed.bookId,
              parsed.chapter,
              resolved.startVerse,
              resolved.text
            );

            // Limiar de corte exegético: descartar colisões lexicais soltas e circulares
            const minThreshold = isShortTransitional ? 24 : 8;
            if (affinity < minThreshold) {
              totalRefsDroppedNoise++;
              continue;
            }

            seenResolvedRefs.add(resolved.ref);
            const category = classifyHermeneuticBridge(bookId, sourceText, parsed.bookId, resolved.text);

            scoredCandidates.push({
              ref: resolved.ref,
              text: resolved.text,
              category,
              affinity
            });
          }

          // Ordenar pelos mais relevantes exegeticamente e manter no máximo 3 (ou 4 se todos forem altíssima relevância >= 26)
          scoredCandidates.sort((a, b) => b.affinity - a.affinity);
          const maxToKeep = (scoredCandidates.length >= 4 && scoredCandidates[3].affinity >= 26) ? 4 : 3;
          const finalRefs = scoredCandidates.slice(0, maxToKeep).map(({ ref, text, category }) => ({
            ref,
            text,
            category
          }));

          v.crossReferences = finalRefs;
          if (finalRefs.length > 0) {
            versesWithCleanRefs++;
            totalRefsKept += finalRefs.length;
          }
        }
      }
    }

    const outPath = path.join(bibleDir, `${bookId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(bookData, null, 2) + '\n', 'utf8');
  }

  if (booksData['lucas']) {
    fs.writeFileSync(lucasSrcPath, JSON.stringify(booksData['lucas'], null, 2) + '\n', 'utf8');
  }

  console.log('=== RELATÓRIO DA RECONSTRUÇÃO EXEGÉTICA ===');
  console.log({
    totalVerses,
    versesWithCleanRefs,
    coveragePct: ((versesWithCleanRefs / totalVerses) * 100).toFixed(1) + '%',
    totalRefsKept,
    totalRefsDroppedNoise,
    totalRangesRefined
  });
}

main();
