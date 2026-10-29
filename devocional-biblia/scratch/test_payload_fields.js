class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
globalThis.localStorage = new LocalStorageMock();

const { cloudDbService } = await import('../src/services/cloudDbService.js');
const fullPayload = cloudDbService.createCloudPayload();
delete fullPayload.completedDaysList;

const keys = Object.keys(fullPayload);
console.log('Testing remaining fields...');

let testObj = { lastCompletedDay: 301 };
for (const key of keys) {
  testObj[key] = fullPayload[key];
  const res = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a17d801b0c27c6', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'devocional_sync_DEVOCIONAL-SYNC-RAFAEL',
      data: testObj
    })
  });
  console.log(`With field "${key}" -> status: ${res.status}`);
  if (!res.ok) {
    console.log('FAILED on key:', key, 'Value:', JSON.stringify(fullPayload[key]).slice(0, 100));
    break;
  }
}
