// Camada de persistência local para progresso, favoritos, notas e estudos BibleArc

const STORAGE_KEYS = {
  PROGRESS: "devocional_plano_progress_v1",
  CHAPTERS_PROGRESS: "devocional_chapters_progress_v1",
  HIGHLIGHTS: "devocional_highlights_v1",
  FAVORITES: "devocional_favorites_v1",
  NOTES: "devocional_notes_v1",
  BIBLE_ARCS: "devocional_bible_arcs_v1",
  SETTINGS: "devocional_settings_v1",
};

export const HIGHLIGHT_COLORS = {
  yellow: { name: "Promessa / Revelação", bg: "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-l-4 border-amber-400", hex: "#fef08a" },
  green:  { name: "Mandamento / Prática", bg: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-l-4 border-emerald-400", hex: "#a7f3d0" },
  blue:   { name: "Oração / Sabedoria",   bg: "bg-sky-100 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-l-4 border-sky-400", hex: "#bae6fd" },
  purple: { name: "Majestade / Glória",   bg: "bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-l-4 border-purple-400", hex: "#e9d5ff" },
  coral:  { name: "Graça / Amor do Pai",  bg: "bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-l-4 border-rose-400", hex: "#fecdd3" },
};

export const storage = {
  // 1. Progresso dos dias
  getProgress(defaultDays) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial days
        return defaultDays.map(d => ({
          ...d,
          completed: parsed[d.id] ? parsed[d.id].completed : d.completed,
          completedAt: parsed[d.id] ? parsed[d.id].completedAt : d.completedAt
        }));
      }
    } catch (e) {
      console.error("Erro ao ler progresso:", e);
    }
    return defaultDays;
  },

  saveDayProgress(dayId, isCompleted) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const current = stored ? JSON.parse(stored) : {};
      current[dayId] = {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(current));
    } catch (e) {
      console.error("Erro ao salvar progresso do dia:", e);
    }
  },

  // 1.1 Progresso detalhado por capítulo (ex: "Lucas 10", "Lucas 13")
  getChapterProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAPTERS_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  },

  saveChapterProgress(chapterName, isCompleted) {
    try {
      const progress = this.getChapterProgress();
      progress[chapterName] = {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      localStorage.setItem(STORAGE_KEYS.CHAPTERS_PROGRESS, JSON.stringify(progress));
      return progress;
    } catch (e) {
      console.error("Erro ao salvar progresso do capítulo:", e);
      return {};
    }
  },

  setDayChaptersProgress(readings, isCompleted) {
    try {
      const progress = this.getChapterProgress();
      readings.forEach(ch => {
        progress[ch] = {
          completed: isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null
        };
      });
      localStorage.setItem(STORAGE_KEYS.CHAPTERS_PROGRESS, JSON.stringify(progress));
      return progress;
    } catch (e) {
      return {};
    }
  },

  // 2. Destaques (Highlights)
  getHighlights() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  },

  saveHighlight(verseKey, colorKey, note = "") {
    try {
      const highlights = this.getHighlights();
      if (!colorKey) {
        delete highlights[verseKey];
      } else {
        highlights[verseKey] = {
          color: colorKey,
          note,
          updatedAt: new Date().toISOString()
        };
      }
      localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
      return highlights;
    } catch (e) {
      console.error("Erro ao salvar destaque:", e);
      return {};
    }
  },

  saveMultipleHighlights(verseKeys, colorKey) {
    try {
      const highlights = this.getHighlights();
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
      localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
      return highlights;
    } catch (e) {
      console.error("Erro ao salvar múltiplos destaques:", e);
      return {};
    }
  },

  // 3. Favoritos
  getFavorites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  toggleFavorite(verseKey, verseData) {
    try {
      let favs = this.getFavorites();
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
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
      return favs;
    } catch (e) {
      return [];
    }
  },

  toggleMultipleFavorites(versesDataList) {
    try {
      let favs = this.getFavorites();
      const allExist = versesDataList.every(v => favs.some(f => f.key === v.key));
      const now = new Date().toISOString();

      if (allExist) {
        // Remover todos os selecionados
        const keysToRemove = new Set(versesDataList.map(v => v.key));
        favs = favs.filter(f => !keysToRemove.has(f.key));
      } else {
        // Adicionar os que faltam
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
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
      return favs;
    } catch (e) {
      return [];
    }
  },

  // 4. Estudos BibleArc
  getBibleArcs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BIBLE_ARCS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveBibleArc(arcStudy) {
    try {
      let list = this.getBibleArcs();
      const idx = list.findIndex(a => a.id === arcStudy.id);
      if (idx >= 0) {
        list[idx] = { ...arcStudy, updatedAt: new Date().toISOString() };
      } else {
        list.push({ ...arcStudy, id: Date.now().toString(), createdAt: new Date().toISOString() });
      }
      localStorage.setItem(STORAGE_KEYS.BIBLE_ARCS, JSON.stringify(list));
      return list;
    } catch (e) {
      return [];
    }
  },

  // 5. Configurações
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
