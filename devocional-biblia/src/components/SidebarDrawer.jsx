import React from 'react';
import {
  Home,
  Compass,
  BookOpen,
  BookMarked,
  Library,
  BarChart3,
  SlidersHorizontal,
  Sun,
  Moon,
  Coffee,
  LogOut,
  Bookmark,
  Calendar,
  PanelLeftClose,
  Smartphone
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

export default function SidebarDrawer({
  isOpen,
  onClose,
  currentView = 'dashboard',
  onGoHome,
  onOpenReaderToday,
  onScrollToCalendar,
  activeProfile,
  activeBookName = '1 Coríntios',
  favoritesCount = 0,
  pendingDayId,
  onOpenProfiles,
  onOpenMaps,
  onOpenBibleNav,
  onOpenStudyInfo,
  onOpenMetrics,
  onOpenCustomize,
  onOpenFavorites,
  redLetterEnabled,
  setRedLetterEnabled,
  theme,
  setTheme,
  onLogout,
  completedDaysCount = 0
}) {
  if (!isOpen) return null;

  const isAdmin =
    activeProfile?.role === 'admin' ||
    activeProfile?.isAdmin ||
    activeProfile?.id === 'default' ||
    activeProfile?.name?.toLowerCase() === 'rafael';

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone);

  const handleAction = (callback) => {
    onClose();
    if (callback) {
      setTimeout(callback, 80);
    }
  };

  const navItemClass = (isActive) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
      isActive
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
        : 'text-zinc-600 dark:text-zinc-400 sepia:text-[#5c4a38] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-zinc-100'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex justify-start lg:hidden animate-in fade-in duration-150 font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
      />

      {/* Barra Lateral Mobile Recolhível (Mesma identidade visual do Desktop) */}
      <aside className="relative w-72 max-w-[84vw] h-full bg-white dark:bg-[#111113] sepia:bg-[#FAF6F0] border-r border-zinc-200/80 dark:border-zinc-800/80 sepia:border-[#E6DBC8] shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-200">
        {/* 1. Cabeçalho + Botão Encolher */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 sepia:border-[#E6DBC8]/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-amber-500 text-amber-400 dark:text-zinc-950 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-zinc-950 dark:text-zinc-50 tracking-tight">
                Devocional 365
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                NVT
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Encolher menu lateral"
            aria-label="Encolher menu lateral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Navegação Unificada */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Principal
            </div>

            <button
              onClick={() => handleAction(onGoHome)}
              className={navItemClass(currentView === 'dashboard')}
            >
              <span className="flex items-center space-x-2.5">
                <Home className="w-4 h-4" />
                <span>Início</span>
              </span>
              {pendingDayId && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            <button
              onClick={() => handleAction(onOpenReaderToday)}
              className={navItemClass(currentView === 'reader')}
            >
              <span className="flex items-center space-x-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Ler a Bíblia</span>
              </span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  telemetryService.track('free_bible_nav', { source: 'mobile_sidebar' });
                  onOpenBibleNav && onOpenBibleNav();
                })
              }
              className={navItemClass(false)}
            >
              <span className="flex items-center space-x-2.5">
                <Library className="w-4 h-4" />
                <span>66 Livros</span>
              </span>
            </button>

            <button
              onClick={() => handleAction(onScrollToCalendar)}
              className={navItemClass(false)}
            >
              <span className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4" />
                <span>Plano Anual ({completedDaysCount}/365)</span>
              </span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Estudo & Acervo
            </div>

            <button
              onClick={() =>
                handleAction(() => {
                  telemetryService.track('theological_commentary_view', { book: activeBookName });
                  onOpenStudyInfo && onOpenStudyInfo(activeBookName);
                })
              }
              className={navItemClass(false)}
            >
              <span className="flex items-center space-x-2.5 truncate">
                <BookMarked className="w-4 h-4 shrink-0" />
                <span className="truncate">Estudo Bíblico ({activeBookName})</span>
              </span>
            </button>

            <button
              onClick={() =>
                handleAction(() => {
                  telemetryService.track('biblical_maps_view', { source: 'mobile_sidebar' });
                  onOpenMaps && onOpenMaps();
                })
              }
              className={navItemClass(false)}
            >
              <span className="flex items-center space-x-2.5">
                <Compass className="w-4 h-4" />
                <span>Atlas Bíblico</span>
              </span>
            </button>

            <button
              onClick={() => handleAction(onOpenFavorites)}
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

            <button
              onClick={() => handleAction(onOpenCustomize)}
              className={navItemClass(false)}
            >
              <span className="flex items-center space-x-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Personalizar Painel</span>
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleAction(onOpenMetrics)}
                className={navItemClass(false)}
              >
                <span className="flex items-center space-x-2.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Métricas de Uso</span>
                </span>
              </button>
            )}
          </div>

          {/* Toggle Palavras de Jesus */}
          <div className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Palavras de Jesus em vermelho
            </span>
            <button
              onClick={() => setRedLetterEnabled(!redLetterEnabled)}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                redLetterEnabled ? 'bg-rose-700' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.75 left-0.75 ${
                  redLetterEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Dica de Instalação como App no Celular (PWA) */}
          {!isStandalone && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-zinc-800/80 flex items-start space-x-2.5">
              <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <span className="font-semibold text-zinc-900 dark:text-zinc-200 block">
                  Instalar como App no Celular
                </span>
                No Safari (iOS) toque em <b>Compartilhar → Adicionar à Tela de Início</b>; no Chrome (Android), <b>Menu → Instalar aplicativo</b>.
              </div>
            </div>
          )}
        </div>

        {/* 3. Rodapé Fixo: Tema + Perfil */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 sepia:border-[#E6DBC8]/70 space-y-2.5 shrink-0">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 sepia:bg-[#EDE3D2] text-[11px] font-medium">
            <button
              onClick={() => setTheme('light')}
              className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Claro</span>
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                theme === 'sepia'
                  ? 'bg-[#FAF6F0] text-[#2C221E] shadow-2xs font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Sépia</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-zinc-950 text-white shadow-2xs font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Escuro</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl">
            <button
              onClick={() => handleAction(onOpenProfiles)}
              className="flex items-center space-x-2.5 min-w-0 text-left cursor-pointer"
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
              onClick={() => handleAction(onLogout)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Sair deste perfil"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
