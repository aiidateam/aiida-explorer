// functions for producing plots from upfData.
// TODO - investigate whether these are accurate w.r.t. reality.

// NOTE: candidate to upstream to matsci-parse — it owns the UPF data model
// but has no plot-trace helpers yet. This maps AiiDA's server-parsed
// pseudo_potential JSON straight to Plotly traces.
export function getWavefunctionTraces(
  upfDataObject,
  { key, detailKey, detailLabel },
) {
  const functions = upfDataObject?.[key];
  if (!upfDataObject || !functions || !upfDataObject.radial_grid) return [];

  return functions.map((wf) => {
    const label = wf.label ?? "";
    const ang = wf.angular_momentum != null ? `(ℓ=${wf.angular_momentum}` : "";
    const detail =
      wf[detailKey] != null
        ? `, ${detailLabel}=${wf[detailKey]})`
        : wf.angular_momentum != null
          ? ")"
          : "";

    return {
      x: upfDataObject.radial_grid,
      y: wf.radial_function,
      type: "scatter",
      mode: "lines",
      name: `${label} ${ang}${detail}`,
    };
  });
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
