import React, { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  fetchGraphByNodeId,
  smartFetchData,
  fetchLinkCounts,
  fetchUsers,
  fetchDownloadFormats,
  stripSyntheticId,
} from "./api";
import Breadcrumbs from "./Breadcrumbs";
import ErrorDisplay from "./components/Error";
import Overlay, { OverlayProvider } from "./components/Overlay";
import Spinner from "./components/Spinner";
import DebugViewer from "./DebugViewer";
import FlowChart from "./FlowChart";
import GroupsViewer from "./GroupsViewer";
import HelpViewer from "./HelpViewer";
import useMediaQuery from "./hooks/useMediaQuery";
import useContainerMediaQuery from "./hooks/useContainerMediaQuery";
import useRootNode from "./hooks/useRootNode";
import TopControls from "./TopBar";
import VisualiserPane from "./VisualiserPane";

import "./index.css";

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
}) {
  // Controlled vs uncontrolled pattern managed by a custom hook
  // If parent specifies rootNode, that is used as the source of truth,
  // otherwise the internal state is used.
  const [rootNodeId, setRootNodeId] = useRootNode(
    rootNode,
    defaultRootNode,
    onRootNodeChange
  );

  const appRef = useRef(null);
  const overlayContainerRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const isWideScreen = useMediaQuery("(min-width: 1000px)");

  // dynamic container media querying.
  const sizeCategory = useContainerMediaQuery(appRef, [
    { name: "tiny", predicate: (w) => w < 400 },
    { name: "small", predicate: (w) => w >= 400 && w < 700 },
    { name: "medium", predicate: (w) => w >= 700 && w < 1200 },
    { name: "large", predicate: (w) => w >= 1200 },
  ]);

  const [debugInfo, setDebugInfo] = useState({
    lastNodeFetchTime: null,
    lastGraphFetchTime: null,
    cacheHits: 0,
    cacheMisses: 0,
    nodesCount: 0,
    edgesCount: 0,
    breadcrumbsCount: 0,
  });

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
      const start = performance.now();
      setLoading(true);
      setError(null);

      try {
        const { nodes: fetchedNodes, edges: fetchedEdges } =
          await fetchGraphByNodeId(restApiUrl, rootNodeId);

        if (!mounted) return;

        const fetchTime = performance.now() - start;
        setDebugInfo((prev) => ({
          ...prev,
          lastGraphFetchTime: fetchTime.toFixed(2) + "ms",
          nodesCount: fetchedNodes.length,
          edgesCount: fetchedEdges.length,
          breadcrumbsCount: breadcrumbs.length,
        }));

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

          const centralNode = nodesWithExtras.find(
            (n) => stripSyntheticId(n.id) === stripSyntheticId(rootNodeId)
          );
          if (centralNode?.position) {
            let zoom = 1.22;
            if (sizeCategory === "small") zoom = 0.5;
            else if (sizeCategory === "medium") zoom = 0.8;
            else if (sizeCategory === "large") zoom = 1.22;

            instance.setCenter(
              centralNode.position.x + 70,
              centralNode.position.y,
              { zoom, duration: 500 }
            );
            // zoom back in
            setTimeout(() => {
              instance.setCenter(
                centralNode.position.x + 70,
                centralNode.position.y + 0,
                { zoom: zoom, duration: 500 }
              );
            }, 400); // a bit more than fitView's duration
          }
        });

        const rootNode = nodesWithExtras.find(
          (n) => stripSyntheticId(n.id) === stripSyntheticId(rootNodeId)
        );
        if (rootNode) {
          const enrichedNode = await ensureNodeData(rootNode);
          setSelectedNode(enrichedNode);
        }

        if (
          stripSyntheticId(breadcrumbs[breadcrumbs.length - 1]?.id) !==
          stripSyntheticId(rootNode?.id)
        ) {
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
    const nodeId = stripSyntheticId(node.id);
    const isCached = !!extraNodeData[nodeId];

    setDebugInfo((prev) => ({
      ...prev,
      cacheHits: prev.cacheHits + (isCached ? 1 : 0),
      cacheMisses: prev.cacheMisses + (!isCached ? 1 : 0),
    }));

    const enrichedNode = await smartFetchData(
      restApiUrl,
      node,
      extraNodeData,
      downloadFormats
    );
    setExtraNodeData((prev) => ({
      ...prev,
      [stripSyntheticId(node.id)]: {
        ...(prev[stripSyntheticId(node.id)] || {}),
        ...enrichedNode.data,
      },
    }));
    return enrichedNode;
  };

  // --- Single click on a node ---
  const handleNodeSelect = async (node) => {
    const start = performance.now();
    const enrichedNode = await ensureNodeData(node);
    const duration = performance.now() - start;

    setDebugInfo((prev) => ({
      ...prev,
      lastNodeFetchTime: duration.toFixed(2) + "ms",
    }));

    setSelectedNode(enrichedNode);
    setNodes((prev) =>
      prev.map((n) =>
        stripSyntheticId(n.id) === stripSyntheticId(node.id)
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
      setRootNodeId(stripSyntheticId(node.id));
    } finally {
      setLoading(false);
    }
  };

  // --- Breadcrumb click ---
  const handleBreadcrumbClick = async (node, idx) => {
    setBreadcrumbs((prev) => prev.slice(0, idx + 1));
    setRootNodeId(stripSyntheticId(node.id));
  };

  return (
    <div ref={appRef} className="ae:flex ae:flex-col ae:h-full">
      <OverlayProvider
        ref={overlayContainerRef}
        className="ae:flex ae:flex-col ae:relative ae:h-full ae:min-h-[300px] ae:border ae:bg-slate-100"
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

          {activeOverlay === "debugview" && (
            <DebugViewer debugInfo={debugInfo} />
          )}
        </Overlay>

        <PanelGroup
          direction={isWideScreen ? "horizontal" : "vertical"}
          className="ae:flex-1 ae:min-h-0 ae:overflow-hidden"
        >
          {/* Left-hand pane */}
          <Panel
            className="ae:flex ae:flex-col ae:min-h-0 ae:relative"
            defaultSize={50} // initial % width
            minSize={10} // min % width
          >
            {/* Loading spinner */}
            {loading && (
              <div className="ae:absolute ae:bottom-2 ae:right-2 ae:z-50">
                <Spinner />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="ae:absolute ae:bottom-2 ae:right-2 ae:z-50">
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
              onDebug={() => setActiveOverlay("debugview")}
              isLoading={loading}
              disableGetCounts={nodes.length === 0}
              debugMode={debugMode}
            />

            <div className="ae:flex-1 ae:min-h-0">
              <FlowChart
                className="ae:flex-1 ae:min-h-0"
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
            className={`ae:group ae:flex ae:items-center ae:justify-center ae:bg-slate-200 ${
              isWideScreen
                ? "ae:w-1.5 ae:cursor-col-resize ae:border-x"
                : "ae:h-1.5 ae:cursor-row-resize ae:border-y"
            }`}
          >
            {/* Thumb indicator */}
            <div
              className={`ae:bg-slate-700 ae:rounded ae:group-hover:scale-125 ${
                isWideScreen ? "ae:w-0.5 ae:h-6" : "ae:w-6 ae:h-0.5"
              }`}
            />
          </PanelResizeHandle>

          {/* Right-hand pane */}
          <Panel className="ae:flex-1 ae:flex ae:flex-col ae:min-h-0">
            <VisualiserPane
              restApiUrl={restApiUrl}
              selectedNode={selectedNode}
              userData={users}
              downloadFormats={downloadFormats}
            />
          </Panel>
        </PanelGroup>

        {/* Breadcrumbs */}
        <div className="ae:flex-none ae:overflow-x-auto">
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
