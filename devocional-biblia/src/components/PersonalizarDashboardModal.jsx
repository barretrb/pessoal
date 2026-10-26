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
    description: 'Cartão com as passagens bíblicas do dia e alerta de leitura pendente',
    icon: Flame,
    colorClass: 'text-amber-500 bg-amber-500/10 border border-amber-500/30'
  },
  music: {
    title: 'Música Devocional do Dia (YouTube Music)',
    description: 'Louvor selecionado do dia com player integrado de áudio e vídeo',
    icon: Music,
    colorClass: 'text-orange-500 bg-orange-500/10 border border-orange-500/30'
  },
  studyBanner: {
    title: 'Bíblia de Estudos & Navegação Completa',
    description: 'Acesso rápido aos 66 livros bíblicos, autores, épocas e temas',
    icon: BookMarked,
    colorClass: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/30'
  },
  video: {
    title: 'Vídeo de Estudo Relacionado (BibleProject)',
    description: 'Visão geral bíblica e animações explicativas do livro em vídeo',
    icon: Video,
    colorClass: 'text-rose-500 bg-rose-500/10 border border-rose-500/30'
  },
  calendar: {
    title: 'Panorama dos 365 Dias',
    description: 'Grade anual completa dos 365 dias do plano e barra de progresso',
    icon: Calendar,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/30'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 text-zinc-100 rounded-3xl max-w-lg w-full shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-50">
                Personalizar Tela Inicial
              </h3>
              <p className="text-xs text-zinc-400">
                Organize a ordem ou oculte caixas para simplificar
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Caixas com Texto 100% Legível (Sem Truncamento no Mobile) */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 bg-zinc-950/60">
          <p className="text-xs text-zinc-400 font-medium pb-0.5 leading-relaxed">
            Use as setas para mover a posição da caixa. Oculte o que não quiser ver na tela inicial:
          </p>

          <div className="space-y-3">
            {order.map((secId, idx) => {
              const meta = SECTION_METADATA[secId] || {
                title: secId,
                description: '',
                icon: Sliders,
                colorClass: 'text-zinc-400 bg-zinc-800 border-zinc-700'
              };
              const isHidden = !!hidden[secId];
              const Icon = meta.icon;

              return (
                <div 
                  key={secId}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                    isHidden 
                      ? 'bg-zinc-900/40 border-zinc-800/80 opacity-55' 
                      : 'bg-zinc-900 border-zinc-700 shadow-md'
                  }`}
                >
                  {/* Linha Superior: Ícone + Título Completo sem cortes + Botão Olho */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${meta.colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-zinc-100 leading-snug break-words">
                        {meta.title}
                      </h4>
                    </div>

                    {/* Botão de Visibilidade com Destaque Máximo */}
                    <button
                      onClick={() => handleToggleVisibility(secId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
                        isHidden 
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200' 
                          : 'bg-amber-500 text-zinc-950 shadow-sm hover:bg-amber-400 font-extrabold'
                      }`}
                      title={isHidden ? "Caixa Ocultada (Clique para exibir)" : "Caixa Visível (Clique para ocultar)"}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isHidden ? 'Oculta' : 'Visível'}</span>
                    </button>
                  </div>

                  {/* Linha Inferior: Subtítulo Explicativo Completo + Controles de Posição */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
                    <p className="text-[11px] text-zinc-400 leading-tight flex-1">
                      {meta.description}
                    </p>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Botão Subir */}
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 disabled:opacity-25 border border-zinc-700 flex items-center space-x-1 text-xs font-bold transition-all"
                        title="Subir posição desta caixa"
                      >
                        <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="text-[10px]">Subir</span>
                      </button>

                      {/* Botão Descer */}
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === order.length - 1}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 disabled:opacity-25 border border-zinc-700 flex items-center space-x-1 text-xs font-bold transition-all"
                        title="Descer posição desta caixa"
                      >
                        <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="text-[10px]">Descer</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé com Botão Restaurar e Concluir */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onResetLayout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Pronto</span>
          </button>
        </div>

      </div>
    </div>
  );
}
