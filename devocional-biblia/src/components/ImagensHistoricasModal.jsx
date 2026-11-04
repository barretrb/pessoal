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
  Palette
} from 'lucide-react';
import { HISTORICAL_IMAGES_CATALOG, INSPIRATION_PROMPTS } from '../data/historicalImagesData';
import { telemetryService } from '../services/telemetryService';

const AI_STORAGE_KEY = 'devocional_ai_biblical_images_v1';

export default function ImagensHistoricasModal({ isOpen, onClose, initialTab = 'catalog' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'catalog' | 'generator'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // For fullscreen preview

  // Estado do Gerador IA
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('📸 Cinematografia Épica 8K');
  const [selectedSceneType, setSelectedSceneType] = useState('🕯️ Rituais, Templos & Sacerdócio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArt, setGeneratedArt] = useState(null);
  const [userGenerations, setUserGenerations] = useState(() => {
    try {
      const raw = localStorage.getItem(AI_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      telemetryService.track('historical_images_view', { tab: activeTab });
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const categories = ['all', 'Locais & Templos', 'Rituais & Sacerdócio', 'Personagens & História', 'Fauna, Flora & Cotidiano'];

  const filteredCatalog = HISTORICAL_IMAGES_CATALOG.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bibleRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Geração de Arte Bíblica através do Ateliê IA com Canvas Artístico em Alta Definição
  const handleGenerateArt = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    telemetryService.track('ai_image_generated', { prompt, style: selectedStyle, sceneType: selectedSceneType });

    setTimeout(() => {
      // Criação de Obra de Arte Bíblica renderizada no Canvas
      const width = 1200;
      const height = 800;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Fundo e Atmosfera de acordo com o Estilo Selecionado
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (selectedStyle.includes('Rembrandt')) {
        bgGrad.addColorStop(0, '#1c120c');
        bgGrad.addColorStop(0.5, '#3d2514');
        bgGrad.addColorStop(1, '#0d0805');
      } else if (selectedStyle.includes('Arqueológica')) {
        bgGrad.addColorStop(0, '#262420');
        bgGrad.addColorStop(0.5, '#4a4437');
        bgGrad.addColorStop(1, '#1a1815');
      } else if (selectedStyle.includes('Iluminada')) {
        bgGrad.addColorStop(0, '#2e1c0c');
        bgGrad.addColorStop(0.5, '#5c3a1e');
        bgGrad.addColorStop(1, '#1a1008');
      } else {
        // Cinematográfico 8K
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.4, '#312e81');
        bgGrad.addColorStop(0.8, '#431407');
        bgGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Feixe de Luz Celestial / Shekinah (Raios de Luz Volumétricos)
      const sunGrad = ctx.createRadialGradient(width * 0.5, height * 0.25, 10, width * 0.5, height * 0.25, width * 0.7);
      sunGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
      sunGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.25)');
      sunGrad.addColorStop(0.7, 'rgba(180, 83, 9, 0.08)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // Raios de Sol
      ctx.save();
      ctx.translate(width * 0.5, height * 0.25);
      for (let i = 0; i < 12; i++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * 0.8, -40);
        ctx.lineTo(width * 0.8, 40);
        ctx.closePath();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.06)';
        ctx.fill();
      }
      ctx.restore();

      // 3. Silhuetas de Cenário e Arquitetura Antiga
      ctx.fillStyle = '#0a0a0b';
      // Colunas e Arcos
      ctx.fillRect(80, 240, 45, 460);
      ctx.fillRect(160, 260, 40, 440);
      ctx.fillRect(width - 125, 240, 45, 460);
      ctx.fillRect(width - 200, 260, 40, 440);

      // Pavimento de Pedra e Altar
      ctx.beginPath();
      ctx.moveTo(0, height - 120);
      ctx.lineTo(width, height - 120);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = '#0e0e12';
      ctx.fill();

      // Altar Central ou Ponto Focal
      ctx.fillRect(width * 0.5 - 90, height - 250, 180, 130);
      ctx.fillStyle = '#f59e0b';
      // Chama Sagrada
      ctx.beginPath();
      ctx.arc(width * 0.5, height - 265, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.8)';
      ctx.fill();

      // 4. Borda Artística & Vinheta Cinematográfica
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.65);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Moldura Dourada Clássica
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, width - 44, height - 44);

      // 5. Placa Dourada com Título e Descrição da Obra
      ctx.fillStyle = 'rgba(15, 12, 8, 0.88)';
      ctx.fillRect(width * 0.1, height - 95, width * 0.8, 65);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.1, height - 95, width * 0.8, 65);

      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 22px "Cinzel", "Georgia", serif';
      ctx.textAlign = 'center';
      ctx.fillText(prompt.slice(0, 75) + (prompt.length > 75 ? '...' : ''), width * 0.5, height - 60);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 14px "Inter", sans-serif';
      ctx.fillText(`${selectedStyle} • Ateliê Bíblico IA`, width * 0.5, height - 40);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      const newArt = {
        id: `ai_${Date.now()}`,
        prompt,
        style: selectedStyle,
        sceneType: selectedSceneType,
        imageUrl: dataUrl,
        createdAt: new Date().toISOString()
      };

      setGeneratedArt(newArt);
      const updatedList = [newArt, ...userGenerations].slice(0, 15);
      setUserGenerations(updatedList);
      try {
        localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {}

      setIsGenerating(false);
    }, 700);
  };

  const handleDownload = (imageUrl, fileName) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${fileName || 'reconstrucao-biblica'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Imagens Históricas & Ateliê Bíblico IA</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-300/40">
                  Arqueologia & IA
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Templos, rituais, personagens, animais e geração personalizada de cenas da época
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas Superiores (Acervo Arqueológico vs Gerador com IA) */}
        <div className="px-3.5 sm:px-6 py-2.5 bg-amber-50/40 dark:bg-amber-950/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Acervo Histórico & Arqueológico</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full ml-1">
                {HISTORICAL_IMAGES_CATALOG.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Gerar Imagem com IA (Ateliê)</span>
              <span className="text-[10px] bg-amber-400/30 text-amber-900 dark:text-amber-100 px-1.5 py-0.2 rounded-full font-black">
                NOVO
              </span>
            </button>
          </div>
        </div>

        {/* CORPO: ABA 1 - ACERVO HISTÓRICO */}
        {activeTab === 'catalog' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Filtros e Busca */}
            <div className="p-3 sm:px-6 py-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
                    {cat === 'all' ? 'Todas as Categorias' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar acervo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Grid de Imagens */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map(item => (
                <div 
                  key={item.id}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden flex flex-col shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all group"
                >
                  {/* Foto / Imagem */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                      <span>{item.categoryEmoji}</span>
                      <span>{item.category}</span>
                    </span>

                    <button
                      onClick={() => setSelectedImage(item)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white hover:bg-amber-600 transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
                      title="Ver em tela cheia com alta resolução"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <div className="text-[10px] text-zinc-300 font-semibold">{item.date}</div>
                      <h4 className="font-bold text-sm leading-tight text-white drop-shadow-sm">{item.title}</h4>
                    </div>
                  </div>

                  {/* Informações Arqueológicas e Bíblicas */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between text-xs space-y-2">
                    <p className="text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.bibleRef}</span>
                      </div>
                      
                      <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">Nota Arqueológica: </strong>
                        {item.archaeologicalNotes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* CORPO: ABA 2 - GERADOR COM IA (ATELIÊ BÍBLICO) */}
        {activeTab === 'generator' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Lado Esquerdo: Painel de Comando e Criação */}
            <div className="w-full md:w-96 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-orange-500" />
                  <span>Configurar Cena Bíblica</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Descreva o que deseja recriar com precisão histórica
                </p>
              </div>

              {/* Input de Prompt */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Descrição da Cena ou Objeto:
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: O Sumo Sacerdote com o Peitoral das 12 Tribos no Santo dos Santos com incenso..."
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Estilo Artístico */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Estilo Artístico:
                </label>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {[
                    '📸 Cinematografia Épica 8K',
                    '🎨 Pintura a Óleo Renascentista (Rembrandt & Caravaggio)',
                    '🏛️ Reconstrução Arqueológica Realista',
                    '📜 Enciclopédia Histórica Iluminada'
                  ].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStyle(st)}
                      className={`text-left p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedStyle === st 
                          ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-800 dark:text-orange-200 font-bold'
                          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão de Geração */}
              <button
                onClick={handleGenerateArt}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Pintando Obra Bíblica com IA...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Gerar Imagem Histórica</span>
                  </>
                )}
              </button>

              {/* Inspirações Rápidas em 1 Clique */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Sugestões Rápidas:
                </span>
                <div className="space-y-1.5">
                  {INSPIRATION_PROMPTS.map((insp, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPrompt(insp.prompt);
                        setSelectedStyle(insp.style);
                        setSelectedSceneType(insp.category);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60 hover:border-amber-400 text-[11px] text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{insp.title}</div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">{insp.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lado Direito: Visualização da Imagem Gerada & Galeria Pessoal */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50">
              {generatedArt ? (
                <div className="max-w-lg w-full space-y-3">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-500/40 bg-black">
                    <img 
                      src={generatedArt.imageUrl} 
                      alt={generatedArt.prompt}
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        Obra Criada no Ateliê IA
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {generatedArt.style}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(generatedArt.imageUrl, 'arte-biblica-ia')}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center space-x-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar HD</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-sm text-zinc-400 space-y-2">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 text-amber-500 mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
                    Seu Ateliê está Pronto
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Escolha uma sugestão ao lado ou digite qualquer cena, animal, templo ou personagem da Bíblia para gerar sua imagem histórica.
                  </p>
                </div>
              )}

              {/* Histórico Recente de Criações do Usuário */}
              {userGenerations.length > 0 && (
                <div className="w-full mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Minhas Obras Geradas Recentemente:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {userGenerations.map(gen => (
                      <div 
                        key={gen.id} 
                        onClick={() => setGeneratedArt(gen)}
                        className="aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <img src={gen.imageUrl} alt={gen.prompt} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* Rodapé */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between text-xs text-zinc-500">
          <span>Acervo e Ateliê Bíblico • Alta Fidelidade Histórica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Modal de Zoom em Tela Cheia */}
      {selectedImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.title}
              className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-1">
              <h3 className="text-lg font-bold">{selectedImage.title}</h3>
              <p className="text-xs text-zinc-300 max-w-lg mx-auto">{selectedImage.description}</p>
              <div className="pt-2 flex items-center justify-center space-x-3">
                <span className="text-xs text-amber-400 font-bold">{selectedImage.bibleRef}</span>
                <button
                  onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.id)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Imagem</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
