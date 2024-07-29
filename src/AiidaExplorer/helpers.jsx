export const extractLabel = (nodeType) => {
  if (!nodeType) return '';
  const parts = nodeType.split('.');
  return parts[parts.length - 2];
};

export const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const layoutNodes = (nodes) => {
  let maxX = 0;
  let minX = 0;
  let maxY = 0;
  let minY = 0;

  nodes.forEach((node, index) => {
    node.position = {
      x: node.position.x * 1.1,
      y: index * 60,
    };
    maxX = Math.max(maxX, node.position.x);
    minX = Math.min(minX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
    minY = Math.min(minY, node.position.y);
  });

  const offsetX = (maxX - minX) / 4;
  const offsetY = (maxY - minY) / 6;

  nodes.forEach((node) => {
    node.position.x -= offsetX;
    node.position.y -= offsetY;
  });

  return nodes;
};

export const fetchNodes = async (nodeUuid, moduleName, isInitial, parentNodeId, nodeCache, setNodeCache, setNodes, setEdges) => {
  if (nodeCache[nodeUuid]) {
    displayNodesFromCache(nodeUuid, isInitial, parentNodeId, nodeCache, setNodes, setEdges);
    return;
  }

  try {
    const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
    const data = await response.json();

    const newCache = { ...nodeCache };
    newCache[nodeUuid] = data.data.nodes[0];
    setNodeCache(newCache);

    displayNodes(newCache[nodeUuid], nodeUuid, isInitial, parentNodeId, setNodes, setEdges);
  } catch (error) {
    console.error('Error fetching nodes:', error);
  }
};

export const displayNodesFromCache = (nodeUuid, isInitial, parentNodeId, nodeCache, setNodes, setEdges) => {
  const nodeData = nodeCache[nodeUuid];
  displayNodes(nodeData, nodeUuid, isInitial, parentNodeId, setNodes, setEdges);
};

const displayNodes = (nodeData, nodeUuid, isInitial, parentNodeId, setNodes, setEdges) => {
  const parentNode = nodes.find(n => n.id === parentNodeId);
  const middleNode = {
    id: nodeUuid,
    data: { label: extractLabel(nodeData.node_type) || nodeUuid },
    position: parentNode
      ? { x: parentNode.position.x, y: parentNode.position.y + 150 }
      : { x: 0, y: 0 },
    style: { background: '#FFCC80', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
  };

  const incomingNodes = nodeData.incoming.slice(0, 10).map((node, index) => ({
    id: node.uuid,
    data: { label: extractLabel(node.node_type) || node.uuid },
    position: {
      x: middleNode.position.x - 200,
      y: middleNode.position.y + index * 60, 
    },
    style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
  }));

  const outgoingNodes = nodeData.outgoing.slice(0, 10).map((node, index) => ({
    id: node.uuid,
    data: { label: extractLabel(node.node_type) || node.uuid },
    position: {
      x: middleNode.position.x + 250, 
      y: middleNode.position.y + index * 60,
    },
    style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
  }));

  const customIncomingNode = {
    id: generateUniqueId(`incoming-custom-${nodeUuid}`),
    data: { label: `(+${nodeData.incoming.length - 10}) nodes` },
    position: {
      x: middleNode.position.x - 200, 
      y: middleNode.position.y + incomingNodes.length * 60, 
    },
    style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
  };

  const customOutgoingNode = {
    id: generateUniqueId(`outgoing-custom-${nodeUuid}`),
    data: { label: `(+${nodeData.outgoing.length - 10}) nodes` },
    position: {
      x: middleNode.position.x + 250, 
      y: middleNode.position.y + outgoingNodes.length * 60, 
    },
    style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
  };

  const newNodes = [middleNode, ...incomingNodes, ...outgoingNodes];
  if (nodeData.incoming.length > 10) {
    newNodes.push(customIncomingNode);
  }
  if (nodeData.outgoing.length > 10) {
    newNodes.push(customOutgoingNode);
  }

  const newEdges = [
    ...incomingNodes.map((node) => ({
      id: generateUniqueId(`e${node.id}-${nodeUuid}`),
      source: node.id,
      target: nodeUuid,
      animated: true,
      arrowHeadType: 'arrowclosed',
      label: nodeData.incoming.find(n => n.uuid === node.id).link_label,
    })),
    ...outgoingNodes.map((node) => ({
      id: generateUniqueId(`e${nodeUuid}-${node.id}`),
      source: nodeUuid,
      target: node.id,
      animated: true,
      arrowHeadType: 'arrowclosed',
      label: nodeData.outgoing.find(n => n.uuid === node.id).link_label,
    })),
    ...(nodeData.incoming.length > 10 ? [{
      id: generateUniqueId(`e${customIncomingNode.id}-${nodeUuid}`),
      source: customIncomingNode.id,
      target: nodeUuid,
      animated: true,
      arrowHeadType: 'arrowclosed',
      label: 'More Incoming Nodes',
    }] : []),
    ...(nodeData.outgoing.length > 10 ? [{
      id: generateUniqueId(`e${nodeUuid}-${customOutgoingNode.id}`),
      source: nodeUuid,
      target: customOutgoingNode.id,
      animated: true,
      arrowHeadType: 'arrowclosed',
      label: 'More Outgoing Nodes',
    }] : []),
  ];

  if (isInitial) {
    setNodes(layoutNodes(newNodes));
    setEdges(newEdges);
  } else {
    setNodes((nds) => layoutNodes([...nds, ...newNodes]));
    setEdges((eds) => [...eds, ...newEdges]);
  }
};

export const loadMoreNodes = (customNodeId, nodeCache, setNodes, setEdges) => {
  const [direction, parentId] = customNodeId.split('-').slice(1);
  const parentNode = nodeCache[parentId];
  if (!parentNode) return;

  const nodesToLoad = direction === 'incoming'
    ? parentNode.incoming.slice(10)
    : parentNode.outgoing.slice(10);

  const newNodes = nodesToLoad.map((node, index) => ({
    id: node.uuid,
    data: { label: extractLabel(node.node_type) || node.uuid },
    position: {
      x: direction === 'incoming' ? parentNode.position.x - 500 : parentNode.position.x + 500,
      y: parentNode.position.y + (index - (nodesToLoad.length / 2)) * 70,
    },
    style: direction === 'incoming'
      ? { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' }
      : { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
  }));

  const newEdges = nodesToLoad.map((node) => ({
    id: generateUniqueId(`e${direction === 'incoming' ? node.uuid : parentId}-${direction === 'incoming' ? parentId : node.uuid}`),
    source: direction === 'incoming' ? node.uuid : parentId,
    target: direction === 'incoming' ? parentId : node.uuid,
    animated: true,
    arrowHeadType: 'arrowclosed',
    label: direction === 'incoming' ? parentNode.incoming.find(n => n.uuid === node.uuid).link_label : parentNode.outgoing.find(n => n.uuid === node.uuid).link_label,
  }));

  setNodes((nds) => layoutNodes([...nds, ...newNodes]));
  setEdges((eds) => [...eds, ...newEdges]);
};
