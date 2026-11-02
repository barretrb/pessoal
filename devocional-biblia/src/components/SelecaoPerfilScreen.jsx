import React, { useState } from 'react';
import { BookOpen, Users, UserPlus, Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

const AVATAR_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '✝️', '📖', '🕊️', '❤️', '🌟', '🛡️'];

export default function SelecaoPerfilScreen({
  profiles = [],
  onSelectProfileRequest,
  onCreateProfile
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('👤');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(newName.trim(), newAvatar, 'amber', 'member');
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 sepia:bg-[#fbf0d9] text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] transition-colors">
      
      {/* Container Centralizado */}
      <div className="max-w-xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Cabeçalho da Marca */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 items-center justify-center text-white shadow-xl shadow-orange-500/25 mb-1">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sepia:text-[#433422]">
            Devocional 365 • NVT
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c]">
            Quem está lendo a Palavra de Deus hoje?
          </p>
        </div>

        {/* Grade de Perfis Existentes */}
        {!isCreating ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {profiles.map((p) => {
                const isAdmin = p.role === 'admin';
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProfileRequest(p)}
                    className="p-4 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-white dark:bg-zinc-900 sepia:bg-[#f5e6ca]/60 hover:border-amber-500 hover:scale-105 transition-all text-center flex flex-col items-center justify-between group shadow-xs hover:shadow-lg cursor-pointer"
                  >
                    <div className="relative mb-2">
                      <span className="text-4xl w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#ebd4b0] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        {p.avatar || '👤'}
                      </span>
                      {p.requiresPin && (
                        <span className="absolute -top-1 -right-1 p-1 bg-zinc-900 text-amber-400 rounded-full shadow-md">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors truncate max-w-[120px] block">
                        {p.name}
                      </span>
                      {isAdmin ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 block">
                          Leitor
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Card de Adicionar Novo Leitor */}
              <button
                onClick={() => setIsCreating(true)}
                className="p-4 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 hover:scale-105 transition-all text-center flex flex-col items-center justify-center space-y-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-bold text-xs text-amber-900 dark:text-amber-300 block">
                    Novo Leitor
                  </span>
                  <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 block">
                    + Criar perfil
                  </span>
                </div>
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                💡 Cada leitor tem seu progresso, favoritos, histórico e preferências 100% individualizados.
              </p>
            </div>
          </div>
        ) : (
          /* Formulário de Criação de Novo Perfil */
          <form 
            onSubmit={handleCreate}
            className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sepia:bg-[#f5e6ca]/80 shadow-xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Criar Meu Perfil de Leitor
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Comece sua jornada com seu próprio progresso
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Qual é o seu nome ou apelido?
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Carlos, Ana, Pastor..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 outline-none"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Escolha seu Avatar
              </label>
              <div className="flex items-center flex-wrap gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setNewAvatar(av)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      newAvatar === av
                        ? 'bg-amber-500 text-white scale-110 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:scale-105'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Entrar e Começar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
