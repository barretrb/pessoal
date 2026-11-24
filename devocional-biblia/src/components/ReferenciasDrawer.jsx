import React, { useState } from 'react';
import { X, Link2, BookOpen, Copy, Check, ArrowUpRight, Sparkles } from 'lucide-react';

const CATEGORY_STYLES = {
  'Citação & Cumprimento': {
    label: 'Citação & Cumprimento',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Citação direta das Escrituras ou cumprimento histórico-profético.'
  },
  'Passagem Paralela': {
    label: 'Passagem Paralela',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    description: 'Relato sinótico, paralelo histórico ou ensino correlato do mesmo autor.'
  },
  'Tipologia & Aliança': {
    label: 'Tipologia & Aliança',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
    description: 'Conexão redentiva entre figuras, alianças do Antigo Testamento e Cristo.'
  },
  'Harmonia Doutrinária': {
    label: 'Harmonia Doutrinária',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    description: 'Aprofundamento teológico da mesma doutrina na analogia da fé.'
  }
};

function parseRefForNavigation(refStr) {
  if (!refStr) return null;
  const m = refStr.trim().match(/^(.+?)\s+(\d+):(\d+)/);
  if (!m) return null;
  return {
    book: m[1].trim(),
    chapter: parseInt(m[2], 10)
  };
}

export default function ReferenciasDrawer({
  isOpen,
  onClose,
  verseKey,
  sourceText,
  references,
  onNavigateToPassage
}) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (item, idx) => {
    const textToCopy = item.text ? `${item.ref} (NVT) — "${item.text}"` : item.ref;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Referências Exegéticas (NVT)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Conexões bíblicas e teológicas de <strong className="text-zinc-700 dark:text-zinc-200">{verseKey}</strong>
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

          {/* Versículo de Origem em Destaque para Comparação Exegética */}
          {sourceText && (
            <div className="px-5 py-3.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/70 dark:border-amber-900/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Texto Base • {verseKey}
                </span>
                <span className="text-[10px] font-medium text-amber-700/80 dark:text-amber-400/80">
                  Escritura interpreta Escritura
                </span>
              </div>
              <p className="font-scripture text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                “{sourceText}”
              </p>
            </div>
          )}

          {/* Lista de Referências */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {references && references.length > 0 ? (
              references.map((item, idx) => {
                const catKey = item.category && CATEGORY_STYLES[item.category]
                  ? item.category
                  : 'Harmonia Doutrinária';
                const catStyle = CATEGORY_STYLES[catKey];
                const navTarget = parseRefForNavigation(item.ref);

                return (
                  <div 
                    key={idx}
                    className="rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2.5 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.ref}</span>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {/* Badge da Ponte Hermenêutica */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center space-x-1 ${catStyle.badgeClass}`}
                          title={catStyle.description}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{catStyle.label}</span>
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
                    </div>

                    {item.text ? (
                      <p className="font-scripture text-sm text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
                        “{item.text}”
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                        Consulte esta passagem para aprofundar seu estudo bíblico.
                      </p>
                    )}

                    {/* Rodapé do Card: Explicação da Ponte + Ação de Abrir Capítulo */}
                    <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-zinc-500 dark:text-zinc-400 truncate">
                        {catStyle.description}
                      </span>

                      {navTarget && onNavigateToPassage && (
                        <button
                          onClick={() => {
                            onNavigateToPassage(navTarget.book, navTarget.chapter);
                            onClose();
                          }}
                          className="inline-flex items-center space-x-1 font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
                          title={`Abrir ${navTarget.book} ${navTarget.chapter} no leitor bíblico`}
                        >
                          <span>Abrir cap.</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-sm">Nenhuma referência adicional cadastrada para este versículo.</p>
              </div>
            )}
          </div>

          {/* Rodapé informativo */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 text-center">
            Curadoria exegética baseada em citações diretas, cumprimento profético, tipologia e analogia da fé (NVT).
          </div>

        </div>
      </div>
    </div>
  );
}
