import StructureVisualizer from "mc-react-structure-visualizer";
import { useEffect, useState, useCallback } from "react";

import ErrorDisplay from "../../../components/Error";
import Spinner from "../../../components/Spinner";
import { StructDownloadButton } from "../../../components/StructDownloadButton";

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
export default function StructureDataVisualiser({ nodeData, baseUrl }) {
  const aiidaCifPath = nodeData.downloadByFormat?.cif;

  console.log(baseUrl);

  const [cifText, setCifText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local fetchData function
  const fetchData = useCallback(async () => {
    if (!aiidaCifPath) {
      setError("No CIF file available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(aiidaCifPath);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const text = await res.text();
      setCifText(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [aiidaCifPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center w-full h-[500px]">
          <Spinner />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center w-full h-[500px] space-y-2">
          <ErrorDisplay message={error} onRetry={() => fetchData()} />
        </div>
      )}

      {/* Data */}
      {!loading && !error && cifText && (
        <>
          {/* CIF viewer */}
          <div className="w-full h-[500px] relative bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="absolute top-4 right-4 z-50">
              <StructDownloadButton
                aiida_rest_url={baseUrl}
                uuid={nodeData.aiida.uuid}
                download_formats={dlFormats}
              />
            </div>
            <div className="w-full h-full">
              <StructureVisualizer
                cifText={cifText}
                initSupercell={[2, 2, 2]}
              />
            </div>
          </div>
          {hasDerived && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-1">
                <p>
                  <strong>Cell Volume:</strong> {volume?.toFixed(4)} Å³
                </p>
                <p>
                  <strong>Formula:</strong>{" "}
                  {nodeData.derived_properties.formula}
                </p>
                <p>
                  <strong>Dimensionality:</strong>{" "}
                  {nodeData.derived_properties.dimensionality?.description ||
                    "N/A"}
                </p>
              </div>

              {lattice && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-1">
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
        </>
      )}
    </div>
  );
}
