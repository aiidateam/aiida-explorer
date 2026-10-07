import { useQuery } from "@tanstack/react-query";
import { fromStructureData, getSymmetry } from "matsci-parse";
import StructureVisualizer from "mc-react-structure-visualizer";
import { useMemo, useEffect, useState } from "react";

import { StructDownloadButton } from "./StructDownloadButton";
import {
  formatLattice,
  getVol,
  formatChemicalFormula,
  calculateDensity,
} from "./utils";
import CardContainer from "../../../components/CardContainer";
import DataTable from "../../../components/DataTable";
import ErrorDisplay from "../../../components/Error";
import { DownloadIcon } from "../../../components/Icons";
import Spinner from "../../../components/Spinner";

// StructureData has the 'derivedProps' key, cifData does not and we have to handle such case.
// TODO - add the full js method for multiple file types here. it seems quite cheap and probably a good use case
// TODO - alternatively could use discuss with adding download_formats endpoints here instead /
// TODO - add the download button as a built in inside of StructureVisualizer (mc-react-strucutre-vis) with the js logic embedded inside the component...
// TODO - move spglib rendering and calc into its own component and make this more of a wrapper/layout component.
export default function StructureDataVisualiser({ nodeData, restApiUrl }) {
  const aiidaCifPath = nodeData.downloadByFormat?.cif;

  // --- Fetch CIF text ---
  const {
    data: cifText,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cifText", aiidaCifPath],
    queryFn: async () => {
      if (!aiidaCifPath) throw new Error("No CIF file available");
      const res = await fetch(aiidaCifPath);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      return res.text();
    },
    enabled: !!aiidaCifPath,
    staleTime: 1000 * 60 * 10, // 10 min cache.
    retry: 1,
  });

  const hasDerived =
    nodeData.derived_properties &&
    Object.keys(nodeData.derived_properties).length > 0;

  const lattice = nodeData.attributes?.cell || null;
  const latticeLengths = lattice ? formatLattice(nodeData) : null;
  const volume = hasDerived
    ? nodeData.derived_properties.dimensionality?.value
    : latticeLengths
      ? getVol(nodeData)
      : null;
  const sites = nodeData.attributes?.sites || [];
  const kinds = nodeData.attributes?.kinds || [];
  const numSites = sites.length;
  const dimensionality =
    nodeData.derived_properties?.dimensionality?.dim || null;

  // --- Symmetry analysis via matsci-parse (AiiDA adapter + moyo under the hood) ---
  const [symmetry, setSymmetry] = useState(null);
  const spgLib = symmetry?.calculationResults ?? null;

  useEffect(() => {
    if (!lattice || sites.length === 0 || kinds.length === 0) return;

    let cancelled = false;
    try {
      const structure = fromStructureData({
        cell: lattice,
        kinds: kinds.map((k) => ({ ...k, name: k.name?.trim?.() ?? k.name })),
        sites: sites.map((s) => ({
          ...s,
          kind_name: s.kind_name?.trim?.() ?? s.kind_name,
        })),
      });
      getSymmetry(structure, 5e-3)
        .then((result) => {
          if (!cancelled) setSymmetry(result);
        })
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
    return () => {
      cancelled = true;
    };
  }, [lattice, sites, kinds]);

  // --- Prepare standard cell table (fractional coordinates) ---
  const stdCellData = useMemo(() => {
    if (!symmetry?.conventional) return [];
    return symmetry.conventional.sites.map((site, i) => ({
      "#": i + 1,
      "Kind Name": site.species.symbol || "Unknown",
      "x [frac]": site.frac[0].toFixed(4),
      "y [frac]": site.frac[1].toFixed(4),
      "z [frac]": site.frac[2].toFixed(4),
    }));
  }, [symmetry]);

  // --- Prepare primitive cell table (fractional coordinates) ---
  const primCellData = useMemo(() => {
    if (!symmetry?.primitive) return [];
    return symmetry.primitive.sites.map((site, i) => ({
      "#": i + 1,
      "Kind Name": site.species.symbol || "Unknown",
      "x [frac]": site.frac[0].toFixed(4),
      "y [frac]": site.frac[1].toFixed(4),
      "z [frac]": site.frac[2].toFixed(4),
    }));
  }, [symmetry]);

  // --- Prepare atomic sites table (Å positions) ---
  const atomicSites = useMemo(
    () =>
      sites.map((site) => {
        const [x, y, z] = site.position;
        return {
          "Kind label": site.kind_name,
          "x [Å]": x.toFixed(4),
          "y [Å]": y.toFixed(4),
          "z [Å]": z.toFixed(4),
        };
      }),
    [sites],
  );

  // --- Density calculation ---
  const density = useMemo(() => {
    if (dimensionality !== 3) return null;
    return calculateDensity(sites, volume, kinds);
  }, [dimensionality, sites, volume, kinds]);

  if (isLoading)
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <Spinner />
      </div>
    );

  if (isError)
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <ErrorDisplay message={isError} onRetry={refetch} />
      </div>
    );

  return (
    <div className="ae:w-full ae:mx-auto ae:p-4 ae:space-y-6">
      <div className="ae:@container">
        <div className="ae:grid ae:grid-cols-1 ae:gap-4 ae:@xl:grid-cols-[1fr_auto]">
          {/* Left: Structure Visualizer */}
          <div className="ae:w-full ae:h-[400px] ae:relative ae:bg-slate-100 ae:shadow-sm ae:overflow-hidden">
            <div className="ae:absolute ae:top-4 ae:right-4 ae:z-50">
              <StructDownloadButton
                aiida_rest_url={restApiUrl}
                uuid={nodeData.aiida.uuid}
                download_formats={
                  nodeData.label === "CifData"
                    ? [{ format: "cif", label: "CIF" }]
                    : [
                        { format: "cif", label: "CIF" },
                        { format: "xsf", label: "XSF" },
                        { format: "xyz", label: "XYZ" },
                      ]
                }
              />
            </div>
            <div className="ae:w-full ae:h-full">
              <StructureVisualizer
                cifText={cifText}
                initSupercell={[2, 2, 2]}
              />
            </div>
          </div>

          {/* Right: Cards */}
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
                    {dimensionality || "N/A"}
                  </p>
                  <p>
                    <span className="ae:font-medium">Density:</span>{" "}
                    {density || "N/A"} kg/m<sup>3</sup>
                  </p>
                </CardContainer>

                {latticeLengths && (
                  <CardContainer>
                    <p>
                      <span className="ae:font-medium">Lattice a:</span>{" "}
                      {latticeLengths.a.toFixed(4)} Å
                    </p>
                    <p>
                      <span className="ae:font-medium">Lattice b:</span>{" "}
                      {latticeLengths.b.toFixed(4)} Å
                    </p>
                    <p>
                      <span className="ae:font-medium">Lattice c:</span>{" "}
                      {latticeLengths.c.toFixed(4)} Å
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

        {/* Atomic positions table */}
        <div className="pt-1">
          <DataTable
            title="Atomic Positions (from AiiDA)"
            columns={["Kind label", "x [Å]", "y [Å]", "z [Å]"]}
            data={atomicSites}
            sortableCols={false}
          />
        </div>

        {/* Crystal symmetry info */}
        {spgLib && (
          <div className="space-y-3">
            <div className="explorerHeading ae:flex ae:items-center ae:pt-4 ae:font-lg">
              <span>
                Symmetry information calculated on-the-fly using{" "}
                <a href="https://github.com/spglib/moyo" target="_blank">
                  spglib/moyo
                </a>{" "}
                (symprec: 5×10⁻³)
              </span>
              <DownloadIcon
                data={spgLib}
                filename="spglib.json"
                size={20}
                className="ae:text-blue-600 ae:hover:text-blue-800 ae:hover:cursor-pointer"
              />
            </div>
            <CardContainer>
              <p>
                <span className="ae:font-medium">Space group:</span>{" "}
                {spgLib.hm_symbol.replace(/\s+/g, "")} (#
                {spgLib.number})
              </p>
              <p>
                <span className="ae:font-medium">Hall number:</span>{" "}
                {spgLib.hall_number}
              </p>
              <p>
                <span className="ae:font-medium">Pearson symbol:</span>{" "}
                {spgLib.pearson_symbol}
              </p>
              <p>
                <span className="ae:font-medium">
                  Number of symmetry operations:
                </span>{" "}
                {spgLib.operations.length}
              </p>
            </CardContainer>

            {spgLib.wyckoffs && spgLib.site_symmetry_symbols && (
              <DataTable
                title="Wyckoff Positions & Site Symmetry"
                columns={["Site #", "Wyckoff", "Site Symmetry"]}
                data={spgLib.wyckoffs.map((wyckoff, i) => ({
                  "Site #": i + 1,
                  Wyckoff: wyckoff,
                  "Site Symmetry": spgLib.site_symmetry_symbols[i],
                }))}
                sortableCols={false}
              />
            )}

            {primCellData.length > 0 && (
              <DataTable
                title="Primitive cell Atomic Positions"
                columns={["#", "Kind Name", "x [frac]", "y [frac]", "z [frac]"]}
                data={primCellData}
                sortableCols={false}
              />
            )}

            {stdCellData.length > 0 && (
              <DataTable
                title="Standard Cell Atomic Positions"
                columns={["#", "Kind Name", "x [frac]", "y [frac]", "z [frac]"]}
                data={stdCellData}
                sortableCols={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
