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

  try {
    const response = await fetch(`/biblia/${bookId}.json`);
    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${bookId}: HTTP ${response.status}`);
    }
    const data = await response.json();
    bookCache[bookId] = data;
    return data;
  } catch (err) {
    console.error(`Erro ao buscar livro ${bookId}:`, err);
    // Se falhar e for Lucas, temos fallback
    if (bookId === 'lucas') return lucasData;
    throw err;
  }
}
