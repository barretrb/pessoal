// Serviço de Sincronização e Dados em Nuvem via Supabase
import { supabase } from './supabaseClient.js';
import { storage } from './storage.js';

class SupabaseSyncService {
  constructor() {
    this.currentUser = null;
    this.realtimeChannel = null;
    this.onRemoteUpdateCallbacks = new Set();
    this._initAuthListener();
  }

  _initAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentUser = session?.user || null;
      if (this.currentUser) {
        await this._migrateLocalDataIfEmpty();
        this._setupRealtimeSubscription();
      } else {
        this._teardownRealtime();
      }
    });
  }

  async getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    const { data: { user } } = await supabase.auth.getUser();
    this.currentUser = user || null;
    return this.currentUser;
  }

  // Registra callback para atualizações em tempo real recebidas de outro aparelho
  onRemoteUpdate(callback) {
    this.onRemoteUpdateCallbacks.add(callback);
    return () => this.onRemoteUpdateCallbacks.delete(callback);
  }

  _notifyRemoteUpdate(payload) {
    this.onRemoteUpdateCallbacks.forEach(cb => {
      try { cb(payload); } catch (e) { console.error('Erro no callback de update remoto:', e); }
    });
  }

  _setupRealtimeSubscription() {
    if (!this.currentUser) return;
    this._teardownRealtime();

    this.realtimeChannel = supabase.channel(`user-sync-${this.currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devotional_progress',
          filter: `user_id=eq.${this.currentUser.id}`
        },
        (payload) => {
          this._notifyRemoteUpdate({ type: 'devotional_progress', payload });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapter_progress',
          filter: `user_id=eq.${this.currentUser.id}`
        },
        (payload) => {
          this._notifyRemoteUpdate({ type: 'chapter_progress', payload });
        }
      )
      .subscribe();
  }

  _teardownRealtime() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  // Migração transparente de dados locais do localStorage para o Supabase no primeiro login
  async _migrateLocalDataIfEmpty() {
    if (!this.currentUser) return;

    try {
      // 1. Verificar se já existem registros no Supabase para este usuário
      const { count, error: countErr } = await supabase
        .from('devotional_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.currentUser.id);

      if (countErr || (count && count > 0)) {
        // Já possui dados em nuvem, não sobrescreve
        return;
      }

      console.log('Iniciando migração suave do histórico local para o Supabase...');
      const localProgress = storage.getProgress();
      const rowsToInsert = [];

      localProgress.forEach(day => {
        if (day && day.completed) {
          rowsToInsert.push({
            user_id: this.currentUser.id,
            day_number: day.id,
            completed: true,
            completed_at: day.completedAt || new Date().toISOString()
          });
        }
      });

      if (rowsToInsert.length > 0) {
        // Inserir em lotes de 100 para alta confiabilidade
        for (let i = 0; i < rowsToInsert.length; i += 100) {
          const chunk = rowsToInsert.slice(i, i + 100);
          await supabase.from('devotional_progress').upsert(chunk, { onConflict: 'user_id,day_number' });
        }
        console.log(`✓ Migrados ${rowsToInsert.length} dias concluídos para o Supabase!`);
      }

      // Migrar favoritos locais
      const localFavs = storage.getFavorites();
      if (Array.isArray(localFavs) && localFavs.length > 0) {
        const favRows = localFavs.map(f => ({
          user_id: this.currentUser.id,
          verse_key: f.key,
          verse_text: f.text || ''
        }));
        await supabase.from('user_favorites').upsert(favRows, { onConflict: 'user_id,verse_key' });
        console.log(`✓ Migrados ${favRows.length} versículos favoritos para o Supabase!`);
      }
    } catch (e) {
      console.warn('Nota: migração automática local -> nuvem pausada:', e);
    }
  }

  // Salva o status de um dia do plano devocional no Supabase
  async saveDayProgress(dayId, isCompleted) {
    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('devotional_progress')
        .upsert(
          {
            user_id: user.id,
            day_number: Number(dayId),
            completed: Boolean(isCompleted),
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,day_number' }
        )
        .select();

      return { data, error };
    } catch (err) {
      console.error('Erro ao salvar progresso no Supabase:', err);
      return { error: err };
    }
  }

  // Carrega todos os dias do plano devocional do Supabase
  async loadDevotionalProgress() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('devotional_progress')
        .select('day_number, completed, completed_at')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao carregar progresso do Supabase:', err);
      return null;
    }
  }

  // Salva o status de um capítulo individual no Supabase
  async saveChapterProgress(bookId, chapter, isCompleted) {
    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chapter_progress')
        .upsert(
          {
            user_id: user.id,
            book_id: String(bookId).toLowerCase(),
            chapter: Number(chapter),
            completed: Boolean(isCompleted),
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,book_id,chapter' }
        )
        .select();

      return { data, error };
    } catch (err) {
      console.error('Erro ao salvar capítulo no Supabase:', err);
      return { error: err };
    }
  }

  // Registra telemetria de uso na nuvem de forma assíncrona (fire-and-forget)
  async trackTelemetry(featureName, metadata = {}) {
    try {
      const user = await this.getCurrentUser();
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

      supabase.from('feature_telemetry').insert([
        {
          user_id: user ? user.id : null,
          feature_name: featureName,
          device_type: isMobile ? 'mobile' : 'desktop',
          metadata
        }
      ]).then(() => {}).catch(() => {});
    } catch (e) {
      // Falha silenciosa para nunca interromper a experiência do usuário
    }
  }
}

export const supabaseSyncService = new SupabaseSyncService();
