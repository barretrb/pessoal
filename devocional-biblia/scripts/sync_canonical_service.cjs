const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. Update bibleService.js cache buster
const bsPath = path.join(root, 'src/services/bibleService.js');
let bs = fs.readFileSync(bsPath, 'utf8');
bs = bs.replace(/\?v=20261119/g, '?v=20261124');
fs.writeFileSync(bsPath, bs, 'utf8');

// 2. Update App.jsx
const appPath = path.join(root, 'src/App.jsx');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(
  "const [referencesData, setReferencesData] = useState({ isOpen: false, verseKey: '', references: [] });",
  "const [referencesData, setReferencesData] = useState({ isOpen: false, verseKey: '', sourceText: '', references: [] });"
);
app = app.replace(
  /onOpenReferences=\{\(verseKey,\s*references\)\s*=>\s*\{\s*setReferencesData\(\{\s*isOpen:\s*true,\s*verseKey,\s*references\s*\}\);\s*\}\}/,
  "onOpenReferences={(verseKey, references, sourceText = '') => {\n              setReferencesData({ isOpen: true, verseKey, sourceText, references });\n            }}"
);
app = app.replace(
  /<ReferenciasDrawer[\s\S]*?\/>/,
  `<ReferenciasDrawer
        isOpen={referencesData.isOpen}
        onClose={() => setReferencesData({ ...referencesData, isOpen: false })}
        verseKey={referencesData.verseKey}
        sourceText={referencesData.sourceText}
        references={referencesData.references}
        onNavigateToPassage={handleSelectFreeChapter}
      />`
);
fs.writeFileSync(appPath, app, 'utf8');

// 3. Update crossReferenceService.js to 100% NVT + Hermeneutic Categories
const bibleDir = path.join(root, 'public/biblia');
const servicePath = path.join(root, 'src/services/crossReferenceService.js');

const BOOK_NAME_TO_ID = {
  'Gênesis': 'genesis', 'Êxodo': 'exodo', 'Levítico': 'levitico', 'Números': 'numeros', 'Deuteronômio': 'deuteronomio',
  'Josué': 'josue', 'Juízes': 'juizes', 'Rute': 'rute', '1 Samuel': '1samuel', '2 Samuel': '2samuel',
  '1 Reis': '1reis', '2 Reis': '2reis', '1 Crônicas': '1cronicas', '2 Crônicas': '2cronicas', 'Esdras': 'esdras',
  'Neemias': 'neemias', 'Ester': 'ester', 'Jó': 'jo', 'Salmos': 'salmos', 'Salmo': 'salmos', 'Provérbios': 'proverbios',
  'Eclesiastes': 'eclesiastes', 'Cânticos': 'canticos', 'Cântico dos Cânticos': 'canticos', 'Isaías': 'isaias',
  'Jeremias': 'jeremias', 'Lamentações': 'lamentacoes', 'Ezequiel': 'ezequiel', 'Daniel': 'daniel', 'Oséias': 'oseias',
  'Oseias': 'oseias', 'Joel': 'joel', 'Amós': 'amos', 'Obadias': 'obadias', 'Jonas': 'jonas', 'Miqueias': 'miqueias',
  'Naum': 'naum', 'Habacuque': 'habacuque', 'Sofonias': 'sofonias', 'Ageu': 'ageu', 'Zacarias': 'zacarias',
  'Malaquias': 'malaquias', 'Mateus': 'mateus', 'Marcos': 'marcos', 'Lucas': 'lucas', 'João': 'joao',
  'Atos': 'atos', 'Atos dos Apóstolos': 'atos', 'Romanos': 'romanos', '1 Coríntios': '1corintios', '2 Coríntios': '2corintios',
  'Gálatas': 'galatas', 'Efésios': 'efesios', 'Filipenses': 'filipenses', 'Colossenses': 'colossenses',
  '1 Tessalonicenses': '1tessalonicenses', '2 Tessalonicenses': '2tessalonicenses', '1 Timóteo': '1timoteo',
  '2 Timóteo': '2timoteo', 'Tito': 'tito', 'Filemom': 'filemom', 'Hebreus': 'hebreus', 'Tiago': 'tiago',
  '1 Pedro': '1pedro', '2 Pedro': '2pedro', '1 João': '1joao', '2 João': '2joao', '3 João': '3joao',
  'Judas': 'judas', 'Apocalipse': 'apocalipse'
};

const OT_BOOKS = new Set([
  'genesis','exodo','levitico','numeros','deuteronomio','josue','juizes','rute',
  '1samuel','2samuel','1reis','2reis','1cronicas','2cronicas','esdras','neemias','ester',
  'jo','salmos','proverbios','eclesiastes','canticos','isaias','jeremias','lamentacoes',
  'ezequiel','daniel','oseias','joel','amos','obadias','jonas','miqueias','naum',
  'habacuque','sofonias','ageu','zacarias','malaquias'
]);
const GOSPELS = new Set(['mateus', 'marcos', 'lucas', 'joao']);

