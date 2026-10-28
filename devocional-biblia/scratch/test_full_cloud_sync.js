class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new LocalStorageMock();

import { cloudDbService } from '../src/services/cloudDbService.js';

async function testFullSync() {
  const payload = cloudDbService.createCloudPayload();
  payload.updatedAt = new Date().toISOString();
  payload.daysCompletedCount = 296;

  const objId = 'ff808181a09d98f701a17d6ffa0427ae';
  console.log('Sending full payload to cloud...');
  
  const putRes = await fetch(`https://api.restful-api.dev/objects/${objId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'devocional_sync_DEVOCIONAL-SYNC-RAFAEL',
      data: payload
    })
  });
  
  const putData = await putRes.json();
  console.log('Cloud PUT status:', putRes.status, 'updatedAt:', putData.updatedAt);

  console.log('Fetching from cloud...');
  const getRes = await fetch(`https://api.restful-api.dev/objects/${objId}`);
  const getData = await getRes.json();
  console.log('Cloud GET received payload familyCode:', getData.data.familyCode, 'updatedAt:', getData.data.updatedAt);
}

testFullSync();
