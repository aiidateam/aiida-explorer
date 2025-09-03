import React from "react";
import { Handle, Position, useViewport } from "reactflow";

import { getNodeDisplay } from "./nodeUtils";

// Utility to darken a hex color by a percentage
function darkenColorWithAlpha(hex, percent) {
  // Extract RGB and alpha
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  let a = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;

  r = Math.max(0, r - r * percent);
  g = Math.max(0, g - g * percent);
  b = Math.max(0, b - b * percent);

  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
}

function getColors(type) {
  if (type?.startsWith("process"))
    return { background: "#fc5e5eff", color: "#000" };
  if (type?.startsWith("data"))
    return { background: "#9aff86ff", color: "#000" };
  return { background: "#ccc", color: "#000" };
}

export default function HorizontalNode({ data, selected }) {
  const { zoom } = useViewport(); // hook present for future use

  const colors = getColors(data.node_type);

  const borderColor = selected
    ? "#000"
    : data.pos === "center"
    ? darkenColorWithAlpha(colors.background, 0.4)
    : "transparent";

  // ----------
  // Dynamic text based on zoom percent
  // ----------
  let textHtml;
  let fontSize;

  if (zoom > 1.2) {
    // Zoomed IN -> show more details, smaller font
    fontSize = 12;
    textHtml = (
      <div style={{ fontSize, color: colors.color }}>
        {data.label}
        <br />
        <span style={{ fontSize: fontSize * 0.75, opacity: 0.8 }}>
          {getNodeDisplay(data)}
        </span>
      </div>
    );
  } else {
    // Zoomed OUT -> show only main label, bigger font
    fontSize = 16;
    textHtml = (
      <div style={{ fontSize, color: colors.color }}>{data.label}</div>
    );
  }

  return (
    <div
      style={{
        ...colors,
        border: `3px solid ${borderColor}`,
        minWidth: 120,
        textAlign: "center",
        padding: 5,
        borderRadius: 5,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ pointerEvents: "none" }}
      />
      {textHtml}
      <Handle
        type="source"
        position={Position.Right}
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}
