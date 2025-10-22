import { layoutGraphDefault } from "./FlowChart/graphController";

// --------------------------
// Toplevel api hits (run and done)
// --------------------------

/**
 * Generic fetch runner with logging
 * @param {string} url - The full endpoint URL
 * @param {object} [options] - Fetch options (method, headers, body, etc.)
 * @param {*} [defaultValue=null] - Value to return if fetch fails
 * @returns {Promise<*>} - Resolves to the JSON response or defaultValue
 */
export async function fetchGeneric(url, options = {}, defaultValue = null) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      console.warn(`Fetch failed for ${url} with status ${res.status}`);
      return defaultValue;
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return defaultValue;
  }
}

// --------------------------
// TOP LEVEL API HITS
// based solely on restApiUrl so should only need to be ran once...
// --------------------------
export async function fetchUsers(restApiUrl) {
  const url = `${restApiUrl}/users/`;
  const resp = await fetchGeneric(url, {}, { data: [] });
  return resp.data;
}

export async function fetchDownloadFormats(restApiUrl) {
  const url = `${restApiUrl}/nodes/download_formats/`;
  const resp = await fetchGeneric(url, {}, { data: [] });
  return resp.data;
}

// Unused as hard-coded for now...
export async function fetchAPIFullTypes(restApiUrl) {
  const url = `${restApiUrl}/nodes/full_types`;
  return fetchGeneric(url, {}, { data: null });
}

export async function fetchGroups(restApiUrl) {
  const url = `${restApiUrl}/groups`;
  const result = await fetchGeneric(url, {}, { data: { groups: [] } });

  return result?.data?.groups || [];
}

