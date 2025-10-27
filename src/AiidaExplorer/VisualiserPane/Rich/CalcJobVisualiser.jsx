import React, { useState } from "react";

import DataTable from "../../components/DataTable";
import {
  ClipBoardIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  ViewIcon,
} from "../../components/Icons";
import Overlay from "../../components/Overlay";

function FileTable({ title, dataArray = [], onView }) {
  const columns = ["File", "Download", "View"];
  const rows = dataArray.map((file) => ({
    File: file.name,
    Download: (
      <a
        href={file.downloadUrl || "#"}
        download={file.name || undefined}
        rel="noopener noreferrer"
        className="ae:text-blue-600 ae:hover:text-blue-800 ae:transition-colors ae:duration-75"
      >
        <DownloadIcon
          size={18}
          className="ae:hover:scale-105 ae:transition-all ae:duration-75"
        />
      </a>
    ),
    View: (
      <button
        type="button"
        onClick={() => onView?.(file.name, file.downloadUrl)}
        className="ae:text-green-600 ae:hover:text-green-800 ae:transition-colors ae:duration-75"
      >
        <ViewIcon
          size={18}
          className="ae:hover:scale-105 ae:transition-all ae:duration-75"
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
  const [previewContent, setPreviewContent] = useState(null);
  const [previewName, setPreviewName] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="ae:flex ae:flex-col ae:px-3 ae:py-2 ae:gap-2 ae:lg:gap-4">
      {fileTables}

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
