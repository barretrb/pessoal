// Serviço de Telemetria e Monitoramento de Uso por Funcionalidade (Opção 1)
// 100% Nativo, Privado, Sem Dependência de Terceiros e Persistente por Perfil e Nuvem (Supabase)

import { storage } from './storage.js';
import { supabaseSyncService } from './supabaseSyncService.js';
import { supabase } from './supabaseClient.js';

const TELEMETRY_STORAGE_PREFIX = 'devocional_telemetry_v1';
const TELEMETRY_CLOUD_CACHE_KEY = 'devocional_telemetry_cloud_cache_v1';

export const FEATURE_METADATA = {
  music_play_youtube_music: {
    id: 'music_play_youtube_music',
    name: 'Ouvir no YouTube Music',
    category: 'Música & Louvor',
    description: 'Abertura direta da música do capítulo no app/web do YouTube Music',
    icon: 'Headphones',
    defaultKeep: true
  },
  music_play_in_app: {
    id: 'music_play_in_app',
    name: 'Player de Áudio no App',
    category: 'Música & Louvor',
    description: 'Reprodução da faixa musical compacta sem sair da tela inicial',
    icon: 'Play',
    defaultKeep: true
  },
  music_cycle: {
    id: 'music_cycle',
    name: 'Trocar Música do Capítulo',
    category: 'Música & Louvor',
    description: 'Alternância individual entre artistas preferidos (Banda NOVA, Novo Canto, etc.)',
    icon: 'RefreshCw',
    defaultKeep: true
  },
  bible_arc_view: {
    id: 'bible_arc_view',
    name: 'Visualizar BibleArc (Arqueamento)',
    category: 'Estudo Teológico',
    description: 'Consulta aos diagramas estruturais de proposições e relações lógicas do capítulo',
    icon: 'GitBranch',
    defaultKeep: true
  },
  cross_references_click: {
    id: 'cross_references_click',
    name: 'Referências Cruzadas',
    category: 'Estudo Teológico',
    description: 'Exploração de conexões canônicas entre versículos do Antigo e Novo Testamento',
    icon: 'Link2',
    defaultKeep: true
  },
  theological_commentary_view: {
    id: 'theological_commentary_view',
    name: 'Comentários Expositivos',
    category: 'Estudo Teológico',
    description: 'Leitura de notas exegéticas e comentários pastorais contextualizados',
    icon: 'BookOpen',
    defaultKeep: true
  },
  bible_project_video_play: {
    id: 'bible_project_video_play',
    name: 'Vídeos do BibleProject',
    category: 'Estudo Teológico',
    description: 'Reprodução das animações de visão geral dos livros bíblicos',
    icon: 'Video',
    defaultKeep: true
  },
  red_letter_toggle: {
    id: 'red_letter_toggle',
    name: 'Falas de Jesus (Red Letter)',
    category: 'Leitura Bíblica',
    description: 'Ativação ou desativação do destaque em carmim/rosa das palavras de Jesus',
    icon: 'Cross',
    defaultKeep: true
  },
  audio_narration_play: {
    id: 'audio_narration_play',
    name: 'Narração da Bíblia em Áudio',
    category: 'Leitura Bíblica',
    description: 'Ouvir a leitura falada com destaque dinâmico dos versículos',
    icon: 'Volume2',
    defaultKeep: true
  },
  free_bible_nav: {
    id: 'free_bible_nav',
    name: 'Navegação Bíblica Livre',
    category: 'Leitura Bíblica',
    description: 'Pesquisa e seleção manual de qualquer um dos 66 livros e capítulos da Bíblia',
    icon: 'Compass',
    defaultKeep: true
  },
  favorites_add: {
    id: 'favorites_add',
    name: 'Adicionar a Favoritos',
    category: 'Engajamento Pessoal',
    description: 'Marcação de versículos amados para consulta no acervo pessoal',
    icon: 'Star',
    defaultKeep: true
  },
  highlights_add: {
    id: 'highlights_add',
    name: 'Marca-Texto & Grifos',
    category: 'Engajamento Pessoal',
    description: 'Realce colorido de trechos bíblicos',
    icon: 'Highlighter',
    defaultKeep: true
  },
  chapter_completed: {
    id: 'chapter_completed',
    name: 'Conclusão de Capítulo',
    category: 'Plano Devocional',
    description: 'Marcação individual de leitura de capítulo finalizada',
    icon: 'CheckCircle2',
    defaultKeep: true
  },
  day_completed: {
    id: 'day_completed',
    name: 'Conclusão do Dia Completo',
    category: 'Plano Devocional',
    description: 'Finalização do dia do plano anual (3 capítulos)',
    icon: 'Flame',
    defaultKeep: true
  },
  dashboard_customize: {
    id: 'dashboard_customize',
    name: 'Personalizar Tela Inicial',
    category: 'Configurações',
    description: 'Reordenação, ocultação ou recolhimento das caixas do dashboard',
    icon: 'Sliders',
    defaultKeep: true
  },
  cloud_sync_click: {
    id: 'cloud_sync_click',
    name: 'Sincronização na Nuvem',
    category: 'Configurações',
    description: 'Consulta do cofre multi-aparelho e backup remoto',
    icon: 'Cloud',
    defaultKeep: true
  }
};