// -------------------------
// query builder requires a POST and doesnt use the helper.
// --------------------------
export async function fetchFromQueryBuilder(restApiUrl, postMsg) {
  try {
    const res = await fetch(`${restApiUrl}/querybuilder/`, {
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
// NODE API HITS
// --------------------------

// fetch a simple node by ID
export async function fetchNodeById(restApiUrl, nodeId) {
  if (!nodeId) return null;
  const url = `${restApiUrl}/nodes/${encodeURIComponent(nodeId)}`;
  return fetchGeneric(url);
}

// fetch common node contents (attributes, comments, extras, derived_properties)
export async function fetchNodeContents(restApiUrl, nodeId) {
  if (!nodeId) return null;

  const endpoints = ["attributes", "comments", "extras", "derived_properties"];
  const results = {};

  for (const ep of endpoints) {
    // build url from ep
    const url = `${restApiUrl}/nodes/${encodeURIComponent(nodeId)}/contents/${ep}`;
    const data = await fetchGeneric(url, {}, {}); // if missing set to {}

    if (data) {
      // Safely extract the nested property if it exists
      results[ep] = data?.data?.[ep] ?? data;
    } else {
      results[ep] = {};
    }
  }

  return results;
}

export async function fetchNodeRepoList(restApiUrl, nodeId) {
  if (!nodeId) return [];

  const url = `${restApiUrl}/nodes/${encodeURIComponent(nodeId)}/repo/list`;
  const repoFiles = await fetchGeneric(url, {}, { data: { repo_list: [] } });

  if (!repoFiles?.data?.repo_list) return [];

  return repoFiles.data.repo_list
    .filter((f) => f.type === "FILE")
    .map((file) => ({
      name: file.name,
      downloadUrl: `${restApiUrl}/nodes/${encodeURIComponent(
        nodeId
      )}/repo/contents?filename="${encodeURIComponent(file.name)}"`,
    }));
}

// helper: Gets the UUID of the Retrieved outgoing link...
export async function fetchRetrievedUUID(restApiUrl, nodeId) {
  if (!nodeId) return null;

  const url = `${restApiUrl}/nodes/${encodeURIComponent(nodeId)}/links/outgoing/`;
  const data = await fetchGeneric(url, {}, { data: { outgoing: [] } });

  const nodes = data?.data?.outgoing || [];
  const retrievedNode = nodes.find((n) => n.link_label === "retrieved");

  return retrievedNode?.uuid || null;
}

// calcJobs have a special endpoint (input_files/output_files)
// annoyingly this calcjob node has information about the retrieved files but no information about the node they were retrieved from...
// as a result this method relies on a retrievedNodeID...
export async function fetchFiles(restApiUrl, nodeId, retrievedNodeId) {
  if (!nodeId) return null;

  const endpoints = ["input_files", "output_files"];
  const results = {};

  for (const ep of endpoints) {
    const url = `${restApiUrl}/calcjobs/${encodeURIComponent(nodeId)}/${ep}`;
    const json = await fetchGeneric(url, {}, { data: [] });

    // Safely extract the files array
    const files = Array.isArray(json.data?.[ep])
      ? json.data[ep]
      : Array.isArray(json.data)
        ? json.data
        : [];

    const repoNodeId = ep === "input_files" ? nodeId : retrievedNodeId;

    const processedFiles = files
      .filter((f) => f.type === "FILE")
      .map((file) => ({
        ...file,
        downloadUrl: `${restApiUrl}/nodes/${encodeURIComponent(
          repoNodeId
        )}/repo/contents?filename="${encodeURIComponent(file.name)}"`,
      }));

    results[ep] = processedFiles;
  }

  return results;
}

export async function fetchJson(restApiUrl, nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  const url = `${restApiUrl}/nodes/${encodeURIComponent(nodeId)}/download?download_format=json`;
  const json = await fetchGeneric(url, {}, { incoming: [], outgoing: [] });

  return json;
}

export async function fetchCif(restApiUrl, nodeId) {
  if (!nodeId) return { cifText: null };

  const url = `${restApiUrl}/nodes/${encodeURIComponent(
    nodeId
  )}/download?download_format=cif&download=false`;

  const result = await fetchGeneric(
    url,
    {},
    { data: { download: { data: null } } }
  );
  const cifText = result?.data?.download?.data || null;

  return { cifText };
}

// CalcJob Special endpoint...
export async function fetchSourceFile(restApiUrl, nodeId) {
  if (!nodeId) return { sourceFile: null };

  try {
    const res = await fetch(
      `${restApiUrl}/nodes/${encodeURIComponent(
        nodeId
      )}/repo/contents?filename=source_file`
    );

    if (!res.ok) return { sourceFile: null };

    const fileText = await res.text();

    return { sourceFile: fileText };
  } catch (err) {
    console.error("Error fetching node:", err);
    return { sourceFile: null };
  }
}

// --------------------------
// node connection hits are here.
// TODO - these can maybe be moved into a different place or modularised.
// --------------------------

// get all links to a node (currently unpaginated)
export async function fetchLinks(restApiUrl, nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    const [incomingRes, outgoingRes] = await Promise.all([
      fetch(`${restApiUrl}/nodes/${encodeURIComponent(nodeId)}/links/incoming`),
      fetch(`${restApiUrl}/nodes/${encodeURIComponent(nodeId)}/links/outgoing`),
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
// TODO - check if there is a nice query builder version of this.
export async function fetchLinkCounts(restApiUrl, nodes = []) {
  if (!nodes.length) return nodes;

  try {
    const updatedNodes = await Promise.all(
      nodes.map(async (node) => {
        // Skip fetch if parent/child counts already exist
        if (
          typeof node?.data?.parentCount === "number" &&
          typeof node?.data?.childCount === "number"
        ) {
          return node;
        }

        const { incoming, outgoing } = await fetchLinks(restApiUrl, node.id);

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
      })
    );

    return updatedNodes;
  } catch (err) {
    console.error("Error fetching next level nodes:", err);
    return nodes;
  }
}

// wrapper function that determines what to fetch based on nodetype skipping if already fetched.
// TODO - go to /api/v4/nodes/download_formats
// + could do this on restApiUrl initialisation in main app?
export async function smartFetchData(
  restApiUrl,
  node,
  cachedExtras = {},
  downloadFormats = null
) {
  // Check cache first
  const cached = cachedExtras[node.id];
  if (cached) {
    console.debug(`${node.id} data is already cached`);
    return { ...node, data: { ...node.data, ...cached } };
  }

  let updatedData = { ...node.data };

  // Lookup table for downloads
  // NOW UNUSED - download based rendering is managed solely the subcomponent
  // This means that we no longer cache potentially large data.
  const downloadFetchers = {
    // StructureData: fetchCif,
    // CifData: fetchCif,
    // BandsData: fetchJson,
    // ArrayData: fetchJson,
    // CalcFunctionNode: fetchSourceFile,
  };

  // Fetch Repolist (always)
  const fetchRepoList = async () => fetchNodeRepoList(restApiUrl, node.id);

  // Fetch extras (always)
  const extraData = await fetchNodeContents(restApiUrl, node.id);
  updatedData = { ...updatedData, ...extraData };

  // Prepare promises
  const downloadPromise = downloadFetchers[node.data.label]
    ? downloadFetchers[node.data.label](restApiUrl, node.id)
    : null;

  const repoPromise = fetchRepoList();

  // Fetch Files (special calcjob)
  let filesPromise = null;
  if (node.data.label === "CalcJobNode") {
    filesPromise = (async () => {
      let retrID = updatedData.retrievedUUID;
      if (!retrID) {
        retrID = await fetchRetrievedUUID(restApiUrl, node.id);
      }
      const files = await fetchFiles(restApiUrl, node.id, retrID);
      return { retrievedUUID: retrID, files };
    })();
  }

  // Run all promises in parallel
  const [download, repoResult, filesResult] = await Promise.all([
    downloadPromise,
    repoPromise,
    filesPromise,
  ]);

  if (download) updatedData.download = download;
  if (repoResult) updatedData.repo_list = repoResult;
  if (filesResult) updatedData = { ...updatedData, ...filesResult };

  // Add downloadByFormat if downloadFormats provided
  if (downloadFormats && node.data.node_type) {
    const typeKey = node.data.node_type.endsWith("|")
      ? node.data.node_type
      : `${node.data.node_type}|`;
    const formats = downloadFormats[typeKey] || [];
    updatedData.downloadByFormat = formats.reduce((acc, fmt) => {
      acc[fmt] = `${restApiUrl}/nodes/${encodeURIComponent(
        node.id
      )}/download?download_format=${encodeURIComponent(fmt)}`;
      return acc;
    }, {});
  }

  return { ...node, data: updatedData };
}

/**
 * Fetch a node and all its immediate input nodes, returning
 * nodes and edges suitable for React Flow.
 */
export async function fetchGraphByNodeId(restApiUrl, nodeId) {
  const rootNodeRaw = await fetchNodeById(restApiUrl, nodeId);
  const rootNode = rootNodeRaw.data.nodes[0];
  if (!rootNode) return { nodes: [], edges: [] };

  const { incoming, outgoing } = await fetchLinks(restApiUrl, nodeId);

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
        parentCount: linksIn.length,
        childCount: linksOut.length,
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

  // Remove duplicates by `id`
  // TODO - for now we just set{IDs} to remove duplicates.
  // THIS IS CATATROPHIC SINCE NODES CAN BE IN MULTIPLE GRAPHS MULTIPLE TIMES.
  const nodeMap = new Map();
  for (const node of allNodes) {
    if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
  }
  const uniqueAllNodes = Array.from(nodeMap.values());

  const { nodes, edges } = layoutGraphDefault(
    uniqueAllNodes.find((n) => n.data.pos === 0),
    uniqueAllNodes.filter((n) => n.data.pos === 1),
    uniqueAllNodes.filter((n) => n.data.pos === -1)
  );

  return { nodes, edges };
}
