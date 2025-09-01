// nodeController.js
export function getNodeStyle(node) {
  const type = node.data.node_type || "";

  if (type.startsWith("process")) {
    return { background: "#fc5e5eff", color: "#000" };
  } else if (type.startsWith("data")) {
    return { background: "#9aff86ff", color: "#000" };
  } else {
    return { background: "#ccc", color: "#000" };
  }
}

export function enhanceNodes(nodes) {
  return nodes.map((node) => {
    const style = getNodeStyle(node); // returns { background, color, ... }
    return {
      ...node,
      data: {
        ...node.data,
        background: style.background,
        color: style.color,
        tooltip: `Node ID: ${node.id}`,
      },
    };
  });
}
