import { Position } from "reactflow";

/**
 * Assign positions to nodes based on type or index.
 * Does NOT handle edges, colors, or arrows.
 * @param {Array} nodes - Array of node objects with {id, data, type}.
 * @param {Object} options - Optional layout config.
 * @returns {Array} nodes - The same nodes array with added .position
 */
export function layoutGraphWithEdges(
  centerNode,
  inputNodes,
  outputNodes,
  options = {}
) {
  const spacingX = options.spacingX || 200;
  const spacingY = options.spacingY || 80;

  const centerX = options.centerX || window.innerWidth / 2;
  const centerY = options.centerY || window.innerHeight / 2;

  const nodes = [];
  const edges = [];

  // Center node
  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  // sort the nodes
  inputNodes.sort((a, b) => Number(a.id) - Number(b.id));
  outputNodes.sort((a, b) => Number(a.id) - Number(b.id));

  // Inputs: distribute left
  inputNodes.forEach((node, i) => {
    const offsetY = (i - (inputNodes.length - 1) / 2) * spacingY;
    nodes.push({
      ...node,
      position: { x: centerX - spacingX, y: centerY + offsetY },
    });

    edges.push({
      id: `e-${node.id}-${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: "smoothstep",
      style: { stroke: "green", strokeWidth: 2 },
      markerEnd: { type: "arrow", color: "green", width: 20, height: 15 },
    });
  });

  // Outputs: distribute right
  outputNodes.forEach((node, i) => {
    const offsetY = (i - (outputNodes.length - 1) / 2) * spacingY;
    nodes.push({
      ...node,
      position: { x: centerX + spacingX, y: centerY + offsetY },
    });

    edges.push({
      id: `e-${centerNode.id}-${node.id}`,
      source: centerNode.id,
      sourcePosition: Position.Right, // connect from right side
      target: node.id,
      type: "smoothstep",
      style: { stroke: "orange", strokeWidth: 2 },
      markerEnd: { type: "arrow", color: "orange", width: 20, height: 15 },
    });
  });

  return { nodes, edges };
}
