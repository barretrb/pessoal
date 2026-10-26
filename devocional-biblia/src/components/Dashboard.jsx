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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BookMarked,
  Library,
  Sliders,
  Users
} from 'lucide-react';
import { getMediaForDay } from '../data/dailyMedia';
import { formatDateBR } from '../services/dateUtils';
import PersonalizarDashboardModal from './PersonalizarDashboardModal';

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
  onResetDashboardLayout
}) {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Mídia do dia atual
  const activeMedia = getMediaForDay(currentDayId);
  const currentDayData = days.find(d => d.id === currentDayId);
  const pendingDayData = pendingDayId ? days.find(d => d.id === pendingDayId) : null;

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
                <p className="text-xs font-bold">{activeMedia.music.title} - {activeMedia.music.artist}</p>
                <p className="text-[11px] text-amber-100">{activeMedia.theme}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-100 flex items-center">
              Ouvir / Expandir <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        ) : (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white shadow-xl shadow-orange-950/10 p-6 sm:p-8">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-amber-100">
                  <Music className="w-3.5 h-3.5 animate-bounce" />
                  <span>Música Devocional do Dia • YouTube Music</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activeMedia.music.title}
                </h2>
                <p className="text-sm sm:text-base text-amber-100/90 font-medium">
                  {activeMedia.music.artist} • <span className="italic">{activeMedia.theme}</span>
                </p>
                <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                  {activeMedia.music.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                  className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-white text-zinc-900 font-bold text-sm shadow-lg hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current text-orange-600" />
                  <span>{showMusicPlayer ? 'Ocultar Player' : 'Ouvir Louvor Agora'}</span>
                </button>

                <a
                  href={activeMedia.music.youtubeMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-colors backdrop-blur-xs"
                >
                  <span>Abrir no YouTube Music</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {showMusicPlayer && (
              <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
                <div className="aspect-video w-full max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeMedia.music.youtubeId}?autoplay=1&rel=0`}
                    title="Música Devocional do Dia"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

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
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 cursor-pointer flex items-center justify-between hover:bg-zinc-50 transition-colors"
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
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                    Vídeo de Estudo Relacionado
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeMedia.video.title} • {activeMedia.video.channel}
                  </p>
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
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 cursor-pointer flex items-center justify-between hover:bg-zinc-50 transition-colors"
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

        {/* Botão de Personalizar a Tela Inicial */}
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition-colors"
          title="Personalizar quais caixas exibir e alterar a ordem da tela inicial"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>Personalizar Tela Inicial</span>
        </button>
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

    </div>
  );
}
