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
  BookMarked
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
  
  // Controle de acordeão mobile (cada seção expandida/recolhida)
  const [openSections, setOpenSections] = useState({
    author: true,
    historical: true,
    purpose: true,
    themes: false
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

  const filteredBooks = BIBLE_BOOKS_STUDY_INFO.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.testament.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 sepia:bg-[#fbf0d9] rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-50/80 dark:bg-zinc-850/80 sepia:bg-[#f4e4c1]/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Bíblia de Estudos • Panorama
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Informações teológicas e históricas dos 66 livros
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BARRA DE SELEÇÃO RÁPIDA DE LIVRO */}
        <div className="p-3 bg-zinc-100/70 dark:bg-zinc-800/50 sepia:bg-[#eee0be]/60 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Seletor dropdown */}
            <select
              value={currentBook.id}
              onChange={(e) => {
                const book = BIBLE_BOOKS_STUDY_INFO.find(b => b.id === e.target.value);
                if (book) setSelectedBook(book);
              }}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <optgroup label="Antigo Testamento (39 livros)">
                {BIBLE_BOOKS_STUDY_INFO.filter(b => b.testament === 'Antigo Testamento').map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.category})</option>
                ))}
              </optgroup>
              <optgroup label="Novo Testamento (27 livros)">
                {BIBLE_BOOKS_STUDY_INFO.filter(b => b.testament === 'Novo Testamento').map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.category})</option>
                ))}
              </optgroup>
            </select>

            {onSelectChapterToRead && (
              <button
                onClick={() => {
                  onSelectChapterToRead(currentBook.name, 1);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
              >
                Ler {currentBook.name} ➔
              </button>
            )}
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL ROLÁVEL COM ACORDEÕES EXPANSÍVEIS/RECOLHÍVEIS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Card Resumo do Livro */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200 dark:border-amber-900/40">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {currentBook.testament} • {currentBook.category}
                </span>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  {currentBook.name}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Contém {currentBook.chapters} capítulos
                </p>
              </div>
            </div>
            
            {/* Versículo-Chave */}
            {currentBook.keyVerse && (
              <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Versículo-Chave:
                </span>
                <blockquote className="mt-1 text-xs italic font-medium text-zinc-700 dark:text-zinc-300 border-l-2 border-amber-500 pl-2">
                  "{currentBook.keyVerse}"
                </blockquote>
              </div>
            )}
          </div>

          {/* 1. ACORDEÃO: QUEM ESCREVEU E PARA QUEM (AUTOR E DESTINATÁRIOS) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-850 sepia:bg-[#fbf0d9]/60">
            <button
              onClick={() => toggleSection('author')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <User className="w-4 h-4" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Quem Escreveu e Para Quem
                </span>
              </div>
              {openSections.author ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {openSections.author && (
              <div className="p-4 pt-0 space-y-3 text-xs leading-relaxed border-t border-zinc-100 dark:border-zinc-800 sepia:border-[#e6d3a7]">
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                    Autor:
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {currentBook.author}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                    Destinatários:
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {currentBook.audience}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. ACORDEÃO: PERÍODO HISTÓRICO E CONTEMPORÂNEOS */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-850 sepia:bg-[#fbf0d9]/60">
            <button
              onClick={() => toggleSection('historical')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Período Histórico e Contemporâneos
                </span>
              </div>
              {openSections.historical ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {openSections.historical && (
              <div className="p-4 pt-0 space-y-3 text-xs leading-relaxed border-t border-zinc-100 dark:border-zinc-800 sepia:border-[#e6d3a7]">
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                    Datação / Época:
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {currentBook.period}
                  </p>
                </div>
                {currentBook.contemporaries && (
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                      Contemporâneos Relevantes:
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {currentBook.contemporaries}
                    </p>
                  </div>
                )}
                {currentBook.context && (
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">
                      Contexto Histórico & Geopolítico:
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {currentBook.context}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. ACORDEÃO: OBJETIVO DO LIVRO */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-850 sepia:bg-[#fbf0d9]/60">
            <button
              onClick={() => toggleSection('purpose')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <Target className="w-4 h-4" />
                <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                  Objetivo e Propósito Teológico do Livro
                </span>
              </div>
              {openSections.purpose ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {openSections.purpose && (
              <div className="p-4 pt-0 space-y-2 text-xs leading-relaxed border-t border-zinc-100 dark:border-zinc-800 sepia:border-[#e6d3a7]">
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {currentBook.purpose}
                </p>
              </div>
            )}
          </div>

          {/* 4. ACORDEÃO: TEMAS PRINCIPAIS */}
          {currentBook.keyThemes && currentBook.keyThemes.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] overflow-hidden bg-white dark:bg-zinc-850 sepia:bg-[#fbf0d9]/60">
              <button
                onClick={() => toggleSection('themes')}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-zinc-900 dark:text-zinc-100 sepia:text-[#433422]">
                    Temas Centrais & Ensinamentos
                  </span>
                </div>
                {openSections.themes ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>

              {openSections.themes && (
                <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 sepia:border-[#e6d3a7]">
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
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
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] bg-zinc-50 dark:bg-zinc-900 sepia:bg-[#f4e4c1]/50 flex items-center justify-between text-xs text-zinc-500">
          <span>{currentBook.name} • {currentBook.testament}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
