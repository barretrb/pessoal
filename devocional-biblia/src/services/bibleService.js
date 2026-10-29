import lucasData from '../data/lucas_nvt.json' with { type: 'json' };
import { BIBLE_BOOKS_STUDY_INFO } from '../data/bibleBooksStudyInfo.js';

// Cache em memória de livros já carregados
const bookCache = {
  lucas: lucasData
};

const BOOK_ALIASES = {
  'canticodoscanticos': 'canticos',
  'cantares': 'canticos',
  'cantaresdesalomao': 'canticos',
  'salmo': 'salmos',
  'atosdosapostolos': 'atos',
  '1joao': '1joao',
  '2joao': '2joao',
  '3joao': '3joao'
};

export function normalizeBookId(nameOrId) {
  if (!nameOrId) return 'lucas';
  const clean = nameOrId
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '')
    .trim();

  if (BOOK_ALIASES[clean]) {
    return BOOK_ALIASES[clean];
  }

  // Procurar correspondência nos 66 livros
  const match = BIBLE_BOOKS_STUDY_INFO.find(b => {
    const bId = b.id.toLowerCase().replace(/\s+/g, '');
    const bName = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
    return bId === clean || bName === clean;
  });

  return match ? match.id : clean;
}

export function getBookNameById(bookId) {
  const info = BIBLE_BOOKS_STUDY_INFO.find(b => b.id === bookId);
  return info ? info.name : bookId;
}

export function parseReading(str) {
  if (!str) return { book: 'Lucas', chapter: '1' };
  // Limpa anotações de versículos como "vv.1–8" ou "v. 1"
  let cleanStr = str.replace(/\s*vv?\..*$/i, '').trim();
  // Limpa anotações de perícopes em parênteses, como "Salmos 119 (Álefe)"
  cleanStr = cleanStr.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const parts = cleanStr.split(/\s+/);
  const chapter = parts.pop();
  const book = parts.join(' ');
  return { book: book || 'Lucas', chapter: chapter || '1' };
}

export function sanitizeBookData(bookData) {
  if (!bookData || typeof bookData !== 'object') return bookData;

  const result = {};

  for (const [chKey, chData] of Object.entries(bookData)) {
    if (!chData || !Array.isArray(chData.sections)) {
      result[chKey] = chData;
      continue;
    }

    const allVerses = chData.sections.flatMap(s => s.verses);
    if (!allVerses || allVerses.length === 0) {
      result[chKey] = chData;
      continue;
    }

    const hasEmbedded = allVerses.some(v => v.text && /^(.*?[.!?\u201d\u2019'])\s+([A-ZÀ-Ú][^.!?\n,;:]{3,65})$/.test(v.text));
    if (!hasEmbedded && chData.sections.length > 1) {
      result[chKey] = chData;
      continue;
    }

    let newSections = [];
    let currentTitle = chData.sections[0]?.title || '';
    let currentVerses = [];

    for (let i = 0; i < allVerses.length; i++) {
      const v = { ...allVerses[i] };
      const text = v.text || '';

      const match = text.match(/^(.*?[.!?\u201d\u2019'])\s+([A-ZÀ-Ú][^.!?\n,;:]{3,65})$/);

      if (match) {
        const cleanScripture = match[1].trim();
        const nextTitle = match[2].trim();

        v.text = cleanScripture;
        currentVerses.push(v);

        newSections.push({
          title: currentTitle,
          verses: currentVerses
        });

        currentTitle = nextTitle;
        currentVerses = [];
      } else {
        currentVerses.push(v);
      }
    }

    if (currentVerses.length > 0) {
      newSections.push({
        title: currentTitle,
        verses: currentVerses
      });
    }

    result[chKey] = {
      ...chData,
      sections: newSections.length > 0 ? newSections : chData.sections
    };
  }

  return result;
}

export async function fetchBookData(bookIdOrName) {
  const bookId = normalizeBookId(bookIdOrName);
  
  if (bookCache[bookId]) {
    return bookCache[bookId];
  }

  // Lucas já está em memória no bundle
  if (bookId === 'lucas') {
    bookCache[bookId] = lucasData;
    return lucasData;
  }

  // Tentativas de URL para compatibilidade com Vercel, subpastas e ambientes locais
  const urlsToTry = [
    `/biblia/${bookId}.json`,
    `./biblia/${bookId}.json`,
    `biblia/${bookId}.json`
  ];

  let lastError = null;

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) continue;

      const text = await response.text();
      // Validar se o retorno é de fato JSON e não um fallback HTML de rewrite
      if (!text.trim().startsWith('{')) {
        continue;
      }

      const rawData = JSON.parse(text);
      const data = sanitizeBookData(rawData);
      bookCache[bookId] = data;
      return data;
    } catch (err) {
      lastError = err;
    }
  }

  console.warn(`Aviso: não foi possível carregar ${bookId} via rede. Usando fallback de visualização.`, lastError);
  
  // Se falhar a rede por qualquer motivo, retorna estrutura canônica para não travar a UI
  const bookInfo = BIBLE_BOOKS_STUDY_INFO.find(b => b.id === bookId) || { name: bookIdOrName, chapters: 1 };
  const fallbackData = {};
  for (let ch = 1; ch <= (bookInfo.chapters || 1); ch++) {
    fallbackData[String(ch)] = {
      book: bookInfo.name,
      chapter: String(ch),
      sections: [
        {
          title: `${bookInfo.name} ${ch}`,
          verses: [
            {
              number: 1,
              text: `Texto do capítulo ${ch} de ${bookInfo.name} da Nova Versão Transformadora (NVT).`,
              isJesusWords: false,
              crossReferences: []
            }
          ]
        }
      ]
    };
  }
  bookCache[bookId] = fallbackData;
  return fallbackData;
}
