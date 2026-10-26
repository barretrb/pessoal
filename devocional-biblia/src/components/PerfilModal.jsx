import React, { useState } from 'react';
import { 
  X, 
  User, 
  UserPlus, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Users, 
  BookOpen,
  Edit2
} from 'lucide-react';

const AVATAR_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '✝️', '📖', '🕊️', '❤️'];

export default function PerfilModal({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfileRequest, // Passa por verificação de PIN se necessário
  onCreateProfile,
  onDeleteProfile,
  onUpdateAdminPin,
  getProfileProgressStats
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('👩');
  const [newRole, setNewRole] = useState('member');
  
  // Estado para alterar PIN do Admin
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const isAdmin = activeProfile?.role === 'admin';

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(newName.trim(), newAvatar, 'rose', newRole);
    setNewName('');
    setIsCreating(false);
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPinValue.length >= 4) {
      onUpdateAdminPin(newPinValue);
      setPinSuccessMsg(true);
      setTimeout(() => {
        setPinSuccessMsg(false);
        setIsEditingPin(false);
        setNewPinValue('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                Gerenciamento de Contas
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isAdmin ? 'Conta Principal (Administrador)' : 'Perfil de Leitura Individual'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Perfis */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/40">
          
          <div className="space-y-3">
            {profiles.map(p => {
              const isActive = p.id === activeProfileId;
              const isTargetAdmin = p.role === 'admin';
              const stats = getProfileProgressStats ? getProfileProgressStats(p.id) : { completedDays: 0, percent: 0 };

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfileRequest(p)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-2xl w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-2xs border border-zinc-200 dark:border-zinc-700 shrink-0">
                      {p.avatar || '👤'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name}
                        </span>
                        {isTargetAdmin && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        )}
                        {!isTargetAdmin && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            Membro
                          </span>
                        )}
                        {p.requiresPin && (
                          <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" title="Protegido por PIN" />
                        )}
                      </div>
                      
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center space-x-1 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>{stats.completedDays} de 365 dias ({stats.percent}%)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {isActive ? (
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    ) : (
                      /* Apenas o Admin Rafael pode excluir outras contas */
                      isAdmin && !isTargetAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Tem certeza que deseja excluir o perfil de "${p.name}"?`)) {
                              onDeleteProfile(p.id);
                            }
                          }}
                          className="p-2 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Excluir este perfil"
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

          {/* Seção Exclusiva do Admin: Alterar PIN de Segurança */}
          {isAdmin && (
            <div className="pt-2">
              {isEditingPin ? (
                <form onSubmit={handleSavePin} className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Alterar PIN do Administrador (Rafael)</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingPin(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-600"
                    >
                      Cancelar
                    </button>
                  </div>

                  <input
                    type="password"
                    maxLength={6}
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    placeholder="Novo PIN (4 a 6 dígitos)"
                    className="w-full text-center tracking-widest text-base font-mono py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    required
                  />

                  {pinSuccessMsg && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">
                      ✓ PIN atualizado com sucesso!
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Salvar Novo PIN
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingPin(true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center space-x-2 transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Segurança: Alterar PIN do Rafael (Admin)</span>
                </button>
              )}
            </div>
          )}

          {/* Adicionar Novo Perfil (Somente o Admin Rafael pode criar) */}
          {isAdmin && (
            isCreating ? (
              <form onSubmit={handleCreate} className="p-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Adicionar Novo Perfil de Leitura
                </h4>
                
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Nome do Leitor
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Esposa, Filho, etc."
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Avatar
                  </label>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {AVATAR_OPTIONS.map(av => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setNewAvatar(av)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                          newAvatar === av 
                            ? 'bg-amber-500 text-white scale-110 shadow-xs' 
                            : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
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
                    Salvar Membro
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-500 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Adicionar Novo Perfil</span>
              </button>
            )
          )}

        </div>

        {/* Rodapé Informativo */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
          O perfil de Administrador (Rafael) é protegido por PIN, impedindo que outros usuários visualizem ou alterem seu progresso.
        </div>

      </div>
    </div>
  );
}
