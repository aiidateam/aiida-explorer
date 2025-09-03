import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FlowChart from "./FlowChart";
import SidePane from "./SidePane";
import DebugPane from "./DebugPane";
import VisualiserPane from "./VisualiserPane";
import Breadcrumbs from "./Breadcrumbs";
import {
  fetchGraphByNodeId,
  fetchNodeContents,
  fetchCif,
  fetchJson,
} from "./api";

// full component handler for the aiidaexplorer.
//  this manages states passes data to the subcomponents...
// in principle as this grows we should really think about
// seperation of concerns for ease of development but meh.
export default function Explorer({ baseUrl = "", startingNode = "" }) {
  console.log(baseUrl);
  console.log(startingNode);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const MAX_BREADCRUMBS = 20;

  const [searchParams, setSearchParams] = useSearchParams();
  const rootNodeIdParam = searchParams.get("rootNode") || startingNode;
  const [rootNodeId, setRootNodeId] = useState(rootNodeIdParam);

  const [selectedNode, setSelectedNode] = useState(null);
  const [extraNodeData, setExtraNodeData] = useState({});
  const [timeTaken, setTimeTaken] = useState(null);

  // --------------------------
  // Load graph whenever rootNodeId changes
  // --------------------------
  useEffect(() => {
    let mounted = true;

    async function loadGraph() {
      const start = performance.now();
      const { nodes: fetchedNodes, edges: fetchedEdges } =
        await fetchGraphByNodeId(baseUrl, rootNodeId);

      if (!mounted) return;

      // Merge in cached extra data
      const nodesWithExtras = fetchedNodes.map((n) => ({
        ...n,
        data: { ...n.data, ...(extraNodeData[n.id] || {}) },
      }));

      setNodes(nodesWithExtras);
      setEdges(fetchedEdges);

      // Keep selection if still present
      if (selectedNode) {
        const stillExists = nodesWithExtras.find(
          (n) => n.id === selectedNode.id
        );
        setSelectedNode(stillExists || null);
      }

      setTimeTaken(performance.now() - start);
    }

    loadGraph();

    return () => {
      mounted = false;
    };
  }, [rootNodeId]); // no extraNodeData here → avoids refires

  // --------------------------
  // Cache + merge helper
  // --------------------------
  const ensureNodeData = async (node) => {
    let updatedData = { ...node.data };

    // Fetch extras if missing
    if (!extraNodeData[node.id]) {
      const extraData = await fetchNodeContents(baseUrl, node.id);
      setExtraNodeData((prev) => ({ ...prev, [node.id]: extraData }));
      updatedData = { ...updatedData, ...extraData };
    } else {
      updatedData = { ...updatedData, ...extraNodeData[node.id] };
    }

    // Fetch download if missing
    if (!updatedData.download) {
      let download;
      if (node.data.label === "StructureData") {
        download = await fetchCif(baseUrl, node.id);
      } else if (node.data.label === "CifData") {
        download = await fetchCif(baseUrl, node.id);
      } else {
        download = await fetchJson(baseUrl, node.id);
      }
      updatedData = { ...updatedData, download };

      // also cache download in extraNodeData
      setExtraNodeData((prev) => ({
        ...prev,
        [node.id]: { ...(prev[node.id] || {}), download },
      }));
    }

    return { ...node, data: updatedData };
  };

  // --------------------------
  // Single click
  // --------------------------
  const handleNodeSelect = async (node) => {
    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);

    // Update the graph nodes so HorizontalNode re-renders
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, ...enrichedNode.data } }
          : n
      )
    );
  };

  // --------------------------
  // Double click (refocus)
  // --------------------------
  const handleDoubleClick = async (node) => {
    if (breadcrumbs[breadcrumbs.length - 1]?.id !== node.id) {
      setBreadcrumbs((prev) => [...prev, node].slice(-MAX_BREADCRUMBS));
    }

    setRootNodeId(node.id);
    setSearchParams({ rootNode: node.id });

    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);
  };

  // --------------------------
  // Breadcrumb click
  // --------------------------
  const handleBreadcrumbClick = async (node, idx) => {
    setBreadcrumbs((prev) => prev.slice(0, idx + 1));
    setRootNodeId(node.id);
    setSearchParams({ rootNode: node.id });

    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);
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
          <div className="flex-none h-1/4 border-b border-gray-300 overflow-y-auto">
            <SidePane selectedNode={selectedNode} timeTaken={timeTaken} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <VisualiserPane selectedNode={selectedNode} />
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
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
