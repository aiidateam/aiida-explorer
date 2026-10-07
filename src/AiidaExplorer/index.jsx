import React, { useState, useEffect, useRef, useCallback } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  fetchNeighbourhood,
  buildCenterNode,
  smartFetchData,
  fetchLinkCounts,
  fetchUsers,
  fetchDownloadFormats,
  stripSyntheticId,
  fetchAPIFullTypes,
} from "./api";
import Breadcrumbs from "./Breadcrumbs";
import Overlay, { OverlayProvider } from "./components/Overlay";
import Spinner from "./components/Spinner";
import ErrorDisplay from "./components/Error";
import FlowChart from "./FlowChart";
import { downloadGraphSnapshot } from "./FlowChart/downloadSnapshot";
import {
  expandSide,
  highlightPathEdges,
} from "./FlowChart/graphController";
import GroupsViewer from "./GroupsViewer";
import HelpViewer from "./HelpViewer";
import useContainerMediaQuery from "./hooks/useContainerMediaQuery";
import useRootNode from "./hooks/useRootNode";
import TopControls from "./TopBar";
import VisualiserPane from "./VisualiserPane";

import "./index.css";

// potential full screen toggle switch.
function toggleFullScreen(el) {
  if (!document.fullscreenElement) {
    el.requestFullscreen().catch((err) => console.error(err));
  } else {
    document.exitFullscreen();
  }
}

/**
 * AiidaExplorer wrapper to reset internal state when restApiUrl changes
 */
export default function AiidaExplorer(props) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        retryDelay: 1000,
        staleTime: 1000 * 60 * 5, // 5 minute
        cacheTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <QueryClientProvider key={props.restApiUrl} client={queryClient}>
      <AiidaExplorerInner key={props.restApiUrl} {...props} />
    </QueryClientProvider>
  );
}

// full component handler for aiidaexplorer.
// this manages all states and data to the subcomponents.

