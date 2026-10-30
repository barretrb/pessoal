// Serviço de Telemetria e Monitoramento de Uso por Funcionalidade (Opção 1)
// 100% Nativo, Privado, Sem Dependência de Terceiros e Persistente por Perfil

import { storage } from './storage.js';

const TELEMETRY_STORAGE_PREFIX = 'devocional_telemetry_v1';

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

  // Registra um evento de funcionalidade usada
  track(eventId, metadata = {}) {
    try {
      if (!FEATURE_METADATA[eventId]) return;

      const key = this._getStorageKey();
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
    } catch (e) {
      console.warn("Telemetria: Falha não-bloqueante ao registrar métrica:", e);
    }
  }

  // Obtém o relatório consolidado de métricas para a interface
  getStats(profileId = null) {
    try {
      const key = this._getStorageKey(profileId);
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : { events: {} };
      const events = data.events || {};

      let totalInteractions = 0;
      const allFeatures = Object.keys(FEATURE_METADATA).map(fId => {
        const meta = FEATURE_METADATA[fId];
        const eventData = events[fId] || { count: 0, firstUsedAt: null, lastUsedAt: null };
        totalInteractions += eventData.count;

        return {
          id: fId,
          name: meta.name,
          category: meta.category,
          description: meta.description,
          icon: meta.icon,
          count: eventData.count,
          firstUsedAt: eventData.firstUsedAt,
          lastUsedAt: eventData.lastUsedAt,
          history: eventData.history || []
        };
      });

      // Ordena por maior contagem de uso
      allFeatures.sort((a, b) => b.count - a.count);

      // Calcula percentual relativo e status de recomendação (Manter vs. Avaliar remoção)
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
        totalInteractions,
        features: featuresWithHealth,
        lastActivityAt: data.lastActivityAt || null,
        createdAt: data.createdAt || null
      };
    } catch (e) {
      console.error("Erro ao carregar estatísticas de telemetria:", e);
      return { totalInteractions: 0, features: [] };
    }
  }

  // Limpa o histórico de métricas
  resetStats(profileId = null) {
    try {
      const key = this._getStorageKey(profileId);
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const telemetryService = new TelemetryService();