const verseMap = new Map();
for (const file of fs.readdirSync(bibleDir).filter(f => f.endsWith('.json'))) {
  const bId = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(bibleDir, file), 'utf8'));
  for (const [chKey, chData] of Object.entries(data)) {
    for (const sec of (chData.sections || [])) {
      for (const v of (sec.verses || [])) {
        verseMap.set(bId + ':' + chKey + ':' + v.number, (v.text || '').trim());
      }
    }
  }
}

const src = fs.readFileSync(servicePath, 'utf8');
const match = src.match(/export const CANONICAL_CROSS_REFERENCES = (\{[\s\S]*?\n\});/);
const canonicalObj = eval('(' + match[1] + ')');

function resolveNvtText(refStr) {
  const m = refStr.trim().match(/^(.+?)\s+(\d+):(\d+)(?:[–-](\d+))?$/);
  if (!m) return null;
  const bId = BOOK_NAME_TO_ID[m[1].trim()];
  if (!bId) return null;
  const ch = m[2];
  const v1 = parseInt(m[3], 10);
  const v2 = m[4] ? parseInt(m[4], 10) : v1;
  const parts = [];
  for (let v = v1; v <= Math.min(v2, v1 + 3); v++) {
    const t = verseMap.get(bId + ':' + ch + ':' + v);
    if (t) parts.push(t);
  }
  return { bId, text: parts.join(' ') };
}

function classify(srcBookName, tgtBookId) {
  const srcId = BOOK_NAME_TO_ID[srcBookName] || 'lucas';
  if (OT_BOOKS.has(srcId) !== OT_BOOKS.has(tgtBookId)) return 'Citação & Cumprimento';
  if (GOSPELS.has(srcId) && GOSPELS.has(tgtBookId) && srcId !== tgtBookId) return 'Passagem Paralela';
  if ((srcId === 'atos' || tgtBookId === 'atos')) return 'Passagem Paralela';
  return 'Harmonia Doutrinária';
}

for (const [vKey, list] of Object.entries(canonicalObj)) {
  const srcBookName = vKey.split(/\s+\d+:/)[0];
  for (const item of list) {
    const res = resolveNvtText(item.ref);
    if (res && res.text) {
      item.text = res.text;
      item.category = item.category || classify(srcBookName, res.bId);
    } else {
      item.category = item.category || 'Harmonia Doutrinária';
    }
  }
}

const header = '// Serviço Central de Referências Cruzadas Bíblicas Exegéticas (Cross-References Engine - NVT)\n' +
'// Mapeia citações diretas, profecias cumpridas, tipologia bíblica, passagens paralelas e harmonia doutrinária.\n\n' +
'export const CANONICAL_CROSS_REFERENCES = ' + JSON.stringify(canonicalObj, null, 2) + ';\n\n';

const footer = `export const crossReferenceService = {
  // Retorna as referências cruzadas exegéticas de um versículo (100% NVT e classificadas por Ponte Hermenêutica)
  getReferences(bookName, chapter, verseNumber, nativeRefs = []) {
    const cleanBook = (bookName || 'Lucas').trim();
    const ch = String(chapter || '1').trim();
    const vNum = String(verseNumber || '1').trim();
    const key = \`\${cleanBook} \${ch}:\${vNum}\`;

    const canonical = CANONICAL_CROSS_REFERENCES[key] || [];
    const native = Array.isArray(nativeRefs) ? nativeRefs : [];

    const seenRefs = new Set();
    const merged = [];

    // Se o versículo já possui referências nativas curadas pelo motor exegético (com category) ou curadoria canônica:
    const sourceList = (native.length > 0 && native[0]?.category)
      ? [...native, ...canonical]
      : [...canonical, ...native];

    for (const item of sourceList) {
      if (merged.length >= 4) break;
      const refName = item?.ref || item?.reference;
      if (!refName || seenRefs.has(refName)) continue;

      // Bloquear auto-referência ou versículo adjacente do mesmo capítulo (distância <= 8)
      const m = refName.match(/^(.+?)\\s+(\\d+):(\\d+)/);
      if (m) {
        const tBook = m[1].trim();
        const tCh = m[2];
        const tV = parseInt(m[3], 10);
        if (tBook === cleanBook && tCh === ch && Math.abs(tV - Number(vNum)) <= 8) {
          continue;
        }
      }

      seenRefs.add(refName);
      merged.push({
        ...item,
        ref: refName,
        reference: refName,
        category: item.category || 'Harmonia Doutrinária'
      });
    }

    return merged;
  },

  hasReferences(bookName, chapter, verseNumber, nativeRefs = []) {
    const refs = this.getReferences(bookName, chapter, verseNumber, nativeRefs);
    return refs.length > 0;
  }
};
`;

fs.writeFileSync(servicePath, header + footer, 'utf8');
console.log('Atualizados com sucesso: bibleService.js, App.jsx e crossReferenceService.js');
