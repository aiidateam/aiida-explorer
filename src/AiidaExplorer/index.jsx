import React, { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  fetchGraphByNodeId,
  smartFetchData,
  fetchLinkCounts,
  fetchUsers,
  fetchDownloadFormats,
  fetchLinkCountsFirstPage,
} from "./api";
import Breadcrumbs from "./Breadcrumbs";
import DebugPane from "./DebugPane";
import FlowChart from "./FlowChart";
import GroupsViewer from "./GroupsViewer";
import HelpViewer from "./HelpViewer";
import VisualiserPane from "./VisualiserPane";
import { GroupIcon, LinksIcon, QuestionIcon } from "./components/Icons";
import Spinner from "./components/Spinner";

import useMediaQuery from "./hooks/mediaquery";

import Overlay, { OverlayProvider } from "./components/Overlay";

// full component handler for aiidaexplorer.
// this manages all states and data to the subcomponents.

// TODO cleanuplogic and compartmentalise the overlay buttons (if we are happy them being there...)
// TODO add loading and timings of steps...
export default function AiidaExplorer({
  restApiUrl,
  rootNode, // controlled value
  defaultRootNode = "", // uncontrolled fallback
  onRootNodeChange = () => {},
  debugMode = false,
}) {
  // Controlled vs uncontrolled pattern:
  // If parent specifies rootNode, that is used as the source of truth,
  // otherwise the internal state is used.
  const isControlled = rootNode !== undefined;
  const [internalRootNodeId, setInternalRootNodeId] = useState(defaultRootNode);
  const rootNodeId = isControlled ? rootNode : internalRootNodeId;

  const setRootNodeId = (id) => {
    if (!isControlled) setInternalRootNodeId(id);
    onRootNodeChange(id);
  };

  const overlayContainerRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const isWideScreen = useMediaQuery("(min-width: 768px)");

  const [loading, setLoading] = useState(false);
  const [singlePageMode, setSinglePageMode] = useState(false);
  const [users, setUsers] = useState(null);
  const [downloadFormats, setDownloadFormats] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [extraNodeData, setExtraNodeData] = useState({});

  const [activeOverlay, setActiveOverlay] = useState("groupsview");

  const MAX_BREADCRUMBS = 10;

  const initialRender = useRef(true);

  useEffect(() => {
    // handle overlay
    if (initialRender.current && !rootNodeId) {
      initialRender.current = false; // skip first render
      setActiveOverlay("groupsview");
    } else if (rootNodeId) {
      setActiveOverlay(null);
    } else {
      setActiveOverlay("groupsview");
    }
  }, [rootNodeId]);

  useEffect(() => {
    fetchUsers(restApiUrl).then(setUsers);
  }, [restApiUrl]);

  useEffect(() => {
    fetchDownloadFormats(restApiUrl).then(setDownloadFormats);
  }, [restApiUrl]);

  // --- Load graph whenever rootNodeId changes ---
  useEffect(() => {
    if (!rootNodeId) return;
    let mounted = true;

    async function loadGraph() {
      setLoading(true);
      const { nodes: fetchedNodes, edges: fetchedEdges } =
        await fetchGraphByNodeId(restApiUrl, rootNodeId, singlePageMode);

      if (!mounted) return;

      const nodesWithExtras = fetchedNodes.map((n) => {
        const cachedData = extraNodeData[n.id] || {};
        return {
          ...n,
          data: { ...n.data, ...cachedData },
        };
      });

      setNodes(nodesWithExtras);
      setEdges(fetchedEdges);
      setLoading(false);

      // Animate central node
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
              { zoom: 1.22, duration: 1000 }
            );
          }, 150);
        }
      });

      const rootNode = nodesWithExtras.find((n) => n.id === rootNodeId);
      if (rootNode) {
        const enrichedNode = await ensureNodeData(rootNode);
        setSelectedNode(enrichedNode);
      }

      // every time root node changes, check/update breadcrumbs
      // Don't update if the last node is already the root node (e.g. via the history click)
      if (breadcrumbs[breadcrumbs.length - 1]?.id !== rootNode.id) {
        setBreadcrumbs((prev) => [...prev, rootNode].slice(-MAX_BREADCRUMBS));
      }
    }

    loadGraph();
    return () => {
      mounted = false;
    };
  }, [rootNodeId, restApiUrl, singlePageMode]);

  // --- Cache + merge ---
  const ensureNodeData = async (node) => {
    const enrichedNode = await smartFetchData(
      restApiUrl,
      node,
      extraNodeData,
      downloadFormats
    );
    setExtraNodeData((prev) => ({
      ...prev,
      [node.id]: { ...(prev[node.id] || {}), ...enrichedNode.data },
    }));
    return enrichedNode;
  };

  // --- Single click on a node ---
  const handleNodeSelect = async (node) => {
    const enrichedNode = await ensureNodeData(node);
    setSelectedNode(enrichedNode);
    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id
          ? { ...n, data: { ...n.data, ...enrichedNode.data } }
          : n
      )
    );
  };

  // --- Double click ---
  const handleDoubleClick = async (node) => {
    if (loading) return;
    setLoading(true);
    try {
      setRootNodeId(node.id);
    } finally {
      setLoading(false);
    }
  };

  // --- Breadcrumb click ---
  const handleBreadcrumbClick = async (node, idx) => {
    setBreadcrumbs((prev) => prev.slice(0, idx + 1));
    setRootNodeId(node.id);
  };

  return (
    <OverlayProvider
      ref={overlayContainerRef}
      className="flex flex-col relative h-full min-h-[300px] border rounded-md bg-white"
    >
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
        container={overlayContainerRef.current}
      >
        {activeOverlay === "groupsview" && (
          <GroupsViewer restApiUrl={restApiUrl} setRootNodeId={setRootNodeId} />
        )}
        {activeOverlay === "helpview" && <HelpViewer />}
      </Overlay>

      <PanelGroup
        direction={isWideScreen ? "horizontal" : "vertical"}
        className="flex-1 min-h-0 overflow-hidden"
      >
        {/* Left-hand pane */}
        <Panel
          className="flex flex-col min-h-0 relative"
          defaultSize={50} // initial % width
          minSize={10} // min % width
        >
          {/* Loading spinner */}
          {loading && (
            <div className="absolute bottom-2 right-2 z-50">
              <Spinner />
            </div>
          )}
          {!activeOverlay && (
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-auto">
              <div className="flex gap-2">
                <button
                  className="group px-2 md:px-4 py-1 rounded-md bg-white shadow-md text-blue-600 text-sm sm:text-lg flex items-center gap-1 hover:text-blue-800 transition-colors"
                  onClick={() => setActiveOverlay("groupsview")}
                >
                  <GroupIcon className="text-blue-600 group-hover:text-blue-800 transition-colors w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline transition-colors">
                    Find node
                  </span>
                </button>

                <button
                  className="group px-2 md:px-4 py-1 rounded-md bg-white shadow-md text-blue-600 text-sm sm:text-lg flex items-center gap-1 hover:text-blue-800 transition-colors"
                  onClick={async () => {
                    if (loading || !nodes || nodes.length === 0) return; // block if loading or no nodes
                    setLoading(true);
                    try {
                      const updatedNodes = singlePageMode
                        ? await fetchLinkCountsFirstPage(restApiUrl, nodes)
                        : await fetchLinkCounts(restApiUrl, nodes);
                      setNodes(updatedNodes);
                    } finally {
                      setLoading(false);
                    }
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
          className={`group flex items-center justify-center bg-slate-200 border-x ${
            isWideScreen ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"
          }`}
        >
          {/* Thumb indicator */}
          <div
            className={`bg-gray-700 rounded group-hover:scale-125 ${
              isWideScreen ? "w-0.5 h-6" : "w-6 h-0.5"
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
              restApiUrl={restApiUrl}
              selectedNode={selectedNode}
              userData={users}
              downloadFormats={downloadFormats}
            />
          </div>
        </Panel>
      </PanelGroup>

      {/* Breadcrumbs */}
      <div className="flex-none overflow-x-auto">
        <Breadcrumbs
          trail={breadcrumbs}
          onClick={handleBreadcrumbClick}
          maxItems={MAX_BREADCRUMBS}
        />
      </div>
    </OverlayProvider>
  );
}
