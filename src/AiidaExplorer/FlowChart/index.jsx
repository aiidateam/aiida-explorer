import React, { useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomEdge from "./CustomEdge";
import HorizontalNode from "./HorizontalNode";

const nodeTypes = {
  custom: HorizontalNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function FlowChart({
  nodes,
  edges,
  setNodes,
  setEdges,
  selectedNode,
  onNodeSelect,
  onNodeDoubleSelect,
  onInit,
}) {
  // TODO - stop spam firing this when held down.
  const handleNodeClick = useCallback(
    (event, node) => {
      if (onNodeSelect) onNodeSelect(node);
    },
    [onNodeSelect]
  );

  const handleNodeDoubleClick = useCallback(
    (event, node) => {
      if (onNodeDoubleSelect) onNodeDoubleSelect(node);
    },
    [onNodeDoubleSelect]
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
        className="bg-theme-50"
        nodes={mappedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) =>
          setNodes((nds) => applyNodeChanges(changes, nds))
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds))
        }
        edgeTypes={edgeTypes}
        edgesFocusable={false}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        onInit={onInit}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
