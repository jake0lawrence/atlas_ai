import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Privacy mode is on by default for visitors (src/store.js). Most suites check
// the real names render, so they start from a device that turned it off; the
// default itself is tested in PrivacyShield.test.jsx. This runs before each
// test file imports the store.
if (typeof window !== 'undefined') window.localStorage.setItem('atlas_privacy_mode', 'off');

// jsdom has no layout, no AudioContext and no matchMedia; views touch all three.
// Server-side tests (@vitest-environment node) have no window at all.
beforeEach(() => {
  if (typeof window === 'undefined') return;
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  window.scrollTo = window.scrollTo || (() => {});
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
  window.AudioContext = window.AudioContext || class { createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }; } createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; } get currentTime() { return 0; } get destination() { return {}; } };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
