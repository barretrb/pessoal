import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  Check, 
  Copy, 
  Smartphone, 
  Laptop, 
  RefreshCw,
  Download,
  Upload,
  Database,
  Lock,
  Mail,
  LogOut,
  UserCheck
} from 'lucide-react';
import { cloudDbService } from '../services/cloudDbService';
import { storage } from '../services/storage';
import { supabase } from '../services/supabaseClient';
import { supabaseSyncService } from '../services/supabaseSyncService';

export default function CloudSyncModal({
  isOpen,
  onClose,
  onDataSynced
}) {
  const [config, setConfig] = useState(() => storage.getCloudConfig());
  const initialSyncCode = (config.familyCode === 'FAMILIA-BARRETO' ? 'DEVOCIONAL-SYNC-RAFAEL' : config.familyCode) || 'DEVOCIONAL-SYNC-RAFAEL';
  const [familyCodeInput, setFamilyCodeInput] = useState(initialSyncCode);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // Estados de Autenticação Supabase
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setSupabaseUser(user || null);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSupabaseAuth = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) throw error;
        setSupabaseUser(data.user);
        setSyncStatusMsg({ type: 'success', text: 'Login realizado com sucesso! Sincronizando com Supabase...' });
        await supabaseSyncService._migrateLocalDataIfEmpty();
        if (onDataSynced) onDataSynced();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) throw error;
        setSupabaseUser(data.user);
        setSyncStatusMsg({ type: 'success', text: 'Conta criada com sucesso! Conectado ao Supabase.' });
        await supabaseSyncService._migrateLocalDataIfEmpty();
        if (onDataSynced) onDataSynced();
      }
    } catch (err) {
      setAuthError(err.message || 'Falha na autenticação com o Supabase.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSupabaseSignOut = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setAuthLoading(false);
    setSyncStatusMsg({ type: 'success', text: 'Desconectado da conta Supabase.' });
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    // 1. Sincroniza com Supabase se usuário estiver logado
    if (supabaseUser) {
      await supabaseSyncService._migrateLocalDataIfEmpty();
    }

    // 2. Mantém redundância no cofre REST existente
    await cloudDbService.fetchAndMergeLatest();
    const res = await cloudDbService.syncWithCloud(familyCodeInput.trim().toUpperCase());
    setIsSyncing(false);

    if (res.success || supabaseUser) {
      setSyncStatusMsg({ type: 'success', text: 'Sincronizado com a nuvem com sucesso!' });
      setConfig(storage.getCloudConfig());
      if (onDataSynced) onDataSynced();
    } else {
      setSyncStatusMsg({ type: 'error', text: 'Erro ao conectar à nuvem.' });
    }
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(familyCodeInput.trim().toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleDownloadBackup = () => {
    cloudDbService.downloadBackupFile();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const ok = cloudDbService.applyCloudPayload(json);
        if (ok) {
          setSyncStatusMsg({ type: 'success', text: 'Backup restaurado com sucesso!' });
          if (onDataSynced) onDataSynced();
        } else {
          setSyncStatusMsg({ type: 'error', text: 'Arquivo de backup inválido.' });
        }
      } catch (err) {
        setSyncStatusMsg({ type: 'error', text: 'Falha ao ler o arquivo JSON.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                Banco de Dados & Nuvem
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sincronismo em tempo real (Supabase PostgreSQL)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">

          {/* Feedback de Status */}
          {syncStatusMsg && (
            <div className={`p-3 rounded-2xl text-xs flex items-center space-x-2 ${
              syncStatusMsg.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
            }`}>
              <Check className="w-4 h-4 shrink-0" />
              <span>{syncStatusMsg.text}</span>
            </div>
          )}

          {/* Card Supabase Auth (Principal) */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nuvem Supabase (PostgreSQL 17)</span>
              </span>
              {supabaseUser ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Conectado</span>
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Desconectado
                </span>
              )}
            </div>

            {supabaseUser ? (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {supabaseUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSupabaseSignOut}
                    disabled={authLoading}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Desconectar conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Seus 365 dias de leitura, favoritos e telemetria estão sincronizados com segurança permanente no banco do Supabase.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupabaseAuth} className="space-y-3 pt-1">
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`pb-1 font-semibold transition-colors border-b-2 ${
                      authMode === 'login' 
                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    Entrar na Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`pb-1 font-semibold transition-colors border-b-2 ${
                      authMode === 'register' 
                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>

                {authError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    {authError}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="Seu email (ex: rafael@exemplo.com)"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="Sua senha segura"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {authLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{authMode === 'login' ? 'Entrar e Sincronizar' : 'Criar Conta e Salvar Dados'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Botão de Sincronização Geral */}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando Nuvem...' : 'Sincronizar Todos os Dados Agora'}</span>
          </button>

          {/* Backup Manual / Arquivo JSON */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Backup Físico em Arquivo
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadBackup}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>

              <label className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
