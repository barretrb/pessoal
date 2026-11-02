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
  Filter,
  ArrowRight
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
  
  // Controle de acordeão (cada seção expandida/recolhida)
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

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-white dark:bg-zinc-950 sepia:bg-[#fbf0d9] text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] overflow-hidden animate-in fade-in duration-200">
      
      {/* 1. CABEÇALHO EM TELA CHEIA (LAPTOP & CELULAR) */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-50 dark:bg-zinc-900/90 sepia:bg-[#f4e4c1] shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 dark:text-zinc-50 sepia:text-[#433422] truncate">
              Bíblia de Estudos • Panorama Teológico
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 sepia:text-[#76634c] truncate">
              Informações teológicas, cronológicas e contexto histórico dos 66 livros
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onSelectChapterToRead && (
            <button
              onClick={() => {
                onSelectChapterToRead(currentBook.name, 1);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all hover:scale-105 shadow-sm shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
              title="Abrir o leitor bíblico no capítulo 1 deste livro"
            >
              <span>Ler Livro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. BARRA DE SELEÇÃO COMPACTA DO LIVRO */}
      <div className="px-4 sm:px-8 py-2.5 bg-zinc-100/80 dark:bg-zinc-900/50 sepia:bg-[#eee0be]/40 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] shrink-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookPicker(!showBookPicker)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800/90 sepia:bg-[#fbf0d9] border border-zinc-300 dark:border-zinc-700 sepia:border-[#e6d3a7] flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:border-amber-500 transition-colors shadow-2xs cursor-pointer"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-amber-600 dark:text-amber-400">Livro Atual:</span>
                <span className="text-zinc-900 dark:text-zinc-50 font-extrabold">{currentBook.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">({currentBook.category} • {currentBook.testament})</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showBookPicker ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* PAINEL DE SELEÇÃO DE LIVROS FULL-WIDTH RESPONSIVO */}
          {showBookPicker && (
            <div className="mt-2.5 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-800 sepia:bg-[#fbf0d9] border border-zinc-300 dark:border-zinc-700 sepia:border-[#e6d3a7] shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar livro bíblico (ex: Gênesis, Romanos, Salmos)..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setTestamentFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${testamentFilter === 'ALL' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                  >
                    Todos (66)
                  </button>
                  <button
                    onClick={() => setTestamentFilter('AT')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${testamentFilter === 'AT' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                  >
                    AT (39)
                  </button>
                  <button
                    onClick={() => setTestamentFilter('NT')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${testamentFilter === 'NT' ? 'bg-amber-500 text-white shadow-2xs' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                  >
                    NT (27)
                  </button>
                </div>
              </div>

              {/* Grid amplo de livros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredBooks.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBook(b);
                      setShowBookPicker(false);
                      setSearchTerm('');
                    }}
                    className={`px-2.5 py-2 text-left rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      b.id === currentBook.id
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800'
                    }`}
                  >
                    <span className="truncate font-medium">{b.name}</span>
                    <span className="text-[10px] opacity-70 ml-1 shrink-0">{b.chapters}c</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL ROLÁVEL COM LARGURA ÓTIMA PARA LEITURA */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          
          {/* Card Resumo do Livro */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 dark:bg-zinc-900/80 sepia:bg-[#f4e4c1]/60 border border-amber-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {currentBook.testament} • {currentBook.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
                  {currentBook.name}
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {currentBook.chapters} capítulos no cânon bíblico
                </p>
              </div>
            </div>
            
            {/* Versículo-Chave */}
            {currentBook.keyVerse && (
              <div className="mt-4 pt-3.5 border-t border-amber-200/80 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Versículo-Chave:
                </span>
                <blockquote className="mt-1 text-xs sm:text-sm italic font-medium text-zinc-800 dark:text-zinc-200 border-l-2 border-amber-500 pl-3 leading-relaxed">
                  "{currentBook.keyVerse}"
                </blockquote>
              </div>
            )}
          </div>

          {/* 1. ACORDEÃO: QUEM ESCREVEU E PARA QUEM (AUTOR E DESTINATÁRIOS) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-900/60 sepia:bg-[#fbf0d9]/60 shadow-2xs">
            <button
              onClick={() => toggleSection('author')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 text-amber-700 dark:text-amber-400">
                <User className="w-4 h-4 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Quem Escreveu e Para Quem
                </span>
              </div>
              {openSections.author ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {openSections.author && (
              <div className="p-4 pt-0 space-y-3 text-xs sm:text-sm leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
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
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-900/60 sepia:bg-[#fbf0d9]/60 shadow-2xs">
            <button
              onClick={() => toggleSection('historical')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 text-indigo-700 dark:text-indigo-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Período Histórico e Contemporâneos
                </span>
              </div>
              {openSections.historical ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {openSections.historical && (
              <div className="p-4 pt-0 space-y-3 text-xs sm:text-sm leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
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
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-900/60 sepia:bg-[#fbf0d9]/60 shadow-2xs">
            <button
              onClick={() => toggleSection('purpose')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 text-emerald-700 dark:text-emerald-400">
                <Target className="w-4 h-4 shrink-0" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Objetivo e Propósito Teológico do Livro
                </span>
              </div>
              {openSections.purpose ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {openSections.purpose && (
              <div className="p-4 pt-0 space-y-2 text-xs sm:text-sm leading-relaxed border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                  {currentBook.purpose}
                </p>
              </div>
            )}
          </div>

          {/* 4. ACORDEÃO: TEMAS PRINCIPAIS */}
          {currentBook.keyThemes && currentBook.keyThemes.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-900/60 sepia:bg-[#fbf0d9]/60 shadow-2xs">
              <button
                onClick={() => toggleSection('themes')}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 text-purple-700 dark:text-purple-400">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                    Temas Centrais & Ensinamentos
                  </span>
                </div>
                {openSections.themes ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              {openSections.themes && (
                <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                    {currentBook.keyThemes.map((theme, idx) => (
                      <li key={idx} className="flex items-center space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span>{theme}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 4. RODAPÉ EM TELA CHEIA */}
      <footer className="px-4 sm:px-8 py-3 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-50 dark:bg-zinc-900/90 sepia:bg-[#f4e4c1] flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 shrink-0">
        <span>{currentBook.name} • {currentBook.testament} • {currentBook.category}</span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </footer>

    </div>
  );
}
