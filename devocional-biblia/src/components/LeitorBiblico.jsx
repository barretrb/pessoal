import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Link2, 
  MessageSquare, 
  Star, 
  GitCommit, 
  Type, 
  Music,
  Share2,
  Copy,
  Check,
  Info,
  BookMarked
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
  onOpenCommentary,
  chapterProgress = {},
  onToggleChapter,
  onOpenStudyInfo,
  isFreeReading = false,
  freeReadingChapter = null
}) {
  if (!dayData && !isFreeReading) return null;

  // Lista de capítulos deste dia (ex: ['Lucas 10', 'Lucas 11', 'Lucas 12'])
  const readings = dayData?.readings || (freeReadingChapter ? [`Lucas ${freeReadingChapter}`] : ['Lucas 1']);
  
  // Parse capitulo selecionado
  const initialChapter = freeReadingChapter 
    ? String(freeReadingChapter) 
    : (readings[0] ? readings[0].replace('Lucas ', '').trim() : '1');

  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [fontSize, setFontSize] = useState(19); // 16 a 24 px

  // MULTI-SELEÇÃO DE VERSÍCULOS
  // Formato: { [verseKey]: { number, text, crossReferences, isJesusWords, book, chapter, key } }
  const [selectedVerses, setSelectedVerses] = useState({});

  // Mídia do dia
  const dayMedia = dayData ? getMediaForDay(dayData.id) : null;

  // Carregar dados de Lucas do capítulo
  const chapterData = lucasData[selectedChapter] || {
    book: 'Lucas',
    chapter: selectedChapter,
    sections: []
  };

  // Highlights e Favoritos locais
  const [highlights, setHighlights] = useState(storage.getHighlights());
  const [favorites, setFavorites] = useState(storage.getFavorites());

  // Atualizar quando trocar de dia ou capítulo livre
  useEffect(() => {
    if (freeReadingChapter) {
      setSelectedChapter(String(freeReadingChapter));
    } else if (readings.length > 0) {
      const firstCh = readings[0].replace('Lucas ', '').trim();
      setSelectedChapter(firstCh);
    }
    setSelectedVerses({});
  }, [dayData?.id, freeReadingChapter]);

  // Limpar seleção ao trocar de capítulo
  useEffect(() => {
    setSelectedVerses({});
  }, [selectedChapter]);

  const currentChapterName = `Lucas ${selectedChapter}`;
  const isCurrentChapterCompleted = !!chapterProgress[currentChapterName]?.completed;

  // Multi-seleção de versículos
  const handleVerseClick = (v) => {
    const verseKey = `Lucas ${selectedChapter}:${v.number}`;
    setSelectedVerses(prev => {
      const next = { ...prev };
      if (next[verseKey]) {
        delete next[verseKey];
      } else {
        next[verseKey] = {
          number: v.number,
          text: v.text,
          crossReferences: v.crossReferences,
          isJesusWords: v.isJesusWords,
          book: 'Lucas',
          chapter: selectedChapter,
          key: verseKey
        };
      }
      return next;
    });
  };

  const selectedKeys = Object.keys(selectedVerses);
  const selectedCount = selectedKeys.length;

  // Ordenar números dos versículos selecionados
  const selectedNumbers = Object.values(selectedVerses)
    .map(v => v.number)
    .sort((a, b) => a - b);

  // Formatar citação (ex: "Lucas 10:4" ou "Lucas 10:2–5" ou "Lucas 10:2, 4, 6")
  const formatCitation = () => {
    if (selectedNumbers.length === 0) return '';
    if (selectedNumbers.length === 1) return `Lucas ${selectedChapter}:${selectedNumbers[0]}`;
    
    // Verificar se são consecutivos
    const isConsecutive = selectedNumbers.every((num, idx) => 
      idx === 0 || num === selectedNumbers[idx - 1] + 1
    );

    if (isConsecutive) {
      return `Lucas ${selectedChapter}:${selectedNumbers[0]}–${selectedNumbers[selectedNumbers.length - 1]}`;
    }
    return `Lucas ${selectedChapter}:${selectedNumbers.join(', ')}`;
  };

  // Texto combinado dos versículos selecionados
  const getCombinedText = () => {
    return selectedNumbers.map(n => {
      const item = Object.values(selectedVerses).find(v => v.number === n);
      return item ? `${n} ${item.text}` : '';
    }).join(' ');
  };

  // Aplicar destaque em múltiplos versículos
  const handleApplyHighlight = (colorKey) => {
    if (selectedKeys.length === 0) return;
    const updated = storage.saveMultipleHighlights(selectedKeys, colorKey);
    setHighlights({ ...updated });
    setSelectedVerses({});
  };

  // Favoritar / Desfavoritar múltiplos versículos
  const handleToggleFav = () => {
    if (selectedKeys.length === 0) return;
    const items = Object.values(selectedVerses);
    const updated = storage.toggleMultipleFavorites(items);
    setFavorites([...updated]);
  };

  const areAllSelectedFavorites = selectedKeys.length > 0 && selectedKeys.every(k => 
    favorites.some(f => f.key === k)
  );

  const [copied, setCopied] = useState(false);

  const handleCopyVerses = () => {
    try {
      const citation = formatCitation();
      const combined = getCombinedText();
      navigator.clipboard.writeText(`"${combined}" (${citation} NVT)`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleShareVerses = () => {
    const citation = formatCitation();
    const combined = getCombinedText();
    const shareText = `"${combined}" (${citation} NVT)`;
    if (navigator.share) {
      navigator.share({
        title: citation,
        text: shareText
      }).catch(() => {});
    } else {
      handleCopyVerses();
    }
  };

  // Calcular índice do próximo capítulo do dia
  const currentChapterIdx = readings.findIndex(r => r.replace('Lucas ', '').trim() === selectedChapter);
  const nextChapterInDay = currentChapterIdx >= 0 && currentChapterIdx < readings.length - 1 
    ? readings[currentChapterIdx + 1] 
    : null;

  const completedChaptersCount = readings.filter(r => !!chapterProgress[r]?.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* 1. BARRA SUPERIOR DE CONTROLE E NAVEGAÇÃO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFreeReading ? 'Voltar à Navegação' : 'Voltar ao Panorama'}</span>
        </button>

        <div className="flex items-center flex-wrap gap-2">
          {/* Botão de Estudo do Livro de Lucas (Bíblia de Estudos) */}
          <button
            onClick={() => onOpenStudyInfo && onOpenStudyInfo('Lucas')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 text-xs font-bold text-amber-700 dark:text-amber-300 transition-colors"
            title="Abrir Bíblia de Estudos: Informações do Livro de Lucas"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Estudo de Lucas</span>
          </button>

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
            onClick={() => onOpenBibleArc(`Lucas ${selectedChapter}`, '')}
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
              {isFreeReading ? 'Leitura Livre da Bíblia' : `Dia ${dayData?.id} • ${dayData?.dayOfWeek}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {readings.join(', ')}
            </h1>
          </div>

          {/* Botão de Concluir Capítulo Atual */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleChapter && onToggleChapter(currentChapterName, !isCurrentChapterCompleted)}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                isCurrentChapterCompleted
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 border border-zinc-200 dark:border-zinc-700'
              }`}
              title={isCurrentChapterCompleted ? "Capítulo Concluído! Clique para desmarcar" : `Marcar ${currentChapterName} como concluído`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCurrentChapterCompleted ? `${currentChapterName} Lido ✓` : `Concluir ${currentChapterName}`}</span>
            </button>
          </div>
        </div>

        {/* Abas para alternar entre os capítulos do dia com status individual de conclusão */}
        {readings.length > 1 && (
          <div className="flex items-center space-x-2 border-b border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] pb-3 overflow-x-auto">
            {readings.map((reading) => {
              const chNumber = reading.replace('Lucas ', '').trim();
              const isSelected = selectedChapter === chNumber;
              const isDone = !!chapterProgress[reading]?.completed;

              return (
                <button
                  key={reading}
                  onClick={() => setSelectedChapter(chNumber)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{reading}</span>
                  {isDone && <span className="text-[10px] bg-white/20 px-1 rounded-full">✓</span>}
                </button>
              );
            })}
            
            <span className="text-[11px] font-semibold text-zinc-400 ml-auto whitespace-nowrap pl-2">
              {completedChaptersCount}/{readings.length} cap.
            </span>
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

      {/* 3. TEXTO BÍBLICO NVT COM PALAVRAS DE JESUS E SUPORTE A MULTI-SELEÇÃO */}
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
                const isSelected = !!selectedVerses[verseKey];
                const highlightClass = highlight && HIGHLIGHT_COLORS[highlight.color] ? HIGHLIGHT_COLORS[highlight.color].bg : '';

                return (
                  <span
                    key={v.number}
                    className={`inline relative group transition-colors rounded-sm px-0.5 py-0.5 cursor-pointer ${
                      highlightClass ? highlightClass : 'hover:bg-amber-50/60 dark:hover:bg-zinc-800/60'
                    } ${isSelected ? 'ring-2 ring-amber-400 bg-amber-100/60 dark:bg-amber-900/30' : ''}`}
                    onClick={() => handleVerseClick(v)}
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

      {/* 4. CARD DE CONCLUSÃO DO CAPÍTULO ATUAL AO FINAL DA LEITURA */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-100/80 dark:bg-zinc-850/80 sepia:bg-[#f4e4c1]/60 border border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className={`w-5 h-5 ${isCurrentChapterCompleted ? 'text-emerald-500' : 'text-zinc-400'}`} />
            <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {isCurrentChapterCompleted ? `${currentChapterName} Concluído!` : `Concluir Leitura de ${currentChapterName}`}
            </h4>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {completedChaptersCount} de {readings.length} capítulos do dia lidos.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onToggleChapter && onToggleChapter(currentChapterName, !isCurrentChapterCompleted)}
            className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              isCurrentChapterCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isCurrentChapterCompleted ? 'Capítulo Concluído ✓' : `Marcar ${currentChapterName} como Lido`}</span>
          </button>

          {/* Próximo capítulo do dia se houver */}
          {nextChapterInDay && (
            <button
              onClick={() => {
                setSelectedChapter(nextChapterInDay.replace('Lucas ', '').trim());
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors"
            >
              <span>{nextChapterInDay}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. TOOLBAR FLUTUANTE DE AÇÕES DE MÚLTIPLOS VERSÍCULOS SELECIONADOS */}
      {selectedCount > 0 && (() => {
        const citation = formatCitation();
        const singleVerseData = selectedCount === 1 ? Object.values(selectedVerses)[0] : null;
        const hasRefs = singleVerseData && singleVerseData.crossReferences && singleVerseData.crossReferences.length > 0;

        return (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.25rem)] max-w-lg bg-zinc-900/95 dark:bg-zinc-900/95 text-white rounded-2xl shadow-2xl p-3 border border-zinc-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
            
            {/* Linha Superior: Cabeçalho com Versículos e Ações */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="text-xs font-bold text-amber-400 truncate">
                  {citation}
                </span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded-full font-medium">
                  {selectedCount} {selectedCount === 1 ? 'versículo' : 'versículos'}
                </span>
                {areAllSelectedFavorites && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full font-medium">
                    Favorito
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {/* Botão Favoritar / Desfavoritar Múltiplos */}
                <button
                  onClick={handleToggleFav}
                  className={`p-1.5 rounded-lg transition-colors ${
                    areAllSelectedFavorites 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                  }`}
                  title={areAllSelectedFavorites ? "Remover dos Favoritos" : "Favoritar versículos selecionados"}
                >
                  <Star className="w-4 h-4" fill={areAllSelectedFavorites ? "currentColor" : "none"} />
                </button>

                {/* Botão Copiar */}
                <button
                  onClick={handleCopyVerses}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Copiar versículos selecionados"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Botão Compartilhar */}
                <button
                  onClick={handleShareVerses}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Compartilhar versículos"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Botão BibleArc */}
                <button
                  onClick={() => {
                    onOpenBibleArc(citation, getCombinedText());
                    setSelectedVerses({});
                  }}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold ml-0.5"
                  title="Arquear estes versículos com a técnica de John Piper"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span className="text-[11px]">BibleArc</span>
                </button>

                {/* Fechar / Desmarcar */}
                <button
                  onClick={() => setSelectedVerses({})}
                  className="p-1 text-zinc-400 hover:text-white ml-1 text-xs font-bold"
                  title="Desmarcar todos"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Linha Inferior: Marca-Texto e Referências Cruzadas */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Destaque:
                </span>
                <div className="flex items-center space-x-1.5">
                  {Object.entries(HIGHLIGHT_COLORS).map(([cKey, cData]) => (
                    <button
                      key={cKey}
                      onClick={() => handleApplyHighlight(cKey)}
                      className="w-5 h-5 rounded-full hover:scale-125 transition-transform border border-white/20"
                      style={{ backgroundColor: cData.hex }}
                      title={`Destacar selecionados: ${cData.name}`}
                    />
                  ))}
                  <button
                    onClick={() => handleApplyHighlight(null)}
                    className="text-[11px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-800"
                    title="Remover cor dos selecionados"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Botão de Referências Cruzadas se 1 versículo estiver selecionado */}
              {hasRefs && (
                <button
                  onClick={() => {
                    onOpenReferences(singleVerseData.key, singleVerseData.crossReferences);
                    setSelectedVerses({});
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium text-amber-400 hover:underline px-1 py-0.5"
                  title="Ver referências cruzadas deste versículo"
                >
                  <Link2 className="w-3 h-3" />
                  <span>{singleVerseData.crossReferences.length} ref</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* 6. NAVEGAÇÃO ENTRE DIAS NO RODAPÉ */}
      {!isFreeReading && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7]">
          <button
            onClick={onPrevDay}
            disabled={dayData?.id <= 1}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dia Anterior</span>
          </button>

          <button
            onClick={onNextDay}
            disabled={dayData?.id >= 365}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          >
            <span>Próximo Dia</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
