const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

import { layoutGraphWithEdges } from "./graphController";
import { enhanceNodes } from "./nodeController";

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

export async function fetchLinks(nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
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
      },
    },
    ...linksIn.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: "input",
      },
    })),
    ...linksOut.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: "output",
      },
    })),
  ];

  console.log(allNodes);

  const styledNodes = enhanceNodes(allNodes);

  const { nodes, edges } = layoutGraphWithEdges(
    styledNodes.find((n) => n.data.pos === "center"),
    styledNodes.filter((n) => n.data.pos === "input"),
    styledNodes.filter((n) => n.data.pos === "output")
  );

  return { nodes, edges };
}
