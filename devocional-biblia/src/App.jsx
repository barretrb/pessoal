import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import LeitorBiblico from './components/LeitorBiblico';
import BibleArcModal from './components/BibleArcModal';
import ReferenciasDrawer from './components/ReferenciasDrawer';
import ComentariosDrawer from './components/ComentariosDrawer';
import DestaquesModal from './components/DestaquesModal';
import NavegacaoBibliaModal from './components/NavegacaoBibliaModal';
import EstudoLivroModal from './components/EstudoLivroModal';
import PerfilModal from './components/PerfilModal';
import PinAuthModal from './components/PinAuthModal';
import CloudSyncModal from './components/CloudSyncModal';

import initialDays from './data/plano365.json';
import lucasData from './data/lucas_nvt.json';
import { storage, DEFAULT_DASHBOARD_LAYOUT } from './services/storage';
import { cloudDbService } from './services/cloudDbService';
import { getTodayDay, getPendingDays } from './services/dateUtils';
import { fetchBookData } from './services/bibleService';
import confetti from 'canvas-confetti';

export default function App() {
  // Configurações
  const savedSettings = storage.getSettings();
  const [theme, setTheme] = useState(savedSettings.theme || 'light');
  const [redLetterEnabled, setRedLetterEnabled] = useState(savedSettings.redLetters ?? true);

  // 1. SISTEMA DE PERFIS (MULTI-CONTA: RAFAEL, ESPOSA, ETC.)
  const [profiles, setProfiles] = useState(() => storage.getProfiles());
  const [activeProfileId, setActiveProfileId] = useState(() => storage.getActiveProfileId());
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || { name: 'Rafael', avatar: '👨' };

  // 2. LAYOUT DO DASHBOARD (REORDENAÇÃO, COLAPSO E OCULTAÇÃO)
  const [dashboardLayout, setDashboardLayout] = useState(() => storage.getDashboardLayout(activeProfileId));

  // 3. PROGRESSO DOS 365 DIAS (POR PERFIL)
  const [days, setDays] = useState(() => storage.getProgress(initialDays, activeProfileId));

  // 4. PROGRESSO INDIVIDUAL DE CAPÍTULOS (POR PERFIL)
  const [chapterProgress, setChapterProgress] = useState(() => storage.getChapterProgress(activeProfileId));

  // Cálculo DINÂMICO da data de hoje e pendências
  const todayDay = getTodayDay(days) || days[298];
  const currentDayId = todayDay.id;

  // Encontrar todas as pendências anteriores a hoje
  const allPendingDays = getPendingDays(days, currentDayId);
  const pendingDayId = allPendingDays.length > 0 ? allPendingDays[0].id : null;

  // Visualização e Seleção
  const [selectedDayId, setSelectedDayId] = useState(currentDayId);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'reader'
  
  // Estado para Leitura Livre de qualquer livro da Bíblia
  const [isFreeReading, setIsFreeReading] = useState(false);
  const [freeReadingBook, setFreeReadingBook] = useState('Mateus');
  const [freeReadingChapter, setFreeReadingChapter] = useState(1);
  const [currentBookData, setCurrentBookData] = useState(lucasData);
  const [loadingBook, setLoadingBook] = useState(false);

  // Modais e Drawers
  const [bibleArcData, setBibleArcData] = useState({ isOpen: false, passage: '', text: '' });
  const [referencesData, setReferencesData] = useState({ isOpen: false, verseKey: '', references: [] });
  const [commentaryData, setCommentaryData] = useState({ isOpen: false, chapterData: null });
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  
  // Modais de Navegação Livre da Bíblia e Bíblia de Estudos
  const [bibleNavOpen, setBibleNavOpen] = useState(false);
  const [studyModalData, setStudyModalData] = useState({ isOpen: false, bookName: 'Lucas' });

  // Modal de Autenticação por PIN (Proteção do Rafael Admin contra acesso da esposa)
  const [pinModalData, setPinModalData] = useState({ isOpen: false, targetProfile: null });

  // Modal de Nuvem & Sincronização em múltiplos aparelhos
  const [cloudModalOpen, setCloudModalOpen] = useState(false);

  // Favoritos e Highlights do perfil ativo
  const [favorites, setFavorites] = useState(() => storage.getFavorites(activeProfileId));
  const [highlights, setHighlights] = useState(() => storage.getHighlights(activeProfileId));

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

  // Alternar perfil ativo
  const handleSelectProfile = (newId) => {
    setActiveProfileId(newId);
    storage.setActiveProfileId(newId);
    setDays(storage.getProgress(initialDays, newId));
    setChapterProgress(storage.getChapterProgress(newId));
    setFavorites(storage.getFavorites(newId));
    setHighlights(storage.getHighlights(newId));
    setDashboardLayout(storage.getDashboardLayout(newId));
  };

  // Solicitação de troca de perfil com verificação de PIN de segurança
  const handleSelectProfileRequest = (targetProfile) => {
    if (targetProfile.id === activeProfileId) {
      setProfileModalOpen(false);
      return;
    }

    // Se o perfil de destino requer PIN (ex: Rafael Admin)
    if (targetProfile.requiresPin && targetProfile.pin) {
      setPinModalData({ isOpen: true, targetProfile });
    } else {
      handleSelectProfile(targetProfile.id);
      setProfileModalOpen(false);
    }
  };

  const handlePinSuccess = (enteredPin) => {
    if (!pinModalData.targetProfile) return false;
    const isValid = storage.verifyProfilePin(pinModalData.targetProfile.id, enteredPin);
    if (isValid) {
      handleSelectProfile(pinModalData.targetProfile.id);
      setProfileModalOpen(false);
      return true;
    }
    return false;
  };

  const handleUpdateAdminPin = (newPin) => {
    storage.updateAdminPin(newPin);
    setProfiles([...storage.getProfiles()]);
  };

  const handleCreateProfile = (name, avatar, color, role = 'member', pin = '') => {
    const newProf = storage.createProfile(name, avatar, color, role, pin);
    setProfiles([...storage.getProfiles()]);
    handleSelectProfile(newProf.id);
  };

  const handleDeleteProfile = (profileId) => {
    const updated = storage.deleteProfile(profileId);
    setProfiles([...updated]);
    const currentActive = storage.getActiveProfileId();
    handleSelectProfile(currentActive);
  };

  const handleDataSyncedFromCloud = () => {
    const profs = storage.getProfiles();
    const actId = storage.getActiveProfileId();
    setProfiles(profs);
    setActiveProfileId(actId);
    setDays(storage.getProgress(initialDays, actId));
    setChapterProgress(storage.getChapterProgress(actId));
    setFavorites(storage.getFavorites(actId));
    setHighlights(storage.getHighlights(actId));
    setDashboardLayout(storage.getDashboardLayout(actId));
  };

  const getProfileProgressStats = (pId) => {
    const pDays = storage.getProgress(initialDays, pId);
    const completedDays = pDays.filter(d => d.completed).length;
    return {
      completedDays,
      percent: Math.round((completedDays / 365) * 100)
    };
  };

  // AUTO-SYNC 100% AUTOMÁTICO NA NUVEM
  useEffect(() => {
    // Sincronização inicial em segundo plano ao abrir o app
    cloudDbService.fetchAndMergeLatest().then(updated => {
      if (updated) handleDataSyncedFromCloud();
    });

    // Sincronizar automaticamente sempre que o usuário retornar à aba ou reabrir o app
    const handleFocusSync = () => {
      if (document.visibilityState === 'visible') {
        cloudDbService.fetchAndMergeLatest().then(updated => {
          if (updated) handleDataSyncedFromCloud();
        });
      }
    };

    window.addEventListener('focus', handleFocusSync);
    document.addEventListener('visibilitychange', handleFocusSync);
    return () => {
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleFocusSync);
    };
  }, []);

  const handleUpdateDashboardLayout = (newLayout) => {
    const saved = storage.saveDashboardLayout(newLayout, activeProfileId);
    setDashboardLayout({ ...saved });
    cloudDbService.triggerAutoSync();
  };

  const handleResetDashboardLayout = () => {
    const reset = storage.saveDashboardLayout(DEFAULT_DASHBOARD_LAYOUT, activeProfileId);
    setDashboardLayout({ ...reset });
    cloudDbService.triggerAutoSync();
  };

  // Handler para marcar dia inteiro como concluído
  const handleToggleComplete = (dayId, status) => {
    storage.saveDayProgress(dayId, status, activeProfileId);
    const targetDay = days.find(d => d.id === dayId);
    if (targetDay) {
      const updatedCh = storage.setDayChaptersProgress(targetDay.readings, status, activeProfileId);
      setChapterProgress({ ...updatedCh });
    }
    setDays(prevDays => 
      prevDays.map(d => d.id === dayId ? { ...d, completed: status, completedAt: status ? new Date().toISOString() : null } : d)
    );
    // Salva automaticamente no banco em nuvem sem o usuário precisar clicar em nada
    cloudDbService.triggerAutoSync();
  };

  // Handler para marcar cada capítulo individualmente
  const handleToggleChapter = (chapterName, status) => {
    const updated = storage.saveChapterProgress(chapterName, status, activeProfileId);
    setChapterProgress({ ...updated });

    // Verificar se todos os capítulos do dia atual foram concluídos (se estiver no plano)
    const activeDay = days.find(d => d.id === selectedDayId);
    if (activeDay && !isFreeReading) {
      const allCompleted = activeDay.readings.every(r => 
        r === chapterName ? status : !!updated[r]?.completed
      );
      
      if (allCompleted && !activeDay.completed) {
        storage.saveDayProgress(activeDay.id, true, activeProfileId);
        setDays(prev => prev.map(d => d.id === activeDay.id ? { ...d, completed: true, completedAt: new Date().toISOString() } : d));
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      } else if (!allCompleted && activeDay.completed) {
        storage.saveDayProgress(activeDay.id, false, activeProfileId);
        setDays(prev => prev.map(d => d.id === activeDay.id ? { ...d, completed: false, completedAt: null } : d));
      }
    }
    // Salva automaticamente no banco em nuvem
    cloudDbService.triggerAutoSync();
  };

  // Navegar para um dia específico no leitor do plano devocional
  const handleSelectDay = (dayId) => {
    setSelectedDayId(dayId);
    setIsFreeReading(false);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navegar para capítulo livre de QUALQUER livro da Bíblia (Gênesis a Apocalipse)
  const handleSelectFreeChapter = async (bookName, chapterNum) => {
    const bName = bookName || 'Mateus';
    const chNum = chapterNum || 1;
    setFreeReadingBook(bName);
    setFreeReadingChapter(chNum);
    setIsFreeReading(true);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setLoadingBook(true);
    try {
      const data = await fetchBookData(bName);
      setCurrentBookData(data);
    } catch (err) {
      console.error("Erro ao carregar livro bíblico:", err);
    } finally {
      setLoadingBook(false);
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
          setFavorites(storage.getFavorites(activeProfileId));
          setHighlights(storage.getHighlights(activeProfileId));
          setFavoritesModalOpen(true);
        }}
        onOpenBibleNav={() => setBibleNavOpen(true)}
        onOpenStudyInfo={handleOpenStudyInfo}
        activeProfile={activeProfile}
        onOpenProfiles={() => setProfileModalOpen(true)}
        onOpenCloud={() => setCloudModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 pb-24 md:pb-16 overflow-x-hidden">
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
            activeProfile={activeProfile}
            onOpenProfiles={() => setProfileModalOpen(true)}
            dashboardLayout={dashboardLayout}
            onUpdateDashboardLayout={handleUpdateDashboardLayout}
            onResetDashboardLayout={handleResetDashboardLayout}
            onOpenCloud={() => setCloudModalOpen(true)}
          />
        ) : (
          <LeitorBiblico
            dayData={isFreeReading ? null : currentDayData}
            bookData={isFreeReading ? currentBookData : lucasData}
            currentBookName={isFreeReading ? freeReadingBook : 'Lucas'}
            currentChapter={isFreeReading ? freeReadingChapter : '1'}
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
            isLoading={loadingBook}
            onChangeFreeChapter={handleSelectFreeChapter}
          />
        )}
      </main>

      {/* Barra de Navegação Inferior Móvel (Otimizada para Celular) */}
      <BottomNav
        currentView={currentView}
        onGoHome={() => {
          setIsFreeReading(false);
          setCurrentView('dashboard');
        }}
        onOpenBibleNav={() => setBibleNavOpen(true)}
        onOpenStudyInfo={() => handleOpenStudyInfo(isFreeReading ? freeReadingBook : 'Lucas')}
        onOpenFavorites={() => {
          setFavorites(storage.getFavorites(activeProfileId));
          setHighlights(storage.getHighlights(activeProfileId));
          setFavoritesModalOpen(true);
        }}
        pendingDayId={pendingDayId}
      />

      {/* Modal Multi-Perfil (Gerenciamento de Contas e Admin) */}
      <PerfilModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfileRequest={handleSelectProfileRequest}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onUpdateAdminPin={handleUpdateAdminPin}
        getProfileProgressStats={getProfileProgressStats}
      />

      {/* Modal de Autenticação por PIN (Proteção do Rafael Admin) */}
      <PinAuthModal
        isOpen={pinModalData.isOpen}
        onClose={() => setPinModalData({ isOpen: false, targetProfile: null })}
        targetProfileName={pinModalData.targetProfile?.name || 'Administrador'}
        onSuccess={handlePinSuccess}
      />

      {/* Modal de Sincronização em Nuvem (Multi-Aparelho & Backup) */}
      <CloudSyncModal
        isOpen={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        onDataSynced={handleDataSyncedFromCloud}
      />

      {/* Modal Navegação Livre da Bíblia */}
      <NavegacaoBibliaModal
        isOpen={bibleNavOpen}
        onClose={() => setBibleNavOpen(false)}
        onSelectChapter={handleSelectFreeChapter}
        onOpenStudyInfo={handleOpenStudyInfo}
        chapterProgress={chapterProgress}
      />

      {/* Modal Bíblia de Estudos com Acordeões Retráteis */}
      <EstudoLivroModal
        isOpen={studyModalData.isOpen}
        onClose={() => setStudyModalData({ ...studyModalData, isOpen: false })}
        initialBookName={studyModalData.bookName}
        onSelectChapterToRead={(bookName, ch) => {
          setStudyModalData({ isOpen: false, bookName });
          handleSelectFreeChapter(bookName, ch || 1);
        }}
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
          const updated = storage.toggleFavorite(vKey, null, activeProfileId);
          setFavorites([...updated]);
          cloudDbService.triggerAutoSync();
        }}
        onRemoveHighlight={(vKey) => {
          const updated = storage.saveHighlight(vKey, null, "", activeProfileId);
          setHighlights({ ...updated });
          cloudDbService.triggerAutoSync();
        }}
        onGoToPassage={(vKey) => {
          setFavoritesModalOpen(false);
          setCurrentView('reader');
        }}
      />

      {/* Rodapé com Indicador de Auto-Sync Automático */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 sepia:border-[#e6d3a7] text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
        <p className="flex items-center justify-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sincronização em nuvem automática ativa • Família Barreto</span>
        </p>
        <p>Bíblia em 1 Ano • Nova Versão Transformadora (NVT)</p>
        <p className="text-[11px]">Desenvolvido para sua caminhada diária de fé e oração.</p>
      </footer>

    </div>
  );
}
