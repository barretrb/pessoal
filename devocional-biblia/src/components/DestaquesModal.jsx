import React, { useState } from 'react';
import { X, Bookmark, Star, Trash2, BookOpen } from 'lucide-react';
import { HIGHLIGHT_COLORS } from '../services/storage';

export default function DestaquesModal({ 
  isOpen, 
  onClose, 
  favorites, 
  highlights, 
  onRemoveFavorite, 
  onRemoveHighlight,
  onGoToPassage 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('favorites'); // favorites, highlights

  const highlightList = Object.entries(highlights).map(([key, data]) => ({
    key,
    ...data
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Meus Versículos Guardados
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Favoritos, destaques coloridos e anotações pessoais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-3 space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Favoritos ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'highlights'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Destaques com Cores ({highlightList.length})</span>
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'favorites' ? (
            favorites.length > 0 ? (
              favorites.map((fav) => (
                <div
                  key={fav.key}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      {fav.key}
                    </span>
                    <button
                      onClick={() => onRemoveFavorite(fav.key)}
                      className="text-zinc-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-scripture text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                    "{fav.text}"
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-400 space-y-2">
                <Star className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm">Você ainda não favoritou nenhum versículo.</p>
                <p className="text-xs text-zinc-500">Clique na estrela ao lado de qualquer versículo durante a leitura!</p>
              </div>
            )
          ) : (
            highlightList.length > 0 ? (
              highlightList.map((item) => {
                const colorConfig = HIGHLIGHT_COLORS[item.color] || HIGHLIGHT_COLORS.yellow;
                return (
                  <div
                    key={item.key}
                    className={`p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${colorConfig.bg} space-y-2 relative group`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wide">
                        {item.key} • {colorConfig.name}
                      </span>
                      <button
                        onClick={() => onRemoveHighlight(item.key)}
                        className="text-zinc-500 hover:text-red-500 p-1"
                        title="Remover destaque"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.note && (
                      <p className="text-xs italic text-zinc-700 dark:text-zinc-300">
                        Nota: {item.note}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-400 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm">Nenhum versículo destacado com cores ainda.</p>
                <p className="text-xs text-zinc-500">Selecione qualquer versículo no texto bíblico para colorir!</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
