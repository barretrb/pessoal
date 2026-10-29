class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new LocalStorageMock();

import { cloudDbService } from '../src/services/cloudDbService.js';
import { storage } from '../src/services/storage.js';

// Setup progress with Day 300 and 301 completed
storage.saveDayProgress(300, true, 'default');
storage.saveDayProgress(301, true, 'default');

const payload = cloudDbService.createCloudPayload();
console.log('Payload summary:');
console.log('lastCompletedDay in payload:', payload.lastCompletedDay);
console.log('default progress:', payload.progressByProfile.default);
const str = JSON.stringify({ data: payload });
console.log('Size in bytes:', Buffer.byteLength(str));

const res = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a17d801b0c27c6', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: str
});
console.log('PATCH status:', res.status);
const resText = await res.text();
console.log('Response body:', resText);
