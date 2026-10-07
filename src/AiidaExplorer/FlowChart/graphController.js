import { buildGraphNode, stripSyntheticId } from "../api";

import { categorizeNodeType } from "../utils";

const layoutGroupOrders = {
  data: ["calculation", "workflow", "data"],
  calculation: ["data", "calculation", "workflow"],
  workflow: ["data", "calculation", "workflow"],
};

function linkDisplayLabel(link) {
  return link.node_type.split(".").filter(Boolean).pop();
}

// Stable stacking order for new neighbours: process nodes newest-first,
// data nodes by label, groups ordered as in the old default layout.
function sortExpansionLinks(links, centerType) {
  const groups = { calculation: [], workflow: [], data: [] };
  links.forEach((l) => {
    const category = categorizeNodeType(l.node_type || "");
    (groups[category] || groups.data).push(l);
  });

  const byCtimeDesc = (a, b) => new Date(b?.ctime || 0) - new Date(a?.ctime || 0);
  groups.calculation.sort(byCtimeDesc);
  groups.workflow.sort(byCtimeDesc);
  groups.data.sort((a, b) =>
    linkDisplayLabel(a).localeCompare(linkDisplayLabel(b)),
  );

  const order = layoutGroupOrders[centerType] || layoutGroupOrders.data;
  return order.flatMap((g) => groups[g]);
}

/**
 * Positions for incrementally expanding one node: new neighbours stack in a
 * column beside it (inputs left, outputs right). Existing nodes are untouched.
 * The stack prefers centering on the node but slides below any occupants of
 * the target column band so repeated expansions don't pile up.
 */
export function placeExpansionNodes(
  expandedPos,
  count,
  directionX,
  existingNodes,
  options = {}
) {
  const { spacingX = 280, spacingY = 70 } = options;
  if (!count) return [];

  const x = expandedPos.x + spacingX * directionX;
  const centeredY = expandedPos.y - ((count - 1) / 2) * spacingY;

  const bandBottom = existingNodes.reduce(
    (max, n) =>
      Math.abs((n.position?.x ?? 0) - x) < spacingX / 2
        ? Math.max(max, n.position?.y ?? 0)
        : max,
    -Infinity
  );

  const startY =
    bandBottom === -Infinity
      ? centeredY
      : Math.max(centeredY, bandBottom + spacingY);

  return Array.from({ length: count }, (_, i) => ({
    x,
    y: startY + i * spacingY,
  }));
}

/**
 * Edge object for expansion links.
 */
export function buildLinkEdge(id, source, target, link, directionX) {
  let linkLabel = "";
  if (link?.link_label) {
    const rawLabel = link.link_label;
    linkLabel =
      rawLabel.length > 21 ? `${rawLabel.slice(0, 18)}...` : rawLabel;
  }

  const style = {};
  const category = categorizeNodeType(link?.node_type || "");
  if (category === "workflow" || category === "calculation") {
    style.strokeDasharray = "5,5";
  }

  return {
    id,
    source,
    target,
    sourcePosition: directionX < 0 ? "right" : "left",
    targetPosition: directionX < 0 ? "left" : "right",
    type: "custom",
    style,
    data: {
      label: linkLabel,
      labelPosition: directionX < 0 ? "start" : "end",
    },
  };
}

/**
 * The single graph-building mechanism: merge one side of a neighbourhood
 * into existing nodes/edges, keyed on stable aiidaUUID. Used both for
 * fresh navigation (twice, on the new root) and for +/- expansion.
 */
export function expandSide(baseNodes, baseEdges, target, side, links) {
  const pos = side === "in" ? 1 : -1;
  const directionX = side === "in" ? -1 : 1;
  const centerType = target.data?.node_type?.split(".")[1];

  const byUuid = new Map(
    baseNodes.map((n) => [n.aiidaUUID ?? stripSyntheticId(n.id), n]),
  );
  const unseen = sortExpansionLinks(
    links.filter((l) => !byUuid.has(l.uuid)),
    centerType,
  );
  const positions = placeExpansionNodes(
    target.position,
    unseen.length,
    directionX,
    baseNodes,
  );

  const freshNodes = [];
  const addedNodeIds = [];
  unseen.forEach((l, i) => {
    const node = { ...buildGraphNode(l, pos), position: positions[i] };
    byUuid.set(l.uuid, node);
    freshNodes.push(node);
    addedNodeIds.push(node.id);
  });

  const takenEdgeIds = new Set(baseEdges.map((e) => e.id));
  const freshEdges = [];
  const addedEdgeIds = [];
  links.forEach((l) => {
    const other = byUuid.get(l.uuid);
    if (!other) return;
    const source = side === "in" ? other.id : target.id;
    const targetId = side === "in" ? target.id : other.id;
    // Skip pairs already drawn (same id shape as the old layout).
    if (baseEdges.some((e) => e.source === source && e.target === targetId))
      return;
    let id = `e-${source}->${targetId}`;
    if (takenEdgeIds.has(id)) id = `${id}:${l?.link_label ?? ""}`;
    if (takenEdgeIds.has(id)) return;
    takenEdgeIds.add(id);
    addedEdgeIds.push(id);
    freshEdges.push(buildLinkEdge(id, source, targetId, l, directionX));
  });

  return {
    nodes: [...baseNodes, ...freshNodes],
    edges: [...baseEdges, ...freshEdges],
    addedNodeIds,
    addedEdgeIds,
  };
}

/**
 * Highlights the breadcrumb path (last node <-> center), drawn on top.
 */
export function highlightPathEdges(edges, lastNodeUuid, centerUuid) {
  if (!lastNodeUuid || !centerUuid) return edges;

  const normal = [];
  const highlighted = [];
  edges.forEach((edge) => {
    const connects =
      (edge.source.startsWith(lastNodeUuid) &&
        edge.target.startsWith(centerUuid)) ||
      (edge.source.startsWith(centerUuid) &&
        edge.target.startsWith(lastNodeUuid));
    if (!connects) {
      normal.push(edge);
      return;
    }
    highlighted.push({
      ...edge,
      data: { ...edge.data, labelOverride: true },
      style: {
        stroke: "blue",
        strokeWidth: 2.5,
        strokeDasharray: "",
      },
    });
  });

  return [...normal, ...highlighted];
}
