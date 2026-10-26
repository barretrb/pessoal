import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Gauge
} from 'lucide-react';

export default function AudioPlayerBar({
  bookName,
  chapterNumber,
  audioStatus,
  onPlay,
  onPause,
  onResume,
  onStop,
  onNextVerse,
  onPrevVerse,
  onChangeRate
}) {
  if (!audioStatus || audioStatus.status === 'stopped') {
    return null;
  }

  const rates = [1.0, 1.25, 1.5];
  const currentRate = audioStatus.rate || 1.0;

  const cycleRate = () => {
    const nextIdx = (rates.indexOf(currentRate) + 1) % rates.length;
    onChangeRate(rates[nextIdx]);
  };

  return (
    <div className="fixed bottom-18 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] max-w-lg bg-zinc-900/95 dark:bg-zinc-900/95 text-white rounded-2xl shadow-2xl p-3 border border-amber-500/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 transition-all">
      <div className="flex items-center justify-between gap-3">
        
        {/* Informações da Narração */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-amber-400 truncate">
                {bookName} {chapterNumber}
              </span>
              {audioStatus.currentVerse && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded-full shrink-0">
                  v. {audioStatus.currentVerse}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              {audioStatus.isPlaying ? 'Narrando em áudio...' : 'Áudio pausado'}
            </p>
          </div>
        </div>

        {/* Controles de Áudio */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          
          {/* Botão Velocidade (1x / 1.25x / 1.5x) */}
          <button
            onClick={cycleRate}
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-amber-300 transition-colors"
            title="Alternar velocidade da narração"
          >
            {currentRate}x
          </button>

          {/* Versículo Anterior */}
          <button
            onClick={onPrevVerse}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Versículo anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={audioStatus.isPlaying ? onPause : onResume}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md font-bold transition-transform active:scale-95"
            title={audioStatus.isPlaying ? "Pausar Narração" : "Retomar Narração"}
          >
            {audioStatus.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Próximo Versículo */}
          <button
            onClick={onNextVerse}
            className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Próximo versículo"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Parar / Fechar */}
          <button
            onClick={onStop}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Parar narração"
          >
            <Square className="w-4 h-4 fill-current text-xs" />
          </button>

        </div>

      </div>
    </div>
  );
}
