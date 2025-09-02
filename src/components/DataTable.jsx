import React from "react";

export default function DataTable({
  title,
  columns,
  data,
  maxHeight = "300px",
}) {
  if (!data || data.length < 1) {
    return null;
  }
  return (
    <div className="p-2">
      {/* Title */}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      {/* Table container with max height and vertical scroll */}
      <div
        className="overflow-x-auto shadow bg-white"
        style={{ maxHeight: maxHeight, overflowY: "auto" }}
      >
        <table className="min-w-full text-sm text-left">
          {/* Table head */}
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body */}
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-gray-800">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
