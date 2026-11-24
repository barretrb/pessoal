import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SidebarDrawer from './components/SidebarDrawer';
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
import MapasBiblicosModal from './components/MapasBiblicosModal';
import PlanoDevocionalOnboardingModal from './components/PlanoDevocionalOnboardingModal';
import SelecaoPerfilScreen from './components/SelecaoPerfilScreen';
import PersonalizarDashboardModal from './components/PersonalizarDashboardModal';
import UsoFeaturesModal from './components/UsoFeaturesModal';

import initialDays from './data/plano365.json';
import lucasData from './data/lucas_nvt.json';
import { storage, DEFAULT_DASHBOARD_LAYOUT } from './services/storage';
import { cloudDbService } from './services/cloudDbService';
import { getTodayDay, getPendingDays, formatDateBR } from './services/dateUtils';
import { fetchBookData, parseReading } from './services/bibleService';
import { telemetryService } from './services/telemetryService';
import { supabaseSyncService } from './services/supabaseSyncService';
import confetti from 'canvas-confetti';

export default function App() {
  const savedSettings = storage.getSettings();
  const [theme, setTheme] = useState(savedSettings.theme || 'light');
  const [redLetterEnabled, setRedLetterEnabled] = useState(savedSettings.redLetters ?? true);

  // 1. SISTEMA DE PERFIS
  const [profiles, setProfiles] = useState(() => storage.getProfiles());
  const [activeProfileId, setActiveProfileId] = useState(() => storage.getActiveProfileId());
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || { name: 'Rafael', avatar: '👨', role: 'admin' };

  // 2. LAYOUT DO DASHBOARD
  const [dashboardLayout, setDashboardLayout] = useState(() => storage.getDashboardLayout(activeProfileId));

  // 3. PROGRESSO DOS 365 DIAS E CAPÍTULOS
  const [days, setDays] = useState(() => storage.getProgress(initialDays, activeProfileId));
  const [chapterProgress, setChapterProgress] = useState(() => storage.getChapterProgress(activeProfileId));

  // Cálculo dinâmico do dia de hoje e pendências
  const todayDay = getTodayDay(days) || days[327] || days[305];
  const currentDayId = todayDay.id;

  const isRafael = activeProfile?.id === 'default' || activeProfile?.name?.trim().toLowerCase() === 'rafael' || activeProfile?.role === 'admin';
  const isPlanActive = activeProfile?.planOptIn !== false;
  const userStartDayId = isRafael ? 1 : (activeProfile?.startDayId || currentDayId);
  const allPendingDays = isPlanActive ? getPendingDays(days, currentDayId, chapterProgress, userStartDayId) : [];
  const pendingDayId = allPendingDays.length > 0 ? allPendingDays[0].id : null;

  // Visualização e Seleção
  const [selectedDayId, setSelectedDayId] = useState(currentDayId);
  const currentDayData = days.find(d => d.id === selectedDayId) || todayDay;
  const currentDayReading = currentDayData?.readings?.[0] ? parseReading(currentDayData.readings[0]) : { book: '1 Coríntios', chapter: '14' };

  const [currentView, setCurrentView] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Estado para Leitura Livre
  const [isFreeReading, setIsFreeReading] = useState(false);
  const [freeReadingBook, setFreeReadingBook] = useState('Mateus');
  const [freeReadingChapter, setFreeReadingChapter] = useState(1);
  const [currentBookData, setCurrentBookData] = useState(lucasData);
  const [dayBookData, setDayBookData] = useState(lucasData);
  const [loadingBook, setLoadingBook] = useState(false);

  const activeBookName = isFreeReading ? freeReadingBook : (currentDayReading.book || '1 Coríntios');

  // Sincroniza e carrega o livro bíblico correto para a leitura do dia
  useEffect(() => {
    if (isFreeReading) return;
    const targetBook = currentDayReading.book || 'Lucas';
    let isMounted = true;
    fetchBookData(targetBook).then(data => {
      if (isMounted && data) {
        setDayBookData(data);
      }
    });
    return () => { isMounted = false; };
  }, [selectedDayId, currentDayReading.book, isFreeReading]);

  // Modais e Drawers
  const [bibleArcData, setBibleArcData] = useState({ isOpen: false, book: '', chapter: '', verses: [], passage: '', text: '' });
  const [referencesData, setReferencesData] = useState({ isOpen: false, verseKey: '', sourceText: '', references: [] });
  const [commentaryData, setCommentaryData] = useState({ isOpen: false, chapterData: null });
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [usageMetricsOpen, setUsageMetricsOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  
  const [bibleNavOpen, setBibleNavOpen] = useState(false);
  const [studyModalData, setStudyModalData] = useState({ isOpen: false, bookName: activeBookName });
  const [pinModalData, setPinModalData] = useState({ isOpen: false, targetProfile: null });
  const [mapasModalData, setMapasModalData] = useState({ isOpen: false, placeId: null });
  
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

  const handleSelectProfile = (newId) => {
    setActiveProfileId(newId);
    storage.setActiveProfileId(newId);
    setDays(storage.getProgress(initialDays, newId));
    setChapterProgress(storage.getChapterProgress(newId));
    setFavorites(storage.getFavorites(newId));
    setHighlights(storage.getHighlights(newId));
    setDashboardLayout(storage.getDashboardLayout(newId));
  };

  const handleSelectProfileRequest = (targetProfile) => {
    if (targetProfile.id === activeProfileId) {
      setProfileModalOpen(false);
      return;
    }
    if (targetProfile.requiresPin && targetProfile.pin) {
      setPinModalData({ isOpen: true, targetProfile });
    } else {
      handleSelectProfile(targetProfile.id);
      setProfileModalOpen(false);
    }
  };

  const handlePinSuccess = (enteredPin, isForceUnlock = false) => {
    if (!pinModalData.targetProfile) return false;
    if (isForceUnlock) {
      storage.updateAdminPin('1234');
      handleSelectProfile(pinModalData.targetProfile.id);
      setProfileModalOpen(false);
      setPinModalData({ isOpen: false, targetProfile: null });
      return true;
    }
    const isValid = storage.verifyProfilePin(pinModalData.targetProfile.id, enteredPin);
    if (isValid) {
      handleSelectProfile(pinModalData.targetProfile.id);
      setProfileModalOpen(false);
      setPinModalData({ isOpen: false, targetProfile: null });
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

  const handleUpdateProfile = (profileId, updates) => {
    const updated = storage.updateProfile(profileId, updates);
    setProfiles([...updated]);
    cloudDbService.triggerAutoSync();
  };

  const handleAcceptPlan = () => {
    const todayStr = todayDay?.date || new Date().toISOString().split('T')[0];
    handleUpdateProfile(activeProfileId, {
      planOptIn: true,
      planStartDate: todayStr,
      startDayId: currentDayId
    });
  };

  const handleLogout = () => {
    storage.logout();
    setActiveProfileId(null);
  };

  const handleDeclinePlan = () => {
    handleUpdateProfile(activeProfileId, {
      planOptIn: false,
      planStartDate: null,
      startDayId: null
    });
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
    setDays([...storage.getProgress(initialDays, actId)]);
    setChapterProgress({ ...storage.getChapterProgress(actId) });
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
    cloudDbService.fetchAndMergeLatest().then(updated => {
      if (updated) handleDataSyncedFromCloud();
    });
    telemetryService.fetchCloudTelemetry();

    const handleFocusSync = () => {
      if (document.visibilityState === 'visible') {
        cloudDbService.fetchAndMergeLatest().then(updated => {
          if (updated) handleDataSyncedFromCloud();
        });
        telemetryService.fetchCloudTelemetry();
      }
    };

    window.addEventListener('focus', handleFocusSync);
    document.addEventListener('visibilitychange', handleFocusSync);

    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        cloudDbService.fetchAndMergeLatest().then(updated => {
          if (updated) handleDataSyncedFromCloud();
        });
        telemetryService.fetchCloudTelemetry();
      }
    }, 4000);

    const unsubSupabase = supabaseSyncService.onRemoteUpdate(() => {
      handleDataSyncedFromCloud();
    });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleFocusSync);
      if (unsubSupabase) unsubSupabase();
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

  const handleToggleComplete = (dayId, status) => {
    telemetryService.track('day_completed', { dayId, status });
    storage.saveDayProgress(dayId, status, activeProfileId);
    supabaseSyncService.saveDayProgress(dayId, status);

    const targetDay = days.find(d => d.id === dayId);
    if (targetDay) {
      const updatedCh = storage.setDayChaptersProgress(targetDay.readings, status, activeProfileId);
      setChapterProgress({ ...updatedCh });
      targetDay.readings.forEach(r => {
        const p = parseReading(r);
        supabaseSyncService.saveChapterProgress(p.book, p.chapter, status);
      });
    }
    setDays(prevDays => 
      prevDays.map(d => d.id === dayId ? { ...d, completed: status, completedAt: status ? new Date().toISOString() : null } : d)
    );
    cloudDbService.triggerAutoSync();
  };

  const handleToggleChapter = (chapterName, status) => {
    telemetryService.track('chapter_completed', { chapter: chapterName, status });
    const updated = storage.saveChapterProgress(chapterName, status, activeProfileId);
    setChapterProgress({ ...updated });

    const p = parseReading(chapterName);
    supabaseSyncService.saveChapterProgress(p.book, p.chapter, status);

    const matchingDays = days.filter(d => d.readings && d.readings.includes(chapterName));
    matchingDays.forEach(matchingDay => {
      const allCompleted = matchingDay.readings.every(r => 
        r === chapterName ? status : !!updated[r]?.completed
      );
      
      if (allCompleted && !matchingDay.completed) {
        storage.saveDayProgress(matchingDay.id, true, activeProfileId);
        supabaseSyncService.saveDayProgress(matchingDay.id, true);
        setDays(prev => prev.map(d => d.id === matchingDay.id ? { ...d, completed: true, completedAt: new Date().toISOString() } : d));
        try {
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      } else if (!allCompleted && matchingDay.completed) {
        storage.saveDayProgress(matchingDay.id, false, activeProfileId);
        supabaseSyncService.saveDayProgress(matchingDay.id, false);
        setDays(prev => prev.map(d => d.id === matchingDay.id ? { ...d, completed: false, completedAt: null } : d));
      }
    });

    cloudDbService.syncNow();
  };

  const handleSelectDay = (dayId) => {
    setSelectedDayId(dayId);
    setIsFreeReading(false);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setStudyModalData({ isOpen: true, bookName: bookName || activeBookName });
  };

  if (!activeProfileId) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] dark:bg-zinc-950 sepia:bg-[#f6ecda] flex flex-col justify-center">
        <SelecaoPerfilScreen
          existingProfiles={profiles.filter(p => p.id !== 'esposa' && p.name?.toLowerCase() !== 'esposa')}
          onSelectProfileRequest={handleSelectProfileRequest}
          onCreateProfile={handleCreateProfile}
        />
        <PinAuthModal
          isOpen={pinModalData.isOpen}
          onClose={() => setPinModalData({ isOpen: false, targetProfile: null })}
          targetProfileName={pinModalData.targetProfile?.name}
          onSuccess={handlePinSuccess}
        />
      </div>
    );
  }

  const completedDaysCount = days.filter(d => d.completed).length;

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[#F8F6F1] dark:bg-zinc-950 sepia:bg-[#f6ecda] text-zinc-900 dark:text-zinc-100 sepia:text-[#3b2d1d] flex flex-col font-sans">
      
      {/* Menu Lateral */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeProfile={activeProfile}
        activeBookName={activeBookName}
        onOpenProfiles={() => setProfileModalOpen(true)}
        onOpenMaps={() => setMapasModalData({ isOpen: true, placeId: null })}
        onOpenBibleNav={() => setBibleNavOpen(true)}
        onOpenStudyInfo={handleOpenStudyInfo}
        onOpenMetrics={() => setUsageMetricsOpen(true)}
        onOpenCustomize={() => setCustomizeModalOpen(true)}
        onOpenFavorites={() => {
          setFavorites(storage.getFavorites(activeProfileId));
          setHighlights(storage.getHighlights(activeProfileId));
          setFavoritesModalOpen(true);
        }}
        redLetterEnabled={redLetterEnabled}
        setRedLetterEnabled={(val) => {
          telemetryService.track('red_letter_toggle', { enabled: val });
          setRedLetterEnabled(val);
        }}
        theme={theme}
        setTheme={setTheme}
        onLogout={handleLogout}
        completedDaysCount={completedDaysCount}
      />

      {/* Barra Superior Editorial */}
      <Navbar
        currentDayId={currentDayId}
        pendingDayId={pendingDayId}
        activeBookName={activeBookName}
        onSelectDay={handleSelectDay}
        currentView={currentView}
        setCurrentView={(view) => {
          setIsFreeReading(false);
          setCurrentView(view);
        }}
        theme={theme}
        setTheme={setTheme}
        redLetterEnabled={redLetterEnabled}
        setRedLetterEnabled={(val) => {
          telemetryService.track('red_letter_toggle', { enabled: val });
          setRedLetterEnabled(val);
        }}
        onOpenFavorites={() => {
          setFavorites(storage.getFavorites(activeProfileId));
          setHighlights(storage.getHighlights(activeProfileId));
          setFavoritesModalOpen(true);
        }}
        onOpenBibleNav={() => {
          telemetryService.track('free_bible_nav');
          setBibleNavOpen(true);
        }}
        onOpenStudyInfo={handleOpenStudyInfo}
        activeProfile={activeProfile}
        onOpenProfiles={() => setProfileModalOpen(true)}
        onOpenMaps={() => setMapasModalData({ isOpen: true, placeId: null })}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onLogout={handleLogout}
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
            onToggleChapter={handleToggleChapter}
            chapterProgress={chapterProgress}
            onOpenBibleNav={() => {
              telemetryService.track('free_bible_nav');
              setBibleNavOpen(true);
            }}
            onOpenStudyInfo={handleOpenStudyInfo}
            activeProfile={activeProfile}
            onOpenProfiles={() => setProfileModalOpen(true)}
            dashboardLayout={dashboardLayout}
            onUpdateDashboardLayout={handleUpdateDashboardLayout}
            onResetDashboardLayout={handleResetDashboardLayout}
            onOpenMaps={() => setMapasModalData({ isOpen: true, placeId: null })}
            onOpenTelemetry={() => setUsageMetricsOpen(true)}
            onOpenCustomize={() => setCustomizeModalOpen(true)}
            onOpenBibleArc={(book, chapter) => {
              setBibleArcData({ 
                isOpen: true, 
                book: book || activeBookName, 
                chapter: chapter || 1, 
                verses: [], 
                passage: `${book || activeBookName} ${chapter || 1}`, 
                text: '' 
              });
            }}
            onOptInPlan={handleAcceptPlan}
            onOptOutPlan={handleDeclinePlan}
            onLogout={handleLogout}
          />
        ) : (
          <LeitorBiblico
            dayData={isFreeReading ? null : currentDayData}
            bookData={isFreeReading ? currentBookData : dayBookData}
            currentBookName={isFreeReading ? freeReadingBook : currentDayReading.book}
            currentChapter={isFreeReading ? freeReadingChapter : currentDayReading.chapter}
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
            onOpenBibleArc={(book, chapter, verses, passage, text) => {
              setBibleArcData({ 
                isOpen: true, 
                book, 
                chapter, 
                verses: verses || [], 
                passage: passage || `${book} ${chapter}`, 
                text: text || '' 
              });
            }}
            onOpenReferences={(verseKey, references, sourceText = '') => {
              setReferencesData({ isOpen: true, verseKey, sourceText, references });
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
            onOpenMaps={(placeId) => setMapasModalData({ isOpen: true, placeId })}
          />
        )}
      </main>

      {/* Barra de Navegação Inferior Móvel */}
      <BottomNav
        currentView={currentView}
        onGoHome={() => {
          setIsFreeReading(false);
          setCurrentView('dashboard');
        }}
        onOpenBibleNav={() => {
          telemetryService.track('free_bible_nav');
          setBibleNavOpen(true);
        }}
        onOpenStudyInfo={() => {
          telemetryService.track('theological_commentary_view', { book: activeBookName });
          handleOpenStudyInfo(activeBookName);
        }}
        onOpenFavorites={() => {
          setFavorites(storage.getFavorites(activeProfileId));
          setHighlights(storage.getHighlights(activeProfileId));
          setFavoritesModalOpen(true);
        }}
        pendingDayId={pendingDayId}
      />

      {/* Modais Globais */}
      <PerfilModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfileRequest={handleSelectProfileRequest}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onUpdateAdminPin={handleUpdateAdminPin}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        getProfileProgressStats={getProfileProgressStats}
      />

      <PinAuthModal
        isOpen={pinModalData.isOpen}
        onClose={() => setPinModalData({ isOpen: false, targetProfile: null })}
        targetProfileName={pinModalData.targetProfile?.name || 'Administrador'}
        onSuccess={handlePinSuccess}
      />

      <MapasBiblicosModal
        isOpen={mapasModalData.isOpen}
        onClose={() => setMapasModalData({ isOpen: false, placeId: null })}
        initialPlaceId={mapasModalData.placeId}
      />

      <NavegacaoBibliaModal
        isOpen={bibleNavOpen}
        onClose={() => setBibleNavOpen(false)}
        onSelectChapter={handleSelectFreeChapter}
        onOpenStudyInfo={handleOpenStudyInfo}
        chapterProgress={chapterProgress}
      />

      <EstudoLivroModal
        isOpen={studyModalData.isOpen}
        onClose={() => setStudyModalData({ ...studyModalData, isOpen: false })}
        initialBookName={studyModalData.bookName}
        onSelectChapterToRead={(bookName, ch) => {
          setStudyModalData({ isOpen: false, bookName });
          handleSelectFreeChapter(bookName, ch || 1);
        }}
      />

      <BibleArcModal
        key={`${bibleArcData.book}_${bibleArcData.chapter}_${bibleArcData.passage}_${bibleArcData.isOpen}`}
        isOpen={bibleArcData.isOpen}
        onClose={() => setBibleArcData({ ...bibleArcData, isOpen: false })}
        bookName={bibleArcData.book}
        chapter={bibleArcData.chapter}
        chapterVerses={bibleArcData.verses}
        initialPassage={bibleArcData.passage}
        initialText={bibleArcData.text}
      />

      <ReferenciasDrawer
        isOpen={referencesData.isOpen}
        onClose={() => setReferencesData({ ...referencesData, isOpen: false })}
        verseKey={referencesData.verseKey}
        sourceText={referencesData.sourceText}
        references={referencesData.references}
        onNavigateToPassage={handleSelectFreeChapter}
      />

      <ComentariosDrawer
        isOpen={commentaryData.isOpen}
        onClose={() => setCommentaryData({ ...commentaryData, isOpen: false })}
        chapterData={commentaryData.chapterData}
      />

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
        onGoToPassage={(vKey, book, chapter) => {
          setFavoritesModalOpen(false);
          if (book) {
            handleSelectFreeChapter(book, chapter || 1);
          } else {
            setCurrentView('reader');
          }
        }}
      />

      <PersonalizarDashboardModal
        isOpen={customizeModalOpen}
        onClose={() => setCustomizeModalOpen(false)}
        layout={dashboardLayout}
        onUpdateLayout={handleUpdateDashboardLayout}
        onResetLayout={handleResetDashboardLayout}
      />

      <UsoFeaturesModal
        isOpen={usageMetricsOpen}
        onClose={() => setUsageMetricsOpen(false)}
        activeProfile={activeProfile}
      />

      <PlanoDevocionalOnboardingModal
        isOpen={!!(activeProfile && (activeProfile.planOptIn === null || activeProfile.planOptIn === undefined))}
        profileName={activeProfile?.name}
        todayDayId={currentDayId}
        todayDateFormatted={formatDateBR(todayDay?.date, true) || 'hoje'}
        onAcceptPlan={handleAcceptPlan}
        onDeclinePlan={handleDeclinePlan}
      />

      {/* Rodapé Editorial */}
      <footer className="py-6 border-t border-stone-200/80 dark:border-zinc-800 sepia:border-[#dfd0b2] text-center text-xs text-zinc-500 dark:text-zinc-500 space-y-1">
        <p className="flex items-center justify-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Sincronização em nuvem ativa • {activeProfile?.name || 'Individual'}</span>
        </p>
        <p className="font-display text-sm text-zinc-700 dark:text-zinc-300">Bíblia de Estudos & Plano Anual • Nova Versão Transformadora (NVT)</p>
      </footer>

    </div>
  );
}
