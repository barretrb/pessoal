import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Compass, 
  Layers, 
  ExternalLink, 
  BookOpen, 
  Info,
  Calendar,
  Footprints,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  Map as MapIcon,
  List,
  FileText,
  Eye
} from 'lucide-react';
import { BIBLICAL_PLACES, BIBLICAL_JOURNEYS } from '../data/biblicalPlaces';
import { telemetryService } from '../services/telemetryService';

export default function MapasBiblicosModal({ isOpen, onClose, initialPlaceId = null, onSelectReading = null, onOpenImages = null }) {
  const [selectedJourneyId, setSelectedJourneyId] = useState('jesus');
  const [selectedPlaceId, setSelectedPlaceId] = useState(initialPlaceId || 'jerusalem');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'texts' (Especial para celular)
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'places'

  // Ao abrir com um local específico vindo do leitor
  useEffect(() => {
    if (initialPlaceId && BIBLICAL_PLACES[initialPlaceId]) {
      setSelectedPlaceId(initialPlaceId);
      const place = BIBLICAL_PLACES[initialPlaceId];
      if (place.journeys && place.journeys.length > 0) {
        setSelectedJourneyId(place.journeys[0]);
      }
    }
  }, [initialPlaceId, isOpen]);

  // Telemetria ao abrir
  useEffect(() => {
    if (isOpen) {
      telemetryService.track('biblical_maps_view', { journey: selectedJourneyId });
    }
  }, [isOpen]);

  // Reset zoom ao trocar de rota
  useEffect(() => {
    setZoomLevel(1);
  }, [selectedJourneyId]);

  const currentJourney = useMemo(() => {
    return BIBLICAL_JOURNEYS.find(j => j.id === selectedJourneyId) || BIBLICAL_JOURNEYS[0];
  }, [selectedJourneyId]);

  const selectedPlace = useMemo(() => {
    return BIBLICAL_PLACES[selectedPlaceId] || BIBLICAL_PLACES.jerusalem;
  }, [selectedPlaceId]);

  // Lugares da jornada atual ou todos
  const journeyPlaces = useMemo(() => {
    if (selectedJourneyId === 'all') {
      return Object.values(BIBLICAL_PLACES);
    }
    return currentJourney.route.map(step => ({
      ...BIBLICAL_PLACES[step.placeId],
      stage: step.stage,
      stepLabel: step.label,
      stepNote: step.note
    })).filter(Boolean);
  }, [selectedJourneyId, currentJourney]);

  // Filtro de busca
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return journeyPlaces;
    const q = searchQuery.toLowerCase().trim();
    return Object.values(BIBLICAL_PLACES).filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.aliases.some(a => a.toLowerCase().includes(q))
    );
  }, [searchQuery, journeyPlaces]);

  const handleSelectPlace = (placeId, switchToTextsOnMobile = false) => {
    setSelectedPlaceId(placeId);
    if (switchToTextsOnMobile && window.innerWidth < 768) {
      setMobileTab('texts');
    }
    telemetryService.track('biblical_place_click', { placeId });
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-5xl w-full h-[94vh] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Atlas Bíblico & Rotas</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  Cartografia Real
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                Passos de Jesus, Viagens de Paulo, Êxodo e Tribos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsFullscreenMap(true)}
              className="p-2 rounded-xl bg-amber-50 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center space-x-1 text-xs font-bold"
              title="Expandir Mapa em Tela Cheia"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tela Cheia</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Seleção de Mapas e Rotas (Scroll Horizontal) */}
        <div className="px-3 sm:px-5 py-2 bg-amber-50/60 dark:bg-amber-950/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {BIBLICAL_JOURNEYS.map(journey => {
            const isSelected = selectedJourneyId === journey.id;
            const icon = journey.id === 'jesus' 
              ? '✝️' 
              : journey.id.startsWith('paulo') 
                ? '📜' 
                : journey.id === 'exodo' 
                  ? '🏜️' 
                  : '🏛️';

            return (
              <button
                key={journey.id}
                onClick={() => { 
                  setSelectedJourneyId(journey.id); 
                  setSearchQuery(''); 
                  if (journey.route && journey.route.length > 0) {
                    setSelectedPlaceId(journey.route[0].placeId);
                  }
                }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-xs scale-102 ring-2 ring-offset-1 ring-amber-500'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
                style={isSelected ? { backgroundColor: journey.color } : {}}
              >
                <span>{icon}</span>
                <span>{journey.name}</span>
              </button>
            );
          })}
        </div>

        {/* ALTERNADOR DE ABAS NO CELULAR: MAPA vs TEXTOS HISTÓRICOS */}
        <div className="md:hidden flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-800/90 p-1 shrink-0">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
              mobileTab === 'map'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-300 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>1. Ver Mapa Histórico</span>
          </button>
          <button
            onClick={() => setMobileTab('texts')}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
              mobileTab === 'texts'
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-300 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Textos & Marcos ({selectedPlace.name})</span>
          </button>
        </div>

        {/* Barra de Sub-Filtros: Busca e Controles */}
        <div className="px-3 sm:px-5 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2.5 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cidade bíblica (Cafarnaum, Éfeso, Jerusalém)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <div className="bg-zinc-200/60 dark:bg-zinc-800 p-0.5 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                  viewMode === 'map' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>
              <button
                onClick={() => setViewMode('places')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                  viewMode === 'places' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs' 
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista ({journeyPlaces.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* CORPO PRINCIPAL */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* LADO ESQUERDO: MAPA HISTÓRICO (Visível sempre no Desktop, e no Mobile sob a aba 'map') */}
          <div className={`relative flex-1 bg-[#f5efe6] dark:bg-[#121316] border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden select-none ${
            mobileTab === 'texts' ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Faixa Superior Informativa do Mapa */}
            <div className="bg-amber-100/80 dark:bg-zinc-800/90 px-3 py-1.5 text-xs font-medium text-amber-950 dark:text-amber-200 flex items-center justify-between border-b border-amber-200/60 dark:border-zinc-700/60 shrink-0">
              <span className="truncate font-bold">{currentJourney.mapTitle}</span>
              <span className="shrink-0 text-[10px] bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-md font-mono font-bold">
                {currentJourney.period}
              </span>
            </div>

            {/* Container do Mapa com Pan / Zoom */}
            <div className="relative flex-1 overflow-auto flex items-center justify-center p-2 sm:p-3 bg-[#eae1d0]/50 dark:bg-black/40">
              {viewMode === 'map' ? (
                <div 
                  className="relative transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                >
                  <img
                    src={currentJourney.mapImage}
                    alt={currentJourney.mapTitle}
                    className="max-h-[62vh] md:max-h-[58vh] w-auto max-w-full object-contain rounded-2xl shadow-xl border-2 border-[#d4c5a9] dark:border-zinc-700 bg-white"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Modo Lista de Marcos */
                <div className="w-full h-full p-3 sm:p-4 overflow-y-auto space-y-2">
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">
                    Marcos Históricos da Rota ({filteredPlaces.length}):
                  </div>
                  {filteredPlaces.map((place, idx) => {
                    const isSelected = selectedPlaceId === place.id;
                    return (
                      <button
                        key={place.id}
                        onClick={() => handleSelectPlace(place.id, true)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}>
                            {place.stage || idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {place.name}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {place.stepLabel || place.region}
                            </div>
                          </div>
                        </div>
                        {place.stepNote && (
                          <span className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-700/60 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-300 shrink-0">
                            {place.stepNote}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Controles de Zoom Flutuantes */}
            <div className="absolute bottom-16 sm:bottom-14 right-3 flex items-center space-x-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md">
              <button
                onClick={() => handleZoom(0.25)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                title="Ampliar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(-0.25)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                title="Reduzir"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                title="Resetar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1 text-zinc-600 dark:text-zinc-300">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            {/* Carrossel de Etapas Rápidas na Base do Mapa */}
            {currentJourney.route && currentJourney.route.length > 0 && (
              <div className="bg-white/95 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 px-1">
                  Paradas:
                </span>
                {currentJourney.route.map(step => {
                  const isCurrent = step.placeId === selectedPlaceId;
                  const place = BIBLICAL_PLACES[step.placeId];
                  return (
                    <button
                      key={step.stage}
                      onClick={() => handleSelectPlace(step.placeId, true)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-amber-500 text-white shadow-xs font-bold ring-2 ring-amber-400' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ${
                        isCurrent ? 'bg-white text-amber-700' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {step.stage}
                      </span>
                      <span>{place ? place.name : step.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* LADO DIREITO: PAINEL INFORMATIVO COMPLETO & TEXTOS LEGÍVEIS */}
          <div className={`w-full md:w-96 lg:w-[420px] flex flex-col bg-white dark:bg-zinc-900 p-4 sm:p-6 overflow-y-auto ${
            mobileTab === 'map' ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Botão Mobile para Retornar ao Mapa */}
            <div className="md:hidden mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setMobileTab('map')}
                className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>← Voltar ao Mapa</span>
              </button>

              <span className="text-[11px] font-bold text-zinc-500">
                Visualização do Texto
              </span>
            </div>

            {/* Cabeçalho do Local Selecionado */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900">
                  {selectedPlace.region}
                </span>
                <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg truncate max-w-[200px]" title={selectedPlace.modernName}>
                  {selectedPlace.modernName}
                </span>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-600 shrink-0" />
                <span>{selectedPlace.name}</span>
              </h3>
            </div>

            {/* Resumo Histórico e Arqueológico em Tipografia Confortável */}
            <div className="space-y-4 flex-1">
              <div>
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Contexto Histórico & Geográfico:
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base font-normal">
                  {selectedPlace.summary}
                </div>
              </div>

              {/* Eventos Bíblicos Chave */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Acontecimentos Bíblicos Marcantes:</span>
                </h4>
                <div className="space-y-2">
                  {selectedPlace.events && selectedPlace.events.map((ev, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 flex items-start space-x-2.5 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="text-xs sm:text-sm leading-relaxed">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações Especiais: Ateliê de Imagens / Abrir no Leitor */}
              {onOpenImages && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenImages(selectedPlace.name);
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-orange-500/15 to-purple-500/15 hover:from-orange-500/25 hover:to-purple-500/25 border border-orange-300/60 dark:border-orange-800/60 text-orange-800 dark:text-orange-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>Ver Acervo Histórico de {selectedPlace.name}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Rodapé */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center space-x-2">
            <Footprints className="w-4 h-4 text-amber-500" />
            <span className="truncate max-w-[200px] sm:max-w-none">{currentJourney.name} ({journeyPlaces.length} marcos)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreenMap(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-200 dark:hover:bg-zinc-700 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ampliar Mapa</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>

      </div>

      {/* Modal / Lightbox de Tela Cheia do Mapa em Alta Resolução */}
      {isFullscreenMap && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-white mb-2 shrink-0">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold">{currentJourney.mapTitle}</h3>
                <p className="text-[11px] text-zinc-400">Atlas Histórico Bíblico de Alta Resolução</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoom(0.5)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(-0.5)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                title="Resetar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreenMap(false)}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                title="Fechar Tela Cheia"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-2 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div 
              className="transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={currentJourney.mapImage}
                alt={currentJourney.mapTitle}
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
