// Fetching of data and graph network building controlled here.
import { layoutGraphWithEdges } from "./FlowChart/graphController";

// TODO move this to the APP scope to allow easy api changing.
const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

// --------------------------
// standard api hits are here
// --------------------------

// get a simple printout of a node.
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

// get the content of a node.
export async function fetchNodeContents(nodeId) {
  if (!nodeId) return null;

  const endpoints = ["attributes", "comments", "extras", "derived_properties"];

  try {
    const results = await Promise.all(
      endpoints.map(async (ep) => {
        const res = await fetch(
          `${BASE_URL}/nodes/${encodeURIComponent(nodeId)}/contents/${ep}`,
        );
        if (!res.ok) return null;
        return res.json();
      }),
    );

    // for now we fetch all these regardless of data type.
    // TODO - improve this logic to only fetch whats needed for each node?
    const [attributesRes, commentsRes, extrasRes, derivedPropertiesRes] =
      results;

    return {
      attributes: attributesRes?.data?.attributes ?? attributesRes ?? {},
      comments: commentsRes?.data?.comments ?? commentsRes ?? {},
      extras: extrasRes?.data?.extras ?? extrasRes ?? {},
      derived_properties: derivedPropertiesRes?.data?.derived_properties ?? {},
    };
  } catch (err) {
    console.error("Error fetching node contents:", err);
    return null;
  }
}

// --------------------------
// defined datatype api hits are here
// --------------------------
export async function fetchJson(nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    const res = await fetch(
      `${BASE_URL}/nodes/${encodeURIComponent(
        nodeId,
      )}/download?download_format=json`,
    );

    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
}

export async function fetchCif(nodeId) {
  if (!nodeId) return { cifText: null };

  try {
    const res = await fetch(
      `${BASE_URL}/nodes/${encodeURIComponent(
        nodeId,
      )}/download?download_format=cif&download=false`,
    );

    if (!res.ok) return { cifText: null };

    const result = await res.json();

    const cifText = result.data.download.data || null;

    return { cifText };
  } catch (err) {
    console.error("Error fetching node:", err);
    return { cifText: null };
  }
}

// --------------------------
// node connection hits are here.
// --------------------------

// get all links to a node (currently unpaginated)
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
    allNodes.filter((n) => n.data.pos === "output"),
  );

  return { nodes, edges };
}
