import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Link2, 
  MessageSquare, 
  Star, 
  GitCommit, 
  Type, 
  Music,
  Share2,
  Copy,
  Check,
  BookMarked,
  Loader2,
  Headphones,
  RefreshCw,
  ExternalLink,
  MapPin,
  Sun,
  Moon,
  Coffee,
  Play,
  X
} from 'lucide-react';
import { HIGHLIGHT_COLORS, storage } from '../services/storage';
import { cloudDbService } from '../services/cloudDbService';
import { getMusicForChapter } from '../data/dailyMedia';
import { speechService } from '../services/speechService';
import { crossReferenceService } from '../services/crossReferenceService';
import { fetchBookData, normalizeBookId } from '../services/bibleService';
import { telemetryService } from '../services/telemetryService';
import AudioPlayerBar from './AudioPlayerBar';
import { findBiblicalPlacesInText } from '../data/biblicalPlaces';

function parseReading(str) {
  if (!str) return { book: 'Lucas', chapter: '1' };
  const parts = str.trim().split(/\s+/);
  const chapter = parts.pop();
  const book = parts.join(' ');
  return { book: book || 'Lucas', chapter: chapter || '1' };
}

export default function LeitorBiblico({
  dayData,
  bookData,
  currentBookName = '1 Coríntios',
  currentChapter = '14',
  onBack,
  redLetterEnabled,
  setRedLetterEnabled,
  theme = 'light',
  setTheme,
  onOpenBibleArc,
  onOpenReferences,
  onOpenCommentary,
  chapterProgress = {},
  onToggleChapter,
  onOpenStudyInfo,
  isFreeReading = false,
  isLoading = false,
  onChangeFreeChapter,
  onOpenMaps
}) {
  const readings = dayData?.readings || [`${currentBookName} ${currentChapter}`];
  const firstParsed = parseReading(readings[0]);
  const initialChapter = isFreeReading ? String(currentChapter) : firstParsed.chapter;
  const initialBook = isFreeReading ? currentBookName : firstParsed.book;

  const savedSettings = storage.getSettings();
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [fontSize, setFontSize] = useState(savedSettings.fontSize || 18);
  const [fontFamily, setFontFamily] = useState(savedSettings.fontFamily || 'sans'); // 'sans' (Inter) | 'serif' (Literata)
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);

  const [selectedVerses, setSelectedVerses] = useState({});

  const persistReaderPrefs = (nextSize, nextFamily) => {
    const current = storage.getSettings();
    storage.saveSettings({
      ...current,
      fontSize: nextSize,
      fontFamily: nextFamily
    });
  };

  useEffect(() => {
    if (isFreeReading) {
      setSelectedChapter(String(currentChapter));
      setSelectedBook(currentBookName);
    } else if (readings.length > 0) {
      const p = parseReading(readings[0]);
      setSelectedChapter(p.chapter);
      setSelectedBook(p.book);
    }
    setSelectedVerses({});
  }, [dayData?.id, currentBookName, currentChapter, isFreeReading]);

  useEffect(() => {
    setSelectedVerses({});
  }, [selectedChapter, selectedBook]);

  const activeBook = isFreeReading ? currentBookName : selectedBook;
  const [internalBookData, setInternalBookData] = useState(bookData);
  const [isFetchingBook, setIsFetchingBook] = useState(false);

  const activeChapterStr = `${activeBook} ${selectedChapter}`;
  const activeChapterIndex = dayData?.readings ? dayData.readings.indexOf(activeChapterStr) : 0;
  const [chapterMusicOverride, setChapterMusicOverride] = useState(null);
  const [playingReaderAudio, setPlayingReaderAudio] = useState(null); // 'song' | 'inst' | null

  useEffect(() => {
    setChapterMusicOverride(null);
    setPlayingReaderAudio(null);
  }, [activeBook, selectedChapter]);

  const activeChapterMusic = getMusicForChapter(
    dayData?.id,
    activeChapterStr,
    activeChapterIndex >= 0 ? activeChapterIndex : 0,
    chapterMusicOverride
  );

  useEffect(() => {
    if (bookData) {
      setInternalBookData(bookData);
    }
  }, [bookData]);

  useEffect(() => {
    if (!activeBook) return;
    const sampleChapter = internalBookData ? Object.values(internalBookData)[0] : null;
    const currentDataBook = sampleChapter?.book || '';
    if (currentDataBook && normalizeBookId(currentDataBook) === normalizeBookId(activeBook)) {
      return;
    }

    let isMounted = true;
    setIsFetchingBook(true);
    fetchBookData(activeBook)
      .then(data => {
        if (isMounted && data) {
          setInternalBookData(data);
        }
      })
      .catch(err => console.error("Erro ao carregar livro no leitor:", err))
      .finally(() => {
        if (isMounted) setIsFetchingBook(false);
      });

    return () => { isMounted = false; };
  }, [activeBook]);

  const activeChapterData = internalBookData?.[String(selectedChapter)] || internalBookData?.[selectedChapter] || {
    book: activeBook,
    chapter: selectedChapter,
    sections: []
  };

  const mentionedPlaces = useMemo(() => {
    if (!activeChapterData?.sections) return [];
    const fullText = activeChapterData.sections
      .flatMap(s => (s.verses || []).map(v => v.text || ''))
      .join(' ');
    return findBiblicalPlacesInText(fullText);
  }, [activeChapterData]);

  const sampleChapter = internalBookData ? Object.values(internalBookData)[0] : null;
  const isDataLoading = isLoading || isFetchingBook || Boolean(activeBook && sampleChapter?.book && normalizeBookId(sampleChapter.book) !== normalizeBookId(activeBook));

  const [highlights, setHighlights] = useState(storage.getHighlights());
  const [favorites, setFavorites] = useState(storage.getFavorites());

  const [audioStatus, setAudioStatus] = useState({ status: 'stopped', isPlaying: false, rate: 1.0 });
  const [speakingVerseNumber, setSpeakingVerseNumber] = useState(null);

  useEffect(() => {
    return () => {
      speechService.stop();
      setSpeakingVerseNumber(null);
      setAudioStatus({ status: 'stopped', isPlaying: false, rate: 1.0 });
    };
  }, [selectedChapter, activeBook]);

  const allChapterVerses = useMemo(() => {
    const list = [];
    if (activeChapterData?.sections) {
      activeChapterData.sections.forEach(sec => {
        if (sec.verses) {
          sec.verses.forEach(v => list.push(v));
        }
      });
    }
    return list;
  }, [activeChapterData]);

  const handleToggleAudio = () => {
    if (audioStatus.isPlaying) {
      speechService.pause();
    } else if (audioStatus.status === 'paused') {
      speechService.resume();
    } else {
      if (allChapterVerses.length === 0) return;
      speechService.startReading(
        allChapterVerses,
        0,
        (verseNum) => setSpeakingVerseNumber(verseNum),
        (status) => setAudioStatus(status)
      );
    }
  };

  const currentChapterName = `${activeBook} ${selectedChapter}`;
  const isCurrentChapterCompleted = !!chapterProgress[currentChapterName]?.completed;

  const handleVerseClick = (v) => {
    const verseKey = `${activeBook} ${selectedChapter}:${v.number}`;
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
          book: activeBook,
          chapter: selectedChapter,
          key: verseKey
        };
      }
      return next;
    });
  };

  const selectedKeys = Object.keys(selectedVerses);
  const selectedCount = selectedKeys.length;

  const selectedNumbers = Object.values(selectedVerses)
    .map(v => v.number)
    .sort((a, b) => a - b);

  const formatCitation = () => {
    if (selectedNumbers.length === 0) return '';
    if (selectedNumbers.length === 1) return `${activeBook} ${selectedChapter}:${selectedNumbers[0]}`;
    const isConsecutive = selectedNumbers.every((num, idx) => 
      idx === 0 || num === selectedNumbers[idx - 1] + 1
    );
    if (isConsecutive) {
      return `${activeBook} ${selectedChapter}:${selectedNumbers[0]}–${selectedNumbers[selectedNumbers.length - 1]}`;
    }
    return `${activeBook} ${selectedChapter}:${selectedNumbers.join(', ')}`;
  };

  const getCombinedText = () => {
    return selectedNumbers.map(n => {
      const item = Object.values(selectedVerses).find(v => v.number === n);
      return item ? `${n} ${item.text}` : '';
    }).join(' ');
  };

  const handleApplyHighlight = (colorKey) => {
    if (selectedKeys.length === 0) return;
    if (colorKey) {
      telemetryService.track('highlights_add', {
        color: colorKey,
        verses: selectedKeys.join(', '),
        incrementBy: selectedKeys.length
      });
    }
    const updated = storage.saveMultipleHighlights(selectedKeys, colorKey, storage.getActiveProfileId(), selectedVerses);
    setHighlights({ ...updated });
    setSelectedVerses({});
    cloudDbService.triggerAutoSync();
  };

  const areAllSelectedFavorites = selectedKeys.length > 0 && selectedKeys.every(k => 
    favorites.some(f => f.key === k)
  );

  const handleToggleFav = () => {
    if (selectedKeys.length === 0) return;
    const items = Object.values(selectedVerses);
    if (!areAllSelectedFavorites) {
      telemetryService.track('favorites_add', {
        verses: selectedKeys.join(', '),
        incrementBy: items.length
      });
    }
    const updated = storage.toggleMultipleFavorites(items);
    setFavorites([...updated]);
    cloudDbService.triggerAutoSync();
  };

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
      navigator.share({ title: citation, text: shareText }).catch(() => {});
    } else {
      handleCopyVerses();
    }
  };

  const currentChapterIdx = readings.findIndex(r => {
    const p = parseReading(r);
    return normalizeBookId(p.book) === normalizeBookId(activeBook) && String(p.chapter) === String(selectedChapter);
  });
  const nextReadingInDay = currentChapterIdx >= 0 && currentChapterIdx < readings.length - 1 
    ? readings[currentChapterIdx + 1] 
    : null;

  const completedChaptersCount = readings.filter(r => !!chapterProgress[r]?.completed).length;

  if (!dayData && !isFreeReading) {
    return null;
  }

  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* 1. BARRA DE LEITURA STICKY ESTILO YOUVERSION / APPLE BOOKS */}
      <div className="sticky top-14 lg:top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 bg-[#F9FAFB]/95 dark:bg-[#09090B]/95 sepia:bg-[#F5EFE6]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sepia:border-[#E6DBC8]">
        <div className="flex items-center justify-between gap-2">
          {/* Esquerda: Voltar + Seletor de Capítulos */}
          <div className="flex items-center space-x-2 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
              title="Voltar ao Início"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {!isFreeReading && readings.length > 1 ? (
              <div className="flex items-center space-x-1 bg-zinc-200/60 dark:bg-zinc-800/90 sepia:bg-[#E9DFCE] p-1 rounded-xl overflow-x-auto">
                {readings.map((reading) => {
                  const p = parseReading(reading);
                  const isSelected = selectedChapter === p.chapter && selectedBook === p.book;
                  const isDone = !!chapterProgress[reading]?.completed;
                  return (
                    <button
                      key={reading}
                      onClick={() => {
                        setSelectedChapter(p.chapter);
                        setSelectedBook(p.book);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white font-semibold shadow-2xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span>{reading}</span>
                      {isDone && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50 truncate">
                {activeBook} {selectedChapter}
              </span>
            )}
          </div>

          {/* Direita: Ouvir, Aparência (Aa), Comentário, BibleArc */}
          <div className="flex items-center space-x-1 shrink-0 relative">
            {/* Ouvir Capítulo */}
            <button
              onClick={() => {
                telemetryService.track('audio_narration_play', { book: activeBook, chapter: selectedChapter });
                handleToggleAudio();
              }}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium inline-flex items-center space-x-1.5 transition-colors cursor-pointer ${
                audioStatus.isPlaying
                  ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
              title="Ouvir narração em áudio"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden md:inline">{audioStatus.isPlaying ? 'Pausar' : 'Ouvir'}</span>
            </button>

            {/* Comentários & Notas */}
            <button
              onClick={() => {
                telemetryService.track('theological_commentary_view', { book: activeBook, chapter: selectedChapter });
                onOpenCommentary(activeChapterData);
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Comentário expositivo e anotações"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Notas</span>
            </button>

            {/* BibleArc */}
            <button
              onClick={() => {
                telemetryService.track('bible_arc_view', { book: activeBook, chapter: selectedChapter });
                onOpenBibleArc(activeBook, selectedChapter, allChapterVerses);
                setSelectedVerses({});
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Arqueamento lógico do capítulo (BibleArc)"
            >
              <GitCommit className="w-4 h-4" />
              <span className="hidden lg:inline">BibleArc</span>
            </button>

            {/* Botão 'Aa' de Tipografia & Aparência (Padrão Apple Books / YouVersion) */}
            <button
              onClick={() => setShowAppearanceMenu(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center space-x-1 transition-colors cursor-pointer border ${
                showAppearanceMenu
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
              title="Fonte, tamanho e aparência de leitura"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Aa</span>
            </button>

            {/* Popover 'Aa' de Configuração de Leitura */}
            {showAppearanceMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAppearanceMenu(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 space-y-4 text-left">
                  {/* Escolha de Fonte */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Tipografia do Texto
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setFontFamily('sans');
                          persistReaderPrefs(fontSize, 'sans');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          fontFamily === 'sans'
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 font-semibold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        Sem Serifa (Nítida)
                      </button>
                      <button
                        onClick={() => {
                          setFontFamily('serif');
                          persistReaderPrefs(fontSize, 'serif');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer font-scripture-serif ${
                          fontFamily === 'serif'
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 font-semibold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        Livro (Literata)
                      </button>
                    </div>
                  </div>

                  {/* Tamanho da Fonte */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      <span>Tamanho</span>
                      <span className="text-zinc-700 dark:text-zinc-200">{fontSize}px</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          const next = Math.max(15, fontSize - 1);
                          setFontSize(next);
                          persistReaderPrefs(next, fontFamily);
                        }}
                        className="py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer"
                      >
                        A− Diminuir
                      </button>
                      <button
                        onClick={() => {
                          const next = Math.min(26, fontSize + 1);
                          setFontSize(next);
                          persistReaderPrefs(next, fontFamily);
                        }}
                        className="py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer"
                      >
                        A+ Aumentar
                      </button>
                    </div>
                  </div>

                  {/* Tema */}
                  {setTheme && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Fundo da Página
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                        <button
                          onClick={() => setTheme('light')}
                          className={`py-1.5 rounded-xl border flex items-center justify-center space-x-1 cursor-pointer ${
                            theme === 'light' ? 'border-zinc-900 bg-white text-zinc-950 font-semibold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>Claro</span>
                        </button>
                        <button
                          onClick={() => setTheme('sepia')}
                          className={`py-1.5 rounded-xl border flex items-center justify-center space-x-1 cursor-pointer bg-[#F5EFE6] text-[#2C221E] ${
                            theme === 'sepia' ? 'border-[#8C6B3F] font-semibold ring-1 ring-[#8C6B3F]' : 'border-[#E6DBC8]'
                          }`}
                        >
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Sépia</span>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`py-1.5 rounded-xl border flex items-center justify-center space-x-1 cursor-pointer bg-zinc-950 text-zinc-100 ${
                            theme === 'dark' ? 'border-amber-500 font-semibold ring-1 ring-amber-500' : 'border-zinc-800'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                          <span>Escuro</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Palavras de Jesus */}
                  {setRedLetterEnabled && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Falas de Jesus em carmim
                      </span>
                      <button
                        onClick={() => setRedLetterEnabled(!redLetterEnabled)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                          redLetterEnabled ? 'bg-rose-700' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.75 left-0.75 ${
                          redLetterEnabled ? 'translate-x-4.5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegação rápida entre capítulos na Leitura Livre */}
      {isFreeReading && (
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <button
            onClick={() => onChangeFreeChapter && onChangeFreeChapter(activeBook, Math.max(1, parseInt(selectedChapter, 10) - 1))}
            disabled={parseInt(selectedChapter, 10) <= 1}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cap. Anterior</span>
          </button>

          <button
            onClick={() => {
              telemetryService.track('theological_commentary_view', { book: activeBook });
              onOpenStudyInfo && onOpenStudyInfo(activeBook);
            }}
            className="inline-flex items-center space-x-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Introdução a {activeBook}</span>
          </button>

          <button
            onClick={() => onChangeFreeChapter && onChangeFreeChapter(activeBook, parseInt(selectedChapter, 10) + 1)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer"
          >
            <span>Próximo Cap.</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. FOLHA DE LEITURA DA ESCRITURA (DIRETO NA 1ª DOBRA, ALTA NITIDEZ) */}
      {isDataLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-zinc-400">
          <Loader2 className="w-7 h-7 animate-spin text-zinc-500" />
          <p className="text-xs font-medium">Carregando {activeBook} {selectedChapter}...</p>
        </div>
      ) : (
        <article 
          className={`${fontFamily === 'serif' ? 'font-scripture-serif' : 'font-scripture-sans'} bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] rounded-2xl p-6 sm:p-10 md:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] space-y-7`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {/* Cabeçalho Limpo do Capítulo dentro da Página */}
          <header className="pb-5 border-b border-zinc-100 dark:border-zinc-800/80 sepia:border-[#E6DBC8] flex items-baseline justify-between gap-4 font-sans">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                {isFreeReading ? 'Nova Versão Transformadora' : `Dia ${dayData?.id} • Nova Versão Transformadora`}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 sepia:text-[#2C221E] tracking-tight mt-0.5">
                {activeBook} {selectedChapter}
              </h1>
            </div>

            <button
              onClick={() => {
                telemetryService.track('theological_commentary_view', { book: activeBook });
                onOpenStudyInfo && onOpenStudyInfo(activeBook);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Sobre {activeBook}</span>
            </button>
          </header>

          {activeChapterData.sections.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm font-sans">
              Nenhum texto disponível para {activeBook} {selectedChapter}.
            </div>
          ) : (
            activeChapterData.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3.5">
                {section.title && (
                  <h2 className="font-sans font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 sepia:text-[#2C221E] pt-3 first:pt-0 tracking-tight">
                    {section.title}
                  </h2>
                )}

                <div className="text-zinc-800 dark:text-zinc-200 sepia:text-[#2C221E]">
                  {section.verses.map((v) => {
                    const verseKey = `${activeBook} ${selectedChapter}:${v.number}`;
                    const highlight = highlights[verseKey];
                    const isFavorite = favorites.some(f => f.key === verseKey);
                    const crossRefs = crossReferenceService.getReferences(activeBook, selectedChapter, v.number, v.crossReferences);
                    const hasCrossRefs = crossRefs.length > 0;
                    const isSelected = !!selectedVerses[verseKey];
                    const isSpeaking = speakingVerseNumber === v.number;
                    const highlightClass = highlight && HIGHLIGHT_COLORS[highlight.color] ? HIGHLIGHT_COLORS[highlight.color].bg : '';

                    return (
                      <span
                        key={v.number}
                        className={`inline relative transition-colors rounded px-0.5 py-0.5 cursor-pointer ${
                          highlightClass ? highlightClass : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                        } ${isSelected ? 'bg-amber-100/80 dark:bg-amber-900/40 underline decoration-amber-500 decoration-dotted underline-offset-4' : ''} ${
                          isSpeaking ? 'bg-amber-200/70 dark:bg-amber-900/60' : ''
                        }`}
                        onClick={() => handleVerseClick(v)}
                      >
                        <sup className="font-sans font-semibold text-[11px] text-zinc-400 dark:text-zinc-500 select-none mr-1 inline-block">
                          {v.number}
                        </sup>

                        <span className={redLetterEnabled && v.isJesusWords ? 'red-letter' : ''}>
                          {v.text}{' '}
                        </span>

                        {hasCrossRefs && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              telemetryService.track('cross_references_click', { verse: verseKey });
                              onOpenReferences(verseKey, crossRefs, v.text);
                            }}
                            className="inline-flex items-center text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 ml-0.5 p-0.5 align-middle select-none cursor-pointer transition-colors"
                            title="Ver referências cruzadas exegéticas"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isFavorite && (
                          <Star className="inline w-3 h-3 text-amber-500 fill-current ml-0.5 align-middle" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </article>
      )}

      {/* 3. PAINEL COMPLEMENTAR PÓS-LEITURA (LOCAIS CITADOS, TRILHA E CONCLUSÃO) */}
      <div className="space-y-3">
        {/* Locais Geográficos Citados */}
        {mentionedPlaces.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-zinc-400 font-medium shrink-0">Locais no texto:</span>
            {mentionedPlaces.map(place => (
              <button
                key={place.id}
                onClick={() => {
                  telemetryService.track('biblical_maps_view', { place: place.name, chapter: activeChapterStr });
                  onOpenMaps && onOpenMaps(place.id);
                }}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{place.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Curadoria Sonora Honesta & Fundo Instrumental sem Voz */}
        {activeChapterMusic && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  onClick={() => setPlayingReaderAudio(prev => prev === 'song' ? null : 'song')}
                  className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-900 cursor-pointer group"
                  title="Ouvir canção temática aqui"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${activeChapterMusic.youtubeId}/mqdefault.jpg`}
                    alt={activeChapterMusic.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    {playingReaderAudio === 'song' ? (
                      <X className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    )}
                  </div>
                </button>
                <div className="min-w-0">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {activeChapterMusic.title} <span className="font-normal text-zinc-500">• {activeChapterMusic.artist}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 leading-snug">
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      Base: {activeChapterMusic.scriptureBasis}
                    </span>
                    {activeChapterMusic.chapterTheme ? (
                      <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                        • Tema: {activeChapterMusic.chapterTheme}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 flex-wrap gap-y-1">
                <button
                  onClick={() => setPlayingReaderAudio(prev => prev === 'inst' ? null : 'inst')}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    playingReaderAudio === 'inst'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold'
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200'
                  }`}
                  title="Tocar piano instrumental sem voz para acompanhar a leitura"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{playingReaderAudio === 'inst' ? 'Fechar Piano' : 'Piano s/ Voz'}</span>
                </button>

                <button
                  onClick={() => {
                    telemetryService.track('music_cycle', { chapter: activeChapterStr });
                    setPlayingReaderAudio(null);
                    setChapterMusicOverride(prev => prev === null ? (activeChapterMusic.artistIndex ?? 0) + 1 : prev + 1);
                  }}
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Outra canção neste eixo teológico"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <a
                  href={activeChapterMusic.youtubeDiscoveryUrl || activeChapterMusic.youtubeMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    telemetryService.track('music_youtube_dynamic_search', {
                      chapter: activeChapterStr,
                      query: activeChapterMusic.youtubeDiscoveryQuery
                    })
                  }
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 font-medium transition-colors"
                  title={`Buscar louvores para ${activeChapterStr} no YouTube Music`}
                >
                  <span>YT Music</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {playingReaderAudio && (
              <div className="rounded-xl overflow-hidden bg-black border border-zinc-800 h-28">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${
                    playingReaderAudio === 'inst'
                      ? activeChapterMusic.instrumentalTrack?.youtubeId || 'FwBy5rVtUOg'
                      : activeChapterMusic.youtubeId
                  }?autoplay=1&rel=0`}
                  title="Player Devocional"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {/* Conclusão do Capítulo & Avanço */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {isCurrentChapterCompleted ? `${currentChapterName} concluído` : `Finalizar leitura de ${currentChapterName}`}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isFreeReading ? 'Registre este capítulo no seu histórico.' : `${completedChaptersCount} de ${readings.length} capítulos do dia lidos.`}
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => onToggleChapter && onToggleChapter(currentChapterName, !isCurrentChapterCompleted)}
              className={`inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCurrentChapterCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCurrentChapterCompleted ? 'Concluído' : 'Marcar como Lido'}</span>
            </button>

            {!isFreeReading && nextReadingInDay && (
              <button
                onClick={() => {
                  const p = parseReading(nextReadingInDay);
                  setSelectedChapter(p.chapter);
                  setSelectedBook(p.book);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>{nextReadingInDay}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isFreeReading && (
              <button
                onClick={() => onChangeFreeChapter && onChangeFreeChapter(activeBook, parseInt(selectedChapter, 10) + 1)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Próximo Cap.</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. TOOLBAR FLUTUANTE DE SELEÇÃO DE VERSÍCULOS */}
      {selectedCount > 0 && (() => {
        const citation = formatCitation();
        const singleVerseData = selectedCount === 1 ? Object.values(selectedVerses)[0] : null;
        const singleRefs = singleVerseData 
          ? crossReferenceService.getReferences(activeBook, selectedChapter, singleVerseData.number, singleVerseData.crossReferences)
          : [];

        return (
          <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md bg-zinc-950/95 text-white rounded-2xl shadow-2xl p-3.5 border border-zinc-800 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {citation}
                </span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-medium">
                  {selectedCount} {selectedCount === 1 ? 'v.' : 'vv.'}
                </span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={handleToggleFav}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    areAllSelectedFavorites 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                  }`}
                  title="Favoritar"
                >
                  <Star className="w-4 h-4" fill={areAllSelectedFavorites ? "currentColor" : "none"} />
                </button>

                <button
                  onClick={handleCopyVerses}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Copiar"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleShareVerses}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onOpenBibleArc(activeBook, selectedChapter, allChapterVerses, citation, getCombinedText());
                    setSelectedVerses({});
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium ml-0.5 cursor-pointer"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span className="text-[11px]">BibleArc</span>
                </button>

                <button
                  onClick={() => setSelectedVerses({})}
                  className="p-1 text-zinc-400 hover:text-white ml-1 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-semibold text-zinc-400">
                  Grifo:
                </span>
                <div className="flex items-center space-x-1.5">
                  {Object.entries(HIGHLIGHT_COLORS).map(([cKey, cData]) => (
                    <button
                      key={cKey}
                      onClick={() => handleApplyHighlight(cKey)}
                      className="w-5 h-5 rounded-full hover:scale-110 transition-transform border border-white/20 cursor-pointer"
                      style={{ backgroundColor: cData.hex }}
                      title={cData.name}
                    />
                  ))}
                  <button
                    onClick={() => handleApplyHighlight(null)}
                    className="text-[11px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-800 cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {singleVerseData && (
                <button
                  onClick={() => {
                    onOpenReferences(singleVerseData.key, singleRefs, singleVerseData.text);
                    setSelectedVerses({});
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium text-amber-400 hover:underline px-1 py-0.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{singleRefs.length > 0 ? `${singleRefs.length} ${singleRefs.length === 1 ? 'ref' : 'refs'}` : 'Referências'}</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Barra Flutuante de Áudio em Reprodução */}
      <AudioPlayerBar
        audioStatus={audioStatus}
        activeBook={activeBook}
        selectedChapter={selectedChapter}
        speakingVerseNumber={speakingVerseNumber}
        onPlayPause={handleToggleAudio}
        onStop={() => {
          speechService.stop();
          setSpeakingVerseNumber(null);
          setAudioStatus({ status: 'stopped', isPlaying: false, rate: 1.0 });
        }}
        onChangeRate={(newRate) => {
          speechService.setRate(newRate);
          setAudioStatus(prev => ({ ...prev, rate: newRate }));
        }}
      />

    </div>
  );
}
