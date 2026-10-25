import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LeitorBiblico from './components/LeitorBiblico';
import BibleArcModal from './components/BibleArcModal';
import ReferenciasDrawer from './components/ReferenciasDrawer';
import ComentariosDrawer from './components/ComentariosDrawer';
import DestaquesModal from './components/DestaquesModal';

import initialDays from './data/plano365.json';
import lucasData from './data/lucas_nvt.json';
import { storage } from './services/storage';

export default function App() {
  // Configurações
  const savedSettings = storage.getSettings();
  const [theme, setTheme] = useState(savedSettings.theme || 'light');
  const [redLetterEnabled, setRedLetterEnabled] = useState(savedSettings.redLetters ?? true);

  // Progresso dos 365 dias
  const [days, setDays] = useState(() => storage.getProgress(initialDays));

  // Dia 298 é o de hoje, Dia 297 é a pendência identificada
  const [selectedDayId, setSelectedDayId] = useState(298);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'reader'

  // Modais e Drawers
  const [bibleArcData, setBibleArcData] = useState({ isOpen: false, passage: '', text: '' });
  const [referencesData, setReferencesData] = useState({ isOpen: false, verseKey: '', references: [] });
  const [commentaryData, setCommentaryData] = useState({ isOpen: false, chapterData: null });
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);

  // Favoritos e Highlights para gerenciar no modal
  const [favorites, setFavorites] = useState(storage.getFavorites());
  const [highlights, setHighlights] = useState(storage.getHighlights());

  // Encontrar primeiro dia pendente <= 298
  const pendingDay = days.find(d => !d.completed && d.id < 298);
  const pendingDayId = pendingDay ? pendingDay.id : (days.find(d => d.id === 297 && !d.completed)?.id || null);

  // Aplicar tema no elemento raiz
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    }
    storage.saveSettings({ theme, redLetters: redLetterEnabled });
  }, [theme, redLetterEnabled]);

  // Handler para marcar dia como concluído
  const handleToggleComplete = (dayId, status) => {
    storage.saveDayProgress(dayId, status);
    setDays(prevDays => 
      prevDays.map(d => d.id === dayId ? { ...d, completed: status, completedAt: status ? new Date().toISOString() : null } : d)
    );
  };

  // Navegar para um dia específico no leitor
  const handleSelectDay = (dayId) => {
    setSelectedDayId(dayId);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDayData = days.find(d => d.id === selectedDayId) || days[297];

  return (
    <div className="min-h-screen transition-colors duration-200 bg-zinc-50 dark:bg-zinc-950 sepia:bg-[#fbf0d9] text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] flex flex-col font-sans">
      
      {/* Barra de Navegação */}
      <Navbar
        currentDayId={298}
        pendingDayId={pendingDayId}
        onSelectDay={handleSelectDay}
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        setTheme={setTheme}
        redLetterEnabled={redLetterEnabled}
        setRedLetterEnabled={setRedLetterEnabled}
        onOpenFavorites={() => {
          setFavorites(storage.getFavorites());
          setHighlights(storage.getHighlights());
          setFavoritesModalOpen(true);
        }}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' ? (
          <Dashboard
            days={days}
            currentDayId={298}
            pendingDayId={pendingDayId}
            onSelectDay={handleSelectDay}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <LeitorBiblico
            dayData={currentDayData}
            lucasData={lucasData}
            onBack={() => setCurrentView('dashboard')}
            onToggleComplete={handleToggleComplete}
            onNextDay={() => {
              if (selectedDayId < 365) handleSelectDay(selectedDayId + 1);
            }}
            onPrevDay={() => {
              if (selectedDayId > 1) handleSelectDay(selectedDayId - 1);
            }}
            redLetterEnabled={redLetterEnabled}
            onOpenBibleArc={(passage, text) => {
              setBibleArcData({ isOpen: true, passage, text });
            }}
            onOpenReferences={(verseKey, references) => {
              setReferencesData({ isOpen: true, verseKey, references });
            }}
            onOpenCommentary={(chapterData) => {
              setCommentaryData({ isOpen: true, chapterData });
            }}
          />
        )}
      </main>

      {/* Modal BibleArc (John Piper) */}
      <BibleArcModal
        isOpen={bibleArcData.isOpen}
        onClose={() => setBibleArcData({ ...bibleArcData, isOpen: false })}
        initialPassage={bibleArcData.passage}
        initialText={bibleArcData.text}
      />

      {/* Drawer de Referências Cruzadas */}
      <ReferenciasDrawer
        isOpen={referencesData.isOpen}
        onClose={() => setReferencesData({ ...referencesData, isOpen: false })}
        verseKey={referencesData.verseKey}
        references={referencesData.references}
      />

      {/* Drawer de Comentários & Diário Espiritual */}
      <ComentariosDrawer
        isOpen={commentaryData.isOpen}
        onClose={() => setCommentaryData({ ...commentaryData, isOpen: false })}
        chapterData={commentaryData.chapterData}
      />

      {/* Modal de Versículos Guardados e Favoritos */}
      <DestaquesModal
        isOpen={favoritesModalOpen}
        onClose={() => setFavoritesModalOpen(false)}
        favorites={favorites}
        highlights={highlights}
        onRemoveFavorite={(vKey) => {
          const updated = storage.toggleFavorite(vKey);
          setFavorites([...updated]);
        }}
        onRemoveHighlight={(vKey) => {
          const updated = storage.saveHighlight(vKey, null);
          setHighlights({ ...updated });
        }}
        onGoToPassage={(vKey) => {
          setFavoritesModalOpen(false);
          setCurrentView('reader');
        }}
      />

      {/* Rodapé sutil */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] text-center text-xs text-zinc-400 dark:text-zinc-500">
        <p>Bíblia em 1 Ano • Nova Versão Transformadora (NVT)</p>
        <p className="mt-1">Desenvolvido para sua caminhada diária de fé e oração.</p>
      </footer>

    </div>
  );
}
