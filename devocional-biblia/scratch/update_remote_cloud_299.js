// Atualiza o cofre remoto na nuvem com 299 dias concluídos para o Rafael
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
import { cloudDbService } from '../src/services/cloudDbService.js';

const days = JSON.parse(readFileSync('./devocional-biblia/src/data/plano365.json', 'utf-8'));

// Popula os dias no storage mock
days.forEach(d => {
  if (d.completed) {
    storage.saveDayProgress(d.id, true, 'default');
  }
});

// Popula os capítulos lidos de Lucas 1 até Lucas 18
for (let ch = 1; ch <= 18; ch++) {
  storage.saveChapterProgress(`Lucas ${ch}`, true, 'default');
}

async function sendToCloud() {
  const payload = cloudDbService.createCloudPayload();
  payload.updatedAt = new Date().toISOString();
  console.log('Sending updated payload with 299 days completed to remote cloud...');

  const res = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a17d6ffa0427ae', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'devocional_sync_DEVOCIONAL-SYNC-RAFAEL',
      data: payload
    })
  });

  console.log('Cloud response status:', res.status);
  const data = await res.json();
  console.log('Remote cloud updated successfully at:', data.updatedAt);
}

sendToCloud();
