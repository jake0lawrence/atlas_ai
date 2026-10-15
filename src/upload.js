// The export a visitor hands the onboarding drop zones. The demo reads only
// the file's name and never its contents, but a drop bypasses the input's
// `accept`, so the type and size are checked here, where a real parser will
// take over: anything that reaches it has already passed.
export const EXPORT_TYPES = [".json", ".zip"];
// The largest export Atlas will take. A ChatGPT conversations.json or Claude
// ZIP for two years of use runs to tens of megabytes; this leaves headroom.
export const MAX_EXPORT_BYTES = 512 * 1024 * 1024;

// null when the file is acceptable, otherwise the reason to show.
export function checkExport(file) {
  const name = String(file?.name || "").toLowerCase();
  if (!EXPORT_TYPES.some(ext => name.endsWith(ext))) return `Only ${EXPORT_TYPES.join(" or ")} exports are accepted.`;
  if (!(file.size > 0)) return "That file is empty.";
  if (file.size > MAX_EXPORT_BYTES) return `That file is over ${MAX_EXPORT_BYTES / 1024 / 1024} MB.`;
  return null;
}
