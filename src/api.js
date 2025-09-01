const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

import { layoutGraph } from "./graphController";
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

  const allNodes = [
    {
      id: rootNode.uuid,
      data: {
        label: rootNode.label,
        node_type: rootNode.node_type,
        pos: "center",
      },
    },
    ...linksIn.map((l) => ({
      id: l.uuid,
      data: { label: l.label || l.uuid, node_type: l.node_type, pos: "input" },
    })),
    ...linksOut.map((l) => ({
      id: l.uuid,
      data: { label: l.label || l.uuid, node_type: l.node_type, pos: "output" },
    })),
  ];

  console.log(allNodes);

  const styledNodes = enhanceNodes(allNodes);

  const positionedNodes = layoutGraph(styledNodes);

  const edges = [];

  linksIn.forEach((link) => {
    edges.push({
      id: `e-${link.uuid}-${rootNode.uuid}`,
      source: link.uuid.toString(), // must match node.id
      target: rootNode.uuid.toString(), // must match node.id
      type: "smoothstep",
      style: { stroke: "green", strokeWidth: 2 },
      markerEnd: { type: "arrow", color: "green", width: 20, height: 15 },
    });
  });

  linksOut.forEach((link) => {
    edges.push({
      id: `e-${rootNode.uuid}-${link.uuid}`,
      source: rootNode.uuid.toString(), // must match node.id
      target: link.uuid.toString(), // must match node.id
      type: "smoothstep",
      style: { stroke: "orange", strokeWidth: 2 },
      markerEnd: { type: "arrow", color: "orange", width: 20, height: 15 },
    });
  });

  return { nodes: positionedNodes, edges };
}
