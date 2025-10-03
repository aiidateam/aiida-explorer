import React, { useState } from "react";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import {
  ClipBoardIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  ViewIcon,
} from "../../components/Icons";
import DataTable from "../../components/DataTable";
import ReactDOM from "react-dom";

function FileTable({ title, dataArray = [], onView }) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return null;

  const columns = ["File", "Download", "View"];
  const rows = dataArray.map((file) => ({
    File: file.name,
    Download: (
      <a
        href={file.downloadUrl || "#"}
        download={file.name || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        <DownloadIcon size={18} />
      </a>
    ),
    View: (
      <button
        type="button"
        onClick={() => onView?.(file.name, file.downloadUrl)}
        className="text-green-600 hover:text-green-800 transition-colors"
      >
        <ViewIcon size={18} />
      </button>
    ),
  }));

  return (
    <div className="">
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
    { title: "Derived Properties", data: nodeData.derived_properties },
    { title: "Extras", data: nodeData.extras },
    { title: "Full AIIDA Metadata", data: nodeData.aiida, collapseLevel: 0 },
  ];

  // --- render file tables ---
  const fileTables = (
    <>
      <FileTable
        title="Download By format"
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
        title="Input Files (in this node)"
        dataArray={nodeData.files?.input_files || []}
        onView={handleViewFile}
      />
      <FileTable
        title="Output Files (retrieved)"
        dataArray={nodeData.files?.output_files || []}
        onView={handleViewFile}
      />
      <FileTable
        title="Raw Files"
        dataArray={nodeData.repo_list || []}
        onView={handleViewFile}
      />
    </>
  );

  return (
    <div className="flex flex-col px-3 py-2 gap-2 md:gap-4">
      {fileTables}

      {dataSections.map((section, index) => {
        const safeData = section.data || {};
        if (Object.keys(safeData).length === 0) return null;

        return (
          <div key={index} className="py-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-md md:text-lg ml-2 font-semibold">
                {section.title}
              </h3>
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

            <div className="max-h-32 md:max-h-96 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
              <JsonView
                data={safeData}
                shouldExpandNode={(level) =>
                  level < (section.collapseLevel ?? 1)
                }
              />
            </div>
          </div>
        );
      })}

      {/* Modal for preview */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white p-4 rounded-xl shadow-lg w-[600px] max-h-[80vh] flex flex-col transform transition-all duration-200 ease-out animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h2 className="text-lg font-semibold">
                  Preview: {previewName}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <pre className="overflow-y-auto whitespace-pre-wrap text-sm flex-1">
                {previewContent}
              </pre>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
