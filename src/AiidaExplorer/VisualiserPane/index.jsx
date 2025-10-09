import { useState, useEffect } from "react";

import FormattedMetaData from "./FormattedMetaData";
import RawDataVisualiser from "./RawDataVisualiser";
import BandsDataVisualiser from "./Rich/BandsDataVisualiser";
import StructureDataVisualiser from "./Rich/StructureDataVisualiser";
import UpfDataVisualiser from "./Rich/UpfDataVisualiser";

const RICH_TYPES = {
  StructureData: StructureDataVisualiser,
  CifData: StructureDataVisualiser,
  BandsData: BandsDataVisualiser,
  UpfData: UpfDataVisualiser,
};

function geRichVisualiser(restApiUrl, selectedNode) {
  if (!selectedNode) return null;
  if (!selectedNode.data) return null;
  const { label, aiida } = selectedNode.data;
  const VisualiserComponent = RICH_TYPES[label];
  if (VisualiserComponent) {
    return (
      <VisualiserComponent
        key={aiida?.uuid}
        nodeData={selectedNode.data}
        restApiUrl={restApiUrl}
      />
    );
  }

  return null;
}

export default function VisualiserPane({
  restApiUrl,
  selectedNode,
  userData, // fetched for user if
  downloadFormats, // fetched for download formats.
}) {
  let richVisualiser = geRichVisualiser(restApiUrl, selectedNode);

  const [activeTab, setActiveTab] = useState(richVisualiser ? "rich" : "raw");

  useEffect(() => {
    if (!richVisualiser) {
      setActiveTab("raw");
    } else {
      setActiveTab("rich");
    }
  }, [selectedNode]);

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
      <div className="px-4 py-3 md:py-2 border-b bg-slate-50">
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
          <RawDataVisualiser
            nodeData={selectedNode.data}
            downloadFormats={downloadFormats}
          />
        )}
      </div>
    </div>
  );
}
