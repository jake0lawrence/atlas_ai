import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no layout, no AudioContext and no matchMedia; views touch all three.
beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  window.scrollTo = window.scrollTo || (() => {});
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
  window.AudioContext = window.AudioContext || class { createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }; } createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; } get currentTime() { return 0; } get destination() { return {}; } };
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
