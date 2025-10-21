import DataTable from "../../components/DataTable";
import CardContainer from "../../components/CardContainer";

import { DownloadIcon } from "../../components/Icons";
import { omitGraphKeys } from "../../utils";

// This could be extended to use the BZ visualiser from this data (if possible);
// TODO - build a KPOINT converter that spits out VASP/QE formats
// TODO - move this from WIP...

// src/components/BZVisualizer.jsx
import React, { useEffect, useRef } from "react";
import { createBZVisualizer } from "brillouinzone-visualizer";

function BZVisualizer({ data, options }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      createBZVisualizer(containerRef.current, data, options);
    }
  }, [data, options]);

  return <div ref={containerRef} style={{ width: "100%", height: "400px" }} />;
}

function reciprocalLattice(cell) {
  if (!cell || cell.length < 3)
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];

  const [a1, a2, a3] = cell;

  const cross = (u, v) => [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];

  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];

  const volume = dot(a1, cross(a2, a3));

  const b1 = cross(a2, a3).map((x) => (2 * Math.PI * x) / volume);
  const b2 = cross(a3, a1).map((x) => (2 * Math.PI * x) / volume);
  const b3 = cross(a1, a2).map((x) => (2 * Math.PI * x) / volume);

  return [b1, b2, b3];
}

export default function KpointsDataVisualiser({ nodeData = {} }) {
  const attributes = nodeData.attributes || {};
  const derivedProperties = nodeData.derived_properties || {};

  if (!attributes && !derivedProperties) {
    return <div>No attributes available</div>;
  }

  // ----- Safe lattice extraction -----
  const lattice = attributes.cell
    ? {
        a: attributes.cell[0]?.[0] ?? 0,
        b: attributes.cell[1]?.[1] ?? 0,
        c: attributes.cell[2]?.[2] ?? 0,
      }
    : null;
  const numSites = attributes.cell?.length || 0;

  // ----- Bundle data for BZVisualizer -----
  const [b1, b2, b3] = reciprocalLattice(attributes.cell);

  const bzData = {
    ...derivedProperties,
    b1,
    b2,
    b3,
  };

  // ----- Reciprocal lattice table -----
  const recipColumns = ["vector", "x", "y", "z"];
  const recipData = [
    { vector: "b1", x: b1[0], y: b1[1], z: b1[2] },
    { vector: "b2", x: b2[0], y: b2[1], z: b2[2] },
    { vector: "b3", x: b3[0], y: b3[1], z: b3[2] },
  ];

  // ----- Cell table -----
  const cellColumns = ["x", "y", "z"];
  const cellData = (attributes.cell || []).map((row) => ({
    x: row[0] ?? 0,
    y: row[1] ?? 0,
    z: row[2] ?? 0,
  }));

  // ----- Mesh table -----
  const meshColumns = ["dimension", "value"];
  const meshData = (attributes.mesh || []).map((val, idx) => ({
    dimension: idx + 1,
    value: val ?? 0,
  }));

  // ----- Offset table -----
  const offsetColumns = ["i", "x", "y", "z"];
  const offsetData = (attributes.offset || []).map((val, idx) => ({
    i: idx + 1,
    x: Array.isArray(val) ? (val[0] ?? 0) : (val ?? 0),
    y: Array.isArray(val) ? (val[1] ?? 0) : 0,
    z: Array.isArray(val) ? (val[2] ?? 0) : 0,
  }));

  // ----- PBC table -----
  const pbcColumns = ["axis", "periodic"];
  const pbcData = ["pbc1", "pbc2", "pbc3"]
    .filter((key) => key in attributes)
    .map((key) => ({
      axis: key,
      periodic: !!attributes[key],
    }));

  // ----- ABS Kpoints table -----
  const kpointColumns = ["K-point number", "x", "y", "z"];
  const kpointData = (derivedProperties.explicit_kpoints_abs || []).map(
    (row, idx) => ({
      "K-point number": idx + 1,
      x: row[0] ?? 0,
      y: row[1] ?? 0,
      z: row[2] ?? 0,
    })
  );

  return (
    <div className="w-full mx-auto p-4 space-y-2">
      {/* Metadata / summary card */}

      {/* Brillouin Zone visualizer card */}
      <CardContainer
        header="Brillouin Zone"
        className="!px-1.5 !py-2"
        childrenClassName="!p-0"
      >
        <div className="w-full">
          <BZVisualizer
            data={bzData}
            options={{
              showAxes: true,
              showBVectors: true,
              showPathpoints: false,
              disableInteractOverlay: true,
            }}
          />
        </div>
      </CardContainer>

      {/* Tables in cards */}
      <DataTable
        title="Reciprocal cell vectors (1/Å)"
        columns={recipColumns}
        data={recipData}
        sortableCols={false}
      />

      <DataTable
        title="Cell"
        columns={cellColumns}
        data={cellData}
        sortableCols={false}
      />

      <DataTable
        title="Mesh"
        columns={meshColumns}
        data={meshData}
        sortableCols={false}
      />

      <DataTable
        title="Offset"
        columns={offsetColumns}
        data={offsetData}
        sortableCols={false}
      />

      <DataTable
        title="PBC Flags"
        columns={pbcColumns}
        data={pbcData}
        sortableCols={false}
      />

      <DataTable
        title="Explicit K-points (Absolute)"
        columns={kpointColumns}
        data={kpointData}
        sortableCols={false}
      />
    </div>
  );
}
