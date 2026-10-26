import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertTriangle } from 'lucide-react';

export default function PinAuthModal({
  isOpen,
  onClose,
  targetProfileName,
  onSuccess
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSuccess(pin)) {
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
          Acesso Protegido
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
          O perfil de <strong>{targetProfileName}</strong> é protegido por PIN de administrador.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Digite o PIN (ex: 1234)"
              className="w-full text-center text-xl tracking-widest font-mono py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span>PIN incorreto. Acesso restrito.</span>
            </p>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError(false);
                onClose();
              }}
              className="w-1/2 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
