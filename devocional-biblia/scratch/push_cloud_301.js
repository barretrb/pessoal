class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new LocalStorageMock();

import { readFileSync } from 'fs';
import { storage } from '../src/services/storage.js';

// Preenche os dias 1 a 299
for (let d = 1; d <= 299; d++) {
  storage.saveDayProgress(d, true, 'default');
}
// Preenche os dias 300 e 301 como concluídos no celular do Rafael!
storage.saveDayProgress(300, true, 'default');
storage.saveDayProgress(301, true, 'default');

// Preenche capítulos de Lucas 1 até Lucas 24
for (let ch = 1; ch <= 24; ch++) {
  storage.saveChapterProgress(`Lucas ${ch}`, true, 'default');
}

const payload = {
  version: 2,
  familyCode: 'DEVOCIONAL-SYNC-RAFAEL',
  lastCompletedDay: 301,
  completedDaysSummary: '1-301',
  updatedAt: new Date().toISOString(),
  profiles: storage.getProfiles(),
  activeProfileId: 'default',
  progressByProfile: {
    default: JSON.parse(localStorage.getItem('devocional_plano_progress_v1_default') || '{}'),
    esposa: {}
  },
  chaptersByProfile: {
    default: JSON.parse(localStorage.getItem('devocional_chapters_progress_v1_default') || '{}'),
    esposa: {}
  },
  favoritesByProfile: { default: [], esposa: [] },
  highlightsByProfile: { default: {}, esposa: {} },
  layoutByProfile: { default: {}, esposa: {} }
};

console.log('Pushing payload to cloud with lastCompletedDay: 301...');
const res = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a17d801b0c27c6', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'devocional_sync_DEVOCIONAL-SYNC-RAFAEL',
    data: payload
  })
});

console.log('PUT response status:', res.status);
const resData = await res.json();
console.log('Updated remote cloud updatedAt:', resData.updatedAt);

// Verify with GET
const getRes = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a17d801b0c27c6');
const getData = await getRes.json();
console.log('GET Verified lastCompletedDay in Cloud:', getData.data.lastCompletedDay);
console.log('GET Verified Day 300 completed:', getData.data.progressByProfile.default['300']);
console.log('GET Verified Day 301 completed:', getData.data.progressByProfile.default['301']);
console.log('GET Verified Lucas 24 completed:', getData.data.chaptersByProfile.default['Lucas 24']);
