import React, { useState } from 'react';
import { 
  X, 
  User, 
  UserPlus, 
  Check, 
  Trash2, 
  Heart, 
  Users, 
  Award,
  BookOpen
} from 'lucide-react';

const AVATAR_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '✝️', '📖', '🕊️', '❤️'];
const COLOR_OPTIONS = [
  { key: 'amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { key: 'rose', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { key: 'indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { key: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { key: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
];

export default function PerfilModal({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  getProfileProgressStats
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('👩');
  const [newColor, setNewColor] = useState('rose');

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(newName.trim(), newAvatar, newColor);
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Perfis do Devocional
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Compartilhe o app mantendo o progresso separado
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

        {/* Lista de Perfis */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2.5">
            {profiles.map(p => {
              const isActive = p.id === activeProfileId;
              const stats = getProfileProgressStats ? getProfileProgressStats(p.id) : { completedDays: 0, percent: 0 };

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProfile(p.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-2xl w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-xs border border-zinc-200 dark:border-zinc-700">
                      {p.avatar || '👤'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center space-x-1 mt-0.5">
                        <BookOpen className="w-3 h-3 text-amber-500" />
                        <span>{stats.completedDays} de 365 dias ({stats.percent}%)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isActive ? (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      profiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Tem certeza que deseja excluir o perfil "${p.name}"?`)) {
                              onDeleteProfile(p.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-rose-500 transition-opacity"
                          title="Excluir perfil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formulário para Adicionar Novo Perfil */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Criar Novo Perfil
              </h4>
              
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nome (ex: Esposa, Filho, etc.)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do leitor"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  autoFocus
                  required
                />
              </div>

              {/* Escolha do Avatar */}
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Ícone / Avatar
                </label>
                <div className="flex items-center flex-wrap gap-1.5">
                  {AVATAR_OPTIONS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewAvatar(av)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform ${
                        newAvatar === av 
                          ? 'bg-amber-500 text-white scale-110 shadow-xs' 
                          : 'bg-white dark:bg-zinc-800 hover:scale-105 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Novo Perfil (Esposa, Família)</span>
            </button>
          )}

        </div>

        {/* Rodapé Informativo */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
          Cada perfil possui seu próprio progresso diário, favoritos e marcações de texto.
        </div>

      </div>
    </div>
  );
}