class TelemetryService {
  _getStorageKey(profileId) {
    const actId = profileId || storage.getActiveProfileId() || 'default';
    return `${TELEMETRY_STORAGE_PREFIX}_${actId}`;
  }

  _getCloudCache() {
    try {
      const raw = localStorage.getItem(TELEMETRY_CLOUD_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Registra um evento de funcionalidade usada
  track(eventId, metadata = {}) {
    try {
      if (!FEATURE_METADATA[eventId]) return;

      const activeProfile = storage.getActiveProfile();
      const profileId = activeProfile?.id || 'default';
      const profileName = activeProfile?.name || 'Rafael';

      const key = this._getStorageKey(profileId);
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : { events: {}, createdAt: new Date().toISOString() };

      if (!data.events) data.events = {};
      if (!data.events[eventId]) {
        data.events[eventId] = {
          count: 0,
          firstUsedAt: new Date().toISOString(),
          lastUsedAt: null,
          history: []
        };
      }

      data.events[eventId].count += 1;
      data.events[eventId].lastUsedAt = new Date().toISOString();
      
      // Armazena pequenas notas dos últimos 5 usos para contexto
      if (metadata && Object.keys(metadata).length > 0) {
        if (!data.events[eventId].history) data.events[eventId].history = [];
        data.events[eventId].history.unshift({
          at: new Date().toISOString(),
          ...metadata
        });
        if (data.events[eventId].history.length > 5) {
          data.events[eventId].history.pop();
        }
      }

      data.lastActivityAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(data));

      // Propaga evento para a nuvem no Supabase de forma assíncrona
      const fullMeta = {
        ...metadata,
        profileId,
        profileName
      };
      supabaseSyncService.trackTelemetry(eventId, fullMeta);
    } catch (e) {
      console.warn("Telemetria: Falha não-bloqueante ao registrar métrica:", e);
    }
  }

  // Busca na nuvem do Supabase todos os registros históricos (cross-device: laptop e celular)
  async fetchCloudTelemetry() {
    try {
      const { data, error } = await supabase
        .from('feature_telemetry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      const cloudEvents = {};
      const profilesMap = {};

      data.forEach(row => {
        const fId = row.feature_name;
        if (!cloudEvents[fId]) {
          cloudEvents[fId] = {
            count: 0,
            firstUsedAt: row.created_at,
            lastUsedAt: row.created_at
          };
        }
        cloudEvents[fId].count += 1;
        if (new Date(row.created_at) > new Date(cloudEvents[fId].lastUsedAt)) {
          cloudEvents[fId].lastUsedAt = row.created_at;
        }
        if (new Date(row.created_at) < new Date(cloudEvents[fId].firstUsedAt)) {
          cloudEvents[fId].firstUsedAt = row.created_at;
        }

        // Segmentação por perfil
        const profId = row.metadata?.profileId || (row.metadata?.profileName?.toLowerCase() === 'esposa' ? 'esposa' : 'default');
        const profName = row.metadata?.profileName || (profId === 'esposa' ? 'Esposa' : 'Rafael');
        if (!profilesMap[profId]) {
          profilesMap[profId] = {
            profileId: profId,
            name: profName,
            totalInteractions: 0,
            events: {}
          };
        }
        profilesMap[profId].totalInteractions += 1;
        profilesMap[profId].events[fId] = (profilesMap[profId].events[fId] || 0) + 1;
      });

      const cloudCache = {
        events: cloudEvents,
        profilesMap,
        totalCount: data.length,
        syncedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(TELEMETRY_CLOUD_CACHE_KEY, JSON.stringify(cloudCache));
      } catch (e) {}

      return cloudCache;
    } catch (e) {
      console.warn("Erro ao buscar telemetria da nuvem:", e);
      return null;
    }
  }

  // Obtém o relatório de métricas mesclando armazenamento local e dados da nuvem Supabase
  getStats(profileId = null) {
    try {
      const actId = profileId || storage.getActiveProfileId() || 'default';
      const key = this._getStorageKey(actId);
      const raw = localStorage.getItem(key);
      const localData = raw ? JSON.parse(raw) : { events: {} };
      const localEvents = localData.events || {};

      const cloudCache = this._getCloudCache();
      const cloudProfileEvents = cloudCache?.profilesMap?.[actId]?.events || (actId === 'default' ? cloudCache?.events : null) || {};

      let totalInteractions = 0;
      const allFeatures = Object.keys(FEATURE_METADATA).map(fId => {
        const meta = FEATURE_METADATA[fId];
        const localEvent = localEvents[fId] || { count: 0, firstUsedAt: null, lastUsedAt: null };
        const rawCloud = cloudProfileEvents[fId];
        const cloudCount = typeof rawCloud === 'number' ? rawCloud : (rawCloud?.count || 0);

        // O valor consolidado é o maior entre local e nuvem
        const count = Math.max(localEvent.count || 0, cloudCount);
        totalInteractions += count;

        return {
          id: fId,
          name: meta.name,
          category: meta.category,
          description: meta.description,
          icon: meta.icon,
          count,
          firstUsedAt: localEvent.firstUsedAt || cloudCache?.events?.[fId]?.firstUsedAt,
          lastUsedAt: localEvent.lastUsedAt || cloudCache?.events?.[fId]?.lastUsedAt,
          history: localEvent.history || []
        };
      });

      // Ordena por maior contagem de uso
      allFeatures.sort((a, b) => b.count - a.count);

      const maxCount = allFeatures[0]?.count || 1;
      const featuresWithHealth = allFeatures.map((f, idx) => {
        const percentOfMax = maxCount > 0 ? Math.round((f.count / maxCount) * 100) : 0;
        const percentOfTotal = totalInteractions > 0 ? Math.round((f.count / totalInteractions) * 100) : 0;

        let statusBadge = { label: 'Em Observação', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' };
        if (f.count >= 20 || idx < 3) {
          statusBadge = { label: '🔥 Alta Utilização', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
        } else if (f.count >= 5) {
          statusBadge = { label: '⚡ Uso Frequente', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' };
        } else if (f.count >= 1) {
          statusBadge = { label: '💤 Uso Ocasional', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
        } else {
          statusBadge = { label: '⚠️ Não Utilizado', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
        }

        return {
          ...f,
          percentOfMax,
          percentOfTotal,
          statusBadge
        };
      });

      return {
        profileId: actId,
        totalInteractions,
        features: featuresWithHealth,
        lastActivityAt: localData.lastActivityAt || cloudCache?.syncedAt || null,
        cloudSynced: Boolean(cloudCache)
      };
    } catch (e) {
      console.error("Erro ao gerar relatório de telemetria:", e);
      return { totalInteractions: 0, features: [] };
    }
  }

  // Obtém o relatório consolidado de TODOS os usuários cadastrados + histórico da nuvem
  getAllUsersStats() {
    try {
      const allRegisteredProfiles = storage.getProfiles();
      const cloudCache = this._getCloudCache();

      // Estrutura consolidada de todas as features
      const consolidatedEvents = {};
      Object.keys(FEATURE_METADATA).forEach(fId => {
        consolidatedEvents[fId] = {
          count: 0,
          firstUsedAt: null,
          lastUsedAt: null
        };
      });

      // 1. Popula com dados da Nuvem Supabase
      if (cloudCache?.events) {
        Object.entries(cloudCache.events).forEach(([fId, cData]) => {
          if (consolidatedEvents[fId]) {
            consolidatedEvents[fId].count = cData.count || 0;
            consolidatedEvents[fId].firstUsedAt = cData.firstUsedAt;
            consolidatedEvents[fId].lastUsedAt = cData.lastUsedAt;
          }
        });
      }

      // 2. Mescla com eventos do localStorage de cada perfil local
      const userBreakdown = [];
      let latestActivity = cloudCache?.syncedAt || null;

      allRegisteredProfiles.forEach(profile => {
        const key = this._getStorageKey(profile.id);
        const raw = localStorage.getItem(key);
        const pData = raw ? JSON.parse(raw) : { events: {} };
        const pEvents = pData.events || {};

        if (pData.lastActivityAt && (!latestActivity || new Date(pData.lastActivityAt) > new Date(latestActivity))) {
          latestActivity = pData.lastActivityAt;
        }

        let userCount = 0;
        Object.entries(pEvents).forEach(([fId, eData]) => {
          if (consolidatedEvents[fId]) {
            consolidatedEvents[fId].count = Math.max(consolidatedEvents[fId].count, (consolidatedEvents[fId].count || 0) + (eData.count || 0));
          }
          userCount += (eData.count || 0);
        });

        const cloudUserCount = cloudCache?.profilesMap?.[profile.id]?.totalInteractions || (profile.id === 'default' && userCount === 0 ? (cloudCache?.totalCount || 0) : 0);
        const finalUserCount = Math.max(userCount, cloudUserCount);

        userBreakdown.push({
          profileId: profile.id,
          name: profile.name,
          avatar: profile.avatar || '👤',
          role: profile.role || 'user',
          totalInteractions: finalUserCount
        });
      });

      // Total consolidado
      let totalInteractions = Object.values(consolidatedEvents).reduce((acc, curr) => acc + (curr.count || 0), 0);
      if (cloudCache?.totalCount && cloudCache.totalCount > totalInteractions) {
        totalInteractions = cloudCache.totalCount;
      }

      userBreakdown.forEach(u => {
        u.percentOfTotal = totalInteractions > 0 ? Math.round((u.totalInteractions / totalInteractions) * 100) : 0;
      });
      userBreakdown.sort((a, b) => b.totalInteractions - a.totalInteractions);

      const allFeatures = Object.keys(FEATURE_METADATA).map(fId => {
        const meta = FEATURE_METADATA[fId];
        const eventData = consolidatedEvents[fId] || { count: 0, firstUsedAt: null, lastUsedAt: null };

        return {
          id: fId,
          name: meta.name,
          category: meta.category,
          description: meta.description,
          icon: meta.icon,
          count: eventData.count,
          firstUsedAt: eventData.firstUsedAt,
          lastUsedAt: eventData.lastUsedAt,
          history: []
        };
      });

      allFeatures.sort((a, b) => b.count - a.count);

      const maxCount = allFeatures[0]?.count || 1;
      const featuresWithHealth = allFeatures.map((f, idx) => {
        const percentOfMax = maxCount > 0 ? Math.round((f.count / maxCount) * 100) : 0;
        const percentOfTotal = totalInteractions > 0 ? Math.round((f.count / totalInteractions) * 100) : 0;

        let statusBadge = { label: 'Em Observação', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' };
        if (f.count >= 20 || idx < 3) {
          statusBadge = { label: '🔥 Alta Utilização', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
        } else if (f.count >= 5) {
          statusBadge = { label: '⚡ Uso Frequente', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' };
        } else if (f.count >= 1) {
          statusBadge = { label: '💤 Uso Ocasional', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
        } else {
          statusBadge = { label: '⚠️ Não Utilizado', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
        }

        return {
          ...f,
          percentOfMax,
          percentOfTotal,
          statusBadge
        };
      });

      return {
        isAggregated: true,
        totalInteractions,
        features: featuresWithHealth,
        userBreakdown,
        lastActivityAt: latestActivity,
        cloudSynced: Boolean(cloudCache)
      };
    } catch (e) {
      console.error("Erro ao consolidar telemetria de todos os usuários:", e);
      return { isAggregated: true, totalInteractions: 0, features: [], userBreakdown: [] };
    }
  }

  // Limpa o histórico de métricas local e do cache
  resetStats(profileId = null) {
    try {
      const actId = profileId || storage.getActiveProfileId() || 'default';
      const key = this._getStorageKey(actId);
      localStorage.removeItem(key);

      if (profileId === 'ALL' || actId === 'default') {
        const all = storage.getProfiles();
        all.forEach(p => localStorage.removeItem(this._getStorageKey(p.id)));
        localStorage.removeItem(this._getStorageKey('default'));
        localStorage.removeItem(TELEMETRY_CLOUD_CACHE_KEY);
      } else {
        const cloudCache = this._getCloudCache();
        if (cloudCache?.profilesMap?.[actId]) {
          delete cloudCache.profilesMap[actId];
          localStorage.setItem(TELEMETRY_CLOUD_CACHE_KEY, JSON.stringify(cloudCache));
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const telemetryService = new TelemetryService();
