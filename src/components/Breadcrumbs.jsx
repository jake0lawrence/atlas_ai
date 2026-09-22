import { C, white, BODY, SPACE, TYPE } from '../styles/tokens';

// "Overview › CourtCollect › GitHub org setup". Every crumb but the last is a
// button; the last is the current page.
const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" style={{ marginBottom: SPACE.xl }}>
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: SPACE.xs, fontFamily: BODY, fontSize: TYPE.sm }}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={item.label} style={{ display: "flex", alignItems: "center", gap: SPACE.xs, minWidth: 0 }}>
            {last ? (
              <span aria-current="page" style={{ color: white(0.8), fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
            ) : (
              <button onClick={item.onClick} style={{ fontFamily: BODY, fontSize: TYPE.sm, color: C.gold, background: "none", border: "none", padding: 0, cursor: "pointer" }}>{item.label}</button>
            )}
            {!last && <span aria-hidden style={{ color: white(0.3) }}>›</span>}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
