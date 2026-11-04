import React, { useState, useMemo } from 'react';
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
  Sparkles
} from 'lucide-react';
import { BIBLICAL_PLACES, BIBLICAL_JOURNEYS } from '../data/biblicalPlaces';
import { telemetryService } from '../services/telemetryService';

export default function MapasBiblicosModal({ isOpen, onClose, initialPlaceId = null, onSelectReading = null }) {
  const [selectedJourneyId, setSelectedJourneyId] = useState('jesus');
  const [selectedPlaceId, setSelectedPlaceId] = useState(initialPlaceId || 'jerusalem');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' | 'list'

  // Ao abrir com um local específico vindo do leitor
  React.useEffect(() => {
    if (initialPlaceId && BIBLICAL_PLACES[initialPlaceId]) {
      setSelectedPlaceId(initialPlaceId);
      const place = BIBLICAL_PLACES[initialPlaceId];
      if (place.journeys && place.journeys.length > 0) {
        setSelectedJourneyId(place.journeys[0]);
      }
    }
  }, [initialPlaceId, isOpen]);

  // Telemetria ao abrir
  React.useEffect(() => {
    if (isOpen) {
      telemetryService.track('biblical_maps_view', { journey: selectedJourneyId });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentJourney = BIBLICAL_JOURNEYS.find(j => j.id === selectedJourneyId) || BIBLICAL_JOURNEYS[0];
  const selectedPlace = BIBLICAL_PLACES[selectedPlaceId] || BIBLICAL_PLACES.jerusalem;

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

  // Coordenadas dos pontos para traçar a rota SVG
  const pathD = useMemo(() => {
    if (selectedJourneyId === 'all' || !currentJourney.route || currentJourney.route.length < 2) return '';
    const points = currentJourney.route.map(step => {
      const p = BIBLICAL_PLACES[step.placeId];
      return p ? p.coords : null;
    }).filter(Boolean);

    if (points.length < 2) return '';
    return points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [selectedJourneyId, currentJourney]);

  const handleSelectPlace = (placeId) => {
    setSelectedPlaceId(placeId);
    telemetryService.track('biblical_place_click', { placeId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Atlas Bíblico & Rotas Históricas</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                  Interativo
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Viagens de Paulo, Passos de Jesus na Galileia e Judeia, e o Êxodo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Jornadas (Tabs com Scroll Horizontal) */}
        <div className="px-3.5 sm:px-6 py-2 bg-amber-50/40 dark:bg-amber-950/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { setSelectedJourneyId('all'); setSearchQuery(''); }}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              selectedJourneyId === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <span>🗺️</span>
            <span>Todos os Lugares</span>
          </button>

          {BIBLICAL_JOURNEYS.map(journey => {
            const isSelected = selectedJourneyId === journey.id;
            return (
              <button
                key={journey.id}
                onClick={() => { setSelectedJourneyId(journey.id); setSearchQuery(''); }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
                style={isSelected ? { backgroundColor: journey.color } : {}}
              >
                <span>{journey.id === 'jesus' ? '✝️' : journey.id.startsWith('paulo') ? '📜' : '🏜️'}</span>
                <span>{journey.name}</span>
              </button>
            );
          })}
        </div>

        {/* Barra de Pesquisa Rápida */}
        <div className="px-3.5 sm:px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/40 dark:bg-zinc-900/40">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cidade bíblica (ex: Cafarnaum, Éfeso, Damasco, Jerusalém)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-1 shrink-0 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="hidden sm:inline">Período:</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{selectedJourneyId === 'all' ? 'Bíblico Antigo & Novo' : currentJourney.period}</span>
          </div>
        </div>

        {/* Corpo Principal com Visualização Split: Mapa SVG + Painel de Detalhes */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Lado Esquerdo: Canvas do Mapa Bíblico Interativo (SVG) */}
          <div className="relative flex-1 bg-[#f4ecd8] dark:bg-[#1a1b1e] border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 min-h-[260px] sm:min-h-[340px] flex items-center justify-center overflow-hidden select-none">
            
            {/* SVG do Mapa com Linhas de Relevo e Costas Históricas */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full max-h-[460px] object-contain drop-shadow-sm"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradiente de Água / Mar Mediterrâneo */}
                <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.8" />
                </linearGradient>

                {/* Filtro de Sombra para Marcadores */}
                <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Fundo do Mar Mediterrâneo */}
              <rect x="0" y="0" width="100" height="100" fill="#dbeafe" className="dark:fill-[#121824]" />

              {/* Massa Terrestre Simplificada do Mundo Bíblico (Europa do Sul, Ásia Menor, Levante, Egito) */}
              {/* Europa (Itália e Grécia) */}
              <path 
                d="M 10 10 L 25 10 L 22 28 L 15 32 L 18 38 L 14 36 L 12 25 Z" 
                fill="#fde68a" 
                className="dark:fill-[#2d281e]" 
                stroke="#d97706" 
                strokeWidth="0.3" 
              />
              {/* Grécia e Macedônia */}
              <path 
                d="M 28 14 L 40 14 L 38 34 L 32 38 L 30 30 Z" 
                fill="#fef3c7" 
                className="dark:fill-[#383121]" 
                stroke="#d97706" 
                strokeWidth="0.3" 
              />
              {/* Ásia Menor (Turquia / Éfeso / Galácia) */}
              <path 
                d="M 40 18 L 70 18 L 68 40 L 42 42 Z" 
                fill="#fde68a" 
                className="dark:fill-[#383121]" 
                stroke="#d97706" 
                strokeWidth="0.3" 
              />
              {/* Levante / Terra Santa / Síria / Israel */}
              <path 
                d="M 52 42 L 72 40 L 75 75 L 54 75 Z" 
                fill="#fed7aa" 
                className="dark:fill-[#3f3120]" 
                stroke="#d97706" 
                strokeWidth="0.4" 
              />
              {/* Egito e Península do Sinai */}
              <path 
                d="M 38 75 L 68 75 L 66 98 L 38 98 Z" 
                fill="#fde68a" 
                className="dark:fill-[#383121]" 
                stroke="#d97706" 
                strokeWidth="0.3" 
              />

              {/* Mar da Galileia & Rio Jordão & Mar Morto (Destaque Hidrográfico) */}
              <ellipse cx="59" cy="56" rx="1.4" ry="1.9" fill="#38bdf8" />
              <line x1="59" y1="58" x2="58.5" y2="64" stroke="#38bdf8" strokeWidth="0.6" strokeDasharray="0.5,0.5" />
              <ellipse cx="58.5" cy="67" rx="1.6" ry="3.2" fill="#0284c7" />

              {/* Rota Animada da Viagem / Jornada Selecionada */}
              {pathD && (
                <>
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke={currentJourney.color} 
                    strokeWidth="1.2" 
                    strokeDasharray="2.5,1.5" 
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                  {/* Seta / Linha de Realce */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="0.4" 
                    strokeDasharray="1,2" 
                    strokeLinecap="round"
                    className="opacity-70 animate-pulse"
                  />
                </>
              )}

              {/* Pinos / Marcadores dos Lugares */}
              {journeyPlaces.map((place, idx) => {
                const isSelected = selectedPlaceId === place.id;
                const coords = place.coords;
                if (!coords) return null;

                return (
                  <g 
                    key={place.id} 
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                    onClick={() => handleSelectPlace(place.id)}
                  >
                    {/* Anel de Pulso para o Marcador Selecionado */}
                    {isSelected && (
                      <circle 
                        cx={coords.x} 
                        cy={coords.y} 
                        r="3.8" 
                        fill={currentJourney.color || '#ea580c'} 
                        opacity="0.3" 
                        className="animate-ping" 
                      />
                    )}

                    {/* Ponto Central */}
                    <circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r={isSelected ? "2.6" : "1.8"} 
                      fill={isSelected ? (currentJourney.color || '#ea580c') : '#475569'} 
                      stroke="#ffffff" 
                      strokeWidth={isSelected ? "0.8" : "0.5"} 
                      filter="url(#pinShadow)"
                    />

                    {/* Número da Etapa (se fizer parte da jornada) */}
                    {place.stage && (
                      <text 
                        x={coords.x} 
                        y={coords.y + 0.6} 
                        fill="#ffffff" 
                        fontSize="1.6" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {place.stage}
                      </text>
                    )}

                    {/* Rótulo de Texto da Cidade */}
                    <text 
                      x={coords.x} 
                      y={coords.y - 2.8} 
                      fill={isSelected ? '#9a3412' : '#334155'} 
                      className="dark:fill-zinc-200"
                      fontSize={isSelected ? "2.4" : "1.9"} 
                      fontWeight={isSelected ? "900" : "600"} 
                      textAnchor="middle"
                      style={{ textShadow: '0 0.5px 1px rgba(255,255,255,0.9)' }}
                    >
                      {place.name}
                    </text>
                  </g>
                );
              })}

              {/* Rosa dos Ventos / Bússola no Canto Superior Esquerdo */}
              <g transform="translate(6, 6) scale(0.6)">
                <circle cx="10" cy="10" r="8" fill="#ffffff" opacity="0.7" className="dark:fill-zinc-800" />
                <path d="M 10 3 L 12 10 L 10 17 L 8 10 Z" fill="#dc2626" />
                <path d="M 3 10 L 10 12 L 17 10 L 10 8 Z" fill="#64748b" />
                <text x="10" y="2" fill="#dc2626" fontSize="2.5" fontWeight="bold" textAnchor="middle">N</text>
              </g>

              {/* Legenda do Mar */}
              <text x="25" y="55" fill="#3b82f6" fontSize="2.6" fontWeight="bold" opacity="0.6" fontStyle="italic">
                Mar Mediterrâneo (Grande Mar)
              </text>
            </svg>

            {/* Dica de Toque / Zoom */}
            <div className="absolute bottom-2 left-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium flex items-center space-x-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Toque nos pontos para abrir detalhes históricos</span>
            </div>
          </div>

          {/* Lado Direito: Painel Informativo do Local Selecionado */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-zinc-900 p-4 sm:p-5 overflow-y-auto">
            
            {/* Cabeçalho do Local */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {selectedPlace.region}
                </span>
                <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {selectedPlace.modernName}
                </span>
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{selectedPlace.name}</span>
              </h3>
            </div>

            {/* Resumo Histórico */}
            <div className="space-y-3 flex-1 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {selectedPlace.summary}
              </div>

              {/* Eventos Bíblicos Chave */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Acontecimentos Bíblicos em {selectedPlace.name}:</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedPlace.events.map((ev, i) => (
                    <div 
                      key={i} 
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-300 flex items-start space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span className="leading-tight">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relação na Jornada Atual */}
              {selectedJourneyId !== 'all' && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Itinerário nesta rota:
                  </div>
                  <div className="space-y-1">
                    {currentJourney.route.map(step => {
                      const isCurrentStep = step.placeId === selectedPlaceId;
                      return (
                        <button
                          key={step.stage}
                          onClick={() => handleSelectPlace(step.placeId)}
                          className={`w-full text-left p-1.5 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                            isCurrentStep 
                              ? 'bg-amber-500 text-white font-bold shadow-2xs' 
                              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                              isCurrentStep ? 'bg-white text-amber-700' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}>
                              {step.stage}
                            </span>
                            <span className="truncate">{step.label}</span>
                          </div>
                          <span className={`text-[10px] ${isCurrentStep ? 'text-amber-100' : 'text-zinc-400'}`}>
                            {step.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Rodapé */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Footprints className="w-4 h-4 text-amber-500" />
            <span>{journeyPlaces.length} marcos mapeados na rota de {currentJourney.name}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
}
