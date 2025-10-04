import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Spinner from "../../../components/Spinner";
import { ErrorDisplay } from "../../../components/Error";

// Temporaray Beta UpfDataVisualiser.
export default function UpfDataVisualiser({ nodeData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upfData, setUpfData] = useState(null);

  const aiidaJsonPath = nodeData.downloadByFormat?.json;

  // Fetch UPF JSON
  const fetchData = async () => {
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
      setUpfData(json.pseudo_potential); // only pseudo_potential
    } catch (err) {
      console.error("Failed to fetch UPF JSON:", err);
      setError(err.message || "Failed to load UPF data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [aiidaJsonPath]);

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

  const { header, radial_grid, local_potential, core_charge_density } = upfData;

  // Determine a reasonable x-axis truncation if most values cluster near 0
  const maxRadius = Math.min(Math.max(...radial_grid), 5);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      {/* Metadata */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-1">
        <p>
          <strong>Element:</strong> {header?.element || "N/A"}
        </p>
        <p>
          <strong>Valence Electrons:</strong> {header?.z_valence ?? "N/A"}
        </p>
        <p>
          <strong>Pseudopotential Type:</strong> {header?.pseudo_type || "N/A"}
        </p>
        <p>
          <strong>Functional:</strong> {header?.functional || "N/A"}
        </p>
      </div>

      <div className="space-y-6">
        {/* Local Potential Plot */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-2">Local Potential</h3>
          <Plot
            data={[
              {
                x: radial_grid,
                y: local_potential,
                type: "scatter",
                mode: "lines",
                name: "Local Potential",
                line: { color: "#0096DE" },
              },
            ]}
            layout={{
              width: "100%",
              height: 300,
              margin: { t: 20, b: 40, l: 50, r: 20 },
              xaxis: {
                title: { text: "Radius (Bohr)" },
                range: [0, maxRadius],
              },
              yaxis: { title: { text: "Local Potential (Ry)" } },
            }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Core Charge Density Plot */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold mb-2">Core Charge Density</h3>
          <Plot
            data={[
              {
                x: radial_grid,
                y: core_charge_density,
                type: "scatter",
                mode: "lines",
                name: "Core Charge Density",
                line: { color: "#30B808" },
              },
            ]}
            layout={{
              width: "100%",
              height: 300,
              margin: { t: 20, b: 40, l: 50, r: 20 },
              xaxis: {
                title: { text: "Radius (Bohr)" },
                range: [0, maxRadius],
              },
              yaxis: { title: { text: "Core Charge Density" } },
            }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
