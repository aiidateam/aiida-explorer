import { useEffect, useRef, useMemo } from "react";
import Plotly from "plotly.js-basic-dist";

export default function SimplePlot({
  data,
  layout,
  config = {},
  style = { width: "100%", height: 400 },
}) {
  const containerRef = useRef(null);

  // Memoize props to avoid unnecessary rerenders
  const memoData = useMemo(() => data, [JSON.stringify(data)]);
  const memoLayout = useMemo(() => layout, [JSON.stringify(layout)]);
  const memoConfig = useMemo(() => config, [JSON.stringify(config)]);

  useEffect(() => {
    if (!containerRef.current) return;

    Plotly.newPlot(containerRef.current, memoData, memoLayout, {
      responsive: true,
      ...memoConfig,
    });

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [memoData, memoLayout, memoConfig]);

  return <div ref={containerRef} style={style} />;
}
