import React from "react";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

export default function RawDataVisualiser({
  label = {},
  aiida = {},
  download = {},
  attributes = {},
  derived_properties = {},
  repo_list = {},
  files = {},
}) {
  const dataSections = [
    { title: "AIIDA Metadata", data: aiida },
    { title: "Attributes", data: attributes },
    { title: "Download", data: download },
    { title: "Derived Properties", data: derived_properties },
    { title: "Repository List", data: repo_list },
    { title: "Files", data: files },
  ];

  const copyToClipboard = (data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      {dataSections.map((section, index) => {
        const safeData = section.data || {}; // fallback if null/undefined
        return (
          Object.keys(safeData).length > 0 && (
            <div key={index} className="px-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <button
                  onClick={() => copyToClipboard(safeData)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
              <div className="max-h-96 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
                <JsonView data={safeData} collapsed={1} />
              </div>
            </div>
          )
        );
      })}
    </div>
  );
}
