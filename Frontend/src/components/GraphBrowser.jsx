import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
    MiniMap, 
    Controls, 
    Background, 
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';
import 'tailwindcss/tailwind.css';
import 'reactflow/dist/style.css';
import DownloadButton from './DownloadButton';

const GraphBrowser = ({ uuid, moduleName }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCache, setNodeCache] = useState({});
  const [customNodeCounter, setCustomNodeCounter] = useState(0);

  const extractLabel = (nodeType) => {
    if (!nodeType) return '';
    const parts = nodeType.split('.');
    return parts[parts.length - 2];
  };

  const generateUniqueId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const layoutNodes = (nodes) => {
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

  const fetchNodes = async (nodeUuid, isInitial = false, parentNodeId = null) => {
    if (nodeCache[nodeUuid]) {
      console.log(nodeCache[nodeUuid  ])
      displayNodesFromCache(nodeUuid, isInitial, parentNodeId);
      return;
    }

    try {
      const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
      const data = await response.json();
  
      console.log('API Response Data:', data);
  
      const newCache = { ...nodeCache };
      newCache[nodeUuid] = data.data.nodes[0];
      console.log(newCache);
      setNodeCache(newCache);
  
      displayNodes(newCache[nodeUuid], nodeUuid, isInitial, parentNodeId);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const displayNodesFromCache = (nodeUuid, isInitial, parentNodeId) => {
    const nodeData = nodeCache[nodeUuid];
    displayNodes(nodeData, nodeUuid, isInitial, parentNodeId);
  };

  const displayNodes = (nodeData, nodeUuid, isInitial, parentNodeId) => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    const middleNode = {
        id: nodeUuid,
        data: { label: extractLabel(nodeData.node_type) || nodeUuid },
        position: parentNode
          ? { x: 0, y: parentNode.position.y + 150 }
          : { x: 0, y: 0 },
        style: { background: '#FFCC80', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      };
  
    const incomingNodes = nodeData.incoming.slice(0, 10).map((node, index) => ({
        id: node.uuid,
        data: { label: extractLabel(node.node_type) || node.uuid },
        position: {
          x: middleNode.position.x - 200,
          y: middleNode.position.y , 
        },
        style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      }));
    
      const outgoingNodes = nodeData.outgoing.slice(0, 10).map((node, index) => ({
        id: node.uuid,
        data: { label: extractLabel(node.node_type) || node.uuid },
        position: {
          x: middleNode.position.x + 250, 
          y: middleNode.position.y,
        },
        style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      }));
  
      const customIncomingNode = {
        id: generateUniqueId(`incoming-custom-${nodeUuid}`),
        data: { label: `(+${nodeData.incoming.length - 10}) nodes` },
        position: {
          x: middleNode.position.x - 200, 
          y: middleNode.position.y  , 
        },
        style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      };
      
      const customOutgoingNode = {
        id: generateUniqueId(`outgoing-custom-${nodeUuid}`),
        data: { label: `(+${nodeData.outgoing.length - 10}) nodes` },
        position: {
          x: middleNode.position.x + 200, 
          y: middleNode.position.y , 
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

  useEffect(() => {
    fetchNodes(uuid, true);
  }, [uuid]);

  const onNodeClick = useCallback((event, node) => {
    if (node.id.includes('incoming-custom') || node.id.includes('outgoing-custom')) {
      console.log("I am here")
      loadMoreNodes(node.id);
    } else {
      fetchNodes(node.id, false, node.id);
    }
  }, [nodeCache]);

  const loadMoreNodes = (customNodeId) => {
    const parts = customNodeId.split('-');
    const direction = parts[0];
    const parentId = parts.slice(2,-1).join('-'); 
  
    console.log(`direction = ${direction}`);
    console.log(`parentId = ${parentId}`);
    
    const parentNode = nodeCache[parentId];
    console.log(parentNode);
    if (!parentNode) return;
    
    const nodesToLoad = direction === 'incoming'
      ? parentNode.incoming.slice(10)
      : parentNode.outgoing.slice(10);
    
    console.log(nodesToLoad);
    
    const existingNodes = nodes.map(node => node.position);
    const maxY = Math.max(...existingNodes.map(pos => pos.y), 0);
    
    const newNodes = nodesToLoad.map((node, index) => ({
      id: node.uuid,
      data: { label: extractLabel(node.node_type) || node.uuid },
      position: {
        x: direction === 'incoming' ? -500 : 500,
        y: maxY + (index + 1) * 70,
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
    
    setNodes((nds) => {
      const updatedNodes = [...nds, ...newNodes];
  
      // Update or remove the custom node based on remaining nodes
      if (direction === 'incoming') {
        const remainingIncomingNodes = parentNode.incoming.slice(10 + nodesToLoad.length);
        if (remainingIncomingNodes.length > 0) {
          const updatedCustomNode = {
            id: customNodeId,
            data: { label: `(+${remainingIncomingNodes.length}) nodes` },
            position: {
              x: -500,
              y: maxY + (nodesToLoad.length + 1) * 70,
            },
            style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
          };
          return layoutNodes(updatedNodes.map(node => node.id === customNodeId ? updatedCustomNode : node));
        } else {
          return layoutNodes(updatedNodes.filter(node => node.id !== customNodeId));
        }
      } else {
        const remainingOutgoingNodes = parentNode.outgoing.slice(10 + nodesToLoad.length);
        if (remainingOutgoingNodes.length > 0) {
          const updatedCustomNode = {
            id: customNodeId,
            data: { label: `(+${remainingOutgoingNodes.length}) nodes` },
            position: {
              x: 500,
              y: maxY + (nodesToLoad.length + 1) * 70,
            },
            style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
          };
          return layoutNodes(updatedNodes.map(node => node.id === customNodeId ? updatedCustomNode : node));
        } else {
          return layoutNodes(updatedNodes.filter(node => node.id !== customNodeId));
        }
      }
    });
    
    setEdges((eds) => [...eds, ...newEdges]);
  };
  
  

  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      <DownloadButton />
        
      </ReactFlowProvider>
      <div className="legend font-mono text-sm absolute top-4 left-4 border-[1px] border-gray-100 py-1 px-2 bg-white rounded shadow-lg">
        <h3 className="text-md font-mono font-semibold mb-2">Legend</h3>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-yellow-300 border border-black mr-2"></div>
          <span>Selected Node</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-green-200 border border-black mr-2"></div>
          <span>Incoming Node</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-red-200 border border-black mr-2"></div>
          <span>Outgoing Node</span>
        </div>
      </div>
    </div>
  );
};

export default GraphBrowser;
