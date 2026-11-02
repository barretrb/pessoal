const fs = require('fs');
const readline = require('readline');
const path = require('path');

const OPENBIBLE_TO_PORTUGUESE = {
  '1Chr': { id: '1cronicas', name: '1 Crônicas' },
  '1Cor': { id: '1corintios', name: '1 Coríntios' },
  '1John': { id: '1joao', name: '1 João' },
  '1Kgs': { id: '1reis', name: '1 Reis' },
  '1Pet': { id: '1pedro', name: '1 Pedro' },
  '1Sam': { id: '1samuel', name: '1 Samuel' },
  '1Thess': { id: '1tessalonicenses', name: '1 Tessalonicenses' },
  '1Tim': { id: '1timoteo', name: '1 Timóteo' },
  '2Chr': { id: '2cronicas', name: '2 Crônicas' },
  '2Cor': { id: '2corintios', name: '2 Coríntios' },
  '2John': { id: '2joao', name: '2 João' },
  '2Kgs': { id: '2reis', name: '2 Reis' },
  '2Pet': { id: '2pedro', name: '2 Pedro' },
  '2Sam': { id: '2samuel', name: '2 Samuel' },
  '2Thess': { id: '2tessalonicenses', name: '2 Tessalonicenses' },
  '2Tim': { id: '2timoteo', name: '2 Timóteo' },
  '3John': { id: '3joao', name: '3 João' },
  'Acts': { id: 'atos', name: 'Atos' },
  'Amos': { id: 'amos', name: 'Amós' },
  'Col': { id: 'colossenses', name: 'Colossenses' },
  'Dan': { id: 'daniel', name: 'Daniel' },
  'Deut': { id: 'deuteronomio', name: 'Deuteronômio' },
  'Eccl': { id: 'eclesiastes', name: 'Eclesiastes' },
  'Eph': { id: 'efesios', name: 'Efésios' },
  'Esth': { id: 'ester', name: 'Ester' },
  'Exod': { id: 'exodo', name: 'Êxodo' },
  'Ezek': { id: 'ezequiel', name: 'Ezequiel' },
  'Ezra': { id: 'esdras', name: 'Esdras' },
  'Gal': { id: 'galatas', name: 'Gálatas' },
  'Gen': { id: 'genesis', name: 'Gênesis' },
  'Hab': { id: 'habacuque', name: 'Habacuque' },
  'Hag': { id: 'ageu', name: 'Ageu' },
  'Heb': { id: 'hebreus', name: 'Hebreus' },
  'Hos': { id: 'oseias', name: 'Oséias' },
  'Isa': { id: 'isaias', name: 'Isaías' },
  'Jas': { id: 'tiago', name: 'Tiago' },
  'Jer': { id: 'jeremias', name: 'Jeremias' },
  'Job': { id: 'jo', name: 'Jó' },
  'Joel': { id: 'joel', name: 'Joel' },
  'John': { id: 'joao', name: 'João' },
  'Jonah': { id: 'jonas', name: 'Jonas' },
  'Josh': { id: 'josue', name: 'Josué' },
  'Jude': { id: 'judas', name: 'Judas' },
  'Judg': { id: 'juizes', name: 'Juízes' },
  'Lam': { id: 'lamentacoes', name: 'Lamentações' },
  'Lev': { id: 'levitico', name: 'Levítico' },
  'Luke': { id: 'lucas', name: 'Lucas' },
  'Mal': { id: 'malaquias', name: 'Malaquias' },
  'Mark': { id: 'marcos', name: 'Marcos' },
  'Matt': { id: 'mateus', name: 'Mateus' },
  'Mic': { id: 'miqueias', name: 'Miqueias' },
  'Nah': { id: 'naum', name: 'Naum' },
  'Neh': { id: 'neemias', name: 'Neemias' },
  'Num': { id: 'numeros', name: 'Números' },
  'Obad': { id: 'obadias', name: 'Obadias' },
  'Phil': { id: 'filipenses', name: 'Filipenses' },
  'Phlm': { id: 'filemom', name: 'Filemom' },
  'Prov': { id: 'proverbios', name: 'Provérbios' },
  'Ps': { id: 'salmos', name: 'Salmos' },
  'Rev': { id: 'apocalipse', name: 'Apocalipse' },
  'Rom': { id: 'romanos', name: 'Romanos' },
  'Ruth': { id: 'rute', name: 'Rute' },
  'Song': { id: 'canticos', name: 'Cânticos' },
  'Titus': { id: 'tito', name: 'Tito' },
  'Zech': { id: 'zacarias', name: 'Zacarias' },
  'Zeph': { id: 'sofonias', name: 'Sofonias' }
};

