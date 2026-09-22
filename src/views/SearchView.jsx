import { useState, useEffect, useRef, useCallback } from "react";
import {
  SEARCH_RESULTS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { C, alpha, white } from '../styles/tokens';
import { title, lede } from '../styles/shared';

const SearchView = ({ mobile }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    setTimeout(() => {
      const words = q.toLowerCase().split(/\s+/);
      const matches = SEARCH_RESULTS.filter(r => words.some(w => r.query.includes(w) || r.title.toLowerCase().includes(w) || r.preview.toLowerCase().includes(w)));
      setResults(matches); setSearching(false);
    }, 350);
  }, []);
  const suggestions = ["restaurant gina", "deployment docker", "dice game", "interview transunion", "supabase auth", "meta ads budget", "gina counselor"];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={title(mobile)}>Search Everything</h2>
        <p style={lede(mobile)}>Topic, person, keyword, or even vague memory.</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: white(0.04), border: `1px solid ${white(0.1)}`, borderRadius: 12, padding: mobile ? "10px 14px" : "12px 18px", marginBottom: 20 }}>
        <span style={{ fontSize: 18, opacity: 0.4 }}>🔍</span>
        <input ref={inputRef} type="text" value={query} onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }} aria-label="Search topics and insights" placeholder="Search your conversations..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: BODY, fontSize: mobile ? 14 : 15, color: C.white }} />
        {query && <button onClick={() => { setQuery(""); setResults([]); }} style={{ background: white(0.08), border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: BODY, fontSize: 11, color: white(0.4) }}>Clear</button>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
            style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: query === s ? C.bg0 : white(0.35), background: query === s ? C.gold : white(0.04), border: `1px solid ${query === s ? C.gold : white(0.08)}`, borderRadius: 20, padding: mobile ? "5px 10px" : "5px 12px", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}>
            {s}
          </button>
        ))}
      </div>
      {searching && <div style={{ fontFamily: BODY, fontSize: 13, color: alpha(C.gold, 0.5), textAlign: "center", padding: 40 }}>Searching across 3,847 conversations...</div>}
      {!searching && results.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: white(0.2), marginBottom: 14 }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} className="slide-in" style={{ background: white(0.025), border: `1px solid ${white(0.06)}`, borderRadius: 11, padding: mobile ? "12px 14px" : "14px 18px", cursor: "pointer", transition: "all 0.2s", animationDelay: `${i * 60}ms` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: r.platform === "Claude" ? alpha(C.gold, 0.08) : alpha(C.blue, 0.08), color: r.platform === "Claude" ? C.gold : C.blue }}>{r.platform}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: white(0.18) }}>{r.date}</span>
                </div>
                <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 15, color: C.white, margin: "4px 0", fontWeight: 600 }}>{r.title}</h3>
                <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.35), lineHeight: 1.5 }}>{r.preview}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!searching && query && results.length === 0 && <div style={{ fontFamily: BODY, fontSize: 13, color: white(0.2), textAlign: "center", padding: 40, background: white(0.02), borderRadius: 12 }}>Try one of the suggested queries above</div>}
      {!query && <div style={{ fontFamily: BODY, fontSize: 13, color: white(0.15), textAlign: "center", padding: 40, background: white(0.02), borderRadius: 12, border: `1px dashed ${white(0.06)}` }}>Your 3+ years of AI conversations, instantly searchable.</div>}
    </div>
  );
};

export default SearchView;
