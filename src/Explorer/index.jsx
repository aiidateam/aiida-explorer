import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FlowChart from "./FlowChart";
import SidePane from "./SidePane";
import GridViewer from "./GridViewer";
import GroupsViewer from "./GroupsViewer";

import DebugPane from "./DebugPane";
import VisualiserPane from "./VisualiserPane";
import Breadcrumbs from "./Breadcrumbs";
import {
  fetchGraphByNodeId,
  fetchNodeContents,
  fetchCif,
  fetchJson,
  fetchNodeRepoList,
  fetchFiles,
  fetchRetrievedUUID,
} from "./api";

import { GroupIcon, GroupIcon2, XIcon } from "../components/Icons";

// full component handler for  aiidaexplorer.
//  this manages all states and data to the subcomponents.
export default function Explorer({ baseUrl = "", startingNode = "" }) {
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

  const [isGroupsOpen, setIsGroupsOpen] = useState(() => {
    // if startingNode is empty string, open the Groups overlay
    return startingNode === "";
  });

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
          (n) => n.id === selectedNode.id,
        );
        setSelectedNode(stillExists || null);
      }

      setTimeTaken(performance.now() - start);
    }

    loadGraph();

    return () => {
      mounted = false;
    };
  }, [rootNodeId]); //

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

    // Fetch repo list if missing
    if (!updatedData.repo_list) {
      let repo_list = {};
      if (node.data.label === "FolderData") {
        repo_list = await fetchNodeRepoList(baseUrl, node.id);
      }

      if (node.data.label === "RemoteData") {
        repo_list = await fetchNodeRepoList(baseUrl, node.id);
      }
      updatedData = { ...updatedData, repo_list };
    }

    if (!updatedData.files) {
      let files = {};
      if (node.data.label === "CalcJobNode") {
        // calcjob nodes need to know where their retrieved node is...
        // so we messily generate it here and append it to the data structure
        if (!updatedData.retrievedUUID) {
          const retrID = await fetchRetrievedUUID(baseUrl, node.id);
          updatedData = { ...updatedData, retrievedUUID: retrID };
        }

        // we now use this appended UUID to render get the file downlpoad paths properly.
        files = await fetchFiles(baseUrl, node.id, updatedData.retrievedUUID);
      }
      updatedData = { ...updatedData, files };
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

  return (
    <div className="flex flex-col h-screen relative">
      {/* absolute means we render it ontop the other content, dropping this also looks okay imo... */}
      {/* toggle button - hide if Table View is open*/}
      {!isGroupsOpen && (
        <button
          className="group absolute top-4 left-4 z-50 px-3 py-2 rounded-md bg-white shadow-md text-blue-600 text-lg
               flex items-center gap-1 hover:text-blue-800"
          onClick={() => setIsGroupsOpen(true)}
        >
          <GroupIcon
            size={24}
            className="text-blue-600 group-hover:text-blue-800 transition-colors"
          />
          <span className="transition-colors">Table View</span>
        </button>
      )}
      {/* Overlay always rendered */}
      <div
        className={`
          fixed inset-0 z-40 flex items-center justify-center bg-black/30
          transition-all duration-500 ease-in-out
          ${
            isGroupsOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={() => setIsGroupsOpen(false)} // click outside closes
      >
        <div
          className={`
            bg-white w-5/6 h-5/6 rounded-lg shadow-xl overflow-auto relative
            transform transition-all duration-500 ease-in-out
            ${isGroupsOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          `}
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          {/* X button inside */}
          <button
            className="absolute top-3 right-3 p-2"
            onClick={() => setIsGroupsOpen(false)}
          >
            <XIcon
              size={24}
              className="text-slate-800 hover:text-red-800 transition-colors duration-400"
            />
          </button>
          <div className="flex flex-col h-full gap-2">
            {/* Top panel */}
            <div className="flex-1 overflow-auto border-b-2 border-gray-300">
              <GridViewer baseUrl={baseUrl} />
            </div>

            {/* Bottom panel */}
            <div className="flex-1 overflow-auto">
              <GroupsViewer baseUrl={baseUrl} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
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
      {/* Optional animation keyframes in global CSS */}
      <style>
        {`
          @keyframes fadeScaleIn {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
