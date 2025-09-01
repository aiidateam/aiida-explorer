import { Handle, Position } from "reactflow";

export function HorizontalNode({ data }) {
  return (
    <div
      style={{
        padding: 10,
        background: data.background || "#eee",
        color: data.color || "#000",
        borderRadius: 5,
        width: 120,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Left} />
      {data.label}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
