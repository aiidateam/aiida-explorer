import { Position } from "reactflow";

import { categorizeNodes } from "./layoutUtils";

export function layoutGraphDefault(
  centerNode,
  inputNodes,
  outputNodes,
  lastNode = null,
  options = {}
) {
  const {
    spacingX = 280,
    spacingY = 70,
    groupGapY = 90,
    centerX = window.innerWidth / 2,
    centerY = window.innerHeight / 2,
    smallThreshold = 20, // total nodes below this count use "small" mode
  } = options;

  const nodes = [];
  let edges = [];

  const inputs = categorizeNodes(inputNodes);
  const outputs = categorizeNodes(outputNodes);

  const layoutGroupOrders = {
    data: ["calculation", "workflow", "data"],
    calculation: ["data", "calculation", "workflow"],
    workflow: ["data", "calculation", "workflow"],
  };

  const centerType = centerNode.data?.node_type.split(".")[1];
  const order = layoutGroupOrders[centerType] || layoutGroupOrders["data"];

  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  // Merge inputs and outputs to get total node count
  const totalNodes = order.flatMap((g) => [
    ...(inputs[g] || []),
    ...(outputs[g] || []),
  ]).length;

  const smallMode = totalNodes <= smallThreshold;

  const layoutGroup = (
    groupNodes,
    startY,
    directionX,
    stackDownward = true
  ) => {
    (groupNodes || []).forEach((node, i) => {
      const y = stackDownward ? startY + i * spacingY : startY - i * spacingY;
      const x = centerX + spacingX * directionX;

      node.position = { x, y };
      nodes.push(node);

      // Determine link label
      let linkLabel = "";
      if (node?.data?.aiida?.link_label) {
        const rawLabel = node.data.aiida.link_label;
        linkLabel =
          rawLabel.length > 21 ? `${rawLabel.slice(0, 18)}...` : rawLabel;
      }

      const style = {};
      const type = node.data?.node_type || "";

      // render dashed if workflow or processnode.
      if (type.includes("workflow") || type.includes("process")) {
        style.strokeDasharray = "5,5"; // dashed for workflow/process
      }

      edges.push({
        id: `e-${directionX < 0 ? node.id + "->" : centerNode.id + "->"}${
          directionX < 0 ? centerNode.id : node.id
        }`,
        source: directionX < 0 ? node.id : centerNode.id,
        target: directionX < 0 ? centerNode.id : node.id,
        sourcePosition: directionX < 0 ? "right" : "left",
        targetPosition: directionX < 0 ? "left" : "right",
        type: "custom",
        style: style,
        data: {
          label: linkLabel,
          labelPosition: directionX < 0 ? "start" : "end",
        },
      });
    });
  };

  if (smallMode) {
    // Flatten all groups into a single side stack.
    const leftStack = order.flatMap((g) => inputs[g] || []).reverse();
    const rightStack = order.flatMap((g) => outputs[g] || []).reverse();

    // Compute startY for each side independently
    const startYLeft = centerY - ((leftStack.length - 1) / 2) * spacingY;
    const startYRight = centerY - ((rightStack.length - 1) / 2) * spacingY;

    // Layout consecutively
    leftStack.forEach((node, i) =>
      layoutGroup([node], startYLeft + i * spacingY, -1, true)
    );
    rightStack.forEach((node, i) =>
      layoutGroup([node], startYRight + i * spacingY, +1, true)
    );
  } else {
    // --- Large mode: primary downward, secondary upward ---
    const primaryInput = inputs[order[0]] || [];
    const primaryOutput = outputs[order[0]] || [];

    const secondaryNames = order.slice(1, 3);
    const secondaryInput = secondaryNames.flatMap((g) => inputs[g] || []);
    const secondaryOutput = secondaryNames.flatMap((g) => outputs[g] || []);

    const startYPrimary = centerY - 175;
    layoutGroup(primaryInput, startYPrimary, -1, true);
    layoutGroup(primaryOutput, startYPrimary, +1, true);

    const startYSecondary = startYPrimary - groupGapY;
    layoutGroup(secondaryInput, startYSecondary, -1, false);
    layoutGroup(secondaryOutput, startYSecondary, +1, false);
  }

  // TODO - move this above, so that the coloring happens on synthesis.
  // also could change the edge
  // update the array list to render last node - next node nicely.
  // this is currently bad - it rechecks the whole array.
  if (lastNode) {
    const highlightedEdges = [];
    const normalEdges = [];

    edges.forEach((edge) => {
      const connectsLastAndCenter =
        (edge.source.startsWith(lastNode.aiidaUUID) &&
          edge.target.startsWith(centerNode.aiidaUUID)) ||
        (edge.source.startsWith(centerNode.aiidaUUID) &&
          edge.target.startsWith(lastNode.aiidaUUID));

      if (connectsLastAndCenter) {
        edge.data.labelOverride = true;

        edge.style = {
          stroke: "blue",
          strokeWidth: 2.5,
          strokeDasharray: "",
        };
        highlightedEdges.push(edge);
      } else {
        normalEdges.push(edge);
      }
    });

    // highlight last for better appearance.
    edges = [...normalEdges, ...highlightedEdges];
  }

  return { nodes, edges };
}
