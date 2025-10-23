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
  const buttonLinkClassName = "ae:transition-colors ae:duration-75";
  const buttonIconClassName =
    "ae:hover:scale-105 ae:transition-all ae:duration-75 ae:hover:cursor-pointer";

  if (!Array.isArray(dataArray) || dataArray.length === 0) return null;

  const columns = ["File", "Download", "View"];
  const rows = dataArray.map((file) => ({
    File: file.name,
    Download: (
      <a
        href={file.downloadUrl || "#"}
        download={file.name || undefined}
        rel="noopener noreferrer"
        className={`ae:text-blue-600 ae:hover:text-blue-800 ${buttonLinkClassName}`}
      >
        <DownloadIcon size={18} className={buttonIconClassName} />
      </a>
    ),
    View: (
      <button
        type="button"
        onClick={() => onView?.(file.name, file.downloadUrl)}
        className={`ae:text-green-600 ae:hover:text-green-800 ${buttonLinkClassName}`}
      >
        <ViewIcon size={18} className={buttonIconClassName} />
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
    container: `${defaultStyles.container} custom-json-container`,
  };

  return (
    <div className="ae:flex ae:flex-col ae:px-3 ae:py-2 ae:gap-2 ae:lg:gap-4">
      {fileTables}

      {dataSections.map((section, index) => {
        const safeData = section.data || {};
        if (Object.keys(safeData).length === 0) return null;

        return (
          <div key={index} className="ae:py-1 ae:px-2">
            <div className="ae:flex ae:items-center ae:gap-2 ae:pb-2">
              <div className="explorerHeading">{section.title}</div>
              <button
                className="ae:relative ae:flex ae:items-center ae:gap-1 ae:hover:text-blue-800"
                onClick={() => copyToClipboard(safeData, index)}
              >
                <ClipBoardIcon size={18} />
                <div
                  className={`ae:absolute ae:left-full ae:ml-2 ae:top-1/2 ae:-translate-y-1/2 ae:flex ae:items-center ae:gap-1 ae:text-green-400 ae:text-sm ae:transition-all ae:duration-400 ae:transform ${
                    copiedIndex === index
                      ? "ae:opacity-100 ae:translate-x-0"
                      : "ae:opacity-0 ae:-translate-x-2"
                  }`}
                >
                  <ClipboardCopyIcon size={16} />
                  <span>Copied</span>
                </div>
              </button>
            </div>

            <div className="ae:max-h-32 ae:md:max-h-96 ae:overflow-auto ae:border ae:border-slate-200 ae:rounded ae:p-1 ae:bg-slate-100">
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
        <pre className="ae:overflow-y-auto ae:whitespace-pre-wrap ae:text-sm ae:flex-1">
          {previewContent}
        </pre>
      </Overlay>
    </div>
  );
}
