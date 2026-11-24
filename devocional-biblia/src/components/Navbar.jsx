import React from 'react';
import { 
  BookOpen, 
  Flame, 
  Sun, 
  Moon, 
  Coffee, 
  AlertCircle, 
  BookMarked,
  Library,
  Compass,
  LogOut,
  Menu
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

export default function Navbar({ 
  currentDayId, 
  pendingDayId, 
  activeBookName = '1 Coríntios',
  onSelectDay, 
  currentView, 
  setCurrentView, 
  theme, 
  setTheme,
  redLetterEnabled,
  setRedLetterEnabled,
  onOpenFavorites,
  onOpenBibleNav,
  onOpenStudyInfo,
  activeProfile,
  onOpenProfiles,
  onOpenMaps,
  onOpenDrawer,
  onLogout
}) {
  const handleCycleTheme = () => {
    if (theme === 'light') setTheme('sepia');
    else if (theme === 'sepia') setTheme('dark');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-[#F8F6F1]/95 dark:bg-zinc-950/95 sepia:bg-[#f4e4c1]/95 border-stone-200/90 dark:border-zinc-800/90 sepia:border-[#e6d3a7]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* 1. IDENTIDADE EDITORIAL */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          title="Ir para o Início / Panorama"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 sepia:text-[#3b2d1d] tracking-tight leading-none">
                Bíblia & Devocional
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-600/15 text-amber-800 dark:text-amber-300 border border-amber-500/25 shrink-0">
                NVT
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:inline leading-tight mt-0.5">
              Escritura, Exegese & Plano Anual
            </span>
          </div>
        </div>

        {/* 2. NAVEGAÇÃO EDITORIAL DESKTOP */}
        <div className="hidden md:flex items-center space-x-1.5 bg-stone-200/60 dark:bg-zinc-900 p-1 rounded-2xl border border-stone-300/60 dark:border-zinc-800">
          {/* Leitura de Hoje */}
          {activeProfile?.planOptIn !== false && (
            <button
              onClick={() => onSelectDay(currentDayId)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'reader'
                  ? 'bg-zinc-900 dark:bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Leitura do Dia {currentDayId}</span>
            </button>
          )}

          {/* Bíblia Completa */}
          <button
            onClick={onOpenBibleNav}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Acessar todos os 66 livros da Bíblia"
          >
            <Library className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>66 Livros</span>
          </button>

          {/* Bíblia de Estudos (abre o livro ativo atual) */}
          <button
            onClick={() => {
              telemetryService.track('theological_commentary_view', { book: activeBookName });
              onOpenStudyInfo && onOpenStudyInfo(activeBookName);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={`Consultar Introdução e Estudo de ${activeBookName}`}
          >
            <BookMarked className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Bíblia de Estudos</span>
          </button>

          {/* Atlas Bíblico */}
          <button
            onClick={() => {
              telemetryService.track('biblical_maps_view', { source: 'navbar' });
              onOpenMaps && onOpenMaps();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Atlas Bíblico & Rotas Históricas"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Atlas</span>
          </button>
        </div>

        {/* 3. CONTROLES DIREITOS */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* Alerta de Leitura Pendente */}
          {pendingDayId && (
            <button
              onClick={() => onSelectDay(pendingDayId)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-rose-100/90 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300/70 dark:border-rose-800/60 hover:bg-rose-200 transition-colors shrink-0 cursor-pointer"
              title="Você tem leitura pendente!"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="whitespace-nowrap">Dia {pendingDayId}</span>
            </button>
          )}

          {/* Palavras de Jesus (Red Letter) */}
          <button
            onClick={() => setRedLetterEnabled(!redLetterEnabled)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 border shrink-0 cursor-pointer ${
              redLetterEnabled
                ? 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-300/80 dark:border-rose-800/70'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900'
            }`}
            title={redLetterEnabled ? "Palavras de Jesus em Carmim: ATIVADO" : "Ativar Palavras de Jesus em Carmim"}
          >
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-none">✝</span>
            <span className="text-[11px] font-bold hidden sm:inline">Jesus</span>
          </button>

          {/* Tema Visual */}
          <button
            onClick={handleCycleTheme}
            className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 sepia:bg-[#e6d3a7]/50 text-zinc-700 dark:text-zinc-200 border border-stone-200 dark:border-zinc-800 shrink-0 flex items-center justify-center w-8 h-8 cursor-pointer hover:border-amber-400 transition-colors"
            title={`Tema atual: ${theme === 'light' ? 'Claro' : theme === 'sepia' ? 'Sépia' : 'Escuro'}. Clique para alternar.`}
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-600" />}
            {theme === 'sepia' && <Coffee className="w-4 h-4 text-amber-800" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Perfil Ativo */}
          <button
            onClick={onOpenProfiles}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-amber-400 transition-colors shrink-0 cursor-pointer"
            title={`Perfil Ativo: ${activeProfile?.name || 'Leitor'}. Clique para alternar perfis.`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-600/15 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center">
              {(activeProfile?.name || 'R')[0].toUpperCase()}
            </span>
            <span className="hidden md:inline">{activeProfile?.name || 'Perfil'}</span>
          </button>

          {/* Menu Lateral */}
          <button
            onClick={onOpenDrawer}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
            title="Abrir Menu Lateral"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-semibold hidden lg:inline">Menu</span>
          </button>

        </div>

      </div>
    </header>
  );
}
