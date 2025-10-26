// js for calculating very basic lattice information.
export function getVol(nodeData, round = 4) {
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

export function formatLattice(nodeData) {
  const cell = nodeData.attributes.cell;
  const a = Math.hypot(...cell[0]);
  const b = Math.hypot(...cell[1]);
  const c = Math.hypot(...cell[2]);
  return { a, b, c };
}

export function formatChemicalFormula(formula) {
  // split formula into array of elements and numbers
  let f_split = formula.split(/(\d+)/);
  return f_split.map((v, index) => {
    if (v.match(/\d+/)) {
      return <sub key={index}>{v}</sub>;
    }
    return v;
  });
}
const overlineStyle = {
  display: "inline-block",
  position: "relative",
};

const overlineAdjustmentStyle = {
  position: "absolute",
  top: "0.15em",
  left: 0,
  right: 0,
  borderTop: "0.1em solid black",
  height: 0,
  zIndex: 1,
};

export function countNumberOfAtoms(hillFormula) {
  // split on capital letters to get element+number strings
  // May break if non-hillFormula is used
  var elnum = hillFormula.split(/(?=[A-Z])/);
  var num = 0;
  elnum.forEach((v) => {
    let match = v.match(/\d+/);
    let n = match == null ? 1 : parseInt(match[0]);
    num += n;
  });
  return num;
}

export function calculateDensity(sites, volume, kinds) {
  // Map kind name to its mass
  const kindMassMap = {};
  kinds.forEach((k) => {
    kindMassMap[k.name] = k.mass;
  });

  // Sum total mass of all atoms in the unit cell
  let totalMassU = 0;
  sites.forEach((site) => {
    const kindName = site.kind_name;
    const mass = kindMassMap[kindName];
    if (mass === undefined) {
      throw new Error(`Unknown kind: ${kindName}`);
    }
    totalMassU += mass;
  });

  // Density in g/cm3
  return Math.round((totalMassU * 10000) / (volume * 6.0223));
}
