import React, { useState, useEffect } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  ZoomIn, 
  BookOpen, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Landmark,
  Sparkles
} from 'lucide-react';
import { HISTORICAL_IMAGES_CATALOG } from '../data/historicalImagesData';
import { telemetryService } from '../services/telemetryService';

export default function ImagensHistoricasModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Lightbox
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      telemetryService.track('historical_images_view', { tab: 'catalog' });
    }
  }, [isOpen]);

  const categories = ['all', 'Locais & Templos', 'Rituais & Sacerdócio', 'Personagens & História', 'Fauna, Flora & Cotidiano'];

  const filteredCatalog = HISTORICAL_IMAGES_CATALOG.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bibleRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.archaeologicalNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-5xl w-full h-[94vh] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>Acervo Histórico & Arqueológico Bíblico</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                  Arqueologia & História
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                Templos, rituais sacerdotais, personagens e costumes da época bíblica
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

        {/* Barra de Filtros e Busca */}
        <div className="p-3 sm:px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2.5 bg-zinc-50/60 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {cat === 'all' ? 'Todas as Áreas' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar personagem, templo..."
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-between p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-bold text-amber-300 flex items-center space-x-1 border border-amber-500/30">
                        <span>{item.categoryEmoji}</span>
                        <span>{item.category}</span>
                      </span>

                      <button
                        onClick={() => setSelectedImage(item)}
                        className="p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white hover:bg-amber-600 transition-colors cursor-pointer"
                        title="Ver Imagem em Tela Cheia"
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
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
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
                  <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-black text-xs">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.bibleRef}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-zinc-800/80 border border-amber-200/60 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong className="text-amber-950 dark:text-amber-200 font-bold">Nota Arqueológica: </strong>
                      {item.archaeologicalNotes}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé Geral */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>Acervo Arqueológico Bíblico • {filteredCatalog.length} registros históricos</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Lightbox / Tela Cheia do Acervo */}
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
