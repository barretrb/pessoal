import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CloudDownload, 
  CloudUpload, 
  Check, 
  Share2, 
  Copy, 
  Smartphone, 
  Laptop, 
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { cloudDbService } from '../services/cloudDbService';
import { storage } from '../services/storage';

export default function CloudSyncModal({
  isOpen,
  onClose,
  onDataSynced
}) {
  const [config, setConfig] = useState(() => storage.getCloudConfig());
  const [familyCodeInput, setFamilyCodeInput] = useState(config.familyCode || 'FAMILIA-BARRETO');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);

    const res = await cloudDbService.syncWithCloud(familyCodeInput.trim().toUpperCase());
    setIsSyncing(false);

    if (res.success) {
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
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                Banco de Dados & Nuvem
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sincronize entre celular, computador e família
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

        {/* Conteúdo */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-zinc-950/40">
          
          {/* Card com Código da Família para Conectar Outro Aparelho */}
          <div className="p-4 rounded-2xl border-2 border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 space-y-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <Laptop className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wide">
                Código de Sincronização Familiar
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Digite este mesmo código no seu outro aparelho ou no celular da sua esposa para sincronizarem o mesmo banco:
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={familyCodeInput}
                onChange={(e) => setFamilyCodeInput(e.target.value)}
                className="flex-1 font-mono uppercase font-bold text-sm px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-sky-500"
                placeholder="Ex: FAMILIA-BARRETO"
              />
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1 shadow-xs"
                title="Copiar código"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Botão Sincronizar Agora */}
          <div className="space-y-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando com a Nuvem...' : 'Sincronizar com a Nuvem Agora'}</span>
            </button>

            {config.lastSyncedAt && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
                Última sincronização: {new Date(config.lastSyncedAt).toLocaleString('pt-BR')}
              </p>
            )}

            {syncStatusMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                syncStatusMsg.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {syncStatusMsg.text}
              </div>
            )}
          </div>

          {/* Opções de Backup Manual (Segurança Total) */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Backup do Histórico Completo
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadBackup}
                className="py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Baixar Backup</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Restaurar</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
