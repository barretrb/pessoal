import React, { useState } from 'react';
import { X, Link2, BookOpen, Copy, Check } from 'lucide-react';

export default function ReferenciasDrawer({ isOpen, onClose, verseKey, references }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (item, idx) => {
    const textToCopy = item.text ? `${item.ref} - "${item.text}"` : item.ref;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Referências Cruzadas
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Passagens conectadas a {verseKey}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Referências */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {references && references.length > 0 ? (
              references.map((item, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2 hover:border-amber-400/50 dark:hover:border-amber-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{item.ref}</span>
                    </span>

                    <button
                      onClick={() => handleCopy(item, idx)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded transition-colors"
                      title="Copiar referência e texto"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {item.text ? (
                    <p className="font-scripture text-sm text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
                      "{item.text}"
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                      Consulte esta passagem para aprofundar seu estudo bíblico.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-sm">Nenhuma referência adicional cadastrada para este versículo.</p>
              </div>
            )}
          </div>

          {/* Rodapé informativo */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 text-center">
            As referências cruzadas iluminam a Escritura através da própria Escritura.
          </div>

        </div>
      </div>
    </div>
  );
}
