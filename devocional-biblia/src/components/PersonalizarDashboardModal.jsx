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
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
  },
  music: {
    title: 'Música Devocional do Dia (YouTube Music)',
    description: 'Louvor selecionado com player integrado de áudio/vídeo',
    icon: Music,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40'
  },
  studyBanner: {
    title: 'Bíblia de Estudos & Navegação Completa',
    description: 'Acesso rápido aos 66 livros e informações de introdução bíblica',
    icon: BookMarked,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
  },
  video: {
    title: 'Vídeo de Estudo Relacionado (BibleProject)',
    description: 'Visão geral bíblica e animações explicativas em vídeo',
    icon: Video,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
  },
  calendar: {
    title: 'Panorama dos 365 Dias',
    description: 'Grade anual completa dos 365 dias e barra de progresso',
    icon: Calendar,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
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

  const order = layout.order || ['todayPending', 'music', 'studyBanner', 'video', 'calendar'];
  const hidden = layout.hidden || {};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Personalizar Tela Inicial
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Altere a ordem das caixas ou oculte o que não desejar
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Caixas com Botões de Mover e Ocultar */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 pb-1">
            Utilize as setas para definir a prioridade de visualização. Se desejar uma tela mais limpa, basta ocultar as opções extras.
          </p>

          <div className="space-y-2.5">
            {order.map((secId, idx) => {
              const meta = SECTION_METADATA[secId] || {
                title: secId,
                description: '',
                icon: Sliders,
                color: 'text-zinc-500 bg-zinc-100'
              };
              const isHidden = !!hidden[secId];
              const Icon = meta.icon;

              return (
                <div 
                  key={secId}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isHidden 
                      ? 'bg-zinc-100/60 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800 opacity-60' 
                      : 'bg-white dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700 shadow-2xs'
                  }`}
                >
                  {/* Ícone e Nome */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {meta.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate hidden sm:block">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Ações: Subir, Descer e Visibilidade */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Botão Subir */}
                    <button
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Botão Descer */}
                    <button
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === order.length - 1}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Botão Ocultar / Exibir */}
                    <button
                      onClick={() => handleToggleVisibility(secId)}
                      className={`p-1.5 rounded-lg transition-colors ml-1 ${
                        isHidden 
                          ? 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-200 dark:bg-zinc-800' 
                          : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                      }`}
                      title={isHidden ? "Exibir esta caixa na tela inicial" : "Ocultar esta caixa"}
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
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={onResetLayout}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Pronto</span>
          </button>
        </div>

      </div>
    </div>
  );
}
