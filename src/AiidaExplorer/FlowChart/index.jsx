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
  onToggleExpand,
  expandedKeys = [],
  expandingKeys = [],
  onInit,
}) {
  // TODO - stop spam firing this when held down.
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

  // map nodes and mark the selected one, attaching per-side expand state
  const mappedNodes = nodes.map((n) => {
    const aiidaUUID = n.aiidaUUID ?? n.id;
    const sideState = (keys) =>
      ["in", "out"].filter((s) => keys.includes(`${aiidaUUID}:${s}`));
    return {
      ...n,
      type: "custom",
      selected: selectedNode?.id === n.id,
      data: {
        ...n.data,
        expandedSides: sideState(expandedKeys),
        expandingSides: sideState(expandingKeys),
        onToggleExpand: onToggleExpand
          ? (side) => onToggleExpand(n.id, side)
          : undefined,
      },
    };
  });

  return (
    <div className="ae:w-full ae:h-full">
      <ReactFlow
        className="ae:bg-slate-50"
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
        minZoom={0.2}
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
