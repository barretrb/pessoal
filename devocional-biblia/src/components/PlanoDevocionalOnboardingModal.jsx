import React from 'react';
import { BookOpen, Calendar, CheckCircle2, BookMarked, Sparkles, Compass, X } from 'lucide-react';

export default function PlanoDevocionalOnboardingModal({
  isOpen,
  profileName,
  todayDayId = 306,
  todayDateFormatted = 'hoje',
  onAcceptPlan,
  onDeclinePlan
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 sepia:bg-[#fbf0d9] rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho com Gradiente */}
        <div className="p-6 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 sepia:text-[#433422] tracking-tight">
            Bem-vindo(a), {profileName || 'Leitor'}!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 sepia:text-[#76634c] mt-1 leading-relaxed">
            Como você gostaria de utilizar este aplicativo bíblico? Escolha a experiência que melhor atende à sua rotina espiritual:
          </p>
        </div>

        {/* Opções de Escolha */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Opção 1: Iniciar Plano Devocional */}
          <div 
            onClick={onAcceptPlan}
            className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 sepia:bg-[#f5e6ca]/60 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md group relative"
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                    Sim, iniciar o Plano Devocional
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shrink-0">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 sepia:text-[#6b583f] mt-1.5 leading-relaxed">
                  Seu plano começa a partir de <strong>hoje ({todayDateFormatted})</strong>. Os dias anteriores <strong>não serão cobrados como atrasados</strong>. Você recebe a meta do dia e lembretes diários.
                </p>
                <div className="mt-3 flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 sepia:text-[#8a4b08]">
                  <span>Ativar Plano a partir de hoje</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opção 2: Apenas Leitura Livre & Estudos */}
          <div 
            onClick={onDeclinePlan}
            className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/60 sepia:bg-[#f7ebd4] cursor-pointer transition-all hover:scale-[1.01] hover:shadow-sm group"
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Não, prefiro Leitura Livre & Estudos
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] mt-1.5 leading-relaxed">
                  Oculta metas diárias e contadores de atraso. Dá acesso direto a toda a Bíblia (66 livros), Comentários Exegéticos, Introduções Teológicas e Arqueamento BibleArc no seu próprio ritmo.
                </p>
                <div className="mt-3 flex items-center space-x-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  <span>Navegar apenas na Bíblia e Estudos</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé Informativo */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 sepia:bg-[#f4e4c1]/60 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] text-center">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c]">
            💡 Você poderá ativar ou desativar o plano devocional quando quiser no seu perfil.
          </p>
        </div>

      </div>
    </div>
  );
}
