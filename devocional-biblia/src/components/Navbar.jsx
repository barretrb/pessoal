import React from 'react';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  Coffee, 
  AlertCircle, 
  Menu
} from 'lucide-react';

export default function Navbar({ 
  pendingDayId, 
  onSelectDay, 
  setCurrentView, 
  theme, 
  setTheme,
  activeProfile,
  onOpenProfiles,
  onOpenDrawer
}) {
  const handleCycleTheme = () => {
    if (theme === 'light') setTheme('sepia');
    else if (theme === 'sepia') setTheme('dark');
    else setTheme('light');
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full backdrop-blur-md border-b bg-white/95 dark:bg-[#111113]/95 sepia:bg-[#FAF6F0]/95 border-zinc-200/80 dark:border-zinc-800/80 sepia:border-[#E6DBC8]">
      <div className="px-3.5 h-14 flex items-center justify-between gap-2 max-w-full">
        {/* Brand */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2 cursor-pointer min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-amber-500 text-amber-400 dark:text-zinc-950 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-sm text-zinc-950 dark:text-zinc-50 tracking-tight truncate">
            Devocional 365
          </span>
        </button>

        {/* Mobile Actions */}
        <div className="flex items-center space-x-1 shrink-0">
          {pendingDayId && (
            <button
              onClick={() => onSelectDay(pendingDayId)}
              className="flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 cursor-pointer"
              title={`Dia ${pendingDayId} pendente`}
            >
              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Dia {pendingDayId}</span>
            </button>
          )}

          <button
            onClick={handleCycleTheme}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#EDE3D2] text-zinc-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
            title="Alternar tema"
          >
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'sepia' && <Coffee className="w-4 h-4 text-amber-800" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={onOpenProfiles}
            className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center cursor-pointer"
            title={`Perfil: ${activeProfile?.name || 'Leitor'}`}
          >
            {(activeProfile?.name || 'R')[0].toUpperCase()}
          </button>

          <button
            onClick={onOpenDrawer}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center cursor-pointer"
            aria-label="Abrir Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
