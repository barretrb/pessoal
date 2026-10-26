// Suíte de Testes de Garantia de Qualidade (QA Test Suite)
// Executado no Node.js com node:test e node:assert

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock simples de localStorage para ambiente Node
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();

// Carregar plano365.json
const planoPath = resolve(__dirname, '../src/data/plano365.json');
const defaultDays = JSON.parse(readFileSync(planoPath, 'utf-8'));

// Importar módulo de storage
const { storage, DEFAULT_PROFILES, DEFAULT_DASHBOARD_LAYOUT } = await import('../src/services/storage.js');
const { cloudDbService } = await import('../src/services/cloudDbService.js');

test('QA Test 1: Restauração Integral do Histórico de Dias Concluídos do Rafael', () => {
  localStorage.clear();

  // Testar leitura de progresso para o Rafael ('default')
  const rafaelDays = storage.getProgress(defaultDays, 'default');
  
  // Deve ter exatamente 365 dias
  assert.equal(rafaelDays.length, 365, 'O plano deve ter 365 dias');

  // Dias 1 até 296 devem estar CONCLUÍDOS (completed: true)
  const completedCount = rafaelDays.filter(d => d.completed).length;
  assert.ok(completedCount >= 296, `Rafael deve ter no mínimo 296 dias concluídos. Encontrado: ${completedCount}`);

  // Dia 298 (ontem) deve estar pendente (completed: false)
  const day298 = rafaelDays.find(d => d.id === 298);
  assert.equal(day298.completed, false, 'Dia 298 deve ser pendente');

  // Dia 1 deve estar concluído
  const day1 = rafaelDays.find(d => d.id === 1);
  assert.equal(day1.completed, true, 'Dia 1 deve estar concluído');

  // Dia 296 deve estar concluído
  const day296 = rafaelDays.find(d => d.id === 296);
  assert.equal(day296.completed, true, 'Dia 296 deve estar concluído');

  console.log(`✓ QA Test 1 Aprovado: Histórico restaurado com ${completedCount}/365 dias concluídos.`);
});

test('QA Test 2: Segurança & Gerenciamento de Contas (Rafael Admin com Proteção por PIN)', () => {
  localStorage.clear();

  const profiles = storage.getProfiles();
  const rafael = profiles.find(p => p.id === 'default');
  const esposa = profiles.find(p => p.id === 'esposa');

  // Rafael deve ser Administrador
  assert.equal(rafael.role, 'admin', 'Rafael deve ser admin');
  assert.equal(rafael.requiresPin, true, 'Rafael deve exigir PIN para segurança');
  assert.equal(rafael.pin, '1234', 'PIN inicial de fábrica do Rafael deve ser 1234');

  // Esposa deve ser Membro
  assert.equal(esposa.role, 'member', 'Esposa deve ser membro');
  assert.equal(esposa.requiresPin, false, 'Esposa não requer PIN');

  // Tentativa de invasão com PIN incorreto
  assert.equal(storage.verifyProfilePin('default', '0000'), false, 'PIN incorreto deve ser rejeitado');
  assert.equal(storage.verifyProfilePin('default', '9999'), false, 'PIN incorreto deve ser rejeitado');
  assert.equal(storage.verifyProfilePin('default', '1234'), true, 'PIN correto deve ser aceito');

  // Alteração de PIN pelo Rafael
  storage.updateAdminPin('5678');
  assert.equal(storage.verifyProfilePin('default', '5678'), true, 'Novo PIN deve ser válido');
  assert.equal(storage.verifyProfilePin('default', '1234'), false, 'PIN antigo deve ser invalidado');

  console.log('✓ QA Test 2 Aprovado: Controle de acesso e proteção por PIN validados com sucesso.');
});

