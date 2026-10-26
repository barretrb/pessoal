import React from 'react';
import { X, BookOpen, Heart, Sparkles } from 'lucide-react';
import { bibleCommentaryService } from '../services/bibleCommentaryService';

export default function ComentariosDrawer({ isOpen, onClose, chapterData }) {
  if (!isOpen) return null;

  const bookName = chapterData?.book || 'Capítulo';
  const chapterNum = chapterData?.chapter || '1';

  // Obtém o comentário teológico do serviço ou do chapterData
  const commentary = (chapterData?.commentary?.overview)
    ? chapterData.commentary
    : bibleCommentaryService.getCommentary(bookName, chapterNum);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Comentários & Contexto
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {commentary.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
              title="Fechar comentários"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Visão Geral Teológica */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visão Geral da Perícope</span>
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-scripture">
                {commentary.overview}
              </p>
            </div>

            {/* Temas Centrais */}
            {commentary.keyThemes && commentary.keyThemes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Temas Chave para Meditação
                </span>
                <div className="flex flex-wrap gap-2">
                  {commentary.keyThemes.map((theme, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60"
                    >
                      • {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chave Cristocêntrica */}
            {commentary.christocentricKey && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50/70 to-amber-50/70 dark:from-red-950/30 dark:to-amber-950/30 border border-red-200/60 dark:border-red-900/40 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center space-x-1.5">
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  <span>Conexão Cristocêntrica & Redentora</span>
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-scripture">
                  {commentary.christocentricKey}
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
