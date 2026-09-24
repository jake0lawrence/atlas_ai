import { useEffect, useRef, useCallback } from "react";
import {
  TOPICS, TOUR_STORAGE_KEY, V6_TOUR_STEPS, V6_TOUR_STORAGE_KEY,
} from './data/constants';
import useWindowSize from './hooks/useWindowSize';
import useRouterSync from './hooks/useRouterSync';
import useStore from './store';
import ErrorBoundary from './components/ErrorBoundary';
import { FONTS, BODY, CSS } from './styles/base';
import { container } from './styles/shared';
import CommandPalette from './components/CommandPalette';
import Nav from './components/Nav';
import SyncOverlay from './components/SyncOverlay';
import GuidedTour from './components/GuidedTour';
import BriefingCard from './components/BriefingCard';
import CompanionSidebar from './components/CompanionSidebar';
import OnboardingView from './views/OnboardingView';
import LoadingView from './views/LoadingView';
import TimelineView from './views/TimelineView';
import AskAtlas from './views/AskAtlas';
import ConversationDrilldown from './views/ConversationDrilldown';
import ConnectionsView from './views/ConnectionsView';
import EvolutionView from './views/EvolutionView';
import ReviewQueue from './views/ReviewQueue';
import TopicCurationPanel from './views/TopicCurationPanel';
import ConnectionValidation from './views/ConnectionValidation';
import InsightDecisionReview from './views/InsightDecisionReview';
import CurationSummary from './views/CurationSummary';
import ExportPreview from './views/ExportPreview';
import BeliefDiffsView from './views/BeliefDiffsView';
import DigestView from './views/DigestView';
import LiveCaptureView from './views/LiveCaptureView';
import DecisionArchaeology from './views/DecisionArchaeology';
import RewindMode from './views/RewindMode';
import DashboardView from './views/DashboardView';
import { C, white } from './styles/tokens';

// ─── MAIN APP ───────────────────────────────────────────────

