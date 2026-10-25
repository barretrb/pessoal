import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Save, Sparkles, HelpCircle, Check, 
  GitCommit, Star, Copy, Share2, BookOpen, Layers, 
  ArrowLeft, ArrowRight, Compass, Lightbulb, ChevronRight, CheckCircle2
} from 'lucide-react';
import { BIBLE_ARC_RELATIONS } from '../data/bibleArcRelations';
import { storage } from '../services/storage';

// Exemplos didáticos consagrados na exegese bíblica
const PRESETS = [
  {
    id: 'lucas-11',
    name: 'Lucas 11:9-10 (A Oração Persistente)',
    passage: 'Lucas 11:9-10',
    propositions: [
      { id: 'p1', number: 1, text: 'Peçam, e lhes será dado;' },
      { id: 'p2', number: 2, text: 'busquem, e encontrarão;' },
      { id: 'p3', number: 3, text: 'batam, e a porta lhes será aberta.' },
      { id: 'p4', number: 4, text: 'Pois todo o que pede recebe;' },
      { id: 'p5', number: 5, text: 'o que busca encontra;' },
      { id: 'p6', number: 6, text: 'e, a quem bate, a porta será aberta.' }
    ],
    arcs: [
      { id: 'arc1', from: 1, to: 2, relation: 'progression', label: '+', name: 'Série / Progressão', color: '#6b7280' },
      { id: 'arc2', from: 2, to: 3, relation: 'progression', label: '+', name: 'Série / Progressão', color: '#6b7280' },
      { id: 'arc3', from: 4, to: 1, relation: 'ground', label: 'G', name: 'Causa / Fundamento (Ground)', color: '#3b82f6' }
    ],
    mainProp: 1,
    theologicalSynthesis: 'Jesus convoca os discípulos a uma postura ativa e ousada em oração (P1-P3), sustentando esse imperativo na certeza infalível do caráter do Pai Celeste, que invariavelmente acolhe e responde àquele que persevera (P4-P6).',
    practicalApplication: 'Perseverar em oração confiando no caráter generoso de Deus, sabendo que nenhuma oração sincera feita com fé é ignorada pelo Pai.'
  },
  {
    id: 'lucas-10',
    name: 'Lucas 10:2 (A Grande Seara e os Obreiros)',
    passage: 'Lucas 10:2',
    propositions: [
      { id: 'p1', number: 1, text: 'A colheita é grande,' },
      { id: 'p2', number: 2, text: 'mas os trabalhadores são poucos.' },
      { id: 'p3', number: 3, text: 'Peçam, pois, ao Senhor da colheita' },
      { id: 'p4', number: 4, text: 'que envie trabalhadores para a sua colheita.' }
    ],
    arcs: [
      { id: 'arc1', from: 1, to: 2, relation: 'contrast', label: 'Con', name: 'Contraste', color: '#dc2626' },
      { id: 'arc2', from: 2, to: 3, relation: 'ground', label: 'G', name: 'Causa / Fundamento (Ground)', color: '#3b82f6' },
      { id: 'arc3', from: 3, to: 4, relation: 'purpose', label: 'Pur', name: 'Propósito', color: '#059669' }
    ],
    mainProp: 3,
    theologicalSynthesis: 'A disparidade angustiante entre a amplitude da colheita e a escassez de ceifeiros (P1-P2) não deve gerar ativismo precipitado, mas conduzir a igreja à dependência em oração ao Senhor da seara (P3), para que Ele próprio suscite e comissione obreiros vocacionados (P4).',
    practicalApplication: 'A missão nasce de joelhos. Em vez de murmurar sobre a carência de voluntários, meu chamado prioritário é interceder fervorosamente para que o Senhor envie operários para a Sua colheita.'
  },
  {
    id: 'romanos-12',
    name: 'Romanos 12:1-2 (O Culto Racional)',
    passage: 'Romanos 12:1-2',
    propositions: [
      { id: 'p1', number: 1, text: 'Portanto, irmãos, rogo-lhes pelas misericórdias de Deus,' },
      { id: 'p2', number: 2, text: 'que se ofereçam em sacrifício vivo, santo e agradável a Deus, que é o seu culto racional.' },
      { id: 'p3', number: 3, text: 'Não se amoldem ao padrão deste mundo,' },
      { id: 'p4', number: 4, text: 'mas transformem-se pela renovação da sua mente,' },
      { id: 'p5', number: 5, text: 'para que experimentem a boa, agradável e perfeita vontade de Deus.' }
    ],
    arcs: [
      { id: 'arc1', from: 1, to: 2, relation: 'inference', label: '∴', name: 'Inferência / Conclusão', color: '#2563eb' },
      { id: 'arc2', from: 3, to: 4, relation: 'contrast', label: 'Con', name: 'Contraste', color: '#dc2626' },
      { id: 'arc3', from: 4, to: 5, relation: 'purpose', label: 'Pur', name: 'Propósito', color: '#059669' }
    ],
    mainProp: 2,
    theologicalSynthesis: 'Como resposta de gratidão à grandiosa obra redentora de Deus (P1), o apóstolo convoca à consagração integral da vida (P2), rejeitando o conformismo cultural (P3) e permitindo a renovação interior pelo Espírito (P4) a fim de comprovar experimentalmente a boa vontade divina (P5).',
    practicalApplication: 'Viver cada atividade diária como ato de adoração, vigiando atentamente os hábitos e conteúdos que consumo para não amoldar meu coração aos padrões passageiros deste mundo.'
  }
];

