import { useEffect, useRef, useCallback } from "react";
import {
  TOPICS, TOUR_STORAGE_KEY,
} from './data/constants';
import useWindowSize from './hooks/useWindowSize';
import useRouterSync from './hooks/useRouterSync';
import useStore from './store';
import ErrorBoundary from './components/ErrorBoundary';
import { FONTS, BODY, CSS } from './styles/base';
import { container } from './styles/shared';
import { SPACE, TEXT } from './styles/tokens';
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
import SearchView from './views/SearchView';
import ReviewQueue from './views/ReviewQueue';
import TopicCurationPanel from './views/TopicCurationPanel';
import ConnectionValidation from './views/ConnectionValidation';
import InsightDecisionReview from './views/InsightDecisionReview';
import CurationSummary from './views/CurationSummary';
import ExportPreview from './views/ExportPreview';
import BeliefDiffsView from './views/BeliefDiffsView';
import DigestView from './views/DigestView';
import DecisionArchaeology from './views/DecisionArchaeology';
import RewindMode from './views/RewindMode';
import DashboardView from './views/DashboardView';
import { C, alpha, white } from './styles/tokens';

// ─── MAIN APP ───────────────────────────────────────────────

export default function App() {
  const { w } = useWindowSize();
  const mobile = w < 640;
  const tablet = w >= 640 && w < 1024;

  // ─── CENTRALIZED STATE (Zustand) ──────────────────
  const view = useStore(s => s.view);
  const setView = useStore(s => s.setView);
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
  const companionSidebarOpen = useStore(s => s.companionSidebarOpen);
  const toggleCompanionSidebar = useStore(s => s.toggleCompanionSidebar);
  const briefingTopic = useStore(s => s.briefingTopic);
  const setBriefingTopic = useStore(s => s.setBriefingTopic);
  const tourActive = useStore(s => s.tourActive);
  const setTourActive = useStore(s => s.setTourActive);
  const handleTopicClick = useStore(s => s.handleTopicClick);
  const storeHandleEventClick = useStore(s => s.handleEventClick);
  const navigateTo = useStore(s => s.navigateTo);
  const toggleCmdPalette = useStore(s => s.toggleCmdPalette);
  useRouterSync();
  const tourLaunched = useRef(false);
  const appTimersRef = useRef([]);

  useEffect(() => {
    const timers = appTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (view === "dashboard" && !tourLaunched.current) {
      tourLaunched.current = true;
      try {
        // First visit: open the tour once the dashboard has painted
        if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
          appTimersRef.current.push(setTimeout(() => setTourActive(true), 600));
        }
      } catch (e) { console.warn('tour activation:', e); }
    }
  }, [view, setTourActive]);

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
  const handleCurationComplete = useCallback(() => setView("topicCuration"), [setView]);
  const handleTopicCurationComplete = useCallback(() => setView("connectionValidation"), [setView]);
  const handleConnectionValidationComplete = useCallback(() => setView("insightReview"), [setView]);
  const handleInsightReviewComplete = useCallback(() => setView("curationSummary"), [setView]);
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
    return <div key="curation" className="view-transition"><ReviewQueue onComplete={handleCurationComplete} mobile={mobile} w={w} /></div>;
  }

  // ─── TOPIC CURATION ────────────────────────────
  if (view === "topicCuration") {
    return <div key="topicCuration" className="view-transition"><TopicCurationPanel onComplete={handleTopicCurationComplete} mobile={mobile} w={w} /></div>;
  }

  // ─── CONNECTION VALIDATION ─────────────────────
  if (view === "connectionValidation") {
    return <div key="connectionValidation" className="view-transition"><ConnectionValidation onComplete={handleConnectionValidationComplete} mobile={mobile} w={w} /></div>;
  }

  // ─── INSIGHT & DECISION REVIEW ────────────────
  if (view === "insightReview") {
    return <div key="insightReview" className="view-transition"><InsightDecisionReview onComplete={handleInsightReviewComplete} mobile={mobile} w={w} /></div>;
  }

  // ─── CURATION SUMMARY ──────────────────────────
  if (view === "curationSummary") {
    return <div key="curationSummary" className="view-transition"><CurationSummary onComplete={handleCurationSummaryComplete} mobile={mobile} w={w} /></div>;
  }

  // ─── DECISION ARCHAEOLOGY ──────────────────────
  if (view === "archaeology" && selectedChain) {
    return (
      <>
        <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 960, margin: "0 auto" }}>
          <style>{CSS}</style>
          <DecisionArchaeology
            chainId={selectedChain}
            onBack={(targetView, targetChain) => {
              if (targetView === "archaeology" && targetChain) { setSelectedChain(targetChain); }
              else { setView("dashboard"); setSelectedChain(null); }
            }}
            onConversationClick={(topicId, eventIndex) => { setSelectedEvent({ topicId, eventIndex }); setView("conversation"); }}
            mobile={mobile}
          />
        </div>
        <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="dashboard" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── ASK ATLAS (COMPANION) ─────────────────────
  if (view === "companion") {
    return (
      <>
        <AskAtlas onBack={() => setView("dashboard")} onConversationClick={(topicId) => { const topic = TOPICS.find(t => t.id === topicId); if (topic) handleTopicClick(topic); }} mobile={mobile} contradictions={contradictions} resolvedContradictions={resolvedContradictions} onResolveContradiction={resolveContradiction} />
        <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="companion" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── CONVERSATION DRILLDOWN ─────────────────────
  if (view === "conversation" && selectedEvent) {
    return (
      <>
        <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 960, margin: "0 auto" }}>
          <style>{CSS}</style>
          <ConversationDrilldown topicId={selectedEvent.topicId} eventIndex={selectedEvent.eventIndex} onBack={() => { setView("timeline"); setSelectedEvent(null); }} mobile={mobile} />
        </div>
        <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="conversation" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── TIMELINE ────────────────────────────────────
  if (view === "timeline" && selectedTopic) {
    return (
      <>
        <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 820, margin: "0 auto" }}>
          <style>{CSS}</style>
          <TimelineView topic={selectedTopic} onBack={() => { setView("dashboard"); setSelectedTopic(null); }} onEventClick={handleEventClick} mobile={mobile} newEvents={syncedNewEvents} />
        </div>
        <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} mobile={mobile} />
        <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view="timeline" onNavigate={handleNavigate} mobile={mobile} />
      </>
    );
  }

  // ─── THE SHELL ──────────────────────────────────
  // Header (brand, three stations, utilities) on top; the dashboard's hero
  // under it on the dashboard only (it moves into DashboardView in PR 4);
  // the station's view; the footer.

  return (
    <ErrorBoundary>
    <div style={{ minHeight: "100vh", background: C.bg0, padding: mobile ? `${SPACE.lg}px ${SPACE.lg}px 60px` : tablet ? `${SPACE.xl}px ${SPACE.xl}px 80px` : `${SPACE.xl}px 40px 80px` }}>
      <style>{CSS}</style>
      <div style={container}>
        <Nav view={view} onNavigate={handleNavigate} mobile={mobile} tablet={tablet} lastSyncTime={lastSyncTime} newCount={newSyncCount} isSyncing={isSyncing} onSync={handleSync} onCmdK={() => setCmdPaletteOpen(true)} onTour={() => setTourActive(true)} />

        {view === "dashboard" && (
          <div style={{ textAlign: "center", marginBottom: mobile ? SPACE.xl : SPACE.xxl }}>
            <div style={{ fontSize: mobile ? TEXT.xs : 12, fontFamily: BODY, color: alpha(C.gold, 0.35), textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: mobile ? 10 : 14, fontWeight: 600 }}>Your AI Knowledge Atlas</div>
            <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TEXT.xxxl : tablet ? 40 : TEXT.display, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              3 Years of Thinking,{mobile ? <br /> : " "}<span style={{ color: C.gold }}>Mapped</span>
            </h1>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: white(0.25), marginTop: 6 }}>Jan 2023 — Feb 2026 · ChatGPT + Claude · {(totalWords / 1000000).toFixed(1)}M words</p>
          </div>
        )}

        {view === "dashboard" && (
          <DashboardView
            mobile={mobile} tablet={tablet}
            totalConvos={totalConvos} totalWords={totalWords} maxCount={maxCount}
            onTopicClick={handleTopicClick} onBriefMe={setBriefingTopic}
            recentlySynced={recentlySynced} onRewind={() => setShowRewind(true)}
          />
        )}

        {view === "connections" && <ConnectionsView onTopicClick={handleTopicClick} mobile={mobile} />}
        {view === "evolution" && <EvolutionView mobile={mobile} onRewind={() => setShowRewind(true)} />}
        {view === "beliefDiffs" && <BeliefDiffsView mobile={mobile} onBack={() => setView("dashboard")} onArchaeologyClick={handleArchaeologyClick} />}
        {view === "digest" && <DigestView mobile={mobile} onBack={() => setView("dashboard")} onArchaeologyClick={handleArchaeologyClick} />}
        {view === "search" && <SearchView mobile={mobile} />}
        {view === "export" && <ExportPreview mobile={mobile} w={w} />}

        <footer style={{ textAlign: "center", marginTop: mobile ? 40 : 60, padding: `${SPACE.lg + 2}px 0`, borderTop: `1px solid ${white(0.04)}` }}>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: white(0.18) }}>This is your mind, mapped.</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 9 : TEXT.sm, color: white(0.12), marginTop: 5 }}>Atlas · A demo: every figure is simulated from real conversation patterns</div>
        </footer>
      </div>
      <SyncOverlay isSyncing={isSyncing} syncPhase={syncPhase} syncProgress={syncProgress} newCount={newSyncCount || 47} mobile={mobile} />
      <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onNavigate={handleNavigate} onTopicClick={handleTopicClick} mobile={mobile} />
      <GuidedTour active={tourActive} onClose={() => setTourActive(false)} mobile={mobile} />
      {briefingTopic && <BriefingCard topic={briefingTopic} onClose={() => setBriefingTopic(null)} mobile={mobile} />}
      {showRewind && <RewindMode onClose={() => setShowRewind(false)} mobile={mobile} />}
      <CompanionSidebar isOpen={companionSidebarOpen} onToggle={toggleCompanionSidebar} view={view} onNavigate={handleNavigate} mobile={mobile} />
    </div>
    </ErrorBoundary>
  );
}
