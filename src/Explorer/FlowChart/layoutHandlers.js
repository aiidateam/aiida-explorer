import { Position } from "reactflow";

export function getLayoutDefaults(options) {
  return {
    spacingX: options.spacingX || 310,
    spacingY: options.spacingY || 90,
    groupGapY: options.groupGapY || 150,
    centerX: options.centerX || window.innerWidth / 2,
    centerY: options.centerY || window.innerHeight / 2,
    edgeStyle: { stroke: "grey", strokeWidth: 2 },
  };
}

function layoutDefaults(options) {
  return {
    spacingX: options.spacingX || 310,
    spacingY: options.spacingY || 90,
    groupGapY: options.groupGapY || 150,
    centerX: options.centerX || window.innerWidth / 2,
    centerY: options.centerY || window.innerHeight / 2,
    edgeStyle: { stroke: "grey", strokeWidth: 2 },
  };
}

function edgeStyleFor(node, base) {
  const t = node.data?.node_type || "";
  if (t.includes("workflow") || t.includes("process")) {
    return { ...base, strokeDasharray: "5,5" };
  }
  return base;
}

/**
 * DATA CENTER NODE
 * - Input: calc jobs inline left, workflows above them
 * - Output: calc jobs inline right, workflows above them
 */
export function arrangeDataCenterNode(
  centerNode,
  inputNodes,
  outputNodes,
  options = {}
) {
  const { spacingX, spacingY, groupGapY, centerX, centerY, edgeStyle } =
    layoutDefaults(options);

  const nodes = [];
  const edges = [];

  // Center
  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  // never more than one calc job - so no need to sort.
  const inputCalcs = inputNodes.filter((n) =>
    n.data?.node_type.includes("calculation")
  );

  // new on top
  const inputWorkflows = inputNodes
    .filter((n) => n.data?.node_type.includes("workflow"))
    .sort(
      (a, b) => new Date(b.data.aiida.ctime) - new Date(a.data.aiida.ctime)
    );

  // new on top
  const outputCalcs = outputNodes
    .filter((n) => n.data?.node_type.includes("calculation"))
    .sort(
      (a, b) => new Date(b.data.aiida.ctime) - new Date(a.data.aiida.ctime)
    );

  // new on top
  const outputWorkflows = outputNodes
    .filter((n) => n.data?.node_type.includes("workflow"))
    .sort(
      (a, b) => new Date(b.data.aiida.ctime) - new Date(a.data.aiida.ctime)
    );

  // --- INPUTS ---
  const calcStartYIn = centerY - ((inputCalcs.length - 1) / 2) * spacingY;
  inputCalcs.forEach((node, i) => {
    const y = calcStartYIn + i * spacingY;
    nodes.push({ ...node, position: { x: centerX - spacingX, y } });
    edges.push({
      id: `e-${node.id}->${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Adjust workflows if no calc nodes exist
  let adjustedGroupGapYIn = inputCalcs.length > 0 ? groupGapY : 0;

  const workflowStartYIn =
    calcStartYIn - adjustedGroupGapYIn - (inputWorkflows.length - 1) * spacingY;
  inputWorkflows.forEach((node, i) => {
    const y = workflowStartYIn + i * spacingY;
    nodes.push({ ...node, position: { x: centerX - spacingX, y } });
    edges.push({
      id: `e-${node.id}->${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // --- Outputs ---
  const calcStartYOut = centerY - ((outputCalcs.length - 1) / 2) * spacingY;
  outputCalcs.forEach((node, i) => {
    const y = calcStartYOut + i * spacingY;
    nodes.push({ ...node, position: { x: centerX + spacingX, y } });
    edges.push({
      id: `e-${centerNode.id}->${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // throw the workflows down a little bit if there is no calcs
  let adjustedGroupGapY = outputCalcs.length > 0 ? groupGapY : 0;

  let workflowStartYOut =
    calcStartYOut - adjustedGroupGapY - (outputWorkflows.length - 1) * spacingY;

  outputWorkflows.forEach((node, i) => {
    const y = workflowStartYOut + i * spacingY;
    nodes.push({ ...node, position: { x: centerX + spacingX, y } });
    edges.push({
      id: `e-${centerNode.id}->${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  return { nodes, edges };
}

/**
 * CALCULATION CENTER NODE
 * - Input: data inline left, workflows above
 * - Output: data inline right, workflows above
 */
export function arrangeCalculationCenterNode(
  centerNode,
  inputNodes,
  outputNodes,
  options = {}
) {
  const { spacingX, spacingY, groupGapY, centerX, centerY, edgeStyle } =
    layoutDefaults(options);

  const nodes = [];
  const edges = [];

  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  // sort alpha
  const inputData = inputNodes
    .filter((n) => n.data?.node_type.includes("data"))
    .sort((a, b) => a.data.label.localeCompare(b.data.label));

  // new on top.
  const inputWorkflows = inputNodes
    .filter((n) => n.data?.node_type.includes("workflow"))
    .sort(
      (a, b) => new Date(b.data.aiida.ctime) - new Date(a.data.aiida.ctime)
    );

  // sort alpha
  const outputData = outputNodes
    .filter((n) => n.data?.node_type.startsWith("data"))
    .sort((a, b) => a.data.label.localeCompare(b.data.label));

  // new on top.

  const outputWorkflows = outputNodes
    .filter((n) => n.data?.node_type.includes("workflow"))
    .sort(
      (a, b) => new Date(b.data.aiida.ctime) - new Date(a.data.aiida.ctime)
    );

  // Inputs: data inline
  const dataStartYIn = centerY - ((inputData.length - 1) / 2) * spacingY;
  inputData.forEach((node, i) => {
    const y = dataStartYIn + i * spacingY;
    nodes.push({ ...node, position: { x: centerX - spacingX, y } });
    edges.push({
      id: `e-${node.id}->${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Inputs: workflows above
  const workflowStartYIn =
    dataStartYIn - groupGapY - (inputWorkflows.length - 1) * spacingY;
  inputWorkflows.forEach((node, i) => {
    const y = workflowStartYIn + i * spacingY;
    nodes.push({ ...node, position: { x: centerX - spacingX, y } });
    edges.push({
      id: `e-${node.id}->${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Outputs: data inline
  const dataStartYOut = centerY - ((outputData.length - 1) / 2) * spacingY;
  outputData.forEach((node, i) => {
    const y = dataStartYOut + i * spacingY;
    nodes.push({ ...node, position: { x: centerX + spacingX, y } });
    edges.push({
      id: `e-${centerNode.id}->${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Outputs: workflows above
  const workflowStartYOut =
    dataStartYOut - groupGapY - (outputWorkflows.length - 1) * spacingY;
  outputWorkflows.forEach((node, i) => {
    const y = workflowStartYOut + i * spacingY;
    nodes.push({ ...node, position: { x: centerX + spacingX, y } });
    edges.push({
      id: `e-${centerNode.id}->${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  return { nodes, edges };
}

/**
 * WORKFLOW CENTER NODE
 * - Input: data inline left, processes (calc + workflow) above
 * - Output: data inline right, processes above
 */
export function arrangeWorkflowCenterNode(
  centerNode,
  inputNodes,
  outputNodes,
  options = {}
) {
  const { spacingX, spacingY, groupGapY, centerX, centerY, edgeStyle } =
    layoutDefaults(options);

  const nodes = [];
  const edges = [];

  nodes.push({ ...centerNode, position: { x: centerX, y: centerY } });

  const inputData = inputNodes.filter((n) =>
    n.data?.node_type.startsWith("data")
  );
  const inputProcesses = inputNodes.filter((n) =>
    ["calculation", "workflow", "process"].includes(
      n.data?.node_type.split(".")[1]
    )
  );

  const outputData = outputNodes.filter((n) =>
    n.data?.node_type.startsWith("data")
  );
  const outputProcesses = outputNodes.filter((n) =>
    ["calculation", "workflow", "process"].includes(
      n.data?.node_type.split(".")[1]
    )
  );

  // Inputs: data inline
  const dataStartYIn = centerY - ((inputData.length - 1) / 2) * spacingY;
  inputData.forEach((node, i) => {
    const y = dataStartYIn + i * spacingY;
    nodes.push({ ...node, position: { x: centerX - spacingX, y } });
    edges.push({
      id: `e-${node.id}->${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Inputs: processes above
  const groupStartYIn =
    dataStartYIn - groupGapY - (inputProcesses.length - 1) * spacingY;
  inputProcesses.forEach((node, i) => {
    const y = groupStartYIn + i * spacingY;
    nodes.push({ ...node, position: { x: centerX - spacingX, y } });
    edges.push({
      id: `e-${node.id}->${centerNode.id}`,
      source: node.id,
      target: centerNode.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Outputs: data inline
  const dataStartYOut = centerY - ((outputData.length - 1) / 2) * spacingY;
  outputData.forEach((node, i) => {
    const y = dataStartYOut + i * spacingY;
    nodes.push({ ...node, position: { x: centerX + spacingX, y } });
    edges.push({
      id: `e-${centerNode.id}->${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  // Outputs: processes above
  const groupStartYOut =
    dataStartYOut - groupGapY - (outputProcesses.length - 1) * spacingY;
  outputProcesses.forEach((node, i) => {
    const y = groupStartYOut + i * spacingY;
    nodes.push({ ...node, position: { x: centerX + spacingX, y } });
    edges.push({
      id: `e-${centerNode.id}->${node.id}`,
      source: centerNode.id,
      target: node.id,
      sourcePosition: "right",
      targetPosition: "left",
      type: "smoothstep",
      style: edgeStyleFor(node, edgeStyle),
      markerEnd: { type: "arrow", color: "grey", width: 20, height: 15 },
    });
  });

  return { nodes, edges };
}
