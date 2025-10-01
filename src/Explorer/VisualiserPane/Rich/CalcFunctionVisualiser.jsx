import { useState } from "react";
import ReactDOM from "react-dom";
import DataTable from "../../../components/DataTable";
import { DownloadIcon, ViewIcon } from "../../../components/Icons";

export default function CalcFunctionVisualiser({ nodeData = {} }) {
  const files = nodeData.files || {};
  const inputFiles = Array.isArray(files.input_files) ? files.input_files : [];
  const outputFiles = Array.isArray(files.output_files)
    ? files.output_files
    : [];

  const [previewContent, setPreviewContent] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleViewFile = async (row) => {
    try {
      const res = await fetch(row.downloadUrl);
      const text = await res.text();
      setPreviewContent(text);
      setPreviewFile(row.name);
      setIsOpen(true);
    } catch (err) {
      console.error("Error loading preview:", err);
      setPreviewContent("Failed to load file.");
      setIsOpen(true);
    }
  };

  const inputCols = ["Files", "Download", "View"];
  const inputData = inputFiles.map((row) => ({
    Files: row.name,
    Download: (
      <a
        href={row.downloadUrl || "#"}
        download={row.name || undefined}
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
        onClick={() => handleViewFile(row)}
        className="text-green-600 hover:text-green-800 transition-colors"
      >
        <ViewIcon size={18} />
      </button>
    ),
  }));

  const outputCols = ["Files", "Download", "View"];
  const outputData = outputFiles.map((row) => ({
    Files: row.name,
    Download: (
      <a
        href={row.downloadUrl || "#"}
        download={row.name || undefined}
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
        onClick={() => handleViewFile(row)}
        className="text-green-600 hover:text-green-800 transition-colors"
      >
        <ViewIcon size={18} />
      </button>
    ),
  }));

  return (
    <>
      <div className="w-full h-full p-4 space-y-6 overflow-y-auto">
        {inputData.length > 0 && (
          <DataTable
            title="Input Files (in this node)"
            columns={inputCols}
            data={inputData}
            sortableCols={["Files"]}
          />
        )}
        {outputData.length > 0 && (
          <DataTable
            title="Output Files (retrieved)"
            columns={outputCols}
            data={outputData}
            sortableCols={["Files"]}
          />
        )}
        {inputData.length === 0 && outputData.length === 0 && (
          <div>No files available</div>
        )}
      </div>

      {/* Modal via portal - since we want to break fully out of the parent... */}
      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white p-4 rounded-xl shadow-lg w-[600px] max-h-[80vh] flex flex-col 
                         transform transition-all duration-200 ease-out animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h2 className="text-lg font-semibold">
                  Preview: {previewFile || "File"}
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
    </>
  );
}
