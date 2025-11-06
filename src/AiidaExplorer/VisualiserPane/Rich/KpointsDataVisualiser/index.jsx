import React, { useState, useEffect } from "react";

import BZVisualizer from "./BZVis";
import { reciprocalLattice, RoundVals, Columns } from "./utils";
import CardContainer from "../../../components/CardContainer";
import DataTable from "../../../components/DataTable";
import Spinner from "../../../components/Spinner";

// TODO - build a KPOINT converter that spits out VASP/QE formats
// TODO - Dont render missing tables / better fallbacks
export default function KpointsDataVisualiser({ nodeData = {} }) {
  const [loading, setLoading] = useState(true);

  const [attributes, setAttributes] = useState({});
  const [bzData, setBzData] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Simulate async preparation if needed
    const attrs = nodeData.attributes || {};
    const derived = nodeData.derived_properties || {};

    let b1 = null,
      b2 = null,
      b3 = null;
    if (attrs.cell) {
      [b1, b2, b3] = reciprocalLattice(attrs.cell);
    }

    const bz = attrs.cell
      ? {
          ...derived,
          b1,
          b2,
          b3,
          kpoints: derived.labelled_kpoints_abs,
          path: derived.labelled_path,
        }
      : null;

    const recipData =
      b1 && b2 && b3
        ? RoundVals(
            [
              { "": "b₁", x: b1[0], y: b1[1], z: b1[2] },
              { "": "b₂", x: b2[0], y: b2[1], z: b2[2] },
              { "": "b₃", x: b3[0], y: b3[1], z: b3[2] },
            ],
            4
          )
        : [];

    const cellData = RoundVals(
      (attrs.cell || []).map((row) => ({
        x: row[0] ?? 0,
        y: row[1] ?? 0,
        z: row[2] ?? 0,
      }))
    );

    const meshOffsetRows = (() => {
      const [m1, m2, m3] = attrs.mesh ?? ["N/A", "N/A", "N/A"];
      const [o1, o2, o3] = Array.isArray(attrs.offset?.[0])
        ? attrs.offset[0]
        : (attrs.offset ?? [0, 0, 0]);
      return [
        { "": "Mesh", "b₁": m1, "b₂": m2, "b₃": m3 },
        { "": "Offset", "b₁": o1 ?? 0, "b₂": o2 ?? 0, "b₃": o3 ?? 0 },
      ];
    })();

    const pbcData = [
      { Axis: "b₁", Value: String(attrs.pbc1) },
      { Axis: "b₂", Value: String(attrs.pbc2) },
      { Axis: "b₃", Value: String(attrs.pbc3) },
    ];

    const kpointData = RoundVals(
      (derived.explicit_kpoints_abs || []).map((row) => ({
        Kx: row[0] ?? 0,
        Ky: row[1] ?? 0,
        Kz: row[2] ?? 0,
      })),
      5
    );

    const kpointDataR = RoundVals(
      (derived.explicit_kpoints_rel || []).map((row) => ({
        Kx: row[0] ?? 0,
        Ky: row[1] ?? 0,
        Kz: row[2] ?? 0,
      })),
      5
    );

    const newTables = [
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
    ];

    if (mounted) {
      setAttributes(attrs);
      setBzData(bz);
      setTables(newTables);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [nodeData]);

  if (loading) {
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <Spinner />
      </div>
    );
  }

  const path =
    attributes?.labels && attributes?.label_numbers
      ? attributes.labels.join(" → ").slice(0, 20)
      : null;

  return (
    <div className="ae:w-full ae:mx-auto ae:p-4 ae:space-y-2">
      {/* Brillouin Zone visualizer card */}
      {attributes?.cell && bzData && (
        <CardContainer
          header={`Brillouin Zone${path ? ` (${path})` : ""}`}
          className="ae:px-1.5! ae:py-2!"
          childrenClassName="ae:!p-0"
        >
          <div className="ae:w-full">
            <BZVisualizer data={bzData} />
          </div>
        </CardContainer>
      )}

      <div className="ae:@container">
        {/* <xl=1col, >xl=2col */}
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
