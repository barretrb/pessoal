import React from 'react';
import { BookOpen, Flame, Sun, Moon, Coffee, Bookmark, Sparkles, AlertCircle, Share2 } from 'lucide-react';

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
  onOpenFavorites
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 bg-white/90 dark:bg-zinc-900/90 sepia:bg-[#f4e4c1]/90 border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo e Título */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] tracking-tight">
                Devocional 365
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                NVT
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c]">
              Plano Anual • Paulo Won
            </p>
          </div>
        </div>

        {/* Central / Ações rápidas */}
        <div className="hidden md:flex items-center space-x-2">
          {pendingDayId && (
            <button
              onClick={() => onSelectDay(pendingDayId)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors animate-pulse"
              title="Você tem leitura pendente!"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pendente: Dia {pendingDayId}</span>
            </button>
          )}

          <button
            onClick={() => onSelectDay(currentDayId)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentView === 'reader'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Leitura de Hoje (Dia {currentDayId})
          </button>
        </div>

        {/* Menu Direito: Favoritos, Palavras de Jesus, Tema */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Botão Palavras de Jesus (Red Letter) */}
          <button
            onClick={() => setRedLetterEnabled(!redLetterEnabled)}
            className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
              redLetterEnabled
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
            title={redLetterEnabled ? "Palavras de Jesus em Destaque (Ativo)" : "Ativar destaque de falas de Jesus"}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Jesus</span>
          </button>

          {/* Favoritos e Destaques */}
          <button
            onClick={onOpenFavorites}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Meus Destaques e Favoritos"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Alternador de Tema: Claro / Sépia / Escuro */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#e6d3a7]/50 rounded-lg p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
              }`}
              title="Modo Claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'sepia' ? 'bg-[#fbf0d9] text-[#78350f] shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
              }`}
              title="Modo Sépia (Leitura Suave)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark' ? 'bg-zinc-700 text-amber-300 shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
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
