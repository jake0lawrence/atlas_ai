import { useState } from "react";
import {
  INSIGHTS, EVOLUTION_PHASES, VAULT_TREE, EXPORT_FORMATS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';

// ─── EXPORT & SHARE PREVIEW ─────────────────────────────────

const ExportPreview = ({ mobile, w }) => {
  const [expandedFolders, setExpandedFolders] = useState({ "Atlas Vault": true, "CourtCollect": false, "Job Search": false, "AI Automation": false });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("obsidian");
  const [shareCard, setShareCard] = useState(null);

  const toggleFolder = (name) => setExpandedFolders(prev => ({ ...prev, [name]: !prev[name] }));

  const renderWikilinks = (text) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        const linkText = part.slice(2, -2);
        return <span key={i} style={{ color: "#FBBF24", background: "rgba(251,191,36,0.08)", padding: "1px 4px", borderRadius: 3, fontWeight: 500, cursor: "pointer" }}>{linkText}</span>;
      }
      return part;
    });
  };

  const renderTree = (nodes, depth = 0) => nodes.map((node, i) => {
    const indent = depth * (mobile ? 16 : 22);
    if (node.type === "folder") {
      const isOpen = expandedFolders[node.name];
      return (
        <div key={node.name}>
          <div onClick={() => toggleFolder(node.name)}
            role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFolder(node.name); }}}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: mobile ? "6px 8px" : "7px 10px", paddingLeft: indent + 10, cursor: "pointer", borderRadius: 6, background: isOpen ? "rgba(251,191,36,0.04)" : "transparent", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            onMouseLeave={e => e.currentTarget.style.background = isOpen ? "rgba(251,191,36,0.04)" : "transparent"}>
            <span style={{ fontFamily: MONO, fontSize: mobile ? 10 : 12, color: "#FBBF24", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}>▶</span>
            <span style={{ fontSize: mobile ? 13 : 14 }}>📁</span>
            <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "#fff", fontWeight: 500 }}>{node.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>{node.children.length}</span>
          </div>
          {isOpen && <div style={{ animation: "fadeUp 0.3s ease both" }}>{renderTree(node.children, depth + 1)}</div>}
        </div>
      );
    }
    const isSelected = selectedFile?.name === node.name;
    return (
      <div key={node.name} onClick={() => setSelectedFile(node)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: mobile ? "5px 8px" : "6px 10px", paddingLeft: indent + 10, cursor: "pointer", borderRadius: 6, background: isSelected ? "rgba(251,191,36,0.08)" : "transparent", borderLeft: isSelected ? "2px solid #FBBF24" : "2px solid transparent", transition: "all 0.2s" }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
        <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: isSelected ? "#FBBF24" : "rgba(255,255,255,0.5)", fontWeight: isSelected ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
      </div>
    );
  });

  const shareablePhases = EVOLUTION_PHASES.map((p, i) => ({ ...p, index: i }));
  const shareableInsights = INSIGHTS.map((ins, i) => ({ ...ins, index: i }));

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: mobile ? 24 : 32 }}>
        <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 28, color: "#fff", marginBottom: 6, fontWeight: 700 }}>Export & Share</h2>
        <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)" }}>Your curated knowledge, ready to go anywhere.</p>
      </div>

      {/* Export Format Selector */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: mobile ? 8 : 10, marginBottom: mobile ? 24 : 32 }}>
        {EXPORT_FORMATS.map(fmt => {
          const active = selectedFormat === fmt.id;
          return (
            <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
              style={{
                background: active ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${active ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 10, padding: mobile ? "12px 10px" : "14px 16px", cursor: "pointer",
                transition: "all 0.25s", textAlign: "center",
              }}>
              <div style={{ fontSize: mobile ? 18 : 22, marginBottom: 4, fontFamily: fmt.id === "json" ? MONO : "inherit" }}>{fmt.icon}</div>
              <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: active ? "#FBBF24" : "#fff", fontWeight: 600 }}>{fmt.label}</div>
              <div style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{fmt.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Obsidian Vault Preview */}
      {selectedFormat === "obsidian" && (
        <div style={{
          display: "grid", gridTemplateColumns: mobile ? "1fr" : "280px 1fr", gap: 0,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, overflow: "hidden", marginBottom: mobile ? 24 : 32,
          minHeight: mobile ? "auto" : 380,
        }}>
          {/* File Tree */}
          <div style={{
            borderRight: mobile ? "none" : "1px solid rgba(255,255,255,0.06)",
            borderBottom: mobile ? "1px solid rgba(255,255,255,0.06)" : "none",
            padding: mobile ? "12px 8px" : "16px 8px",
            maxHeight: mobile ? 240 : 420, overflowY: "auto",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 10px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", marginBottom: 6 }}>Vault Structure</div>
            {renderTree(VAULT_TREE)}
          </div>
          {/* Markdown Preview */}
          <div style={{ padding: mobile ? "16px 14px" : "20px 24px", overflowY: "auto", maxHeight: mobile ? 320 : 420 }}>
            {selectedFile ? (
              <div className="fade-up">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "#FBBF24", background: "rgba(251,191,36,0.1)", padding: "2px 8px", borderRadius: 4 }}>.md</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.5)" }}>{selectedFile.name}</span>
                </div>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {selectedFile.content.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) return <div key={i} style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 22, color: "#fff", fontWeight: 700, margin: "4px 0 8px" }}>{line.slice(2)}</div>;
                    if (line.startsWith("## ")) return <div key={i} style={{ fontFamily: FONTS, fontSize: mobile ? 15 : 17, color: "#FBBF24", fontWeight: 600, margin: "14px 0 6px" }}>{line.slice(3)}</div>;
                    if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: "rgba(255,255,255,0.2)" }}>·</span>{renderWikilinks(line.slice(2))}</div>;
                    if (line.startsWith("**") && line.includes(":**")) { const [label, ...rest] = line.split(":**"); return <div key={i}><span style={{ color: "#FBBF24", fontWeight: 600 }}>{label.replace(/\*\*/g, "")}:</span> {renderWikilinks(rest.join(":**").replace(/\*\*/g, ""))}</div>; }
                    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
                    return <div key={i}>{renderWikilinks(line)}</div>;
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 200, gap: 10 }}>
                <div style={{ fontSize: 32, opacity: 0.2 }}>📄</div>
                <div style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.2)" }}>Select a file to preview</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-Obsidian format previews */}
      {selectedFormat !== "obsidian" && (
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: mobile ? "16px 14px" : "24px 28px", marginBottom: mobile ? 24 : 32,
          minHeight: 160,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Preview — {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: mobile ? "12px 14px" : "16px 20px" }}>
            {selectedFormat === "markdown" && `# Atlas Knowledge Export
# Generated: Feb 2026

## Topics (14)

### CourtCollect
- Category: Product
- Conversations: 47
- Words: 128,400
- Key connections: Tyler Technologies, Gov Tech & Policy

### Job Search
- Category: Career
- Conversations: 62
- Words: 142,000
- Key connections: Resumes & Cover Letters, Tyler Technologies

### AI Automation
- Category: Tech
- Conversations: 34
- Words: 89,500
- Key connections: n8n & Airtable, HMPRG Campaigns`}
            {selectedFormat === "json" && `{
  "atlas": {
    "version": "5.0",
    "exported": "2026-02-07",
    "stats": {
      "conversations": 3847,
      "topics": 14,
      "connections": 16,
      "words": 1687900
    },
    "topics": [
      {
        "id": "courtcollect",
        "name": "CourtCollect",
        "category": "product",
        "conversations": 47,
        "words": 128400,
        "connections": ["tyler", "govtech", "webdev"]
      },
      ...
    ]
  }
}`}
            {selectedFormat === "csv" && `topic_id,name,category,conversations,words,first_seen,last_seen,depth
courtcollect,CourtCollect,product,47,128400,Aug 2024,Feb 2026,4.2
hmprg,HMPRG Campaigns,client,38,98200,Sep 2024,Feb 2026,3.8
jobsearch,Job Search,career,62,142000,Dec 2024,Feb 2026,3.5
gamedev,Dice or Die,creative,23,67800,Oct 2024,Jan 2026,3.9
keymaster,Keymaster,product,18,52100,Jul 2024,Dec 2025,4.0
automation,AI Automation,tech,34,89500,Jun 2024,Feb 2026,3.6
resumes,Resumes & Cover Letters,career,41,95300,Dec 2024,Feb 2026,2.8
tyler,Tyler Technologies,work,89,234500,Mar 2023,Dec 2025,3.4`}
          </div>
        </div>
      )}

      {/* Export Stats */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: mobile ? 8 : 10, marginBottom: mobile ? 24 : 32 }}>
        {[
          { label: "Topics", value: "14", icon: "◈" },
          { label: "Connections", value: "16", icon: "◎" },
          { label: "Files", value: "48", icon: "📄" },
          { label: "Size", value: "2.4 MB", icon: "💾" },
        ].map((stat, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: mobile ? "10px 12px" : "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 22, color: "#fff", fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Shareable Insight Cards */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: "#fff", marginBottom: 4 }}>Share an Insight</h3>
        <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>Generate a shareable card for any insight or evolution phase.</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {shareablePhases.slice(0, mobile ? 3 : 6).map(p => (
            <button key={`phase-${p.index}`} onClick={() => setShareCard({ type: "phase", data: p })}
              style={{
                fontFamily: BODY, fontSize: mobile ? 10 : 11, fontWeight: 500,
                color: shareCard?.type === "phase" && shareCard?.data?.index === p.index ? "#08080C" : p.color,
                background: shareCard?.type === "phase" && shareCard?.data?.index === p.index ? p.color : `${p.color}12`,
                border: `1px solid ${p.color}30`, borderRadius: 20, padding: mobile ? "5px 10px" : "5px 14px",
                cursor: "pointer", transition: "all 0.2s",
              }}>{p.title}</button>
          ))}
          {shareableInsights.slice(0, mobile ? 2 : 3).map(ins => (
            <button key={`insight-${ins.index}`} onClick={() => setShareCard({ type: "insight", data: ins })}
              style={{
                fontFamily: BODY, fontSize: mobile ? 10 : 11, fontWeight: 500,
                color: shareCard?.type === "insight" && shareCard?.data?.index === ins.index ? "#08080C" : "#FBBF24",
                background: shareCard?.type === "insight" && shareCard?.data?.index === ins.index ? "#FBBF24" : "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.25)", borderRadius: 20, padding: mobile ? "5px 10px" : "5px 14px",
                cursor: "pointer", transition: "all 0.2s",
              }}>{ins.icon} {ins.title}</button>
          ))}
        </div>

        {/* Share Card Preview */}
        {shareCard && (
          <div className="fade-up" style={{
            background: shareCard.type === "phase"
              ? `linear-gradient(135deg, ${shareCard.data.color}18, ${shareCard.data.color}06, rgba(8,8,12,0.95))`
              : "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.03), rgba(8,8,12,0.95))",
            border: `1px solid ${shareCard.type === "phase" ? shareCard.data.color + "30" : "rgba(251,191,36,0.2)"}`,
            borderRadius: 16, padding: mobile ? "24px 20px" : "32px 36px",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative background elements */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${shareCard.type === "phase" ? shareCard.data.color : "#FBBF24"}08, transparent)` }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${shareCard.type === "phase" ? shareCard.data.color : "#FBBF24"}05, transparent)` }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Atlas · Your AI Knowledge Map</div>

              {shareCard.type === "phase" ? (
                <>
                  <div style={{ fontFamily: MONO, fontSize: mobile ? 11 : 12, color: shareCard.data.color, marginBottom: 6 }}>{shareCard.data.period}</div>
                  <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 34, color: "#fff", fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em" }}>{shareCard.data.title}</h3>
                  <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 16, maxWidth: 440 }}>{shareCard.data.desc}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: FONTS, fontSize: mobile ? 32 : 42, fontWeight: 800, color: shareCard.data.color }}>{shareCard.data.conversations}</span>
                    <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)" }}>conversations</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: mobile ? 36 : 48, marginBottom: 10 }}>{shareCard.data.icon}</div>
                  <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 30, color: "#fff", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>{shareCard.data.title}</h3>
                  <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 16, maxWidth: 440 }}>{shareCard.data.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${shareCard.data.pct}%`, height: "100%", background: "linear-gradient(90deg, #FBBF24, #F59E0B)", borderRadius: 3, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: mobile ? 13 : 15, color: "#FBBF24", fontWeight: 600 }}>{shareCard.data.pct}%</span>
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: mobile ? 8 : 12, marginTop: mobile ? 18 : 24 }}>
                <button style={{
                  fontFamily: BODY, fontSize: mobile ? 11 : 12, fontWeight: 600,
                  color: "#08080C", background: "#FBBF24", border: "none", borderRadius: 8,
                  padding: mobile ? "8px 16px" : "9px 20px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>📋 Copy Image</button>
                <button style={{
                  fontFamily: BODY, fontSize: mobile ? 11 : 12, fontWeight: 500,
                  color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, padding: mobile ? "8px 16px" : "9px 20px", cursor: "pointer",
                }}>↗ Share Link</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPreview;
