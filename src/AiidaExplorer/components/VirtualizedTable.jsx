import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useRef, useMemo, useState } from "react";

import { SortIcon } from "./Icons";
import { compareTableValues } from "./tableSort";

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
