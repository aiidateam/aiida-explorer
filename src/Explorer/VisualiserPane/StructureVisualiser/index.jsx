import React from "react";

import { StructDownloadButton } from "mc-react-library";

import StructureVisualizer from "mc-react-structure-visualizer";

export function StructureVisualiser({ nodeData, baseUrl }) {
  const cifStr = nodeData.download.cifText;

  let dlFormats = [
    { format: "cif", label: "CIF" },
    { format: "xsf", label: "XSF" },
    { format: "xyz", label: "XYZ" },
  ];

  if (nodeData.label === "CifData") {
    dlFormats = [{ format: "cif", label: "CIF" }];
  }

  return (
    <div className="w-full h-full p-4 relative">
      {/* Download button in top-right corner */}
      <div className="absolute top-8 right-8 z-50">
        <StructDownloadButton
          aiida_rest_url={baseUrl}
          uuid={nodeData.aiida.uuid}
          download_formats={dlFormats}
        />
      </div>
      {/* Visualizer fills the container */}
      <div className="w-full h-full">
        <StructureVisualizer cifText={cifStr} initSupercell={[2, 2, 2]} />
      </div>
    </div>
  );
}
