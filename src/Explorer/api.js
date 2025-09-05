// Fetching of data and graph network building controlled here.
import {
  layoutGraphDefault,
  layoutGraphFan,
  layoutGraphStaircase,
} from "./FlowChart/graphController";

// TODO move this to the APP scope to allow easy api changing.
const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

// --------------------------
// standard api hits are here
// --------------------------

// get a simple printout of a node.
export async function fetchNodeById(baseUrl, nodeId) {
  if (!nodeId) return null;

  try {
    const res = await fetch(`${baseUrl}/nodes/${encodeURIComponent(nodeId)}`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
}

// get the content of a node.
export async function fetchNodeContents(baseUrl, nodeId) {
  if (!nodeId) return null;

  const endpoints = ["attributes", "comments", "extras", "derived_properties"];
  const results = {};

  for (const ep of endpoints) {
    try {
      const res = await fetch(
        `${baseUrl}/nodes/${encodeURIComponent(nodeId)}/contents/${ep}`,
      );

      if (!res.ok) {
        if (res.status !== 404) {
          console.warn(`Endpoint ${ep} failed for node ${nodeId}:`, res.status);
        }
        continue; // skip this endpoint if not found
      }

      const data = await res.json();
      results[ep] = data?.data?.[ep] ?? data ?? {};
    } catch (err) {
      console.error(`Error fetching ${ep} for node ${nodeId}:`, err);
    }
  }

  return results;
}

// get the full_types of a root aiida API
export async function fetchAPIFullTypes(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/nodes/full_types`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
}

// --------------------------
// defined datatype api hits are here
// --------------------------
export async function fetchJson(baseUrl, nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    const res = await fetch(
      `${baseUrl}/nodes/${encodeURIComponent(
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

export async function fetchCif(baseUrl, nodeId) {
  if (!nodeId) return { cifText: null };

  try {
    const res = await fetch(
      `${baseUrl}/nodes/${encodeURIComponent(
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

export async function fetchGroups(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/groups`);
    if (!res.ok) return null;

    const json = await res.json();
    // Return only the array of groups
    return json?.data?.groups || [];
  } catch (err) {
    console.error("Error fetching groups:", err);
    return [];
  }
}

/// -------------------------
// query builder requires a POST
export async function fetchFromQueryBuilder(baseUrl, postMsg) {
  try {
    const res = await fetch(`${baseUrl}/querybuilder/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postMsg),
    });

    if (!res.ok) {
      console.error("QueryBuilder request failed:", res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error("Error fetching from QueryBuilder:", err);
    return [];
  }
}

// --------------------------
// node connection hits are here.
// --------------------------

// get all links to a node (currently unpaginated)
export async function fetchLinks(baseUrl, nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    const [incomingRes, outgoingRes] = await Promise.all([
      fetch(`${baseUrl}/nodes/${encodeURIComponent(nodeId)}/links/incoming`),
      fetch(`${baseUrl}/nodes/${encodeURIComponent(nodeId)}/links/outgoing`),
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
export async function fetchGraphByNodeId(baseUrl, nodeId) {
  const rootNodeRaw = await fetchNodeById(baseUrl, nodeId);
  const rootNode = rootNodeRaw.data.nodes[0];
  if (!rootNode) return { nodes: [], edges: [] };

  const { incoming, outgoing } = await fetchLinks(baseUrl, nodeId);
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
        link_label: l.link_label,
        aiida: l,
      },
    })),
    ...linksOut.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: "output",
        link_label: l.link_label,

        aiida: l,
      },
    })),
  ];

  const { nodes, edges } = layoutGraphDefault(
    allNodes.find((n) => n.data.pos === "center"),
    allNodes.filter((n) => n.data.pos === "input"),
    allNodes.filter((n) => n.data.pos === "output"),
  );

  return { nodes, edges };
}
