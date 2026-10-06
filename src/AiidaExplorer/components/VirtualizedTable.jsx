import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useRef, useMemo, useState } from "react";

import { SortIcon } from "./Icons";

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

  return String(valA ?? "").localeCompare(String(valB ?? ""), undefined, {
    numeric: true,
  });
}

export default function VirtualizedTable({
  columns,
  data = [],
  rowHeight = 38,
  renderCell,
  maxHeight = 600,
  sortableCols = true,
  columnWidths = {},
}) {
  const parentRef = useRef(null);

  // -----------------------
  // SORT STATE
  // -----------------------
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // -----------------------
  // SORTED DATA
  // -----------------------
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) =>
      compareTableValues(a?.[sortConfig.key], b?.[sortConfig.key]),
    );

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [data, sortConfig]);

  // -----------------------
  // VIRTUALIZER
  // -----------------------
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // -----------------------
  // COLUMN WIDTHS
  // -----------------------
  const columnPercentages = useMemo(() => {
    const weights = columns.map((col) => columnWidths?.[col] ?? 1);
    const total = weights.reduce((a, b) => a + b, 0);

    const map = {};
    columns.forEach((col) => {
      const w = columnWidths?.[col] ?? 1;
      map[col] = `${(w / total) * 100}%`;
    });

    return map;
  }, [columns, columnWidths]);

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <div
      ref={parentRef}
      className="ae:bg-white ae:rounded ae:shadow-md ae:overflow-auto"
      style={{ maxHeight }}
    >
      <table className="ae:w-full ae:text-xs ae:md:text-sm ae:table-fixed">
        {/* HEADER */}
        <thead className="ae:bg-slate-100 ae:sticky ae:top-0 ae:z-20">
          <tr>
            {columns.map((col) => {
              const sortable = Array.isArray(sortableCols)
                ? sortableCols.includes(col)
                : sortableCols;

              return (
                <th
                  key={col}
                  style={{ width: columnPercentages[col] }}
                  className={`ae:px-3 ae:py-2 ae:text-left ae:font-medium ${
                    sortable ? "ae:cursor-pointer ae:select-none" : ""
                  }`}
                  onClick={() => {
                    if (!sortable) return;

                    setSortConfig((prev) => ({
                      key: col,
                      direction:
                        prev.key === col && prev.direction === "asc"
                          ? "desc"
                          : "asc",
                    }));
                  }}
                >
                  <div className="ae:flex ae:items-center ae:gap-1 ae:truncate">
                    {col}

                    {sortConfig.key === col && (
                      <SortIcon direction={sortConfig.direction} />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* BODY */}
        <tbody
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = sortedData[virtualRow.index];

            return (
              <tr
                key={row?.uuid || virtualRow.index}
                style={{
                  position: "absolute",
                  transform: `translateY(${virtualRow.start}px)`,
                  height: rowHeight,
                  display: "table",
                  width: "100%",
                  tableLayout: "fixed",
                }}
                className={
                  virtualRow.index % 2 === 0
                    ? "ae:bg-slate-50"
                    : "ae:bg-slate-100"
                }
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="ae:px-3 ae:py-1 ae:truncate ae:whitespace-nowrap ae:overflow-hidden"
                    style={{ width: columnPercentages[col] }}
                  >
                    {renderCell ? renderCell(row, col) : row?.[col]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
