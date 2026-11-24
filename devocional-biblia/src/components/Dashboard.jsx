import React, { useState, useMemo } from 'react';
import { 
  Play, 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Music, 
  Video, 
  RefreshCw,
  ArrowRight,
  BookMarked,
  Compass,
  GitCommit,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  getMediaForDay,
  DOCTRINAL_AXES,
  INSTRUMENTAL_READING_TRACKS,
  getSongsByDoctrinalAxis
} from '../data/dailyMedia';
import { formatDateBR } from '../services/dateUtils';
import { telemetryService } from '../services/telemetryService';

const MONTH_PILLS = [
  { id: '01', label: 'Jan' },
  { id: '02', label: 'Fev' },
  { id: '03', label: 'Mar' },
  { id: '04', label: 'Abr' },
  { id: '05', label: 'Mai' },
  { id: '06', label: 'Jun' },
  { id: '07', label: 'Jul' },
  { id: '08', label: 'Ago' },
  { id: '09', label: 'Set' },
  { id: '10', label: 'Out' },
  { id: '11', label: 'Nov' },
  { id: '12', label: 'Dez' },
  { id: 'all', label: '365 Dias' }
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const BOOK_ABBR = {
  'Gênesis': 'Gn', 'Êxodo': 'Êx', 'Levítico': 'Lv', 'Números': 'Nm', 'Deuteronômio': 'Dt',
  'Josué': 'Js', 'Juízes': 'Jz', 'Rute': 'Rt', '1 Samuel': '1Sm', '2 Samuel': '2Sm',
  '1 Reis': '1Rs', '2 Reis': '2Rs', '1 Crônicas': '1Cr', '2 Crônicas': '2Cr',
  'Esdras': 'Ed', 'Neemias': 'Ne', 'Ester': 'Et', 'Jó': 'Jó', 'Salmos': 'Sl',
  'Provérbios': 'Pv', 'Eclesiastes': 'Ec', 'Cânticos': 'Ct', 'Isaías': 'Is',
  'Jeremias': 'Jr', 'Lamentações': 'Lm', 'Ezequiel': 'Ez', 'Daniel': 'Dn',
  'Oseias': 'Os', 'Joel': 'Jl', 'Amós': 'Am', 'Obadias': 'Ob', 'Jonas': 'Jn',
  'Miqueias': 'Mq', 'Naum': 'Na', 'Habacuque': 'Hc', 'Sofonias': 'Sf', 'Ageu': 'Ag',
  'Zacarias': 'Zc', 'Malaquias': 'Ml', 'Mateus': 'Mt', 'Marcos': 'Mc', 'Lucas': 'Lc',
  'João': 'Jo', 'Atos': 'At', 'Romanos': 'Rm', '1 Coríntios': '1Co', '2 Coríntios': '2Co',
  'Gálatas': 'Gl', 'Efésios': 'Ef', 'Filipenses': 'Fp', 'Colossenses': 'Cl',
  '1 Tessalonicenses': '1Ts', '2 Tessalonicenses': '2Ts', '1 Timóteo': '1Tm',
  '2 Timóteo': '2Tm', 'Tito': 'Tt', 'Filemom': 'Fm', 'Hebreus': 'Hb', 'Tiago': 'Tg',
  '1 Pedro': '1Pe', '2 Pedro': '2Pe', '1 João': '1Jo', '2 João': '2Jo', '3 João': '3Jo',
  'Judas': 'Jd', 'Apocalipse': 'Ap'
};

function formatReadingsCompact(readings = [], compactCrossBook = false) {
  if (!readings || readings.length === 0) return '';
  if (readings.length === 1) return readings[0];
  const parsed = readings.map(r => {
    const parts = r.trim().split(/\s+/);
    const ch = parts.pop();
    return { book: parts.join(' '), ch };
  });
  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  if (parsed.every(p => p.book === first.book)) {
    return `${first.book} ${first.ch}–${last.ch}`;
  }
  if (compactCrossBook) {
    const b1 = BOOK_ABBR[first.book] || first.book;
    const b2 = BOOK_ABBR[last.book] || last.book;
    return `${b1} ${first.ch} – ${b2} ${last.ch}`;
  }
  return `${first.book} ${first.ch} – ${last.book} ${last.ch}`;
}

function cleanTrackTitle(title = '') {
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim() || title;
}

export default function Dashboard({ 
  days, 
  dayBookData,
  currentDayId, 
  pendingDayId, 
  allPendingDays = [],
  onSelectDay,
  onToggleChapter,
  chapterProgress = {},
  onOpenBibleNav,
  onOpenStudyInfo,
  onOpenBibleArc,
  activeProfile,
  dashboardLayout,
  onOpenMaps,
  onOpenCustomize,
  onOptInPlan
}) {
  const currentDayData = days.find(d => d.id === currentDayId);
  const currentMonthStr = currentDayData?.date ? currentDayData.date.split('-')[1] : '11';

  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [musicTab, setMusicTab] = useState('reading'); // 'reading' | 'instrumental' | 'themes'
  const [curatedPage, setCuratedPage] = useState(0);
  const [selectedAxisId, setSelectedAxisId] = useState('cruz_redencao');
  const [playingTrackId, setPlayingTrackId] = useState(null);

  const activeMedia = useMemo(
    () => getMediaForDay(currentDayId, currentDayData, dayBookData),
    [currentDayId, currentDayData, dayBookData]
  );
  const pendingDayData = pendingDayId ? days.find(d => d.id === pendingDayId) : null;

  const currentReadings = currentDayData?.readings && currentDayData.readings.length > 0
    ? currentDayData.readings
    : ['1 Coríntios 14', '1 Coríntios 15', '1 Coríntios 16'];

  const firstReadingParts = (currentReadings[0] || '1 Coríntios 14').trim().split(/\s+/);
  const activeChapterNum = firstReadingParts.pop() || '1';
  const activeBookName = firstReadingParts.join(' ') || '1 Coríntios';

  // Extrai um Versículo em Destaque real do capítulo de hoje para o Hero Card (padrão YouVersion / Glorify)
  const featuredVerse = useMemo(() => {
    const chObj = dayBookData?.[String(activeChapterNum)] || dayBookData?.[activeChapterNum];
    if (!chObj?.sections) return null;
    const allVerses = chObj.sections.flatMap(s => s.verses || []);
    if (allVerses.length === 0) return null;
    const picked =
      allVerses.find(v => v.text && v.text.length >= 55 && v.text.length <= 190 && (v.crossReferences?.length >= 2 || v.isJesusWords)) ||
      allVerses.find(v => v.text && v.text.length >= 50 && v.text.length <= 200) ||
      allVerses[0];
    return picked
      ? {
          citation: `${chObj.book || activeBookName} ${activeChapterNum}:${picked.number}`,
          text: picked.text
        }
      : null;
  }, [dayBookData, activeChapterNum, activeBookName]);

  const curatedSongs = activeMedia?.curatedSongs || [];
  const PAGE_SIZE = 3;
  const totalCuratedPages = Math.max(1, Math.ceil(curatedSongs.length / PAGE_SIZE));
  const safePage = curatedPage % totalCuratedPages;
  const visibleCuratedSongs = curatedSongs.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const axisSongs = useMemo(() => getSongsByDoctrinalAxis(selectedAxisId), [selectedAxisId]);

  const handleNextCuratedPage = () => {
    telemetryService.track('music_cycle', { dayId: currentDayId, page: (safePage + 1) % totalCuratedPages });
    setPlayingTrackId(null);
    setCuratedPage(prev => (prev + 1) % totalCuratedPages);
  };

  const isRafael = activeProfile?.id === 'default' || activeProfile?.name?.trim().toLowerCase() === 'rafael' || activeProfile?.role === 'admin';
  const isPlanActive = activeProfile?.planOptIn !== false;
  const startDay = isRafael ? 1 : (activeProfile?.startDayId || 1);
  const totalDaysInUserPlan = Math.max(1, 365 - startDay + 1);

  const totalCompleted = days.filter(d => d.completed && (isRafael || d.id >= startDay)).length;
  const progressPercent = Math.min(100, Math.round((totalCompleted / (isRafael ? 365 : totalDaysInUserPlan)) * 100));

  const completedTodayChapters = currentReadings.filter(r => !!chapterProgress[r]?.completed).length;

  const filteredDays = days.filter(d => {
    if (filter === 'completed' && !d.completed) return false;
    if (filter === 'pending' && (d.completed || d.id < startDay || d.id > currentDayId)) return false;
    if (filter !== 'pending' && selectedMonth !== 'all') {
      const m = d.date ? d.date.split('-')[1] : '';
      if (m !== selectedMonth) return false;
    }
    return true;
  });

  const hidden = dashboardLayout?.hidden || {};

  // Circular SVG progress ring metrics
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 overflow-x-clip">
      
      {/* 1. HEADER COMPACTO: SAUDAÇÃO HUMANA + ANEL DE PROGRESSO ANUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {currentDayData?.dayOfWeek
              ? `${currentDayData.dayOfWeek.charAt(0).toUpperCase()}${currentDayData.dayOfWeek.slice(1)}, `
              : ''}
            {formatDateBR(currentDayData?.date, true)} • Dia {currentDayId} de 365
          </p>
          <h1 className="text-2xl sm:text-[26px] font-bold text-zinc-950 dark:text-zinc-50 tracking-tight mt-0.5">
            {getGreeting()}, {activeProfile?.name || 'Leitor'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isPlanActive && (
            <div className="flex items-center space-x-3 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800 sepia:border-[#E6DBC8] shadow-2xs">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-zinc-100 dark:text-zinc-800"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    className="text-emerald-600 dark:text-emerald-400 transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-zinc-900 dark:text-zinc-100">
                  {progressPercent}%
                </span>
              </div>
              <div className="pr-1">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Plano Anual
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {totalCompleted} de 365 dias lidos
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              telemetryService.track('dashboard_customize');
              onOpenCustomize && onOpenCustomize();
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800 sepia:border-[#E6DBC8] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer shadow-2xs"
            title="Configurar blocos visíveis"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODO SEM PLANO ATIVO */}
      {!isPlanActive && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Modo de Leitura Livre Ativo
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Explore os 66 livros da Bíblia, estudos exegéticos e mapas no seu ritmo, sem metas diárias.
            </p>
          </div>
          {onOptInPlan && (
            <button
              onClick={onOptInPlan}
              className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs shrink-0 cursor-pointer"
            >
              Ativar Plano Anual
            </button>
          )}
        </div>
      )}

      {/* 2. BENTO GRID ASSIMÉTRICO DE 12 COLUNAS (PADRÃO YOUVERSION / GLORIFY / DWELL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA PRINCIPAL ESQUERDA (7 COLUNAS): LEITURA DO DIA + FERRAMENTAS DE ESTUDO */}
        <div className="lg:col-span-7 min-w-0 space-y-5">
          
          {/* Banner Discreto e Elegante de Recuperação (se houver dia anterior em aberto) */}
          {isPlanActive && !hidden['todayPending'] && pendingDayData && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Leitura em aberto • Dia {pendingDayData.id} ({formatDateBR(pendingDayData.date)})
                    {allPendingDays.length > 1 ? ` e mais ${allPendingDays.length - 1}` : ''}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {pendingDayData.readings.join(', ')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectDay(pendingDayData.id)}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold text-xs hover:bg-amber-100/50 transition-colors shrink-0 cursor-pointer"
              >
                <span>Recuperar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* HERO CARD: LEITURA DE HOJE + VERSÍCULO EM DESTAQUE */}
          {isPlanActive && !hidden['todayPending'] && currentDayData && (
            <section className="rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
              {/* Top Meta */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-semibold tracking-wide uppercase">
                    Leitura de Hoje
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    ~{currentReadings.length * 4} min
                  </span>
                </div>

                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {completedTodayChapters}/{currentReadings.length} capítulos concluídos
                </span>
              </div>

              {/* Título Nítido */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  {formatReadingsCompact(currentReadings)}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Nova Versão Transformadora (NVT) • Referências exegéticas e notas expositivas
                </p>
              </div>

              {/* Versículo-Chave do Dia (Amostra Viva da Escritura na 1ª Dobra) */}
              {featuredVerse && (
                <div
                  onClick={() => onSelectDay(currentDayData.id)}
                  className="p-4 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/70 sepia:bg-[#F3ECE0] border border-zinc-100 dark:border-zinc-800/80 sepia:border-[#E6DBC8] cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <p className="text-sm text-zinc-700 dark:text-zinc-200 sepia:text-[#2C221E] leading-relaxed">
                    “{featuredVerse.text}”
                  </p>
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
                    {featuredVerse.citation} (NVT)
                  </p>
                </div>
              )}

              {/* Checklist Interativo de Capítulos */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Capítulos do Dia
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentReadings.map(r => {
                    const isDone = !!chapterProgress[r]?.completed;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onToggleChapter && onToggleChapter(r, !isDone)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer border ${
                          isDone
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/70 font-semibold'
                            : 'bg-white dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                        title={isDone ? 'Marcar como não lido' : 'Marcar capítulo como concluído'}
                      >
                        <span className="truncate">{r}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Primário Limpo e Proporcional */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => onSelectDay(currentDayData.id)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{currentDayData.completed ? 'Rever Leitura de Hoje' : 'Continuar Leitura'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenBibleNav}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800/90 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span>Outro Livro</span>
                </button>
              </div>
            </section>
          )}

          {/* ESTUDO CONTEXTUAL (3 CARDS COMPACTOS & EQUILIBRADOS) */}
          {!hidden['studyBanner'] && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button
                onClick={() => {
                  telemetryService.track('theological_commentary_view', { book: activeBookName });
                  onOpenStudyInfo && onOpenStudyInfo(activeBookName);
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-3 group-hover:bg-amber-500/15 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  Guia de {activeBookName}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  Autor, contexto e estrutura
                </p>
              </button>

              <button
                onClick={() => {
                  telemetryService.track('bible_arc_view', { book: activeBookName, chapter: activeChapterNum });
                  onOpenBibleArc && onOpenBibleArc(activeBookName, activeChapterNum);
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-3 group-hover:bg-amber-500/15 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  <GitCommit className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  BibleArc
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  Lógica de {activeBookName} {activeChapterNum}
                </p>
              </button>

              <button
                onClick={() => {
                  telemetryService.track('biblical_maps_view', { source: 'dashboard_bento' });
                  onOpenMaps && onOpenMaps();
                }}
                className="p-4 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] hover:border-zinc-300 dark:hover:border-zinc-700 text-left transition-all cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mb-3 group-hover:bg-amber-500/15 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  Atlas Bíblico
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  Mapas e rotas históricas
                </p>
              </button>
            </div>
          )}

        </div>

        {/* COLUNA COMPLEMENTAR DIREITA (5 COLUNAS): MÚSICA ESTILO PLAYLIST + VÍDEO COM THUMBNAIL VISÍVEL */}
        <div className="lg:col-span-5 min-w-0 space-y-5">
          
          {/* CURADORIA MUSICAL EXEGÉTICA & FUNDO INSTRUMENTAL (PADRÃO DWELL / GLORIFY) */}
          {!hidden['music'] && activeMedia?.music && (
            <section className="rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
              {/* Cabeçalho + Seletor de Modo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Música & Meditação Sonora
                    </h3>
                  </div>

                  {musicTab === 'reading' && totalCuratedPages > 1 && (
                    <button
                      onClick={handleNextCuratedPage}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                      title="Ver outras canções alinhadas aos temas teológicos da leitura de hoje"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Alternar ({safePage + 1}/{totalCuratedPages})</span>
                    </button>
                  )}
                </div>

                {/* 3 Modos Claros e Honestos */}
                <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 sepia:bg-[#EDE3D2] text-[11px] font-medium">
                  <button
                    onClick={() => {
                      setMusicTab('reading');
                      setPlayingTrackId(null);
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      musicTab === 'reading'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    Ecos da Leitura
                  </button>
                  <button
                    onClick={() => {
                      setMusicTab('instrumental');
                      setPlayingTrackId(null);
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      musicTab === 'instrumental'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    Fundo p/ Ler
                  </button>
                  <button
                    onClick={() => {
                      setMusicTab('themes');
                      setPlayingTrackId(null);
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      musicTab === 'themes'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    Por Tema
                  </button>
                </div>
              </div>

              {/* ABA 1: ECOS DA LEITURA (CONEXÃO DOUTRINÁRIA REAL, SEM FALSO RÓTULO FIXO DE CAPÍTULO) */}
              {musicTab === 'reading' && (
                <>
                  {activeMedia.activeAxisLabels?.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Temas da passagem:
                      </span>
                      {activeMedia.activeAxisLabels.slice(0, 2).map(ax => (
                        <span
                          key={ax}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300"
                        >
                          {ax}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {visibleCuratedSongs.map(song => {
                      const isPlayingThis = playingTrackId === song.id;
                      return (
                        <div key={song.id} className="py-3 first:pt-1.5 last:pb-0.5">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => {
                                const next = isPlayingThis ? null : song.id;
                                if (next) {
                                  telemetryService.track('music_play_in_app', { title: song.title, artist: song.artist, basis: song.scriptureBasis });
                                }
                                setPlayingTrackId(next);
                              }}
                              className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-900 group cursor-pointer border border-zinc-200/60 dark:border-zinc-700 mt-0.5"
                              title={isPlayingThis ? 'Fechar player' : `Ouvir ${song.title}`}
                            >
                              <img
                                src={`https://i.ytimg.com/vi/${song.youtubeId}/mqdefault.jpg`}
                                alt={song.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                                isPlayingThis ? 'bg-black/65' : 'bg-black/30 group-hover:bg-black/50'
                              }`}>
                                {isPlayingThis ? (
                                  <X className="w-4 h-4 text-white" />
                                ) : (
                                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                )}
                              </div>
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {song.title}
                                </h4>
                                <a
                                  href={song.youtubeMusicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => telemetryService.track('music_play_youtube_music', { title: song.title, artist: song.artist })}
                                  className="p-1 rounded-md text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
                                  title="Abrir no YouTube Music"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                {song.artist} • <span className="font-medium text-amber-700 dark:text-amber-400">Base: {song.scriptureBasis}</span>
                              </p>

                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-1">
                                {song.exegeticalNote}
                              </p>
                            </div>
                          </div>

                          {isPlayingThis && (
                            <div className="mt-3 rounded-xl overflow-hidden bg-black border border-zinc-800 h-28">
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&rel=0`}
                                title={`${song.title} - ${song.artist}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ABA 2: FUNDO INSTRUMENTAL SEM VOZ PARA LER COM FOCO (PADRÃO DWELL) */}
              {musicTab === 'instrumental' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Arranjos sem letra cantada para acompanhar a leitura bíblica sem competir com sua atenção:
                  </p>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                    {INSTRUMENTAL_READING_TRACKS.map(inst => {
                      const isPlayingThis = playingTrackId === inst.id;
                      return (
                        <div key={inst.id} className="py-2.5 first:pt-1 last:pb-0.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                const next = isPlayingThis ? null : inst.id;
                                if (next) {
                                  telemetryService.track('music_play_in_app', { title: inst.title, type: 'instrumental' });
                                }
                                setPlayingTrackId(next);
                              }}
                              className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-900 group cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
                            >
                              <img
                                src={`https://i.ytimg.com/vi/${inst.youtubeId}/mqdefault.jpg`}
                                alt={inst.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className={`absolute inset-0 flex items-center justify-center ${
                                isPlayingThis ? 'bg-black/65' : 'bg-black/30 group-hover:bg-black/50'
                              }`}>
                                {isPlayingThis ? (
                                  <X className="w-4 h-4 text-white" />
                                ) : (
                                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                )}
                              </div>
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {inst.title}
                                </h4>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0">
                                  Sem Voz
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                                {inst.purpose}
                              </p>
                            </div>
                          </div>

                          {isPlayingThis && (
                            <div className="mt-2.5 rounded-xl overflow-hidden bg-black border border-zinc-800 h-28">
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${inst.youtubeId}?autoplay=1&rel=0`}
                                title={inst.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA 3: ACERVO BÍBLICO POR EIXO TEOLÓGICO */}
              {musicTab === 'themes' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {DOCTRINAL_AXES.map(ax => (
                      <button
                        key={ax.id}
                        onClick={() => {
                          setSelectedAxisId(ax.id);
                          setPlayingTrackId(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                          selectedAxisId === ax.id
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70'
                        }`}
                      >
                        {ax.label}
                      </button>
                    ))}
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70 max-h-64 overflow-y-auto pr-1">
                    {axisSongs.map(song => {
                      const isPlayingThis = playingTrackId === song.id;
                      return (
                        <div key={song.id} className="py-2.5 first:pt-1 last:pb-0.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setPlayingTrackId(isPlayingThis ? null : song.id)}
                              className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-900 cursor-pointer"
                            >
                              <img
                                src={`https://i.ytimg.com/vi/${song.youtubeId}/mqdefault.jpg`}
                                alt={song.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                {isPlayingThis ? (
                                  <X className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                                )}
                              </div>
                            </button>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {song.title} • <span className="font-normal text-zinc-500">{song.artist}</span>
                              </h4>
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate">
                                Base: {song.scriptureBasis}
                              </p>
                            </div>

                            <a
                              href={song.youtubeMusicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 shrink-0"
                              title="Abrir no YouTube Music"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {isPlayingThis && (
                            <div className="mt-2.5 rounded-xl overflow-hidden bg-black border border-zinc-800 h-24">
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&rel=0`}
                                title={song.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* VÍDEO BIBLEPROJECT COM CAPA 16:9 VISÍVEL NO SCROLL */}
          {!hidden['video'] && activeMedia?.video && (
            <section className="rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              {showVideoPlayer ? (
                <div className="aspect-video w-full bg-black relative">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeMedia.video.youtubeId}?autoplay=1&rel=0`}
                    title={activeMedia.video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setShowVideoPlayer(false)}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-medium hover:bg-black cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    telemetryService.track('bible_project_video_play', { book: activeBookName, video: activeMedia.video.title });
                    setShowVideoPlayer(true);
                  }}
                  className="relative aspect-video w-full bg-zinc-900 cursor-pointer group overflow-hidden"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${activeMedia.video.youtubeId}/hqdefault.jpg`}
                    alt={activeMedia.video.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium">
                    <Video className="w-3 h-3 text-amber-400" />
                    <span>BibleProject Português</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/95 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {activeMedia.video.title.replace('BibleProject Português | ', '')}
                  </h3>
                  {activeMedia.video.searchUrl && (
                    <a
                      href={activeMedia.video.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 mt-0.5"
                      title="Ver no YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {activeMedia.video.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {activeMedia.video.description}
                  </p>
                )}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* 3. CRONOGRAMA ANUAL LIMPO POR MÊS (ABAIXO DA DOBRA) */}
      {isPlanActive && !hidden['calendar'] && (
        <section
          id="annual-plan-section"
          className="min-w-0 rounded-2xl bg-white dark:bg-[#141417] sepia:bg-[#FAF6F0] border border-zinc-200/80 dark:border-zinc-800/90 sepia:border-[#E6DBC8] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Cronograma de Leitura
              </h3>
            </div>

            <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800/90 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold' : 'text-zinc-500'
                }`}
              >
                Por Mês
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filter === 'pending' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold' : 'text-zinc-500'
                }`}
              >
                Em Aberto
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filter === 'completed' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold' : 'text-zinc-500'
                }`}
              >
                Concluídos ({totalCompleted})
              </button>
            </div>
          </div>

          {filter !== 'pending' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {MONTH_PILLS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMonth(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    selectedMonth === m.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {filteredDays.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              Nenhuma leitura encontrada neste filtro.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredDays.map(d => {
                const isToday = d.id === currentDayId;
                const isPending = !d.completed && d.id >= startDay && d.id < currentDayId;
                const shortReading = formatReadingsCompact(d.readings, true);

                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDay(d.id)}
                    className={`p-3 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? 'border-zinc-900 dark:border-amber-500 bg-zinc-900/5 dark:bg-amber-500/10 ring-1 ring-zinc-900 dark:ring-amber-500'
                        : isPending
                        ? 'border-amber-300/80 dark:border-amber-800/70 bg-amber-50/40 dark:bg-amber-950/20'
                        : d.completed
                        ? 'border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-300'
                        : 'border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-[11px] font-medium text-zinc-400">
                        {d.date.split('-').slice(1).reverse().join('/')}
                      </span>
                      {d.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isToday ? (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950">
                          Hoje
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1" title={d.readings.join(', ')}>
                      {shortReading}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Dia {d.id}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
