import React, { useState, useEffect } from 'react';
import { X, BookOpen, Heart, Sparkles, PenLine, Check, ListTree } from 'lucide-react';
import { bibleCommentaryService } from '../services/bibleCommentaryService';
import { cloudDbService } from '../services/cloudDbService';

export default function ComentariosDrawer({ isOpen, onClose, chapterData }) {
  const bookName = chapterData?.book || 'Capítulo';
  const chapterNum = chapterData?.chapter || '1';
  const noteStorageKey = `note_chapter_${bookName}_${chapterNum}`;

  const [personalNote, setPersonalNote] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen && bookName && chapterNum) {
      try {
        const existing = localStorage.getItem(noteStorageKey) || '';
        setPersonalNote(existing);
      } catch (e) {
        setPersonalNote('');
      }
    }
  }, [isOpen, noteStorageKey, bookName, chapterNum]);

  if (!isOpen) return null;

  const sections = chapterData?.sections || [];
  const allVerses = sections.flatMap(s => s.verses || []);

  const commentary = (chapterData?.commentary?.overview)
    ? chapterData.commentary
    : bibleCommentaryService.getCommentary(bookName, chapterNum, allVerses, sections);

  const handleSaveNote = () => {
    try {
      const trimmed = personalNote.trim();
      if (trimmed) {
        localStorage.setItem(noteStorageKey, trimmed);
      } else {
        localStorage.removeItem(noteStorageKey);
      }
      cloudDbService.triggerAutoSync();
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/45 backdrop-blur-2xs transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-tight">
                  Comentário Expositivo & Diário
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {commentary.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              title="Fechar comentários"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. Estrutura de Perícopes do Capítulo na NVT */}
            {sections.some(s => s.title) && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-1.5">
                  <ListTree className="w-3.5 h-3.5 text-amber-600" />
                  <span>Estrutura de Seções em {bookName} {chapterNum} (NVT)</span>
                </span>
                <div className="space-y-1.5 pt-1">
                  {sections.filter(s => s.title).map((sec, idx) => {
                    const vFirst = sec.verses?.[0]?.number;
                    const vLast = sec.verses?.[sec.verses.length - 1]?.number;
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {idx + 1}. {sec.title}
                        </span>
                        {vFirst && (
                          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                            vv. {vFirst}{vLast && vLast !== vFirst ? `–${vLast}` : ''}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Visão Geral Teológica */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Síntese Exegética do Capítulo</span>
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-scripture">
                {commentary.overview}
              </p>
            </div>

            {/* 3. Temas Centrais */}
            {commentary.keyThemes && commentary.keyThemes.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Eixos Doutrinários & Meditação
                </span>
                <div className="space-y-1.5">
                  {commentary.keyThemes.map((theme, i) => (
                    <div 
                      key={i}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/50 flex items-start space-x-2"
                    >
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{theme}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Chave Cristocêntrica */}
            {commentary.christocentricKey && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 to-amber-50/70 dark:from-rose-950/30 dark:to-amber-950/30 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center space-x-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  <span>Conexão Cristocêntrica & Redentora</span>
                </span>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-scripture">
                  {commentary.christocentricKey}
                </p>
              </div>
            )}

            {/* 5. Diário Espiritual & Anotações Pessoais do Capítulo */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                  <PenLine className="w-3.5 h-3.5 text-amber-600" />
                  <span>Minha Meditação em {bookName} {chapterNum}</span>
                </span>
                {savedFeedback && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Anotação salva!</span>
                  </span>
                )}
              </div>

              <textarea
                rows={4}
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                onBlur={handleSaveNote}
                placeholder={`Registre aqui sua oração, aplicação pessoal ou aprendizado ao ler ${bookName} ${chapterNum}...`}
                className="w-full rounded-2xl p-3.5 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Salvar Meditação
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
