import Plotly from "plotly.js-basic-dist";
import { useEffect, useState, useCallback, useMemo } from "react";

import CardContainer from "../../components/CardContainer";
import ErrorDisplay from "../../components/Error";
import SimplePlot from "../../components/SimplePlot";
import Spinner from "../../components/Spinner";


// TODO extract a common config for all plots.
// Probably a good enough reason to switch to react plotly for the bandstructure visualiser

function getRadialFunctionsTraces(upfDataObject) {
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

function getBetaProjectorsTraces(upfDataObject) {
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

function getChargeDensitiesTraces(upfDataObject) {
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
    (t) => Array.isArray(t.y) && t.y.length > 0
  );
}

// Temp Beta UpfDataVisualiser.
export default function UpfDataVisualiser({ nodeData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upfData, setUpfData] = useState(null);

  const aiidaJsonPath = nodeData.downloadByFormat?.json;

  const orbitalTraces = useMemo(
    () => getRadialFunctionsTraces(upfData),
    [upfData]
  );
  const betaprojTraces = useMemo(
    () => getBetaProjectorsTraces(upfData),
    [upfData]
  );
  const chargeDensitiesTraces = useMemo(
    () => getChargeDensitiesTraces(upfData),
    [upfData]
  );

  // Fetch UPF JSON
  const fetchData = useCallback(async () => {
    if (!aiidaJsonPath) {
      setError("No JSON path available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(aiidaJsonPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUpfData(json.pseudo_potential);
    } catch (err) {
      console.error("Failed to fetch UPF JSON:", err);
      setError(err.message || "Failed to load UPF data");
    } finally {
      setLoading(false);
    }
  }, [aiidaJsonPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Display loading or error placeholders
  if (loading)
    return (
      <div className="w-full min-h-[450px] flex items-center justify-center">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="w-full min-h-[450px] flex items-center justify-center">
        <ErrorDisplay message={error} onRetry={fetchData} />
      </div>
    );

  if (!upfData) return null;

  const { header, radial_grid } = upfData;

  const commonLegend = {
    x: 0.97,
    y: 0.95,
    xanchor: "right",
    yanchor: "top",
    bordercolor: "#ccc",
    borderwidth: 1,
  };
  const commonMargin = { t: 20, b: 40, l: 50, r: 20 };

  return (
    <div className="w-full mx-auto p-4 space-y-6">
      <CardContainer header="Metadata">
        <p>
          <span className="font-medium">Element:</span>{" "}
          {header?.element || "N/A"}
        </p>
        <p>
          <span className="font-medium">Valence Electrons:</span>{" "}
          {header?.z_valence ?? "N/A"}
        </p>
        <p>
          <span className="font-medium">Pseudopotential Type:</span>{" "}
          {header?.pseudo_type || "N/A"}
        </p>
        <p>
          <span className="font-medium">Functional:</span>{" "}
          {header?.functional || "N/A"}
        </p>
      </CardContainer>

      {/* container that constrains width and uses box-sizing */}
      <CardContainer
        header="Orbital radial functions"
        className="!px-1.5 !py-2"
        childrenClassName="!p-0"
      >
        <SimplePlot
          data={orbitalTraces}
          layout={{
            autosize: true,
            height: 400,
            margin: commonMargin,
            xaxis: { title: { text: "Radius (Bohr)" }, range: [0, 20] },
            yaxis: { title: { text: "φ(r)" } },
            legend: commonLegend,
          }}
          config={{ responsive: true }}
          useResizeHandler={true}
          style={{ width: "100%", height: 400 }}
        />
      </CardContainer>

      <CardContainer
        header="Beta projectors"
        className="!px-1.5 !py-2"
        childrenClassName="!p-0"
      >
        <SimplePlot
          data={betaprojTraces}
          layout={{
            autosize: true,
            height: 400,
            margin: commonMargin,
            xaxis: { title: { text: "Radius (Bohr)" } },
            yaxis: { title: { text: "φ(r)" } },
            legend: commonLegend,
          }}
          config={{ responsive: true }}
        />
      </CardContainer>

      <CardContainer
        header="Charge densities"
        className="!px-1.5 !py-2"
        childrenClassName="!p-0"
      >
        <SimplePlot
          data={chargeDensitiesTraces}
          layout={{
            autosize: true,
            height: 400,
            margin: commonMargin,
            xaxis: { title: { text: "Radius (Bohr)" }, range: [0, 5] },
            yaxis: { title: { text: "φ(r)" } },
            legend: commonLegend,
          }}
          config={{ responsive: true }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      </CardContainer>
    </div>
  );
}
