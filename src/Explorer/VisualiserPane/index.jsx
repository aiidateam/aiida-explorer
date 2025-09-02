import StructureVisualizer from "mc-react-structure-visualizer";
import { createBZVisualizer } from "brillouinzone-visualizer";

import KpointsDataVisualiser from "./KpointsDataVisualizer";

const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

import { useEffect, useRef } from "react";

export default function VisualiserPane({ selectedNode }) {
  if (!selectedNode)
    return <div className="w-full h-full p-4">No node selected</div>;

  if (selectedNode.data.label === "StructureData") {
    const cifText = selectedNode.data.download.cifText;
    return (
      <div className="w-full h-full p-4">
        <StructureVisualizer cifText={cifText} initSupercell={[2, 2, 2]} />
      </div>
    );
  }

  if (selectedNode.data.label === "KpointsData") {
    console.log(selectedNode.data);
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
