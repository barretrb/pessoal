import React, { useState } from 'react';
import { 
  X, Check, Copy, BookOpen, Layers, 
  ArrowLeft, Compass, Sparkles, Star, GitCommit, Heart, CheckCircle2, ChevronDown
} from 'lucide-react';
import { bibleArcEngine } from '../services/bibleArcEngine.js';

export default function BibleArcModal({ 
  isOpen, 
  onClose, 
  bookName, 
  chapter, 
  chapterVerses = [], 
  initialPassage = '', 
  initialText = '' 
}) {
  if (!isOpen) return null;

  // Resolve livro e capítulo
  let resolvedBook = (bookName || '').trim();
  let resolvedChapter = String(chapter || '').trim();

  if (!resolvedBook && initialPassage) {
    const parts = initialPassage.trim().split(' ');
    resolvedBook = parts[0] || 'Gênesis';
    resolvedChapter = (parts[1] || '1').split(':')[0];
  }

  if (!resolvedBook) resolvedBook = 'Gênesis';
  if (!resolvedChapter) resolvedChapter = '1';

  // Obtém o estudo do capítulo mapeado por temas
  const chapterStudy = bibleArcEngine.getChapterThematicStudy(resolvedBook, resolvedChapter, chapterVerses);
  const themes = chapterStudy.themes || [];

  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'synthesis' | 'application'
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Tema ativo selecionado
  const activeTheme = themes[activeThemeIdx] || themes[0];
  const propositions = activeTheme?.propositions || [];
  const arcs = activeTheme?.arcs || [];
  const mainProp = activeTheme?.mainProp || 1;

  // Copiar Análise Completa em Texto
  const handleCopyFullStudy = () => {
    const mainP = propositions.find(p => p.number === mainProp);

    let report = `📐 ESTUDO DE ARQUEAMENTO BÍBLICO (BIBLE-ARC)\n`;
    report += `Capítulo: ${chapterStudy.chapterTitle}\n`;
    report += `Tema: ${activeTheme.themeTitle} (${activeTheme.passage})\n\n`;

    report += `🌟 1. PROPOSIÇÃO CENTRAL (TESE DO AUTOR):\n`;
    report += mainP ? `[P${mainP.number}] "${mainP.text}"\n` : `Não definida\n`;
    if (activeTheme.mainPropExplanation) {
      report += `Significado: ${activeTheme.mainPropExplanation}\n\n`;
    } else {
      report += `\n`;
    }

    report += `📜 2. PROPOSIÇÕES DO DISCURSO (TEXTO INTEGRAL):\n`;
    propositions.forEach(p => {
      const isMain = p.number === mainProp;
      report += `[P${p.number}]${isMain ? ' ⭐ (Central)' : ''} ${p.text}\n`;
    });
    report += `\n`;

    report += `🔗 3. RELAÇÕES LÓGICAS & CONEXÕES DE DISCURSO:\n`;
    if (arcs.length === 0) {
      report += `Nenhum arco traçado.\n`;
    } else {
      arcs.forEach(a => {
        report += `• [P${a.from}] ➔ [P${a.to}]: ${a.name} [${a.label}]\n`;
        if (a.explanation) report += `  ↳ ${a.explanation}\n`;
      });
    }
    report += `\n`;

    report += `📊 4. SÍNTESE TEOLÓGICA:\n`;
    report += `${activeTheme.theologicalSynthesis || 'Não preenchida.'}\n\n`;

    report += `🙏 5. APLICAÇÃO PRÁTICA DEVOCIONAL:\n`;
    report += `${activeTheme.practicalApplication || 'Não preenchida.'}\n`;

    try {
      navigator.clipboard.writeText(report);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (e) {}
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        
        {/* Cabeçalho Superior: Ações e Título Limpo */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          {/* Botão Voltar Destacado para Mobile */}
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-200/90 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-xs font-bold transition-colors shrink-0 shadow-2xs"
            title="Voltar ao leitor bíblico"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {/* Identificação Central do Livro e Capítulo */}
          <div className="flex items-center space-x-1.5 truncate px-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              ⌒
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
              {chapterStudy.chapterTitle}
            </h3>
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handleCopyFullStudy}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
              title="Copiar Análise Completa"
            >
              {copiedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Mapeamento por Temas & Contexto (Dropdown Selector) */}
        <div className="px-3 sm:px-6 py-2.5 bg-zinc-100/70 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800/80 space-y-2">
          {/* Caixa de Seleção para Perícopes / Temas do Capítulo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {themes.length > 1 ? (
              <div className="flex-1 min-w-0">
                <label htmlFor="pericope-select" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Selecione a Perícope / Tema ({themes.length} seções)</span>
                </label>
                <div className="relative">
                  <select
                    id="pericope-select"
                    value={activeThemeIdx}
                    onChange={(e) => setActiveThemeIdx(Number(e.target.value))}
                    className="w-full appearance-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-300 dark:border-zinc-700 py-2 pl-3 pr-8 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    {themes.map((t, idx) => (
                      <option key={t.id} value={idx} className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                        {t.themeTitle} ({t.passage})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {activeTheme.themeTitle}
                </h4>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                  {activeTheme.passage} • Análise de Discurso (BibleArc)
                </p>
              </div>
            )}

            <button
              onClick={() => setShowHelper(!showHelper)}
              className="self-end sm:self-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white sm:bg-transparent dark:bg-zinc-800 sm:dark:bg-transparent border border-zinc-200 sm:border-0 dark:border-zinc-700 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 shrink-0 transition-colors"
              title="O que significam os arcos?"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              <span>Legenda do Método</span>
            </button>
          </div>
        </div>

        {/* Guia Didático Rápido do Método */}
        {showHelper && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h5 className="font-bold text-sm text-indigo-900 dark:text-indigo-100 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>O que é a Análise de Discurso (BibleArc)?</span>
                </h5>
                <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                  O arqueamento bíblico mapeia a arquitetura lógica do texto sagrado. Cada oração é conectada por arcos com símbolos gramaticais: 
                  <strong> G</strong> (Causa/Fundamento), <strong> Pur</strong> (Propósito), <strong> ∴</strong> (Inferência/Conclusão), <strong> Con</strong> (Contraste) e <strong> +</strong> (Progressão).
                  A <strong>Proposição Central ⭐</strong> é a ideia dominante que governa o trecho bíblico.
                </p>
              </div>
              <button 
                onClick={() => setShowHelper(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-4 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Barra de Abas em Grade Segmentada (Sem Transbordamento) */}
        <div className="px-3 sm:px-6 pt-2 pb-1.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1 ${
                activeTab === 'diagram'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Diagrama</span>
              <span className="text-[10px] px-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">
                {arcs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('synthesis')}
              className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1 ${
                activeTab === 'synthesis'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 shrink-0" />
              <span>Síntese</span>
            </button>

            <button
              onClick={() => setActiveTab('application')}
              className={`py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1 ${
                activeTab === 'application'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              <span>Aplicação</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ============================================================== */}
          {/* ABA 1: DIAGRAMA, PROPOSIÇÕES COMPLETAS & CONEXÕES LÓGICAS      */}
          {/* ============================================================== */}
          {activeTab === 'diagram' && (
            <div className="space-y-6">
              
              {/* Card de Destaque da Tese Central */}
              {activeTheme.mainPropExplanation && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-800/60 flex items-start space-x-2.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      Tese Central do Texto [P{mainProp}]:
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {activeTheme.mainPropExplanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Visualizador Gráfico SVG das Curvas de Discurso */}
              <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Diagrama de Curvas de Discurso (BibleArc)</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 italic hidden sm:inline">
                    * Curvas ilustram o fluxo de sustentação lógica
                  </span>
                </div>

                {/* SVG Canvas com scroll horizontal fluído */}
                <div className="relative w-full overflow-x-auto pb-4">
                  <svg className="w-full h-36 min-w-[580px]" viewBox="0 0 840 140">
                    <defs>
                      <marker id="arc-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                      </marker>
                    </defs>

                    {/* Linha de Base */}
                    <line x1="40" y1="120" x2="800" y2="120" stroke="#71717a" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />

                    {/* Desenho dos Arcos */}
                    {arcs.map((arc) => {
                      const step = 840 / (propositions.length + 1);
                      const x1 = arc.from * step;
                      const x2 = arc.to * step;
                      const dist = Math.abs(x2 - x1);
                      const height = Math.min(85, Math.max(30, dist * 0.35));
                      const midX = (x1 + x2) / 2;
                      const midY = 120 - height;

                      return (
                        <g key={arc.id}>
                          {/* Traçado Curvo do Arco */}
                          <path
                            d={`M ${x1} 120 Q ${midX} ${midY - 10} ${x2} 120`}
                            fill="none"
                            stroke={arc.color || '#6366f1'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.9"
                          />

                          {/* Badge Flutuante no Topo do Arco com Símbolo */}
                          <circle cx={midX} cy={midY - 5} r="11" fill="white" stroke={arc.color || '#6366f1'} strokeWidth="2" className="dark:fill-zinc-900" />
                          <text x={midX} y={midY - 1} textAnchor="middle" fill={arc.color || '#6366f1'} fontSize="9" fontWeight="bold">
                            {arc.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Pontos das Proposições na Linha de Base */}
                    {propositions.map((p) => {
                      const step = 840 / (propositions.length + 1);
                      const cx = p.number * step;
                      const isMain = p.number === mainProp;

                      return (
                        <g key={p.id}>
                          <circle
                            cx={cx}
                            cy="120"
                            r={isMain ? "12" : "9"}
                            fill={isMain ? "#f59e0b" : "#6366f1"}
                            stroke="white"
                            strokeWidth="2"
                            className="dark:stroke-zinc-900"
                          />
                          <text
                            x={cx}
                            y={isMain ? "124" : "123"}
                            textAnchor="middle"
                            fill="white"
                            fontSize={isMain ? "10" : "9"}
                            fontWeight="bold"
                          >
                            {p.number}
                          </text>
                          {isMain && (
                            <text x={cx} y="98" textAnchor="middle" fill="#f59e0b" fontSize="13">
                              ★
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Lista de Proposições com Texto Integral (Sem Truncamento) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  <span>Proposições do Discurso ({propositions.length})</span>
                  <span className="text-[11px] text-amber-500 font-semibold flex items-center">
                    <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                    P{mainProp} é a Tese Central
                  </span>
                </div>

                {propositions.map((p) => {
                  const isMain = p.number === mainProp;
                  return (
                    <div 
                      key={p.id} 
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isMain 
                          ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-800/70 shadow-2xs ring-1 ring-amber-400/40' 
                          : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Badge do Número da Proposição */}
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs ${
                          isMain 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {p.number}
                        </div>

                        {/* Texto Completo da Proposição */}
                        <div className="min-w-0 flex-1 space-y-1">
                          {isMain && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-300/40">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>Tese Central do Texto</span>
                            </span>
                          )}
                          <p className="text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-scripture leading-relaxed">
                            {p.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Relações & Conexões Lógicas Explicadas */}
              {arcs.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <GitCommit className="w-4 h-4 text-indigo-500" />
                    <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Relações de Discurso Mapeadas ({arcs.length})
                    </h5>
                  </div>
                  
                  <div className="space-y-2">
                    {arcs.map((arc) => (
                      <div key={arc.id} className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white shadow-2xs"
                            style={{ backgroundColor: arc.color || '#6366f1' }}
                          >
                            [P{arc.from}] ➔ [P{arc.to}]
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {arc.name} ({arc.label})
                          </span>
                        </div>
                        {arc.explanation && (
                          <p className="text-zinc-600 dark:text-zinc-400 pl-1 leading-relaxed">
                            ↳ {arc.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: SÍNTESE TEOLÓGICA                                       */}
          {/* ============================================================== */}
          {activeTab === 'synthesis' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>O Fluxo de Pensamento do Autor Sagrado</span>
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-indigo-950 dark:text-indigo-100">
                  {activeTheme.themeTitle}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Passagem analisada: <strong>{activeTheme.passage}</strong>
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Síntese Teológica & Argumentação Bíblica
                </span>
                <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-scripture whitespace-pre-line">
                  {activeTheme.theologicalSynthesis}
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 3: APLICAÇÃO PRÁTICA DEVOCIONAL                            */}
          {/* ============================================================== */}
          {activeTab === 'application' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                  <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <span>Como Isso Transforma Minha Vida Hoje</span>
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                  Aplicação Prática da Verdade
                </h4>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Diretrizes Devocionais para o Dia a Dia
                </span>
                <div className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-scripture whitespace-pre-line space-y-2">
                  {activeTheme.practicalApplication}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé Informativo */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-4 sm:px-6">
          <span className="text-[11px] truncate">
            {chapterStudy.chapterTitle} • Mapeamento de Discurso Bíblico
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors shrink-0"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
