import React from 'react';
import { 
  X, 
  Compass, 
  Camera, 
  BookOpen, 
  BookMarked, 
  Library, 
  BarChart3, 
  SlidersHorizontal, 
  Sun, 
  Moon, 
  Coffee, 
  LogOut, 
  ChevronRight, 
  User, 
  Sparkles,
  Bookmark,
  Flame,
  Check
} from 'lucide-react';

export default function SidebarDrawer({
  isOpen,
  onClose,
  activeProfile,
  onOpenProfiles,
  onOpenMaps,
  onOpenImages,
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

  const handleAction = (callback) => {
    onClose();
    if (callback) {
      setTimeout(callback, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Lateral */}
      <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Cabeçalho do Drawer */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Menu Devocional
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Navegação & Recursos Bíblicos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card do Perfil Ativo */}
        <div className="p-3.5 mx-3.5 mt-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-lg shadow-2xs">
              {activeProfile?.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                  {activeProfile?.name || 'Leitor'}
                </span>
                {activeProfile?.isAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                    ADM
                  </span>
                )}
              </div>
              <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                {completedDaysCount} dias concluídos
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAction(onOpenProfiles)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300/80 dark:border-amber-700 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Trocar
          </button>
        </div>

        {/* Lista de Itens do Menu com Scroll */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-1">
            Ferramentas Bíblicas em Destaque
          </div>

          {/* 1. ATLAS BÍBLICO (MAPAS HISTÓRICOS) */}
          <button
            onClick={() => handleAction(onOpenMaps)}
            className="w-full p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                    Atlas Bíblico & Rotas
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                    Mapas Reais
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  Jesus, Paulo, Êxodo e 12 Tribos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </button>

          {/* 2. IMAGENS HISTÓRICAS & ATELIÊ IA */}
          <button
            onClick={() => handleAction(onOpenImages)}
            className="w-full p-3 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20 hover:bg-orange-100/60 dark:hover:bg-orange-950/40 transition-all flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors">
                    Imagens Históricas & Ateliê IA
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-500 text-white">
                    Arqueologia
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  Templos, rituais e geração com IA
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
          </button>

          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-2">
            Navegação & Estudo
          </div>

          {/* 3. BÍBLIA SAGRADA (66 LIVROS) */}
          <button
            onClick={() => handleAction(onOpenBibleNav)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-amber-600">
                <Library className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Bíblia Completa (66 Livros)
                </div>
                <div className="text-[10px] text-zinc-400">
                  Navegação livre por capítulos e testamentos
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* 4. BÍBLIA DE ESTUDOS */}
          <button
            onClick={() => handleAction(() => onOpenStudyInfo && onOpenStudyInfo('Lucas'))}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Bíblia de Estudos
                </div>
                <div className="text-[10px] text-zinc-400">
                  Contexto histórico, autor e propósito
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* 5. FAVORITOS & DESTAQUES */}
          <button
            onClick={() => handleAction(onOpenFavorites)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Favoritos & Marcações
                </div>
                <div className="text-[10px] text-zinc-400">
                  Seus versículos salvos
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* 6. MÉTRICAS DE USO (SE FOR ADMIN) */}
          {activeProfile?.isAdmin && (
            <button
              onClick={() => handleAction(onOpenMetrics)}
              className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Métricas de Uso do App
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Painel administrativo consolidado
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          )}

          {/* 7. PERSONALIZAR DASHBOARD */}
          <button
            onClick={() => handleAction(onOpenCustomize)}
            className="w-full p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Personalizar Layout
                </div>
                <div className="text-[10px] text-zinc-400">
                  Reordenar e ocultar blocos
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-2">
            Preferências Rápidas
          </div>

          {/* 8. PALAVRAS DE JESUS EM VERMELHO */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black">
                ✝
              </span>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Palavras de Jesus
                </div>
                <div className="text-[10px] text-zinc-400">
                  Destaque em vermelho
                </div>
              </div>
            </div>

            <button
              onClick={() => setRedLetterEnabled(!redLetterEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                redLetterEnabled ? 'bg-rose-600' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                redLetterEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* 9. SELETOR DE TEMA */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
              Tema Visual:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setTheme('light')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Claro</span>
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  theme === 'sepia' 
                    ? 'bg-[#78350f] text-white shadow-xs' 
                    : 'bg-[#fbf0d9] text-[#78350f] border border-[#e6d3a7]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Sépia</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 text-amber-300 shadow-xs' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Escuro</span>
              </button>
            </div>
          </div>

        </div>

        {/* Rodapé do Drawer: Botão Sair */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80">
          <button
            onClick={() => handleAction(onLogout)}
            className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Perfil ({activeProfile?.name || 'Leitor'})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
