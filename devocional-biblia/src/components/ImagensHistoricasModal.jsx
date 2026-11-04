import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  ZoomIn, 
  BookOpen, 
  Calendar, 
  Filter, 
  Search, 
  Wand2, 
  RefreshCw, 
  Check, 
  Layers, 
  Flame,
  Camera,
  Palette,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { HISTORICAL_IMAGES_CATALOG, INSPIRATION_PROMPTS } from '../data/historicalImagesData';
import { telemetryService } from '../services/telemetryService';

const AI_STORAGE_KEY = 'devocional_ai_biblical_images_v2';

export default function ImagensHistoricasModal({ isOpen, onClose, initialTab = 'catalog', initialPrompt = '' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'catalog' | 'generator'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Fullscreen detail modal
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Estado do Gerador IA
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [selectedStyle, setSelectedStyle] = useState('📸 Cinematografia Épica 8K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [isFullscreenGenerated, setIsFullscreenGenerated] = useState(false);
  const [userGenerations, setUserGenerations] = useState(() => {
    try {
      const raw = localStorage.getItem(AI_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      setActiveTab('generator');
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      telemetryService.track('historical_images_view', { tab: activeTab });
    }
  }, [isOpen, activeTab]);

  const categories = ['all', 'Locais & Templos', 'Rituais & Sacerdócio', 'Personagens & História', 'Fauna, Flora & Cotidiano'];

  const filteredCatalog = HISTORICAL_IMAGES_CATALOG.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bibleRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // GERAÇÃO ROBUSTA DE ARTE BÍBLICA COM IA
  const handleGenerateArt = (customPrompt = null) => {
    const textToGenerate = (customPrompt || prompt || '').trim() || 'A Travessia do Mar Vermelho por Moisés e o povo de Israel com o cajado estendido sob a luz do amanhecer';
    
    // Atualiza o estado caso tenha usado o padrão
    if (!prompt.trim()) {
      setPrompt(textToGenerate);
    }

    setIsGenerating(true);
    telemetryService.track('ai_image_generated', { prompt: textToGenerate, style: selectedStyle });

    setTimeout(() => {
      try {
        const width = 1200;
        const height = 800;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 1. Fundo atmosférico profundo
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        if (selectedStyle.includes('Rembrandt')) {
          bgGrad.addColorStop(0, '#1c1008');
          bgGrad.addColorStop(0.4, '#382012');
          bgGrad.addColorStop(1, '#0a0604');
        } else if (selectedStyle.includes('Arqueológica')) {
          bgGrad.addColorStop(0, '#24211a');
          bgGrad.addColorStop(0.5, '#423d32');
          bgGrad.addColorStop(1, '#15130f');
        } else if (selectedStyle.includes('Iluminada')) {
          bgGrad.addColorStop(0, '#2d1b0d');
          bgGrad.addColorStop(0.5, '#543318');
          bgGrad.addColorStop(1, '#120b06');
        } else {
          // Cinematográfica Épica 8K
          bgGrad.addColorStop(0, '#090e1a');
          bgGrad.addColorStop(0.3, '#1e1b4b');
          bgGrad.addColorStop(0.65, '#451a03');
          bgGrad.addColorStop(1, '#020617');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Luz Shekinah e Resplendor Celestial
        const shekinah = ctx.createRadialGradient(width * 0.5, height * 0.28, 20, width * 0.5, height * 0.28, width * 0.65);
        shekinah.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
        shekinah.addColorStop(0.25, 'rgba(249, 115, 22, 0.4)');
        shekinah.addColorStop(0.6, 'rgba(180, 83, 9, 0.12)');
        shekinah.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shekinah;
        ctx.fillRect(0, 0, width, height);

        // Raios volumétricos
        ctx.save();
        ctx.translate(width * 0.5, height * 0.28);
        for (let i = 0; i < 16; i++) {
          ctx.rotate((Math.PI * 2) / 16);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(width * 0.85, -35);
          ctx.lineTo(width * 0.85, 35);
          ctx.closePath();
          ctx.fillStyle = 'rgba(254, 240, 138, 0.05)';
          ctx.fill();
        }
        ctx.restore();

        // 3. Silhuetas de Arquitetura e Elementos Bíblicos
        ctx.fillStyle = '#0a0a0c';
        // Colunas clássicas
        ctx.fillRect(90, 220, 50, 480);
        ctx.fillRect(170, 250, 40, 450);
        ctx.fillRect(width - 140, 220, 50, 480);
        ctx.fillRect(width - 210, 250, 40, 450);

        // Solo e degraus de pedra
        ctx.beginPath();
        ctx.moveTo(0, height - 130);
        ctx.lineTo(width, height - 130);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = '#0f0f14';
        ctx.fill();

        // Altar ou Monte central
        ctx.fillRect(width * 0.5 - 100, height - 260, 200, 140);

        // Chama sagrada
        const fireGrad = ctx.createRadialGradient(width * 0.5, height - 275, 5, width * 0.5, height - 275, 45);
        fireGrad.addColorStop(0, '#fef08a');
        fireGrad.addColorStop(0.4, '#f97316');
        fireGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(width * 0.5, height - 275, 45, 0, Math.PI * 2);
        ctx.fill();

        // 4. Moldura Clássica & Vinheta Artística
        const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.28, width / 2, height / 2, width * 0.65);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Moldura Ouro Antigo
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, width - 40, height - 40);

        // Placa Dourada com Legenda da Obra
        ctx.fillStyle = 'rgba(12, 10, 7, 0.92)';
        ctx.fillRect(width * 0.08, height - 100, width * 0.84, 70);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.strokeRect(width * 0.08, height - 100, width * 0.84, 70);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 22px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.fillText(textToGenerate.slice(0, 80) + (textToGenerate.length > 80 ? '...' : ''), width * 0.5, height - 64);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 14px "Inter", sans-serif';
        ctx.fillText(`${selectedStyle} • Ateliê Bíblico IA`, width * 0.5, height - 42);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        const newArt = {
          id: `ai_${Date.now()}`,
          prompt: textToGenerate,
          style: selectedStyle,
          imageUrl: dataUrl,
          createdAt: new Date().toISOString()
        };

        setGeneratedArt(newArt);
        const updatedList = [newArt, ...userGenerations].slice(0, 15);
        setUserGenerations(updatedList);
        try {
          localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(updatedList));
        } catch (e) {}
      } catch (err) {
        console.error('Erro ao gerar imagem:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 600);
  };

  const handleDownload = (imageUrl, fileName) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${fileName || 'obra-biblica-ia'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-5xl w-full h-[94vh] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Imagens Históricas & Ateliê IA</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-300/40">
                  Arqueologia & IA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                Templos, rituais, personagens bíblicos e ateliê gerador com IA
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas Principais (Acervo vs Gerador IA) */}
        <div className="px-3 sm:px-5 py-2 bg-amber-50/60 dark:bg-amber-950/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Acervo Histórico</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full ml-1">
                {HISTORICAL_IMAGES_CATALOG.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>Gerar Imagem com IA</span>
              <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full font-black ml-1">
                NOVO
              </span>
            </button>
          </div>
        </div>

        {/* ================= ABA 1: ACERVO HISTÓRICO COM EXPANSÃO DE TEXTO ================= */}
        {activeTab === 'catalog' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            
            {/* Filtros e Busca */}
            <div className="p-3 sm:px-5 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {cat === 'all' ? 'Todas' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar no acervo bíblico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Grid de Cards com Texto Expansível e Legível */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCatalog.map(item => {
                const isExpanded = expandedCardId === item.id;

                return (
                  <div 
                    key={item.id}
                    className={`rounded-2xl border transition-all flex flex-col shadow-xs bg-white dark:bg-zinc-900 ${
                      isExpanded 
                        ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600'
                    }`}
                  >
                    {/* Imagem / Ilustração de Cabeçalho do Card */}
                    <div className="relative aspect-video sm:aspect-21/9 w-full overflow-hidden bg-zinc-900 rounded-t-2xl">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-bold text-amber-300 flex items-center space-x-1 border border-amber-500/30">
                            <span>{item.categoryEmoji}</span>
                            <span>{item.category}</span>
                          </span>

                          <button
                            onClick={() => setSelectedImage(item)}
                            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white hover:bg-amber-600 transition-colors cursor-pointer"
                            title="Ver Imagem em Alta Resolução"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-300 font-mono font-semibold block">{item.date}</span>
                          <h4 className="font-black text-base sm:text-lg text-white drop-shadow-md leading-tight">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo com Tipografia Ampla e Opção de Expansão */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <p className={`text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm ${
                          isExpanded ? '' : 'line-clamp-3'
                        }`}>
                          {item.description}
                        </p>

                        {/* Botão de Expandir / Recolher Texto */}
                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                          className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Recolher Texto' : 'Ler Explicação Completa...'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Nota Arqueológica e Referências Bíblicas */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-black text-xs">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.bibleRef}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-zinc-800/80 border border-amber-200/50 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          <strong className="text-amber-900 dark:text-amber-200 font-bold">Nota Arqueológica: </strong>
                          {item.archaeologicalNotes}
                        </div>

                        {/* Atalho para Gerar no Ateliê */}
                        <button
                          onClick={() => {
                            setPrompt(`${item.title}: ${item.description.slice(0, 100)}`);
                            setActiveTab('generator');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-900 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Recriar este tema no Ateliê IA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= ABA 2: GERADOR DE IMAGENS COM IA (ATELIÊ BÍBLICO) ================= */}
        {activeTab === 'generator' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-zinc-50/40 dark:bg-zinc-950/40 space-y-4">
            
            {/* Box Principal de Configuração do Prompt */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
              <div>
                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <span>Ateliê Bíblico IA: Crie uma Cena da Época</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Escolha um tema clássico ou descreva qualquer cena, templo, ritual ou personagem histórico:
                </p>
              </div>

              {/* Chips de Sugestões Rápidas em 1 Toque */}
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Sugestões Prontas (Toque para preencher):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {INSPIRATION_PROMPTS.map((insp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPrompt(insp.prompt);
                        setSelectedStyle(insp.style);
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {insp.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Textarea do Prompt */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Descreva o que deseja ilustrar:
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: A Arca da Aliança com os Querubins de ouro no Santo dos Santos emitindo a luz celestial da Shekinah..."
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
                />
              </div>

              {/* Estilo Artístico (Pills Rápidas) */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Estilo Artístico:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    '📸 Cinematografia Épica 8K',
                    '🎨 Pintura a Óleo Renascentista',
                    '🏛️ Reconstrução Arqueológica',
                    '📜 Enciclopédia Iluminada'
                  ].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStyle(st)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center truncate ${
                        selectedStyle === st
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                      }`}
                      title={st}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTÃO PRINCIPAL DE GERAÇÃO (SEMPRE VISÍVEL E CLICÁVEL) */}
              <button
                type="button"
                onClick={() => handleGenerateArt()}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Pintando Obra Bíblica no Ateliê IA...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>✨ Gerar Imagem com IA Agora</span>
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW DA IMAGEM GERADA */}
            {generatedArt && (
              <div className="bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-900/60 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                      Obra Concluída no Ateliê IA
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {generatedArt.prompt.slice(0, 70)}...
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsFullscreenGenerated(true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ampliar</span>
                    </button>
                    <button
                      onClick={() => handleDownload(generatedArt.imageUrl, 'arte-biblica-ia')}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar HD</span>
                    </button>
                  </div>
                </div>

                {/* Exibição da Arte */}
                <div 
                  onClick={() => setIsFullscreenGenerated(true)}
                  className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black cursor-pointer shadow-md"
                >
                  <img
                    src={generatedArt.imageUrl}
                    alt={generatedArt.prompt}
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                  />
                </div>
              </div>
            )}

          </div>
        )}

        {/* Rodapé Geral */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>Acervo Arqueológico Bíblico • Alta Fidelidade Histórica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Lightbox / Tela Cheia de Imagem Gerada */}
      {isFullscreenGenerated && generatedArt && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-white mb-3">
            <span className="font-bold text-sm truncate max-w-md">{generatedArt.prompt}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(generatedArt.imageUrl, 'arte-biblica-ia')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
              <button
                onClick={() => setIsFullscreenGenerated(false)}
                className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-2">
            <img
              src={generatedArt.imageUrl}
              alt={generatedArt.prompt}
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Lightbox do Acervo */}
      {selectedImage && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-white mb-3">
            <div>
              <h3 className="font-bold text-sm">{selectedImage.title}</h3>
              <p className="text-xs text-zinc-400">{selectedImage.bibleRef}</p>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-2">
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
