import React, { useCallback } from "react";

import HorizontalNode from "./HorizontalNode";

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

export default function FlowChart({
  nodes,
  edges,
  setNodes,
  setEdges,
  selectedNode,
  onNodeSelect,
  onNodeDoubleSelect,
}) {
  const handleNodeClick = useCallback(
    (event, node) => {
      if (onNodeSelect) onNodeSelect(node);
    },
    [onNodeSelect],
  );

  const handleNodeDoubleClick = useCallback(
    (event, node) => {
      if (onNodeDoubleSelect) onNodeDoubleSelect(node);
    },
    [onNodeDoubleSelect],
  );

  // map nodes and mark the selected one
  const mappedNodes = nodes.map((n) => ({
    ...n,
    type: "custom",
    selected: selectedNode?.id === n.id,
  }));

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={mappedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) =>
          setNodes((nds) => applyNodeChanges(changes, nds))
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds))
        }
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
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
