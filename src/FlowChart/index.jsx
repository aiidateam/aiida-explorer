import React, { useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background, addEdge } from "reactflow";
import { applyNodeChanges, applyEdgeChanges } from "reactflow";

import "reactflow/dist/style.css";

export default function FlowChart({ nodes, edges, setNodes, setEdges }) {
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) =>
          setNodes((nds) => applyNodeChanges(changes, nds))
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds))
        }
        fitView
        nodesDraggable={true}
        nodesConnectable={false} // disables connector
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
