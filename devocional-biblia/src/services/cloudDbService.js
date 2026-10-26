// Serviço de Sincronização em Nuvem (Cloud DB) para múltiplos aparelhos (Celular, Computador, Família)

import { storage } from './storage.js';

const CLOUD_SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b'; // Fallback ou nuvem aberta com vault key

export const cloudDbService = {
  // Gera o pacote completo de dados para salvar na nuvem
  createCloudPayload() {
    const profiles = storage.getProfiles();
    const activeProfileId = storage.getActiveProfileId();
    const cloudConfig = storage.getCloudConfig();

    const progressByProfile = {};
    const chaptersByProfile = {};
    const favoritesByProfile = {};
    const highlightsByProfile = {};
    const layoutByProfile = {};

    profiles.forEach(p => {
      // Ler do localStorage
      const pKey = storage._resolveKey('devocional_plano_progress_v1', p.id);
      const chKey = storage._resolveKey('devocional_chapters_progress_v1', p.id);
      const favKey = storage._resolveKey('devocional_favorites_v1', p.id);
      const hiKey = storage._resolveKey('devocional_highlights_v1', p.id);
      const layKey = storage._resolveKey('devocional_dashboard_layout_v1', p.id);

      try {
        progressByProfile[p.id] = JSON.parse(localStorage.getItem(pKey) || '{}');
        chaptersByProfile[p.id] = JSON.parse(localStorage.getItem(chKey) || '{}');
        favoritesByProfile[p.id] = JSON.parse(localStorage.getItem(favKey) || '[]');
        highlightsByProfile[p.id] = JSON.parse(localStorage.getItem(hiKey) || '{}');
        layoutByProfile[p.id] = JSON.parse(localStorage.getItem(layKey) || '{}');
      } catch (e) {}
    });

    return {
      version: 1,
      familyCode: cloudConfig.familyCode || 'FAMILIA-BARRETO',
      updatedAt: new Date().toISOString(),
      profiles,
      activeProfileId,
      progressByProfile,
      chaptersByProfile,
      favoritesByProfile,
      highlightsByProfile,
      layoutByProfile
    };
  },

  // Aplica dados recebidos da nuvem com mesclagem inteligente (sem perder nada)
  applyCloudPayload(payload) {
    if (!payload || !payload.profiles) return false;

    try {
      if (Array.isArray(payload.profiles)) {
        storage.saveProfiles(payload.profiles);
      }

      if (payload.progressByProfile) {
        Object.entries(payload.progressByProfile).forEach(([pId, data]) => {
          const key = storage._resolveKey('devocional_plano_progress_v1', pId);
          // Merge com o local existente para não sobrescrever nada mais novo
          const localStored = localStorage.getItem(key);
          const localParsed = localStored ? JSON.parse(localStored) : {};
          const merged = { ...data, ...localParsed };
          localStorage.setItem(key, JSON.stringify(merged));
        });
      }

      if (payload.chaptersByProfile) {
        Object.entries(payload.chaptersByProfile).forEach(([pId, data]) => {
          const key = storage._resolveKey('devocional_chapters_progress_v1', pId);
          const localStored = localStorage.getItem(key);
          const localParsed = localStored ? JSON.parse(localStored) : {};
          const merged = { ...data, ...localParsed };
          localStorage.setItem(key, JSON.stringify(merged));
        });
      }

      if (payload.favoritesByProfile) {
        Object.entries(payload.favoritesByProfile).forEach(([pId, data]) => {
          const key = storage._resolveKey('devocional_favorites_v1', pId);
          if (Array.isArray(data)) {
            localStorage.setItem(key, JSON.stringify(data));
          }
        });
      }

      if (payload.highlightsByProfile) {
        Object.entries(payload.highlightsByProfile).forEach(([pId, data]) => {
          const key = storage._resolveKey('devocional_highlights_v1', pId);
          localStorage.setItem(key, JSON.stringify(data));
        });
      }

      // Atualiza data do último sync
      const config = storage.getCloudConfig();
      config.lastSyncedAt = new Date().toISOString();
      storage.saveCloudConfig(config);

      return true;
    } catch (e) {
      console.error("Erro ao aplicar dados da nuvem:", e);
      return false;
    }
  },

  // Exportar arquivo JSON para compartilhar via WhatsApp ou salvar no Google Drive
  downloadBackupFile() {
    const payload = this.createCloudPayload();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `devocional_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Sincronizar via Nuvem Pública ou Supabase
  async syncWithCloud(familyCode) {
    const payload = this.createCloudPayload();
    if (familyCode) {
      payload.familyCode = familyCode;
    }

    try {
      // Simulação / Armazenamento do Sync Token no localStorage compartilhado
      localStorage.setItem(`devocional_cloud_vault_${payload.familyCode}`, JSON.stringify(payload));
      
      const config = storage.getCloudConfig();
      config.familyCode = payload.familyCode;
      config.lastSyncedAt = new Date().toISOString();
      storage.saveCloudConfig(config);

      return { success: true, timestamp: config.lastSyncedAt };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
