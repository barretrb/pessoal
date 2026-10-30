import React, { useState } from 'react';
import { 
  Play, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Flame, 
  Music, 
  Video, 
  Headphones,
  RefreshCw,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BookMarked,
  Library,
  Sliders,
  Users,
  Cloud
} from 'lucide-react';
import { getMediaForDay, PREFERRED_ARTISTS, getMusicForChapter } from '../data/dailyMedia';
import { formatDateBR } from '../services/dateUtils';
import { telemetryService } from '../services/telemetryService';
import PersonalizarDashboardModal from './PersonalizarDashboardModal';
import UsoFeaturesModal from './UsoFeaturesModal';

export default function Dashboard({ 
  days, 
  currentDayId, 
  pendingDayId, 
  allPendingDays = [],
  onSelectDay,
  onToggleComplete,
  chapterProgress = {},
  onOpenBibleNav,
  onOpenStudyInfo,
  activeProfile,
  onOpenProfiles,
  dashboardLayout,
  onUpdateDashboardLayout,
  onResetDashboardLayout,
  onOpenCloud
}) {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [chapterMusicOverrides, setChapterMusicOverrides] = useState({});
  const [playingChapterIndex, setPlayingChapterIndex] = useState(null);

  // Mídia do dia atual
  const currentDayData = days.find(d => d.id === currentDayId);
  const activeMedia = getMediaForDay(currentDayId, currentDayData);
  const pendingDayData = pendingDayId ? days.find(d => d.id === pendingDayId) : null;

  // Leituras e Capítulos do Dia Atual (ex: ['João 1', 'João 2', 'João 3'])
  const currentReadings = currentDayData?.readings && currentDayData.readings.length > 0
    ? currentDayData.readings
    : ['Capítulo 1', 'Capítulo 2', 'Capítulo 3'];

  // Músicas por capítulo (1 música para cada capítulo do dia)
  const chapterMusics = currentReadings.map((reading, idx) => {
    const override = chapterMusicOverrides[idx];
    return getMusicForChapter(currentDayId, reading, idx, override);
  });

  // Alterna dinamicamente a música de um capítulo específico
  const handleCycleChapterMusic = (readingIndex) => {
    telemetryService.track('music_cycle', { chapter: currentReadings[readingIndex] });
    setChapterMusicOverrides(prev => {
      const current = prev[readingIndex] !== undefined
        ? prev[readingIndex]
        : getMusicForChapter(currentDayId, currentReadings[readingIndex], readingIndex).artistIndex;
      const next = (current + 1) % PREFERRED_ARTISTS.length;
      return {
        ...prev,
        [readingIndex]: next
      };
    });
  };

  // Estatísticas do perfil atual
  const totalCompleted = days.filter(d => d.completed).length;
  const progressPercent = Math.round((totalCompleted / 365) * 100);

  // Filtro de dias
  const filteredDays = days.filter(d => {
    if (filter === 'completed') return d.completed;
    if (filter === 'pending') return !d.completed && d.id <= currentDayId;
    return true;
  });

  const order = dashboardLayout?.order || ['todayPending', 'music', 'studyBanner', 'video', 'calendar'];
  const hidden = dashboardLayout?.hidden || {};
  const collapsed = dashboardLayout?.collapsed || {};

  const toggleCollapse = (secId) => {
    const nextCollapsed = { ...collapsed, [secId]: !collapsed[secId] };
    onUpdateDashboardLayout({
      ...dashboardLayout,
      collapsed: nextCollapsed
    });
  };

  const moveSection = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, moved);
    onUpdateDashboardLayout({
      ...dashboardLayout,
      order: newOrder
    });
  };

  // -------------------------------------------------------------
  // RENDERIZADORES INDIVIDUAIS DE CADA CAIXA (WIDGET)
  // -------------------------------------------------------------

  // 1. CAIXA: LEITURA DE HOJE & PENDÊNCIAS
  const renderTodayPending = (index) => {
    if (hidden['todayPending']) return null;
    const isCol = !!collapsed['todayPending'];

    return (
      <div key="todayPending" className="space-y-4">
        {/* Cabeçalho da Caixa com Ações de Colapso e Ordem */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Leituras do Dia & Pendências
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => moveSection(index, -1)}
              disabled={index === 0}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para cima"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveSection(index, 1)}
              disabled={index === order.length - 1}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para baixo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleCollapse('todayPending')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded ml-1"
              title={isCol ? "Expandir caixa" : "Recolher caixa"}
            >
              {isCol ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Conteúdo: Se colapsado, mostra faixa resumida */}
        {isCol ? (
          <div 
            onClick={() => toggleCollapse('todayPending')}
            className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 cursor-pointer flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">📖</span>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Hoje: {currentDayData?.readings.join(', ')} (Dia {currentDayId})
                </p>
                <p className="text-[11px] text-zinc-500">
                  {pendingDayId ? `Atenção: Dia ${pendingDayId} pendente` : 'Tudo em dia'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center">
              Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alerta de múltiplas leituras pendentes */}
            {allPendingDays && allPendingDays.length > 1 && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Atenção:</strong> Você tem <strong>{allPendingDays.length} dias pendentes</strong> acumulados.
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5">
                  {allPendingDays.map(pd => (
                    <button
                      key={pd.id}
                      onClick={() => onSelectDay(pd.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-200/70 dark:bg-rose-900/60 hover:bg-rose-300 font-bold text-rose-900 dark:text-rose-100 transition-colors"
                    >
                      Dia {pd.id} ({formatDateBR(pd.date)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card de Pendência */}
              {pendingDayData ? (
                <div className="relative rounded-3xl border-2 border-rose-300 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/80 to-white dark:from-rose-950/20 dark:to-zinc-900/40 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wide">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Leitura Pendente</span>
                    </div>
                    <span className="text-xs font-semibold text-rose-500">
                      Dia {pendingDayData.id} • {formatDateBR(pendingDayData.date)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    Colocar o Dia {pendingDayData.id} em Dia
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    Passagens: <strong className="text-zinc-900 dark:text-zinc-200">{pendingDayData.readings.join(', ')}</strong>
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 mb-5">
                    {pendingDayData.readings.map(r => {
                      const isDone = !!chapterProgress[r]?.completed;
                      return (
                        <span 
                          key={r}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
                            isDone 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-rose-100/70 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          <span>{r}</span>
                          <span>{isDone ? '✓' : '• a ler'}</span>
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onSelectDay(pendingDayData.id)}
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Recuperar Leitura Pendente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 sm:p-6 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Tudo em Dia!</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Nenhuma leitura pendente anterior. Você está caminhando firme no plano anual!
                  </p>
                </div>
              )}

              {/* Card da Leitura de Hoje */}
              {currentDayData && (
                <div className="relative rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-zinc-900/40 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wide">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Hoje • {formatDateBR(currentDayData.date, true)}</span>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Dia {currentDayData.id} de 365
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {currentDayData.readings.join(', ')}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    Leitura diária da Nova Versão Transformadora.
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 mb-5">
                    {currentDayData.readings.map(r => {
                      const isDone = !!chapterProgress[r]?.completed;
                      return (
                        <span 
                          key={r}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 ${
                            isDone 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <span>{r}</span>
                          <span>{isDone ? '✓' : '• a ler'}</span>
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onSelectDay(currentDayData.id)}
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{currentDayData.completed ? 'Rever Leitura de Hoje' : 'Ler Capítulo de Hoje (NVT)'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 2. CAIXA: MÚSICA DEVOCIONAL DO DIA
  const renderMusic = (index) => {
    if (hidden['music'] || !activeMedia?.music) return null;
    const isCol = !!collapsed['music'];

    return (
      <div key="music" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Louvor & Música Devocional
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => moveSection(index, -1)}
              disabled={index === 0}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para cima"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveSection(index, 1)}
              disabled={index === order.length - 1}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para baixo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleCollapse('music')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded ml-1"
              title={isCol ? "Expandir caixa" : "Recolher caixa"}
            >
              {isCol ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isCol ? (
          <div 
            onClick={() => toggleCollapse('music')}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white cursor-pointer flex items-center justify-between hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🎵</span>
              <div>
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <span>Louvores do Dia • {currentReadings.length} Capítulos ({currentReadings.join(', ')})</span>
                </p>
                <p className="text-[11px] text-amber-100">
                  {chapterMusics.map(m => `${m.chapter}: ${m.title}`).join(' • ')}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-100 flex items-center">
              Ouvir / Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        ) : (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white shadow-xl shadow-orange-950/10 p-6 sm:p-8">
            <div className="relative z-10 space-y-4">
              {/* Cabeçalho da Seção */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-amber-100 mb-2">
                    <Music className="w-3.5 h-3.5" />
                    <span>YouTube Music • Louvor por Capítulo</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Louvores da Leitura de Hoje
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
                    1 música recomendada para cada capítulo. Use o botão <strong>"Trocar"</strong> para alternar a música de qualquer capítulo.
                  </p>
                </div>
              </div>

              {/* Grade de Músicas: 1 para cada Capítulo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {chapterMusics.map((chapterMusic, idx) => (
                  <div 
                    key={chapterMusic.chapter || idx}
                    className="bg-black/25 hover:bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col justify-between transition-all shadow-lg hover:shadow-xl"
                  >
                    <div>
                      {/* Chip do Capítulo e Duração */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wide">
                          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                          <span>{chapterMusic.chapter}</span>
                        </span>
                        {chapterMusic.duration && (
                          <span className="text-[10px] font-semibold text-amber-200 bg-white/10 px-2 py-0.5 rounded-full">
                            ⏱ {chapterMusic.duration}
                          </span>
                        )}
                      </div>

                      {/* Informações da Música */}
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-md border border-white/20 bg-zinc-900">
                          <img 
                            src={`https://img.youtube.com/vi/${chapterMusic.youtubeId}/hqdefault.jpg`} 
                            alt={chapterMusic.title} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Music className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-extrabold text-white truncate leading-tight" title={chapterMusic.title}>
                            {chapterMusic.title}
                          </h3>
                          <p className="text-xs font-semibold text-amber-200 truncate mt-0.5">
                            {chapterMusic.artist}
                          </p>
                          {chapterMusic.album && (
                            <p className="text-[10px] text-white/70 truncate mt-0.5">
                              🎙️ {chapterMusic.album}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-4">
                        {chapterMusic.description}
                      </p>
                    </div>

                    {/* Ações: Ouvir no YouTube Music e Trocar */}
                    <div className="space-y-2 pt-3 border-t border-white/15">
                      <div className="flex items-center gap-2">
                        <a
                          href={chapterMusic.youtubeMusicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => telemetryService.track('music_play_youtube_music', { chapter: chapterMusic.chapter, title: chapterMusic.title, artist: chapterMusic.artist })}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all group"
                          title={`Ouvir ${chapterMusic.title} no YouTube Music`}
                        >
                          <Headphones className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition-transform" />
                          <span>Ouvir no YouTube Music</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>

                        <button
                          onClick={() => handleCycleChapterMusic(idx)}
                          className="inline-flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium text-xs transition-colors shrink-0"
                          title="Trocar a música deste capítulo"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-200" />
                          <span>Trocar</span>
                        </button>
                      </div>

                      {/* Tocar no App */}
                      <button
                        onClick={() => {
                          const nextState = playingChapterIndex === idx ? null : idx;
                          if (nextState !== null) {
                            telemetryService.track('music_play_in_app', { chapter: chapterMusic.chapter, title: chapterMusic.title });
                          }
                          setPlayingChapterIndex(nextState);
                        }}
                        className="w-full text-center text-[11px] text-amber-100/90 hover:text-white py-1 flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current text-amber-300" />
                        <span>{playingChapterIndex === idx ? 'Fechar Player no App' : 'Tocar Áudio Aqui'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Player Compacto de Áudio in-app caso o usuário clique em 'Tocar Áudio Aqui' */}
              {playingChapterIndex !== null && chapterMusics[playingChapterIndex] && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 max-w-2xl mx-auto shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/20 bg-zinc-900">
                        <img 
                          src={`https://img.youtube.com/vi/${chapterMusics[playingChapterIndex].youtubeId}/hqdefault.jpg`} 
                          alt={chapterMusics[playingChapterIndex].title} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Music className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 w-full space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                              Tocando para {chapterMusics[playingChapterIndex].chapter}
                            </div>
                            <div className="text-sm font-bold text-white truncate">
                              {chapterMusics[playingChapterIndex].title}
                            </div>
                            <div className="text-xs text-amber-200 truncate">
                              {chapterMusics[playingChapterIndex].artist} • {chapterMusics[playingChapterIndex].album || 'Gravação em Estúdio'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <a 
                              href={chapterMusics[playingChapterIndex].youtubeMusicUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[11px] font-semibold text-amber-300 hover:text-white underline flex items-center gap-1"
                            >
                              YouTube Music ↗
                            </a>
                            <button 
                              onClick={() => setPlayingChapterIndex(null)}
                              className="text-xs text-white/70 hover:text-white px-2 py-1 rounded-lg bg-white/10"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="h-20 sm:h-24 w-full rounded-xl overflow-hidden bg-black/60 shadow-inner">
                          <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${chapterMusics[playingChapterIndex].youtubeId}?autoplay=1&rel=0`}
                            title={`${chapterMusics[playingChapterIndex].title} - ${chapterMusics[playingChapterIndex].artist}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </section>
        )}
      </div>
    );
  };

  // 3. CAIXA: BÍBLIA DE ESTUDOS & NAVEGAÇÃO LIVRE
  const renderStudyBanner = (index) => {
    if (hidden['studyBanner']) return null;
    const isCol = !!collapsed['studyBanner'];

    return (
      <div key="studyBanner" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <BookMarked className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Estudos & Navegação dos 66 Livros
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => moveSection(index, -1)}
              disabled={index === 0}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para cima"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveSection(index, 1)}
              disabled={index === order.length - 1}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para baixo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleCollapse('studyBanner')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded ml-1"
              title={isCol ? "Expandir caixa" : "Recolher caixa"}
            >
              {isCol ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isCol ? (
          <div 
            onClick={() => toggleCollapse('studyBanner')}
            className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-pointer flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">📚</span>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bíblia de Estudos Completa</p>
                <p className="text-[11px] text-zinc-500">66 Livros, autores, época e temas</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center">
              Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        ) : (
          <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/60 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  Bíblia de Estudos & Navegação Completa
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Consulte autor, destinatários, período histórico e objetivo de qualquer um dos 66 livros.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={onOpenBibleNav}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <Library className="w-4 h-4 text-amber-600" />
                <span>Navegar Livros</span>
              </button>
              
              <button
                onClick={() => onOpenStudyInfo && onOpenStudyInfo('Lucas')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>Ver Bíblia de Estudos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}
      </div>
    );
  };

  // 4. CAIXA: VÍDEO DE ESTUDO RELACIONADO
  const renderVideo = (index) => {
    if (hidden['video'] || !activeMedia?.video) return null;
    const isCol = !!collapsed['video'];

    return (
      <div key="video" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Vídeo Explicativo • BibleProject
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => moveSection(index, -1)}
              disabled={index === 0}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para cima"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveSection(index, 1)}
              disabled={index === order.length - 1}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para baixo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleCollapse('video')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded ml-1"
              title={isCol ? "Expandir caixa" : "Recolher caixa"}
            >
              {isCol ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isCol ? (
          <div 
            onClick={() => toggleCollapse('video')}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 cursor-pointer flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🎬</span>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{activeMedia.video.title}</p>
                <p className="text-[11px] text-zinc-500">{activeMedia.video.channel}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center">
              Assistir / Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        ) : (
          <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Vídeo de Estudo Relacionado</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-semibold tracking-wide">
                      Tema do Dia
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {activeMedia.video.title} • {activeMedia.video.channel}
                  </p>
                  {activeMedia.video.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl line-clamp-2">
                      {activeMedia.video.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>{showVideoPlayer ? 'Fechar Vídeo' : 'Assistir Vídeo'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {showVideoPlayer && (
              <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg bg-black mt-4">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeMedia.video.youtubeId}?rel=0`}
                  title="Vídeo de Estudo Bíblico"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </section>
        )}
      </div>
    );
  };

  // 5. CAIXA: PANORAMA DOS 365 DIAS (CALENDÁRIO)
  const renderCalendar = (index) => {
    if (hidden['calendar']) return null;
    const isCol = !!collapsed['calendar'];

    return (
      <div key="calendar" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Panorama Anual • 365 Dias
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => moveSection(index, -1)}
              disabled={index === 0}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para cima"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => moveSection(index, 1)}
              disabled={index === order.length - 1}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded"
              title="Mover caixa para baixo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleCollapse('calendar')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded ml-1"
              title={isCol ? "Expandir caixa" : "Recolher caixa"}
            >
              {isCol ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isCol ? (
          <div 
            onClick={() => toggleCollapse('calendar')}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 cursor-pointer flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {totalCompleted} de 365 dias lidos ({progressPercent}%)
                </p>
                <div className="w-32 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-amber-500 h-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              Ver Grade Anual <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        ) : (
          <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span>Panorama dos 365 Dias</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {totalCompleted} de 365 dias concluídos ({progressPercent}%)
                </p>
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  Todos (365)
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filter === 'pending' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filter === 'completed' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  Concluídos ({totalCompleted})
                </button>
              </div>
            </div>

            {/* Barra de Progresso Geral */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Grade de Dias */}
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-96 overflow-y-auto pr-1">
              {filteredDays.map(d => {
                const isToday = d.id === currentDayId;
                const isPending = d.id === pendingDayId;
                return (
                  <div
                    key={d.id}
                    onClick={() => onSelectDay(d.id)}
                    className={`group relative p-2 rounded-xl text-center cursor-pointer transition-all border ${
                      isToday
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold ring-2 ring-amber-400'
                        : isPending
                        ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold animate-pulse'
                        : d.completed
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 hover:border-zinc-300'
                    }`}
                    title={`Dia ${d.id}: ${d.readings.join(', ')}`}
                  >
                    <div className="text-[10px] text-zinc-400 leading-none">
                      {d.date.split('-').slice(1).reverse().join('/')}
                    </div>
                    <div className="text-xs font-semibold mt-0.5">
                      {d.id}
                    </div>
                    {d.completed && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute top-1 right-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderSectionMap = {
    todayPending: renderTodayPending,
    music: renderMusic,
    studyBanner: renderStudyBanner,
    video: renderVideo,
    calendar: renderCalendar
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
      
      {/* BARRA SUPERIOR DO DASHBOARD: SAUDAÇÃO AO PERFIL & PERSONALIZAÇÃO DA TELA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        {/* Identificação do Perfil Ativo */}
        <div 
          onClick={onOpenProfiles}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Clique para alternar ou gerenciar perfis"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-xl flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
            {activeProfile?.avatar || '👤'}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Devocional de</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                {activeProfile?.name || 'Leitor'}
              </span>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded-md font-semibold">
                Trocar ⇄
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {totalCompleted} dias concluídos ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botão de Nuvem / Banco de Dados */}
          <button
            onClick={onOpenCloud}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-900/60 text-xs font-bold transition-colors"
            title="Sincronizar dados na nuvem para múltiplos aparelhos"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">Nuvem & Sync</span>
          </button>

          {/* Botão de Métricas de Uso de Features (Telemetria Opção 1) */}
          <button
            onClick={() => setIsTelemetryOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/60 text-xs font-bold transition-colors"
            title="Ver ranking de uso de cada funcionalidade do app"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Métricas de Uso</span>
          </button>

          {/* Botão de Personalizar a Tela Inicial */}
          <button
            onClick={() => {
              telemetryService.track('dashboard_customize');
              setIsCustomizeOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-colors"
            title="Personalizar quais caixas exibir e alterar a ordem da tela inicial"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Personalizar Tela</span>
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO DAS CAIXAS NA ORDEM DEFINIDA PELO USUÁRIO */}
      {order.map((secId, idx) => {
        const renderFn = renderSectionMap[secId];
        return renderFn ? renderFn(idx) : null;
      })}

      {/* Modal de Personalização do Layout da Tela Inicial */}
      <PersonalizarDashboardModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        layout={dashboardLayout}
        onUpdateLayout={onUpdateDashboardLayout}
        onResetLayout={onResetDashboardLayout}
      />

      {/* Modal de Telemetria e Monitoramento de Uso de Features (Opção 1) */}
      <UsoFeaturesModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        activeProfile={activeProfile}
      />

    </div>
  );
}
