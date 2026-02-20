// functions for producing plots from upfData.
// TODO - investigate whether these are accurate w.r.t. reality.

export function getRadialFunctionsTraces(upfDataObject) {
  if (
    !upfDataObject ||
    !upfDataObject.atomic_wave_functions ||
    !upfDataObject.radial_grid
  )
    return [];

  const traces = upfDataObject.atomic_wave_functions.map((wf) => {
    const label = wf.label ?? "";
    const ang = wf.angular_momentum != null ? `(ℓ=${wf.angular_momentum}` : "";
    const occ =
      wf.occupation != null
        ? `, occ=${wf.occupation})`
        : wf.angular_momentum != null
          ? ")"
          : "";

    return {
      x: upfDataObject.radial_grid,
      y: wf.radial_function,
      type: "scatter",
      mode: "lines",
      name: `${label} ${ang}${occ}`,
    };
  });

  return traces;
}

export function getBetaProjectorsTraces(upfDataObject) {
  if (
    !upfDataObject ||
    !upfDataObject.beta_projectors ||
    !upfDataObject.radial_grid
  )
    return [];

  const traces = upfDataObject.beta_projectors.map((wf) => {
    const label = wf.label ?? "";
    const ang = wf.angular_momentum != null ? `(ℓ=${wf.angular_momentum}` : "";
    const cutoff =
      wf.ultrasoft_cutoff_radius != null
        ? `, cutoff=${wf.ultrasoft_cutoff_radius})`
        : wf.angular_momentum != null
          ? ")"
          : "";

    return {
      x: upfDataObject.radial_grid,
      y: wf.radial_function,
      type: "scatter",
      mode: "lines",
      name: `${label} ${ang}${cutoff}`,
    };
  });

  return traces;
}

export function getChargeDensitiesTraces(upfDataObject) {
  if (!upfDataObject || !upfDataObject.radial_grid) return [];

  const ValenceChargetrace = {
    x: upfDataObject.radial_grid,
    y: upfDataObject.total_charge_density,
    type: "scatter",
    mode: "lines",
    name: "Valence Pseudocharge density",
  };

  const CoreChargetrace = {
    x: upfDataObject.radial_grid,
    y: upfDataObject.core_charge_density,
    type: "scatter",
    mode: "lines",
    name: "Core Pseudocharge density",
  };

  return [CoreChargetrace, ValenceChargetrace].filter(
    (t) => Array.isArray(t.y) && t.y.length > 0,
  );
}
