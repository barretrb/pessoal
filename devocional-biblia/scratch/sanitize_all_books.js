import fs from 'fs';
import path from 'path';

const dir = './devocional-biblia/public/biblia';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

function sanitizeBookData(bookData) {
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

    // Check if there are any embedded title patterns
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

let count = 0;
for (const file of files) {
  // We already curated joao.json with precision, skip or process carefully
  if (file === 'joao.json' || file === 'lucas.json') continue;

  const fullPath = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const sanitized = sanitizeBookData(data);
  fs.writeFileSync(fullPath, JSON.stringify(sanitized, null, 2), 'utf8');
  count++;
}

console.log(`Successfully sanitized ${count} bible books in ${dir}!`);
