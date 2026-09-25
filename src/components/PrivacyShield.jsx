import { useLayoutEffect } from "react";
import useStore from '../store';
import { aliasText } from '../privacy';

// Privacy mode's one enforcement point (#86). Views read the fixtures
// directly and derive text from them at load, so hiding names view by view
// would leave some behind. Instead the shield rewrites what is actually on
// screen: every text node and every labeling attribute under <body>.
//
// It swaps in the stand-ins synchronously when the mode turns on (a layout
// effect, before paint) and then through a MutationObserver, whose callback
// runs before the browser paints what React just committed, so a real name
// never reaches the screen. It remembers what it changed and puts it back
// when the mode turns off, unless React has written something newer since.

const ATTRS = ["aria-label", "title", "alt", "placeholder", "aria-valuetext", "aria-description"];
// Text the reader typed or the page runs, not text the app shows.
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT"]);

export function shield(root) {
  const texts = new Map(); // Text node -> { orig, shown }
  const attrs = new Map(); // Element -> Map(attr -> { orig, shown })

  const text = (node) => {
    if (node.parentElement && SKIP.has(node.parentElement.tagName)) return;
    const v = node.nodeValue;
    const shown = aliasText(v);
    if (shown !== v) { texts.set(node, { orig: v, shown }); node.nodeValue = shown; }
  };
  const attr = (el, name) => {
    const v = el.getAttribute(name);
    if (v == null) return;
    const shown = aliasText(v);
    if (shown === v) return;
    if (!attrs.has(el)) attrs.set(el, new Map());
    attrs.get(el).set(name, { orig: v, shown });
    el.setAttribute(name, shown);
  };
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) { text(node); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || SKIP.has(node.tagName)) return;
    for (const a of ATTRS) attr(node, a);
    for (const el of node.querySelectorAll("*")) for (const a of ATTRS) attr(el, a);
    const it = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let t = it.nextNode(); t; t = it.nextNode()) text(t);
  };

  walk(root);
  // Our own writes come back as records too; aliasText is idempotent, so
  // those change nothing and the loop stops there.
  const observer = new MutationObserver(records => {
    for (const r of records) {
      if (r.type === "characterData") text(r.target);
      else if (r.type === "attributes") attr(r.target, r.attributeName);
      else r.addedNodes.forEach(walk);
    }
  });
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  return () => {
    observer.disconnect();
    texts.forEach(({ orig, shown }, node) => { if (node.nodeValue === shown) node.nodeValue = orig; });
    attrs.forEach((byName, el) => byName.forEach(({ orig, shown }, name) => { if (el.getAttribute(name) === shown) el.setAttribute(name, orig); }));
  };
}

const PrivacyShield = () => {
  const on = useStore(s => s.privacy);
  useLayoutEffect(() => (on ? shield(document.body) : undefined), [on]);
  return null;
};

export default PrivacyShield;
