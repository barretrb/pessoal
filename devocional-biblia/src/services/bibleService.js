import lucasData from '../data/lucas_nvt.json';
import { BIBLE_BOOKS_STUDY_INFO } from '../data/bibleBooksStudyInfo';

// Cache em memória de livros já carregados
const bookCache = {
  lucas: lucasData
};

export function normalizeBookId(nameOrId) {
  if (!nameOrId) return 'lucas';
  const clean = nameOrId
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '')
    .trim();

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

      const data = JSON.parse(text);
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
