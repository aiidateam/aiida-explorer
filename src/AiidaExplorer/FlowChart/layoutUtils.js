import { Position } from "reactflow";

import { categorizeNodeType } from "../utils";

// --- Categorize and sort helper ---
export function sortByCtimeDescending(a, b) {
  const at = new Date(a?.data?.aiida?.ctime || 0);
  const bt = new Date(b?.data?.aiida?.ctime || 0);
  return bt - at;
}

export function sortByLabel(a, b) {
  return (a?.data?.label || "").localeCompare(b?.data?.label || "");
}

export function categorizeNodes(nodes) {
  const calculation = nodes
    .filter((n) => categorizeNodeType(n.data?.node_type) === "calculation")
    .sort(sortByCtimeDescending);

  const workflow = nodes
    .filter((n) => categorizeNodeType(n.data?.node_type) === "workflow")
    .sort(sortByCtimeDescending);

  const data = nodes
    .filter((n) => categorizeNodeType(n.data?.node_type) === "data")
    .sort(sortByLabel);

  return { calculation, workflow, data };
}
