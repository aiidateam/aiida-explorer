import { useEffect, useRef } from "react";
import Plotly from "plotly.js-basic-dist";

export default function SimplePlot({
  data,
  layout,
  config = {},
  style = { width: "100%", height: 400 },
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Render plot
    Plotly.newPlot(containerRef.current, data, layout, {
      responsive: true,
      ...config,
    });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [data, layout, config]);

  return <div ref={containerRef} style={style} />;
}
