import React from 'react';
import {
  Home,
  BookOpen,
  Library,
  BookMarked,
  Compass,
  Bookmark,
  BarChart3,
  Sun,
  Moon,
  Coffee,
  LogOut,
  Calendar
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

export default function SidebarNav({
  currentView,
  onGoHome,
  onOpenReaderToday,
  onOpenBibleNav,
  onOpenStudyInfo,
  onOpenMaps,
  onOpenFavorites,
  onOpenMetrics,
  onOpenProfiles,
  onScrollToCalendar,
  activeBookName = '1 Coríntios',
  activeProfile,
  favoritesCount = 0,
  pendingDayId,
  onSelectDay,
  theme,
  setTheme,
  onLogout
}) {
  const isAdmin = activeProfile?.role === 'admin' || activeProfile?.isAdmin || activeProfile?.id === 'default' || activeProfile?.name?.toLowerCase() === 'rafael';

  const navItemClass = (isActive) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
        : 'text-zinc-600 dark:text-zinc-400 sepia:text-[#5c4a38] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-zinc-100'
    }`;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-[#111113] sepia:bg-[#FAF6F0] border-r border-zinc-200/80 dark:border-zinc-800/80 sepia:border-[#E6DBC8] select-none">
      {/* 1. Brand Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 sepia:border-[#E6DBC8]/70">
        <button
          onClick={onGoHome}
          className="flex items-center space-x-2.5 cursor-pointer group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-amber-500 text-amber-400 dark:text-zinc-950 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-zinc-950 dark:text-zinc-50 tracking-tight">
                Devocional 365
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                NVT
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 2. Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Principal
          </div>

          <button
            onClick={onGoHome}
            className={navItemClass(currentView === 'dashboard')}
          >
            <span className="flex items-center space-x-2.5">
              <Home className="w-4 h-4" />
              <span>Início</span>
            </span>
            {pendingDayId && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title={`Dia ${pendingDayId} pendente`} />
            )}
          </button>

          <button
            onClick={onOpenReaderToday}
            className={navItemClass(currentView === 'reader')}
          >
            <span className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Ler a Bíblia</span>
            </span>
          </button>

          <button
            onClick={() => {
              telemetryService.track('free_bible_nav', { source: 'sidebar' });
              onOpenBibleNav && onOpenBibleNav();
            }}
            className={navItemClass(false)}
          >
            <span className="flex items-center space-x-2.5">
              <Library className="w-4 h-4" />
              <span>66 Livros</span>
            </span>
          </button>

          <button
            onClick={onScrollToCalendar}
            className={navItemClass(false)}
          >
            <span className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4" />
              <span>Plano Anual</span>
            </span>
          </button>
        </div>

        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Estudo & Acervo
          </div>

          <button
            onClick={() => {
              telemetryService.track('theological_commentary_view', { book: activeBookName });
              onOpenStudyInfo && onOpenStudyInfo(activeBookName);
            }}
            className={navItemClass(false)}
          >
            <span className="flex items-center space-x-2.5 truncate">
              <BookMarked className="w-4 h-4 shrink-0" />
              <span className="truncate">Estudo Bíblico</span>
            </span>
          </button>

          <button
            onClick={() => {
              telemetryService.track('biblical_maps_view', { source: 'sidebar_rail' });
              onOpenMaps && onOpenMaps();
            }}
            className={navItemClass(false)}
          >
            <span className="flex items-center space-x-2.5">
              <Compass className="w-4 h-4" />
              <span>Atlas Bíblico</span>
            </span>
          </button>

          <button
            onClick={onOpenFavorites}
            className={navItemClass(false)}
          >
            <span className="flex items-center space-x-2.5">
              <Bookmark className="w-4 h-4" />
              <span>Salvos & Grifos</span>
            </span>
            {favoritesCount > 0 && (
              <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {favoritesCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={onOpenMetrics}
              className={navItemClass(false)}
            >
              <span className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Métricas de Uso</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Footer: Theme Segmented Control & Profile */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 sepia:border-[#E6DBC8]/70 space-y-2.5">
        {/* Segmented Theme Switcher */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 sepia:bg-[#EDE3D2] text-[11px] font-medium">
          <button
            onClick={() => setTheme('light')}
            className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Modo Claro"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Claro</span>
          </button>
          <button
            onClick={() => setTheme('sepia')}
            className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              theme === 'sepia'
                ? 'bg-[#FAF6F0] text-[#2C221E] shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Modo Sépia"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Sépia</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-950 text-white shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
            title="Modo Escuro"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Escuro</span>
          </button>
        </div>

        {/* Profile Row */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
          <button
            onClick={onOpenProfiles}
            className="flex items-center space-x-2.5 min-w-0 text-left cursor-pointer"
            title="Alternar ou gerenciar perfis"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {(activeProfile?.name || 'R')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {activeProfile?.name || 'Leitor'}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                Alternar perfil
              </div>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Sair deste perfil"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
