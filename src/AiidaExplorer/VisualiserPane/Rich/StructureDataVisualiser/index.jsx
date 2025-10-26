import StructureVisualizer from "mc-react-structure-visualizer";
import { useEffect, useState, useCallback } from "react";

import CardContainer from "../../../components/CardContainer";

import ErrorDisplay from "../../../components/Error";
import Spinner from "../../../components/Spinner";

import { StructDownloadButton } from "./StructDownloadButton";

import {
  formatLattice,
  getVol,
  formatChemicalFormula,
  calculateDensity,
} from "./utils";

// StructureData has the 'derivedProps' key, cifData does not and we have to handle such case.
// TODO - add the full js method for multiple file types here. it seems quite cheap and probably a good use case
// TODO - alternatively could use discuss with adding download_formats endpoints here instead /
// TODO - add the download button as a built in inside of StructureVisualizer (mc-react-strucutre-vis) with the js logic embedded inside the component...
export default function StructureDataVisualiser({ nodeData, restApiUrl }) {
  const aiidaCifPath = nodeData.downloadByFormat?.cif;

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
  const dimensionality = nodeData.derived_properties.dimensionality.dim || null;

  let density;
  if (dimensionality === 3) {
    const volume = nodeData.derived_properties.dimensionality.value;
    const kinds = nodeData.attributes.kinds;
    const sites = nodeData.attributes.sites;

    density = calculateDensity(sites, volume, kinds);
  }

  if (loading) {
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <ErrorDisplay message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="ae:w-full ae:mx-auto ae:p-4 ae:space-y-6">
      <div className="@container">
        {/* <xl=1col [lhs expands], >xl=2col */}
        <div className="ae:grid ae:grid-cols-1 ae:gap-4 ae:@xl:grid-cols-[1fr_auto]">
          {/* Left: Structure Visualizer */}
          <div className="ae:w-full ae:h-[400px] ae:relative ae:bg-slate-100 ae:shadow-sm ae:overflow-hidden">
            <div className="ae:absolute ae:top-4 ae:right-4 ae:z-50">
              <StructDownloadButton
                aiida_rest_url={restApiUrl}
                uuid={nodeData.aiida.uuid}
                download_formats={dlFormats}
              />
            </div>
            <div className="ae:w-full ae:h-full">
              <StructureVisualizer
                cifText={cifText}
                initSupercell={[2, 2, 2]}
              />
            </div>
          </div>

          {/* Right: Cards in a flex-col*/}
          <div className="ae:flex ae:flex-col ae:space-y-4 ae:max-w-xs">
            {hasDerived && (
              <>
                <CardContainer>
                  <p>
                    <span className="ae:font-medium">Formula:</span>{" "}
                    {formatChemicalFormula(nodeData.derived_properties.formula)}
                  </p>
                  <p>
                    <span className="ae:font-medium">Cell Volume:</span>{" "}
                    {volume?.toFixed(4)} Å³
                  </p>

                  <p>
                    <span className="ae:font-medium">Dimensionality:</span>{" "}
                    {nodeData.derived_properties.dimensionality?.dim || "N/A"}
                  </p>
                  <p>
                    <span className="ae:font-medium">Density:</span>{" "}
                    {density || "N/A"} kg/m<sup>3</sup>
                  </p>
                </CardContainer>

                {lattice && (
                  <CardContainer>
                    <p>
                      <span className="ae:font-medium">Lattice a:</span>{" "}
                      {lattice.a.toFixed(4)} Å
                    </p>
                    <p>
                      <span className="ae:font-medium">Lattice b:</span>{" "}
                      {lattice.b.toFixed(4)} Å
                    </p>
                    <p>
                      <span className="ae:font-medium">Lattice c:</span>{" "}
                      {lattice.c.toFixed(4)} Å
                    </p>
                    <p>
                      <span className="ae:font-medium">Number of Sites:</span>{" "}
                      {numSites}
                    </p>
                  </CardContainer>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
