import React, { useState, useEffect } from "react";

import { useSearchParams } from "react-router-dom";

import { fetchGraphByNodeId } from "./api";
import FlowChart from "./FlowChart";
import SidePane from "./SidePane";

import DebugPane from "./DebugPane";

export default function Explorer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const rootNodeIdParam =
    searchParams.get("root") || "030bf271-2c94-4d93-8314-7f82f271bd44";
  const [rootNodeId, setRootNodeId] = useState(rootNodeIdParam);

  const [selectedNode, setSelectedNode] = useState(null);
  const [doubleClickedNode, setDoubleClickedNode] = useState(null);

  const [timeTaken, setTimeTaken] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadGraph(selectNodeId = null) {
      const startTime = performance.now();

      const { nodes: fetchedNodes, edges: fetchedEdges } =
        await fetchGraphByNodeId(rootNodeId);

      if (mounted) {
        setNodes(fetchedNodes);
        setEdges(fetchedEdges);

        if (selectNodeId) {
          const nodeToSelect = fetchedNodes.find((n) => n.id === selectNodeId);
          setSelectedNode(nodeToSelect || null);
        } else {
          setSelectedNode(null);
        }

        const endTime = performance.now();
        setTimeTaken((endTime - startTime).toFixed(1)); // in ms
      }
    }

    loadGraph(doubleClickedNode?.id);

    return () => {
      mounted = false;
    };
  }, [rootNodeId]);

  return (
    <div className="flex h-screen">
      {/* Flow diagram fills remaining space */}
      <div className="flex-1 border-r border-gray-300 h-full min-w-0">
        <FlowChart
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          onNodeDoubleSelect={(node) => {
            setDoubleClickedNode(node);
            setRootNodeId(node.id);
            setSearchParams({ root: node.id });
          }}
        />
      </div>

      {/* Right-hand panel: fixed width */}
      <div className="w-[900px] flex flex-col h-full">
        {/* Sidebar: fixed height, scrollable if content overflows */}
        <div className="flex-none h-2/3 border-b border-gray-300 overflow-y-auto">
          <SidePane selectedNode={selectedNode} />
        </div>

        {/* Debug pane: fills remaining space, scrollable */}
        <div className="flex-1 overflow-y-auto">
          <DebugPane nodes={nodes} edges={edges} timeTaken={timeTaken} />
        </div>
      </div>
    </div>
  );
}
