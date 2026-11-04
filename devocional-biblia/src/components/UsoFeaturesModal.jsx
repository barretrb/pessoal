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
  RotateCcw,
  Users,
  UserCheck,
  Camera,
  Wand2
} from 'lucide-react';
import { telemetryService } from '../services/telemetryService';
import { storage } from '../services/storage';

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
  Sparkles: Sparkles,
  Camera: Camera,
  Wand2: Wand2
};

export default function UsoFeaturesModal({ isOpen, onClose, activeProfile }) {
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL'); // 'ALL' ou profile.id
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState({ totalInteractions: 0, features: [], userBreakdown: [] });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const loadStats = () => {
    const allProfiles = storage.getProfiles();
    setProfiles(allProfiles);

    if (selectedUserFilter === 'ALL') {
      const data = telemetryService.getAllUsersStats();
      setStats(data);
    } else {
      const data = telemetryService.getStats(selectedUserFilter);
      setStats(data);
    }
  };

  const syncAndLoad = async () => {
    setIsSyncing(true);
    await telemetryService.fetchCloudTelemetry();
    loadStats();
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
      syncAndLoad();
    }
  }, [isOpen, selectedUserFilter, activeProfile]);

  if (!isOpen) return null;

  const currentProfile = profiles.find(p => p.id === selectedUserFilter);
  const categories = ['all', 'Estudo Teológico', 'Música & Louvor', 'Leitura Bíblica', 'Plano Devocional', 'Engajamento Pessoal', 'Configurações'];

  const filteredFeatures = (stats.features || []).filter(f => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const handleReset = () => {
    const targetName = selectedUserFilter === 'ALL' ? 'TODOS os leitores' : (currentProfile?.name || 'o perfil selecionado');
    if (window.confirm(`Deseja zerar os contadores de métricas para ${targetName}?`)) {
      if (selectedUserFilter === 'ALL') {
        profiles.forEach(p => telemetryService.resetStats(p.id));
        telemetryService.resetStats('default');
        telemetryService.resetStats('ALL');
      } else {
        telemetryService.resetStats(selectedUserFilter);
      }
      loadStats();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho Responsivo */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Métricas de Uso</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                  Painel ADM
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Acompanhamento nativo e nuvem (Laptop, Celular & Tablet)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={syncAndLoad}
              disabled={isSyncing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Atualizar dados da nuvem"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-amber-600 dark:text-amber-400'}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. SELETOR DE USUÁRIO: TODOS OS USUÁRIOS OU INDIVIDUAL */}
        <div className="px-3.5 sm:px-6 py-2.5 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Filtrar por Leitor:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedUserFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                selectedUserFilter === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>👥</span>
              <span>Todos os Usuários</span>
            </button>

            {profiles.map(p => {
              const isSelected = selectedUserFilter === p.id;
              const userStat = stats.userBreakdown?.find(u => u.profileId === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedUserFilter(p.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span>{p.avatar || '👤'}</span>
                  <span>{p.name}</span>
                  {userStat && (
                    <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-amber-700 text-amber-100' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300'
                    }`}>
                      {userStat.totalInteractions}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumo no Topo (Design Mobile-Friendly com 3 Cards Claros) */}
        <div className="p-3 sm:p-5 bg-zinc-100/60 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
              {selectedUserFilter === 'ALL' ? 'Total Consolidado' : `Ações de ${currentProfile?.name || 'Leitor'}`}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.totalInteractions}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
              Feature #1 Mais Usada
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-1">
              {stats.features?.[0]?.count > 0 ? stats.features[0].name : 'Nenhuma ainda'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-xs">
            <div className="text-[10px] sm:text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
              {selectedUserFilter === 'ALL' ? 'Leitores Cadastrados' : 'Features Utilizadas'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {selectedUserFilter === 'ALL' 
                ? (stats.userBreakdown?.length || profiles.length) 
                : (stats.features?.filter(f => f.count > 0).length || 0)}
            </div>
          </div>
        </div>

        {/* Breakdown de Leitores (Visível no modo 'ALL') */}
        {selectedUserFilter === 'ALL' && stats.userBreakdown && stats.userBreakdown.length > 0 && (
          <div className="px-3.5 sm:px-6 py-2 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Participação:</span>
            {stats.userBreakdown.map(u => (
              <div 
                key={u.profileId}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 shrink-0 shadow-2xs"
              >
                <span>{u.avatar || '👤'}</span>
                <span className="font-bold">{u.name}:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{u.totalInteractions}</span>
                <span className="text-[10px] text-zinc-400">({u.percentOfTotal}%)</span>
              </div>
            ))}
          </div>
        )}

        {/* Filtro por Categoria */}
        <div className="px-3.5 sm:px-6 pt-2.5 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-zinc-100 dark:border-zinc-800/60">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat === 'all' ? 'Todas as Áreas' : cat}
            </button>
          ))}
        </div>

        {/* Lista de Features Responsiva (Sem Truncamento no Mobile) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2.5">
          {filteredFeatures.map((f, rank) => {
            const IconComponent = ICON_MAP[f.icon] || Sparkles;
            return (
              <div 
                key={f.id}
                className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors shadow-2xs"
              >
                {/* Linha Principal com Quebra Flexível */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60 dark:border-amber-900/60">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">#{rank + 1}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                        {f.description}
                      </p>
                    </div>
                  </div>

                  {/* Estatísticas e Badge */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 pl-10 sm:pl-0 pt-1 sm:pt-0">
                    <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                      {f.count} <span className="text-[10px] font-normal text-zinc-400">usos</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.statusBadge?.color || 'bg-zinc-100 text-zinc-700'}`}>
                      {f.statusBadge?.label || 'Em Uso'}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso Relativo */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(f.percentOfMax || 0, f.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-zinc-500">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            <span>
              {selectedUserFilter === 'ALL' 
                ? `Consolidado de todos os leitores (${stats.totalInteractions} ações)` 
                : `Exibindo métricas exclusivas de ${currentProfile?.name || 'Leitor'}`}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-xs"
              title="Zerar contadores"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zerar Métricas</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer text-xs"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
