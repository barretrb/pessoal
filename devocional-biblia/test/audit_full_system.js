import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const planoPath = path.resolve(__dirname, '../src/data/plano365.json');
const bibliaDir = path.resolve(__dirname, '../public/biblia');

const plano = JSON.parse(fs.readFileSync(planoPath, 'utf8'));

// Import normalizeBookId and parseReading
import { normalizeBookId, parseReading } from '../src/services/bibleService.js';
import { cloudDbService } from '../src/services/cloudDbService.js';
import { storage } from '../src/services/storage.js';

console.log('====================================================');
console.log('AUDITORIA PROFUNDA DE SISTEMA & INTEGRIDADE (CI/QA)');
console.log('====================================================\n');

// 1. AUDITORIA DOS 365 DIAS DO PLANO DEVOCIONAL
console.log('1. Auditando todos os 365 dias do Plano Devocional...');
let totalReadings = 0;
let missingBooks = [];
let missingChapters = [];
let booksUsedInPlan = new Set();

for (const day of plano) {
  if (!day.readings || day.readings.length === 0) {
    console.error(`[ERRO] Dia ${day.id} não possui readings cadastradas.`);
  }

  for (const reading of day.readings) {
    totalReadings++;
    const { book, chapter } = parseReading(reading);
    booksUsedInPlan.add(book);
    const bookId = normalizeBookId(book);
    const filePath = path.join(bibliaDir, `${bookId}.json`);

    if (!fs.existsSync(filePath)) {
      missingBooks.push({ day: day.id, reading, bookId, filePath });
      continue;
    }

    try {
      const bookData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const chapterData = bookData[String(chapter)];

      if (!chapterData) {
        missingChapters.push({ day: day.id, reading, book, chapter });
      } else {
        const verses = chapterData.sections?.flatMap(s => s.verses) || [];
        if (verses.length === 0) {
          missingChapters.push({ day: day.id, reading, reason: 'zero verses' });
        }
      }
    } catch (e) {
      missingBooks.push({ day: day.id, reading, error: e.message });
    }
  }
}

console.log(`- Total de leituras auditadas no plano: ${totalReadings}`);
console.log(`- Livros bíblicos demandados pelo plano: ${booksUsedInPlan.size}`);
console.log(`- Leituras com livros ausentes: ${missingBooks.length}`);
console.log(`- Leituras com capítulos ausentes/vazios: ${missingChapters.length}`);

if (missingBooks.length > 0) {
  console.error('Livros ausentes:', missingBooks.slice(0, 5));
}
if (missingChapters.length > 0) {
  console.error('Capítulos ausentes:', missingChapters.slice(0, 5));
}

// 2. AUDITORIA DE VERSÍCULOS E SUBTÍTULOS EM TODOS OS 66 LIVROS
console.log('\n2. Auditando anomalias de texto e subtítulos em todos os 66 livros da Bíblia...');
const allBookFiles = fs.readdirSync(bibliaDir).filter(f => f.endsWith('.json'));
let suspiciousVerses = [];
let totalVersesScanned = 0;

for (const file of allBookFiles) {
  const content = JSON.parse(fs.readFileSync(path.join(bibliaDir, file), 'utf8'));
  for (const [chNum, chData] of Object.entries(content)) {
    if (!chData.sections) continue;
    for (const section of chData.sections) {
      for (const v of section.verses) {
        totalVersesScanned++;
        const text = v.text || '';
        // Procura anomalia de títulos concatenados no final do versículo
        if (/[”"']\s+[A-ZÀ-Ú][^.!?\n,;:]{4,60}$/.test(text)) {
          suspiciousVerses.push({ file, ch: chNum, v: v.number, text });
        }
      }
    }
  }
}

console.log(`- Total de versículos bíblicos escaneados: ${totalVersesScanned}`);
console.log(`- Versículos com possíveis títulos embutidos não-desacoplados: ${suspiciousVerses.length}`);
if (suspiciousVerses.length > 0) {
  console.warn('Exemplos de versículos com subtítulos suspeitos:', suspiciousVerses.slice(0, 5));
}

// 3. AUDITORIA DO TAMANHO DO PAYLOAD DA NUVEM (RESTRIÇÃO < 1000 BYTES)
console.log('\n3. Auditando contrato de rede e limite de bytes da Nuvem...');
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new LocalStorageMock();

// Simular estado de 301 dias concluídos
for (let d = 1; d <= 301; d++) storage.saveDayProgress(d, true, 'default');
for (let ch = 1; ch <= 24; ch++) storage.saveChapterProgress(`Lucas ${ch}`, true, 'default');

const payload = cloudDbService.createCloudPayload();
const payloadString = JSON.stringify({ name: 'devocional_sync_DEVOCIONAL-SYNC-RAFAEL', data: payload });
const byteLength = Buffer.byteLength(payloadString);
console.log(`- Tamanho real do payload de sincronização: ${byteLength} bytes (Limite máximo permitido: 1000 bytes)`);
if (byteLength > 900) {
  console.error(`[ALERTA DE RISCO] Payload com ${byteLength} bytes está muito próximo ou acima do limite!`);
} else {
  console.log(`- Conformidade com a API REST: 100% OK (${byteLength} < 900 bytes)`);
}

// 4. AUDITORIA DE TRANSIÇÕES DE LIVROS NO PLANO DEVOCIONAL
console.log('\n4. Auditando pontos de transição de livros ao longo do ano...');
const transitions = [];
for (let i = 1; i < plano.length; i++) {
  const prevBook = parseReading(plano[i - 1].readings[0]).book;
  const currBook = parseReading(plano[i].readings[0]).book;
  if (prevBook !== currBook) {
    transitions.push({ day: plano[i].id, from: prevBook, to: currBook });
  }
}
console.log(`- Total de pontos de transição entre livros bíblicos no plano: ${transitions.length}`);
console.log('Exemplos de transição:', transitions.slice(0, 6));

console.log('\n====================================================');
console.log('RESUMO DA AUDITORIA:');
if (missingBooks.length === 0 && missingChapters.length === 0 && suspiciousVerses.length === 0 && byteLength < 900) {
  console.log('✓ SISTEMA 100% AUDITADO E CONFORME: Zero falhas estruturais detectadas!');
} else {
  console.error('⚠ PONTOS DE ATENÇÃO DETECTADOS!');
}
console.log('====================================================\n');
