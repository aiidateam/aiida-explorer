import React from "react";
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useViewport,
} from "reactflow";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  style = {},
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { zoom } = useViewport(); // get current zoom

  // Default style
  const defaultStyle = { stroke: "grey", strokeWidth: 1 };

  // Merge any style passed via data
  const edgeStyle = { ...defaultStyle, ...(style || {}) };

  if (!data.label) return <BaseEdge id={id} path={edgePath} />;

  let t = 0.5;
  let transformStyle = "translate(-50%, -50%)";

  if (data.labelPosition === "start") {
    t = 0.02;
    transformStyle = "translate(0%, -50%)";
  } else if (data.labelPosition === "end") {
    t = 0.98;
    transformStyle = "translate(-100%, -50%)";
  }

  const labelX = sourceX + (targetX - sourceX) * t;
  const labelY = sourceY + (targetY - sourceY) * t;

  // Adjust font size based on zoom
  const fontSize = zoom > 1.1 ? "text-xs" : "text-sm";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        interactionWidth={0} // disables selection
        style={edgeStyle}
      />
      <EdgeLabelRenderer>
        <div
          className={`absolute bg-theme-200 border border-theme-300 rounded-sm px-1 py-0.5 text-theme-700 font-light ${fontSize} pointer-events-drag z-50`}
          style={{
            left: `${labelX}px`,
            top: `${labelY}px`,
            transform: transformStyle,
          }}
        >
          {data.label.length > 21
            ? `${data.label.slice(0, 18)}...`
            : data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;
