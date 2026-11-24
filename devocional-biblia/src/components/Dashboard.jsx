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
  Compass,
  GitCommit,
  LogOut,
  Disc3
} from 'lucide-react';
import { getMediaForDay, EXPANDED_DEVOTIONAL_CATALOG, getMusicForChapter } from '../data/dailyMedia';
import { formatDateBR } from '../services/dateUtils';
import { telemetryService } from '../services/telemetryService';

const MONTH_PILLS = [
  { id: '01', label: 'Jan' },
  { id: '02', label: 'Fev' },
  { id: '03', label: 'Mar' },
  { id: '04', label: 'Abr' },
  { id: '05', label: 'Mai' },
  { id: '06', label: 'Jun' },
  { id: '07', label: 'Jul' },
  { id: '08', label: 'Ago' },
  { id: '09', label: 'Set' },
  { id: '10', label: 'Out' },
  { id: '11', label: 'Nov' },
  { id: '12', label: 'Dez' },
  { id: 'all', label: 'Ano Todo (365)' }
];

export default function Dashboard({ 
  days, 
  currentDayId, 
  pendingDayId, 
  allPendingDays = [],
  onSelectDay,
  onToggleComplete,
  onToggleChapter,
  chapterProgress = {},
  onOpenBibleNav,
  onOpenStudyInfo,
  onOpenBibleArc,
  activeProfile,
  onOpenProfiles,
  dashboardLayout,
  onUpdateDashboardLayout,
  onResetDashboardLayout,
  onOpenMaps,
  onOpenTelemetry,
  onOpenCustomize,
  onOptInPlan,
  onOptOutPlan,
  onLogout
}) {
  const currentDayData = days.find(d => d.id === currentDayId);
  const currentMonthStr = currentDayData?.date ? currentDayData.date.split('-')[1] : '11';

  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [chapterMusicOverrides, setChapterMusicOverrides] = useState({});
  const [playingChapterIndex, setPlayingChapterIndex] = useState(null);

  const activeMedia = getMediaForDay(currentDayId, currentDayData);
  const pendingDayData = pendingDayId ? days.find(d => d.id === pendingDayId) : null;

  const currentReadings = currentDayData?.readings && currentDayData.readings.length > 0
    ? currentDayData.readings
    : ['1 Coríntios 14', '1 Coríntios 15', '1 Coríntios 16'];

  const firstReadingParts = (currentReadings[0] || '1 Coríntios 14').trim().split(/\s+/);
  const activeChapterNum = firstReadingParts.pop() || '1';
  const activeBookName = firstReadingParts.join(' ') || '1 Coríntios';

  const chapterMusics = currentReadings.map((reading, idx) => {
    const override = chapterMusicOverrides[idx];
    return getMusicForChapter(currentDayId, reading, idx, override);
  });

  const handleCycleChapterMusic = (readingIndex) => {
    telemetryService.track('music_cycle', { chapter: currentReadings[readingIndex] });
    setChapterMusicOverrides(prev => {
      const current = prev[readingIndex] !== undefined
        ? prev[readingIndex]
        : (getMusicForChapter(currentDayId, currentReadings[readingIndex], readingIndex).artistIndex ?? 0);
      const next = (current + 1) % EXPANDED_DEVOTIONAL_CATALOG.length;
      return {
        ...prev,
        [readingIndex]: next
      };
    });
  };

  const isRafael = activeProfile?.id === 'default' || activeProfile?.name?.trim().toLowerCase() === 'rafael' || activeProfile?.role === 'admin';
  const isPlanActive = activeProfile?.planOptIn !== false;
  const startDay = isRafael ? 1 : (activeProfile?.startDayId || 1);
  const totalDaysInUserPlan = Math.max(1, 365 - startDay + 1);

  const totalCompleted = days.filter(d => d.completed && (isRafael || d.id >= startDay)).length;
  const progressPercent = Math.min(100, Math.round((totalCompleted / (isRafael ? 365 : totalDaysInUserPlan)) * 100));

  const filteredDays = days.filter(d => {
    if (filter === 'completed' && !d.completed) return false;
    if (filter === 'pending' && (d.completed || d.id < startDay || d.id > currentDayId)) return false;
    if (filter !== 'pending' && selectedMonth !== 'all') {
      const m = d.date ? d.date.split('-')[1] : '';
      if (m !== selectedMonth) return false;
    }
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

  const SectionControls = ({ secId, index, dark = false }) => {
    const isCol = !!collapsed[secId];
    const btnClass = dark
      ? 'p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 rounded transition-colors cursor-pointer'
      : 'p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 rounded transition-colors cursor-pointer';
    return (
      <div className="flex items-center space-x-0.5">
        <button
          onClick={() => moveSection(index, -1)}
          disabled={index === 0}
          className={`hidden sm:inline-flex ${btnClass}`}
          title="Mover seção para cima"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => moveSection(index, 1)}
          disabled={index === order.length - 1}
          className={`hidden sm:inline-flex ${btnClass}`}
          title="Mover seção para baixo"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => toggleCollapse(secId)}
          className={`${btnClass} ml-1`}
          title={isCol ? "Expandir seção" : "Recolher seção"}
        >
          {isCol ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  // 1. SEÇÃO: LEITURA DO DIA & PENDÊNCIAS
  const renderTodayPending = (index) => {
    if (!isPlanActive || hidden['todayPending']) return null;
    const isCol = !!collapsed['todayPending'];

    if (isCol) {
      return (
        <div 
          key="todayPending"
          onClick={() => toggleCollapse('todayPending')}
          className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex items-center justify-between hover:border-amber-400 transition-colors shadow-2xs"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Leitura de Hoje: {currentDayData?.readings.join(', ')} (Dia {currentDayId})
              </p>
              <p className="text-[11px] text-zinc-500">
                {pendingDayId ? `Dia ${pendingDayId} pendente` : 'Plano em dia'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center">
            Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      );
    }

    return (
      <div key="todayPending" className="space-y-4">
        {allPendingDays && allPendingDays.length > 1 && (
          <div className="p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Leituras para recuperar:</strong> {allPendingDays.length} dias anteriores em aberto.
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5">
              {allPendingDays.map(pd => (
                <button
                  key={pd.id}
                  onClick={() => onSelectDay(pd.id)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-rose-900/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold text-rose-800 dark:text-rose-100 transition-colors cursor-pointer"
                >
                  Dia {pd.id} ({formatDateBR(pd.date)})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={pendingDayData ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5" : "w-full"}>
          {/* Card de Pendência */}
          {pendingDayData && (
            <div className="relative rounded-3xl border border-rose-300/80 dark:border-rose-900/60 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-bold uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Leitura Anterior Pendente</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">
                    Dia {pendingDayData.id} • {formatDateBR(pendingDayData.date)}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {pendingDayData.readings.join(', ')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  Toque nos capítulos abaixo para marcar os já concluídos ou abrir a leitura.
                </p>

                <div className="flex items-center flex-wrap gap-2 mb-6">
                  {pendingDayData.readings.map(r => {
                    const isDone = !!chapterProgress[r]?.completed;
                    return (
                      <button 
                        key={r}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleChapter) onToggleChapter(r, !isDone);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                          isDone 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                            : 'bg-stone-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:border-rose-300'
                        }`}
                      >
                        <span>{r}</span>
                        <span className="text-[10px] opacity-75">{isDone ? '✓ Lido' : '• pendente'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => onSelectDay(pendingDayData.id)}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <span>Ler Dia {pendingDayData.id} Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Card Principal: Leitura de Hoje (Design Editorial) */}
          {currentDayData && (
            <div className="relative rounded-3xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/25 text-[11px] font-bold uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hoje • {formatDateBR(currentDayData.date, true)}</span>
                    </span>
                    {!pendingDayData && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Em Dia</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Dia {currentDayData.id} de 365
                    </span>
                    <SectionControls secId="todayPending" index={index} />
                  </div>
                </div>

                <h2 className="font-display text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
                  {currentDayData.readings.join(', ')}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                  Texto bíblico oficial na Nova Versão Transformadora (NVT) com referências exegéticas e comentários.
                </p>

                <div className="flex items-center flex-wrap gap-2 mb-6">
                  {currentDayData.readings.map(r => {
                    const isDone = !!chapterProgress[r]?.completed;
                    return (
                      <button 
                        key={r}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleChapter) onToggleChapter(r, !isDone);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                          isDone 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                            : 'bg-[#F8F6F1] dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border-stone-200 dark:border-zinc-700 hover:border-amber-500/60'
                        }`}
                        title={isDone ? `Capítulo ${r} concluído! Clique para alternar` : `Clique para marcar ${r} como concluído`}
                      >
                        <span>{r}</span>
                        <span className="text-[10px] opacity-75">{isDone ? '✓ Lido' : '• a ler'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => onSelectDay(currentDayData.id)}
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400 dark:text-white" />
                <span>{currentDayData.completed ? 'Rever Leitura de Hoje (NVT)' : 'Iniciar Leitura de Hoje (NVT)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 2. SEÇÃO: LOUVOR & MÚSICA DEVOCIONAL POR CAPÍTULO (DECK DE ESTÚDIO EDITORIAL)
  const renderMusic = (index) => {
    if (hidden['music'] || !activeMedia?.music) return null;
    const isCol = !!collapsed['music'];

    if (isCol) {
      return (
        <div 
          key="music"
          onClick={() => toggleCollapse('music')}
          className="p-4 rounded-2xl bg-zinc-900 text-zinc-100 border border-zinc-800 cursor-pointer flex items-center justify-between hover:border-amber-500/40 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                Trilha Devocional por Capítulo ({currentReadings.join(', ')})
              </p>
              <p className="text-[11px] text-zinc-400">
                {chapterMusics.map(m => `${m.chapter}: ${m.title} (${m.artist})`).join(' • ')}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 flex items-center">
            Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      );
    }

    return (
      <section key="music" className="rounded-3xl bg-zinc-900 dark:bg-zinc-900/95 text-zinc-100 border border-zinc-800 p-5 sm:p-7 shadow-sm space-y-5">
        {/* Cabeçalho do Deck Musical */}
        <div className="flex items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
              <Disc3 className="w-3.5 h-3.5" />
              <span>Curadoria Musical por Capítulo • YouTube Music</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sintonia Devocional para {currentReadings.join(', ')}
            </h3>
          </div>
          <SectionControls secId="music" index={index} dark />
        </div>

        {/* Grade de 3 Cards de Estúdio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chapterMusics.map((chapterMusic, idx) => (
            <div 
              key={chapterMusic.chapter || idx}
              className="bg-zinc-800/60 hover:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-700/70 hover:border-amber-500/40 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Topo: Capítulo & Duração */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold text-[11px] uppercase tracking-wider">
                    <BookOpen className="w-3 h-3" />
                    <span>{chapterMusic.chapter}</span>
                  </span>
                  {chapterMusic.duration && (
                    <span className="text-[11px] font-medium text-zinc-400">
                      {chapterMusic.duration}
                    </span>
                  )}
                </div>

                {/* Título, Artista e Álbum */}
                <div className="mb-2.5">
                  <h4 className="font-display font-bold text-lg text-white leading-snug" title={chapterMusic.title}>
                    {chapterMusic.title}
                  </h4>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5">
                    {chapterMusic.artist}
                    {chapterMusic.album ? <span className="text-zinc-400 font-normal"> • {chapterMusic.album}</span> : null}
                  </p>
                </div>

                {/* Conexão Temática com o Capítulo */}
                {chapterMusic.theme && (
                  <p className="text-[11px] font-semibold text-zinc-300 mb-1.5">
                    {chapterMusic.theme}
                  </p>
                )}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                  {chapterMusic.description}
                </p>
              </div>

              {/* Ações */}
              <div className="space-y-2 pt-3 border-t border-zinc-700/60">
                <div className="flex items-center gap-2">
                  <a
                    href={chapterMusic.youtubeMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => telemetryService.track('music_play_youtube_music', { chapter: chapterMusic.chapter, title: chapterMusic.title, artist: chapterMusic.artist })}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
                    title={`Ouvir ${chapterMusic.title} no YouTube Music`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>YouTube Music</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>

                  <button
                    onClick={() => handleCycleChapterMusic(idx)}
                    className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-zinc-700/70 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 font-medium text-xs transition-colors shrink-0 cursor-pointer"
                    title="Trocar por outra música do catálogo devocional"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trocar</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const nextState = playingChapterIndex === idx ? null : idx;
                    if (nextState !== null) {
                      telemetryService.track('music_play_in_app', { chapter: chapterMusic.chapter, title: chapterMusic.title });
                    }
                    setPlayingChapterIndex(nextState);
                  }}
                  className="w-full text-center text-[11px] text-zinc-400 hover:text-amber-300 py-1 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-amber-400" />
                  <span>{playingChapterIndex === idx ? 'Ocultar Player Compacto' : 'Ouvir Prévia no App'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Player Compacto in-app */}
        {playingChapterIndex !== null && chapterMusics[playingChapterIndex] && (
          <div className="pt-3 border-t border-zinc-800">
            <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 max-w-2xl mx-auto">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Reproduzindo • {chapterMusics[playingChapterIndex].chapter}
                  </span>
                  <h5 className="text-sm font-bold text-white">
                    {chapterMusics[playingChapterIndex].title} — {chapterMusics[playingChapterIndex].artist}
                  </h5>
                </div>
                <button 
                  onClick={() => setPlayingChapterIndex(null)}
                  className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 cursor-pointer"
                >
                  Fechar ✕
                </button>
              </div>
              <div className="h-24 w-full rounded-xl overflow-hidden bg-black">
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
        )}
      </section>
    );
  };

  // 3. SEÇÃO: BÍBLIA DE ESTUDOS & FERRAMENTAS EXEGÉTICAS (CONECTADA AO LIVRO ATIVO)
  const renderStudyBanner = (index) => {
    if (hidden['studyBanner']) return null;
    const isCol = !!collapsed['studyBanner'];

    if (isCol) {
      return (
        <div 
          key="studyBanner"
          onClick={() => toggleCollapse('studyBanner')}
          className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex items-center justify-between hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Ferramentas Exegéticas & Estudo de {activeBookName}
              </p>
              <p className="text-[11px] text-zinc-500">
                Contexto histórico, BibleArc, Atlas e 66 Livros
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center">
            Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      );
    }

    return (
      <section key="studyBanner" className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 leading-tight">
                Bíblia de Estudos & Ferramentas Exegéticas
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Aprofunde a leitura de hoje (<strong>{activeBookName}</strong>) com contexto histórico, arqueamento lógico e mapas.
              </p>
            </div>
          </div>
          <SectionControls secId="studyBanner" index={index} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => {
              telemetryService.track('theological_commentary_view', { book: activeBookName });
              onOpenStudyInfo && onOpenStudyInfo(activeBookName);
            }}
            className="p-3 rounded-2xl bg-[#F8F6F1] dark:bg-zinc-800/70 border border-stone-200/80 dark:border-zinc-700/70 hover:border-amber-500/60 text-left transition-all cursor-pointer group"
          >
            <BookMarked className="w-4 h-4 text-amber-700 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              Estudo de {activeBookName}
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
              Autor, época e estrutura
            </div>
          </button>

          <button
            onClick={() => {
              telemetryService.track('bible_arc_view', { book: activeBookName, chapter: activeChapterNum });
              onOpenBibleArc && onOpenBibleArc(activeBookName, activeChapterNum);
            }}
            className="p-3 rounded-2xl bg-[#F8F6F1] dark:bg-zinc-800/70 border border-stone-200/80 dark:border-zinc-700/70 hover:border-amber-500/60 text-left transition-all cursor-pointer group"
          >
            <GitCommit className="w-4 h-4 text-amber-700 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              BibleArc ({activeBookName} {activeChapterNum})
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
              Arqueamento de discurso
            </div>
          </button>

          <button
            onClick={() => {
              telemetryService.track('biblical_maps_view', { source: 'dashboard_banner' });
              onOpenMaps && onOpenMaps();
            }}
            className="p-3 rounded-2xl bg-[#F8F6F1] dark:bg-zinc-800/70 border border-stone-200/80 dark:border-zinc-700/70 hover:border-amber-500/60 text-left transition-all cursor-pointer group"
          >
            <Compass className="w-4 h-4 text-amber-700 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              Atlas Bíblico
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
              Mapas e rotas históricas
            </div>
          </button>

          <button
            onClick={() => {
              telemetryService.track('free_bible_nav', { source: 'dashboard_banner' });
              onOpenBibleNav && onOpenBibleNav();
            }}
            className="p-3 rounded-2xl bg-[#F8F6F1] dark:bg-zinc-800/70 border border-stone-200/80 dark:border-zinc-700/70 hover:border-amber-500/60 text-left transition-all cursor-pointer group"
          >
            <Library className="w-4 h-4 text-amber-700 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              Navegar 66 Livros
            </div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
              Antigo e Novo Testamento
            </div>
          </button>
        </div>
      </section>
    );
  };

  // 4. SEÇÃO: VÍDEO DE ESTUDO RELACIONADO (BIBLEPROJECT)
  const renderVideo = (index) => {
    if (hidden['video'] || !activeMedia?.video) return null;
    const isCol = !!collapsed['video'];

    if (isCol) {
      return (
        <div 
          key="video"
          onClick={() => toggleCollapse('video')}
          className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex items-center justify-between hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{activeMedia.video.title}</p>
              <p className="text-[11px] text-zinc-500">{activeMedia.video.channel}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center">
            Assistir <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      );
    }

    return (
      <section key="video" className="rounded-3xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {activeMedia.video.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                  Síntese Visual • {activeBookName}
                </span>
              </div>
              {activeMedia.video.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  {activeMedia.video.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                const next = !showVideoPlayer;
                if (next) {
                  telemetryService.track('bible_project_video_play', { book: activeBookName, video: activeMedia.video.title });
                }
                setShowVideoPlayer(next);
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-amber-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{showVideoPlayer ? 'Fechar Vídeo' : 'Assistir Panorama'}</span>
            </button>
            <SectionControls secId="video" index={index} />
          </div>
        </div>

        {showVideoPlayer && (
          <div className="mt-4 space-y-2">
            <div className="aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-md bg-black border border-zinc-800">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeMedia.video.youtubeId}?rel=0`}
                title={activeMedia.video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {activeMedia.video.searchUrl && (
              <div className="text-center">
                <a
                  href={activeMedia.video.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Abrir no canal oficial BibleProject Português no YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  // 5. SEÇÃO: PANORAMA ANUAL • 365 DIAS (COM NAVEGAÇÃO MENSAL EDITORIAL)
  const renderCalendar = (index) => {
    if (!isPlanActive || hidden['calendar']) return null;
    const isCol = !!collapsed['calendar'];

    if (isCol) {
      return (
        <div 
          key="calendar"
          onClick={() => toggleCollapse('calendar')}
          className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex items-center justify-between hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Jornada Anual: {totalCompleted} de 365 dias concluídos ({progressPercent}%)
              </p>
              <div className="w-36 bg-stone-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-amber-600 h-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center">
            Abrir Calendário <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      );
    }

    return (
      <section key="calendar" className="rounded-3xl border border-stone-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Jornada Anual • 365 Dias</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {totalCompleted} de 365 dias concluídos ({progressPercent}% do plano anual)
            </p>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <div className="flex items-center space-x-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs' : 'text-zinc-500'
                }`}
              >
                Por Mês
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filter === 'pending' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs' : 'text-zinc-500'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filter === 'completed' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs' : 'text-zinc-500'
                }`}
              >
                Lidos ({totalCompleted})
              </button>
            </div>
            <SectionControls secId="calendar" index={index} />
          </div>
        </div>

        {/* Barra de Progresso Editorial */}
        <div className="w-full bg-stone-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-amber-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Seletor de Mês (evita poluição de planilha de 365 células de uma só vez) */}
        {filter !== 'pending' && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {MONTH_PILLS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedMonth === m.id
                    ? 'bg-zinc-900 dark:bg-amber-600 text-white shadow-2xs'
                    : 'bg-[#F8F6F1] dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200/70'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Grade de Dias do Mês / Filtro */}
        {filteredDays.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Nenhum dia encontrado para este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto pr-1">
            {filteredDays.map(d => {
              const isToday = d.id === currentDayId;
              const isPending = !d.completed && d.id >= startDay && d.id < currentDayId;
              const isBeforeStart = d.id < startDay;
              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDay(d.id)}
                  className={`group relative p-2.5 rounded-xl text-left cursor-pointer transition-all border ${
                    isToday
                      ? 'border-amber-600 bg-amber-50/90 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 font-bold ring-1 ring-amber-500'
                      : isPending
                      ? 'border-rose-300 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-semibold'
                      : d.completed
                      ? 'border-stone-200 dark:border-zinc-800 bg-[#F8F6F1]/70 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-amber-400'
                      : isBeforeStart
                      ? 'border-dashed border-stone-200 dark:border-zinc-800 opacity-50 text-zinc-400'
                      : 'border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-amber-400'
                  }`}
                  title={`Dia ${d.id} (${formatDateBR(d.date)}): ${d.readings.join(', ')}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-zinc-400">
                      {d.date.split('-').slice(1).reverse().join('/')}
                    </span>
                    {d.completed && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs font-bold mt-0.5 truncate">
                    Dia {d.id}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {d.readings[0]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-7 space-y-5">
      
      {/* CABEÇALHO EDITORIAL DO PAINEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/90 dark:border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{isPlanActive ? 'Jornada Devocional de' : 'Biblioteca Teológica de'}</span>
            <button
              onClick={onOpenProfiles}
              className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-amber-700 dark:hover:text-amber-400 underline decoration-amber-500/50 underline-offset-4 cursor-pointer"
            >
              {activeProfile?.name || 'Leitor'}
            </button>
            <span>•</span>
            <span>{isPlanActive ? `${totalCompleted} de 365 dias (${progressPercent}%)` : 'Leitura Livre'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {(activeProfile?.role === 'admin' || activeProfile?.id === 'default') && (
            <button
              onClick={onOpenTelemetry}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-amber-500/50 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Monitorar métricas de uso de todas as funcionalidades"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Métricas de Uso</span>
            </button>
          )}

          <button
            onClick={() => {
              telemetryService.track('dashboard_customize');
              onOpenCustomize && onOpenCustomize();
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-amber-500/50 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Reordenar ou ocultar seções da tela inicial"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Organizar Painel</span>
          </button>
        </div>
      </div>

      {/* SEÇÕES DO PAINEL */}
      {order.map((secId, idx) => {
        const renderFn = renderSectionMap[secId];
        return renderFn ? renderFn(idx) : null;
      })}

    </div>
  );
}
