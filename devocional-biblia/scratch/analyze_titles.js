import fs from 'fs';

const joaoPath = './devocional-biblia/public/biblia/joao.json';
const data = JSON.parse(fs.readFileSync(joaoPath, 'utf8'));

console.log('=== FINDING EMBEDDED TITLES IN JOAO ===');
for (const [ch, cData] of Object.entries(data)) {
  for (const s of cData.sections) {
    for (const v of s.verses) {
      const text = v.text;
      const matches = text.match(/([.!?\u201d\u2019'])\s+([A-ZÀ-Ú][^.!?\n]+)$/);
      if (matches) {
        const possibleTitle = matches[2].trim();
        if (!possibleTitle.endsWith('.') && !possibleTitle.endsWith('!') && !possibleTitle.endsWith('?') && !possibleTitle.endsWith(';') && possibleTitle.length > 3 && possibleTitle.length < 80) {
          console.log(`Ch ${ch} V ${v.number}: "${possibleTitle}"`);
        }
      }
    }
  }
}
