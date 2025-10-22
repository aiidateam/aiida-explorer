import React, { useState } from "react";
import { JsonView, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

import DataTable from "../../components/DataTable";

import {
  ClipBoardIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  ViewIcon,
} from "../../components/Icons";
import Overlay from "../../components/Overlay";

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

export default function CalcJobVisualiser({ nodeData = {} }) {
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

  // --- render file tables ---
  const fileTables = (
    <>
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
    </>
  );

  return (
    <div className="flex flex-col px-3 py-2 gap-2 lg:gap-4">
      {fileTables}

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
