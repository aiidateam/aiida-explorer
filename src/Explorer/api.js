// Fetching and network building controlled here.
const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

import { layoutGraphWithEdges } from "./FlowChart/graphController";

// get the simple printout of a node.
export async function fetchNodeById(nodeId) {
  if (!nodeId) return null;

  try {
    const res = await fetch(`${BASE_URL}/nodes/${encodeURIComponent(nodeId)}`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
}

// get the actual content of a node.
export async function fetchNodeContents(nodeId) {
  if (!nodeId) return null;

  const endpoints = ["attributes", "comments", "extras"];

  try {
    const results = await Promise.all(
      endpoints.map(async (ep) => {
        const res = await fetch(
          `${BASE_URL}/nodes/${encodeURIComponent(nodeId)}/contents/${ep}`
        );
        if (!res.ok) return null;
        return res.json();
      })
    );

    const [attributesRes, commentsRes, extrasRes] = results;
    return {
      attributes: attributesRes?.data?.attributes ?? {},
      comments: commentsRes?.data?.attributes ?? {},
      extras: extrasRes?.data?.attributes ?? {},
    };
  } catch (err) {
    console.error("Error fetching node contents:", err);
    return null;
  }
}

// get all links to a node (currently unpaginated)
export async function fetchLinks(nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    console.log(
      "API HIT:",
      `${BASE_URL}/nodes/${encodeURIComponent(nodeId)}/links/incoming`
    );
    const [incomingRes, outgoingRes] = await Promise.all([
      fetch(`${BASE_URL}/nodes/${encodeURIComponent(nodeId)}/links/incoming`),
      fetch(`${BASE_URL}/nodes/${encodeURIComponent(nodeId)}/links/outgoing`),
    ]);

    const incoming = incomingRes.ok ? await incomingRes.json() : [];
    const outgoing = outgoingRes.ok ? await outgoingRes.json() : [];

    return { incoming, outgoing };
  } catch (err) {
    console.error("Error fetching links:", err);
    return { incoming: [], outgoing: [] };
  }
}

/**
 * Fetch a node and all its immediate input nodes, returning
 * nodes and edges suitable for React Flow.
 */
export async function fetchGraphByNodeId(nodeId) {
  const rootNodeRaw = await fetchNodeById(nodeId);
  const rootNode = rootNodeRaw.data.nodes[0];
  if (!rootNode) return { nodes: [], edges: [] };

  const { incoming, outgoing } = await fetchLinks(nodeId);
  const linksIn = incoming?.data?.incoming || [];
  const linksOut = outgoing?.data?.outgoing || [];

  console.log("RN", rootNode);

  const allNodes = [
    {
      id: rootNode.uuid,
      data: {
        label: rootNode.node_type.split(".").filter(Boolean).pop(),
        node_type: rootNode.node_type,
        pos: "center",
        aiida: rootNode,
      },
    },
    ...linksIn.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: "input",
        aiida: l,
      },
    })),
    ...linksOut.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: "output",
        aiida: l,
      },
    })),
  ];

  const { nodes, edges } = layoutGraphWithEdges(
    allNodes.find((n) => n.data.pos === "center"),
    allNodes.filter((n) => n.data.pos === "input"),
    allNodes.filter((n) => n.data.pos === "output")
  );

  return { nodes, edges };
}
