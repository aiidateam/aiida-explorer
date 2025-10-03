import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FlowChart from "./FlowChart";
import DebugPane from "./DebugPane";
import GroupsViewer from "./GroupsViewer";

import HelpViewer from "./HelpViewer";

import VisualiserPane from "./VisualiserPane";
import Breadcrumbs from "./Breadcrumbs";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  fetchGraphByNodeId,
  smartFetchData,
  fetchLinkCounts,
  fetchUsers,
  fetchDownloadFormats,
  fetchLinkCountsFirstPage,
} from "./api";

import { GroupIcon, LinksIcon, QuestionIcon } from "../components/Icons";

import { createPortal } from "react-dom";

function Overlay({ children, active, onClose, title }) {
  if (!active) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose} // click outside closes
    >
      <div
        className="bg-white w-full mx-4 h-5/6 rounded-xl overflow-auto transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header with optional title + X button */}
        <div className="flex justify-between items-center border-b px-3 py-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Modal content */}
        <div className="p-3">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);
  return matches;
}

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

  const isMdUp = useMediaQuery("(min-width: 768px)"); // Tailwind md breakpoint

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
    const enrichedNode = await smartFetchData(
      baseUrl,
      node,
      extraNodeData,
      downloadFormats
    );

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
    setSearchParams({ rootNode: node.id }, { replace: true });

    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);
  };

  // --------------------------
  // Breadcrumb click
  // --------------------------
  const handleBreadcrumbClick = async (node, idx) => {
    setBreadcrumbs((prev) => prev.slice(0, idx + 1));
    setRootNodeId(node.id);
    setSearchParams({ rootNode: node.id }, { replace: true });

    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);
  };

  // TODO switch the overlay to use ReactDOM portals...
  return (
    <div className="flex flex-col h-screen relative">
      {/* Overlay */}

      <Overlay
        active={activeOverlay}
        onClose={() => setActiveOverlay(null)}
        title={
          activeOverlay === "groupsview"
            ? "Groups"
            : activeOverlay === "typesview"
            ? "Node Types"
            : activeOverlay === "helpview"
            ? "Help"
            : ""
        }
      >
        {activeOverlay === "groupsview" && <GroupsViewer baseUrl={baseUrl} />}
        {activeOverlay === "typesview" && <GridViewer baseUrl={baseUrl} />}
        {activeOverlay === "helpview" && <HelpViewer />}
      </Overlay>

      <PanelGroup
        direction={isMdUp ? "horizontal" : "vertical"}
        className="flex-1 min-h-0 overflow-hidden"
      >
        {/* Left-hand pane */}
        <Panel
          className=" border-gray-300 flex flex-col min-h-0 relative"
          defaultSize={50} // initial % width
          minSize={10} // min % width
        >
          {!activeOverlay && (
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-auto">
              <div className="flex gap-2">
                <button
                  className="group px-2 md:px-4 py-1 rounded-md bg-white shadow-md text-blue-600 text-sm sm:text-lg flex items-center gap-1 hover:text-blue-800 transition-colors"
                  onClick={() => setActiveOverlay("groupsview")}
                >
                  <GroupIcon className="text-blue-600 group-hover:text-blue-800 transition-colors w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline transition-colors">
                    Query database
                  </span>
                </button>

                <button
                  className="group px-2 md:px-4 py-1 rounded-md bg-white shadow-md text-blue-600 text-sm sm:text-lg flex items-center gap-1 hover:text-blue-800 transition-colors"
                  onClick={async () => {
                    if (!nodes || nodes.length === 0) return;
                    const updatedNodes = singlePageMode
                      ? await fetchLinkCountsFirstPage(baseUrl, nodes)
                      : await fetchLinkCounts(baseUrl, nodes);
                    setNodes(updatedNodes);
                  }}
                >
                  <LinksIcon className="text-blue-600 group-hover:text-blue-800 transition-colors" />
                  <span className="hidden md:inline transition-colors">
                    Get link counts
                  </span>
                </button>
              </div>

              <button
                className="group px-2 md:px-4 py-1 rounded-md bg-white shadow-md text-blue-600 text-sm sm:text-lg flex items-center gap-1 hover:text-blue-800 transition-colors"
                onClick={() => setActiveOverlay("helpview")}
              >
                <QuestionIcon className="text-blue-600 group-hover:text-blue-800 transition-colors w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline transition-colors">Help</span>
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0">
            <FlowChart
              className="flex-1 min-h-0"
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
        </Panel>

        {/* Resize handle */}
        <PanelResizeHandle
          className={`group flex items-center justify-center border br-gray-500 bl-gray-500 ${
            isMdUp ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize"
          }`}
        >
          {/* Thumb indicator */}
          <div
            className={`bg-gray-400 rounded group-hover:scale-150 ${
              isMdUp ? "w-0.5 h-6" : "w-6 h-0.5"
            }`}
          />
        </PanelResizeHandle>

        {/* Right-hand pane */}
        <Panel className="flex-1 flex flex-col min-h-0">
          {debugMode && (
            <div className="hidden md:flex h-1/4 border-b border-gray-300 overflow-y-auto">
              <DebugPane selectedNode={selectedNode} />
            </div>
          )}
          <div className="flex-1 overflow-y-auto min-h-0">
            <VisualiserPane
              baseUrl={baseUrl}
              selectedNode={selectedNode}
              userData={users}
              downloadFormats={downloadFormats}
            />
          </div>
        </Panel>
      </PanelGroup>

      {/* Breadcrumbs */}
      <div className="flex-none h-12 border-t border-gray-300 overflow-x-auto">
        <Breadcrumbs
          trail={breadcrumbs}
          onClick={handleBreadcrumbClick}
          maxItems={MAX_BREADCRUMBS}
        />
      </div>
    </div>
  );
}
