import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LeitorBiblico from './components/LeitorBiblico';
import BibleArcModal from './components/BibleArcModal';
import ReferenciasDrawer from './components/ReferenciasDrawer';
import ComentariosDrawer from './components/ComentariosDrawer';
import DestaquesModal from './components/DestaquesModal';
import NavegacaoBibliaModal from './components/NavegacaoBibliaModal';
import EstudoLivroModal from './components/EstudoLivroModal';

import initialDays from './data/plano365.json';
import lucasData from './data/lucas_nvt.json';
import { storage } from './services/storage';
import { getTodayDay, getPendingDays } from './services/dateUtils';
import confetti from 'canvas-confetti';

export default function App() {
  // Configurações
  const savedSettings = storage.getSettings();
  const [theme, setTheme] = useState(savedSettings.theme || 'light');
  const [redLetterEnabled, setRedLetterEnabled] = useState(savedSettings.redLetters ?? true);

  // Progresso dos 365 dias
  const [days, setDays] = useState(() => storage.getProgress(initialDays));

  // Progresso individual de capítulos (Item 2)
  const [chapterProgress, setChapterProgress] = useState(() => storage.getChapterProgress());

  // Cálculo DINÂMICO da data de hoje e pendências (Item 3)
  const todayDay = getTodayDay(days) || days[298];
  const currentDayId = todayDay.id; // Ex: Dia 299 para 26 de Outubro

  // Encontrar todas as pendências anteriores a hoje
  const allPendingDays = getPendingDays(days, currentDayId);
  const pendingDayId = allPendingDays.length > 0 ? allPendingDays[0].id : null;

  // Visualização e Seleção
  const [selectedDayId, setSelectedDayId] = useState(currentDayId);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'reader'
  const [isFreeReading, setIsFreeReading] = useState(false);
  const [freeReadingChapter, setFreeReadingChapter] = useState(null);

  // Modais e Drawers
  const [bibleArcData, setBibleArcData] = useState({ isOpen: false, passage: '', text: '' });
  const [referencesData, setReferencesData] = useState({ isOpen: false, verseKey: '', references: [] });
  const [commentaryData, setCommentaryData] = useState({ isOpen: false, chapterData: null });
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  
  // Modais de Navegação Livre da Bíblia e Bíblia de Estudos (Itens 6 e 7)
  const [bibleNavOpen, setBibleNavOpen] = useState(false);
  const [studyModalData, setStudyModalData] = useState({ isOpen: false, bookName: 'Lucas' });

  // Favoritos e Highlights para gerenciar no modal
  const [favorites, setFavorites] = useState(storage.getFavorites());
  const [highlights, setHighlights] = useState(storage.getHighlights());

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

  // Handler para marcar dia inteiro como concluído
  const handleToggleComplete = (dayId, status) => {
    storage.saveDayProgress(dayId, status);
    const targetDay = days.find(d => d.id === dayId);
    if (targetDay) {
      const updatedCh = storage.setDayChaptersProgress(targetDay.readings, status);
      setChapterProgress({ ...updatedCh });
    }
    setDays(prevDays => 
      prevDays.map(d => d.id === dayId ? { ...d, completed: status, completedAt: status ? new Date().toISOString() : null } : d)
    );
  };

  // Handler para marcar cada capítulo individualmente (Item 2)
  const handleToggleChapter = (chapterName, status) => {
    const updated = storage.saveChapterProgress(chapterName, status);
    setChapterProgress({ ...updated });

    // Verificar se todos os capítulos do dia atual foram concluídos
    const activeDay = days.find(d => d.id === selectedDayId);
    if (activeDay) {
      const allCompleted = activeDay.readings.every(r => 
        r === chapterName ? status : !!updated[r]?.completed
      );
      
      if (allCompleted && !activeDay.completed) {
        // Marca o dia todo automaticamente como concluído
        storage.saveDayProgress(activeDay.id, true);
        setDays(prev => prev.map(d => d.id === activeDay.id ? { ...d, completed: true, completedAt: new Date().toISOString() } : d));
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      } else if (!allCompleted && activeDay.completed) {
        // Desmarca o dia todo se algum capítulo for desmarcado
        storage.saveDayProgress(activeDay.id, false);
        setDays(prev => prev.map(d => d.id === activeDay.id ? { ...d, completed: false, completedAt: null } : d));
      }
    }
  };

  // Navegar para um dia específico no leitor do plano devocional
  const handleSelectDay = (dayId) => {
    setSelectedDayId(dayId);
    setIsFreeReading(false);
    setFreeReadingChapter(null);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navegar para capítulo fora do plano devocional (Item 6)
  const handleSelectFreeChapter = (bookName, chapterNum) => {
    if (bookName === 'Lucas') {
      setIsFreeReading(true);
      setFreeReadingChapter(chapterNum);
      setCurrentView('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Abre as informações de estudo do livro
      setStudyModalData({ isOpen: true, bookName });
    }
  };

  const handleOpenStudyInfo = (bookName) => {
    setStudyModalData({ isOpen: true, bookName: bookName || 'Lucas' });
  };

  const currentDayData = days.find(d => d.id === selectedDayId) || todayDay;

  return (
    <div className="min-h-screen transition-colors duration-200 bg-zinc-50 dark:bg-zinc-950 sepia:bg-[#fbf0d9] text-zinc-900 dark:text-zinc-100 sepia:text-[#433422] flex flex-col font-sans">
      
      {/* Barra de Navegação */}
      <Navbar
        currentDayId={currentDayId}
        pendingDayId={pendingDayId}
        onSelectDay={handleSelectDay}
        currentView={currentView}
        setCurrentView={(view) => {
          setIsFreeReading(false);
          setCurrentView(view);
        }}
        theme={theme}
        setTheme={setTheme}
        redLetterEnabled={redLetterEnabled}
        setRedLetterEnabled={setRedLetterEnabled}
        onOpenFavorites={() => {
          setFavorites(storage.getFavorites());
          setHighlights(storage.getHighlights());
          setFavoritesModalOpen(true);
        }}
        onOpenBibleNav={() => setBibleNavOpen(true)}
        onOpenStudyInfo={handleOpenStudyInfo}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' ? (
          <Dashboard
            days={days}
            currentDayId={currentDayId}
            pendingDayId={pendingDayId}
            allPendingDays={allPendingDays}
            onSelectDay={handleSelectDay}
            onToggleComplete={handleToggleComplete}
            chapterProgress={chapterProgress}
            onOpenBibleNav={() => setBibleNavOpen(true)}
            onOpenStudyInfo={handleOpenStudyInfo}
          />
        ) : (
          <LeitorBiblico
            dayData={isFreeReading ? null : currentDayData}
            lucasData={lucasData}
            onBack={() => {
              setIsFreeReading(false);
              setCurrentView('dashboard');
            }}
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
            chapterProgress={chapterProgress}
            onToggleChapter={handleToggleChapter}
            onOpenStudyInfo={handleOpenStudyInfo}
            isFreeReading={isFreeReading}
            freeReadingChapter={freeReadingChapter}
          />
        )}
      </main>

      {/* Modal Navegação Livre da Bíblia (Item 6) */}
      <NavegacaoBibliaModal
        isOpen={bibleNavOpen}
        onClose={() => setBibleNavOpen(false)}
        onSelectChapter={handleSelectFreeChapter}
        onOpenStudyInfo={handleOpenStudyInfo}
        chapterProgress={chapterProgress}
      />

      {/* Modal Bíblia de Estudos com Acordeões Retráteis (Item 7) */}
      <EstudoLivroModal
        isOpen={studyModalData.isOpen}
        onClose={() => setStudyModalData({ ...studyModalData, isOpen: false })}
        initialBookName={studyModalData.bookName}
        onSelectChapterToRead={(bookName, ch) => handleSelectFreeChapter(bookName, ch)}
      />

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