test('QA Test 3: Isolamento Absoluto de Dados entre Perfis (Rafael vs Esposa)', () => {
  localStorage.clear();

  // 1. Marcar capítulo no perfil da Esposa
  storage.saveChapterProgress('Lucas 1', true, 'esposa');
  storage.saveDayProgress(1, true, 'esposa');

  // 2. Marcar capítulo diferente no Rafael
  storage.saveChapterProgress('Lucas 24', true, 'default');

  // 3. Verificar isolamento de capítulos
  const esposaChapters = storage.getChapterProgress('esposa');
  const rafaelChapters = storage.getChapterProgress('default');

  assert.equal(!!esposaChapters['Lucas 1']?.completed, true, 'Lucas 1 deve estar lido pela Esposa');
  assert.equal(!!esposaChapters['Lucas 24']?.completed, false, 'Lucas 24 NÃO deve estar lido pela Esposa');

  assert.equal(!!rafaelChapters['Lucas 24']?.completed, true, 'Lucas 24 deve estar lido pelo Rafael');

  // 4. Testar favoritos isolados
  storage.toggleFavorite('Lucas 1:1', { text: 'Muitos se dedicaram...' }, 'default');
  storage.toggleFavorite('Salmos 23:1', { text: 'O Senhor é o meu pastor...' }, 'esposa');

  const rafaelFavs = storage.getFavorites('default');
  const esposaFavs = storage.getFavorites('esposa');

  assert.ok(rafaelFavs.some(f => f.key === 'Lucas 1:1'), 'Lucas 1:1 deve estar nos favoritos do Rafael');
  assert.ok(!rafaelFavs.some(f => f.key === 'Salmos 23:1'), 'Salmos 23:1 NÃO deve estar nos favoritos do Rafael');

  assert.ok(esposaFavs.some(f => f.key === 'Salmos 23:1'), 'Salmos 23:1 deve estar nos favoritos da Esposa');
  assert.ok(!esposaFavs.some(f => f.key === 'Lucas 1:1'), 'Lucas 1:1 NÃO deve estar nos favoritos da Esposa');

  console.log('✓ QA Test 3 Aprovado: Dados de capítulos e favoritos totalmente isolados entre contas.');
});

test('QA Test 4: Personalização e Persistência do Layout do Dashboard', () => {
  localStorage.clear();

  const initialLayout = storage.getDashboardLayout('default');
  assert.deepEqual(initialLayout.order, DEFAULT_DASHBOARD_LAYOUT.order, 'Layout padrão deve vir pré-carregado');

  // Reordenar caixas (colocar Música no topo)
  const newOrder = ['music', 'todayPending', 'calendar', 'studyBanner', 'video'];
  const newLayout = {
    order: newOrder,
    hidden: { video: true }, // Ocultar vídeo do BibleProject
    collapsed: { music: true } // Recolher música
  };

  storage.saveDashboardLayout(newLayout, 'default');

  // Recarregar layout do storage
  const loaded = storage.getDashboardLayout('default');
  assert.deepEqual(loaded.order, newOrder, 'A ordem reordenada deve ser preservada');
  assert.equal(loaded.hidden.video, true, 'Ocultação deve ser preservada');
  assert.equal(loaded.collapsed.music, true, 'Estado de colapso deve ser preservado');

  console.log('✓ QA Test 4 Aprovado: Reordenação, colapso e ocultação de caixas persistidos com fidelidade.');
});

test('QA Test 5: Banco de Dados em Nuvem & Sincronização Multi-Aparelho', async () => {
  localStorage.clear();

  // Configurar dados prévios
  storage.saveDayProgress(10, true, 'default');
  storage.saveChapterProgress('Lucas 10', true, 'default');
  storage.toggleFavorite('Lucas 10:2', { text: 'A colheita é grande...' }, 'default');

  // Criar pacote para nuvem
  const payload = cloudDbService.createCloudPayload();
  assert.equal(payload.familyCode, 'FAMILIA-BARRETO', 'Código da família deve ser preservado');
  assert.ok(payload.progressByProfile['default'], 'Progresso do Rafael deve estar presente no payload');

  // Simular recebimento do payload em outro aparelho vazio
  localStorage.clear();
  const applied = cloudDbService.applyCloudPayload(payload);
  assert.equal(applied, true, 'Aplicação de dados da nuvem deve ter sucesso');

  // Conferir se os dados foram restaurados no novo aparelho
  const restoredChapters = storage.getChapterProgress('default');
  assert.equal(!!restoredChapters['Lucas 10']?.completed, true, 'Lucas 10 deve estar restaurado no novo aparelho');

  console.log('✓ QA Test 5 Aprovado: Sincronização em nuvem e exportação multi-aparelho verificada.');
});
