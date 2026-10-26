import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Info, 
  ChevronRight, 
  Check, 
  Sparkles,
  BookMarked
} from 'lucide-react';
import { BIBLE_BOOKS_STUDY_INFO } from '../data/bibleBooksStudyInfo';

export default function NavegacaoBibliaModal({
  isOpen,
  onClose,
  onSelectChapter,
  onOpenStudyInfo,
  chapterProgress = {}
}) {
  const [activeTestament, setActiveTestament] = useState('ALL'); // 'ALL' | 'AT' | 'NT'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBookId, setExpandedBookId] = useState('lucas'); // Lucas expandido por padrão

  if (!isOpen) return null;

  const filteredBooks = BIBLE_BOOKS_STUDY_INFO.filter(b => {
    const matchesTestament = 
      activeTestament === 'ALL' ||
      (activeTestament === 'AT' && b.testament === 'Antigo Testamento') ||
      (activeTestament === 'NT' && b.testament === 'Novo Testamento');

    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !cleanSearch ||
      b.name.toLowerCase().includes(cleanSearch) ||
      b.category.toLowerCase().includes(cleanSearch);

    return matchesTestament && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 sepia:bg-[#fbf0d9] rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-300 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
        
        {/* CABEÇALHO COM CONTRASTE NÍTIDO */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#f4e4c1]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                Bíblia Sagrada • Navegação
              </h2>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 sepia:text-[#76634c]">
                Selecione o livro e capítulo desejado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FILTROS E BUSCA COMPACTOS */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/90 sepia:bg-[#eee0be]/50 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] space-y-2.5">
          
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar livro ou categoria (ex: Lucas, Salmos)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Abas de Testamento compactas */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTestament('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTestament === 'ALL'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Todos (66)
            </button>
            <button
              onClick={() => setActiveTestament('AT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTestament === 'AT'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Antigo (39)
            </button>
            <button
              onClick={() => setActiveTestament('NT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTestament === 'NT'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Novo (27)
            </button>
          </div>
        </div>

        {/* LISTA DE LIVROS COMPACTA E LEGÍVEL (SEM FONTES GIGANTES, ALTO CONTRASTE) */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-2">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-xs">
              Nenhum livro encontrado para "{searchTerm}".
            </div>
          ) : (
            filteredBooks.map((book) => {
              const isExpanded = expandedBookId === book.id;
              const hasFullText = book.id === 'lucas'; // Lucas já tem texto completo no app

              return (
                <div 
                  key={book.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'border-amber-400 dark:border-amber-500 bg-amber-50/40 dark:bg-zinc-800 shadow-xs' 
                      : 'border-zinc-200 dark:border-zinc-700 sepia:border-[#e6d3a7] bg-zinc-50 dark:bg-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  {/* Linha do Livro Compacta */}
                  <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
                    <div 
                      onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                      className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        hasFullText 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                      }`}>
                        {book.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] truncate">
                            {book.name}
                          </span>
                          {hasFullText && (
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">
                              Disponível
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c]">
                          {book.category} • {book.chapters} cap.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Botão de Estudo do Livro */}
                      <button
                        onClick={() => onOpenStudyInfo(book.name)}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[11px] font-semibold transition-colors"
                        title={`Ver informações de estudo de ${book.name}`}
                      >
                        <Info className="w-3 h-3" />
                        <span>Estudo</span>
                      </button>

                      {/* Botão expandir capítulos */}
                      <button
                        onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        title={isExpanded ? "Recolher capítulos" : "Ver capítulos"}
                      >
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Grade de Capítulos quando expandido */}
                  {isExpanded && (
                    <div className="p-2.5 sm:p-3 pt-0 border-t border-zinc-200 dark:border-zinc-700 space-y-1.5 bg-white/70 dark:bg-zinc-800/50">
                      <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                        <span className="font-medium">Escolha o capítulo:</span>
                        {!hasFullText && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            (Estudo teológico disponível)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
                        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chNum) => {
                          const chKey = `${book.name} ${chNum}`;
                          const isDone = chapterProgress[chKey]?.completed;

                          return (
                            <button
                              key={chNum}
                              onClick={() => {
                                onSelectChapter(book.name, chNum);
                                onClose();
                              }}
                              className={`relative py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isDone 
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-amber-500 hover:text-white'
                              }`}
                              title={isDone ? `${chKey} (Concluído)` : `Ler ${chKey}`}
                            >
                              <span>{chNum}</span>
                              {isDone && (
                                <span className="absolute top-0 right-0.5 text-[8px] text-emerald-600 dark:text-emerald-400 font-black">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* RODAPÉ */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#f4e4c1] flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
          <span>66 Livros da Bíblia Sagrada (NVT)</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-xl bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 text-zinc-900 dark:text-zinc-100 font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
