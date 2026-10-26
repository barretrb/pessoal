import React from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Sliders, 
  RotateCcw,
  Music,
  Flame,
  BookMarked,
  Video,
  Calendar,
  Check
} from 'lucide-react';

const SECTION_METADATA = {
  todayPending: {
    title: 'Leitura de Hoje & Pendências',
    description: 'Cartão principal com as passagens do dia e alerta de leitura pendente',
    icon: Flame,
    colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800'
  },
  music: {
    title: 'Música Devocional do Dia (YouTube Music)',
    description: 'Louvor selecionado com player integrado de áudio/vídeo',
    icon: Music,
    colorClass: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-800'
  },
  studyBanner: {
    title: 'Bíblia de Estudos & Navegação Completa',
    description: 'Acesso rápido aos 66 livros e informações de introdução bíblica',
    icon: BookMarked,
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800'
  },
  video: {
    title: 'Vídeo de Estudo Relacionado (BibleProject)',
    description: 'Visão geral bíblica e animações explicativas em vídeo',
    icon: Video,
    colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800'
  },
  calendar: {
    title: 'Panorama dos 365 Dias',
    description: 'Grade anual completa dos 365 dias e barra de progresso',
    icon: Calendar,
    colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800'
  }
};

export default function PersonalizarDashboardModal({
  isOpen,
  onClose,
  layout,
  onUpdateLayout,
  onResetLayout
}) {
  if (!isOpen) return null;

  const order = layout?.order || ['todayPending', 'music', 'studyBanner', 'video', 'calendar'];
  const hidden = layout?.hidden || {};

  const handleToggleVisibility = (secId) => {
    const nextHidden = { ...hidden, [secId]: !hidden[secId] };
    onUpdateLayout({
      ...layout,
      hidden: nextHidden
    });
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= order.length) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, moved);
    onUpdateLayout({
      ...layout,
      order: newOrder
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                Personalizar Tela Inicial
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Reordene com as setas ou oculte o que não desejar
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Caixas com Alto Contraste e Legibilidade Absoluta */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/40">
          <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium pb-1">
            Defina a ordem das caixas na tela inicial com as setas. Clique no olho para ocultar:
          </p>

          <div className="space-y-3">
            {order.map((secId, idx) => {
              const meta = SECTION_METADATA[secId] || {
                title: secId,
                description: '',
                icon: Sliders,
                colorClass: 'text-zinc-600 bg-zinc-100 border-zinc-200'
              };
              const isHidden = !!hidden[secId];
              const Icon = meta.icon;

              return (
                <div 
                  key={secId}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                    isHidden 
                      ? 'bg-zinc-100/70 dark:bg-zinc-800/40 border-zinc-300 dark:border-zinc-800 opacity-60' 
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Ícone e Nome com Alto Contraste */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${meta.colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                        {meta.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Botões de Ação com Cores e Contraste Nítidos */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    
                    {/* Botão Subir */}
                    <button
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700 hover:bg-amber-500 dark:hover:bg-amber-600 text-zinc-800 dark:text-zinc-100 hover:text-white disabled:opacity-20 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center transition-all"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Botão Descer */}
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === order.length - 1}
                      className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700 hover:bg-amber-500 dark:hover:bg-amber-600 text-zinc-800 dark:text-zinc-100 hover:text-white disabled:opacity-20 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center transition-all"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Botão Ocultar / Exibir */}
                    <button
                      onClick={() => handleToggleVisibility(secId)}
                      className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all ml-1 font-bold ${
                        isHidden 
                          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-600' 
                          : 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                      }`}
                      title={isHidden ? "Caixa Ocultada (Clique para exibir)" : "Caixa Visível (Clique para ocultar)"}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com Botão Restaurar e Concluir */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={onResetLayout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Pronto</span>
          </button>
        </div>

      </div>
    </div>
  );
}
