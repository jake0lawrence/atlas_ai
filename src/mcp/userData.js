// A signed-in user's knowledge base, in the shape the read tools take
// (DEMO_DATA in readTools.js). Keyed by the token's subject: an opaque id the
// authorization server derives from the account, never the email.
//
// Today every account's Atlas is empty: per-user storage is V8 PR 1 (and the
// hosted-or-relay choice, PR 0). This is the one seam that storage replaces,
// so the signed-in endpoint can never fall back to the demo persona's data.
const EMPTY = Object.freeze({
  topics: Object.freeze([]),
  connections: Object.freeze([]),
  timeline: Object.freeze({}),
  decisions: Object.freeze([]),
  pivots: Object.freeze([]),
  contradictions: Object.freeze([]),
});

// dataFor(sub): today the same empty base for every subject.
export async function dataFor() {
  return EMPTY;
}
