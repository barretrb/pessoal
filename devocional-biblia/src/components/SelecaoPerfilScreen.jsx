import React, { useState } from 'react';
import { BookOpen, UserPlus, Lock, Sparkles, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 sepia:bg-[#fbf0d9] text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] transition-colors">
      
      {/* Container Central */}
      <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Cabeçalho da Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 items-center justify-center text-white shadow-xl shadow-orange-500/25 mb-1">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sepia:text-[#433422]">
            Devocional 365 • NVT
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c]">
            {viewMode === 'create' 
              ? 'Crie seu perfil para começar sua leitura bíblica personalizada' 
              : 'Selecione sua conta para continuar sua leitura'}
          </p>
        </div>

        {/* MODO 1: CRIAR CONTA (PADRÃO PARA QUEM NÃO ESTÁ LOGADO) */}
        {viewMode === 'create' ? (
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-white dark:bg-zinc-900 sepia:bg-[#f5e6ca]/80 shadow-2xl space-y-5">
            
            <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Criar Minha Conta
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Acesso individualizado e progresso pessoal
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Qual é o seu nome?
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Digite seu nome (ex: Carlos, Ana, Pastor...)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Escolha um Avatar
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

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer mt-2"
              >
                <span>Criar Conta e Começar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Alternar para contas já existentes no aparelho */}
            {existingProfiles.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <button
                  type="button"
                  onClick={() => setViewMode('existing')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Já tem conta neste aparelho? Entrar</span>
                </button>
              </div>
            )}

          </div>
        ) : (
          /* MODO 2: ENTRAR COM CONTA EXISTENTE NO APARELHO */
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-white dark:bg-zinc-900 sepia:bg-[#f5e6ca]/80 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                  Entrar com Conta Existente
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Selecione o seu perfil neste dispositivo
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
                    className="w-full p-3.5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-50 dark:bg-zinc-800/80 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl w-12 h-12 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-2xs shrink-0">
                        {p.avatar || '👤'}
                      </span>
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                            {p.name}
                          </span>
                          {isAdmin && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500 text-white">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {isAdmin ? 'Conta Principal (Rafael)' : 'Leitor Individual'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-zinc-400 group-hover:text-amber-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <button
                type="button"
                onClick={() => setViewMode('create')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar uma nova conta</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
