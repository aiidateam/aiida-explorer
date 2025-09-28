import {
  layoutGraphDefault,
  layoutGraphFan,
} from "./FlowChart/graphController";

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

// fetch node repo list
export async function fetchNodeRepoList(baseUrl, nodeId) {
  if (!nodeId) return null;

  try {
    const res = await fetch(
      `${baseUrl}/nodes/${encodeURIComponent(nodeId)}/repo/list`,
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
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

// helper api hit that fetches the retrieved folder UUID for a specific node
export async function fetchRetrievedUUID(baseUrl, nodeId) {
  if (!nodeId) return null;

  try {
    const res = await fetch(
      `${baseUrl}/nodes/${encodeURIComponent(nodeId)}/links/outgoing/`,
    );
    if (!res.ok) return null;

    const data = await res.json();
    console.log("d", data);
    const nodes = data?.data?.outgoing || [];

    const retrievedNode = nodes.find((n) => n.link_label === "retrieved");
    return retrievedNode?.uuid || null;
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
}

// calcJobs have a special endpoint (input_files/output_files)
// annoyingly this calcjob node has information about the retrieved files but no information about the node they were retrieved from...
// as a result this method relies on
export async function fetchFiles(baseUrl, nodeId, retrievedNodeId) {
  if (!nodeId) return null;

  const endpoints = ["input_files", "output_files"];
  const results = {};

  for (const ep of endpoints) {
    try {
      const url = `${baseUrl}/calcjobs/${encodeURIComponent(nodeId)}/${ep}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status !== 404) {
          console.warn(`Endpoint ${ep} failed for node ${nodeId}:`, res.status);
        }
        continue;
      }

      const json = await res.json();

      // Safely extract the files array
      const files = Array.isArray(json.data?.[ep])
        ? json.data[ep]
        : Array.isArray(json.data)
          ? json.data
          : [];

      // Determine which node's repository to use
      console.log(nodeId);
      const repoNodeId = ep === "input_files" ? nodeId : retrievedNodeId;

      // Filter files and add download URL
      const processedFiles = files
        .filter((f) => f.type === "FILE")
        .map((file) => ({
          ...file,
          downloadUrl: `${baseUrl}/nodes/${encodeURIComponent(
            repoNodeId,
          )}/repo/contents?filename=%22${encodeURIComponent(file.name)}%22`,
        }));

      results[ep] = processedFiles;
    } catch (err) {
      console.error(`Error fetching ${ep} for node ${nodeId}:`, err);
    }
  }

  return results;
}

// currently unused method but is a useful way to get the contents of a file.
export async function fetchFileContents(baseUrl, nodeId, filename) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    const res = await fetch(
      `${baseUrl}/nodes/${encodeURIComponent(
        nodeId,
      )}/repo/contents?filename=${filename}`,
    );

    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching node:", err);
    return null;
  }
}

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
// TODO - these can maybe be moved into a different place or modularised.
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

// get all links to a node (currently unpaginated)
export async function fetchLinkCounts(baseUrl, nodes = []) {
  if (!nodes.length) return nodes;

  try {
    const updatedNodes = await Promise.all(
      nodes.map(async (node) => {
        const { incoming, outgoing } = await fetchLinks(baseUrl, node.id);

        const parentCount = (incoming?.data?.incoming || []).length;
        const childCount = (outgoing?.data?.outgoing || []).length;

        return {
          ...node,
          data: {
            ...node.data,
            parentCount,
            childCount,
          },
        };
      }),
    );

    return updatedNodes;
  } catch (err) {
    console.error("Error fetching next level nodes:", err);
    return nodes;
  }
}

// wrapper function that determines what to fetch based on nodetype skipping if already fetched.
// TODO - go to /api/v4/nodes/download_formats
// + inspect the types of downloads rather than hardcoding?
// + could do this on baseUrl initialisation in main app?
export async function smartFetchData(baseUrl, node, cachedExtras = {}) {
  // if the id is in the cache we dont try to refetch.
  const cached = cachedExtras[node.id];
  if (cached) {
    console.log(`${node.id} data is already cached`);
    return { ...node, data: { ...node.data, ...cached } };
  }

  // otherwise we start with a copy of node.data

  let updatedData = { ...node.data };

  // Fetch extras - these can be controlled by the user of aiida so we have to fetch them no matter what.
  // const endpoints = ["attributes", "comments", "extras", "derived_properties"];
  if (!cachedExtras[node.id]) {
    const extraData = await fetchNodeContents(baseUrl, node.id);
    updatedData = { ...updatedData, ...extraData };
  }

  // most dataTypes dont have any download method (including a json) so we skip them
  switch (node.data.label) {
    case "StructureData":
    case "CifData":
      updatedData.download = await fetchCif(baseUrl, node.id);
      break;

    case "BandsData":
    case "ArrayData":
    case "UpfData": // json only here for printing reasons. (handle filedownload in the visauliserpane)
      updatedData.download = await fetchJson(baseUrl, node.id);
      break;

    default:
      // Most data types don’t have downloads at all → skip
      break;
  }

  // Fetch repo list if missing
  switch (node.data.label) {
    case "FolderData":
    case "RemoteData":
      updatedData.repo_list = await fetchNodeRepoList(baseUrl, node.id);
      break;

    default:
      break;
  }

  // Fetch files if missing
  switch (node.data.label) {
    case "CalcJobNode":
      if (!updatedData.retrievedUUID) {
        const retrID = await fetchRetrievedUUID(baseUrl, node.id);
        updatedData = { ...updatedData, retrievedUUID: retrID };
      }
      const files = await fetchFiles(
        baseUrl,
        node.id,
        updatedData.retrievedUUID,
      );
      updatedData = { ...updatedData, files };
      break;

    default:
      // Most data types don't have files → skip
      break;
  }

  return { ...node, data: updatedData };
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

  const allNodes = [
    {
      id: rootNode.uuid,
      data: {
        label: rootNode.node_type.split(".").filter(Boolean).pop(),
        node_type: rootNode.node_type,
        pos: 0,
        aiida: rootNode,
      },
    },
    ...linksIn.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: 1,
        link_label: l.link_label,
        aiida: l,
      },
    })),
    ...linksOut.map((l) => ({
      id: l.uuid,
      data: {
        label: l.node_type.split(".").filter(Boolean).pop(),
        node_type: l.node_type,
        pos: -1,
        link_label: l.link_label,

        aiida: l,
      },
    })),
  ];

  const { nodes, edges } = layoutGraphDefault(
    allNodes.find((n) => n.data.pos === 0),
    allNodes.filter((n) => n.data.pos === 1),
    allNodes.filter((n) => n.data.pos === -1),
  );

  return { nodes, edges };
}
