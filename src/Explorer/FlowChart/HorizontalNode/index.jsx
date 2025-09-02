import React from "react";
import { Handle, Position } from "reactflow";

function getColors(type) {
  if (type?.startsWith("process"))
    return { background: "#fc5e5eff", color: "#000" };
  if (type?.startsWith("data"))
    return { background: "#9aff86ff", color: "#000" };
  return { background: "#ccc", color: "#000" };
}

export default function HorizontalNode({ data, selected }) {
  const colors = getColors(data.node_type);

  return (
    <div
      style={{
        ...colors,
        border: selected ? "3px solid #000" : "2px solid transparent",
        minWidth: 100,
        textAlign: "center",
        padding: 10,
        borderRadius: 5,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
