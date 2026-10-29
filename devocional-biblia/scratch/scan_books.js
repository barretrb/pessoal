import fs from 'fs';
import path from 'path';

const dir = './devocional-biblia/public/biblia';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

console.log(`Checking ${files.length} books in ${dir}...`);

let totalFound = 0;
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  let inBook = 0;
  for (const ch of Object.values(data)) {
    for (const s of ch.sections) {
      for (const v of s.verses) {
        if (!v.text) continue;
        // Check for quotation mark followed by Capital letter without punctuation before capital
        if (/[”"']\s+[A-ZÀ-Ú]/.test(v.text) || /[.!?]\s+[A-ZÀ-Ú][^.!?]+$/.test(v.text)) {
          inBook++;
        }
      }
    }
  }
  if (inBook > 0) {
    console.log(`${file}: ${inBook} possible embedded titles`);
    totalFound++;
  }
}
console.log(`Summary: ${totalFound} books have embedded title patterns.`);
