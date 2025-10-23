import React, { useState, useMemo } from "react";

// SortIcon component svg that accepts tailwind classNames.
function SortIcon({ direction = "asc", size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`${className} ae:transform ${
        direction === "asc" ? "rotate-180" : ""
      }`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Custom built table sorting feature - Since AGgrid basically has all the functionality of this should be switched to AGgrid...
// TODO - investigate whether AGgrid is a better alternative.
// TODO - add className ae:flexibility aswell.
export default function DataTable({
  title,
  columns,
  data = [],
  maxWidth = "2000px",
  sortableCols = true,
  breakableCols = false,
  renderIfMissing = false,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedData = useMemo(() => {
    if (!data) return [];
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      return !isNaN(valA) && !isNaN(valB)
        ? valA - valB
        : String(valA).localeCompare(String(valB));
    });

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [data, sortConfig]);

  if (!renderIfMissing && (!data || data.length === 0)) return null;

  return (
    <div className="ae:p-2" style={{ maxWidth }}>
      <div className="explorerHeading ae:pb-2">{title}</div>

      <div className="ae:overflow-x-auto ae:shadow-md ae:md:shadow ae:bg-white">
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
