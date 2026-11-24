import React, { useState } from 'react';
import { BookOpen, UserPlus, ArrowRight, UserCheck } from 'lucide-react';

const AVATAR_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '✝️', '📖', '🕊️', '❤️', '🌟', '🛡️'];

export default function SelecaoPerfilScreen({
  profiles = [],
  existingProfiles: existingProfilesProp,
  onSelectProfileRequest,
  onCreateProfile
}) {
  // A tela para pessoa não logada leva diretamente para Criar Conta!
  const [viewMode, setViewMode] = useState('create'); // 'create' | 'existing'
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('👤');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(newName.trim(), newAvatar, 'amber', 'member');
    setNewName('');
  };

  const existingProfiles = (existingProfilesProp && existingProfilesProp.length > 0)
    ? existingProfilesProp
    : (profiles && profiles.length > 0 ? profiles : []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F9FAFB] dark:bg-[#09090B] sepia:bg-[#F5EFE6] text-zinc-900 dark:text-zinc-100 sepia:text-[#2C221E] transition-colors font-sans">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Marca Limpa */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-amber-500 items-center justify-center text-white dark:text-zinc-950 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Devocional 365
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {viewMode === 'create'
                ? 'Crie seu perfil para iniciar sua leitura bíblica anual (NVT)'
                : 'Selecione seu perfil para continuar a leitura'}
            </p>
          </div>
        </div>

        {viewMode === 'create' ? (
          <div className="p-6 sm:p-7 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 sepia:border-[#E6DBC8] bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                  Criar Perfil de Leitura
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Progresso, destaques e notas sincronizados
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex.: Carlos, Ana..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-amber-500 outline-none transition-shadow"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Ícone do perfil
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewAvatar(av)}
                      className={`h-10 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer border ${
                        newAvatar === av
                          ? 'bg-zinc-900 dark:bg-amber-500 text-white border-zinc-900 dark:border-amber-500 shadow-2xs'
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer mt-2"
              >
                <span>Começar Leitura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {existingProfiles.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                <button
                  type="button"
                  onClick={() => setViewMode('existing')}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center justify-center space-x-1.5 mx-auto cursor-pointer transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Já possui perfil cadastrado? Entrar</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-7 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 sepia:border-[#E6DBC8] bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
                  Entrar com Perfil Existente
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Selecione sua conta para sincronizar
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {existingProfiles.map((p) => {
                const isAdmin = p.role === 'admin' || p.name?.toLowerCase() === 'rafael';
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProfileRequest(p)}
                    className="w-full p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        {p.avatar || '👤'}
                      </span>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            {p.name}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {isAdmin ? 'Conta Principal' : 'Leitor'}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center justify-center space-x-1.5 mx-auto cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar novo perfil</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
