import React, { useState, useMemo } from "react";

import { SortIcon } from "./Icons";

// Custom built table sorting feature - Since AGgrid basically has all the functionality of this should be switched to AGgrid...
// TODO - investigate whether AGgrid is a better alternative.
// TODO - add className ae:flexibility aswell.

// Compare two table cell values for sorting: numbers numerically,
// date-like strings chronologically, otherwise locale-aware string compare.
function isNumericValue(v) {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s === "") return false;
  return Number.isFinite(Number(s));
}

function compareTableValues(valA, valB) {
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
export default function DataTable({
  title,
  columns,
  data = [],
  maxWidth = "2000px",
  maxHeight = null, // new prop
  sortableCols = true,
  breakableCols = false,
  renderIfMissing = false,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedData = useMemo(() => {
    if (!data) return [];
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) =>
      compareTableValues(a[sortConfig.key], b[sortConfig.key]),
    );

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [data, sortConfig]);

  if (!renderIfMissing && (!data || data.length === 0)) return null;

  return (
    <div className="ae:p-2" style={{ maxWidth }}>
      <div className="explorerHeading ae:pb-2">{title}</div>

      <div
        className={`ae:overflow-x-auto ae:shadow-md ae:md:shadow ae:bg-white`}
        style={maxHeight ? { maxHeight, overflowY: "auto" } : {}} // override if maxHeight is set.
      >
        <table className="ae:min-w-full ae:text-xs ae:md:text-sm ae:text-left">
          <thead className="ae:bg-slate-100 ae:text-slate-700">
            <tr>
              {columns.map((col) => {
                const sortable = Array.isArray(sortableCols)
                  ? sortableCols.includes(col)
                  : sortableCols;
                return (
                  <th
                    key={col}
                    className={`ae:px-3 ae:md:px-4 ae:py-0.5 ae:md:py-1 ae:font-medium ${
                      sortable ? "ae:cursor-pointer ae:select-none" : ""
                    }`}
                    onClick={() =>
                      sortable &&
                      setSortConfig((prev) => ({
                        key: col,
                        direction:
                          prev.key === col && prev.direction === "asc"
                            ? "desc"
                            : "asc",
                      }))
                    }
                  >
                    <div className="ae:flex ae:items-center ae:gap-1">
                      {col}
                      {sortable && sortConfig.key === col && (
                        <SortIcon
                          direction={sortConfig.direction}
                          size={14}
                          className="ae:ml-1 ae:text-slate-500"
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={idx % 2 === 0 ? "ae:bg-slate-50" : "ae:bg-slate-100"}
              >
                {columns.map((col) => {
                  const breakable = Array.isArray(breakableCols)
                    ? breakableCols.includes(col)
                    : breakableCols;

                  const tdClasses = [
                    "ae:px-3 ae:md:px-4 ae:py-0.5 ae:md:py-2 ae:text-slate-900",
                    breakable
                      ? "ae:whitespace-normal ae:break-all"
                      : "ae:whitespace-nowrap",
                  ].join(" ");

                  return (
                    <td key={col} className={tdClasses}>
                      {row[col]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