// TODO add loading and timings of steps...
function AiidaExplorerInner({
  restApiUrl,
  rootNode, // controlled value
  defaultRootNode = "", // uncontrolled fallback
  onRootNodeChange = () => {},
  fullscreenToggle = false,
  autoLinkCounts = true, // set false to skip background link-count fetches
}) {
  // Controlled vs uncontrolled pattern managed by a custom hook
  // If parent specifies rootNode, that is used as the source of truth,
  // otherwise the internal state is used.
  const [rootNodeId, setRootNodeId] = useRootNode(
    rootNode,
    defaultRootNode,
    onRootNodeChange,
  );

  const appRef = useRef(null);
  const overlayContainerRef = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const queryClient = useQueryClient();

  // dynamic container media querying.
  const sizeCategory = useContainerMediaQuery(appRef, [
    { name: "tiny", predicate: (w) => w < 400 },
    { name: "small", predicate: (w) => w >= 400 && w < 700 },
    { name: "medium", predicate: (w) => w >= 700 && w < 1200 },
    { name: "large", predicate: (w) => w >= 1200 },
  ]);

  // Panel direction follows the container, not the viewport (embed-safe).
  const isWideScreen = sizeCategory === "medium" || sizeCategory === "large";

  // Prefetching important hits
  // --- Prefetch users and downloadFormats on mount ---
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["users"],
      queryFn: () => fetchUsers(restApiUrl),
    });

    queryClient.prefetchQuery({
      queryKey: ["downloadFormats"],
      queryFn: () => fetchDownloadFormats(restApiUrl),
    });

    // queryClient.prefetchQuery({
    //   queryKey: ["nodeFullTypes"],
    //   queryFn: () => fetchAPIFullTypes(restApiUrl),
    // });
  }, [queryClient, restApiUrl]);

  // --- Access cached data with useQuery ---
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(restApiUrl),
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const { data: downloadFormats } = useQuery({
    queryKey: ["downloadFormats"],
    queryFn: () => fetchDownloadFormats(restApiUrl),
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  // const { data: fullTypes } = useQuery({
  //   queryKey: ["nodeFullTypes"],
  //   queryFn: () => fetchAPIFullTypes(restApiUrl),
  //   staleTime: Infinity,
  //   cacheTime: Infinity,
  // });

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // --- Load graph whenever rootNodeId changes ---
  useEffect(() => {
    if (!rootNodeId) return;
    let mounted = true;

    setLoading(true);

    async function loadGraph() {
      // Navigation uses the same mechanism as +/-: fresh root, then expand
      // both sides onto it. No separate layout path, no desync.
      const neighbourhood = await fetchNeighbourhood(restApiUrl, rootNodeId);

      if (!mounted) return;
      if (!neighbourhood) {
        setNodes([]);
        setEdges([]);
        setLoading(false);
        return;
      }

      const { rootNode, linksIn, linksOut } = neighbourhood;
      const center = buildCenterNode(
        rootNode,
        linksIn.length,
        linksOut.length,
      );

      expansionMap.current = {};
      setExpandedKeys([]);
      setExpandingKeys([]);

      let cur = { nodes: [center], edges: [] };
      const resIn = expandSide(cur.nodes, cur.edges, center, "in", linksIn);
      const resOut = expandSide(
        resIn.nodes,
        resIn.edges,
        center,
        "out",
        linksOut,
      );
      expansionMap.current[`${center.aiidaUUID}:in`] = {
        nodeIds: resIn.addedNodeIds,
        edgeIds: resIn.addedEdgeIds,
      };
      expansionMap.current[`${center.aiidaUUID}:out`] = {
        nodeIds: resOut.addedNodeIds,
        edgeIds: resOut.addedEdgeIds,
      };
      setExpandedKeys([
        `${center.aiidaUUID}:in`,
        `${center.aiidaUUID}:out`,
      ]);
      cur = { nodes: resOut.nodes, edges: resOut.edges };

      const lastNode = breadcrumbs.at(-1);
      setNodes(cur.nodes);
      setEdges(
        highlightPathEdges(
          cur.edges,
          lastNode?.aiidaUUID,
          center.aiidaUUID,
        ),
      );

      // Wait until next React render to ensure nodes are placed
      requestAnimationFrame(() => {
        const instance = reactFlowInstanceRef.current;
        if (!instance) return;

        // zoom out
        instance.fitView({ padding: 2.0 });

        const centralNode = cur.nodes.find(
          (n) => stripSyntheticId(n.id) === stripSyntheticId(rootNodeId),
        );
        if (centralNode?.position) {
          let zoom = 1.22;
          if (sizeCategory === "small") zoom = 0.5;
          else if (sizeCategory === "medium") zoom = 0.8;
          else if (sizeCategory === "large") zoom = 1.22;

          instance.setCenter(
            centralNode.position.x + 70,
            centralNode.position.y,
            { zoom, duration: 500 },
          );
          // zoom back in
          setTimeout(() => {
            instance.setCenter(
              centralNode.position.x + 70,
              centralNode.position.y + 0,
              { zoom: zoom, duration: 500 },
            );
          }, 400);
        }
      });

      const selectedRoot = cur.nodes.find(
        (n) => stripSyntheticId(n.id) === stripSyntheticId(rootNodeId),
      );
      if (selectedRoot) {
        const enrichedNode = await ensureNodeData(selectedRoot);
        setSelectedNode(enrichedNode);
      }

      if (
        stripSyntheticId(breadcrumbs[breadcrumbs.length - 1]?.id) !==
        stripSyntheticId(selectedRoot?.id)
      ) {
        setBreadcrumbs((prev) => [...prev, selectedRoot].slice(-MAX_BREADCRUMBS));
      }
      setLoading(false);
    }

    loadGraph();
    return () => {
      mounted = false;
    };
  }, [rootNodeId, restApiUrl, downloadFormats, users]);

  // --- Background link counts for nodes missing them (toggle: autoLinkCounts) ---
  useEffect(() => {
    if (!autoLinkCounts || nodes.length === 0) return;
    if (
      !nodes.some(
        (n) =>
          typeof n.data?.parentCount !== "number" ||
          typeof n.data?.childCount !== "number",
      )
    )
      return;

    let cancelled = false;
    fetchLinkCounts(restApiUrl, nodes).then((updatedNodes) => {
      if (!cancelled) setNodes(updatedNodes);
    });
    return () => {
      cancelled = true;
    };
  }, [nodes, restApiUrl, autoLinkCounts]);

  const ensureNodeData = async (node) => {
    const nodeId = stripSyntheticId(node.id);
    const enrichedData = await queryClient.fetchQuery({
      queryKey: ["nodeDetails", restApiUrl, nodeId],
      queryFn: () => smartFetchData(restApiUrl, node, downloadFormats),
    });
    return enrichedData;
  };

  // --- Single click on a node ---
  const handleNodeSelect = async (node) => {
    const enrichedNode = await ensureNodeData(node);

    setNodes((prev) =>
      prev.map((n) =>
        stripSyntheticId(n.id) === stripSyntheticId(node.id)
          ? { ...n, data: { ...enrichedNode.data } }
          : n,
      ),
    );
    setSelectedNode(enrichedNode);
  };

  // --- Double click ---
  const handleDoubleClick = async (node) => {
    setRootNodeId(stripSyntheticId(node.id));
  };

  // --- PNG snapshot of the whole graph (including off-screen nodes) ---
  const handleSnapshot = useCallback(async () => {
    const viewport = appRef.current?.querySelector(".react-flow__viewport");
    const measured = reactFlowInstanceRef.current?.toObject()?.nodes;
    if (!viewport || !measured?.length) return;
    try {
      await downloadGraphSnapshot(
        viewport,
        measured,
        `aiida-graph-${stripSyntheticId(rootNodeId).slice(0, 8)}.png`,
      );
    } catch (err) {
      console.error("Snapshot failed:", err);
    }
  }, [rootNodeId]);
  // --- Collapse everything back to the root node ---
  const handleCollapseAll = useCallback(() => {
    expandGen.current += 1; // invalidate in-flight expansions
    const root = nodes.find(
      (n) => stripSyntheticId(n.id) === stripSyntheticId(rootNodeId),
    );
    setNodes(root ? [root] : []);
    setEdges([]);
    expansionMap.current = {};
    setExpandedKeys([]);
    setExpandingKeys([]);
  }, [nodes, rootNodeId]);

  // --- Incremental per-side expand/collapse, merged on stable aiidaUUID ---
  const expansionMap = useRef({});
  const expandGen = useRef(0);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [expandingKeys, setExpandingKeys] = useState([]);

  const handleToggleExpand = useCallback(
    async (syntheticId, side) => {
      if (side !== "in" && side !== "out") return;
      const target = nodes.find((n) => n.id === syntheticId);
      if (!target) return;
      const uuid = target.aiidaUUID ?? stripSyntheticId(target.id);
      const key = `${uuid}:${side}`;
      if (expandingKeys.includes(key)) return;

      // Collapse: remove exactly what this side-expansion added.
      if (expandedKeys.includes(key)) {
        const added = expansionMap.current[key] ?? {
          nodeIds: [],
          edgeIds: [],
        };
        const removedEdgeIds = new Set(added.edgeIds);
        edges.forEach((e) => {
          if (
            added.nodeIds.includes(e.source) ||
            added.nodeIds.includes(e.target)
          )
            removedEdgeIds.add(e.id);
        });
        const keptEdges = edges.filter((e) => !removedEdgeIds.has(e.id));
        const liveNodeIds = new Set();
        keptEdges.forEach((e) => {
          liveNodeIds.add(e.source);
          liveNodeIds.add(e.target);
        });
        setEdges(keptEdges);
        setNodes((nds) =>
          nds.filter(
            (n) =>
              n.id === target.id ||
              !added.nodeIds.includes(n.id) ||
              liveNodeIds.has(n.id),
          ),
        );
        delete expansionMap.current[key];
        setExpandedKeys((keys) => keys.filter((k) => k !== key));
        return;
      }

      setExpandingKeys((keys) => [...keys, key]);
      const gen = expandGen.current;
      try {
        const neighbourhood = await fetchNeighbourhood(restApiUrl, uuid);
        if (!neighbourhood || expandGen.current !== gen) return;
        // Only the requested side; also refreshes this node's counts.
        const links =
          side === "in" ? neighbourhood.linksIn : neighbourhood.linksOut;

        const res = expandSide(nodes, edges, target, side, links);
        expansionMap.current[key] = {
          nodeIds: res.addedNodeIds,
          edgeIds: res.addedEdgeIds,
        };
        setNodes([
          ...res.nodes.map((n) =>
            n.id === target.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    parentCount: neighbourhood.linksIn.length,
                    childCount: neighbourhood.linksOut.length,
                  },
                }
              : n,
          ),
        ]);
        setEdges(res.edges);
        setExpandedKeys((keys) => [...keys, key]);
      } finally {
        setExpandingKeys((keys) => keys.filter((k) => k !== key));
      }
    },
    [nodes, edges, expandedKeys, expandingKeys, restApiUrl],
  );

  // --- Breadcrumb click ---
  const handleBreadcrumbClick = async (node, idx) => {
    setBreadcrumbs((prev) => prev.slice(0, idx + 1));
    setRootNodeId(stripSyntheticId(node.id));
  };

  // --- Navigation from modals --- //
  const navigateFromOverlay = useCallback(
    (nodeId) => {
      setActiveOverlay(null);
      setRootNodeId(nodeId);
    },
    [setRootNodeId],
  );

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
              setRootNodeId={navigateFromOverlay}
            />
          )}
          {activeOverlay === "helpview" && <HelpViewer />}
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
                const updatedNodes = await fetchLinkCounts(restApiUrl, nodes);
                setNodes(updatedNodes);
              }}
              onCollapseAll={handleCollapseAll}
              onSnapshot={handleSnapshot}
              onHelp={() => setActiveOverlay("helpview")}
              onFullscreen={() => toggleFullScreen(appRef.current)}
              disableGetCounts={nodes.length === 0}
              fullscreenToggle={fullscreenToggle}
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
                onToggleExpand={handleToggleExpand}
                expandedKeys={expandedKeys}
                expandingKeys={expandingKeys}
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
