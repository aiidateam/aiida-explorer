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

    // Initial plot
    Plotly.newPlot(container, memoData, memoLayout, {
      responsive: true,
      ...memoConfig,
    });

    // Resize observer to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (container) {
        Plotly.Plots.resize(container);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (container) {
        Plotly.purge(container);
      }
    };
  }, [memoData, memoLayout, memoConfig]);

  return <div ref={containerRef} style={style} />;
}
