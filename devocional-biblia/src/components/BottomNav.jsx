import React from 'react';
import { 
  Home, 
  BookOpen,
  Library, 
  BookMarked, 
  Bookmark
} from 'lucide-react';

export default function BottomNav({
  currentView,
  onGoHome,
  onOpenReaderToday,
  onOpenBibleNav,
  onOpenStudyInfo,
  onOpenFavorites,
  pendingDayId
}) {
  const isHomeActive = currentView === 'dashboard';
  const isReaderActive = currentView === 'reader';

  const tabClass = (active) =>
    `relative flex flex-col items-center justify-center py-1.5 transition-colors cursor-pointer ${
      active
        ? 'text-zinc-950 dark:text-white font-semibold'
        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#111113]/95 sepia:bg-[#FAF6F0]/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 sepia:border-[#E6DBC8]">
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        <button onClick={onGoHome} className={tabClass(isHomeActive)}>
          <div className="relative">
            <Home className="w-5 h-5" strokeWidth={isHomeActive ? 2.4 : 1.9} />
            {pendingDayId && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1">Início</span>
        </button>

        <button onClick={onOpenReaderToday} className={tabClass(isReaderActive)}>
          <BookOpen className="w-5 h-5" strokeWidth={isReaderActive ? 2.4 : 1.9} />
          <span className="text-[10px] mt-1">Ler</span>
        </button>

        <button onClick={onOpenBibleNav} className={tabClass(false)}>
          <Library className="w-5 h-5" strokeWidth={1.9} />
          <span className="text-[10px] mt-1">Livros</span>
        </button>

        <button onClick={() => onOpenStudyInfo && onOpenStudyInfo()} className={tabClass(false)}>
          <BookMarked className="w-5 h-5" strokeWidth={1.9} />
          <span className="text-[10px] mt-1">Estudos</span>
        </button>

        <button onClick={onOpenFavorites} className={tabClass(false)}>
          <Bookmark className="w-5 h-5" strokeWidth={1.9} />
          <span className="text-[10px] mt-1">Salvos</span>
        </button>
      </div>
    </nav>
  );
}
