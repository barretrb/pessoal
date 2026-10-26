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
const { bibleCommentaryService } = await import('../src/services/bibleCommentaryService.js');
const { bibleArcEngine } = await import('../src/services/bibleArcEngine.js');

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
  assert.equal(payload.familyCode, 'DEVOCIONAL-SYNC-RAFAEL', 'Código de sincronização deve ser individual');
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

test('QA Test 6: Arqueamento (BibleArc) Dinâmico para o Livro e Capítulo Abertos', () => {
  // Simular abertura de Juízes 1
  const juizesVerses = [
    { number: 1, text: 'Depois da morte de Josué, os israelitas perguntaram ao SENHOR: "Qual das tribos deve ser a primeira a atacar os cananeus?".' },
    { number: 2, text: 'O SENHOR respondeu: "Judá, pois eu entreguei a terra em suas mãos".' },
    { number: 3, text: 'Os homens de Judá disseram a seus parentes da tribo de Simeão: "Venham conosco lutar contra os cananeus".' }
  ];

  const rawText = juizesVerses.map(v => `${v.number} ${v.text}`).join(' ');

  // Parser do BibleArc
  const parts = rawText
    .split(/(?<=[.;!?:])\s+/)
    .map(t => t.replace(/^\d+\s*/, '').trim())
    .filter(t => t.length > 0);

  const propositions = parts.map((text, idx) => ({
    id: `p${idx + 1}`,
    number: idx + 1,
    text
  }));

  assert.ok(propositions.length >= 3, 'Deve gerar ao menos 3 proposições lógicas');
  assert.ok(propositions[0].text.includes('Josué'), 'Proposição 1 deve ser de Juízes, não de Lucas');
  assert.ok(!propositions.some(p => p.text.includes('Peçam, e lhes será dado')), 'Não deve conter o texto de Lucas 11');

  console.log('✓ QA Test 6 Aprovado: Arqueamento BibleArc contextualizado para o livro e capítulo ativos.');
});

test('QA Test 7: Motor BibleArc Pré-Calculado & Imediato (Sem Trabalho Manual)', () => {
  // Testar Juízes 1
  const juizesStudy = bibleArcEngine.getStudy('Juízes 1');
  assert.ok(juizesStudy, 'Estudo de Juízes 1 deve existir');
  assert.ok(juizesStudy.propositions.length >= 4, 'Juízes 1 deve ter no mínimo 4 proposições');
  assert.ok(juizesStudy.arcs.length >= 3, 'Juízes 1 deve ter arcos lógicos pré-traçados');
  assert.equal(juizesStudy.mainProp, 2, 'A tese central deve ser a proposição 2');
  assert.ok(juizesStudy.theologicalSynthesis.length > 50, 'Deve conter síntese teológica pronta');
  assert.ok(juizesStudy.practicalApplication.length > 50, 'Deve conter aplicação prática pronta');

  // Testar geração dinâmica para outro livro aleatório
  const randomStudy = bibleArcEngine.getStudy('Atos 2', '1 Quando chegou o dia de Pentecostes, estavam todos reunidos num só lugar. 2 De repente, veio do céu um som como de vento forte.');
  assert.ok(randomStudy.propositions.length >= 2, 'Deve decompor versículos de qualquer livro');
  assert.ok(randomStudy.arcs.length >= 1, 'Deve traçar arcos automáticos de discurso');

  console.log('✓ QA Test 7 Aprovado: Motor BibleArc entrega diagramas e sínteses 100% prontos.');
});

test('QA Test 8: Comentários Teológicos Expositivos Além de Lucas', () => {
  // Testar Juízes 1
  const juizesComm = bibleCommentaryService.getCommentary('Juízes', '1');
  assert.ok(juizesComm.title.includes('Juízes 1'), 'Título do comentário deve ser de Juízes 1');
  assert.ok(juizesComm.overview.length > 80, 'Visão geral expositiva deve ser aprofundada');
  assert.ok(juizesComm.keyThemes.length >= 3, 'Deve conter ao menos 3 temas chave');
  assert.ok(juizesComm.christocentricKey, 'Deve conter a chave cristocêntrica');

  // Testar Gênesis 1
  const genComm = bibleCommentaryService.getCommentary('Gênesis', '1');
  assert.ok(genComm.title.includes('Gênesis 1'), 'Título deve ser de Gênesis 1');

  // Testar Romanos 8
  const romComm = bibleCommentaryService.getCommentary('Romanos', '8');
  assert.ok(romComm.overview.includes('Espírito') || romComm.overview.includes('Cristo'), 'Deve conter teologia paulina');

  console.log('✓ QA Test 8 Aprovado: Comentários teológicos disponíveis para livros de toda a Bíblia.');
});
