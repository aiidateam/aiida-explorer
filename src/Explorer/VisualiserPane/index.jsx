import { useState, useEffect } from "react";
import KpointsDataVisualiser from "./Rich/KpointsDataVisualiser";
import FolderDataVisualiser from "./Rich/FolderDataVisualiser";
import CalcJobVisualiser from "./Rich/CalcJobVisualiser";
import UpfDataVisualiser from "./Rich/UpfDataVisualiser";
import RawDataVisualiser from "./RawDataVisualiser";
import StructureVisualiser from "./Rich/StructureVisualiser";
import FormattedMetaData from "./FormattedMetaData";

export default function VisualiserPane({ baseUrl, selectedNode, userData }) {
  // Always declare hooks first
  const [activeTab, setActiveTab] = useState("rich");

  // Determine if rich visualiser exists
  const richVisualiser = (() => {
    if (!selectedNode) return null;
    const { label, aiida } = selectedNode.data;
    switch (label) {
      case "StructureData":
      case "CifData":
        return (
          <StructureVisualiser key={aiida?.uuid} nodeData={selectedNode.data} />
        );
      case "KpointsData":
        return (
          <KpointsDataVisualiser
            key={aiida?.uuid}
            nodeData={selectedNode.data}
          />
        );
      case "UpfData":
        return (
          <UpfDataVisualiser
            key={aiida?.uuid}
            nodeData={selectedNode.data}
            baseUrl={baseUrl}
          />
        );
      case "FolderData":
        return (
          <FolderDataVisualiser
            key={aiida?.uuid}
            nodeData={selectedNode.data}
          />
        );
      case "CalcJobNode":
        return (
          <CalcJobVisualiser key={aiida?.uuid} nodeData={selectedNode.data} />
        );
      default:
        return null;
    }
  })();

  useEffect(() => {
    if (!richVisualiser) {
      setActiveTab("raw");
    }
  }, [richVisualiser]);

  if (!selectedNode) {
    return (
      <div className="w-full h-full p-4">
        <p>
          Click a node to see top level details. Double click to traverse the
          graph.
        </p>
      </div>
    );
  }

  const richTabDisabled = !richVisualiser;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Shortened Metadata */}
      <div className="p-4 border-b bg-slate-50">
        <FormattedMetaData nodeData={selectedNode.data} userData={userData} />
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-100">
        <button
          disabled={richTabDisabled}
          className={`px-4 py-2 ${
            activeTab === "rich"
              ? "border-b-2 border-blue-500 font-semibold"
              : richTabDisabled
              ? "text-gray-400 cursor-not-allowed"
              : ""
          }`}
          onClick={() => !richTabDisabled && setActiveTab("rich")}
        >
          Rich View
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "raw"
              ? "border-b-2 border-blue-500 font-semibold"
              : ""
          }`}
          onClick={() => setActiveTab("raw")}
        >
          Raw View
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "rich" && richVisualiser}
        {activeTab === "raw" && (
          <RawDataVisualiser nodeData={selectedNode.data} />
        )}
      </div>
    </div>
  );
}
