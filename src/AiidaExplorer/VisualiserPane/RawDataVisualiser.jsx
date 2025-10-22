import React, { useState } from "react";
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import "./jsonview.css";

import DataTable from "../components/DataTable";
import {
  ClipBoardIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  ViewIcon,
} from "../components/Icons";
import Overlay from "../components/Overlay";

function FileTable({ title, dataArray = [], onView }) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return null;

  const columns = ["File", "Download", "View"];
  const rows = dataArray.map((file) => ({
    File: file.name,
    Download: (
      <a
        href={file.downloadUrl || "#"}
        download={file.name || undefined}
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors duration-75"
      >
        <DownloadIcon
          size={18}
          className="hover:scale-105 transition-all duration-75"
        />
      </a>
    ),
    View: (
      <button
        type="button"
        onClick={() => onView?.(file.name, file.downloadUrl)}
        className="text-green-600 hover:text-green-800 transition-colors duration-75"
      >
        <ViewIcon
          size={18}
          className="hover:scale-105 transition-all duration-75"
        />
      </button>
    ),
  }));

  return (
    <div>
      <DataTable
        title={title}
        columns={columns}
        data={rows}
        sortableCols={["File"]}
      />
    </div>
  );
}

export default function RawDataVisualiser({ nodeData = {} }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewName, setPreviewName] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (data, index) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 700);
  };

  const handleViewFile = async (name, url) => {
    try {
      const res = await fetch(url);
      const text = await res.text();
      setPreviewContent(text);
      setPreviewName(name);
      setIsOpen(true);
    } catch (err) {
      console.error("Error loading preview:", err);
      setPreviewContent("Failed to load preview.");
      setPreviewName(name);
      setIsOpen(true);
    }
  };

  const dataSections = [
    { title: "Attributes", data: nodeData.attributes },
    { title: "Derived properties", data: nodeData.derived_properties },
    { title: "Extras", data: nodeData.extras },
    { title: "Full AiiDA metadata", data: nodeData.aiida, collapseLevel: 0 },
  ];

  // --- render file tables ---
  const fileTables = (
    <>
      <FileTable
        title="Download node by format"
        dataArray={
          nodeData.downloadByFormat
            ? Object.entries(nodeData.downloadByFormat).map(
                ([format, downloadUrl]) => ({
                  name: format,
                  downloadUrl,
                })
              )
            : []
        }
        onView={handleViewFile}
      />
      <FileTable
        title="Files in this node"
        dataArray={nodeData.repo_list || []}
        onView={handleViewFile}
      />
    </>
  );

  const customStyle = {
    ...defaultStyles,
    label: `${defaultStyles.label} custom-json-label`,
    clickableLabel: `${defaultStyles.clickableLabel} custom-json-label`,
    container: `${defaultStyles.container} custom-json-container`,
  };

  return (
    <div className="flex flex-col px-3 py-2 gap-2 lg:gap-4">
      {fileTables}

      {dataSections.map((section, index) => {
        const safeData = section.data || {};
        if (Object.keys(safeData).length === 0) return null;

        return (
          <div key={index} className="py-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-md ml-2 font-semibold">{section.title}</h3>
              <button
                className="relative flex items-center gap-1 hover:text-blue-500"
                onClick={() => copyToClipboard(safeData, index)}
              >
                <ClipBoardIcon size={18} />
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

            <div className="max-h-32 md:max-h-96 overflow-auto border border-slate-200 rounded p-1 bg-slate-100">
              <JsonView
                data={safeData}
                shouldExpandNode={(level) =>
                  level < (section.collapseLevel ?? 1)
                }
                style={customStyle}
              />
            </div>
          </div>
        );
      })}

      <Overlay
        active={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Preview: ${previewName}`}
      >
        <pre className="overflow-y-auto whitespace-pre-wrap text-sm flex-1">
          {previewContent}
        </pre>
      </Overlay>
    </div>
  );
}
