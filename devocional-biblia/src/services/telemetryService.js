// Serviço de Telemetria e Monitoramento de Uso por Funcionalidade
// 100% Nativo, Privado, Sem Dependência de Terceiros e Persistente por Perfil e Nuvem (Supabase)

import { storage } from './storage.js';
import { supabaseSyncService } from './supabaseSyncService.js';
import { supabase } from './supabaseClient.js';

const TELEMETRY_STORAGE_PREFIX = 'devocional_telemetry_v1';
const TELEMETRY_CLOUD_CACHE_KEY = 'devocional_telemetry_cloud_cache_v1';
const TELEMETRY_RESET_CUTOFF_KEY = 'devocional_telemetry_reset_v1';

const EVENT_ALIASES = {
  music_cycle_reader: 'music_cycle',
  music_play_youtube_music_reader: 'music_play_youtube_music'
};

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
    description: 'Alternância individual entre canções e artistas do catálogo devocional',
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
    name: 'Referências Cruzadas Exegéticas',
    category: 'Estudo Teológico',
    description: 'Exploração de conexões canônicas, citações e tipologia entre Antigo e Novo Testamento',
    icon: 'Link2',
    defaultKeep: true
  },
  theological_commentary_view: {
    id: 'theological_commentary_view',
    name: 'Comentários Expositivos & Notas',
    category: 'Estudo Teológico',
    description: 'Leitura de notas exegéticas, estrutura do capítulo e diário espiritual',
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
  biblical_maps_view: {
    id: 'biblical_maps_view',
    name: 'Atlas Bíblico & Rotas',
    category: 'Estudo Teológico',
    description: 'Exploração das viagens missionárias de Paulo, passos de Jesus e Êxodo',
    icon: 'Compass',
    defaultKeep: true
  },
  red_letter_toggle: {
    id: 'red_letter_toggle',
    name: 'Falas de Jesus (Red Letter)',
    category: 'Leitura Bíblica',
    description: 'Ativação ou desativação do destaque em carmim das palavras de Jesus',
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
    description: 'Realce colorido temático de trechos bíblicos',
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
    description: 'Finalização do dia do plano anual',
    icon: 'Flame',
    defaultKeep: true
  },
  dashboard_customize: {
    id: 'dashboard_customize',
    name: 'Personalizar Tela Inicial',
    category: 'Configurações',
    description: 'Reordenação, ocultação ou recolhimento das seções do painel',
    icon: 'Sliders',
    defaultKeep: true
  }
};

