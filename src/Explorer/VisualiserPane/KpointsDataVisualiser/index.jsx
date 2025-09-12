import DataTable from "../../../components/DataTable";
import { DownloadIcon } from "../../../components/Icons";

// This could be extended to use the BZ visualiser from this data (if possible);
// If a nice parser for VASP/QE/etc exists we could in principle also allow multiple download types.
export default function KpointsDataVisualiser({ nodeData = {} }) {
  const download = nodeData.download || {};
  const attributes = nodeData.attributes || {};
  const derivedProperties = nodeData.derivedProperties || {};

  if (!attributes && !derivedProperties) {
    return <div>No attributes available</div>;
  }

  // ----- Cell table -----
  const cellColumns = ["x", "y", "z"];
  const cellData = (attributes.cell || []).map((row) => ({
    x: row[0],
    y: row[1],
    z: row[2],
  }));

  // ----- Mesh table -----
  const meshColumns = ["dimension", "value"];
  const meshData = (attributes.mesh || []).map((val, idx) => ({
    dimension: idx + 1,
    value: val,
  }));

  // ----- Offset table -----
  const offsetColumns = ["i", "x", "y", "z"];
  const offsetData = (attributes.offset || []).map((val, idx) => ({
    i: idx + 1,
    x: val[0] ?? val,
    y: val[1] ?? 0,
    z: val[2] ?? 0,
  }));

  // ----- PBC table -----
  const pbcColumns = ["axis", "periodic"];
  const pbcData = ["pbc1", "pbc2", "pbc3"]
    .filter((key) => key in attributes)
    .map((key) => ({
      axis: key,
      periodic: attributes[key] ? "True" : "False",
    }));

  // ----- ABS Kpoints table -----
  const kpointColumns = ["K-point number", "x", "y", "z"];
  const kpointData = (derivedProperties.explicit_kpoints_abs || []).map(
    (row, idx) => ({
      "K-point number": idx + 1,
      x: row[0],
      y: row[1],
      z: row[2],
    })
  );

  return (
    <div className="w-full h-full p-4 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-1">
        <h3 className="text-2xl">Kpoints Data</h3>
        {/* for now we are downloading all the props. */}
        <DownloadIcon
          data={{ download, attributes, derivedProperties }}
          filename={"kpoints.json"}
          size={22}
          className="pb-0.5"
        />
      </div>
      <DataTable
        key="cell"
        title="Cell"
        columns={cellColumns}
        data={cellData}
        sortableCols={false}
      />
      <DataTable
        key="mesh"
        title="Mesh"
        columns={meshColumns}
        data={meshData}
        sortableCols={false}
      />
      <DataTable
        key="offset"
        title="Offset"
        columns={offsetColumns}
        data={offsetData}
        sortableCols={false}
      />
      <DataTable
        key="pbc"
        title="PBC Flags"
        columns={pbcColumns}
        data={pbcData}
        sortableCols={false}
      />
      <DataTable
        key="kpoints"
        title="Explicit K-points (Absolute)"
        columns={kpointColumns}
        data={kpointData}
        sortableCols={false}
      />
    </div>
  );
}
