import { Position } from "reactflow";

import {
  arrangeDataCenterNode,
  arrangeWorkflowCenterNode,
  arrangeCalculationCenterNode,
} from "./layoutHandlers";

export function layoutGraphDefault(
  centerNode,
  inputNodes,
  outputNodes,
  options = {},
) {
  const centerType = centerNode.data?.node_type.split(".")[0];
  const centerSubType = centerNode.data?.node_type.split(".")[1];

  // three arrangers exist - this is should cover EVERY case...
  const arrangers = {
    data: arrangeDataCenterNode,
    calculation: arrangeCalculationCenterNode,
    workflow: arrangeWorkflowCenterNode,
  };

  // pick the arranger based on type or subtype
  const arranger = arrangers[centerType] || arrangers[centerSubType];

  if (!arranger) {
    console.warn(
      "No arranger found for node type:",
      centerNode.data?.node_type,
    );
    return { nodes: [centerNode], edges: [] };
  }

  return arranger(centerNode, inputNodes, outputNodes, options);
}
