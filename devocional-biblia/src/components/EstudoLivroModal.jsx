import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  User, 
  Clock, 
  Target, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Search,
  BookMarked,
  Filter
} from 'lucide-react';
import { BIBLE_BOOKS_STUDY_INFO, getBookStudyInfo } from '../data/bibleBooksStudyInfo';

export default function EstudoLivroModal({ 
  isOpen, 
  onClose, 
  initialBookName = 'Lucas',
  onSelectChapterToRead
}) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [testamentFilter, setTestamentFilter] = useState('ALL'); // 'ALL' | 'AT' | 'NT'
  
  // Controle de acordeão mobile (cada seção expandida/recolhida)
  const [openSections, setOpenSections] = useState({
    author: true,
    historical: true,
    purpose: true,
    themes: true
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (initialBookName) {
      const info = getBookStudyInfo(initialBookName);
      if (info) setSelectedBook(info);
      else setSelectedBook(BIBLE_BOOKS_STUDY_INFO.find(b => b.name === 'Lucas') || BIBLE_BOOKS_STUDY_INFO[0]);
    }
  }, [initialBookName, isOpen]);

  if (!isOpen) return null;

  const currentBook = selectedBook || BIBLE_BOOKS_STUDY_INFO.find(b => b.name === 'Lucas') || BIBLE_BOOKS_STUDY_INFO[0];

  const filteredBooks = BIBLE_BOOKS_STUDY_INFO.filter(b => {
    const matchesTestament = 
      testamentFilter === 'ALL' ||
      (testamentFilter === 'AT' && b.testament === 'Antigo Testamento') ||
      (testamentFilter === 'NT' && b.testament === 'Novo Testamento');
    const matchesSearch = !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 sepia:bg-[#fbf0d9] rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-300 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
        
        {/* CABEÇALHO COM ALTO CONTRASTE */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#f4e4c1]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                Bíblia de Estudos • Panorama
              </h2>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 sepia:text-[#76634c]">
                Informações teológicas e históricas dos 66 livros
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

        {/* BARRA DE SELEÇÃO COMPACTA DO LIVRO (SUBSTITUI O SELECT NATIVO GIGANTE DO CELULAR) */}
        <div className="p-2.5 sm:p-3 bg-zinc-50 dark:bg-zinc-900/90 sepia:bg-[#eee0be]/50 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
          <div className="flex items-center gap-2">
            
            {/* Botão para abrir seletor compacto */}
            <button
              onClick={() => setShowBookPicker(!showBookPicker)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-amber-500 transition-colors"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-amber-600 dark:text-amber-400">Livro:</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">{currentBook.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">({currentBook.category})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showBookPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Ação para ler o livro */}
            {onSelectChapterToRead && (
              <button
                onClick={() => {
                  onSelectChapterToRead(currentBook.name, 1);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
              >
                Ler Livro ➔
              </button>
            )}
          </div>

          {/* PAINEL DE SELEÇÃO DE LIVROS COMPACTO COM FONTE AJUSTADA */}
          {showBookPicker && (
            <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 shadow-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar livro..."
                    className="w-full pl-7 pr-2 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setTestamentFilter('ALL')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg ${testamentFilter === 'ALL' ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTestamentFilter('AT')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg ${testamentFilter === 'AT' ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                >
                  AT (39)
                </button>
                <button
                  onClick={() => setTestamentFilter('NT')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg ${testamentFilter === 'NT' ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                >
                  NT (27)
                </button>
              </div>

              {/* Grid compacto de livros com tipografia calibrada */}
              <div className="grid grid-cols-3 sm:grid-cols-4 max-h-48 overflow-y-auto gap-1 pr-1">
                {filteredBooks.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBook(b);
                      setShowBookPicker(false);
                      setSearchTerm('');
                    }}
                    className={`px-2 py-1.5 text-left rounded-lg text-xs transition-colors flex items-center justify-between ${
                      b.id === currentBook.id
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="text-[9px] opacity-70 ml-1 shrink-0">{b.chapters}c</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL ROLÁVEL COM ACORDEÕES DE ALTO CONTRASTE */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          
          {/* Card Resumo do Livro */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 dark:bg-zinc-800/90 sepia:bg-[#f4e4c1]/60 border border-amber-200 dark:border-zinc-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {currentBook.testament} • {currentBook.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  {currentBook.name}
                </h1>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">
                  {currentBook.chapters} capítulos no cânon bíblico
                </p>
              </div>
            </div>
            
            {/* Versículo-Chave */}
            {currentBook.keyVerse && (
              <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 dark:border-zinc-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Versículo-Chave:
                </span>
                <blockquote className="mt-1 text-xs italic font-medium text-zinc-800 dark:text-zinc-200 border-l-2 border-amber-500 pl-2">
                  "{currentBook.keyVerse}"
                </blockquote>
              </div>
            )}
          </div>

          {/* 1. ACORDEÃO: QUEM ESCREVEU E PARA QUEM (AUTOR E DESTINATÁRIOS) */}
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 sepia:border-[#e6d3a7] overflow-hidden bg-zinc-50 dark:bg-zinc-800/90 sepia:bg-[#fbf0d9]/60">
            <button
              onClick={() => toggleSection('author')}
              className="w-full flex items-center justify-between p-3 text-left font-bold text-xs sm:text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
            >
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400">
                <User className="w-4 h-4 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Quem Escreveu e Para Quem
                </span>
              </div>
              {openSections.author ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            {openSections.author && (
              <div className="p-3 pt-0 space-y-2.5 text-xs leading-relaxed border-t border-zinc-200 dark:border-zinc-700">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Autor:
                  </h4>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {currentBook.author}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Destinatários:
                  </h4>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {currentBook.audience}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. ACORDEÃO: PERÍODO HISTÓRICO E CONTEMPORÂNEOS */}
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 sepia:border-[#e6d3a7] overflow-hidden bg-zinc-50 dark:bg-zinc-800/90 sepia:bg-[#fbf0d9]/60">
            <button
              onClick={() => toggleSection('historical')}
              className="w-full flex items-center justify-between p-3 text-left font-bold text-xs sm:text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
            >
              <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Período Histórico e Contemporâneos
                </span>
              </div>
              {openSections.historical ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            {openSections.historical && (
              <div className="p-3 pt-0 space-y-2.5 text-xs leading-relaxed border-t border-zinc-200 dark:border-zinc-700">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Datação / Época:
                  </h4>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {currentBook.period}
                  </p>
                </div>
                {currentBook.contemporaries && (
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                      Contemporâneos Relevantes:
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {currentBook.contemporaries}
                    </p>
                  </div>
                )}
                {currentBook.context && (
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                      Contexto Histórico & Geopolítico:
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {currentBook.context}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. ACORDEÃO: OBJETIVO DO LIVRO */}
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 sepia:border-[#e6d3a7] overflow-hidden bg-zinc-50 dark:bg-zinc-800/90 sepia:bg-[#fbf0d9]/60">
            <button
              onClick={() => toggleSection('purpose')}
              className="w-full flex items-center justify-between p-3 text-left font-bold text-xs sm:text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
            >
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <Target className="w-4 h-4 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Objetivo e Propósito Teológico do Livro
                </span>
              </div>
              {openSections.purpose ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            {openSections.purpose && (
              <div className="p-3 pt-0 space-y-1.5 text-xs leading-relaxed border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {currentBook.purpose}
                </p>
              </div>
            )}
          </div>

          {/* 4. ACORDEÃO: TEMAS PRINCIPAIS */}
          {currentBook.keyThemes && currentBook.keyThemes.length > 0 && (
            <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 sepia:border-[#e6d3a7] overflow-hidden bg-zinc-50 dark:bg-zinc-800/90 sepia:bg-[#fbf0d9]/60">
              <button
                onClick={() => toggleSection('themes')}
                className="w-full flex items-center justify-between p-3 text-left font-bold text-xs sm:text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
              >
                <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                    Temas Centrais & Ensinamentos
                  </span>
                </div>
                {openSections.themes ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
              </button>

              {openSections.themes && (
                <div className="p-3 pt-0 border-t border-zinc-200 dark:border-zinc-700">
                  <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                    {currentBook.keyThemes.map((theme, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span>{theme}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RODAPÉ */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-100 dark:bg-zinc-800 sepia:bg-[#f4e4c1] flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
          <span>{currentBook.name} • {currentBook.testament}</span>
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
