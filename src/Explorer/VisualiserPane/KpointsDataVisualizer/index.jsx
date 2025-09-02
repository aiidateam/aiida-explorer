// KpointsDataVisualiser.jsx
import React from "react";
import DataTable from "../../../components/DataTable";

export default function KpointsDataVisualiser({
  attributes,
  derivedProperties,
}) {
  if (!attributes) return <div>No attributes available</div>;

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
  const pbcData = [
    { axis: "pbc1", periodic: attributes.pbc1 ? "True" : "False" },
    { axis: "pbc2", periodic: attributes.pbc2 ? "True" : "False" },
    { axis: "pbc3", periodic: attributes.pbc3 ? "True" : "False" },
  ];

  // ----- ABS Kpoints table -----
  const kpointColumns = ["K-point number", "x", "y", "z"];
  const kpointData = derivedProperties.explicit_kpoints_abs.map((row, idx) => ({
    "K-point number": idx + 1,
    x: row[0],
    y: row[1],
    z: row[2],
  }));

  return (
    <div className="w-full h-full p-4 space-y-6 overflow-y-auto">
      <DataTable title="Cell" columns={cellColumns} data={cellData} />
      <DataTable title="Mesh" columns={meshColumns} data={meshData} />
      <DataTable title="Offset" columns={offsetColumns} data={offsetData} />
      <DataTable title="PBC Flags" columns={pbcColumns} data={pbcData} />
      <DataTable
        key="explicit_kpoints_abs"
        title="Explicit K-points (Absolute)"
        columns={kpointColumns}
        data={kpointData}
      />
    </div>
  );
}
