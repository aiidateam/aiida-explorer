const SYNTHETIC_MARKER = "_ae_";

/**
 * Generates a unique synthetic ID by appending a random suffix to the UUID.
 * This ensures React Flow can handle duplicate nodes in the same graph.
 *
 * @param {string} uuid - The original node UUID
 * @returns {string} Synthetic unique ID
 */
export function generateSyntheticId(uuid) {
  if (typeof uuid !== "string") return uuid;
  const randomSuffix = Math.random().toString(36).substring(2, 6); // 4 chars
  return `${uuid}${SYNTHETIC_MARKER}${randomSuffix}`;
}

/**
 * Strips the synthetic marker from a string, returning the string without.
 *
 * @param {string} id - The synthetic ID
 * @returns {string} Original UUID (or input if no marker)
 */
export function stripSyntheticId(input) {
  if (typeof input !== "string") return input;
  const regex = new RegExp(`(${SYNTHETIC_MARKER}[a-z0-9]+)`, "gi");
  return input.replace(regex, "");
}

// --------------------------
// Toplevel api hits (run and done)
// --------------------------

/**
 * Generic fetch runner with logging
 * @param {string} url - endpoint URL with or without SyntheticID
 * @param {object} [options] - Fetch options (method, headers, body, etc.)
 * @param {*} [defaultValue=null] - Value to return if fetch fails
 * @returns {Promise<*>} - Resolves to the JSON response or defaultValue
 */
