import { Position } from "reactflow";

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
  const calculations = nodes
    .filter((n) => n.data?.node_type.includes("calculation"))
    .sort(sortByCtimeDescending);

  const workflow = nodes
    .filter((n) => n.data?.node_type.includes("workflow"))
    .sort(sortByCtimeDescending);

  const data = nodes
    .filter((n) => n.data?.node_type.includes("data"))
    .sort(sortByLabel);

  return { calculations, workflow, data };
}
