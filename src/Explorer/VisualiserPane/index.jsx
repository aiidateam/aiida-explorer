import StructureVisualizer from "mc-react-structure-visualizer";

import { StructDownloadButton } from "mc-react-library";
import KpointsDataVisualiser from "./KpointsDataVisualiser";

const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

// handler for the visualiser pane
export default function VisualiserPane({ selectedNode }) {
  if (!selectedNode)
    return <div className="w-full h-full p-4">No node selected</div>;

  if (["StructureData", "CifData"].includes(selectedNode.data.label)) {
    // cifData only has a  cifDownload Method...
    const cifText = selectedNode.data.download.cifText;

    let dlFormats = [
      { format: "cif", label: "CIF" },
      { format: "xsf", label: "XSF" },
      { format: "xyz", label: "XYZ" },
    ];
    if (selectedNode.data.label === "CifData") {
      dlFormats = [{ format: "cif", label: "CIF" }];
    }

    return (
      <div className="w-full h-full p-4 relative">
        {/* Download button in top-right corner */}
        <div className="absolute top-8 right-8 z-50">
          <StructDownloadButton
            aiida_rest_url={BASE_URL}
            uuid={selectedNode.data.aiida.uuid}
            download_formats={dlFormats}
          />
        </div>
        {/* Visualizer fills the container */}
        <div className="w-full h-full">
          <StructureVisualizer cifText={cifText} initSupercell={[2, 2, 2]} />
        </div>
      </div>
    );
  }

  if (selectedNode.data.label === "KpointsData") {
    return (
      <KpointsDataVisualiser
        attributes={selectedNode.data.attributes}
        derivedProperties={selectedNode.data.derived_properties}
      />
    );
  }

  return (
    <div className="w-full h-full p-4">
      <pre>{JSON.stringify(selectedNode.data.download || {}, null, 2)}</pre>
    </div>
  );
}
