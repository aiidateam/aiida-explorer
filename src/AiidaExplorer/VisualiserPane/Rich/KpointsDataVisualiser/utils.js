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

// Static columns for tables.
export const Columns = {
  recipColumns: ["", "x", "y", "z"],
  cellColumns: ["x", "y", "z"],
  meshOffsetCols: ["", "b₁", "b₂", "b₃"],
  pbcCols: ["Axis", "Value"],
  kpointColumns: ["Kx", "Ky", "Kz"],
  kpointColumnsR: ["Kx", "Ky", "Kz"],
};
