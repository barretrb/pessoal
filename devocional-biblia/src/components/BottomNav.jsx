import React from 'react';
import { 
  Home, 
  Library, 
  BookMarked, 
  Bookmark,
  AlertCircle
} from 'lucide-react';

export default function BottomNav({
  currentView,
  onGoHome,
  onOpenBibleNav,
  onOpenStudyInfo,
  onOpenFavorites,
  pendingDayId
}) {
  const isHomeActive = currentView === 'dashboard';
  const isReaderActive = currentView === 'reader';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-900/95 sepia:bg-[#f4e4c1]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] shadow-lg transition-colors">
      <div className="grid grid-cols-4 h-15 items-center px-2 max-w-md mx-auto">
        
        {/* Aba 1: Início / Panorama */}
        <button
          onClick={onGoHome}
          className={`relative flex flex-col items-center justify-center py-1 transition-all ${
            isHomeActive 
              ? 'text-amber-600 dark:text-amber-400 font-semibold scale-105' 
              : 'text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {pendingDayId && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
            {pendingDayId && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Início</span>
        </button>

        {/* Aba 2: Bíblia (66 Livros) */}
        <button
          onClick={onOpenBibleNav}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isReaderActive 
              ? 'text-amber-600 dark:text-amber-400 font-semibold' 
              : 'text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Bíblia</span>
        </button>

        {/* Aba 3: Bíblia de Estudos */}
        <button
          onClick={() => onOpenStudyInfo && onOpenStudyInfo()}
          className="flex flex-col items-center justify-center py-1 text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Estudos</span>
        </button>

        {/* Aba 4: Meus Favoritos */}
        <button
          onClick={onOpenFavorites}
          className="flex flex-col items-center justify-center py-1 text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] hover:text-amber-600 dark:hover:text-amber-400 transition-all"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Favoritos</span>
        </button>

      </div>
    </nav>
  );
}
