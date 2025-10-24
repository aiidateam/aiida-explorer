import React, { useState, useEffect, useRef } from "react";
import { createBZVisualizer } from "brillouinzone-visualizer";
import useContainerBucket from "../../../hooks/useContainerBucket";

export default function BZVisualizer({ data }) {
  const containerRef = useRef(null);

  // ----- Local state for the checkbox -----
  const [showPathpoints, setShowPathpoints] = useState(false);

  // ----- Options object -----
  const options = {
    showAxes: true,
    showBVectors: true,
    showPathpoints,
    disableInteractOverlay: true,
  };

  // Reset the visualizer whenever the container width changes significantly
  const widthBucket = useContainerBucket(containerRef, 100);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";
    createBZVisualizer(containerRef.current, data, options);
  }, [data, showPathpoints, widthBucket]); // re-run if data, checkbox, or bucket changes

  return (
    <div className="relative w-full" style={{ height: "400px" }}>
      {/* Overlayed checkbox */}
      <label
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          background: "rgba(255,255,255,0.8)",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 12,
        }}
      >
        <input
          type="checkbox"
          checked={showPathpoints}
          onChange={(e) => setShowPathpoints(e.target.checked)}
          style={{ marginRight: 4 }}
        />
        Overlay Kpoints
      </label>

      {/* Visualizer container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
