import React, { useCallback } from "react";

import { HorizontalNode } from "../HorizontalNode";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

const nodeTypes = {
  custom: HorizontalNode,
};

export default function FlowChart({ nodes, edges, setNodes, setEdges }) {
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, type: "custom" }))}
        edges={edges}
        nodeTypes={nodeTypes} // <-- use the outside-defined object
        onNodesChange={(changes) =>
          setNodes((nds) => applyNodeChanges(changes, nds))
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds))
        }
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
