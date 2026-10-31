const fs = require('fs');
const https = require('https');
const path = require('path');

const TSK_TO_PORTUGUESE = {
  'GEN': { id: 'genesis', name: 'Gênesis' },
  'EXO': { id: 'exodo', name: 'Êxodo' },
  'LEV': { id: 'levitico', name: 'Levítico' },
  'NUM': { id: 'numeros', name: 'Números' },
  'DEU': { id: 'deuteronomio', name: 'Deuteronômio' },
  'JOS': { id: 'josue', name: 'Josué' },
  'JDG': { id: 'juizes', name: 'Juízes' },
  'RUT': { id: 'rute', name: 'Rute' },
  '1SA': { id: '1samuel', name: '1 Samuel' },
  '2SA': { id: '2samuel', name: '2 Samuel' },
  '1KI': { id: '1reis', name: '1 Reis' },
  '2KI': { id: '2reis', name: '2 Reis' },
  '1CH': { id: '1cronicas', name: '1 Crônicas' },
  '2CH': { id: '2cronicas', name: '2 Crônicas' },
  'EZR': { id: 'esdras', name: 'Esdras' },
  'NEH': { id: 'neemias', name: 'Neemias' },
  'EST': { id: 'ester', name: 'Ester' },
  'JOB': { id: 'jo', name: 'Jó' },
  'PSA': { id: 'salmos', name: 'Salmos' },
  'PRO': { id: 'proverbios', name: 'Provérbios' },
  'ECC': { id: 'eclesiastes', name: 'Eclesiastes' },
  'SNG': { id: 'canticos', name: 'Cânticos' },
  'ISA': { id: 'isaias', name: 'Isaías' },
  'JER': { id: 'jeremias', name: 'Jeremias' },
  'LAM': { id: 'lamentacoes', name: 'Lamentações' },
  'EZK': { id: 'ezequiel', name: 'Ezequiel' },
  'DAN': { id: 'daniel', name: 'Daniel' },
  'HOS': { id: 'oseias', name: 'Oséias' },
  'JOL': { id: 'joel', name: 'Joel' },
  'AMO': { id: 'amos', name: 'Amós' },
  'OBA': { id: 'obadias', name: 'Obadias' },
  'JON': { id: 'jonas', name: 'Jonas' },
  'MIC': { id: 'miqueias', name: 'Miqueias' },
  'NAM': { id: 'naum', name: 'Naum' },
  'HAB': { id: 'habacuque', name: 'Habacuque' },
  'ZEP': { id: 'sofonias', name: 'Sofonias' },
  'HAG': { id: 'ageu', name: 'Ageu' },
  'ZEC': { id: 'zacarias', name: 'Zacarias' },
  'MAL': { id: 'malaquias', name: 'Malaquias' },
  'MAT': { id: 'mateus', name: 'Mateus' },
  'MAR': { id: 'marcos', name: 'Marcos' },
  'LUK': { id: 'lucas', name: 'Lucas' },
  'JOH': { id: 'joao', name: 'João' },
  'ACT': { id: 'atos', name: 'Atos' },
  'ROM': { id: 'romanos', name: 'Romanos' },
  '1CO': { id: '1corintios', name: '1 Coríntios' },
  '2CO': { id: '2corintios', name: '2 Coríntios' },
  'GAL': { id: 'galatas', name: 'Gálatas' },
  'EPH': { id: 'efesios', name: 'Efésios' },
  'PHP': { id: 'filipenses', name: 'Filipenses' },
  'COL': { id: 'colossenses', name: 'Colossenses' },
  '1TH': { id: '1tessalonicenses', name: '1 Tessalonicenses' },
  '2TH': { id: '2tessalonicenses', name: '2 Tessalonicenses' },
  '1TI': { id: '1timoteo', name: '1 Timóteo' },
  '2TI': { id: '2timoteo', name: '2 Timóteo' },
  'TIT': { id: 'tito', name: 'Tito' },
  'PHM': { id: 'filemom', name: 'Filemom' },
  'HEB': { id: 'hebreus', name: 'Hebreus' },
  'JAS': { id: 'tiago', name: 'Tiago' },
  '1PE': { id: '1pedro', name: '1 Pedro' },
  '2PE': { id: '2pedro', name: '2 Pedro' },
  '1JO': { id: '1joao', name: '1 João' },
  '2JO': { id: '2joao', name: '2 João' },
  '3JO': { id: '3joao', name: '3 João' },
  'JUD': { id: 'judas', name: 'Judas' },
  'REV': { id: 'apocalipse', name: 'Apocalipse' }
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function parseRefString(refStr) {
  const parts = refStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const code = parts[0];
    const ch = parts[1];
    const v = parts[2];
    const info = TSK_TO_PORTUGUESE[code];
    if (info) {
      return {
        bookCode: code,
        bookId: info.id,
        bookName: info.name,
        chapter: ch,
        verse: v,
        formattedRef: `${info.name} ${ch}:${v}`
      };
    }
  }
  return null;
}

