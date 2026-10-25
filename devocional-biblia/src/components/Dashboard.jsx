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
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getMediaForDay } from '../data/dailyMedia';

export default function Dashboard({ 
  days, 
  currentDayId, 
  pendingDayId, 
  onSelectDay,
  onToggleComplete 
}) {
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Mídia do dia atual (Dia 298)
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

      {/* 2. CARDS PRINCIPAIS: PENDÊNCIA (Dia 297) E LEITURA DE HOJE (Dia 298) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card de Pendência (Dia 297) */}
        {pendingDayData ? (
          <div className="relative rounded-3xl border-2 border-rose-300 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/80 to-white dark:from-rose-950/20 dark:to-zinc-900/40 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wide">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Leitura Pendente</span>
              </div>
              <span className="text-xs font-semibold text-rose-500">
                Dia {pendingDayData.id} • 24/10
              </span>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Colocar o Dia {pendingDayData.id} em Dia
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Passagens: <strong className="text-zinc-900 dark:text-zinc-200">{pendingDayData.readings.join(', ')}</strong>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 italic">
              "O Bom Samaritano, Marta & Maria, a Oração do Pai Nosso e a Providência Divina."
            </p>

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
              Nenhuma leitura pendente. Você está caminhando firme no plano anual!
            </p>
          </div>
        )}

        {/* Card da Leitura de Hoje (Dia 298) */}
        {currentDayData && (
          <div className="relative rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/20 dark:to-zinc-900/40 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wide">
                <Flame className="w-3.5 h-3.5" />
                <span>Hoje • 25 de Outubro</span>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Dia {currentDayData.id} de 365
              </span>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {currentDayData.readings.join(', ')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              A Porta Estreita, O Grande Banquete, A Ovelha Perdida e o Filho Pródigo.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 italic">
              "Haverá mais alegria no céu por um pecador que se arrepende do que por noventa e nove justos." (Lc 15:7)
            </p>

            <button
              onClick={() => onSelectDay(currentDayData.id)}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ler Capítulo de Hoje (NVT)</span>
            </button>
          </div>
        )}

      </div>

      {/* 3. VÍDEO DE ESTUDO & VISÃO GERAL (BibleProject) */}
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

      {/* 4. PROGRESSO DO PLANO & CALENDÁRIO 365 DIAS */}
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
