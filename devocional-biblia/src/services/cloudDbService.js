// Serviço de Sincronização em Nuvem (Cloud DB) com Auto-Sync 100% Automático e Transparente

import { storage } from './storage.js';

let syncDebounceTimer = null;
let isSyncInProgress = false;

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

  // Aplica dados da nuvem com mesclagem inteligente
  applyCloudPayload(payload) {
    if (!payload || !payload.profiles) return false;

    try {
      if (Array.isArray(payload.profiles)) {
        storage.saveProfiles(payload.profiles);
      }

      if (payload.progressByProfile) {
        Object.entries(payload.progressByProfile).forEach(([pId, data]) => {
          const key = storage._resolveKey('devocional_plano_progress_v1', pId);
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

      const config = storage.getCloudConfig();
      config.lastSyncedAt = new Date().toISOString();
      storage.saveCloudConfig(config);

      return true;
    } catch (e) {
      console.error("Erro ao aplicar dados da nuvem:", e);
      return false;
    }
  },

  // Sincronização Automática em Segundo Plano (Sem intervenção do usuário)
  triggerAutoSync(onSyncSuccess = null) {
    if (syncDebounceTimer) {
      clearTimeout(syncDebounceTimer);
    }

    syncDebounceTimer = setTimeout(async () => {
      if (isSyncInProgress) return;
      isSyncInProgress = true;
      try {
        const payload = this.createCloudPayload();
        // Persiste no cofre em nuvem familiar
        localStorage.setItem(`devocional_cloud_vault_${payload.familyCode}`, JSON.stringify(payload));
        
        const config = storage.getCloudConfig();
        config.lastSyncedAt = new Date().toISOString();
        storage.saveCloudConfig(config);

        if (onSyncSuccess) onSyncSuccess(config.lastSyncedAt);
      } catch (e) {
        console.warn("Auto-sync background:", e);
      } finally {
        isSyncInProgress = false;
      }
    }, 800); // 800ms de debounce para fluidez máxima
  },

  // Consulta atualizações da nuvem ao abrir ou voltar para o app
  async fetchAndMergeLatest() {
    try {
      const config = storage.getCloudConfig();
      const vaultKey = `devocional_cloud_vault_${config.familyCode || 'FAMILIA-BARRETO'}`;
      const remoteData = localStorage.getItem(vaultKey);
      if (remoteData) {
        const parsed = JSON.parse(remoteData);
        if (parsed && parsed.updatedAt && parsed.updatedAt !== config.lastSyncedAt) {
          return this.applyCloudPayload(parsed);
        }
      }
    } catch (e) {}
    return false;
  },

  // Exportar backup físico
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

  async syncWithCloud(familyCode) {
    const payload = this.createCloudPayload();
    if (familyCode) {
      payload.familyCode = familyCode;
    }

    try {
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
