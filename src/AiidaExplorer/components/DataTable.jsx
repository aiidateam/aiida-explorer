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
      className={`${className} transform ${
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
// TODO - add className flexibility aswell.
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
    <div className="p-2" style={{ maxWidth }}>
      <h2 className="text-md md:text-md font-semibold mb-2">{title}</h2>

      <div className="overflow-x-auto shadow-md md:shadow bg-white">
        <table className="min-w-full text-xs md:text-sm text-left">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {columns.map((col) => {
                const sortable = Array.isArray(sortableCols)
                  ? sortableCols.includes(col)
                  : sortableCols;
                return (
                  <th
                    key={col}
                    className={`px-3 md:px-4 py-0.5 md:py-1 font-medium ${
                      sortable ? "cursor-pointer select-none" : ""
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
                    <div className="flex items-center gap-1">
                      {col}
                      {sortable && sortConfig.key === col && (
                        <SortIcon
                          direction={sortConfig.direction}
                          size={14}
                          className="ml-1 text-slate-500"
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
                className={idx % 2 === 0 ? "bg-slate-50" : "bg-slate-100"}
              >
                {columns.map((col) => {
                  const breakable = Array.isArray(breakableCols)
                    ? breakableCols.includes(col)
                    : breakableCols;

                  const tdClasses = [
                    "px-3 md:px-4 py-0.5 md:py-2 text-slate-900",
                    breakable
                      ? "whitespace-normal break-all"
                      : "whitespace-nowrap",
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