export default function App() {
  const { w } = useWindowSize();
  const mobile = w < 640;
  const tablet = w >= 640 && w < 1024;

  // ─── CENTRALIZED STATE (Zustand) ──────────────────
  const view = useStore(s => s.view);
  const setView = useStore(s => s.setView);
  const curationResults = useStore(s => s.curationResults);
  const recordCuration = useStore(s => s.recordCuration);
  const selectedTopic = useStore(s => s.selectedTopic);
  const setSelectedTopic = useStore(s => s.setSelectedTopic);
  const selectedEvent = useStore(s => s.selectedEvent);
  const setSelectedEvent = useStore(s => s.setSelectedEvent);
  const selectedChain = useStore(s => s.selectedChain);
  const setSelectedChain = useStore(s => s.setSelectedChain);
  const showRewind = useStore(s => s.showRewind);
  const setShowRewind = useStore(s => s.setShowRewind);
  const contradictions = useStore(s => s.contradictions);
  const resolvedContradictions = useStore(s => s.resolvedContradictions);
  const resolveContradiction = useStore(s => s.resolveContradiction);
  const lastSyncTime = useStore(s => s.lastSyncTime);
  const newSyncCount = useStore(s => s.newSyncCount);
  const isSyncing = useStore(s => s.isSyncing);
  const syncPhase = useStore(s => s.syncPhase);
  const syncProgress = useStore(s => s.syncProgress);
  const recentlySynced = useStore(s => s.recentlySynced);
  const syncedNewEvents = useStore(s => s.syncedNewEvents);
  const setIsSyncing = useStore(s => s.setIsSyncing);
  const setSyncPhase = useStore(s => s.setSyncPhase);
  const setSyncProgress = useStore(s => s.setSyncProgress);
  const completeSyncCycle = useStore(s => s.completeSyncCycle);
  const cmdPaletteOpen = useStore(s => s.cmdPaletteOpen);
  const setCmdPaletteOpen = useStore(s => s.setCmdPaletteOpen);
  const cmdPaletteQuery = useStore(s => s.cmdPaletteQuery);
  const companionSidebarOpen = useStore(s => s.companionSidebarOpen);
  const toggleCompanionSidebar = useStore(s => s.toggleCompanionSidebar);
  const briefingTopic = useStore(s => s.briefingTopic);
  const setBriefingTopic = useStore(s => s.setBriefingTopic);
  const tourActive = useStore(s => s.tourActive);
  const setTourActive = useStore(s => s.setTourActive);
  const v6TourActive = useStore(s => s.v6TourActive);
  const setV6TourActive = useStore(s => s.setV6TourActive);
  const handleTopicClick = useStore(s => s.handleTopicClick);
  const storeHandleEventClick = useStore(s => s.handleEventClick);
  const navigateTo = useStore(s => s.navigateTo);
  const toggleCmdPalette = useStore(s => s.toggleCmdPalette);
  useRouterSync();
  const tourLaunched = useRef(false);
  const appTimersRef = useRef([]);

  useEffect(() => {
    return () => appTimersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (view === "dashboard" && !tourLaunched.current) {
      tourLaunched.current = true;
      try {
        if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
          // New user: show full tour
          appTimersRef.current.push(setTimeout(() => setTourActive(true), 600));
        } else if (!localStorage.getItem(V6_TOUR_STORAGE_KEY)) {
          // Returning v5 user: show "What's New in v6" mini-tour
          appTimersRef.current.push(setTimeout(() => setV6TourActive(true), 600));
        }
      } catch (e) { console.warn('tour activation:', e); }
    }
  }, [view]);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      // Cmd+K / Ctrl+K — open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCmdPalette();
        return;
      }
      // Cmd+/ / Ctrl+/ — toggle companion sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        toggleCompanionSidebar();
        return;
      }
      // Escape — back out of drilldowns, or close command palette
      if (e.key === "Escape") {
        if (showRewind) { setShowRewind(false); return; }
        if (briefingTopic) { setBriefingTopic(null); return; }
        if (cmdPaletteOpen) return; // handled by CommandPalette itself
        if (view === "conversation") { setView("timeline"); setSelectedEvent(null); return; }
        if (view === "timeline") { setView("dashboard"); setSelectedTopic(null); return; }
        if (view === "companion") { setView("dashboard"); return; }
        if (view === "digest") { setView("dashboard"); return; }
        if (view === "liveCapture") { setView("dashboard"); return; }
        if (view === "archaeology") { setView("dashboard"); setSelectedChain(null); return; }
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [view, cmdPaletteOpen, briefingTopic, showRewind, toggleCmdPalette, toggleCompanionSidebar, setShowRewind, setBriefingTopic, setView, setSelectedEvent, setSelectedTopic, setSelectedChain]);

  const maxCount = Math.max(...TOPICS.map(t => t.count));
  const totalWords = TOPICS.reduce((a, t) => a + t.words, 0) + 680000;
  const totalConvos = 3847;

  const handleEventClick = useCallback((topicId, eventIndex) => { storeHandleEventClick(topicId, eventIndex); }, [storeHandleEventClick]);
  const handleStartProcessing = useCallback(() => setView("loading"), [setView]);
  const handleLoadingComplete = useCallback(() => setView("curation"), [setView]);
  // Each curation step hands its tally over as it finishes; the Summary reads them.
  const handleCurationComplete = useCallback((r) => { recordCuration("curation", r); setView("topicCuration"); }, [recordCuration, setView]);
  const handleTopicCurationComplete = useCallback((r) => { recordCuration("topicCuration", r); setView("connectionValidation"); }, [recordCuration, setView]);
  const handleConnectionValidationComplete = useCallback((r) => { recordCuration("connectionValidation", r); setView("insightReview"); }, [recordCuration, setView]);
  const handleInsightReviewComplete = useCallback((r) => { recordCuration("insightReview", r); setView("curationSummary"); }, [recordCuration, setView]);
  const handleCurationSummaryComplete = useCallback(() => setView("dashboard"), [setView]);
  const handleArchaeologyClick = useCallback((chainId) => { setSelectedChain(chainId); setView("archaeology"); }, [setSelectedChain, setView]);
  const handleNavigate = navigateTo;

  // ─── SYNC HANDLER ────────────────────────────────
  const handleSync = useCallback(() => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncPhase("connecting");
    setSyncProgress(10);
    appTimersRef.current.push(setTimeout(() => { setSyncPhase("downloading"); setSyncProgress(40); }, 800));
    appTimersRef.current.push(setTimeout(() => { setSyncPhase("processing"); setSyncProgress(75); }, 2000));
    appTimersRef.current.push(setTimeout(() => { setSyncPhase("complete"); setSyncProgress(100); }, 3200));
    appTimersRef.current.push(setTimeout(() => {
      completeSyncCycle();
    }, 4200));
  }, [isSyncing, setIsSyncing, setSyncPhase, setSyncProgress, completeSyncCycle]);

  // ─── ONBOARDING ──────────────────────────────────
  if (view === "onboarding") {
    return <div key="onboarding" className="view-transition"><OnboardingView onStart={handleStartProcessing} mobile={mobile} w={w} /></div>;
  }

  // ─── LOADING ─────────────────────────────────────
  if (view === "loading") {
    return <div key="loading" className="view-transition"><LoadingView onComplete={handleLoadingComplete} mobile={mobile} w={w} /></div>;
  }

  // ─── CURATION (Review Queue) ────────────────────
  if (view === "curation") {
    return <div key="curation" className="view-transition"><ReviewQueue onComplete={handleCurationComplete} onNavigate={handleNavigate} mobile={mobile} w={w} /></div>;
  }

  // ─── TOPIC CURATION ────────────────────────────
  if (view === "topicCuration") {
    return <div key="topicCuration" className="view-transition"><TopicCurationPanel onComplete={handleTopicCurationComplete} onNavigate={handleNavigate} mobile={mobile} w={w} /></div>;
  }

  // ─── CONNECTION VALIDATION ─────────────────────
  if (view === "connectionValidation") {
    return <div key="connectionValidation" className="view-transition"><ConnectionValidation onComplete={handleConnectionValidationComplete} onNavigate={handleNavigate} mobile={mobile} w={w} /></div>;
  }

  // ─── INSIGHT & DECISION REVIEW ────────────────
  if (view === "insightReview") {
    return <div key="insightReview" className="view-transition"><InsightDecisionReview onComplete={handleInsightReviewComplete} onNavigate={handleNavigate} mobile={mobile} w={w} /></div>;
  }

  // ─── CURATION SUMMARY ──────────────────────────
  if (view === "curationSummary") {
    return <div key="curationSummary" className="view-transition"><CurationSummary results={curationResults} onComplete={handleCurationSummaryComplete} onNavigate={handleNavigate} mobile={mobile} w={w} /></div>;
  }

  // ─── DECISION ARCHAEOLOGY ──────────────────────
  if (view === "archaeology" && selectedChain) {
    return (
      <>
        <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 960, margin: "0 auto" }}>
          <style>{CSS}</style>
          <Nav view={view} onNavigate={handleNavigate} mobile={mobile} tablet={tablet} lastSyncTime={lastSyncTime} newCount={newSyncCount} isSyncing={isSyncing} onSync={handleSync} onCmdK={() => setCmdPaletteOpen(true)} onExport={() => handleNavigate("export")} onTour={() => setTourActive(true)} />
          <DecisionArchaeology
            chainId={selectedChain}
            onBack={(targetView, targetChain) => {
              if (targetView === "archaeology" && targetChain) { setSelectedChain(targetChain); }
              else { setView("dashboard"); setSelectedChain(null); }
            }}
            onOpenChain={(id) => setSelectedChain(id)}
            onConversationClick={(topicId, eventIndex) => { setSelectedEvent({ topicId, eventIndex }); setView("conversation"); }}
            onTopicClick={handleTopicClick}
            mobile={mobile}
          />
        </div>
        <CommandPalette open={cmdPaletteOpen} initialQuery={cmdPaletteQuery} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} onConversationClick={handleEventClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="dashboard" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── CONVERSATION DRILLDOWN ─────────────────────
  if (view === "conversation" && selectedEvent) {
    return (
      <>
        <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 960, margin: "0 auto" }}>
          <style>{CSS}</style>
          <Nav view={view} onNavigate={handleNavigate} mobile={mobile} tablet={tablet} lastSyncTime={lastSyncTime} newCount={newSyncCount} isSyncing={isSyncing} onSync={handleSync} onCmdK={() => setCmdPaletteOpen(true)} onExport={() => handleNavigate("export")} onTour={() => setTourActive(true)} />
          <ConversationDrilldown topicId={selectedEvent.topicId} eventIndex={selectedEvent.eventIndex} onBack={() => { const t = TOPICS.find(x => x.id === selectedEvent.topicId); if (t) setSelectedTopic(t); setView("timeline"); setSelectedEvent(null); }} onHome={() => { setView("dashboard"); setSelectedEvent(null); setSelectedTopic(null); }} onEventClick={handleEventClick} mobile={mobile} />
        </div>
        <CommandPalette open={cmdPaletteOpen} initialQuery={cmdPaletteQuery} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} onConversationClick={handleEventClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="conversation" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── TIMELINE ────────────────────────────────────
  if (view === "timeline" && selectedTopic) {
    return (
      <>
        <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 960, margin: "0 auto" }}>
          <style>{CSS}</style>
          <Nav view={view} onNavigate={handleNavigate} mobile={mobile} tablet={tablet} lastSyncTime={lastSyncTime} newCount={newSyncCount} isSyncing={isSyncing} onSync={handleSync} onCmdK={() => setCmdPaletteOpen(true)} onExport={() => handleNavigate("export")} onTour={() => setTourActive(true)} />
          <TimelineView topic={selectedTopic} onBack={() => { setView("dashboard"); setSelectedTopic(null); }} onEventClick={handleEventClick} mobile={mobile} newEvents={syncedNewEvents} />
        </div>
        <CommandPalette open={cmdPaletteOpen} initialQuery={cmdPaletteQuery} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} onConversationClick={handleEventClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="timeline" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── MAIN LAYOUT ────────────────────────────────

  return (
    <ErrorBoundary>
    <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "24px 16px 60px" : tablet ? "28px 24px 80px" : "32px 40px 80px" }}>
      <style>{CSS}</style>
      <div style={container}>
        <Nav view={view} onNavigate={handleNavigate} mobile={mobile} tablet={tablet} lastSyncTime={lastSyncTime} newCount={newSyncCount} isSyncing={isSyncing} onSync={handleSync} onCmdK={() => setCmdPaletteOpen(true)} onExport={() => handleNavigate("export")} onTour={() => setTourActive(true)} />

        {view === "dashboard" && (
          <DashboardView
            mobile={mobile} tablet={tablet}
            totalConvos={totalConvos} totalWords={totalWords} maxCount={maxCount}
            onTopicClick={handleTopicClick} onBriefMe={setBriefingTopic}
            recentlySynced={recentlySynced} onRewind={() => setShowRewind(true)}
          />
        )}

        {view === "companion" && <AskAtlas onConversationClick={(topicId) => { const topic = TOPICS.find(t => t.id === topicId); if (topic) handleTopicClick(topic); }} mobile={mobile} contradictions={contradictions} resolvedContradictions={resolvedContradictions} onResolveContradiction={resolveContradiction} />}
        {view === "connections" && <ConnectionsView onTopicClick={handleTopicClick} mobile={mobile} />}
        {view === "evolution" && <EvolutionView mobile={mobile} onRewind={() => setShowRewind(true)} onTopicClick={handleTopicClick} />}
        {view === "beliefDiffs" && <BeliefDiffsView mobile={mobile} onBack={() => setView("dashboard")} onArchaeologyClick={handleArchaeologyClick} />}
        {view === "digest" && <DigestView mobile={mobile} onTopicClick={handleTopicClick} />}
        {view === "liveCapture" && <LiveCaptureView mobile={mobile} onTopicClick={handleTopicClick} />}
        {view === "export" && <ExportPreview mobile={mobile} w={w} />}

        <div style={{ textAlign: "center", marginTop: mobile ? 40 : 60, padding: "18px 0", borderTop: `1px solid ${white(0.04)}` }}>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: white(0.18) }}>This is your mind, mapped.</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 9 : 11, color: white(0.08), marginTop: 5 }}>Atlas · v7 · Data simulated from real conversation patterns</div>
        </div>
      </div>
      <SyncOverlay isSyncing={isSyncing} syncPhase={syncPhase} syncProgress={syncProgress} newCount={newSyncCount || 47} mobile={mobile} />
      <CommandPalette open={cmdPaletteOpen} initialQuery={cmdPaletteQuery} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} onConversationClick={handleEventClick} mobile={mobile} />
      <GuidedTour active={tourActive} onClose={() => setTourActive(false)} mobile={mobile} />
      <GuidedTour active={v6TourActive} onClose={() => setV6TourActive(false)} mobile={mobile} steps={V6_TOUR_STEPS} storageKey={V6_TOUR_STORAGE_KEY} />
      {briefingTopic && <BriefingCard topic={briefingTopic} onClose={() => setBriefingTopic(null)} mobile={mobile} />}
      {showRewind && <RewindMode onClose={() => setShowRewind(false)} mobile={mobile} />}
      <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view={view} onNavigate={handleNavigate} mobile={mobile} />
    </div>
    </ErrorBoundary>
  );
}