export default function BibleArcModal({ isOpen, onClose, initialPassage, initialText }) {
  if (!isOpen) return null;

  // Quebra inicial do texto em proposições lógicas
  const createInitialPropositions = () => {
    if (!initialText) return PRESETS[0].propositions;

    const parts = initialText
      .split(/(?<=[.;!?:])\s+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (parts.length === 0) return PRESETS[0].propositions;

    return parts.map((text, idx) => ({
      id: `p${idx + 1}`,
      number: idx + 1,
      text
    }));
  };

  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'analysis' | 'result'
  const [passageName, setPassageName] = useState(initialPassage || 'Lucas 11:9-10');
  const [title, setTitle] = useState(initialPassage ? `Arqueamento: ${initialPassage}` : 'Estudo de Arqueamento (BibleArc)');
  const [propositions, setPropositions] = useState(createInitialPropositions);
  const [arcs, setArcs] = useState(initialText ? [] : PRESETS[0].arcs);
  const [mainProp, setMainProp] = useState(1);
  const [theologicalSynthesis, setTheologicalSynthesis] = useState(initialText ? '' : PRESETS[0].theologicalSynthesis);
  const [practicalApplication, setPracticalApplication] = useState(initialText ? '' : PRESETS[0].practicalApplication);

  // Controle de adição de arco
  const [fromProp, setFromProp] = useState(1);
  const [toProp, setToProp] = useState(2);
  const [selectedRelation, setSelectedRelation] = useState(BIBLE_ARC_RELATIONS[0].relations[0]);

  // Nova proposição avulsa
  const [newPropInput, setNewPropInput] = useState('');

  // Estados visuais
  const [showHelper, setShowHelper] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Atualiza seleção caso proposições mudem
  useEffect(() => {
    if (propositions.length > 0) {
      if (fromProp > propositions.length) setFromProp(1);
      if (toProp > propositions.length) setToProp(Math.min(2, propositions.length));
      if (!propositions.some(p => p.number === mainProp)) {
        setMainProp(propositions[0].number);
      }
    }
  }, [propositions]);

  // Tecla Escape para voltar/fechar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Carregar Preset
  const handleLoadPreset = (preset) => {
    setPassageName(preset.passage);
    setTitle(`Arqueamento: ${preset.passage}`);
    setPropositions(preset.propositions);
    setArcs(preset.arcs);
    setMainProp(preset.mainProp);
    setTheologicalSynthesis(preset.theologicalSynthesis);
    setPracticalApplication(preset.practicalApplication);
  };

  // Adicionar novo arco
  const handleAddArc = () => {
    if (fromProp === toProp) return;
    const newArc = {
      id: `arc_${Date.now()}`,
      from: fromProp,
      to: toProp,
      relation: selectedRelation.id,
      label: selectedRelation.symbol,
      color: selectedRelation.color,
      name: selectedRelation.name
    };
    setArcs([...arcs, newArc]);
  };

  // Excluir arco
  const handleDeleteArc = (arcId) => {
    setArcs(arcs.filter(a => a.id !== arcId));
  };

  // Adicionar proposição
  const handleAddProposition = () => {
    if (!newPropInput.trim()) return;
    const nextNumber = propositions.length + 1;
    const newP = {
      id: `p${Date.now()}`,
      number: nextNumber,
      text: newPropInput.trim()
    };
    setPropositions([...propositions, newP]);
    setNewPropInput('');
  };

  // Excluir proposição
  const handleDeleteProposition = (propNumber) => {
    if (propositions.length <= 1) return;
    const filtered = propositions.filter(p => p.number !== propNumber);
    // Renumerar proposições
    const renumbered = filtered.map((p, idx) => ({ ...p, number: idx + 1 }));
    setPropositions(renumbered);
    // Limpar arcos associados
    setArcs(arcs.filter(a => a.from !== propNumber && a.to !== propNumber));
    if (mainProp === propNumber) setMainProp(1);
  };

  // Gerador automático de rascunho de síntese teológica
  const handleAutoGenerateSynthesis = () => {
    const mainP = propositions.find(p => p.number === mainProp);
    if (!mainP) return;

    // Encontra razões e propósitos conectados
    const grounds = arcs
      .filter(a => a.relation === 'ground' && (a.to === mainProp || a.from === mainProp))
      .map(a => {
        const otherNumber = a.from === mainProp ? a.to : a.from;
        const otherP = propositions.find(p => p.number === otherNumber);
        return otherP ? `[P${otherNumber}] "${otherP.text}"` : '';
      })
      .filter(Boolean);

    const purposes = arcs
      .filter(a => a.relation === 'purpose' && (a.from === mainProp || a.to === mainProp))
      .map(a => {
        const otherNumber = a.from === mainProp ? a.to : a.from;
        const otherP = propositions.find(p => p.number === otherNumber);
        return otherP ? `[P${otherNumber}] "${otherP.text}"` : '';
      })
      .filter(Boolean);

    let draft = `A proposição central deste trecho bíblico é a [P${mainProp}]: "${mainP.text}".\n\n`;

    if (grounds.length > 0) {
      draft += `O autor fundamenta essa declaração na causa/fundamento expressa em ${grounds.join(', ')}.\n\n`;
    }

    if (purposes.length > 0) {
      draft += `Essa ação tem como objetivo e propósito direto alcançar o que está declarado em ${purposes.join(', ')}.\n\n`;
    }

    draft += `Em síntese: O argumento bíblico se move em direção à verdade central de [P${mainProp}], convocando o leitor a firmar sua convicção nessa revelação divina.`;

    setTheologicalSynthesis(draft);
  };

  // Salvar no LocalStorage
  const handleSave = () => {
    storage.saveBibleArc({
      title,
      passage: passageName,
      propositions,
      arcs,
      mainProp,
      theologicalSynthesis,
      practicalApplication
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Copiar Análise Completa em Texto
  const handleCopyFullStudy = () => {
    const mainP = propositions.find(p => p.number === mainProp);

    let report = `📐 ESTUDO DE ARQUEAMENTO BÍBLICO (BIBLE-ARC)\n`;
    report += `Passagem: ${passageName}\n`;
    report += `Título: ${title}\n\n`;

    report += `🌟 1. PROPOSIÇÃO CENTRAL (TESE DO AUTOR):\n`;
    report += mainP ? `[P${mainP.number}] "${mainP.text}"\n\n` : `Não definida\n\n`;

    report += `📜 2. PROPOSIÇÕES DO DISCURSO:\n`;
    propositions.forEach(p => {
      const isMain = p.number === mainProp;
      report += `[P${p.number}]${isMain ? ' ⭐ (Central)' : ''} ${p.text}\n`;
    });
    report += `\n`;

    report += `🔗 3. RELAÇÕES LÓGICAS (ARCOS):\n`;
    if (arcs.length === 0) {
      report += `Nenhum arco traçado.\n`;
    } else {
      arcs.forEach(a => {
        report += `• P${a.from} ➔ P${a.to}: ${a.name} [Símbolo: ${a.label}]\n`;
      });
    }
    report += `\n`;

    report += `📊 4. RESULTADO & SÍNTESE TEOLÓGICA:\n`;
    report += `${theologicalSynthesis || 'Não preenchida.'}\n\n`;

    report += `🙏 5. APLICAÇÃO PRÁTICA DEVOCIONAL:\n`;
    report += `${practicalApplication || 'Não preenchida.'}\n`;

    navigator.clipboard.writeText(report);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        
        {/* Cabeçalho */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-850 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden min-w-0">
            {/* Botão Voltar Destacado */}
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-200/90 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-xs font-bold transition-colors flex-shrink-0"
              title="Voltar ao leitor bíblico"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
              ⌒
            </div>

            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-xs sm:text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 focus:outline-hidden truncate w-full"
              />
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {passageName} • Análise de Discurso
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="p-1.5 sm:p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Como Funciona o BibleArc?"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={handleCopyFullStudy}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
              title="Copiar Estudo Completo"
            >
              {copiedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
              <span>{copiedSuccess ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleSave}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Salvo!' : 'Salvar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Navegação por Abas Principais */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900 px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'diagram'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Diagrama & Arcos</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                {arcs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'analysis'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>2. Análise Lógica do Fluxo</span>
            </button>

            <button
              onClick={() => setActiveTab('result')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'result'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>3. Resultado & Aplicação</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>

          {/* Seletor Rápido de Exemplos / Presets */}
          <div className="hidden md:flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Carregar Exemplo:
            </span>
            <div className="flex space-x-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 transition-colors"
                >
                  {preset.passage}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guia Explicativo Didático do Método */}
        {showHelper && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border-b border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-bold text-sm text-indigo-900 dark:text-indigo-100 flex items-center space-x-2 mb-2">
                  <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>O Que É o Arqueamento (BibleArc) e Como Interpretar?</span>
                </h5>
                <p className="leading-relaxed mb-3 text-zinc-700 dark:text-zinc-300">
                  O arqueamento bíblico é uma ferramenta de <strong>exegese e análise de discurso</strong> desenvolvida por Thomas Schreiner e popularizada por John Piper. 
                  O objetivo principal não é apenas desenhar arcos, mas <strong>encontrar o Ponto Central do Autor</strong> (a ideia dominante) e entender como todas as outras orações a sustentam ou explicam.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">1. Proposições</span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">Isolar cada verbo e oração com significado independente.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">2. Conexões Lógicas</span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">Identificar relações: Causa (G), Propósito (Pur), Contraste (Con), etc.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-amber-600 dark:text-amber-400">3. Proposição Central</span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">Definir o mandamento, tese ou promessa principal do trecho.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">4. Resultado & Aplicação</span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">Escrever a síntese teológica e como isso transforma sua conduta hoje.</p>
                  </div>
                </div>
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

        {/* Conteúdo Dinâmico por Aba */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ============================================================== */}
          {/* ABA 1: DIAGRAMA & ARCOS                                       */}
          {/* ============================================================== */}
          {activeTab === 'diagram' && (
            <div className="space-y-6">
              
              {/* Banner Didático de Inicialização em Mobile */}
              <div className="flex sm:hidden items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">Exemplos Prontos:</span>
                <div className="flex space-x-1">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleLoadPreset(p)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 text-white"
                    >
                      {p.passage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualizador Gráfico SVG de Arcos */}
              <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Diagrama de Curvas de Discurso (BibleArc)</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 italic hidden sm:inline">
                    * Proposição Central marcada com estrela dourada
                  </span>
                </div>

                {/* SVG Canvas com scroll horizontal seguro */}
                <div className="relative w-full overflow-x-auto pb-4">
                  <svg className="w-full h-40 min-w-[620px]" viewBox="0 0 840 150">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                      </marker>
                    </defs>

                    {/* Desenho dos Arcos */}
                    {arcs.map((arc) => {
                      const step = 840 / (propositions.length + 1);
                      const x1 = arc.from * step;
                      const x2 = arc.to * step;
                      const dist = Math.abs(x2 - x1);
                      const height = Math.min(110, Math.max(35, dist * 0.38));
                      const midX = (x1 + x2) / 2;
                      const midY = 130 - height;

                      return (
                        <g key={arc.id} className="group cursor-pointer">
                          {/* Curva de Bézier Quadrática */}
                          <path
                            d={`M ${x1} 130 Q ${midX} ${130 - height * 1.6} ${x2} 130`}
                            fill="none"
                            stroke={arc.color || '#6366f1'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="transition-all hover:stroke-width-3"
                          />
                          {/* Badge da Relação no Vértice da Curva */}
                          <circle cx={midX} cy={midY} r="15" fill="white" stroke={arc.color || '#6366f1'} strokeWidth="2.5" />
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

                    {/* Linha de Base */}
                    <line x1="20" y1="130" x2="820" y2="130" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Marcadores de Proposição */}
                    {propositions.map((p, idx) => {
                      const step = 840 / (propositions.length + 1);
                      const x = (idx + 1) * step;
                      const isMain = p.number === mainProp;

                      return (
                        <g key={p.id}>
                          {/* Círculo da Proposição */}
                          <circle 
                            cx={x} 
                            cy="130" 
                            r={isMain ? "12" : "9"} 
                            fill={isMain ? "#f59e0b" : "#4f46e5"} 
                            stroke="white"
                            strokeWidth="2"
                          />
                          <text 
                            x={x} 
                            y="134" 
                            textAnchor="middle" 
                            fontSize={isMain ? "11" : "10"} 
                            fill="white" 
                            fontWeight="bold"
                          >
                            {p.number}
                          </text>
                          {/* Badge de Tese Central no SVG se for o caso */}
                          {isMain && (
                            <text 
                              x={x} 
                              y="112" 
                              textAnchor="middle" 
                              fontSize="11" 
                              fill="#f59e0b"
                            >
                              ★
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Lista de Proposições Numeradas com Seleção da Tese Central */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wide">
                    <span>Proposições do Discurso ({propositions.length})</span>
                    <span className="text-[11px] text-zinc-400 font-normal">
                      Clique na estrela para definir a Proposição Central
                    </span>
                  </div>

                  {propositions.map((p) => {
                    const isMain = p.number === mainProp;
                    return (
                      <div 
                        key={p.id} 
                        className={`flex items-start space-x-3 p-3 rounded-2xl border transition-all ${
                          isMain 
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs ring-1 ring-amber-400/30' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/60 shadow-2xs'
                        }`}
                      >
                        {/* Botão de Estrela (Proposição Central) */}
                        <button
                          onClick={() => setMainProp(p.number)}
                          className={`p-1 rounded-lg transition-colors flex-shrink-0 mt-0.5 ${
                            isMain 
                              ? 'text-amber-500 hover:text-amber-600' 
                              : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-500'
                          }`}
                          title={isMain ? "Proposição Central (Tese do Autor)" : "Marcar como Proposição Central"}
                        >
                          <Star className={`w-5 h-5 ${isMain ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>

                        {/* Indicador de Número */}
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${
                          isMain ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                        }`}>
                          {p.number}
                        </span>

                        {/* Campo de Texto Editável da Proposição */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={p.text}
                            onChange={(e) => {
                              const updated = propositions.map(item => item.id === p.id ? { ...item, text: e.target.value } : item);
                              setPropositions(updated);
                            }}
                            className="w-full text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 bg-transparent border-0 focus:outline-hidden font-medium"
                          />
                          {isMain && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                              ★ Tese Central do Texto
                            </span>
                          )}
                        </div>

                        {/* Excluir Proposição */}
                        {propositions.length > 1 && (
                          <button
                            onClick={() => handleDeleteProposition(p.number)}
                            className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                            title="Remover proposição"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Adicionar Nova Proposição */}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="Adicionar nova proposição textual..."
                      value={newPropInput}
                      onChange={(e) => setNewPropInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddProposition();
                      }}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <button
                      onClick={handleAddProposition}
                      disabled={!newPropInput.trim()}
                      className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 dark:hover:bg-zinc-600 disabled:opacity-50 text-white text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Construtor de Arcos Lógicos */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-4 bg-white dark:bg-zinc-850">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                    <GitCommit className="w-4 h-4 text-indigo-500" />
                    <span>Conectar Novo Arco Lógico</span>
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    Defina a relação entre duas orações
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Da Proposição (Origem)
                    </label>
                    <select
                      value={fromProp}
                      onChange={(e) => setFromProp(Number(e.target.value))}
                      className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      {propositions.map(p => (
                        <option key={p.id} value={p.number}>
                          P{p.number}: {p.text.slice(0, 32)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Para a Proposição (Destino)
                    </label>
                    <select
                      value={toProp}
                      onChange={(e) => setToProp(Number(e.target.value))}
                      className="w-full text-xs font-medium p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      {propositions.map(p => (
                        <option key={p.id} value={p.number}>
                          P{p.number}: {p.text.slice(0, 32)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      Relação de Discurso
                    </label>
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

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    <strong>{selectedRelation.name} ({selectedRelation.symbol}):</strong> {selectedRelation.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleAddArc}
                    disabled={fromProp === toProp}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Arco (P{fromProp} ➔ P{toProp})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Ver Análise Lógica do Fluxo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lista de Arcos Criados */}
              {arcs.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                    Arcos Definidos ({arcs.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {arcs.map(arc => (
                      <div
                        key={arc.id}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs"
                      >
                        <span 
                          className="font-bold px-1.5 py-0.5 rounded-md text-white text-[10px]"
                          style={{ backgroundColor: arc.color || '#6366f1' }}
                        >
                          {arc.label}
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          P{arc.from} ➔ P{arc.to}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          ({arc.name || arc.relation})
                        </span>
                        <button
                          onClick={() => handleDeleteArc(arc.id)}
                          className="text-zinc-400 hover:text-red-500 p-0.5 transition-colors"
                          title="Excluir este arco"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 2: ANÁLISE LÓGICA DO FLUXO                                 */}
          {/* ============================================================== */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-start space-x-3">
                <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-indigo-950 dark:text-indigo-200">
                  <h5 className="font-bold text-sm mb-1">Como Decodificar o Fluxo de Argumentação?</h5>
                  <p>
                    Abaixo está a interpretação do raciocínio bíblico estruturado pelas conexões que você fez.
                    Cada arco responde à pergunta: <em>"Por que o autor disse isso?"</em> ou <em>"Qual o impacto dessa declaração?"</em>.
                  </p>
                </div>
              </div>

              {/* Relação da Tese Central com as Demais */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Proposição Central Mestra (A Tese do Texto)
                  </h4>
                </div>

                {(() => {
                  const main = propositions.find(p => p.number === mainProp);
                  return (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                        <span>Ponto Culminante: Proposição {main?.number}</span>
                      </div>
                      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 italic">
                        "{main?.text}"
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                        Esta é a declaração central que governa as demais orações do parágrafo. Todas as outras proposições funcionam como apoio (Causa), desdobramento (Propósito/Resultado) ou contraste.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Tabela Explicativa do Fluxo Passo a Passo */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Decodificação Passo a Passo das Relações ({arcs.length} arcos)
                </h4>

                {arcs.length === 0 ? (
                  <div className="text-center py-8 p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500">
                      Nenhum arco foi traçado ainda. Volte para a aba <strong>1. Diagrama & Arcos</strong> e conecte as proposições para ver a análise lógica aqui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {arcs.map((arc, idx) => {
                      const pFrom = propositions.find(p => p.number === arc.from);
                      const pTo = propositions.find(p => p.number === arc.to);

                      // Explicação em linguagem natural
                      let explanation = '';
                      switch (arc.relation) {
                        case 'ground':
                          explanation = `A Proposição [P${arc.from}] serve de causa, razão e fundamento ('porque') para sustentar a verdade afirmada em [P${arc.to}].`;
                          break;
                        case 'inference':
                          explanation = `A Proposição [P${arc.to}] é uma dedução ou conclusão necessária ('portanto') decorrente da premissa estabelecida em [P${arc.from}].`;
                          break;
                        case 'purpose':
                          explanation = `A ação declarada em [P${arc.from}] tem como intenção, alvo e propósito ('para que') alcançar [P${arc.to}].`;
                          break;
                        case 'result':
                          explanation = `A ação de [P${arc.from}] produz como efeito concreto ('de modo que') o estado descrito em [P${arc.to}].`;
                          break;
                        case 'contrast':
                          explanation = `O autor estabelece uma oposição direta ('mas / contudo') entre a realidade de [P${arc.from}] e a de [P${arc.to}].`;
                          break;
                        case 'condition':
                          explanation = `A realização de [P${arc.to}] está estritamente subordinada à condição ('se') de [P${arc.from}].`;
                          break;
                        case 'progression':
                          explanation = `[P${arc.from}] e [P${arc.to}] compõem uma série progressiva ou sequência cumulativa de ações.`;
                          break;
                        case 'explanation':
                          explanation = `[P${arc.to}] esclarece, define e amplia os detalhes do que foi anunciado em [P${arc.from}].`;
                          break;
                        default:
                          explanation = `Relação de ${arc.name} entre as duas proposições.`;
                      }

                      return (
                        <div 
                          key={arc.id}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span 
                                className="px-2 py-0.5 rounded-lg text-white font-bold text-xs"
                                style={{ backgroundColor: arc.color || '#6366f1' }}
                              >
                                {arc.label}
                              </span>
                              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                {arc.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              Passo {idx + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">Origem [P{arc.from}]:</span>
                              <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">"{pFrom?.text}"</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase">Destino [P{arc.to}]:</span>
                              <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">"{pTo?.text}"</p>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-300 italic pt-1 border-t border-zinc-100 dark:border-zinc-700/50">
                            💡 <strong>Significado Lógico:</strong> {explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botão de Avanço para a Conclusão */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('result')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Avançar para o Resultado & Aplicação</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* ABA 3: RESULTADO & APLICAÇÃO                                   */}
          {/* ============================================================== */}
          {activeTab === 'result' && (
            <div className="space-y-6">
              
              {/* Card de Destaque da Tese */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>1. A Tese Central Identificada pelo Arqueamento</span>
                </div>
                {(() => {
                  const main = propositions.find(p => p.number === mainProp);
                  return (
                    <div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        "{main?.text}"
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Passagem: <strong>{passageName}</strong> | Proposição {main?.number} de {propositions.length}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* 2. Síntese Teológica / Ideia Central Exegética */}
              <div className="space-y-3 bg-white dark:bg-zinc-850 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>2. Resultado Exegético (A Ideia Central Sintetizada)</span>
                  </label>
                  <button
                    onClick={handleAutoGenerateSynthesis}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[11px] font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Rascunho Lógico</span>
                  </button>
                </div>
                
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Escreva em uma frase ou pequeno parágrafo o que o autor quer comunicar em todo o trecho, sintetizando as relações lógicas:
                </p>

                <textarea
                  rows={4}
                  value={theologicalSynthesis}
                  onChange={(e) => setTheologicalSynthesis(e.target.value)}
                  placeholder="Ex: Jesus ordena aos discípulos uma busca persistente em oração (P1-P3), porque o Pai Celestial é bom e atende fielmente àqueles que perseveram batendo à porta (P4-P6)..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* 3. Aplicação Pessoal e Prática Devocional */}
              <div className="space-y-3 bg-white dark:bg-zinc-850 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>3. Aplicação Prática Devocional (O Fruto do Estudo)</span>
                </label>
                
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  O objetivo final de entender o raciocínio sagrado é transformar o coração e a conduta. Como você deve agir hoje à luz dessa verdade?
                </p>

                <textarea
                  rows={3}
                  value={practicalApplication}
                  onChange={(e) => setPracticalApplication(e.target.value)}
                  placeholder="Ex: Como devo orar hoje? Em quais áreas da minha rotina preciso perseverar e abandonar o desânimo?..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Ações Finais: Copiar e Salvar */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-750 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Estudo completo: Diagrama + Análise + Resultado + Aplicação</span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleCopyFullStudy}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors shadow-2xs"
                  >
                    {copiedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                    <span>{copiedSuccess ? 'Estudo Copiado!' : 'Copiar Estudo Completo'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{savedSuccess ? 'Estudo Salvo!' : 'Salvar no Histórico'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Rodapé Fixo com Botão Voltar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-zinc-200/90 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Texto Bíblico</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Salvo!' : 'Salvar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}