import React from 'react';
import { 
  BookOpen, 
  Flame, 
  Sun, 
  Moon, 
  Coffee, 
  Bookmark, 
  AlertCircle, 
  BookMarked,
  Library,
  Compass,
  LogOut,
  Menu
} from 'lucide-react';

export default function Navbar({ 
  currentDayId, 
  pendingDayId, 
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
  // Alternador de tema em 1 clique para mobile (Claro -> Sépia -> Escuro -> Claro)
  const handleCycleTheme = () => {
    if (theme === 'light') setTheme('sepia');
    else if (theme === 'sepia') setTheme('dark');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/95 dark:bg-zinc-900/95 sepia:bg-[#f4e4c1]/95 border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* 1. LOGO E TÍTULO RESPONSIVO (SEM MENU DUPLICADO NA ESQUERDA) */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2 cursor-pointer group shrink-0"
          title="Ir para o Início / Panorama"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] tracking-tight whitespace-nowrap">
              Devocional 365
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
              NVT
            </span>
          </div>
        </div>

        {/* 2. MENU CENTRAL DESKTOP */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Botão Bíblia Completa */}
          <button
            onClick={onOpenBibleNav}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            title="Acessar todos os 66 livros da Bíblia a qualquer momento"
          >
            <Library className="w-3.5 h-3.5 text-amber-600" />
            <span>Bíblia</span>
          </button>

          {/* Botão Bíblia de Estudos */}
          <button
            onClick={() => onOpenStudyInfo && onOpenStudyInfo('Lucas')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            title="Consultar Introdução e Estudo dos Livros da Bíblia"
          >
            <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bíblia de Estudos</span>
          </button>

          {/* Botão Mapas Bíblicos */}
          <button
            onClick={onOpenMaps}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Atlas Bíblico & Rotas de Paulo e Jesus"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Mapas</span>
          </button>

          {/* Leitura de Hoje */}
          {activeProfile?.planOptIn !== false && (
            <button
              onClick={() => onSelectDay(currentDayId)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'reader'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Hoje (Dia {currentDayId})</span>
            </button>
          )}
        </div>

        {/* 3. MENU DIREITO (COM ÚNICO BOTÃO DE MENU LATERAL) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* Alerta de Leitura Pendente (Se houver) */}
          {pendingDayId && (
            <button
              onClick={() => onSelectDay(pendingDayId)}
              className="flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors animate-pulse shrink-0 cursor-pointer"
              title="Você tem leitura pendente!"
            >
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="whitespace-nowrap">Dia {pendingDayId}</span>
            </button>
          )}

          {/* Botão Palavras de Jesus (Red Letter) */}
          <button
            onClick={() => setRedLetterEnabled(!redLetterEnabled)}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 border shrink-0 cursor-pointer ${
              redLetterEnabled
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 shadow-2xs'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-zinc-200 dark:border-zinc-800'
            }`}
            title={redLetterEnabled ? "Palavras de Jesus em Vermelho: ATIVADO" : "Ativar Palavras de Jesus em Vermelho"}
          >
            <span className="text-xs font-black text-rose-500 leading-none">✝</span>
            <span className="text-[11px] font-bold hidden sm:inline">Jesus</span>
          </button>

          {/* Botão de Perfil / Multi-Conta */}
          <button
            onClick={onOpenProfiles}
            className="flex items-center space-x-1 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 text-xs font-bold text-amber-900 dark:text-amber-200 hover:scale-105 transition-transform shrink-0 cursor-pointer"
            title={`Perfil Ativo: ${activeProfile?.name || 'Leitor'}. Clique para alternar perfis.`}
          >
            <span className="text-base">{activeProfile?.avatar || '👤'}</span>
            <span className="hidden md:inline">{activeProfile?.name || 'Perfil'}</span>
          </button>

          {/* TEMA MOBILE: 1 Único Botão Cíclico */}
          <button
            onClick={handleCycleTheme}
            className="md:hidden p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#e6d3a7]/50 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center w-8 h-8 cursor-pointer"
            title={`Tema atual: ${theme === 'light' ? 'Claro' : theme === 'sepia' ? 'Sépia' : 'Escuro'}. Clique para alternar.`}
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'sepia' && <Coffee className="w-4 h-4 text-amber-800" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-amber-300" />}
          </button>

          {/* Botão Sair (Desktop) */}
          <button
            onClick={onLogout}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-xl text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
            title="Sair do perfil atual"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* ÚNICO BOTÃO DE MENU LATERAL (NA DIREITA) */}
          <button
            onClick={onOpenDrawer}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
            title="Abrir Menu Lateral"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5 text-zinc-800 dark:text-zinc-100" />
            <span className="text-xs font-bold hidden lg:inline">Menu</span>
          </button>

        </div>

      </div>
    </header>
  );
}
