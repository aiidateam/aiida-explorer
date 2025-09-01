// nodeController.js
export function getNodeStyle(node) {
  switch (node.data.node_type) {
    case "process.calculation.calcjob.CalcJobNode.":
      return {
        background: "#fc5e5eff",
        color: "#000",
        borderRadius: 5,
        width: 120,
        height: 50,
      };

    case "data.core.dict.Dict.":
      return {
        background: "#9aff86ff",
        color: "#000",
        borderRadius: 5,
        width: 120,
        height: 50,
      };

    case "data.core.code.Code.":
      return {
        background: "#86b6ffff",
        color: "#000",
        borderRadius: 5,
        width: 120,
        height: 50,
      };
    default:
      return {
        background: "#ccc",
        color: "#000",
        borderRadius: 5,
        width: 120,
        height: 50,
      };
  }
}

export function enhanceNodes(nodes) {
  return nodes.map((node) => {
    // ensure label exists
    if (!node.data.label) {
      node.data.label = node.id;
    }

    const style = getNodeStyle(node); // get colors, size, etc.

    return {
      ...node,
      style, // apply style
      data: {
        ...node.data,
        tooltip: `Node ID: ${node.id}`,
      },
    };
  });
}
