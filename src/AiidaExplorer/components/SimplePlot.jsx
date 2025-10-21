import Plotly from "plotly.js-basic-dist";
import { useEffect, useRef, useMemo } from "react";

export default function SimplePlot({
  data,
  layout,
  config = {},
  style = { width: "100%", height: "400" },
}) {
  const containerRef = useRef(null);

  // Memoize props to avoid unnecessary rerenders
  const memoData = useMemo(() => data, [JSON.stringify(data)]);
  const memoLayout = useMemo(() => layout, [JSON.stringify(layout)]);
  const memoConfig = useMemo(() => config, [JSON.stringify(config)]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Measure data size ---
    const numTraces = memoData.length;
    let numPoints = 0;
    memoData.forEach((trace) => {
      // sum lengths of x, y, z arrays if they exist
      numPoints +=
        (trace.x?.length || 0) +
        (trace.y?.length || 0) +
        (trace.z?.length || 0);
    });

    console.debug(
      `Rendering ${numTraces} traces with ~${numPoints} data points`
    );

    // --- Measure render time ---
    const t0 = performance.now();

    Plotly.newPlot(container, memoData, memoLayout, {
      responsive: true,
      ...memoConfig,
    }).then(() => {
      const t1 = performance.now();
      console.log(
        `Plotly rendering took ${(t1 - t0).toFixed(2)} ms for ${numTraces} traces (~${numPoints} points)`
      );
    });
  }, [memoData, memoLayout, memoConfig]);

  return <div ref={containerRef} style={style} />;
}
