import JsonView from "@uiw/react-json-view";
import React, { useState } from "react";

// import { JSONTree } from "react-json-tree";
// import "./jsonview.css";

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
            </div>

            <div className="ae:max-h-32 ae:md:max-h-96 ae:overflow-auto ae:border ae:border-slate-200 ae:rounded ae:p-1 ae:bg-slate-100">
              <JsonView
                value={safeData}
                collapsed={false}
                shouldExpandNodeInitially={(isExpanded, { level }) => level < 2}
                displayDataTypes={false}
                enableClipboard={true}
              >
                {/* Remove quotes only for keys */}
                <JsonView.Quote
                  render={({ children, ...rest }, { type }) => {
                    // Only remove quotes for object keys
                    if (type === "key") return null;
                    return <span {...rest}>{children}</span>;
                  }}
                />
                <JsonView.Copied
                  render={({ "data-copied": copied, onClick, ...props }) => (
                    <button
                      {...props}
                      onClick={onClick}
                      type="button"
                      className="ae:flex ae:items-center ae:gap-1 ae:text-slate-700 ae:hover:text-blue-500"
                    >
                      {copied ? (
                        <>
                          <ClipboardCopyIcon
                            size={16}
                            className="ae:text-xs ae:text-green-400"
                          />
                        </>
                      ) : (
                        <ClipBoardIcon size={16} />
                      )}
                    </button>
                  )}
                />
              </JsonView>
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
