import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Download, Sparkles, HelpCircle, Check, GitCommit } from 'lucide-react';
import { BIBLE_ARC_RELATIONS } from '../data/bibleArcRelations';
import { storage } from '../services/storage';

export default function BibleArcModal({ isOpen, onClose, initialPassage, initialText }) {
  if (!isOpen) return null;

  // Quebra inicial do texto em proposições lógicas (por vírgula, ponto e vírgula ou ponto)
  const defaultPropositions = initialText 
    ? initialText
        .split(/(?<=[.;!?:])\s+/)
        .filter(t => t.trim().length > 0)
        .map((text, idx) => ({ id: `p${idx + 1}`, number: idx + 1, text: text.trim() }))
    : [
        { id: 'p1', number: 1, text: 'Peçam, e lhes será dado;' },
        { id: 'p2', number: 2, text: 'busquem, e encontrarão;' },
        { id: 'p3', number: 3, text: 'batam, e a porta lhes será aberta.' },
        { id: 'p4', number: 4, text: 'Pois todo o que pede recebe;' },
        { id: 'p5', number: 5, text: 'o que busca encontra;' },
        { id: 'p6', number: 6, text: 'e, a quem bate, a porta será aberta.' }
      ];

  const [title, setTitle] = useState(initialPassage ? `Arqueamento: ${initialPassage}` : 'Estudo de Arqueamento (BibleArc)');
  const [propositions, setPropositions] = useState(defaultPropositions);
  const [arcs, setArcs] = useState([
    // Arcos de exemplo inicial
    { id: 'arc1', from: 1, to: 3, relation: 'progression', label: '+' },
    { id: 'arc2', from: 4, to: 1, relation: 'ground', label: 'G' }
  ]);
  const [fromProp, setFromProp] = useState(1);
  const [toProp, setToProp] = useState(2);
  const [selectedRelation, setSelectedRelation] = useState(BIBLE_ARC_RELATIONS[0].relations[0]);
  const [showHelper, setShowHelper] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Adicionar novo arco
  const handleAddArc = () => {
    if (fromProp === toProp) return;
    const newArc = {
      id: `arc_${Date.now()}`,
      from: Math.min(fromProp, toProp),
      to: Math.max(fromProp, toProp),
      relation: selectedRelation.id,
      label: selectedRelation.symbol,
      color: selectedRelation.color,
      name: selectedRelation.name
    };
    setArcs([...arcs, newArc]);
  };

  const handleDeleteArc = (arcId) => {
    setArcs(arcs.filter(a => a.id !== arcId));
  };

  const handleSave = () => {
    storage.saveBibleArc({
      title,
      passage: initialPassage || 'Lucas',
      propositions,
      arcs
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              ⌒
            </div>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-lg text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 focus:outline-hidden"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Técnica de Arqueamento de John Piper (Análise Lógica e Exegética de Discurso)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Ajuda do BibleArc"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Salvo!' : 'Salvar Estudo'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Guia Explicativo Rápido */}
        {showHelper && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200">
            <h5 className="font-bold mb-1">Como funciona o Arqueamento do John Piper?</h5>
            <p className="leading-relaxed">
              1. <strong>Divida o texto em proposições:</strong> Cada oração ou ideia central recebe um número.<br />
              2. <strong>Trace os arcos:</strong> Conecte as proposições estabelecendo a relação de sentido entre elas.<br />
              3. <strong>Classifique as relações lógicas:</strong> Mostre se uma proposição é a <em>Causa (Ground)</em>, a <em>Consequência (Inference)</em>, o <em>Propósito</em>, ou o <em>Contraste</em> da outra. Isso revela a mente do autor sagrado!
            </p>
          </div>
        )}

        {/* Corpo Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. VISUALIZADOR DE ARCOS SVG */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Diagrama de Arcos (Visualização do Argumento)
            </div>

            {/* SVG Canvas de Arcos */}
            <div className="relative w-full overflow-x-auto pb-4">
              <svg className="w-full h-36 min-w-[600px]" viewBox="0 0 800 140">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                  </marker>
                </defs>

                {/* Desenho dos Arcos */}
                {arcs.map((arc, i) => {
                  const step = 800 / (propositions.length + 1);
                  const x1 = arc.from * step;
                  const x2 = arc.to * step;
                  const dist = Math.abs(x2 - x1);
                  const height = Math.min(100, Math.max(30, dist * 0.35));
                  const midX = (x1 + x2) / 2;
                  const midY = 120 - height;

                  return (
                    <g key={arc.id} className="group">
                      {/* Curva do Arco */}
                      <path
                        d={`M ${x1} 120 Q ${midX} ${120 - height * 1.6} ${x2} 120`}
                        fill="none"
                        stroke={arc.color || '#6366f1'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all"
                      />
                      {/* Badge da Relação no Vértice do Arco */}
                      <circle cx={midX} cy={midY} r="14" fill="white" stroke={arc.color || '#6366f1'} strokeWidth="2" />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={arc.color || '#6366f1'}
                      >
                        {arc.label || 'G'}
                      </text>
                    </g>
                  );
                })}

                {/* Linha de Base e Marcadores de Proposição */}
                <line x1="0" y1="120" x2="800" y2="120" stroke="#cbd5e1" strokeWidth="2" />
                {propositions.map((p, idx) => {
                  const step = 800 / (propositions.length + 1);
                  const x = (idx + 1) * step;
                  return (
                    <g key={p.id}>
                      <circle cx={x} cy="120" r="8" fill="#4f46e5" />
                      <text x={x} y="124" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                        {p.number}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Lista de Proposições Numeradas */}
            <div className="space-y-3 mt-4">
              {propositions.map((p) => (
                <div key={p.id} className="flex items-start space-x-3 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {p.number}
                  </span>
                  <input
                    type="text"
                    value={p.text}
                    onChange={(e) => {
                      const updated = propositions.map(item => item.id === p.id ? { ...item, text: e.target.value } : item);
                      setPropositions(updated);
                    }}
                    className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 bg-transparent border-0 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* 2. CONSTRUTOR DE ARCOS (Criar nova relação lógica) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 bg-white dark:bg-zinc-850">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <GitCommit className="w-4 h-4 text-indigo-500" />
              <span>Conectar Novo Arco Lógico</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Da Proposição</label>
                <select
                  value={fromProp}
                  onChange={(e) => setFromProp(Number(e.target.value))}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {propositions.map(p => (
                    <option key={p.id} value={p.number}>Proposição {p.number}: {p.text.slice(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Para a Proposição</label>
                <select
                  value={toProp}
                  onChange={(e) => setToProp(Number(e.target.value))}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {propositions.map(p => (
                    <option key={p.id} value={p.number}>Proposição {p.number}: {p.text.slice(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Relação Discursiva</label>
                <select
                  value={selectedRelation.id}
                  onChange={(e) => {
                    for (const cat of BIBLE_ARC_RELATIONS) {
                      const rel = cat.relations.find(r => r.id === e.target.value);
                      if (rel) {
                        setSelectedRelation(rel);
                        break;
                      }
                    }
                  }}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  {BIBLE_ARC_RELATIONS.map(cat => (
                    <optgroup key={cat.category} label={cat.category}>
                      {cat.relations.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.symbol} - {r.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              {selectedRelation.description}
            </p>

            <button
              onClick={handleAddArc}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Arco ({fromProp} ➔ {toProp})</span>
            </button>
          </div>

          {/* 3. LISTA DE ARCOS CRIADOS */}
          {arcs.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Arcos Definidos ({arcs.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {arcs.map(arc => (
                  <div
                    key={arc.id}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      [{arc.from} ➔ {arc.to}]
                    </span>
                    <span>{arc.label} ({arc.relation})</span>
                    <button
                      onClick={() => handleDeleteArc(arc.id)}
                      className="text-zinc-400 hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
