import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FlowChart from "./FlowChart";
import SidePane from "./SidePane";
import DebugPane from "./DebugPane";
import Breadcrumbs from "./Breadcrumbs";
import { fetchGraphByNodeId, fetchNodeContents } from "./api";

export default function Explorer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const MAX_BREADCRUMBS = 20;

  const [searchParams, setSearchParams] = useSearchParams();
  const rootNodeIdParam =
    searchParams.get("root") || "030bf271-2c94-4d93-8314-7f82f271bd44";
  const [rootNodeId, setRootNodeId] = useState(rootNodeIdParam);

  const [selectedNode, setSelectedNode] = useState(null);
  const [extraNodeData, setExtraNodeData] = useState({});
  const [timeTaken, setTimeTaken] = useState(null);

  // --------------------------
  // Load graph whenever rootNodeId or extraNodeData changes
  // --------------------------
  useEffect(() => {
    let mounted = true;

    async function loadGraph(selectNodeId = null) {
      const start = performance.now();
      const { nodes: fetchedNodes, edges: fetchedEdges } =
        await fetchGraphByNodeId(rootNodeId);

      if (!mounted) return;

      // Merge any extra node data
      const nodesWithExtras = fetchedNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          ...(extraNodeData[n.id] || {}),
        },
      }));

      setNodes(nodesWithExtras);
      setEdges(fetchedEdges);

      if (selectNodeId) {
        const nodeToSelect = nodesWithExtras.find((n) => n.id === selectNodeId);
        setSelectedNode(nodeToSelect || null);
      } else {
        setSelectedNode(null);
      }

      setTimeTaken(performance.now() - start);
    }

    loadGraph(selectedNode?.id);

    return () => {
      mounted = false;
    };
  }, [rootNodeId, extraNodeData]);

  // --------------------------
  // Track visited nodes in breadcrumbs
  // --------------------------
  const handleNodeVisit = (node) => {
    setBreadcrumbs((prev) => {
      // const filtered = prev.filter((n) => n.id !== node.id); // remove duplicates
      const updated = [...prev, node]; // append to end
      return updated.slice(-MAX_BREADCRUMBS);
    });
  };

  // --------------------------
  // Handle double-click (refocus + fetch extra data)
  // --------------------------
  const handleDoubleClick = async (node) => {
    setRootNodeId(node.id);
    setSearchParams({ root: node.id });

    handleNodeVisit(node); // update breadcrumbs

    const extraData = await fetchNodeContents(node.id);
    setExtraNodeData((prev) => ({ ...prev, [node.id]: extraData }));

    setSelectedNode({
      ...node,
      data: { ...node.data, ...extraData },
    });
  };

  // --------------------------
  // Handle single click
  // --------------------------
  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleBreadcrumbClick = async (node) => {
    // 1️⃣ Remove all breadcrumbs after the clicked node
    setBreadcrumbs((prev) => {
      const index = prev.findIndex((n) => n.id === node.id);
      if (index === -1) return prev; // node not found
      return prev.slice(0, index + 1); // keep everything up to clicked node
    });

    // 2️⃣ Update root node and search params
    setRootNodeId(node.id);
    setSearchParams({ root: node.id });

    // 3️⃣ Merge extra data (cached or fetch)
    const extraData =
      extraNodeData[node.id] || (await fetchNodeContents(node.id));
    setExtraNodeData((prev) => ({ ...prev, [node.id]: extraData }));

    // 4️⃣ Update selectedNode
    setSelectedNode({
      ...node,
      data: { ...node.data, ...extraData },
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Flow diagram */}
        <div className="flex-1 border-r border-gray-300 h-full min-w-0">
          <FlowChart
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            onNodeDoubleSelect={handleDoubleClick}
          />
        </div>

        {/* Right-hand panel */}
        <div className="w-[900px] flex flex-col h-full">
          {/* Sidebar */}
          <div className="flex-none h-2/3 border-b border-gray-300 overflow-y-auto">
            <SidePane selectedNode={selectedNode} timeTaken={timeTaken} />
          </div>

          {/* Debug pane */}
          <div className="flex-1 overflow-y-auto">
            <DebugPane nodes={nodes} edges={edges} timeTaken={timeTaken} />
          </div>
        </div>
      </div>

      {/* Breadcrumbs at the bottom */}
      <div className="flex-none h-12 border-t border-gray-300">
        <Breadcrumbs
          trail={breadcrumbs}
          onClick={handleBreadcrumbClick}
          maxItems={MAX_BREADCRUMBS}
        />
      </div>
    </div>
  );
}
