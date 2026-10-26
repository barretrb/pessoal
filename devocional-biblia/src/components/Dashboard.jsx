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
  ArrowRight,
  BookMarked,
  Library
} from 'lucide-react';
import { getMediaForDay } from '../data/dailyMedia';
import { formatDateBR } from '../services/dateUtils';

export default function Dashboard({ 
  days, 
  currentDayId, 
  pendingDayId, 
  allPendingDays = [],
  onSelectDay,
  onToggleComplete,
  chapterProgress = {},
  onOpenBibleNav,
  onOpenStudyInfo
}) {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Mídia do dia atual
  const activeMedia = getMediaForDay(currentDayId);
  const currentDayData = days.find(d => d.id === currentDayId);
  const pendingDayData = pendingDayId ? days.find(d => d.id === pendingDayId) : null;

  // Estatísticas
  const totalCompleted = days.filter(d => d.completed).length;
  const progressPercent = Math.round((totalCompleted / 365) * 100);

  // Filtro de dias
  const filteredDays = days.filter(d => {
    if (filter === 'completed') return d.completed;
    if (filter === 'pending') return !d.completed && d.id <= currentDayId;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* 1. MÚSICA DEVOCIONAL DO DIA (YouTube Music) - Destaque no topo */}
      {activeMedia && activeMedia.music && (
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

          {/* Player Embutido de YouTube Music */}
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

          {/* Efeito sutil de brilho de fundo */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </section>
      )}

      {/* 2. ALERTA EXTRA SE HOUVER MÚLTIPLAS LEITURAS PENDENTES */}
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

      {/* 3. CARDS PRINCIPAIS: PENDÊNCIA E LEITURA DE HOJE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card de Pendência */}
        {pendingDayData ? (
          <div className="relative rounded-3xl border-2 border-rose-300 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/80 to-white dark:from-rose-950/20 dark:to-zinc-900/40 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
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

            {/* Chips de Capítulos com Status Individual */}
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
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 flex flex-col justify-center items-center text-center">
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
          <div className="relative rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-zinc-900/40 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
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
              Leitura programada para a caminhada diária de fé.
            </p>

            {/* Chips de Capítulos de Hoje */}
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

      {/* 4. BANNER NOVO: BÍBLIA DE ESTUDOS & NAVEGAÇÃO LIVRE (Itens 6 e 7) */}
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

      {/* 5. VÍDEO DE ESTUDO & VISÃO GERAL (BibleProject) */}
      {activeMedia && activeMedia.video && (
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

      {/* 6. PROGRESSO DO PLANO & CALENDÁRIO 365 DIAS */}
      <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 sm:p-8 space-y-6">
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

    </div>
  );
}
