import { create } from 'zustand';
import {
  CONTRADICTIONS_INITIAL,
  SYNC_NEW_EVENTS,
} from './data/constants';

const useStore = create((set, get) => ({

  // ─── NAVIGATION SLICE ──────────────────────────────────────
  view: 'onboarding',
  selectedTopic: null,
  selectedEvent: null,
  selectedChain: null,
  showRewind: false,
  cmdPaletteOpen: false,
  briefingTopic: null,
  tourActive: false,
  v6TourActive: false,

  setView: (view) => set({ view }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedChain: (chain) => set({ selectedChain: chain }),
  setShowRewind: (show) => set({ showRewind: show }),
  setCmdPaletteOpen: (open) => set({ cmdPaletteOpen: open }),
  setBriefingTopic: (topic) => set({ briefingTopic: topic }),
  setTourActive: (active) => set({ tourActive: active }),
  setV6TourActive: (active) => set({ v6TourActive: active }),

  navigateTo: (viewId) => {
    if (viewId === 'rewind') set({ showRewind: true });
    else set({ view: viewId });
  },
  handleTopicClick: (topic) => set({ selectedTopic: topic, view: 'timeline' }),
  handleEventClick: (topicId, eventIndex) => set({
    selectedEvent: { topicId, eventIndex },
    view: 'conversation',
  }),
  toggleCmdPalette: () => set((s) => ({ cmdPaletteOpen: !s.cmdPaletteOpen })),

  // ─── KNOWLEDGE BASE SLICE ──────────────────────────────────
  contradictions: CONTRADICTIONS_INITIAL,
  resolvedContradictions: [],

  resolveContradiction: (contradictionId, resolutionType) => {
    const { contradictions } = get();
    const contradiction = contradictions.find(c => c.id === contradictionId);
    if (!contradiction) return;
    const resolved = {
      ...contradiction,
      resolution: resolutionType,
      resolvedAt: new Date().toISOString(),
    };
    set((s) => ({
      resolvedContradictions: [...s.resolvedContradictions, resolved],
      contradictions: s.contradictions.filter(c => c.id !== contradictionId),
    }));
  },

  // Sync state
  lastSyncTime: '2:34 PM',
  newSyncCount: 47,
  isSyncing: false,
  syncPhase: null,
  syncProgress: 0,
  recentlySynced: [],
  syncedNewEvents: {},

  setLastSyncTime: (t) => set({ lastSyncTime: t }),
  setNewSyncCount: (n) => set({ newSyncCount: n }),
  setIsSyncing: (v) => set({ isSyncing: v }),
  setSyncPhase: (p) => set({ syncPhase: p }),
  setSyncProgress: (p) => set({ syncProgress: p }),
  setRecentlySynced: (r) => set({ recentlySynced: r }),
  setSyncedNewEvents: (e) => set({ syncedNewEvents: e }),

  completeSyncCycle: () => set({
    isSyncing: false,
    syncPhase: null,
    syncProgress: 0,
    lastSyncTime: 'Just now',
    newSyncCount: 0,
    recentlySynced: Object.keys(SYNC_NEW_EVENTS),
    syncedNewEvents: SYNC_NEW_EVENTS,
  }),

  // ─── CURATION SLICE ───────────────────────────────────────
  // Foundation for tracking curation progress across views.
  // Individual curation UI state (ReviewQueue items, etc.) stays component-local.
  curationComplete: false,
  setCurationComplete: (v) => set({ curationComplete: v }),

  startProcessing: () => set({ view: 'loading' }),
  advanceCuration: (nextView) => set({ view: nextView }),

  // ─── COMPANION SLICE ──────────────────────────────────────
  companionSidebarOpen: false,
  companionMessages: [],
  companionQueryHistory: [],

  setCompanionSidebarOpen: (open) => set({ companionSidebarOpen: open }),
  toggleCompanionSidebar: () => set((s) => ({
    companionSidebarOpen: !s.companionSidebarOpen,
  })),

  addCompanionMessage: (msg) => set((s) => ({
    companionMessages: [...s.companionMessages, msg],
    companionQueryHistory: msg.role === 'user'
      ? [...s.companionQueryHistory, msg.text]
      : s.companionQueryHistory,
  })),
  clearCompanionMessages: () => set({
    companionMessages: [],
    companionQueryHistory: [],
  }),
}));

export default useStore;
