import React from "react";

export default function DataTable({
  title,
  columns,
  data,
  maxWidth = "1500px",
}) {
  if (!data || data.length < 1) return null;

  return (
    <div className="p-2" style={{ maxWidth }}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      <div className="overflow-x-auto shadow bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

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
