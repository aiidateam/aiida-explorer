// Base AIIDA TYPES HIERACHY
// TODO, use the full_types method to get the subset of these.
// TODO move to a utility file
export const aiidaTypes = [
  {
    label: "Data",
    type: "data",
    children: [
      { label: "Int", type: "data.core.int.%" },
      { label: "Float", type: "data.core.float.%" },
      {
        label: "ArrayData",
        type: "data.core.array.%",
        children: [
          { label: "BandsData", type: "data.core.array.bands.%" },
          { label: "XyData", type: "data.core.array.xy.%" },
          { label: "TrajectoryData", type: "data.core.array.trajectory.%" },
          { label: "KpointsData", type: "data.core.array.kpoints.%" },
        ],
      },
      { label: "Str", type: "data.core.str.%" },
      { label: "Bool", type: "data.core.bool.%" },
      { label: "List", type: "data.core.list.%" },
      { label: "Dict", type: "data.core.dict.%" },
      { label: "StructureData", type: "data.core.structure.%" },
      { label: "RemoteData", type: "data.core.remote.%" },
      { label: "FolderData", type: "data.core.folder.%" },
      { label: "SinglefileData", type: "data.core.singlefile.%" },
      { label: "UpfData", type: "data.core.upf.%" },
      { label: "Code", type: "data.core.code.%" },
    ],
  },
  {
    label: "Process",
    type: "process.%",
    children: [
      { label: "CalcJob", type: "process.calculation.calcjob.%" },
      { label: "CalcFunction", type: "process.calculation.calcfunction.%" },
      { label: "WorkFunction", type: "process.workflow.workfunction.%" },
      { label: "Workgraph", type: "process.workflow.workgraph.%" },
      { label: "Workchain", type: "process.workflow.workchain.%" },
    ],
  },
];

/**
 * Recursively collect all node types for the selected labels
 * @param {string[]} selectedLabels - selected type labels
 * @param {Array} typesHierarchy - full hierarchy (aiidaTypes)
 * @returns {string[]} flattened list of type strings
 */
export function getFlattenedNodeTypes(selectedLabels, typesHierarchy) {
  const result = [];

  const traverse = (nodes) => {
    nodes.forEach((n) => {
      if (selectedLabels.includes(n.label)) {
        result.push(n.type);
        if (n.children) traverse(n.children);
      } else if (n.children) {
        traverse(n.children);
      }
    });
  };

  traverse(typesHierarchy);
  return result;
}

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
