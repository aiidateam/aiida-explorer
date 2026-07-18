/**
 * Categorizes an AiiDA node type string into one of the four groups.
 * @param {string} nodeType - e.g. "process.workflow.WorkChainNode", "data.core.structure.StructureData|"
 * @returns {"workflow" | "calculation" | "data" | "unknown"}
 */
export function categorizeNodeType(nodeType) {
  if (!nodeType) return "unknown";
  if (nodeType.startsWith("process.workflow")) return "workflow";
  if (nodeType.startsWith("process")) return "calculation";
  if (nodeType.startsWith("data")) return "data";
  return "unknown";
}

// helper that downloads only useful node information and not rendering information.
export function omitGraphKeys(obj) {
  const keysToRemove = ["label", "node_type", "pos", "link_label"];

  if (obj == null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => omitGraphKeys(item));
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => !keysToRemove.includes(key))
      .map(([key, value]) => [key, omitGraphKeys(value)]),
  );
}
