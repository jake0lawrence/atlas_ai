import { useState, useRef } from "react";
import { BODY, MONO } from '../styles/base';
import { C, white } from '../styles/tokens';

const DropZone = ({ platform, icon, color, subtitle, accepted, onFile, mobile }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.length) onFile(files[0].name);
  };
  const handleClick = () => { if (!accepted) inputRef.current?.click(); };
  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f.name);
  };

  return (
    <div
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
      style={{
        flex: 1, minWidth: mobile ? "100%" : 280,
        border: `2px dashed ${accepted ? color : dragOver ? color : `${color}30`}`,
        borderRadius: 16, padding: mobile ? "28px 20px" : "36px 28px",
        background: accepted ? `${color}08` : dragOver ? `${color}06` : white(0.015),
        cursor: accepted ? "default" : "pointer",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        animation: dragOver ? "borderGlow 1.5s infinite" : "none",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}
    >
      <input ref={inputRef} type="file" style={{ display: "none" }} onChange={handleInputChange} accept=".json,.zip" />

      {accepted ? (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✓</div>
          <div style={{ fontFamily: BODY, fontSize: 14, color, fontWeight: 600 }}>{platform} ready</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: white(0.3), wordBreak: "break-all" }}>{accepted}</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: mobile ? 36 : 44, marginBottom: 12, animation: dragOver ? "float 1.5s infinite ease-in-out" : "none" }}>{icon}</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 15 : 17, color: C.white, fontWeight: 600, marginBottom: 4 }}>{platform}</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.3), marginBottom: 14, lineHeight: 1.5 }}>{subtitle}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: `${color}12`, border: `1px solid ${color}25`,
            fontFamily: BODY, fontSize: 12, color, fontWeight: 500,
          }}>
            <span style={{ fontSize: 14 }}>📂</span>
            {mobile ? "Tap to browse" : "Drop file or click to browse"}
          </div>
        </>
      )}
    </div>
  );
};

export default DropZone;
