/**
 * Build AiiDA QueryBuilder JSON
 * @param {Object} options
 * @param {string[]} [options.groups] - optional group labels
 * @param {string[]} [options.nodeTypes] - optional array of node types
 */
export function buildQuery({
  groups = [],
  nodeTypes = [],
  limit = 50,
  offset = 0,
} = {}) {
  const path = [
    {
      entity_type: "",
      orm_base: "node",
      tag: "node",
      joining_keyword: null,
      joining_value: null,
      edge_tag: null,
      outerjoin: false,
    },
  ];

  const filters = { node: {} };

  // Project only relevant fields
  const project = {
    node: ["id", "uuid", "node_type", "label", "ctime", "mtime"],
  };

  // Handle node types
  if (nodeTypes.length === 1) {
    filters.node.node_type = { like: nodeTypes[0] };
  } else if (nodeTypes.length > 1) {
    filters.node = {
      or: nodeTypes.map((t) => ({ node_type: { like: t } })),
    };
  }

  // Handle groups
  if (groups.length > 0) {
    const tag = "core_1";
    const edgeTag = "node--core_1";

    path.push({
      entity_type: "group.core",
      orm_base: "group",
      tag,
      joining_keyword: "with_node",
      joining_value: "node",
      edge_tag: edgeTag,
      outerjoin: false,
    });

    filters[tag] = {
      type_string: { like: "%" },
      or: groups.map((g) => ({ label: g })),
    };

    filters[edgeTag] = {};

    project[tag] = [];
    project[edgeTag] = [];
  }

  return {
    path,
    filters,
    project,
    project_map: {},
    order_by: [],
    limit,
    offset,
    distinct: true,
  };
}
