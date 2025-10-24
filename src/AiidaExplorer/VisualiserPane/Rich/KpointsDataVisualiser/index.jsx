import React, { useEffect, useRef, useMemo } from "react";

import CardContainer from "../../../components/CardContainer";
import DataTable from "../../../components/DataTable";

import BZVisualizer from "./BZVis";

import { RoundVals, reciprocalLattice, Columns } from "./utils";

// TODO - build a KPOINT converter that spits out VASP/QE formats
// TODO - Dont render missing tables / better fallbacks
// KpointsDataVisualiser.js
export default function KpointsDataVisualiser({ nodeData = {} }) {
  const attributes = nodeData.attributes || {};
  const derivedProperties = nodeData.derived_properties || {};

  // check if there is a k-path
  let path = null;
  if (attributes?.labels && attributes?.label_numbers) {
    path = attributes.labels.join(" → ");
    if (path.length > 20) {
      path = path.slice(0, 17) + "...";
    }
  }

  const hasData = useMemo(
    () => !!attributes?.cell || !!derivedProperties,
    [attributes, derivedProperties]
  );
  if (!hasData) return <div>No attributes available</div>;

  // ----- Reciprocal lattice -----
  const [b1, b2, b3] = useMemo(() => {
    if (!attributes.cell) return [null, null, null];
    return reciprocalLattice(attributes.cell);
  }, [attributes.cell]);

  if (attributes?.labelled_kpoints_abs) {
  }

  // ----- Memoized BZ data -----
  const bzData = useMemo(() => {
    if (!attributes.cell) return null;
    return {
      ...derivedProperties,
      b1,
      b2,
      b3,
      kpoints: derivedProperties.labelled_kpoints_abs,
      path: derivedProperties.labelled_path,
    };
  }, [b1, b2, b3, derivedProperties]);

  // ----- Reciprocal lattice table -----
  const recipData = useMemo(() => {
    if (!b1 || !b2 || !b3) return [];
    return RoundVals(
      [
        { "": "b₁", x: b1[0], y: b1[1], z: b1[2] },
        { "": "b₂", x: b2[0], y: b2[1], z: b2[2] },
        { "": "b₃", x: b3[0], y: b3[1], z: b3[2] },
      ],
      4
    );
  }, [b1, b2, b3]);

  // ----- Cell table -----
  const cellData = useMemo(
    () =>
      RoundVals(
        (attributes.cell || []).map((row) => ({
          x: row[0] ?? 0,
          y: row[1] ?? 0,
          z: row[2] ?? 0,
        }))
      ),
    [attributes.cell]
  );

  // ----- Kpoints Mesh and Offset -----
  const meshOffsetRows = useMemo(() => {
    const [m1, m2, m3] = attributes.mesh ?? ["N/A", "N/A", "N/A"];
    const [o1, o2, o3] = Array.isArray(attributes.offset?.[0])
      ? attributes.offset[0]
      : (attributes.offset ?? [0, 0, 0]);

    return [
      { "": "Mesh", "b₁": m1, "b₂": m2, "b₃": m3 },
      { "": "Offset", "b₁": o1 ?? 0, "b₂": o2 ?? 0, "b₃": o3 ?? 0 },
    ];
  }, [attributes.mesh, attributes.offset]);

  // ----- PBC table -----
  const pbcData = useMemo(
    () => [
      { Axis: "b₁", Value: String(attributes.pbc1) },
      { Axis: "b₂", Value: String(attributes.pbc2) },
      { Axis: "b₃", Value: String(attributes.pbc3) },
    ],
    [attributes.pbc1, attributes.pbc2, attributes.pbc3]
  );

  // ----- ABS Kpoints table -----
  const kpointData = useMemo(
    () =>
      RoundVals(
        (derivedProperties.explicit_kpoints_abs || []).map((row) => ({
          Kx: row[0] ?? 0,
          Ky: row[1] ?? 0,
          Kz: row[2] ?? 0,
        })),
        5
      ),
    [derivedProperties.explicit_kpoints_abs]
  );

  // ----- REL Kpoints table -----
  const kpointDataR = useMemo(
    () =>
      RoundVals(
        (derivedProperties.explicit_kpoints_rel || []).map((row) => ({
          Kx: row[0] ?? 0,
          Ky: row[1] ?? 0,
          Kz: row[2] ?? 0,
        })),
        5
      ),
    [derivedProperties.explicit_kpoints_rel]
  );

  // Table configuration array for mapping
  const tables = useMemo(
    () => [
      {
        title: "Reciprocal cell vectors (1/Å)",
        columns: Columns.recipColumns,
        data: recipData,
      },
      { title: "Cell", columns: Columns.cellColumns, data: cellData },
      {
        title: "Kpoints mesh and offset",
        columns: Columns.meshOffsetCols,
        data: meshOffsetRows,
      },
      { title: "PBC Flags", columns: Columns.pbcCols, data: pbcData },
      {
        title: "Kpoints (1/Å)",
        columns: Columns.kpointColumns,
        data: kpointData,
      },
      {
        title: "Kpoints (scaled units)",
        columns: Columns.kpointColumnsR,
        data: kpointDataR,
      },
    ],
    [recipData, cellData, meshOffsetRows, pbcData, kpointData, kpointDataR]
  );

  return (
    <div className="ae:w-full ae:mx-auto ae:p-4 ae:space-y-2">
      {/* Brillouin Zone visualizer card */}
      {attributes?.cell && bzData && (
        <CardContainer
          header={`Brillouin Zone${path ? ` (${path})` : ""}`}
          className="ae:!px-1.5 ae:!py-2"
          childrenClassName="ae:!p-0"
        >
          <div className="ae:w-full">
            <BZVisualizer data={bzData} />
          </div>
        </CardContainer>
      )}

      {/* Tables in cards */}
      <div className="ae:@container">
        {/* Small 1 col >xl 2 col */}
        <div className="ae:grid ae:grid-cols-1 ae:@xl:grid-cols-2">
          {tables.map(({ title, columns, data }) => (
            <DataTable
              key={title}
              title={title}
              columns={columns}
              data={data}
              sortableCols={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
