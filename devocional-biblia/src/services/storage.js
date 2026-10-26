// Camada de persistência local e gerenciamento de perfis, progresso, favoritos e segurança

const STORAGE_KEYS = {
  PROFILES: "devocional_profiles_v1",
  ACTIVE_PROFILE: "devocional_active_profile_v1",
  PROGRESS: "devocional_plano_progress_v1",
  CHAPTERS_PROGRESS: "devocional_chapters_progress_v1",
  HIGHLIGHTS: "devocional_highlights_v1",
  FAVORITES: "devocional_favorites_v1",
  NOTES: "devocional_notes_v1",
  BIBLE_ARCS: "devocional_bible_arcs_v1",
  SETTINGS: "devocional_settings_v1",
  DASHBOARD_LAYOUT: "devocional_dashboard_layout_v1",
  CLOUD_CONFIG: "devocional_cloud_config_v1",
};

export const HIGHLIGHT_COLORS = {
  yellow: { name: "Promessa / Revelação", bg: "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-l-4 border-amber-400", hex: "#fef08a" },
  green:  { name: "Mandamento / Prática", bg: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-l-4 border-emerald-400", hex: "#a7f3d0" },
  blue:   { name: "Oração / Sabedoria",   bg: "bg-sky-100 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-l-4 border-sky-400", hex: "#bae6fd" },
  purple: { name: "Majestade / Glória",   bg: "bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-l-4 border-purple-400", hex: "#e9d5ff" },
  coral:  { name: "Graça / Amor do Pai",  bg: "bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-l-4 border-rose-400", hex: "#fecdd3" },
};

export const DEFAULT_PROFILES = [
  { 
    id: 'default', 
    name: 'Rafael', 
    avatar: '👨', 
    color: 'amber',
    role: 'admin',        // Rafael é o Administrador da conta
    pin: '1234',          // PIN de segurança de 4 dígitos para proteger o perfil
    requiresPin: true
  },
  { 
    id: 'esposa', 
    name: 'Esposa', 
    avatar: '👩', 
    color: 'rose',
    role: 'member',       // Esposa é Membro
    pin: '',
    requiresPin: false
  }
];

export const DEFAULT_DASHBOARD_LAYOUT = {
  order: ['todayPending', 'music', 'studyBanner', 'video', 'calendar'],
  hidden: {},
  collapsed: {}
};

export const storage = {
  // ==========================================
  // 0. GERENCIAMENTO DE PERFIS & SEGURANÇA (ADMIN / PIN)
  // ==========================================
  getProfiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Garantir que o perfil default do Rafael tenha role admin e PIN
          return parsed.map(p => {
            if (p.id === 'default') {
              return {
                ...p,
                role: 'admin',
                pin: p.pin || '1234',
                requiresPin: p.requiresPin ?? true
              };
            }
            return p;
          });
        }
      }
    } catch (e) {
      console.error("Erro ao carregar perfis:", e);
    }
    this.saveProfiles(DEFAULT_PROFILES);
    return DEFAULT_PROFILES;
  },

  saveProfiles(profiles) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {}
  },

  getActiveProfileId() {
    try {
      const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
      if (active) return active;
    } catch (e) {}
    return 'default';
  },

  setActiveProfileId(profileId) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profileId);
    } catch (e) {}
    return profileId;
  },

  getActiveProfile() {
    const profiles = this.getProfiles();
    const activeId = this.getActiveProfileId();
    return profiles.find(p => p.id === activeId) || profiles[0] || DEFAULT_PROFILES[0];
  },

  // Validação do PIN do perfil (para impedir que a esposa acesse os dados do Rafael)
  verifyProfilePin(profileId, inputPin) {
    const profiles = this.getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return false;
    if (!profile.requiresPin || !profile.pin) return true;
    return String(profile.pin).trim() === String(inputPin).trim();
  },

  updateAdminPin(newPin) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === 'default');
    if (idx >= 0) {
      profiles[idx].pin = String(newPin).trim();
      profiles[idx].requiresPin = true;
      this.saveProfiles(profiles);
      return true;
    }
    return false;
  },

  createProfile(name, avatar = '👤', color = 'amber', role = 'member', pin = '') {
    const profiles = this.getProfiles();
    const newId = 'profile_' + Date.now();
    const newProfile = { 
      id: newId, 
      name: name.trim() || 'Novo Leitor', 
      avatar, 
      color,
      role: role || 'member',
      pin: pin ? String(pin).trim() : '',
      requiresPin: !!pin
    };
    profiles.push(newProfile);
    this.saveProfiles(profiles);
    this.setActiveProfileId(newId);
    return newProfile;
  },

  updateProfile(profileId, updates) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profileId);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...updates };
      this.saveProfiles(profiles);
    }
    return profiles;
  },

  deleteProfile(profileId) {
    let profiles = this.getProfiles();
    if (profileId === 'default' || profiles.length <= 1) return profiles; // Rafael admin nunca pode ser excluído
    profiles = profiles.filter(p => p.id !== profileId);
    this.saveProfiles(profiles);
    if (this.getActiveProfileId() === profileId) {
      this.setActiveProfileId('default');
    }
    return profiles;
  },

  _resolveKey(baseKey, profileId = this.getActiveProfileId()) {
    const scopedKey = `${baseKey}_${profileId}`;
    if (profileId === 'default' && !localStorage.getItem(scopedKey)) {
      const legacy = localStorage.getItem(baseKey);
      if (legacy) {
        localStorage.setItem(scopedKey, legacy);
      }
    }
    return scopedKey;
  },

  // ==========================================
  // 1. PROGRESSO DOS DIAS (COM RESTAURAÇÃO INTEGRAL)
  // ==========================================
  getProgress(defaultDays, profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.PROGRESS, profileId);
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : {};

      // Para o Rafael ('default'):
      // Se não há alteração explícita no parsed, os dias concluídos originais (dias 1 a 296) são preservados!
      if (profileId === 'default') {
        return defaultDays.map(d => {
          let isCompleted = d.completed;
          let completedAt = d.completedAt;

          // Se estiver salvo no localStorage, respeita a escolha do usuário
          if (parsed[d.id] !== undefined) {
            isCompleted = parsed[d.id].completed;
            completedAt = parsed[d.id].completedAt;
          } else if (d.id <= 296) {
            // Garante que todo o histórico do Rafael até o dia 296 permaneça intacto
            isCompleted = true;
            completedAt = completedAt || `2026-${String(Math.floor(d.id / 31) + 1).padStart(2, '0')}-01`;
          }

          return {
            ...d,
            completed: isCompleted,
            completedAt: completedAt
          };
        });
      }

      // Para a Esposa ou novos perfis:
      return defaultDays.map(d => ({
        ...d,
        completed: parsed[d.id] ? parsed[d.id].completed : false,
        completedAt: parsed[d.id] ? parsed[d.id].completedAt : null
      }));
    } catch (e) {
      console.error("Erro ao ler progresso:", e);
      return defaultDays;
    }
  },

  saveDayProgress(dayId, isCompleted, profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.PROGRESS, profileId);
      const stored = localStorage.getItem(key);
      const current = stored ? JSON.parse(stored) : {};
      current[dayId] = {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      localStorage.setItem(key, JSON.stringify(current));
    } catch (e) {
      console.error("Erro ao salvar progresso do dia:", e);
    }
  },

  // ==========================================
  // 1.1 PROGRESSO POR CAPÍTULO
  // ==========================================
  getChapterProgress(profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.CHAPTERS_PROGRESS, profileId);
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : {};

      // Para o Rafael: garantir capítulos lidos de Lucas 1 até Lucas 9
      if (profileId === 'default') {
        for (let ch = 1; ch <= 9; ch++) {
          const chName = `Lucas ${ch}`;
          if (!parsed[chName]) {
            parsed[chName] = { completed: true, completedAt: '2026-10-23' };
          }
        }
      }
      return parsed;
    } catch (e) {
      return {};
    }
  },

  saveChapterProgress(chapterName, isCompleted, profileId = this.getActiveProfileId()) {
    try {
      const progress = this.getChapterProgress(profileId);
      progress[chapterName] = {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      const key = this._resolveKey(STORAGE_KEYS.CHAPTERS_PROGRESS, profileId);
      localStorage.setItem(key, JSON.stringify(progress));
      return progress;
    } catch (e) {
      console.error("Erro ao salvar progresso do capítulo:", e);
      return {};
    }
  },

  setDayChaptersProgress(readings, isCompleted, profileId = this.getActiveProfileId()) {
    try {
      const progress = this.getChapterProgress(profileId);
      readings.forEach(ch => {
        progress[ch] = {
          completed: isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null
        };
      });
      const key = this._resolveKey(STORAGE_KEYS.CHAPTERS_PROGRESS, profileId);
      localStorage.setItem(key, JSON.stringify(progress));
      return progress;
    } catch (e) {
      return {};
    }
  },

  // ==========================================
  // 2. DESTAQUES (HIGHLIGHTS)
  // ==========================================
  getHighlights(profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.HIGHLIGHTS, profileId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  },

  saveHighlight(verseKey, colorKey, note = "", profileId = this.getActiveProfileId()) {
    try {
      const highlights = this.getHighlights(profileId);
      if (!colorKey) {
        delete highlights[verseKey];
      } else {
        highlights[verseKey] = {
          color: colorKey,
          note,
          updatedAt: new Date().toISOString()
        };
      }
      const key = this._resolveKey(STORAGE_KEYS.HIGHLIGHTS, profileId);
      localStorage.setItem(key, JSON.stringify(highlights));
      return highlights;
    } catch (e) {
      console.error("Erro ao salvar destaque:", e);
      return {};
    }
  },

  saveMultipleHighlights(verseKeys, colorKey, profileId = this.getActiveProfileId()) {
    try {
      const highlights = this.getHighlights(profileId);
      const now = new Date().toISOString();
      verseKeys.forEach(k => {
        if (!colorKey) {
          delete highlights[k];
        } else {
          highlights[k] = {
            color: colorKey,
            note: "",
            updatedAt: now
          };
        }
      });
      const key = this._resolveKey(STORAGE_KEYS.HIGHLIGHTS, profileId);
      localStorage.setItem(key, JSON.stringify(highlights));
      return highlights;
    } catch (e) {
      console.error("Erro ao salvar múltiplos destaques:", e);
      return {};
    }
  },

  // ==========================================
  // 3. FAVORITOS
  // ==========================================
  getFavorites(profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.FAVORITES, profileId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(verseKey, verseData, profileId = this.getActiveProfileId()) {
    try {
      let favs = this.getFavorites(profileId);
      const exists = favs.find(f => f.key === verseKey);
      if (exists) {
        favs = favs.filter(f => f.key !== verseKey);
      } else {
        favs.push({
          key: verseKey,
          ...verseData,
          savedAt: new Date().toISOString()
        });
      }
      const key = this._resolveKey(STORAGE_KEYS.FAVORITES, profileId);
      localStorage.setItem(key, JSON.stringify(favs));
      return favs;
    } catch (e) {
      return [];
    }
  },

  toggleMultipleFavorites(versesDataList, profileId = this.getActiveProfileId()) {
    try {
      let favs = this.getFavorites(profileId);
      const allExist = versesDataList.every(v => favs.some(f => f.key === v.key));
      const now = new Date().toISOString();

      if (allExist) {
        const keysToRemove = new Set(versesDataList.map(v => v.key));
        favs = favs.filter(f => !keysToRemove.has(f.key));
      } else {
        versesDataList.forEach(v => {
          if (!favs.some(f => f.key === v.key)) {
            favs.push({
              key: v.key,
              text: v.text,
              book: v.book || "Lucas",
              chapter: v.chapter || "",
              savedAt: now
            });
          }
        });
      }
      const key = this._resolveKey(STORAGE_KEYS.FAVORITES, profileId);
      localStorage.setItem(key, JSON.stringify(favs));
      return favs;
    } catch (e) {
      return [];
    }
  },

  // ==========================================
  // 4. ESTUDOS BIBLE_ARC
  // ==========================================
  getBibleArcs(profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.BIBLE_ARCS, profileId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveBibleArc(arcStudy, profileId = this.getActiveProfileId()) {
    try {
      let list = this.getBibleArcs(profileId);
      const idx = list.findIndex(a => a.id === arcStudy.id);
      if (idx >= 0) {
        list[idx] = { ...arcStudy, updatedAt: new Date().toISOString() };
      } else {
        list.push({ ...arcStudy, id: Date.now().toString(), createdAt: new Date().toISOString() });
      }
      const key = this._resolveKey(STORAGE_KEYS.BIBLE_ARCS, profileId);
      localStorage.setItem(key, JSON.stringify(list));
      return list;
    } catch (e) {
      return [];
    }
  },

  // ==========================================
  // 5. PERSONALIZAÇÃO DO DASHBOARD
  // ==========================================
  getDashboardLayout(profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.DASHBOARD_LAYOUT, profileId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          order: parsed.order || DEFAULT_DASHBOARD_LAYOUT.order,
          hidden: parsed.hidden || {},
          collapsed: parsed.collapsed || {}
        };
      }
    } catch (e) {}
    return { ...DEFAULT_DASHBOARD_LAYOUT };
  },

  saveDashboardLayout(layout, profileId = this.getActiveProfileId()) {
    try {
      const key = this._resolveKey(STORAGE_KEYS.DASHBOARD_LAYOUT, profileId);
      localStorage.setItem(key, JSON.stringify(layout));
      return layout;
    } catch (e) {
      return layout;
    }
  },

  // ==========================================
  // 6. CONFIGURAÇÃO DA NUVEM (CLOUD SYNC)
  // ==========================================
  getCloudConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.familyCode === 'FAMILIA-BARRETO') {
          parsed.familyCode = 'DEVOCIONAL-SYNC-RAFAEL';
        }
        return parsed;
      }
    } catch (e) {}
    return {
      familyCode: 'DEVOCIONAL-SYNC-RAFAEL', // Código padrão individual
      lastSyncedAt: null,
      autoSync: true
    };
  },

  saveCloudConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(config));
    } catch (e) {}
  },

  // ==========================================
  // 7. EXPORTAÇÃO / IMPORTAÇÃO INTEGRAL DE BACKUP
  // ==========================================
  exportAllData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles: this.getProfiles(),
      activeProfileId: this.getActiveProfileId(),
      localStorageDump: { ...localStorage }
    };
  },

  importAllData(data) {
    if (!data || !data.localStorageDump) return false;
    try {
      Object.entries(data.localStorageDump).forEach(([k, v]) => {
        if (k.startsWith('devocional_')) {
          localStorage.setItem(k, v);
        }
      });
      return true;
    } catch (e) {
      console.error("Erro ao importar dados:", e);
      return false;
    }
  },

  // ==========================================
  // 8. CONFIGURAÇÕES GERAIS (TEMA)
  // ==========================================
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : { theme: "light", redLetters: true, fontSize: 18 };
    } catch (e) {
      return { theme: "light", redLetters: true, fontSize: 18 };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }
};
