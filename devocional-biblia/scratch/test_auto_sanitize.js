import fs from 'fs';

// Let's test automatic section splitting on marcos.json and atos.json
function sanitizeBookData(bookData) {
  if (!bookData || typeof bookData !== 'object') return bookData;

  const result = {};

  for (const [chKey, chData] of Object.entries(bookData)) {
    if (!chData || !Array.isArray(chData.sections)) {
      result[chKey] = chData;
      continue;
    }

    // If chapter already has multiple sections, keep it unless verses have trailing titles
    const allVerses = chData.sections.flatMap(s => s.verses);
    if (!allVerses || allVerses.length === 0) {
      result[chKey] = chData;
      continue;
    }

    // Scan verses for embedded titles
    let newSections = [];
    let currentTitle = chData.sections[0]?.title || '';
    let currentVerses = [];

    for (let i = 0; i < allVerses.length; i++) {
      const v = { ...allVerses[i] };
      const text = v.text || '';

      // Pattern: ends with quotation/period followed by a Title (starts with capital, no trailing period/comma)
      // Example: '... dou testemunho de que ele é o Filho de Deus”. Os primeiros discípulos'
      // Example: '... onde João estava batizando. Jesus, o Cordeiro de Deus'
      const match = text.match(/^(.*?[.!?\u201d\u2019'])\s+([A-ZÀ-Ú][^.!?\n,;:]{3,65})$/);

      if (match) {
        const cleanScripture = match[1].trim();
        const nextTitle = match[2].trim();

        // Update current verse text to just scripture
        v.text = cleanScripture;
        currentVerses.push(v);

        // Close current section
        newSections.push({
          title: currentTitle,
          verses: currentVerses
        });

        // Start next section with the extracted title
        currentTitle = nextTitle;
        currentVerses = [];
      } else {
        currentVerses.push(v);
      }
    }

    // Push the final section
    if (currentVerses.length > 0) {
      newSections.push({
        title: currentTitle,
        verses: currentVerses
      });
    }

    result[chKey] = {
      ...chData,
      sections: newSections
    };
  }

  return result;
}

const marcos = JSON.parse(fs.readFileSync('./devocional-biblia/public/biblia/marcos.json', 'utf8'));
const sanitized = sanitizeBookData(marcos);
console.log('Marcos 1 sections before:', marcos['1'].sections.length);
console.log('Marcos 1 sections after:', sanitized['1'].sections.length);
sanitized['1'].sections.forEach(s => {
  console.log(`- [${s.title}] (${s.verses.length} verses): v${s.verses[0]?.number}..v${s.verses[s.verses.length-1]?.number}`);
});
