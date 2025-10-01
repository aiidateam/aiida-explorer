import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FlowChart from "./FlowChart";
import DebugPane from "./DebugPane";
import GridViewer from "./GridViewer";
import GroupsViewer from "./GroupsViewer";

import HelpViewer from "./HelpViewer";

import VisualiserPane from "./VisualiserPane";
import Breadcrumbs from "./Breadcrumbs";

import {
  fetchGraphByNodeId,
  smartFetchData,
  fetchLinkCounts,
  fetchUsers,
  fetchDownloadFormats,
  fetchLinkCountsFirstPage,
} from "./api";

import {
  GroupIcon,
  XIcon,
  LinksIcon,
  QuestionIcon,
  FastIcon,
  SlowIcon,
} from "../components/Icons";

// full component handler for  aiidaexplorer.
//  this manages all states and data to the subcomponents.

// TODO cleanuplogic and compartmentalise the overlay buttons (if we are happy them being there...)
// TODO add loading and timings of steps...
export default function Explorer({
  baseUrl = "",
  startingNode = "",
  debugMode = true,
}) {
  const reactFlowInstanceRef = useRef(null);
  const [singlePageMode, setSinglePageMode] = useState(false);
  const [users, setUsers] = useState(null);
  const [downloadFormats, setDownloadFormats] = useState(null);

  // Fetch users once at mount
  useEffect(() => {
    let mounted = true;
    fetchUsers(baseUrl).then((fetchedUsers) => {
      if (mounted) {
        setUsers(fetchedUsers);
        if (debugMode) console.log("users", fetchedUsers);
      }
    });
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  // Fetch download formats once at mount
  useEffect(() => {
    let mounted = true;
    fetchDownloadFormats(baseUrl).then((fetchedFormats) => {
      if (mounted) {
        setDownloadFormats(fetchedFormats);
        if (debugMode) console.log("downloadFormats", fetchedFormats);
      }
    });
    return () => {
      mounted = false;
    };
  }, [baseUrl]);

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
        await fetchGraphByNodeId(baseUrl, rootNodeId, singlePageMode);

      if (!mounted) return;

      const nodesWithExtras = fetchedNodes.map((n) => {
        const { pos, ...cachedData } = extraNodeData[n.id] || {};
        return {
          ...n,
          data: { ...n.data, ...cachedData },
        };
      });

      setNodes(nodesWithExtras);
      setEdges(fetchedEdges);
      // After setting nodes
      setNodes(nodesWithExtras);

      // Animate next hop - this currently lags on large nodes. :(
      // TODO fix this either through pagination or something else.
      // I have a feeling the frontend sort is the culprit.
      requestAnimationFrame(() => {
        const instance = reactFlowInstanceRef.current;
        if (!instance) return;

        instance.fitView({ padding: 1.5 });

        const centralNode = nodesWithExtras.find((n) => n.id === rootNodeId);
        if (centralNode?.position) {
          setTimeout(() => {
            instance.setCenter(
              centralNode.position.x + 50,
              centralNode.position.y,
              {
                zoom: 1.22, //slightly above threshold.
                duration: 1000,
              }
            );
          }, 150); // small timeout to let fitView settle
        }
      });
    }

    loadGraph();

    return () => {
      mounted = false;
    };
  }, [rootNodeId]);

  // --------------------------
  // Cache + merge helper TODO - fix misfiring pos bug here...?
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
    // Needed for dynamic sublabels.
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

  // TODO switch the overlay to use ReactDOM portals...
  return (
    <div className="flex flex-col h-screen relative">
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
          {activeOverlay === "helpview" && <HelpViewer />}
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* left hand panel */}
        <div className="flex-1 w-1/2 border-r border-gray-300 h-full relative flex flex-col">
          {/* Top buttons inside FlowChart container */}
          {!activeOverlay && (
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-auto">
              {/* Left buttons */}
              <div className="flex gap-2">
                <button
                  className="group px-3 py-2 rounded-md bg-opacity-70 bg-white shadow-md text-blue-600 text-md flex items-center gap-1 hover:text-blue-800"
                  onClick={() => setActiveOverlay("groupsview")}
                >
                  <GroupIcon
                    size={24}
                    className="text-blue-600 group-hover:text-blue-800 transition-colors"
                  />
                  <span className="transition-colors">Query database</span>
                </button>

                <button
                  className="group px-3 py-2 rounded-md bg-opacity-70 bg-white shadow-md text-blue-600 text-md flex items-center gap-1 hover:text-blue-800"
                  onClick={async () => {
                    if (!nodes || nodes.length === 0) return;
                    if (singlePageMode === true) {
                      const updatedNodes = await fetchLinkCountsFirstPage(
                        baseUrl,
                        nodes
                      );
                      setNodes(updatedNodes);
                    } else {
                      const updatedNodes = await fetchLinkCounts(
                        baseUrl,
                        nodes
                      );
                      setNodes(updatedNodes);
                    }
                  }}
                >
                  <LinksIcon
                    size={18}
                    className="text-blue-600 group-hover:text-blue-800 transition-colors"
                  />
                  <span className="transition-colors">Get link counts</span>
                </button>
                {/* Single Page Mode Toggle */}
                {/* <button
                  className={`group px-3 py-2 rounded-md shadow-md text-md flex items-center gap-1 transition-all duration-1000 transform ${
                    singlePageMode
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                  onClick={() => setSinglePageMode(!singlePageMode)}
                >
                  <span className="relative w-6 h-6">
                    {/* Fast icon */}
                {/* <FastIcon
                      size={22}
                      className={`absolute top-0 left-0 transition-opacity duration-1000 ${
                        singlePageMode ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {/* Slow icon */}
                {/* <SlowIcon
                      size={22}
                      className={`absolute top-0 left-0 transition-opacity duration-1000 ${
                        singlePageMode ? "opacity-0" : "opacity-100"
                      }`}
                    />
                  </span>
                  <span>{singlePageMode ? "Fast" : "Full"}</span>
                </button>  */}
              </div>

              {/* Right button */}
              <button
                className="group px-3 py-2 rounded-md bg-white shadow-md text-blue-600 text-md flex items-center gap-1 hover:text-blue-800"
                onClick={() => setActiveOverlay("helpview")}
              >
                <QuestionIcon
                  size={18}
                  className="text-blue-600 group-hover:text-blue-800 transition-colors"
                />
                <span className="transition-colors">Help</span>
              </button>
            </div>
          )}

          <FlowChart
            className="flex-1"
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            onNodeDoubleSelect={handleDoubleClick}
            onInit={(instance) => {
              reactFlowInstanceRef.current = instance;
            }}
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
            <VisualiserPane
              baseUrl={baseUrl}
              selectedNode={selectedNode}
              userData={users}
            />
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