function computeStatusBadge(count, idx) {
  if (count <= 0) {
    return { label: 'Não Utilizado', color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' };
  }
  if (count >= 15 || (idx < 3 && count >= 3)) {
    return { label: 'Alta Utilização', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
  }
  if (count >= 4) {
    return { label: 'Uso Frequente', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' };
  }
  return { label: 'Uso Ativo', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
}

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

  _getResetCutoffs() {
    try {
      const raw = localStorage.getItem(TELEMETRY_RESET_CUTOFF_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  _setResetCutoff(targetId, isoDate) {
    try {
      const cutoffs = this._getResetCutoffs();
      cutoffs[targetId] = isoDate;
      localStorage.setItem(TELEMETRY_RESET_CUTOFF_KEY, JSON.stringify(cutoffs));
    } catch (e) {}
  }

  // Registra um evento de funcionalidade usada
  track(rawEventId, metadata = {}) {
    try {
      const eventId = EVENT_ALIASES[rawEventId] || rawEventId;
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

      const increment = Number(metadata?.incrementBy) > 0 ? Number(metadata.incrementBy) : 1;
      data.events[eventId].count += increment;
      data.events[eventId].lastUsedAt = new Date().toISOString();
      
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

      // Atualiza também o cache local de nuvem imediatamente para feedback instantâneo na UI
      try {
        const cloudCache = this._getCloudCache();
        if (cloudCache) {
          if (!cloudCache.events) cloudCache.events = {};
          if (!cloudCache.events[eventId]) {
            cloudCache.events[eventId] = { count: 0, firstUsedAt: data.lastActivityAt, lastUsedAt: data.lastActivityAt };
          }
          cloudCache.events[eventId].count += increment;
          cloudCache.events[eventId].lastUsedAt = data.lastActivityAt;

          if (!cloudCache.profilesMap) cloudCache.profilesMap = {};
          if (!cloudCache.profilesMap[profileId]) {
            cloudCache.profilesMap[profileId] = { profileId, name: profileName, totalInteractions: 0, events: {} };
          }
          cloudCache.profilesMap[profileId].totalInteractions += increment;
          cloudCache.profilesMap[profileId].events[eventId] = (cloudCache.profilesMap[profileId].events[eventId] || 0) + increment;
          cloudCache.totalCount = (cloudCache.totalCount || 0) + increment;
          localStorage.setItem(TELEMETRY_CLOUD_CACHE_KEY, JSON.stringify(cloudCache));
        }
      } catch (e) {}

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
      const cutoffs = { ...this._getResetCutoffs() };

      data.forEach(row => {
        if (row.feature_name === '__reset__') {
          const targetId = row.metadata?.profileId || 'ALL';
          const ts = row.metadata?.resetAt || row.created_at;
          if (!cutoffs[targetId] || new Date(ts) > new Date(cutoffs[targetId])) {
            cutoffs[targetId] = ts;
          }
        }
      });
      try {
        localStorage.setItem(TELEMETRY_RESET_CUTOFF_KEY, JSON.stringify(cutoffs));
      } catch (e) {}

      const globalCutoffMs = cutoffs.ALL ? new Date(cutoffs.ALL).getTime() : 0;
      let validCount = 0;

      data.forEach(row => {
        if (row.feature_name === '__reset__') return;
        const fId = EVENT_ALIASES[row.feature_name] || row.feature_name;
        if (!FEATURE_METADATA[fId]) return;

        const profId = row.metadata?.profileId || (row.metadata?.profileName?.toLowerCase() === 'esposa' ? 'esposa' : 'default');
        const profName = row.metadata?.profileName || (profId === 'esposa' ? 'Esposa' : 'Rafael');

        const rowMs = new Date(row.created_at).getTime();
        const profileCutoffMs = cutoffs[profId] ? new Date(cutoffs[profId]).getTime() : 0;
        const effectiveCutoffMs = Math.max(globalCutoffMs, profileCutoffMs);
        if (effectiveCutoffMs > 0 && rowMs <= effectiveCutoffMs) {
          return;
        }

        validCount += 1;
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
        totalCount: validCount,
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

  // Reconcilia favoritos e destaques já salvos no acervo do perfil que não haviam disparado evento
  _getReconciledSavedCounts(profileId) {
    try {
      const cutoffs = this._getResetCutoffs();
      const cutoffIso = cutoffs[profileId] || cutoffs.ALL || null;
      const cutoffMs = cutoffIso ? new Date(cutoffIso).getTime() : 0;

      const favs = storage.getFavorites(profileId) || [];
      const validFavs = cutoffMs > 0
        ? favs.filter(f => !f.savedAt || new Date(f.savedAt).getTime() > cutoffMs)
        : favs;

      const highs = Object.values(storage.getHighlights(profileId) || {});
      const validHighs = cutoffMs > 0
        ? highs.filter(h => !h.updatedAt || new Date(h.updatedAt).getTime() > cutoffMs)
        : highs;

      return {
        favorites_add: validFavs.length,
        highlights_add: validHighs.length
      };
    } catch (e) {
      return { favorites_add: 0, highlights_add: 0 };
    }
  }

  // Obtém o relatório de métricas mesclando armazenamento local, acervo salvo e nuvem Supabase
  getStats(profileId = null) {
    try {
      const allProfiles = storage.getProfiles();
      const targetProfile = allProfiles.find(p => p.id === profileId) || storage.getActiveProfile();
      const actId = profileId || targetProfile?.id || 'default';
      const profNameLower = (targetProfile?.name || '').trim().toLowerCase();

      const key = this._getStorageKey(actId);
      const raw = localStorage.getItem(key);
      const localData = raw ? JSON.parse(raw) : { events: {} };
      const localEvents = localData.events || {};

      const cloudCache = this._getCloudCache();
      const savedCounts = this._getReconciledSavedCounts(actId);

      let cloudProfileEvents = {};
      if (cloudCache?.profilesMap) {
        if (cloudCache.profilesMap[actId]) {
          cloudProfileEvents = cloudCache.profilesMap[actId].events || {};
        } else if (profNameLower === 'esposa' && cloudCache.profilesMap['esposa']) {
          cloudProfileEvents = cloudCache.profilesMap['esposa'].events || {};
        } else if ((actId === 'default' || profNameLower === 'rafael') && (cloudCache.profilesMap['default'] || cloudCache.profilesMap['rafael'])) {
          cloudProfileEvents = cloudCache.profilesMap['default']?.events || cloudCache.profilesMap['rafael']?.events || {};
        }
      }

      const cutoffs = this._getResetCutoffs();
      if (!cloudCache?.profilesMap && !cutoffs.ALL && !cutoffs[actId] && (actId === 'default' || profNameLower === 'rafael')) {
        cloudProfileEvents = cloudCache?.events || {};
      }

      let totalInteractions = 0;
      const allFeatures = Object.keys(FEATURE_METADATA).map(fId => {
        const meta = FEATURE_METADATA[fId];
        const localEvent = localEvents[fId] || { count: 0, firstUsedAt: null, lastUsedAt: null };
        const rawCloud = cloudProfileEvents[fId];
        const cloudCount = typeof rawCloud === 'number' ? rawCloud : (rawCloud?.count || 0);
        const reconciledMin = savedCounts[fId] || 0;

        const count = Math.max(localEvent.count || 0, cloudCount, reconciledMin);
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

      allFeatures.sort((a, b) => b.count - a.count);

      const maxCount = allFeatures[0]?.count || 1;
      const featuresWithHealth = allFeatures.map((f, idx) => {
        const percentOfMax = maxCount > 0 && f.count > 0 ? Math.round((f.count / maxCount) * 100) : 0;
        const percentOfTotal = totalInteractions > 0 ? Math.round((f.count / totalInteractions) * 100) : 0;
        const statusBadge = computeStatusBadge(f.count, idx);

        return {
          ...f,
          percentOfMax,
          percentOfTotal,
          statusBadge
        };
      });

      return {
        profileId: actId,
        profileName: targetProfile?.name || 'Leitor',
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

      const consolidatedEvents = {};
      Object.keys(FEATURE_METADATA).forEach(fId => {
        consolidatedEvents[fId] = {
          count: 0,
          firstUsedAt: null,
          lastUsedAt: null
        };
      });

      const userBreakdown = [];
      let latestActivity = cloudCache?.syncedAt || null;

      allRegisteredProfiles.forEach(profile => {
        const pStats = this.getStats(profile.id);
        if (pStats.lastActivityAt && (!latestActivity || new Date(pStats.lastActivityAt) > new Date(latestActivity))) {
          latestActivity = pStats.lastActivityAt;
        }

        let userCount = 0;
        (pStats.features || []).forEach(f => {
          if (consolidatedEvents[f.id]) {
            consolidatedEvents[f.id].count += (f.count || 0);
            if (f.firstUsedAt && (!consolidatedEvents[f.id].firstUsedAt || new Date(f.firstUsedAt) < new Date(consolidatedEvents[f.id].firstUsedAt))) {
              consolidatedEvents[f.id].firstUsedAt = f.firstUsedAt;
            }
            if (f.lastUsedAt && (!consolidatedEvents[f.id].lastUsedAt || new Date(f.lastUsedAt) > new Date(consolidatedEvents[f.id].lastUsedAt))) {
              consolidatedEvents[f.id].lastUsedAt = f.lastUsedAt;
            }
          }
          userCount += (f.count || 0);
        });

        userBreakdown.push({
          profileId: profile.id,
          name: profile.name,
          avatar: profile.avatar || '👤',
          role: profile.role || 'user',
          totalInteractions: userCount
        });
      });

      const totalInteractions = Object.values(consolidatedEvents).reduce((acc, curr) => acc + (curr.count || 0), 0);

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
        const percentOfMax = maxCount > 0 && f.count > 0 ? Math.round((f.count / maxCount) * 100) : 0;
        const percentOfTotal = totalInteractions > 0 ? Math.round((f.count / totalInteractions) * 100) : 0;
        const statusBadge = computeStatusBadge(f.count, idx);

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

  // Limpa o histórico de métricas local, do cache e registra marcador de reset na nuvem
  resetStats(profileId = null) {
    try {
      const targetId = profileId === 'ALL' ? 'ALL' : (profileId || storage.getActiveProfileId() || 'default');
      const nowIso = new Date().toISOString();
      this._setResetCutoff(targetId, nowIso);

      if (targetId === 'ALL') {
        const all = storage.getProfiles();
        all.forEach(p => localStorage.removeItem(this._getStorageKey(p.id)));
        localStorage.removeItem(this._getStorageKey('default'));
        localStorage.setItem(TELEMETRY_CLOUD_CACHE_KEY, JSON.stringify({
          events: {},
          profilesMap: {},
          totalCount: 0,
          syncedAt: nowIso
        }));
      } else {
        localStorage.removeItem(this._getStorageKey(targetId));
        const cloudCache = this._getCloudCache() || { events: {}, profilesMap: {} };
        if (cloudCache.profilesMap?.[targetId]) {
          delete cloudCache.profilesMap[targetId];
        }
        const rebuiltEvents = {};
        let rebuiltTotal = 0;
        Object.values(cloudCache.profilesMap || {}).forEach(prof => {
          Object.entries(prof.events || {}).forEach(([fId, cnt]) => {
            const c = typeof cnt === 'number' ? cnt : (cnt?.count || 0);
            if (!rebuiltEvents[fId]) rebuiltEvents[fId] = { count: 0 };
            rebuiltEvents[fId].count += c;
            rebuiltTotal += c;
          });
        });
        cloudCache.events = rebuiltEvents;
        cloudCache.totalCount = rebuiltTotal;
        localStorage.setItem(TELEMETRY_CLOUD_CACHE_KEY, JSON.stringify(cloudCache));
      }

      try {
        supabase.from('feature_telemetry').insert([{
          feature_name: '__reset__',
          metadata: { profileId: targetId, resetAt: nowIso }
        }]).then(() => {}, () => {});
      } catch (e) {}

      return true;
    } catch (e) {
      return false;
    }
  }
}

export const telemetryService = new TelemetryService();
