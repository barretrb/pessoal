import React, { useState, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Headphones, 
  Play, 
  RefreshCw, 
  GitBranch, 
  Link2, 
  BookOpen, 
  Video, 
  Volume2, 
  Compass, 
  Star, 
  Highlighter, 
  CheckCircle2, 
  Flame, 
  Sliders, 
  Cloud,
  RotateCcw,
  Info
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';

const ICON_MAP = {
  Headphones: Headphones,
  Play: Play,
  RefreshCw: RefreshCw,
  GitBranch: GitBranch,
  Link2: Link2,
  BookOpen: BookOpen,
  Video: Video,
  Cross: Sparkles,
  Volume2: Volume2,
  Compass: Compass,
  Star: Star,
  Highlighter: Highlighter,
  CheckCircle2: CheckCircle2,
  Flame: Flame,
  Sliders: Sliders,
  Cloud: Cloud
};

export default function UsoFeaturesModal({ isOpen, onClose, activeProfile }) {
  const [stats, setStats] = useState({ totalInteractions: 0, features: [] });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadStats = () => {
    const data = telemetryService.getStats(activeProfile?.id);
    setStats(data);
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, activeProfile]);

  if (!isOpen) return null;

  const categories = ['all', 'Estudo Teológico', 'Música & Louvor', 'Leitura Bíblica', 'Plano Devocional', 'Engajamento Pessoal', 'Configurações'];

  const filteredFeatures = stats.features.filter(f => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const handleReset = () => {
    if (window.confirm("Deseja zerar os contadores de métricas para este perfil?")) {
      telemetryService.resetStats(activeProfile?.id);
      loadStats();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Métricas de Uso por Feature</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {activeProfile?.name || 'Rafael'}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dados reais de uso para guiar a evolução e simplificação do app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo no Topo */}
        <div className="p-4 sm:p-6 bg-zinc-100/50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total de Ações</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.totalInteractions}</div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Feature #1 Mais Usada</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-1">
              {stats.features[0]?.count > 0 ? stats.features[0].name : 'Nenhuma ainda'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Features Monitoradas</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{stats.features.length}</div>
          </div>
        </div>

        {/* Filtro por Categoria */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-zinc-100 dark:border-zinc-800/60">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat === 'all' ? 'Todas as Áreas' : cat}
            </button>
          ))}
        </div>

        {/* Lista de Features */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredFeatures.map((f, rank) => {
            const IconComponent = ICON_MAP[f.icon] || Sparkles;
            return (
              <div 
                key={f.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60 dark:border-amber-900/60">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">#{rank + 1}</span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {f.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {f.count} <span className="text-[11px] font-normal text-zinc-400">usos</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${f.statusBadge.color}`}>
                      {f.statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso Relativo */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden mt-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(f.percentOfMax, f.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé com Dica e Ação de Limpeza */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Info className="w-4 h-4 shrink-0 text-amber-500" />
            <span>As métricas são salvas localmente e sincronizadas com seu perfil.</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Zerar contadores"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zerar Métricas</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
