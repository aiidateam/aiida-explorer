import React, { useState } from "react";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import { ClipBoardIcon, ClipboardCopyIcon } from "../../../components/Icons";

export default function RawDataVisualiser({ nodeData = {} }) {
  const dataSections = [
    { title: "AIIDA Metadata", data: nodeData.aiida },
    { title: "Attributes", data: nodeData.attributes },
    { title: "Download", data: nodeData.download },
    { title: "Derived Properties", data: nodeData.derived_properties },
    { title: "Repository List", data: nodeData.repo_list },
    { title: "Files", data: nodeData.files },
    { title: "Extras", data: nodeData.extras },
  ];

  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (data, index) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedIndex(index);

    setTimeout(() => setCopiedIndex(null), 700);
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      {dataSections.map((section, index) => {
        const safeData = section.data || {};
        if (Object.keys(safeData).length === 0) return null;

        return (
          <div key={index} className="px-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{section.title}</h3>

              <button
                className="relative flex items-center gap-1 hover:text-blue-500"
                onClick={() => copyToClipboard(safeData, index)}
              >
                <ClipBoardIcon size={22} />

                <div
                  className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-400 text-sm transition-all duration-400 transform ${
                    copiedIndex === index
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  }`}
                >
                  <ClipboardCopyIcon size={16} />
                  <span>Copied</span>
                </div>
              </button>
            </div>

            <div className="max-h-96 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
              <JsonView data={safeData} collapsed={1} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
