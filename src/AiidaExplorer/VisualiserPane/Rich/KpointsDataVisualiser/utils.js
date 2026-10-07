import {
  createLattice,
  reciprocalLattice as reciprocalLatticeVectors,
  lengths,
} from "matsci-parse";

// Helper to round array of objects.
export const RoundVals = (arr, decimals = 4, skipKeys = []) =>
  arr.map((obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        skipKeys.includes(k)
          ? v
          : typeof v === "number"
            ? v.toFixed(decimals)
            : v,
      ])
    )
  );

export function reciprocalLattice(cell) {
  if (!cell || cell.length < 3)
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];

  // matsci-parse stores basis row-major (rows = lattice vectors, same as
  // AiiDA cell) and its physics reciprocal includes 2π — same as below.
  const d = reciprocalLatticeVectors(createLattice(cell.flat())).basis.data;
  return [
    [d[0], d[1], d[2]],
    [d[3], d[4], d[5]],
    [d[6], d[7], d[8]],
  ];
}

export function latticeLengths(cell) {
  const [a, b, c] = lengths(createLattice(cell.flat()));
  return { a, b, c };
}

// Static columns for tables.
export const Columns = {
  recipColumns: ["", "x", "y", "z"],
  cellColumns: ["x", "y", "z"],
  meshOffsetCols: ["", "b₁", "b₂", "b₃"],
  pbcCols: ["Axis", "Value"],
  kpointColumns: ["Kx", "Ky", "Kz"],
  kpointColumnsR: ["Kx", "Ky", "Kz"],
};
