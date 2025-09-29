import React from "react";
import { StructDownloadButton } from "mc-react-library";
import StructureVisualizer from "mc-react-structure-visualizer";

// js for calculating very basic lattice information.
function getVol(nodeData, round = 4) {
  const cross = (u, v) => [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  const cell = nodeData.attributes.cell;
  const volume = Math.abs(
    cell[0].reduce((sum, val, i) => sum + val * cross(cell[1], cell[2])[i], 0)
  );
  return parseFloat(volume.toFixed(round));
}

function formatLattice(nodeData) {
  const cell = nodeData.attributes.cell;
  const a = Math.hypot(...cell[0]);
  const b = Math.hypot(...cell[1]);
  const c = Math.hypot(...cell[2]);
  return { a, b, c };
}

// StructureData has the 'derivedProps' key, cifData does not and we have to handle such case.
// TODO - add the full js method for multiple file types here. it seems quite cheap and probably a good use case
// TODO - alternatively could use discuss with adding download_formats endpoints here instead /
// TODO - add the download button as a built in inside of StructureVisualizer (mc-react-strucutre-vis) with the js logic embedded inside the component...
// This will simplify this ugly logic...export default function StructureVisualiser({ nodeData, baseUrl }) {
export default function StructureVisualiser({ nodeData, baseUrl }) {
  const cifStr = nodeData.download.cifText;

  const dlFormats =
    nodeData.label === "CifData"
      ? [{ format: "cif", label: "CIF" }]
      : [
          { format: "cif", label: "CIF" },
          { format: "xsf", label: "XSF" },
          { format: "xyz", label: "XYZ" },
        ];

  const hasDerived =
    nodeData.derived_properties &&
    Object.keys(nodeData.derived_properties).length > 0;

  const lattice = nodeData.attributes?.cell ? formatLattice(nodeData) : null;
  const volume = hasDerived
    ? nodeData.derived_properties.dimensionality?.value
    : lattice
    ? getVol(nodeData)
    : null;

  const numSites = nodeData.attributes?.sites?.length || 0;

  return (
    <div className="p-4">
      {hasDerived && (
        <div className="p grid grid-cols-2 gap-4">
          <div className="bg-gray-100 px-2 py-2 rounded shadow-sm">
            <p>
              <strong>Cell Volume:</strong> {volume?.toFixed(4)} Å³
            </p>
            <p>
              <strong>Formula:</strong> {nodeData.derived_properties.formula}
            </p>
            <p>
              <strong>Dimensionality:</strong>{" "}
              {nodeData.derived_properties.dimensionality?.description || "N/A"}
            </p>
          </div>
          {lattice && (
            <div className="bg-gray-100 px-2 py-2 rounded shadow-sm">
              <p>
                <strong>Lattice a:</strong> {lattice.a.toFixed(4)} Å
              </p>
              <p>
                <strong>Lattice b:</strong> {lattice.b.toFixed(4)} Å
              </p>
              <p>
                <strong>Lattice c:</strong> {lattice.c.toFixed(4)} Å
              </p>
              <p>
                <strong>Number of Sites:</strong> {numSites}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="w-full h-[500px] pt-4 relative">
        <div className="absolute top-8 right-8 z-50">
          <StructDownloadButton
            aiida_rest_url={baseUrl}
            uuid={nodeData.aiida.uuid}
            download_formats={dlFormats}
          />
        </div>
        <div className="w-full h-full relative overflow-hidden">
          <StructureVisualizer cifText={cifStr} initSupercell={[2, 2, 2]} />
        </div>
      </div>
    </div>
  );
}
