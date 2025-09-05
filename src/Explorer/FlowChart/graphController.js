import { Position } from "reactflow";

// TODO - refactor this to its own folder.

// Precompute priority map
const nodeTypePriority = [
  "WorkChainNode",
  "CalcFunctionNode",
  "CalcJobNode",
  "UpfData",
  "StructureData",
  "KpointsData",
  "BandsData",
  "RemoteData",
  "Dict",
  "Int",
  "Float",
  "Bool",
  "List",
  "Str",
  "Code",
];

// TODO - test where this is scoped w.r.t the client? this may be worse performance if its called repeated
const priorityMap = nodeTypePriority.reduce((acc, label, idx) => {
  acc[label] = idx;
  return acc;
}, {});

// Comparator using map (O(1) lookup)
function sortNodesByType(a, b) {
  const indexA = priorityMap[a.data.label] ?? Number.MAX_SAFE_INTEGER;
  const indexB = priorityMap[b.data.label] ?? Number.MAX_SAFE_INTEGER;
  return indexA - indexB;
}

export function layoutGraphDefault(
  centerNode,
  inputNodes,
  outputNodes,
  options = {},
) {
  const spacingX = options.spacingX || 300;
  const spacingY = options.spacingY || 80;

  const centerX = options.centerX || window.innerWidth / 2;
  const centerY = options.centerY || window.innerHeight / 2;

  const nodes = [];
  const edges = [];

  // Keep the center node intact
  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  // Sort inputs and outputs safely without mutating original arrays
  const sortedInputs = [...inputNodes].sort(sortNodesByType);
  const sortedOutputs = [...outputNodes].sort(sortNodesByType);

  // Inputs: distribute left
  sortedInputs.forEach((node, i) => {
    const offsetY = (i - (sortedInputs.length - 1) / 2) * spacingY;
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
  sortedOutputs.forEach((node, i) => {
    const offsetY = (i - (sortedOutputs.length - 1) / 2) * spacingY;
    nodes.push({
      ...node,
      position: { x: centerX + spacingX, y: centerY + offsetY },
    });

    edges.push({
      id: `e-${centerNode.id}-${node.id}`,
      source: centerNode.id,
      sourcePosition: Position.Right,
      target: node.id,
      type: "smoothstep",
      style: { stroke: "orange", strokeWidth: 2 },
      markerEnd: { type: "arrow", color: "orange", width: 20, height: 15 },
    });
  });

  return { nodes, edges };
}

// ---------- Staircase Layout ----------
export function layoutGraphStaircase(
  centerNode,
  inputNodes,
  outputNodes,
  options = {},
) {
  const spacingX = options.spacingX || 200;
  const spacingY = options.spacingY || 80;
  const centerX = options.centerX || window.innerWidth / 2;
  const centerY = options.centerY || window.innerHeight / 2;

  const nodes = [{ ...centerNode, position: { x: centerX, y: centerY } }];
  const edges = [];

  const sortedInputs = [...inputNodes].sort(sortNodesByType);
  const sortedOutputs = [...outputNodes].sort(sortNodesByType);

  // Inputs (staircase left)
  sortedInputs.forEach((node, i) => {
    nodes.push({
      ...node,
      position: { x: centerX - spacingX, y: centerY + i * spacingY },
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

  // Outputs (staircase right)
  sortedOutputs.forEach((node, i) => {
    nodes.push({
      ...node,
      position: { x: centerX + spacingX, y: centerY + i * spacingY },
    });
    edges.push({
      id: `e-${centerNode.id}-${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: "smoothstep",
      style: { stroke: "orange", strokeWidth: 2 },
      markerEnd: { type: "arrow", color: "orange", width: 20, height: 15 },
    });
  });

  return { nodes, edges };
}

/**
 * Fan-style layout: nodes radiate from center like spider legs.
 * need to add pagination to make this style really pop...
 */
export function layoutGraphFan(
  centerNode,
  inputNodes,
  outputNodes,
  options = {},
) {
  const radius = options.radius ?? 350;
  const maxAngle = options.maxAngle ?? Math.PI / 1.5; // 60 degrees spread
  const centerX = options.centerX ?? window.innerWidth / 2;
  const centerY = options.centerY ?? window.innerHeight / 2;

  const nodes = [];
  const edges = [];

  // Center node
  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  // --- SORT NODES BY TYPE PRIORITY ---
  const sortedInputs = [...inputNodes].sort(sortNodesByType);
  const sortedOutputs = [...outputNodes].sort(sortNodesByType);

  function fanNodes(nodesArray, side = "left") {
    const total = nodesArray.length;
    if (total === 0) return;

    const startAngle = -maxAngle / 2;
    const endAngle = maxAngle / 2;
    const angles = nodesArray.map((_, i) =>
      total === 1
        ? 0
        : startAngle + (i / (total - 1)) * (endAngle - startAngle),
    );

    nodesArray.forEach((node, i) => {
      const angle = angles[i];
      const dir = side === "left" ? -1 : 1;
      const x = centerX + dir * radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      nodes.push({ ...node, position: { x, y } });

      edges.push({
        id:
          side === "left"
            ? `e-${node.id}-${centerNode.id}`
            : `e-${centerNode.id}-${node.id}`,
        source: side === "left" ? node.id : centerNode.id,
        target: side === "left" ? centerNode.id : node.id,
        sourcePosition: side === "left" ? Position.Right : Position.Right,
        targetPosition: side === "left" ? Position.Left : Position.Left,
        type: "smoothstep",
        style: { stroke: side === "left" ? "green" : "orange", strokeWidth: 2 },
        markerEnd: {
          type: "arrow",
          color: side === "left" ? "green" : "orange",
          width: 20,
          height: 15,
        },
      });
    });
  }

  fanNodes(sortedInputs, "left");
  fanNodes(sortedOutputs, "right");

  return { nodes, edges };
}