export async function fetchGeneric(url, options = {}, defaultValue = null) {
  const cleanedUrl = stripSyntheticId(url);
  try {
    // Strip synthetic ID marker if present in URL

    const res = await fetch(cleanedUrl, options);

    if (!res.ok) {
      console.warn(`Fetch failed for ${cleanedUrl} with status ${res.status}`);
      return defaultValue;
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${cleanedUrl} - `, err);
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
// TODO - add this to the groupsviewer
// can hopefully fetch fully async and update the recursive data structure when ready.
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
// NODE GROUPS
// --------------------------

/**
 * Fetch all groups that a node belongs to.
 *
 * Uses `uuid: {"like": "PREFIX%"}` instead of `uuid: {"eq": ...}` because
 * the AiiDA REST API returns 500 on `eq` filters inside join queries.
 *
 * @param {string} restApiUrl
 * @param {string} uuid
 * @returns {Promise<Array<{label: string, type_string: string}>>}
 */
export async function fetchNodeGroups(restApiUrl, uuid) {
  if (!restApiUrl || !uuid) return [];
  const prefix = uuid.split("-")[0];
  const query = {
    path: [
      {
        entity_type: "",
        orm_base: "node",
        tag: "node",
        joining_keyword: null,
        joining_value: null,
        edge_tag: null,
        outerjoin: false,
      },
      {
        entity_type: "group.core",
        orm_base: "group",
        tag: "g",
        joining_keyword: "with_node",
        joining_value: "node",
        edge_tag: "e",
        outerjoin: false,
      },
    ],
    filters: {
      node: { uuid: { like: `${prefix}%` } },
      g: { type_string: { like: "%" } },
      e: {},
    },
    project: { g: ["label", "type_string"], node: ["uuid"], e: [] },
    project_map: {},
    order_by: [],
    limit: 100,
    offset: 0,
    distinct: true,
  };

  const result = await fetchFromQueryBuilder(restApiUrl, query);
  const groups = result.g || [];
  const nodes = result.node || [];

  // The result arrays are parallel — pair them and filter to exact UUID match
  // Exclude import groups (e.g. "core.import") as they are auto-generated noise
  return groups
    .filter((g, i) => nodes[i]?.uuid === uuid && !g.type_string?.startsWith("core.import"))
    .map((g) => ({ label: g.label, type_string: g.type_string }));
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
  const cleanId = stripSyntheticId(nodeId); // remove marker

  const url = `${restApiUrl}/nodes/${encodeURIComponent(cleanId)}/repo/list`;
  const repoFiles = await fetchGeneric(url, {}, { data: { repo_list: [] } });

  if (!repoFiles?.data?.repo_list) return [];

  return repoFiles.data.repo_list
    .filter((f) => f.type === "FILE")
    .map((file) => ({
      name: file.name,
      downloadUrl: `${restApiUrl}/nodes/${encodeURIComponent(
        cleanId,
      )}/repo/contents?filename="${encodeURIComponent(file.name)}"`,
    }));
}

// helper: Gets the UUID of the Retrieved outgoing link...
export async function fetchRetrievedUUID(restApiUrl, nodeId) {
  if (!nodeId) return null;
  const cleanId = stripSyntheticId(nodeId); // remove marker

  const url = `${restApiUrl}/nodes/${encodeURIComponent(cleanId)}/links/outgoing/`;
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
  const cleanId = stripSyntheticId(nodeId); // remove marker

  const endpoints = ["input_files", "output_files"];
  const results = {};

  for (const ep of endpoints) {
    const url = `${restApiUrl}/calcjobs/${encodeURIComponent(cleanId)}/${ep}`;
    const json = await fetchGeneric(url, {}, { data: [] });

    // Safely extract the files array
    const files = Array.isArray(json.data?.[ep])
      ? json.data[ep]
      : Array.isArray(json.data)
        ? json.data
        : [];

    const repoNodeId = ep === "input_files" ? nodeId : retrievedNodeId;
    const cleanRepoNodeId = stripSyntheticId(repoNodeId);

    const processedFiles = files
      .filter((f) => f.type === "FILE")
      .map((file) => ({
        ...file,
        downloadUrl: `${restApiUrl}/nodes/${encodeURIComponent(
          cleanRepoNodeId,
        )}/repo/contents?filename="${encodeURIComponent(file.name)}"`,
      }));

    results[ep] = processedFiles;
  }

  return results;
}

// --------------------------
// node connection hits are here.
// TODO - these can maybe be moved into a different place or modularised.
// --------------------------

// get all links to a node (currently unpaginated)
export async function fetchLinks(restApiUrl, nodeId) {
  if (!nodeId) return { incoming: [], outgoing: [] };

  try {
    const encodedId = encodeURIComponent(nodeId);

    const [incoming, outgoing] = await Promise.all([
      fetchGeneric(`${restApiUrl}/nodes/${encodedId}/links/incoming`, {}, []),
      fetchGeneric(`${restApiUrl}/nodes/${encodedId}/links/outgoing`, {}, []),
    ]);

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
      }),
    );

    return updatedNodes;
  } catch (err) {
    console.error("Error fetching next level nodes:", err);
    return nodes;
  }
}

// wrapper function that determines what to fetch based on nodetype skipping if already fetched.
export async function smartFetchData(restApiUrl, node, downloadFormats = null) {
  let updatedData = { ...node.data };

  // Fetch Repolist (always)
  const fetchRepoList = async () => fetchNodeRepoList(restApiUrl, node.id);

  // Fetch extras (always)
  const extraData = await fetchNodeContents(restApiUrl, node.id);
  updatedData = { ...updatedData, ...extraData };

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
  const [repoResult, filesResult] = await Promise.all([
    repoPromise,
    filesPromise,
  ]);

  if (repoResult) updatedData.repo_list = repoResult;
  if (filesResult) updatedData = { ...updatedData, ...filesResult };

  // Add downloadByFormat if downloadFormats provided
  const cleanId = stripSyntheticId(node.id); // remove marker
  if (downloadFormats && node.data.node_type) {
    const typeKey = node.data.node_type.endsWith("|")
      ? node.data.node_type
      : `${node.data.node_type}|`;
    const formats = downloadFormats[typeKey] || [];
    updatedData.downloadByFormat = formats.reduce((acc, fmt) => {
      acc[fmt] = `${restApiUrl}/nodes/${encodeURIComponent(
        cleanId,
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
/**
 * Builds a ReactFlow node object for a linked AiiDA node (no layout).
 * @param {object} link - linked node record ({ uuid, node_type, link_label })
 * @param {number} pos - 1 = input (left), -1 = output (right), 0 = center
 */
export function buildGraphNode(link, pos) {
  return {
    id: generateSyntheticId(link.uuid),
    aiidaUUID: link.uuid,
    data: {
      label: link.node_type.split(".").filter(Boolean).pop(),
      node_type: link.node_type,
      pos,
      link_label: link.link_label,
      aiida: link,
    },
  };
}

/**
 * Fetches a node's neighbourhood without laying anything out.
 * @returns {{ rootNode, linksIn, linksOut }}
 */
export async function fetchNeighbourhood(restApiUrl, nodeId) {
  const rootNodeRaw = await fetchNodeById(restApiUrl, nodeId);
  const rootNode = rootNodeRaw.data.nodes[0];
  if (!rootNode) return null;

  const { incoming, outgoing } = await fetchLinks(restApiUrl, nodeId);

  return {
    rootNode,
    linksIn: incoming?.data?.incoming || [],
    linksOut: outgoing?.data?.outgoing || [],
  };
}

/**
 * Builds the center (root) node object for a fresh navigation.
 */
export function buildCenterNode(
  rootNode,
  parentCount,
  childCount,
  position = { x: 0, y: 0 },
) {
  return {
    id: generateSyntheticId(rootNode.uuid),
    aiidaUUID: rootNode.uuid,
    position,
    data: {
      label: rootNode.node_type.split(".").filter(Boolean).pop(),
      node_type: rootNode.node_type,
      pos: 0,
      aiida: rootNode,
      parentCount,
      childCount,
    },
  };
}