function cleanVersePreview(text) {
  if (!text) return null;
  // Remove dumps de notas de rodapé no final de livros como "1 1. Ou..."
  let clean = text.replace(/\s+\d+\s+\d+\..*$/s, '').trim();
  // Remove marcadores numéricos de rodapé ao fim do versículo
  clean = clean.replace(/\d+$/, '').trim();
  if (clean.length > 250) {
    clean = clean.slice(0, 220).replace(/[,;:\s]+$/, '') + '...';
  }
  return clean;
}

async function main() {
  const bibleDir = path.resolve(__dirname, '../public/biblia');
  const lucasSrcPath = path.resolve(__dirname, '../src/data/lucas_nvt.json');

  console.log('1. Indexando textos da Bíblia NVT local...');
  const booksData = {};
  const verseMap = new Map();

  fs.readdirSync(bibleDir).forEach(file => {
    if (!file.endsWith('.json')) return;
    const bookId = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(bibleDir, file), 'utf8'));
    booksData[bookId] = data;

    for (const chKey of Object.keys(data)) {
      const chData = data[chKey];
      if (chData && chData.sections) {
        for (const sec of chData.sections) {
          if (sec.verses) {
            for (const v of sec.verses) {
              const cleanedText = cleanVersePreview(v.text);
              verseMap.set(`${bookId}:${chKey}:${v.number}`, cleanedText);
            }
          }
        }
      }
    }
  });

  console.log(`Bíblia carregada: ${Object.keys(booksData).length} livros, ${verseMap.size} versículos indexados.`);

  console.log('2. Baixando os 32 volumes do Treasury of Scripture Knowledge (TSK)...');
  const downloadPromises = [];
  for (let i = 1; i <= 32; i++) {
    const url = `https://raw.githubusercontent.com/josephilipraja/bible-cross-reference-json/master/${i}.json`;
    downloadPromises.push(fetchJson(url));
  }
  const tskChunks = await Promise.all(downloadPromises);

  const tskMap = new Map();
  let totalTskEntries = 0;

  for (const chunk of tskChunks) {
    for (const key of Object.keys(chunk)) {
      const entry = chunk[key];
      if (!entry || !entry.v || !entry.r) continue;
      totalTskEntries++;

      const origin = parseRefString(entry.v);
      if (!origin) continue;

      const originKey = `${origin.bookId}:${origin.chapter}:${origin.verse}`;
      const refsRaw = Object.values(entry.r);

      const selectedRefs = [];
      const seenBooks = new Set([origin.bookId]);
      const fallbackRefs = [];

      for (const targetStr of refsRaw) {
        const target = parseRefString(targetStr);
        if (!target) continue;

        const targetText = verseMap.get(`${target.bookId}:${target.chapter}:${target.verse}`);
        const refItem = {
          ref: target.formattedRef,
          ...(targetText ? { text: targetText } : {})
        };

        if (!seenBooks.has(target.bookId) && selectedRefs.length < 4) {
          seenBooks.add(target.bookId);
          selectedRefs.push(refItem);
        } else if (fallbackRefs.length < 5) {
          fallbackRefs.push(refItem);
        }
      }

      while (selectedRefs.length < 4 && fallbackRefs.length > 0) {
        const next = fallbackRefs.shift();
        if (!selectedRefs.some(r => r.ref === next.ref)) {
          selectedRefs.push(next);
        }
      }

      if (selectedRefs.length > 0) {
        tskMap.set(originKey, selectedRefs);
      }
    }
  }

  console.log(`TSK processado: ${totalTskEntries} entradas originais, ${tskMap.size} versículos com referências mapeadas.`);

  console.log('3. Injetando referências cruzadas nos 66 livros da Bíblia...');
  let totalInjectedVerses = 0;
  let totalRefsCount = 0;

  for (const [bookId, bookData] of Object.entries(booksData)) {
    for (const chKey of Object.keys(bookData)) {
      const chData = bookData[chKey];
      if (!chData || !chData.sections) continue;

      for (const sec of chData.sections) {
        if (!sec.verses) continue;

        for (const v of sec.verses) {
          const vKey = `${bookId}:${chKey}:${v.number}`;
          const tskRefs = tskMap.get(vKey);

          if (tskRefs && tskRefs.length > 0) {
            v.crossReferences = tskRefs;
            totalInjectedVerses++;
            totalRefsCount += tskRefs.length;
          } else if (!v.crossReferences) {
            v.crossReferences = [];
          }
        }
      }
    }

    const bookFilePath = path.join(bibleDir, `${bookId}.json`);
    fs.writeFileSync(bookFilePath, JSON.stringify(bookData, null, 2), 'utf8');
  }

  console.log(`Atualização concluída: ${totalInjectedVerses} versículos atualizados em todos os 66 livros com ${totalRefsCount} referências.`);

  // 4. Também atualizar devocional-biblia/src/data/lucas_nvt.json
  if (booksData['lucas']) {
    fs.writeFileSync(lucasSrcPath, JSON.stringify(booksData['lucas'], null, 2), 'utf8');
    console.log('src/data/lucas_nvt.json atualizado com sucesso.');
  }

  console.log('Sucesso!');
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
