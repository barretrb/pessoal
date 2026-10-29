import fs from 'fs';

const joao = JSON.parse(fs.readFileSync('./devocional-biblia/public/biblia/joao.json', 'utf8'));

for (let c = 1; c <= 21; c++) {
  const ch = joao[String(c)];
  console.log(`\n=== JOÃO CAPÍTULO ${c} ===`);
  for (const s of ch.sections) {
    console.log(`Initial Section Title: "${s.title}"`);
    for (const v of s.verses) {
      // Check punctuation followed by possible subtitle
      // Patterns:
      // 1. Ends with a quote: ” Subtitle text
      // 2. Ends with period/exclamation/question: . Subtitle text
      const matchQuote = v.text.match(/^(.*?[.!?\u201d\u2019'])\s+([A-ZÀ-Ú][^.!?\n]+)$/);
      if (matchQuote) {
        const remaining = matchQuote[2].trim();
        // Check if remaining does not end in punctuation
        if (!/[.!?:]$/.test(remaining) && remaining.length > 3 && remaining.length < 80) {
          console.log(`  v${v.number} embedded title: [${remaining}]`);
          console.log(`    clean text: [${matchQuote[1]}]`);
        }
      }
    }
  }
}
