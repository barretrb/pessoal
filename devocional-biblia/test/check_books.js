import fs from 'fs';
import path from 'path';

const text = fs.readFileSync('devocional-biblia/src/data/bibleBooksStudyInfo.js', 'utf-8');
const idMatches = [...text.matchAll(/"id":\s*"([^"]+)"/g)].map(m => m[1]);
const nameMatches = [...text.matchAll(/"name":\s*"([^"]+)"/g)].map(m => m[1]);
const files = new Set(fs.readdirSync('devocional-biblia/public/biblia'));

console.log('Total de livros no StudyInfo:', idMatches.length);
console.log('Total de arquivos em public/biblia:', files.size);

const missing = [];
idMatches.forEach((id, idx) => {
  const fileName = `${id}.json`;
  if (!files.has(fileName)) {
    missing.push({ id, name: nameMatches[idx] });
  }
});

console.log('Livros faltando arquivo JSON:', missing);
