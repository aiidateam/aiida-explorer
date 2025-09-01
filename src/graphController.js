/**
 * Assign positions to nodes based on type or index.
 * Does NOT handle edges, colors, or arrows.
 * @param {Array} nodes - Array of node objects with {id, data, type}.
 * @param {Object} options - Optional layout config.
 * @returns {Array} nodes - The same nodes array with added .position
 */
export function layoutGraph(nodes, options = {}) {
  const spacingX = options.spacingX || 200;
  const spacingY = options.spacingY || 150;
  const rootX = options.rootX || 400;
  const rootY = options.rootY || 100;

  return nodes.map((node, index) => {
    let position = { x: rootX, y: rootY };

    switch (node.data.pos) {
      case "input":
        position = { x: rootX - spacingX, y: rootY + index * spacingY };
        break;
      case "output":
        position = { x: rootX + spacingX, y: rootY + index * spacingY };
        break;
      case "center":
      default:
        position = { x: rootX, y: rootY };
        break;
    }

    return { ...node, position };
  });
}