// Mapeamento reverso de id para o código OpenBible
const ID_TO_OPENBIBLE = {};
for (const [code, info] of Object.entries(OPENBIBLE_TO_PORTUGUESE)) {
  ID_TO_OPENBIBLE[info.id] = code;
}

function cleanVersePreview(text) {
  if (!text) return null;
  // Remove anotações e notas de rodapé no final
  let clean = text.replace(/\s+\d+\s+\d+\..*$/s, '').trim();
  clean = clean.replace(/\d+$/, '').trim();
  if (clean.length > 250) {
    clean = clean.slice(0, 220).replace(/[,;:\s]+$/, '') + '...';
  }
  return clean;
}

function formatTargetRef(targetStr) {
  if (targetStr.includes('-')) {
    const [start, end] = targetStr.split('-');
    const [sB, sCh, sV] = start.split('.');
    const [eB, eCh, eV] = end.split('.');
    const info = OPENBIBLE_TO_PORTUGUESE[sB];
    if (!info) return null;
    let formattedRef = '';
    if (sB === eB && sCh === eCh) {
      formattedRef = info.name + ' ' + sCh + ':' + sV + '–' + eV;
    } else {
      const eInfo = OPENBIBLE_TO_PORTUGUESE[eB] || info;
      formattedRef = info.name + ' ' + sCh + ':' + sV + '–' + eInfo.name + ' ' + eCh + ':' + eV;
    }
    return {
      bookId: info.id,
      chapter: sCh,
      startVerse: sV,
      endVerse: (sB === eB && sCh === eCh) ? eV : null,
      formattedRef
    };
  } else {
    const [b, c, v] = targetStr.split('.');
    const info = OPENBIBLE_TO_PORTUGUESE[b];
    if (!info) return null;
    return {
      bookId: info.id,
      chapter: c,
      startVerse: v,
      endVerse: null,
      formattedRef: info.name + ' ' + c + ':' + v
    };
  }
}

