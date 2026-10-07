// Compare two table cell values for sorting: numbers numerically,
// date-like strings chronologically, otherwise locale-aware string compare.
export function isNumericValue(v) {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s === "") return false;
  return Number.isFinite(Number(s));
}

export function compareTableValues(valA, valB) {
  const aMissing = valA === undefined || valA === null || valA === "";
  const bMissing = valB === undefined || valB === null || valB === "";
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  if (isNumericValue(valA) && isNumericValue(valB)) {
    return Number(valA) - Number(valB);
  }

  // Date-like strings (e.g. formatted Created/Modified columns) must be
  // compared chronologically, not lexicographically: "12/1/2025" would
  // otherwise sort after "1/15/2026".
  if (
    (typeof valA === "string" || typeof valA === "number") &&
    (typeof valB === "string" || typeof valB === "number")
  ) {
    const timeA = Date.parse(valA);
    const timeB = Date.parse(valB);
    if (!isNaN(timeA) && !isNaN(timeB)) {
      return timeA - timeB;
    }
  }

  return String(valA).localeCompare(String(valB), undefined, {
    numeric: true,
  });
}
