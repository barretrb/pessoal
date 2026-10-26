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
  Library
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
  onOpenStudyInfo
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/95 dark:bg-zinc-900/95 sepia:bg-[#f4e4c1]/95 border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* 1. LOGO E TÍTULO RESPONSIVO (SEM QUEBRA DE LINHA NO MOBILE) */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group shrink-0 min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] tracking-tight whitespace-nowrap">
                Devocional 365
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                NVT
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] whitespace-nowrap hidden min-[360px]:block">
              Plano Devocional Anual
            </p>
          </div>
        </div>

        {/* 2. MENU CENTRAL: NAVEGAÇÃO BÍBLICA, ESTUDOS E DIAS */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          
          {/* Botão Bíblia Completa (Item 6) */}
          <button
            onClick={onOpenBibleNav}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Acessar todos os 66 livros da Bíblia a qualquer momento"
          >
            <Library className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Bíblia</span>
          </button>

          {/* Botão Bíblia de Estudos (Item 7) */}
          <button
            onClick={() => onOpenStudyInfo && onOpenStudyInfo('Lucas')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Consultar Introdução e Estudo dos Livros da Bíblia"
          >
            <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Estudos</span>
          </button>

          {/* Alerta de Leitura Pendente */}
          {pendingDayId && (
            <button
              onClick={() => onSelectDay(pendingDayId)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors animate-pulse"
              title="Você tem leitura pendente!"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Dia {pendingDayId}</span>
            </button>
          )}

          {/* Leitura de Hoje */}
          <button
            onClick={() => onSelectDay(currentDayId)}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentView === 'reader'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Hoje (Dia {currentDayId})</span>
          </button>
        </div>

        {/* 3. MENU DIREITO: PALAVRAS DE JESUS, FAVORITOS, TEMA */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* Botão Palavras de Jesus (Red Letter) - ÍCONE CLARO E INEQUÍVOCO (NÃO É IA) */}
          <button
            onClick={() => setRedLetterEnabled(!redLetterEnabled)}
            className={`px-2 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 border ${
              redLetterEnabled
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 shadow-2xs'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-zinc-200 dark:border-zinc-800'
            }`}
            title={redLetterEnabled ? "Palavras de Jesus em Destaque: ATIVADO (Clique para desativar)" : "Ativar Destaque das Palavras de Jesus em Vermelho"}
          >
            <span className="text-xs font-black text-rose-500 leading-none">✝</span>
            <span className="text-[11px] font-bold">Jesus</span>
          </button>

          {/* Favoritos e Destaques */}
          <button
            onClick={onOpenFavorites}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Meus Destaques e Favoritos"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Alternador de Tema: Claro / Sépia / Escuro */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#e6d3a7]/50 rounded-xl p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'light' ? 'bg-white text-amber-600 shadow-2xs' : 'text-zinc-400 dark:text-zinc-400'
              }`}
              title="Modo Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'sepia' ? 'bg-[#fbf0d9] text-[#78350f] shadow-2xs' : 'text-zinc-400 dark:text-zinc-400'
              }`}
              title="Modo Sépia"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark' ? 'bg-zinc-700 text-amber-300 shadow-2xs' : 'text-zinc-400 dark:text-zinc-400'
              }`}
              title="Modo Escuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