async function main() {
  const bibleDir = path.resolve(__dirname, '../public/biblia');
  const lucasSrcPath = path.resolve(__dirname, '../src/data/lucas_nvt.json');
  const openBibleFile = path.resolve(__dirname, '../../temp_openbible/cross_references.txt');

  console.log('1. Indexando textos bíblicos locais em memória...');
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
              verseMap.set(bookId + ':' + chKey + ':' + v.number, cleanedText);
            }
          }
        }
      }
    }
  });

  console.log(`Bíblia carregada: ${Object.keys(booksData).length} livros, ${verseMap.size} versículos.`);

  console.log('2. Lendo base OpenBible com votação colaborativa e relevância...');
  const openBibleMap = new Map(); // 'FromVerse' -> array de { targetStr, votes }

  const rl = readline.createInterface({
    input: fs.createReadStream(openBibleFile),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.startsWith('From Verse')) continue;
    const parts = line.split('\t');
    if (parts.length >= 3) {
      const from = parts[0];
      const to = parts[1];
      const votes = parseInt(parts[2], 10);
      if (isNaN(votes)) continue;

      if (!openBibleMap.has(from)) {
        openBibleMap.set(from, []);
      }
      openBibleMap.get(from).push({ to, votes });
    }
  }

  console.log(`OpenBible carregado: ${openBibleMap.size} versículos de origem catalogados.`);

  console.log('3. Higienizando e aplicando as melhores referências por versículo...');
  let totalVersesUpdated = 0;
  let totalRefsCreated = 0;

  for (const [bookId, bookData] of Object.entries(booksData)) {
    const obBookCode = ID_TO_OPENBIBLE[bookId];

    for (const chKey of Object.keys(bookData)) {
      const chData = bookData[chKey];
      if (!chData || !chData.sections) continue;

      for (const sec of chData.sections) {
        if (!sec.verses) continue;

        for (const v of sec.verses) {
          const fromKey = obBookCode + '.' + chKey + '.' + v.number;
          const candidates = openBibleMap.get(fromKey);

          let finalRefs = [];

          if (candidates && candidates.length > 0) {
            // Ordenar por votos decrescentes (máxima relevância)
            const sorted = [...candidates].sort((a, b) => b.votes - a.votes);

            // Filtrar referências com votos positivos ou os melhores candidatos
            const seenTargets = new Set();
            const seenBooks = new Set();

            for (const item of sorted) {
              // Se tivermos 4 ou mais referências de alta relevância, parar
              if (finalRefs.length >= 4) break;

              // Ignorar votos negativos ou zerados se já temos referências
              if (item.votes <= 0 && finalRefs.length >= 2) continue;

              const parsed = formatTargetRef(item.to);
              if (!parsed) continue;

              if (seenTargets.has(parsed.formattedRef)) continue;

              // Priorizar diversidade moderada: no máx 2 referências do mesmo livro
              const bookCount = finalRefs.filter(r => r.ref.startsWith(OPENBIBLE_TO_PORTUGUESE[item.to.split('.')[0]]?.name || '')).length;
              if (bookCount >= 2 && sorted.length > finalRefs.length + 2) continue;

              // Buscar o texto em português
              let text = verseMap.get(parsed.bookId + ':' + parsed.chapter + ':' + parsed.startVerse);
              // Se for um range curto (ex: 2 versículos), tentar juntar
              if (parsed.endVerse && Number(parsed.endVerse) === Number(parsed.startVerse) + 1) {
                const nextText = verseMap.get(parsed.bookId + ':' + parsed.chapter + ':' + parsed.endVerse);
                if (nextText && text && (text.length + nextText.length < 220)) {
                  text = text + ' ' + nextText;
                }
              }

              seenTargets.add(parsed.formattedRef);
              finalRefs.push({
                ref: parsed.formattedRef,
                ...(text ? { text } : {})
              });
            }
          }

          // Se o OpenBible não tiver entradas para este versículo específico, manter as existentes se houver
          if (finalRefs.length === 0 && Array.isArray(v.crossReferences) && v.crossReferences.length > 0) {
            finalRefs = v.crossReferences;
          }

          v.crossReferences = finalRefs;
          if (finalRefs.length > 0) {
            totalVersesUpdated++;
            totalRefsCreated += finalRefs.length;
          }
        }
      }
    }

    // Salvar o livro higienizado
    const filePath = path.join(bibleDir, bookId + '.json');
    fs.writeFileSync(filePath, JSON.stringify(bookData, null, 2), 'utf8');
  }

  console.log(`Higienização concluída com sucesso!`);
  console.log(`Total de versículos com referências de alta relevância: ${totalVersesUpdated}`);
  console.log(`Total de referências mantidas após filtro de relevância: ${totalRefsCreated}`);

  // Atualizar também src/data/lucas_nvt.json
  if (booksData['lucas']) {
    fs.writeFileSync(lucasSrcPath, JSON.stringify(booksData['lucas'], null, 2), 'utf8');
    console.log('src/data/lucas_nvt.json atualizado.');
  }
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
