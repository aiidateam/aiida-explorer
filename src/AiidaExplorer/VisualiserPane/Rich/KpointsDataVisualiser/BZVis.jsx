import { createBZVisualizer } from "brillouinzone-visualizer";
import React, { useState, useEffect, useRef } from "react";

import BZControls from "./BZControls";
import useContainerBucket from "../../../hooks/useContainerBucket";

export default function BZVisualizer({ data }) {
  const containerRef = useRef(null);
  const bzRef = useRef(null);
  const cameraStateRef = useRef(null);

  const [showPathpoints, setShowPathpoints] = useState(false);
  const [showBVectors, setShowBVectors] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const widthBucket = useContainerBucket(containerRef, 50);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      if (bzRef.current?.getCameraState) {
        cameraStateRef.current = bzRef.current.getCameraState();
      }

      // clear the container.
      containerRef.current.innerHTML = "";

      bzRef.current = createBZVisualizer(
        containerRef.current,
        data,
        {
          showAxes,
          showBVectors,
          showPathpoints,
          disableInteractOverlay: true,
        },
        (bzInstance) => {
          // use the saved camera state to update the camera.
          if (cameraStateRef.current) {
            bzInstance.camera.position.copy(cameraStateRef.current.position);
            bzInstance.controls.target.copy(cameraStateRef.current.target);
            bzInstance.controls.update();
          }
        }
      );
    }, 100); //100ms debounce stops fastdrags from resetting view.

    return () => clearTimeout(timer);
  }, [data, showAxes, showBVectors, showPathpoints, widthBucket]);

  return (
    <div className="ae:relative ae:w-full" style={{ height: "400px" }}>
      <BZControls
        showPathpoints={showPathpoints}
        setShowPathpoints={setShowPathpoints}
        showBVectors={showBVectors}
        setShowBVectors={setShowBVectors}
        showAxes={showAxes}
        setShowAxes={setShowAxes}
      />
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
