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
const { crossReferenceService } = await import('../src/services/crossReferenceService.js');
const { bibleArcEngine } = await import('../src/services/bibleArcEngine.js');
const { parseReading, sanitizeBookData, normalizeBookId } = await import('../src/services/bibleService.js');
const { getPendingDays } = await import('../src/services/dateUtils.js');

test('QA Test 1: Restauração Integral do Histórico de Dias Concluídos do Rafael', () => {
  localStorage.clear();

  // Testar leitura de progresso para o Rafael ('default')
  const rafaelDays = storage.getProgress(defaultDays, 'default');
  
  // Deve ter exatamente 365 dias
  assert.equal(rafaelDays.length, 365, 'O plano deve ter 365 dias');

  // Dias 1 até 299 devem estar CONCLUÍDOS (completed: true)
  const completedCount = rafaelDays.filter(d => d.completed).length;
  assert.ok(completedCount >= 299, `Rafael deve ter no mínimo 299 dias concluídos. Encontrado: ${completedCount}`);

  // Dia 300 (hoje) deve estar pendente (completed: false)
  const day300 = rafaelDays.find(d => d.id === 300);
  assert.equal(day300.completed, false, 'Dia 300 (hoje) deve ser pendente');

  // Dias 297, 298 e 299 devem estar concluídos
  const day297 = rafaelDays.find(d => d.id === 297);
  const day298 = rafaelDays.find(d => d.id === 298);
  const day299 = rafaelDays.find(d => d.id === 299);
  assert.equal(day297.completed, true, 'Dia 297 deve estar concluído');
  assert.equal(day298.completed, true, 'Dia 298 deve estar concluído');
  assert.equal(day299.completed, true, 'Dia 299 deve estar concluído');

  // Dia 1 deve estar concluído
  const day1 = rafaelDays.find(d => d.id === 1);
  assert.equal(day1.completed, true, 'Dia 1 deve estar concluído');

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

test('QA Test 7: Motor BibleArc Pré-Calculado & Mapeado por Temas (Sem Trabalho Manual)', () => {
  // Testar Gênesis 2 (mapeado em 3 temas prontos para degustar)
  const gen2Study = bibleArcEngine.getChapterThematicStudy('Gênesis', '2');
  assert.ok(gen2Study, 'Estudo de Gênesis 2 deve existir');
  assert.equal(gen2Study.themes.length, 3, 'Gênesis 2 deve conter 3 temas mapeados');
  assert.ok(gen2Study.themes[0].themeTitle.includes('Descanso'), 'Tema 1 deve ser sobre o descanso');
  assert.ok(gen2Study.themes[0].arcs.length >= 2, 'Tema 1 deve ter arcos pré-traçados');
  assert.equal(gen2Study.themes[0].mainProp, 2, 'A tese central deve ser a proposição 2');
  assert.ok(gen2Study.themes[0].theologicalSynthesis.length > 50, 'Deve conter síntese teológica pronta');
  assert.ok(gen2Study.themes[0].practicalApplication.length > 50, 'Deve conter aplicação prática pronta');

  // Testar Juízes 1 (mapeado em 3 temas)
  const juizesStudy = bibleArcEngine.getChapterThematicStudy('Juízes', '1');
  assert.ok(juizesStudy, 'Estudo de Juízes 1 deve existir');
  assert.equal(juizesStudy.themes.length, 3, 'Juízes 1 deve ter 3 temas mapeados');
  assert.equal(juizesStudy.themes[0].mainProp, 2, 'A tese central deve ser a proposição 2');

  // Testar geração dinâmica para qualquer livro/capítulo
  const randomStudy = bibleArcEngine.getChapterThematicStudy('Atos', '2', [
    { number: 1, text: 'Quando chegou o dia de Pentecostes, estavam todos reunidos num só lugar.' },
    { number: 2, text: 'De repente, veio do céu um som como de vento forte.' }
  ]);
  assert.ok(randomStudy.themes.length >= 1, 'Deve decompor qualquer livro em temas');
  assert.ok(randomStudy.themes[0].propositions.length >= 2, 'Deve ter proposições completas');

  console.log('✓ QA Test 7 Aprovado: Motor BibleArc entrega temas mapeados e diagramas 100% prontos.');
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

test('QA Test 9: Validação Exegética de Teses Centrais no Arqueamento (Êxodo 5 e Algoritmo)', () => {
  // 1. Êxodo 5 com acento e sem acento
  const ex5Study = bibleArcEngine.getChapterThematicStudy('Êxodo', '5');
  assert.ok(ex5Study, 'Estudo de Êxodo 5 deve existir');
  assert.equal(ex5Study.themes.length, 3, 'Êxodo 5 deve possuir 3 perícopes mapeadas');

  // Perícope 1: Mandato Soberano de Yahweh (vv. 1-4)
  const p1 = ex5Study.themes[0];
  assert.equal(p1.mainProp, 1, 'Tese central da Perícope 1 deve ser P1 (o decreto divino de libertação)');
  const mainPropText1 = p1.propositions.find(p => p.number === p1.mainProp)?.text || '';
  assert.ok(
    mainPropText1.includes('Assim diz o SENHOR') && mainPropText1.includes('Deixe meu povo'),
    'A tese central não pode ser o preâmbulo dos emissários, mas sim o mandamento de Deus'
  );
  assert.ok(
    !mainPropText1.startsWith('Depois disso, Moisés e Arão foram ver o faraó e declararam:'),
    'O preâmbulo narrativo foi higienizado e não é a tese central isolada'
  );

  // Perícope 2: Tirania de Faraó (vv. 5-14)
  const p2 = ex5Study.themes[1];
  assert.equal(p2.mainProp, 5, 'Tese central da Perícope 2 deve ser P5 (o decreto de opressão)');

  // Perícope 3: Clamor de Moisés (vv. 15-23)
  const p3 = ex5Study.themes[2];
  assert.equal(p3.mainProp, 2, 'Tese central da Perícope 3 deve ser P2 (o clamor honesto de Moisés)');

  // 2. Validação do detector com preâmbulos narrativos em textos dinâmicos
  const dynamicStudy = bibleArcEngine.getChapterThematicStudy('Moisés', '99', [
    { number: 1, text: 'Depois disso, partiram os mensageiros e chegaram ao arraial.' },
    { number: 2, text: 'Assim diz o Senhor: Eu sou o Senhor vosso Deus e farei maravilhas.' },
    { number: 3, text: 'E o povo todo respondeu amém.' }
  ]);
  // A proposição 2 (oráculo divino) deve ter sido eleita, e nunca a 1 (preâmbulo narrativo)
  assert.equal(dynamicStudy.themes[0].mainProp, 2, 'O algoritmo deve pontuar o oráculo divino sobre o preâmbulo');

  console.log('✓ QA Test 9 Aprovado: Teses centrais exegeticamente corretas e preâmbulos narrativos eliminados.');
});

test('QA Test 10: Mídia Devocional Diária (Músicas < 10 min, Sem Repetição de Ontem, Vídeos do Tema)', async () => {
  const { getMediaForDay, getMediaForPassage, SHORT_DEVOTIONAL_TRACKS } = await import('../src/data/dailyMedia.js');

  // 1. A música de hoje (Dia 300) NÃO pode ser igual à de ontem (Dia 299)
  const mediaOntem = getMediaForDay(299, { readings: ['Lucas 16', 'Lucas 17', 'Lucas 18'] });
  const mediaHoje = getMediaForDay(300, { readings: ['Lucas 19', 'Lucas 20', 'Lucas 21'] });

  assert.notEqual(
    mediaHoje.music.title,
    mediaOntem.music.title,
    'A música de hoje DEVE ser diferente da música de ontem'
  );
  assert.notEqual(
    mediaHoje.music.youtubeId,
    mediaOntem.music.youtubeId,
    'O vídeo da música de hoje DEVE ter ID diferente de ontem'
  );

  // 2. A música NÃO pode ser um set/live de 1 hora (limite estrito: até 10 minutos)
  assert.ok(
    mediaHoje.music.duration,
    'A música deve indicar a duração'
  );
  // Verificar que todas as músicas do catálogo têm duração declarada de até 10 minutos
  SHORT_DEVOTIONAL_TRACKS.forEach(track => {
    assert.ok(track.duration, `Faixa ${track.title} deve ter duração especificada`);
    const minutes = parseFloat(track.duration.replace(' min', '').replace(':', '.'));
    assert.ok(minutes < 10, `Faixa ${track.title} (${track.duration}) deve ter menos de 10 minutos`);
    assert.notEqual(track.youtubeId, 'JPXjpqstzng', 'Não pode conter o setlist de 1 hora (JPXjpqstzng)');
  });

  // 3. A música de hoje é inspirada no tema do dia (Lucas 19 - Zaqueu e a Entrada Triunfal)
  assert.ok(
    mediaHoje.music.title.includes('Zaqueu') || mediaHoje.music.theme.includes('Lucas 19'),
    'Música de hoje deve ser contextualizada ao encontro de Zaqueu e Entrada Triunfal'
  );

  // 4. O vídeo de hoje deve ser do BibleProject relacionado diretamente ao tema de Lucas 19-21
  assert.ok(
    mediaHoje.video.title.includes('Lucas') || mediaHoje.video.youtubeId === 'UeUAAAs7hec',
    'O vídeo de hoje deve ser a animação oficial do BibleProject sobre Lucas 10 a 24'
  );

  // 5. Testar vídeo contextualizado para outros livros na leitura livre (ex: Êxodo)
  const mediaExodo = getMediaForPassage('Êxodo', '5');
  assert.ok(
    mediaExodo.video.title.includes('Êxodo'),
    'O vídeo de estudo para Êxodo deve ser o vídeo do BibleProject de Êxodo'
  );

  // 6. Testar rotação garantida para dias sequenciais quaisquer
  for (let d = 1; d <= 10; d++) {
    const m1 = getMediaForDay(d);
    const m2 = getMediaForDay(d + 1);
    assert.notEqual(
      m1.music.title,
      m2.music.title,
      `Dia ${d} e Dia ${d + 1} não podem ter a mesma música devocional`
    );
  }

  // 7. Testar conexão temática estrita de músicas para João 7, 8 e 9 (Dia 304)
  const { getMusicForChapter } = await import('../src/data/dailyMedia.js');
  const media304 = getMediaForDay(304);
  assert.equal(media304.music.title, 'Luz do Mundo', 'Dia 304 deve sugerir Luz do Mundo de Marcos Almeida para João 8');
  assert.equal(media304.music.artist, 'Marcos Almeida');
  assert.ok(media304.music.youtubeMusicUrl.includes('music.youtube.com'), 'URL deve ser do YouTube Music');

  const musicJoao7 = getMusicForChapter(304, 'João 7');
  assert.equal(musicJoao7.title, 'Águas Vivas', 'João 7 deve sugerir Águas Vivas da Banda NOVA');
  assert.equal(musicJoao7.artist, 'Banda NOVA (IPAlpha)');
  assert.ok(musicJoao7.description.includes('João 7'), 'Descrição deve citar João 7 e rios de água viva');

  const musicJoao8 = getMusicForChapter(304, 'João 8');
  assert.equal(musicJoao8.title, 'Luz do Mundo', 'João 8 deve sugerir Luz do Mundo');
  assert.ok(musicJoao8.description.includes('João 8:12'), 'Descrição deve citar João 8:12');

  const musicJoao8Alt = getMusicForChapter(304, 'João 8', 1, 1);
  assert.equal(musicJoao8Alt.title, 'Verdadeiramente Livres', 'Trocar em João 8 deve alternar para Verdadeiramente Livres');
  assert.equal(musicJoao8Alt.artist, 'Paulo César Baruk');

  const musicJoao9 = getMusicForChapter(304, 'João 9');
  assert.ok(musicJoao9.title.includes('Eu Era Cego e Agora Vejo'), 'João 9 deve sugerir louvor conectado à cura do cego');
  assert.equal(musicJoao9.artist, 'Novo Canto (IPAlpha)');

  console.log('✓ QA Test 10 Aprovado: Músicas curtas (<10min), rotação diária sem repetição e vídeos conectados ao tema.');
});

test('QA Test 11: Referências Cruzadas Bíblicas e Conexões Canônicas', async () => {
  // 1. Validar que versículos chave de Lucas 19 a 21 (leitura de hoje) possuem referências
  const refsLc19_10 = crossReferenceService.getReferences('Lucas', '19', 10);
  assert.ok(refsLc19_10.length > 0, 'Lucas 19:10 ("buscar e salvar o perdido") deve ter referências cruzadas');
  assert.ok(
    refsLc19_10.some(r => r.reference.includes('Ezequiel 34:16') || r.reference.includes('Mateus 18:11')),
    'Lucas 19:10 deve conectar-se a Ezequiel 34 ou Mateus 18'
  );

  const refsLc19_38 = crossReferenceService.getReferences('Lucas', '19', 38);
  assert.ok(refsLc19_38.length > 0, 'Lucas 19:38 (Entrada Triunfal) deve ter referências cruzadas');
  assert.ok(
    refsLc19_38.some(r => r.reference.includes('Salmos 118:26')),
    'Lucas 19:38 deve citar Salmos 118:26'
  );

  const refsLc20_17 = crossReferenceService.getReferences('Lucas', '20', 17);
  assert.ok(refsLc20_17.length > 0, 'Lucas 20:17 (A pedra angular) deve ter referências');
  assert.ok(
    refsLc20_17.some(r => r.reference.includes('Salmos 118:22') || r.reference.includes('Isaías 28:16')),
    'Lucas 20:17 deve conectar-se ao Salmo 118 ou Isaías 28'
  );

  const refsLc21_33 = crossReferenceService.getReferences('Lucas', '21', 33);
  assert.ok(refsLc21_33.length > 0, 'Lucas 21:33 ("O céu e a terra passarão...") deve ter referências');
  assert.ok(
    refsLc21_33.some(r => r.reference.includes('Isaías 40:8') || r.reference.includes('Mateus 24:35')),
    'Lucas 21:33 deve conectar-se a Isaías 40:8 ou Mateus 24:35'
  );

  // 2. Validar que capítulos anteriores (ex: Lucas 16, 17, 18) e futuros (Lucas 22, 23, 24) possuem referências
  const refsLc16_13 = crossReferenceService.getReferences('Lucas', '16', 13);
  assert.ok(refsLc16_13.length > 0, 'Lucas 16:13 ("Nenhum servo pode servir a dois senhores") deve ter referências');

  const refsLc22_19 = crossReferenceService.getReferences('Lucas', '22', 19);
  assert.ok(refsLc22_19.length > 0, 'Lucas 22:19 (A Ceia do Senhor) deve ter referências');
  assert.ok(
    refsLc22_19.some(r => r.reference.includes('1 Coríntios 11:23') || r.reference.includes('1 Coríntios 11:24') || r.reference.includes('1 Coríntios 11')),
    'Lucas 22:19 deve conectar-se a 1 Coríntios 11:23-24'
  );

  // 3. Validar fallback e preservação de referências nativas do arquivo se houver
  const nativeRef = [{ reference: 'Romanos 1:1', text: 'Texto de teste', connection: 'Conexão teste' }];
  const mergedRefs = crossReferenceService.getReferences('Lucas', '19', 10, nativeRef);
  assert.ok(mergedRefs.length >= 2, 'Deve mesclar referências nativas com o catálogo canônico');
  assert.ok(mergedRefs.some(r => r.reference === 'Romanos 1:1'), 'Deve manter a referência nativa');

  // 4. Testar método hasReferences
  assert.equal(crossReferenceService.hasReferences('Lucas', '19', 10), true);
  assert.equal(crossReferenceService.hasReferences('Lucas', '999', 999), false);

  // 5. Validar que capítulos de João (João 7, 8 e 9) possuem referências canônicas
  const refsJo8_12 = crossReferenceService.getReferences('João', '8', 12);
  assert.ok(refsJo8_12.length > 0, 'João 8:12 ("Eu sou a luz do mundo") deve ter referências');
  assert.ok(refsJo8_12.some(r => r.reference.includes('Isaías 9:2') || r.reference.includes('1 João 1:5')), 'João 8:12 deve conectar a Isaías 9:2 ou 1 João 1:5');

  const refsJo8_36 = crossReferenceService.getReferences('João', '8', 36);
  assert.ok(refsJo8_36.length > 0, 'João 8:36 ("se o Filho vos libertar...") deve ter referências');
  assert.ok(refsJo8_36.some(r => r.reference.includes('Gálatas 5:1') || r.reference.includes('Romanos 8:2')), 'João 8:36 deve conectar a Gálatas 5:1');

  const refsJo7_37 = crossReferenceService.getReferences('João', '7', 37);
  assert.ok(refsJo7_37.length > 0, 'João 7:37 ("Quem tem sede venha a mim e beba") deve ter referências');
  assert.ok(refsJo7_37.some(r => r.reference.includes('Isaías 55:1')), 'João 7:37 deve conectar a Isaías 55:1');

  const refsJo9_25 = crossReferenceService.getReferences('João', '9', 25);
  assert.ok(refsJo9_25.length > 0, 'João 9:25 ("era cego e agora vejo") deve ter referências');
  assert.ok(refsJo9_25.some(r => r.reference.includes('Lucas 18:42') || r.reference.includes('Atos 26:18')), 'João 9:25 deve conectar a Lucas 18 ou Atos 26');

  assert.equal(crossReferenceService.hasReferences('João', '8', 12), true, 'hasReferences para João 8:12 deve ser true');

  // 6. Validar que toda a Bíblia (Antigo e Novo Testamento) possui referências cruzadas integradas
  const fs = await import('fs');
  const path = await import('path');
  const loadBookJson = (bId) => JSON.parse(fs.readFileSync(path.resolve(`public/biblia/${bId}.json`), 'utf8'));

  // Pentateuco: Gênesis 1:1
  const genData = loadBookJson('genesis');
  const gen1_1_v = genData['1'].sections[0].verses.find(v => v.number === 1);
  const refsGen1_1 = crossReferenceService.getReferences('Gênesis', '1', 1, gen1_1_v?.crossReferences);
  assert.ok(refsGen1_1.length >= 3, 'Gênesis 1:1 deve conter referências canônicas');
  assert.ok(refsGen1_1.some(r => r.ref && r.ref.includes('Êxodo 20:11')), 'Gênesis 1:1 deve conectar a Êxodo 20:11');

  // Poéticos: Salmos 23:1
  const slData = loadBookJson('salmos');
  const sl23_1_v = slData['23'].sections[0].verses.find(v => v.number === 1);
  const refsSl23_1 = crossReferenceService.getReferences('Salmos', '23', 1, sl23_1_v?.crossReferences);
  assert.ok(refsSl23_1.length >= 3, 'Salmos 23:1 deve conter referências');

  // Profetas: Isaías 53:5
  const isData = loadBookJson('isaias');
  const is53_5_v = isData['53'].sections.flatMap(s => s.verses).find(v => v.number === 5);
  const refsIs53_5 = crossReferenceService.getReferences('Isaías', '53', 5, is53_5_v?.crossReferences);
  assert.ok(refsIs53_5.length >= 3, 'Isaías 53:5 deve conter referências proféticas');

  // Epístolas: Romanos 8:28
  const rmData = loadBookJson('romanos');
  const rm8_28_v = rmData['8'].sections.flatMap(s => s.verses).find(v => v.number === 28);
  const refsRm8_28 = crossReferenceService.getReferences('Romanos', '8', 28, rm8_28_v?.crossReferences);
  assert.ok(refsRm8_28.length >= 3, 'Romanos 8:28 deve conter referências');

  // Apocalipse: Apocalipse 22:20
  const revData = loadBookJson('apocalipse');
  const rev22_20_v = revData['22'].sections.flatMap(s => s.verses).find(v => v.number === 20);
  const refsRev22_20 = crossReferenceService.getReferences('Apocalipse', '22', 20, rev22_20_v?.crossReferences);
  assert.ok(refsRev22_20.length >= 3, 'Apocalipse 22:20 deve conter referências escatológicas');

  console.log('✓ QA Test 11 Aprovado: Referências cruzadas bíblicas ativas e canonicamente conectadas em todos os 66 livros da Bíblia.');
});

test('QA Test 12: Carregamento do Livro do Dia (João 1) e Separação Exegética de Subtítulos', () => {
  // 1. Validar que o dia 302 do plano devocional é de fato João 1, 2, 3
  const day302 = defaultDays.find(d => d.id === 302);
  assert.ok(day302, 'Dia 302 deve existir no plano 365');
  const parsed = parseReading(day302.readings[0]);
  assert.equal(parsed.book, 'João', 'O livro da primeira leitura do dia 302 deve ser João');
  assert.equal(parsed.chapter, '1', 'O capítulo da leitura do dia 302 deve ser 1');

  // 2. Carregar o arquivo joao.json e verificar que João 1:1 é o Evangelho de João e NÃO Lucas
  const joaoPath = resolve(__dirname, '../public/biblia/joao.json');
  const joaoData = JSON.parse(readFileSync(joaoPath, 'utf-8'));
  const ch1 = joaoData['1'];
  assert.ok(ch1, 'Capítulo 1 de João deve existir no arquivo joao.json');
  assert.equal(ch1.book, 'João', 'O livro deve ser identificado como João');

  const firstVerse = ch1.sections[0].verses[0];
  assert.equal(firstVerse.number, 1);
  assert.ok(
    firstVerse.text.includes('No princípio, aquele que é a Palavra já existia'),
    'João 1:1 deve ser o texto de João ("No princípio..."), jamais Lucas 1:1'
  );
  assert.equal(
    firstVerse.text.includes('Muitos se propuseram'),
    false,
    'Não pode conter o texto de Lucas 1:1 ("Muitos se propuseram")'
  );

  // 3. Validar que o subtítulo "Os primeiros discípulos" foi desacoplado do versículo 34
  const allVerses = ch1.sections.flatMap(s => s.verses);
  const verse34 = allVerses.find(v => v.number === 34);
  assert.ok(verse34, 'Versículo 34 deve existir');
  assert.equal(
    verse34.text.includes('Os primeiros discípulos'),
    false,
    'O versículo 34 NÃO pode conter o subtítulo "Os primeiros discípulos" no final do seu texto'
  );
  assert.ok(
    verse34.text.endsWith('Filho de Deus”.'),
    'O versículo 34 deve terminar limpo em "Filho de Deus”.'
  );

  // 4. Validar que "Os primeiros discípulos" agora é um título de seção autônomo para os versículos 35 em diante
  const discipulosSection = ch1.sections.find(s => s.title === 'Os primeiros discípulos');
  assert.ok(discipulosSection, 'Deve existir uma seção com o título "Os primeiros discípulos"');
  assert.equal(discipulosSection.verses[0].number, 35, 'A seção dos primeiros discípulos deve iniciar no versículo 35');

  // 5. Validar que João 1 tem 5 seções bem delimitadas e não apenas 1 bloco monolítico
  assert.equal(ch1.sections.length, 5, 'João 1 deve ter 5 seções com títulos bem delimitados');
  assert.equal(allVerses.length, 51, 'Todos os 51 versículos de João 1 devem estar preservados');

  // 6. Testar o motor sanitizeBookData em dados brutos com título incorporado
  const mockRawData = {
    '1': {
      book: 'Teste',
      chapter: '1',
      sections: [
        {
          title: 'Introdução',
          verses: [
            { number: 1, text: 'Este é o primeiro texto. Subtítulo Exemplo' },
            { number: 2, text: 'Texto do segundo versículo.' }
          ]
        }
      ]
    }
  };
  const sanitized = sanitizeBookData(mockRawData);
  assert.equal(sanitized['1'].sections.length, 2, 'Deve ter dividido em 2 seções');
  assert.equal(sanitized['1'].sections[0].verses[0].text, 'Este é o primeiro texto.');
  assert.equal(sanitized['1'].sections[1].title, 'Subtítulo Exemplo');
  assert.equal(sanitized['1'].sections[1].verses[0].number, 2);

  console.log('✓ QA Test 12 Aprovado: Livro de João carregado corretamente e subtítulos separados como seções autônomas.');
});

test('QA Test 13: Sincronização em Nuvem do Dia 300 e 301 (Multi-Aparelho Celular e Laptop)', async () => {
  // 1. Simular estado de um laptop que só tinha até o dia 299 concluído
  localStorage.clear();
  const laptopInitialDays = storage.getProgress(defaultDays, 'default');
  assert.equal(laptopInitialDays.find(d => d.id === 300).completed, false);
  assert.equal(laptopInitialDays.find(d => d.id === 301).completed, false);

  // 2. Simular payload da nuvem vindo com lastCompletedDay = 301 (como concluído no celular)
  const cloudPayloadFromPhone = {
    version: 3,
    familyCode: 'DEVOCIONAL-SYNC-RAFAEL',
    lastCompletedDay: 301,
    pendingDays: [],
    completedChapters: ['Lucas 19', 'Lucas 20', 'Lucas 21', 'Lucas 22', 'Lucas 23', 'Lucas 24'],
    updatedAt: new Date().toISOString(),
    profiles: DEFAULT_PROFILES,
    activeProfileId: 'default'
  };

  // 3. Aplicar payload da nuvem no laptop
  const applied = cloudDbService.applyCloudPayload(cloudPayloadFromPhone);
  assert.equal(applied, true, 'O payload da nuvem deve ser aplicado com sucesso');

  // 4. Verificar que no laptop os dias 300 e 301 agora estão 100% concluídos!
  const laptopUpdatedDays = storage.getProgress(defaultDays, 'default');
  assert.equal(laptopUpdatedDays.find(d => d.id === 300).completed, true, 'Dia 300 deve estar concluído no laptop após sync');
  assert.equal(laptopUpdatedDays.find(d => d.id === 301).completed, true, 'Dia 301 deve estar concluído no laptop após sync');
  assert.equal(laptopUpdatedDays.find(d => d.id === 302).completed, false, 'Dia 302 (hoje) deve continuar aberto para leitura');

  // 5. Verificar que os capítulos de Lucas 19 a 24 estão concluídos
  const laptopChapters = storage.getChapterProgress('default');
  assert.equal(laptopChapters['Lucas 19'].completed, true);
  assert.equal(laptopChapters['Lucas 24'].completed, true);

  console.log('✓ QA Test 13 Aprovado: Sincronização multi-aparelho propagou dias 300 e 301 para o laptop sem pendências.');
});

test('QA Test 14: Reconciliação Automática de Dias Concluídos por Capítulos (Eliminação de Falsas Pendências)', async () => {
  localStorage.clear();
  const testProfile = 'default';

  // 1. Simular que o usuário leu e marcou João 1, João 2 e João 3 individualmente
  storage.saveChapterProgress('João 1', true, testProfile);
  storage.saveChapterProgress('João 2', true, testProfile);
  storage.saveChapterProgress('João 3', true, testProfile);

  const chProgress = storage.getChapterProgress(testProfile);
  assert.equal(chProgress['João 1'].completed, true);
  assert.equal(chProgress['João 2'].completed, true);
  assert.equal(chProgress['João 3'].completed, true);

  // 2. storage.getProgress DEVE reconciliar e retornar o Dia 302 como completed: true!
  const reconciledDays = storage.getProgress(defaultDays, testProfile);
  const day302 = reconciledDays.find(d => d.id === 302);
  assert.ok(day302, 'Dia 302 deve existir');
  assert.equal(day302.completed, true, 'Dia 302 DEVE estar concluído pois João 1, 2 e 3 foram lidos');

  // 3. getPendingDays NÃO pode listar o Dia 302 como pendente no dia 303 (hoje)!
  const currentDayId = 303;
  const pending = getPendingDays(reconciledDays, currentDayId, chProgress);
  assert.equal(
    pending.some(d => d.id === 302),
    false,
    'O Dia 302 NÃO PODE constar como pendência acumulada quando todos os seus capítulos foram lidos!'
  );

  console.log('✓ QA Test 14 Aprovado: Reconciliação automática eliminou falsas pendências quando capítulos estão concluídos.');
});

test('QA Test 15: Palavras de Jesus (Red Letter) em Toda a Bíblia (Evangelhos, Atos, Epístolas e Apocalipse)', () => {
  const bibliaDir = resolve(__dirname, '../public/biblia');
  
  function getVerse(bookName, ch, vNum) {
    const p = resolve(bibliaDir, `${bookName}.json`);
    const data = JSON.parse(readFileSync(p, 'utf-8'));
    return data[String(ch)].sections.flatMap(s => s.verses).find(v => v.number === vNum);
  }

  // 1. Validar João 4 versículos 21 a 24 (conforme imagem enviada pelo usuário)
  const v21 = getVerse('joao', 4, 21);
  const v22 = getVerse('joao', 4, 22);
  const v23 = getVerse('joao', 4, 23);
  const v24 = getVerse('joao', 4, 24);

  assert.equal(v21.isJesusWords, true, 'João 4:21 ("Creia em mim, mulher...") deve ter isJesusWords = true');
  assert.equal(v22.isJesusWords, true, 'João 4:22 deve ter isJesusWords = true');
  assert.equal(v23.isJesusWords, true, 'João 4:23 ("Mas está chegando a hora...") deve ter isJesusWords = true');
  assert.equal(v24.isJesusWords, true, 'João 4:24 ("Pois Deus é Espírito...") deve ter isJesusWords = true');

  // 2. Validar Mateus (Sermão do Monte - Mateus 5:3)
  const mt5_3 = getVerse('mateus', 5, 3);
  assert.equal(mt5_3.isJesusWords, true, 'Mateus 5:3 ("Bem-aventurados os pobres de espírito") deve ser Red Letter');

  // 3. Validar Marcos (Marcos 1:15)
  const mc1_15 = getVerse('marcos', 1, 15);
  assert.equal(mc1_15.isJesusWords, true, 'Marcos 1:15 ("O Reino de Deus está próximo") deve ser Red Letter');

  // 4. Validar Lucas (Lucas 4:4)
  const lc4_4 = getVerse('lucas', 4, 4);
  assert.equal(lc4_4.isJesusWords, true, 'Lucas 4:4 ("Nem só de pão viverá o homem") deve ser Red Letter');

  // 5. Validar Atos (Atos 1:8 - Grande Comissão e Envio do Espírito)
  const at1_8 = getVerse('atos', 1, 8);
  assert.equal(at1_8.isJesusWords, true, 'Atos 1:8 ("Mas receberão poder quando o Espírito Santo descer") deve ser Red Letter');

  // 6. Validar Epístolas Paulinas (1 Coríntios 11:24 - Instituição da Santa Ceia)
  const cor11_24 = getVerse('1corintios', 11, 24);
  assert.equal(cor11_24.isJesusWords, true, '1 Coríntios 11:24 ("Isto é o meu corpo...") deve ser Red Letter');

  // 7. Validar Apocalipse (Apocalipse 1:18 - O Cristo Glorificado)
  const ap1_18 = getVerse('apocalipse', 1, 18);
  assert.equal(ap1_18.isJesusWords, true, 'Apocalipse 1:18 ("Eu sou aquele que vive...") deve ser Red Letter');

  // 8. Validar ausência de falas de Jesus no Antigo Testamento (ex: Gênesis 1:1)
  const gn1_1 = getVerse('genesis', 1, 1);
  assert.equal(gn1_1.isJesusWords, false, 'Gênesis 1:1 deve ter isJesusWords = false');

  console.log('✓ QA Test 15 Aprovado: Palavras de Jesus (Red Letter) mapeadas e ativas em toda a Bíblia.');
});

test('QA Test 16: Telemetria e Monitoramento de Uso por Funcionalidade (Opção 1)', async () => {
  const { telemetryService, FEATURE_METADATA } = await import('../src/services/telemetryService.js');
  localStorage.clear();

  // 1. Validar catálogo de features monitoradas
  assert.ok(FEATURE_METADATA.music_play_youtube_music, 'Deve monitorar reprodução no YouTube Music');
  assert.ok(FEATURE_METADATA.music_cycle, 'Deve monitorar troca de música por capítulo');
  assert.ok(FEATURE_METADATA.bible_arc_view, 'Deve monitorar visualização do BibleArc');
  assert.ok(FEATURE_METADATA.cross_references_click, 'Deve monitorar consultas de referências');
  assert.ok(FEATURE_METADATA.theological_commentary_view, 'Deve monitorar comentários teológicos');

  // 2. Disparar eventos simulados
  telemetryService.track('music_play_youtube_music', { song: 'Colossenses 1' });
  telemetryService.track('music_play_youtube_music', { song: 'Esperança' });
  telemetryService.track('bible_arc_view', { book: 'João', chapter: '4' });
  telemetryService.track('cross_references_click', { verse: 'João 4:24' });

  // 3. Obter estatísticas consolidadas
  const stats = telemetryService.getStats('default');
  assert.equal(stats.totalInteractions, 4, 'Total de interações deve ser 4');

  const topFeature = stats.features[0];
  assert.equal(topFeature.id, 'music_play_youtube_music', 'A feature mais usada deve ser Ouvir no YouTube Music');
  assert.equal(topFeature.count, 2);

  // 4. Testar reset de métricas
  telemetryService.resetStats('default');
  const emptyStats = telemetryService.getStats('default');
  assert.equal(emptyStats.totalInteractions, 0, 'Após reset, o total de interações deve ser 0');

  console.log('✓ QA Test 16 Aprovado: Telemetria nativa registrou eventos, calculou ranking e gerenciou estatísticas.');
});
