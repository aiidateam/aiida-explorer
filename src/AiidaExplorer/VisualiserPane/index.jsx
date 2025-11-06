import { useState, useEffect, useMemo } from "react";

import FormattedMetaData from "./FormattedMetaData";
import RawDataVisualiser from "./RawDataVisualiser";
import BandsDataVisualiser from "./Rich/BandsDataVisualiser";
import CalcJobVisualiser from "./Rich/CalcJobVisualiser";
import KpointsDataVisualiser from "./Rich/KpointsDataVisualiser";
import StructureDataVisualiser from "./Rich/StructureDataVisualiser";
import UpfDataVisualiser from "./Rich/UpfDataVisualiser";

const RICH_TYPES = {
  StructureData: StructureDataVisualiser,
  CifData: StructureDataVisualiser,
  BandsData: BandsDataVisualiser,
  UpfData: UpfDataVisualiser,
  KpointsData: KpointsDataVisualiser,
  CalcJobNode: CalcJobVisualiser,
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
  // memo the richVisualiser to only update if state changes - perf ++
  const richVisualiser = useMemo(
    () => geRichVisualiser(restApiUrl, selectedNode),
    [restApiUrl, selectedNode?.data?.label, selectedNode?.data?.aiida?.uuid]
  );
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
      <div className="ae:w-full ae:h-full ae:p-4">
        <p>
          Click a node to see top level details. Double click to traverse the
          graph.
        </p>
      </div>
    );
  }

  const richTabDisabled = !richVisualiser;

  return (
    <div className="ae:w-full ae:h-full ae:flex ae:flex-col ae:overflow-hidden">
      {/* Shortened Metadata */}
      <div className="ae:px-4 ae:py-3 ae:md:py-2 ae:bg-slate-50">
        <FormattedMetaData nodeData={selectedNode.data} userData={userData} />
      </div>

      {/* Tabs */}
      <div className="ae:flex ae:border-y ae:bg-slate-100">
        <button
          disabled={richTabDisabled}
          className={`ae:px-4 ae:py-2 ${
            activeTab === "rich"
              ? "ae:border-b-2 ae:border-slate-500 ae:transition ae:font-medium"
              : richTabDisabled
                ? "ae:text-gray-400 ae:cursor-not-allowed"
                : ""
          }`}
          onClick={() => !richTabDisabled && setActiveTab("rich")}
        >
          Rich View
        </button>
        <button
          className={`ae:px-4 ae:py-2 ${
            activeTab === "raw"
              ? "ae:border-b-2 ae:border-slate-500 ae:transition ae:font-medium"
              : ""
          }`}
          onClick={() => setActiveTab("raw")}
        >
          Raw View
        </button>
      </div>

      {/* Content */}
      <div className="ae:flex-1 ae:overflow-auto ae:bg-slate-50">
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
