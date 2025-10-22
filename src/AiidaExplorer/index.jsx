import React, { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  fetchGraphByNodeId,
  smartFetchData,
  fetchLinkCounts,
  fetchUsers,
  fetchDownloadFormats,
} from "./api";
import Breadcrumbs from "./Breadcrumbs";
import ErrorDisplay from "./components/Error";
import { GroupIcon, LinksIcon, QuestionIcon } from "./components/Icons";
import Overlay, { OverlayProvider } from "./components/Overlay";
import Spinner from "./components/Spinner";
import DebugPane from "./DebugPane";
import FlowChart from "./FlowChart";
import GroupsViewer from "./GroupsViewer";
import HelpViewer from "./HelpViewer";
import useMediaQuery from "./hooks/useMediaQuery";
import useRootNode from "./hooks/useRootNode";
import TopControls from "./TopBar";
import VisualiserPane from "./VisualiserPane";

import "./theme.css";

/**
 * AiidaExplorer wrapper to reset internal state when restApiUrl changes
 */
export default function AiidaExplorer(props) {
  return <AiidaExplorerInner key={props.restApiUrl} {...props} />;
}

// full component handler for aiidaexplorer.
// this manages all states and data to the subcomponents.

// TODO cleanuplogic and compartmentalise the overlay buttons (if we are happy them being there...)
// TODO add loading and timings of steps...
function AiidaExplorerInner({
  restApiUrl,
  rootNode, // controlled value
  defaultRootNode = "", // uncontrolled fallback
  onRootNodeChange = () => {},
  debugMode = false,
  theme = "default",
}) {
  // Controlled vs uncontrolled pattern managed by a custom hook
  // If parent specifies rootNode, that is used as the source of truth,
  // otherwise the internal state is used.
  const [rootNodeId, setRootNodeId] = useRootNode(
    rootNode,
    defaultRootNode,
    onRootNodeChange
  );

  const overlayContainerRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const isWideScreen = useMediaQuery("(min-width: 1000px)");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(null);

      try {
        const { nodes: fetchedNodes, edges: fetchedEdges } =
          await fetchGraphByNodeId(restApiUrl, rootNodeId);

        if (!mounted) return;

        const nodesWithExtras = fetchedNodes.map((n) => ({
          ...n,
          data: { ...n.data, ...(extraNodeData[n.id] || {}) },
        }));

        setNodes(nodesWithExtras);
        setEdges(fetchedEdges);

        // Wait until next React render to ensure nodes are placed
        requestAnimationFrame(() => {
          const instance = reactFlowInstanceRef.current;
          if (!instance) return;

          // zoom out
          instance.fitView({ padding: 1.5, duration: 300 });

          const centralNode = nodesWithExtras.find((n) => n.id === rootNodeId);
          if (centralNode?.position) {
            // zoom back in
            setTimeout(() => {
              instance.setCenter(
                centralNode.position.x + 70,
                centralNode.position.y + 0,
                { zoom: 1.22, duration: 500 }
              );
            }, 400); // a bit more than fitView's duration
          }
        });

        const rootNode = nodesWithExtras.find((n) => n.id === rootNodeId);
        if (rootNode) {
          const enrichedNode = await ensureNodeData(rootNode);
          setSelectedNode(enrichedNode);
        }

        if (breadcrumbs[breadcrumbs.length - 1]?.id !== rootNode?.id) {
          setBreadcrumbs((prev) => [...prev, rootNode].slice(-MAX_BREADCRUMBS));
        }
      } catch (err) {
        console.error("Failed to load graph:", err);
        if (mounted) setError(err.message || "Failed to load node data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadGraph();
    return () => {
      mounted = false;
    };
  }, [rootNodeId, restApiUrl, downloadFormats, users]);

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
    <div data-theme={theme} className="flex flex-col h-full">
      <OverlayProvider
        ref={overlayContainerRef}
        className="flex flex-col relative h-full min-h-[300px] border bg-theme-50"
      >
        {/* Overlay */}

        <Overlay
          active={activeOverlay}
          onClose={() => setActiveOverlay(null)}
          title={
            activeOverlay === "groupsview"
              ? "Find node"
              : activeOverlay === "typesview"
                ? "Node Types"
                : activeOverlay === "helpview"
                  ? "Help"
                  : ""
          }
          container={overlayContainerRef.current}
        >
          {activeOverlay === "groupsview" && (
            <GroupsViewer
              restApiUrl={restApiUrl}
              setRootNodeId={setRootNodeId}
            />
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

            {/* Error message */}
            {error && (
              <div className="absolute bottom-2 right-2 z-50">
                <ErrorDisplay
                  message={`Failed to find node UUID: ${rootNodeId}`}
                />
              </div>
            )}

            {/* controls pane at the top. */}
            <TopControls
              onFindNode={() => setActiveOverlay("groupsview")}
              onGetLinkCounts={async () => {
                if (loading || nodes.length === 0) return;
                setLoading(true);
                try {
                  const updatedNodes = await fetchLinkCounts(restApiUrl, nodes);
                  setNodes(updatedNodes);
                } finally {
                  setLoading(false);
                }
              }}
              onHelp={() => setActiveOverlay("helpview")}
              isLoading={loading}
              disableGetCounts={nodes.length === 0}
            />

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
            data-theme={theme}
            className={`group flex items-center justify-center bg-theme-200 border-x ${
              isWideScreen
                ? "w-1.5 cursor-col-resize"
                : "h-1.5 cursor-row-resize"
            }`}
          >
            {/* Thumb indicator */}
            <div
              className={`bg-theme-700 rounded group-hover:scale-125 ${
                isWideScreen ? "w-0.5 h-6" : "w-6 h-0.5"
              }`}
            />
          </PanelResizeHandle>

          {/* Right-hand pane */}
          <Panel className="flex-1 flex flex-col min-h-0">
            {debugMode && (
              <div className="hidden md:flex h-1/4 border-b border-theme-300 overflow-y-auto">
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
    </div>
  );
}
