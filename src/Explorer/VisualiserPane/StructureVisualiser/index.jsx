import React from "react";

import { StructDownloadButton, matrix } from "mc-react-library";

import DataTable from "../../../components/DataTable";

import StructureVisualizer from "mc-react-structure-visualizer";

function getVol(nodeData, round = 4) {
  function cross(u, v) {
    return [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
  }

  const cell = nodeData.attributes.cell;
  const volume = Math.abs(matrix.dot(cell[0], cross(cell[1], cell[2])));
  return parseFloat(volume.toFixed(round));
}

export default function StructureVisualiser({ nodeData, baseUrl }) {
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
    <>
      <div className="pt-4 px-4">
        <p>
          Cell Volume:{" "}
          {nodeData.derived_properties.dimensionality.value.toFixed(4)} Å
        </p>
        <p>Formula: {nodeData.derived_properties.formula}</p>
      </div>
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
    </>
  );
}
