import StructureVisualizer from "mc-react-structure-visualizer";
import { useEffect, useState, useCallback, useRef } from "react";

import ErrorDisplay from "../../components/Error";
import Spinner from "../../components/Spinner";
import { StructDownloadButton } from "../../components/StructDownloadButton";

import CardContainer from "../../components/CardContainer";

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
export default function StructureDataVisualiser({ nodeData, restApiUrl }) {
  const aiidaCifPath = nodeData.downloadByFormat?.cif;

  const [cifText, setCifText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSmall, setIsSmall] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      setIsSmall(entry.contentRect.width < 600);
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

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
    <div className="w-full mx-auto p-4 space-y-6">
      <div
        ref={ref}
        className={`grid gap-4 ${isSmall ? "grid-cols-1" : "grid-cols-[1fr_auto]"}`}
      >
        {/* Left: Structure Viewer */}
        <div className="w-full h-[500px] relative bg-theme-100 shadow-sm overflow-hidden">
          <div className="absolute top-4 right-4 z-50">
            <StructDownloadButton
              aiida_rest_url={restApiUrl}
              uuid={nodeData.aiida.uuid}
              download_formats={dlFormats}
            />
          </div>
          <div className="w-full h-full">
            <StructureVisualizer cifText={cifText} initSupercell={[2, 2, 2]} />
          </div>
        </div>
        {/* Right: Text Cards */}
        <div className="flex flex-col space-y-4 max-w-xs">
          {hasDerived && (
            <>
              <CardContainer>
                <p>
                  <span className="font-medium">Cell Volume:</span>{" "}
                  {volume?.toFixed(4)} Å³
                </p>
                <p>
                  <span className="font-medium">Formula:</span>{" "}
                  {nodeData.derived_properties.formula}
                </p>
                <p>
                  <span className="font-medium">Dimensionality:</span>{" "}
                  {nodeData.derived_properties.dimensionality?.description ||
                    "N/A"}
                </p>
              </CardContainer>

              {lattice && (
                <CardContainer>
                  <p>
                    <span className="font-medium">Lattice a:</span>{" "}
                    {lattice.a.toFixed(4)} Å
                  </p>
                  <p>
                    <span className="font-medium">Lattice b:</span>{" "}
                    {lattice.b.toFixed(4)} Å
                  </p>
                  <p>
                    <span className="font-medium">Lattice c:</span>{" "}
                    {lattice.c.toFixed(4)} Å
                  </p>
                  <p>
                    <span className="font-medium">Number of Sites:</span>{" "}
                    {numSites}
                  </p>
                </CardContainer>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
