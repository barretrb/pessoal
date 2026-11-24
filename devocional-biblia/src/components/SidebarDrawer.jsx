import React from 'react';
import { 
  X, 
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
  ChevronRight, 
  Bookmark
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

export default function SidebarDrawer({
  isOpen,
  onClose,
  activeProfile,
  activeBookName = '1 Coríntios',
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

  const isAdmin = activeProfile?.role === 'admin' || activeProfile?.isAdmin || activeProfile?.id === 'default' || activeProfile?.name?.toLowerCase() === 'rafael';

  const handleAction = (callback) => {
    onClose();
    if (callback) {
      setTimeout(callback, 120);
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
      <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-[#F8F6F1] dark:bg-zinc-900 border-l border-stone-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Cabeçalho do Drawer */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                Bíblia & Devocional
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Estudo Exegético • NVT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card do Perfil Ativo */}
        <div className="p-3.5 mx-3.5 mt-3.5 rounded-2xl bg-white dark:bg-zinc-800/70 border border-stone-200/90 dark:border-zinc-700/70 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center text-sm font-bold">
              {(activeProfile?.name || 'R')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {activeProfile?.name || 'Leitor'}
                </span>
                {isAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-600 text-white">
                    ADM
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {completedDaysCount} de 365 dias concluídos
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAction(onOpenProfiles)}
            className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-zinc-700 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
          >
            Perfis
          </button>
        </div>

        {/* Lista de Itens do Menu com Scroll */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
          
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-1 pb-0.5">
            Biblioteca & Estudo Bíblico
          </div>

          {/* 1. BÍBLIA SAGRADA (66 LIVROS) */}
          <button
            onClick={() => handleAction(onOpenBibleNav)}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Library className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Bíblia Completa (66 Livros)
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Navegação livre por testamentos e capítulos
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* 2. BÍBLIA DE ESTUDOS */}
          <button
            onClick={() => handleAction(() => {
              telemetryService.track('theological_commentary_view', { book: activeBookName });
              onOpenStudyInfo && onOpenStudyInfo(activeBookName);
            })}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Bíblia de Estudos ({activeBookName})
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Autor, época, destinatários e síntese teológica
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* 3. ATLAS BÍBLICO (MAPAS HISTÓRICOS) */}
          <button
            onClick={() => handleAction(() => {
              telemetryService.track('biblical_maps_view', { source: 'sidebar' });
              onOpenMaps && onOpenMaps();
            })}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Atlas Bíblico & Rotas Históricas
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Viagens de Paulo, Ministério de Jesus e Êxodo
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* 4. FAVORITOS & DESTAQUES */}
          <button
            onClick={() => handleAction(onOpenFavorites)}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Versículos Guardados & Grifos
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Favoritos e marcações por tema
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-3 pb-0.5">
            Gestão & Layout
          </div>

          {/* 5. MÉTRICAS DE USO (SE FOR ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => handleAction(onOpenMetrics)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Métricas de Uso do App
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Telemetria consolidada (Local & Nuvem)
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          )}

          {/* 6. PERSONALIZAR DASHBOARD */}
          <button
            onClick={() => handleAction(onOpenCustomize)}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-stone-200/70 dark:border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Personalizar Tela Inicial
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Reordenar ou ocultar seções do painel
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 pt-3 pb-0.5">
            Preferências de Leitura
          </div>

          {/* 7. PALAVRAS DE JESUS EM CARMIM */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
                ✝
              </span>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Palavras de Jesus
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Destaque tradicional em carmim
                </div>
              </div>
            </div>

            <button
              onClick={() => setRedLetterEnabled(!redLetterEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                redLetterEnabled ? 'bg-rose-700' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                redLetterEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* 8. SELETOR DE TEMA */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-800 space-y-1.5">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
              Ambiente de Leitura:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setTheme('light')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  theme === 'light' 
                    ? 'bg-zinc-900 text-white shadow-xs' 
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Pergaminho</span>
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  theme === 'sepia' 
                    ? 'bg-[#78350f] text-white shadow-xs' 
                    : 'bg-[#f6ecda] text-[#78350f] border border-[#dfd0b2]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Sépia</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Noturno</span>
              </button>
            </div>
          </div>

        </div>

        {/* Rodapé do Drawer: Botão Sair */}
        <div className="p-3.5 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => handleAction(onLogout)}
            className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-rose-300 text-zinc-600 dark:text-zinc-400 hover:text-rose-700 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão ({activeProfile?.name || 'Leitor'})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
