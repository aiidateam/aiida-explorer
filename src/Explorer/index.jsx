import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FlowChart from "./FlowChart";
import DebugPane from "./DebugPane";
import GridViewer from "./GridViewer";
import GroupsViewer from "./GroupsViewer";

import VisualiserPane from "./VisualiserPane";
import Breadcrumbs from "./Breadcrumbs";

import { fetchGraphByNodeId, smartFetchData, fetchLinkCounts } from "./api";

import { GroupIcon, GroupIcon2, XIcon } from "../components/Icons";

// full component handler for  aiidaexplorer.
//  this manages all states and data to the subcomponents.

// TODO cleanuplogic and compartmentalise the overlay buttons (if we are happy them being there...)
export default function Explorer({
  baseUrl = "",
  startingNode = "",
  debugMode = true,
}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const MAX_BREADCRUMBS = 10;

  const [searchParams, setSearchParams] = useSearchParams();
  const rootNodeIdParam = searchParams.get("rootNode") || startingNode;
  const [rootNodeId, setRootNodeId] = useState(rootNodeIdParam);

  const [selectedNode, setSelectedNode] = useState(null);
  const [extraNodeData, setExtraNodeData] = useState({});

  const [activeOverlay, setActiveOverlay] = useState(() => {
    return rootNodeIdParam === "" ? "groupsview" : null;
  });

  // --------------------------
  // Load graph whenever rootNodeId changes
  // --------------------------
  useEffect(() => {
    let mounted = true;

    async function loadGraph() {
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

      // To update the central node with a highlight.
      if (selectedNode) {
        const stillExists = nodesWithExtras.find(
          (n) => n.id === selectedNode.id,
        );
        setSelectedNode(stillExists || null);
      }
    }

    loadGraph();

    return () => {
      mounted = false;
    };
  }, [rootNodeId]);

  // --------------------------
  // Cache + merge helper
  // --------------------------
  const ensureNodeData = async (node) => {
    const enrichedNode = await smartFetchData(baseUrl, node, extraNodeData);

    // Update state cache if new info was added
    setExtraNodeData((prev) => ({
      ...prev,
      [node.id]: { ...(prev[node.id] || {}), ...enrichedNode.data },
    }));

    return enrichedNode;
  };

  // --------------------------
  // Single click
  // --------------------------
  const handleNodeSelect = async (node) => {
    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);

    // Update the graph nodes so HorizontalNode re-renders
    // unclear this is needed either.
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, ...enrichedNode.data } }
          : n,
      ),
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

  // TODO switch the overlay to use ReactDOM portals...
  return (
    <div className="flex flex-col h-screen relative">
      {/* Overlay toggle buttons */}
      {!activeOverlay && (
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <button
            className="group px-3 py-2 rounded-md bg-white shadow-md text-blue-600 text-lg flex items-center gap-1 hover:text-blue-800"
            onClick={() => setActiveOverlay("groupsview")}
          >
            <GroupIcon
              size={24}
              className="text-blue-600 group-hover:text-blue-800 transition-colors"
            />
            <span className="transition-colors">Query database</span>
          </button>
          <button
            className="group px-3 py-2 rounded-md bg-white shadow-md text-blue-600 text-lg flex items-center gap-1 hover:text-blue-800"
            onClick={() => setActiveOverlay("typesview")}
          >
            <GroupIcon
              size={24}
              className="text-blue-600 group-hover:text-blue-800 transition-colors"
            />
            <span className="transition-colors">FullTypes View</span>
          </button>
        </div>
      )}

      {/* Temp Children count button - need to test perforamcne of this... */}
      <button
        className="absolute top-4 right-2/3 z-50 px-3 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
        onClick={async () => {
          if (!nodes || nodes.length === 0) return;

          // Use fetchNextLevel to get counts for all nodes
          const updatedNodes = await fetchLinkCounts(baseUrl, nodes);
          setNodes(updatedNodes); // trigger re-render

          // Log counts for all nodes
          updatedNodes.forEach((n) => {
            console.log(
              `${n.data.label} - Parent count: ${
                n.parentCount || 0
              }, Child count: ${n.childCount || 0}`,
            );
          });
        }}
      >
        Get Counts
      </button>

      {/* Overlay */}

      <div
        className={`fixed inset-0 z-40 flex items-center justify-center bg-black/30
      transition-all duration-500 ease-in-out
      ${
        activeOverlay
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
        onClick={() => setActiveOverlay(null)}
      >
        <div
          className={`bg-white w-full mx-4 h-5/6 rounded-xl shadow-xl overflow-auto relative
        transform transition-all duration-500 ease-in-out
        ${activeOverlay ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-3 p-2"
            onClick={() => setActiveOverlay(null)}
          >
            <XIcon
              size={24}
              className="text-slate-800 hover:text-red-800 transition-colors duration-400"
            />
          </button>

          {activeOverlay === "groupsview" && <GroupsViewer baseUrl={baseUrl} />}
          {activeOverlay === "typesview" && <GridViewer baseUrl={baseUrl} />}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* left hand panel */}
        <div className="flex-1 w-1/2 border-r border-gray-300 h-full">
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
        <div className="w-1/2 flex flex-col h-full">
          {debugMode && (
            <div className="flex h-1/4 border-b border-gray-300 overflow-y-auto">
              <DebugPane selectedNode={selectedNode} />
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            <VisualiserPane baseUrl={baseUrl} selectedNode={selectedNode} />
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
