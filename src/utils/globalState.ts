// Strictly collect only X handles from the "X Username" column (or a close label).
export async function fetchVerifiedByRadioWaterMelonUsers(): Promise<Set<string>> {
  const verified = new Set<string>();
  try {
    const res = await fetch(
      "https://docs.google.com/spreadsheets/d/1B9_YhTlhyEIiMEBQHGf8O9SvF5MR12ibgi8vFV17Urc/gviz/tq?headers=2&range=A1:AH&sheet=RW%20Site%20View&tq=SELECT%20*"
    );
    if (!res.ok) return verified;

    const text = await res.text();
    const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+?)\)\s*;?$/);
    if (!m) return verified;

    type GVizCell = { v?: string | number | null };
    type GVizRow = { c?: GVizCell[] };
    interface GViz {
      table?: { cols?: Array<{ label?: string }>; rows?: GVizRow[] };
    }

    const json: GViz = JSON.parse(m[1]);
    const cols = json.table?.cols ?? [];
    const rows = json.table?.rows ?? [];

    // Find the X handle column index by label.
    const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
    const candidates = ["x username", "twitter username", "x handle", "twitter handle"];

    let xColIdx = cols.findIndex(c => candidates.includes(norm(c?.label || "")));
    if (xColIdx === -1) {
      // Fallback heuristic if labels vary slightly (e.g., “X  Username ”)
      xColIdx = cols.findIndex(c => /\b(username|handle)\b/i.test(c?.label || "") && /\b(x|twitter)\b/i.test(c?.label || ""));
    }
    if (xColIdx === -1) return verified; // No column found → empty set (fail safe)

    // Strict X handle: optional @, 1–15 of [A-Za-z0-9_], and nothing else.
    const handleRe = /^@?([A-Za-z0-9_]{1,15})$/;

    for (const row of rows) {
      const cell = row?.c?.[xColIdx];
      const v = cell?.v;
      if (typeof v === "string") {
        const m2 = v.trim().match(handleRe);
        if (m2) verified.add(m2[1].toLowerCase()); // store normalized handle only
      }
    }

    return verified;
  } catch {
    return verified;
  }
}
