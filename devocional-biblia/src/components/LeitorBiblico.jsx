import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Link2, 
  MessageSquare, 
  Star, 
  Highlighter, 
  GitCommit, 
  Sparkles, 
  Type, 
  Music,
  Share2,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HIGHLIGHT_COLORS, storage } from '../services/storage';
import { getMediaForDay } from '../data/dailyMedia';

export default function LeitorBiblico({
  dayData,
  lucasData,
  onBack,
  onToggleComplete,
  onNextDay,
  onPrevDay,
  redLetterEnabled,
  onOpenBibleArc,
  onOpenReferences,
  onOpenCommentary
}) {
  if (!dayData) return null;

  // Lista de capítulos deste dia (ex: ['Lucas 10', 'Lucas 11', 'Lucas 12'])
  const readings = dayData.readings || [];
  // Parse capitulo selecionado
  const initialChapter = readings[0] ? readings[0].replace('Lucas ', '') : '10';
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [fontSize, setFontSize] = useState(19); // 16 a 24 px
  const [selectedVerseKey, setSelectedVerseKey] = useState(null);
  const [selectedVerseData, setSelectedVerseData] = useState(null);

  // Mídia do dia
  const dayMedia = getMediaForDay(dayData.id);

  // Carregar dados de Lucas do capítulo
  const chapterData = lucasData[selectedChapter] || {
    book: 'Lucas',
    chapter: selectedChapter,
    sections: []
  };

  // Highlights e Favoritos locais
  const [highlights, setHighlights] = useState(storage.getHighlights());
  const [favorites, setFavorites] = useState(storage.getFavorites());

  // Atualizar quando trocar de dia
  useEffect(() => {
    if (readings.length > 0) {
      const firstCh = readings[0].replace('Lucas ', '').trim();
      setSelectedChapter(firstCh);
    }
  }, [dayData.id]);

  const handleApplyHighlight = (colorKey) => {
    if (!selectedVerseKey) return;
    const updated = storage.saveHighlight(selectedVerseKey, colorKey);
    setHighlights({ ...updated });
    setSelectedVerseKey(null);
  };

  const handleToggleFav = (vKey, vText) => {
    const updated = storage.toggleFavorite(vKey, { text: vText, book: 'Lucas', chapter: selectedChapter });
    setFavorites([...updated]);
  };

  const handleCompleteReading = () => {
    onToggleComplete(dayData.id, true);
    // Soltar confetes
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. BARRA SUPERIOR DE CONTROLE E NAVEGAÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Panorama</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Botão de Comentários do Capítulo */}
          <button
            onClick={() => onOpenCommentary(chapterData)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
            title="Abrir Comentários & Diário Espiritual"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>Comentários</span>
          </button>

          {/* Botão de Arqueamento (BibleArc) */}
          <button
            onClick={() => onOpenBibleArc(`Lucas ${selectedChapter}`)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors"
            title="Fazer Arqueamento do Texto (John Piper)"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>BibleArc</span>
          </button>

          {/* Controle de Fonte */}
          <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5">
            <button
              onClick={() => setFontSize(Math.max(16, fontSize - 1))}
              className="px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
              title="Diminuir Fonte"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 1))}
              className="px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
              title="Aumentar Fonte"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* 2. CABEÇALHO DO DIA & SELETOR DE CAPÍTULOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Dia {dayData.id} • {dayData.dayOfWeek}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {readings.join(', ')}
            </h1>
          </div>

          {/* Botão Concluir Leitura */}
          <button
            onClick={handleCompleteReading}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
              dayData.completed
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 hover:scale-105 active:scale-95'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{dayData.completed ? 'Leitura Concluída!' : 'Marcar Dia como Concluído'}</span>
          </button>
        </div>

        {/* Abas para alternar entre os capítulos do dia (ex: Lc 10, Lc 11, Lc 12) */}
        {readings.length > 1 && (
          <div className="flex items-center space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            {readings.map((reading) => {
              const chNumber = reading.replace('Lucas ', '').trim();
              const isSelected = selectedChapter === chNumber;
              return (
                <button
                  key={reading}
                  onClick={() => setSelectedChapter(chNumber)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {reading}
                </button>
              );
            })}
          </div>
        )}

        {/* Mini barra de louvor do dia */}
        {dayMedia && dayMedia.music && (
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200">
              <Music className="w-4 h-4 text-amber-600" />
              <span>
                <strong>Louvor para esta leitura:</strong> {dayMedia.music.title} ({dayMedia.music.artist})
              </span>
            </div>
            <a
              href={dayMedia.music.youtubeMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 dark:text-amber-400 font-semibold hover:underline"
            >
              Ouvir no YouTube Music ➔
            </a>
          </div>
        )}
      </div>

      {/* 3. TEXTO BÍBLICO NVT COM PALAVRAS DE JESUS E REFERÊNCIAS */}
      <article 
        className="font-scripture bg-white dark:bg-zinc-900 sepia:bg-[#fbf0d9] rounded-3xl p-6 sm:p-10 shadow-xs border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] space-y-8"
        style={{ fontSize: `${fontSize}px` }}
      >
        {chapterData.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            
            {/* Título de Seção da NVT */}
            {section.title && (
              <h3 className="font-sans font-bold text-lg sm:text-xl text-teal-700 dark:text-teal-400 sepia:text-[#008674] pt-4 border-t border-zinc-100 dark:border-zinc-800 first:border-0 first:pt-0">
                {section.title}
              </h3>
            )}

            {/* Versículos */}
            <div className="space-y-2 leading-relaxed">
              {section.verses.map((v) => {
                const verseKey = `Lucas ${selectedChapter}:${v.number}`;
                const highlight = highlights[verseKey];
                const isFavorite = favorites.some(f => f.key === verseKey);
                const hasCrossRefs = v.crossReferences && v.crossReferences.length > 0;
                const isSelected = selectedVerseKey === verseKey;
                const highlightClass = highlight && HIGHLIGHT_COLORS[highlight.color] ? HIGHLIGHT_COLORS[highlight.color].bg : '';

                return (
                  <span
                    key={v.number}
                    className={`inline relative group transition-colors rounded-sm px-0.5 py-0.5 cursor-pointer ${
                      highlightClass ? highlightClass : 'hover:bg-amber-50/60 dark:hover:bg-zinc-800/60'
                    } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
                    onClick={() => {
                      setSelectedVerseKey(isSelected ? null : verseKey);
                      setSelectedVerseData(v);
                    }}
                  >
                    {/* Número do versículo */}
                    <sup className="font-sans font-bold text-[11px] text-amber-700 dark:text-amber-500 sepia:text-[#78350f] select-none mr-1 inline-block">
                      {v.number}
                    </sup>

                    {/* Texto com Destaque de Palavras de Jesus (Red Letter) */}
                    <span className={redLetterEnabled && v.isJesusWords ? 'red-letter' : ''}>
                      {v.text}{' '}
                    </span>

                    {/* Ícone sutil de Referência Cruzada Clicável */}
                    {hasCrossRefs && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReferences(verseKey, v.crossReferences);
                        }}
                        className="inline-flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-800 ml-1 p-0.5 align-middle select-none"
                        title="Ver referências cruzadas"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Indicador de Favorito */}
                    {isFavorite && (
                      <Star className="inline w-3 h-3 text-amber-400 fill-current ml-0.5 align-middle" />
                    )}
                  </span>
                );
              })}
            </div>

          </div>
        ))}
      </article>

      {/* 4. TOOLBAR FLUTUANTE DE AÇÕES DO VERSÍCULO SELECIONADO */}
      {selectedVerseKey && selectedVerseData && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center space-x-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-bold text-amber-400">
            {selectedVerseKey}
          </span>

          <div className="h-4 w-px bg-zinc-700" />

          {/* Paleta de Cores de Destaque */}
          <div className="flex items-center space-x-1.5">
            {Object.entries(HIGHLIGHT_COLORS).map(([cKey, cData]) => (
              <button
                key={cKey}
                onClick={() => handleApplyHighlight(cKey)}
                className="w-5 h-5 rounded-full hover:scale-125 transition-transform border border-white/20"
                style={{ backgroundColor: cData.hex }}
                title={cData.name}
              />
            ))}
            <button
              onClick={() => handleApplyHighlight(null)}
              className="text-[10px] text-zinc-400 hover:text-white px-1"
              title="Remover cor"
            >
              Limpar
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-700" />

          {/* Botão Favoritar */}
          <button
            onClick={() => handleToggleFav(selectedVerseKey, selectedVerseData.text)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
            title="Favoritar Versículo"
          >
            <Star className="w-4 h-4" />
          </button>

          {/* Botão BibleArc do Versículo */}
          <button
            onClick={() => {
              onOpenBibleArc(selectedVerseKey, selectedVerseData.text);
              setSelectedVerseKey(null);
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            title="Arquear este versículo com a técnica de John Piper"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>BibleArc</span>
          </button>

          <button
            onClick={() => setSelectedVerseKey(null)}
            className="text-xs text-zinc-400 hover:text-white pl-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 5. NAVEGAÇÃO ENTRE DIAS NO RODAPÉ */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onPrevDay}
          disabled={dayData.id <= 1}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dia Anterior</span>
        </button>

        <button
          onClick={onNextDay}
          disabled={dayData.id >= 365}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
        >
          <span>Próximo Dia</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
