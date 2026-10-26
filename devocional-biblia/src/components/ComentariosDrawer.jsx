import React, { useState, useEffect } from 'react';
import { X, BookOpen, MessageSquare, Save, Check, Sparkles, Heart } from 'lucide-react';
import { storage } from '../services/storage';
import { bibleCommentaryService } from '../services/bibleCommentaryService';

export default function ComentariosDrawer({ isOpen, onClose, chapterData }) {
  if (!isOpen) return null;

  const bookName = chapterData?.book || 'Capítulo';
  const chapterNum = chapterData?.chapter || '1';

  // Obtém o comentário teológico do serviço ou do chapterData
  const commentary = (chapterData?.commentary?.overview)
    ? chapterData.commentary
    : bibleCommentaryService.getCommentary(bookName, chapterNum);

  const noteKey = `note_chapter_${chapterData?.book}_${chapterData?.chapter}`;
  const [userNote, setUserNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(noteKey);
      if (saved) setUserNote(saved);
    } catch (e) {}
  }, [noteKey]);

  const handleSaveNote = () => {
    try {
      localStorage.setItem(noteKey, userNote);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {}
  };

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
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Visão Geral Teológica */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Visão Geral da Perícope
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
                      className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60"
                    >
                      • {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chave Cristocêntrica */}
            {commentary.christocentricKey && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50/70 to-amber-50/70 dark:from-red-950/25 dark:to-amber-950/25 border border-red-200/60 dark:border-red-900/40 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>Conexão Cristocêntrica & Redentora</span>
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-scripture">
                  {commentary.christocentricKey}
                </p>
              </div>
            )}

            {/* Diário Espiritual do Usuário */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Meu Diário Espiritual</span>
                </span>
                <button
                  onClick={handleSaveNote}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Salvo!' : 'Salvar Reflexão'}</span>
                </button>
              </div>

              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="O que Deus falou ao seu coração hoje através desta passagem? Registre aqui suas orações e aprendizados..."
                className="w-full h-36 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none font-scripture"
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
