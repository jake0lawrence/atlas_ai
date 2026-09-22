import {
  TOPICS, INSIGHTS, REDISCOVERIES, INSIGHT_DECISIONS, getInsightStaleness,
  RECURATION_COUNTS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import StatCard from '../components/StatCard';
import TopicBubble from '../components/TopicBubble';
import ActivityChart from '../components/ActivityChart';

const DashboardView = ({ mobile, tablet, totalConvos, totalWords, maxCount, onTopicClick, onBriefMe, recentlySynced, onRewind }) => {
  const gridCols = mobile ? "1fr 1fr" : tablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const insightGrid = mobile ? "1fr" : "1fr 1fr";

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: mobile ? 10 : 14, marginBottom: mobile ? 28 : 40 }}>
        <StatCard label="Conversations" value={totalConvos} sub="across 2 platforms" delay={100} accent="#FBBF24" mobile={mobile} />
        <StatCard label="Your Words" value={Math.floor(totalWords * 0.38)} sub={mobile ? "your thinking in text" : "that's a 1,600-page book"} delay={250} accent="#10B981" mobile={mobile} />
        <StatCard label="Topic Clusters" value={TOPICS.length} sub="auto-discovered" delay={400} accent="#3B82F6" mobile={mobile} />
        <StatCard label="Longest Streak" value={34} sub="days · Nov 2024" delay={550} accent="#A855F7" mobile={mobile} />
      </div>

      <div data-tour="ai-journey" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: mobile ? "16px 14px 10px" : "20px 22px 14px", marginBottom: mobile ? 28 : 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mobile ? 10 : 14 }}>
          <div>
            <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 15 : 17, color: "#fff" }}>Your AI Journey</h3>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{mobile ? "ChatGPT → Claude shift" : "Watch the shift from ChatGPT to Claude"}</p>
          </div>
          <div style={{ display: "flex", gap: mobile ? 10 : 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#3B82F6" }} /><span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" }}>GPT</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#FBBF24" }} /><span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" }}>Claude</span></div>
          </div>
        </div>
        <ActivityChart mobile={mobile} />
      </div>

      <div data-tour="knowledge-map" style={{ marginBottom: mobile ? 28 : 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: "#fff" }}>Knowledge Map</h3>
          <button data-tour="rewind-btn" onClick={onRewind} style={{
            fontFamily: BODY, fontSize: mobile ? 10 : 11, fontWeight: 500,
            color: "#EC4899", background: "rgba(236,72,153,0.08)",
            border: "1px solid rgba(236,72,153,0.2)", borderRadius: 8,
            padding: mobile ? "5px 10px" : "6px 14px", cursor: "pointer",
            transition: "all 0.25s", display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 12 }}>⏪</span> Rewind
          </button>
        </div>
        <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>Sized by conversation count. {mobile ? "Tap" : "Click"} to explore.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 12, justifyContent: "center", alignItems: "center", padding: mobile ? "20px 10px" : "28px 16px", background: "rgba(255,255,255,0.015)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.04)" }}>
          {TOPICS.map((topic, i) => <TopicBubble key={topic.id} topic={topic} maxCount={maxCount} index={i} onClick={onTopicClick} onBriefMe={onBriefMe} mobile={mobile} recentlySynced={recentlySynced} />)}
        </div>
      </div>

      {/* ── Staleness & Re-curation Alerts ── */}
      {(() => {
        const staleInsights = INSIGHT_DECISIONS.map(d => ({ ...d, warning: getInsightStaleness(d.date) })).filter(d => d.warning);
        const recurationTopics = TOPICS.filter(t => RECURATION_COUNTS[t.id] > 0);
        if (staleInsights.length === 0 && recurationTopics.length === 0) return null;
        return (
          <div style={{ marginBottom: mobile ? 28 : 40, display: "flex", flexDirection: "column", gap: 8 }}>
            {staleInsights.slice(0, 3).map((d, i) => {
              const topic = TOPICS.find(t => t.id === d.topicId);
              return (
                <div key={`stale-${i}`} style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, padding: mobile ? "10px 12px" : "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>⏳</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      <span style={{ color: topic?.color || "#fff", fontWeight: 600 }}>{topic?.name}:</span> {d.aiProposal.length > 80 ? d.aiProposal.slice(0, 77) + "…" : d.aiProposal}
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: 10, color: "#EF4444", marginTop: 3, fontWeight: 500 }}>{d.warning}</div>
                  </div>
                </div>
              );
            })}
            {recurationTopics.map((t, i) => (
              <div key={`recur-${i}`} style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)", borderRadius: 10, padding: mobile ? "10px 12px" : "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onTopicClick(t)}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                  <span style={{ color: "#F59E0B", fontWeight: 600 }}>{RECURATION_COUNTS[t.id]} new conversations</span> touch <span style={{ color: t.color, fontWeight: 500 }}>{t.name}</span> since your last review
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{ display: "grid", gridTemplateColumns: insightGrid, gap: mobile ? 24 : 20 }}>
        <div>
          <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 16 : 18, color: "#fff", marginBottom: 12 }}>📊 How You Think</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INSIGHTS.slice(0, mobile ? 3 : 5).map((trait, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: mobile ? "12px 14px" : "13px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "#FBBF24", fontWeight: 600 }}>{trait.icon} {trait.title}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(251,191,36,0.35)" }}>{trait.pct}%</span>
                </div>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4, marginBottom: 5 }}>{trait.desc}</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${trait.pct}%`, height: "100%", background: "linear-gradient(90deg, #FBBF24, #F59E0B)", borderRadius: 2 }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 16 : 18, color: "#fff", marginBottom: 12 }}>✨ Rediscovered Today</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {REDISCOVERIES.map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: mobile ? "11px 14px" : "12px 16px", display: "flex", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(251,191,36,0.35)", marginBottom: 3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.ago}</div>
                  <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardView;
