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
        y: index * 75,
      };
      maxX = Math.max(maxX, node.position.x);
      minX = Math.min(minX, node.position.x);
      maxY = Math.max(maxY, node.position.y);
      minY = Math.min(minY, node.position.y);
    });

    const offsetX = (maxX - minX) / 2;
    const offsetY = (maxY - minY) / 2;

    nodes.forEach((node) => {
      node.position.x -= offsetX;
      node.position.y -= offsetY;
    });

    return nodes;
  };

  const fetchNodes = async (nodeUuid, isInitial = false, parentNodeId = null) => {
    try {
      const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
      const data = await response.json();
  
      console.log('API Response Data:', data);
  
      const parentNode = nodes.find(n => n.id === parentNodeId);
  
      const middleNode = {
        id: nodeUuid,
        data: { label: extractLabel(data.data.nodes[0].node_type) || nodeUuid },
        position: parentNode
          ? { x: parentNode.position.x, y: parentNode.position.y + 100 }
          : { x: 0, y: 0 },
        style: { background: '#FFCC80', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      };
  
      const incomingNodes = data.data.nodes[0].incoming.slice(0, 10).map((node, index) => ({
        id: node.uuid,
        data: { label: extractLabel(node.node_type) || node.uuid },
        position: {
          x: middleNode.position.x - 500,
          y: middleNode.position.y + (index - (data.data.nodes[0].incoming.length / 2)) * 70,
        },
        style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      }));
  
      const outgoingNodes = data.data.nodes[0].outgoing.slice(0, 10).map((node, index) => ({
        id: node.uuid,
        data: { label: extractLabel(node.node_type) || node.uuid },
        position: {
          x: middleNode.position.x + 500,
          y: middleNode.position.y + (index - (data.data.nodes[0].outgoing.length / 2)) * 70,
        },
        style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      }));
  
      const customIncomingNode = {
        id: generateUniqueId('incoming-custom'),
        data: { label: `(+${data.data.nodes[0].incoming.length - 10}) nodes` },
        position: {
          x: middleNode.position.x - 400,
          y: middleNode.position.y + ((data.data.nodes[0].incoming.length - 1) / 2) * 75,
        },
        style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      };
  
      const customOutgoingNode = {
        id: generateUniqueId('outgoing-custom'),
        data: { label: `(+${data.data.nodes[0].outgoing.length - 10}) nodes` },
        position: {
          x: middleNode.position.x + 400,
          y: middleNode.position.y + ((data.data.nodes[0].outgoing.length - 1) / 2) * 75,
        },
        style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
      };
  
      const newNodes = [middleNode, ...incomingNodes, ...outgoingNodes];
      if (data.data.nodes[0].incoming.length > 10) {
        newNodes.push(customIncomingNode);
      }
      if (data.data.nodes[0].outgoing.length > 10) {
        newNodes.push(customOutgoingNode);
      }
  
      const newEdges = [
        ...incomingNodes.map((node) => ({
          id: generateUniqueId(`e${node.id}-${nodeUuid}`),
          source: node.id,
          target: nodeUuid,
          animated: true,
          arrowHeadType: 'arrowclosed',
          label: data.data.nodes[0].incoming.find(n => n.uuid === node.id).link_label,
        })),
        ...outgoingNodes.map((node) => ({
          id: generateUniqueId(`e${nodeUuid}-${node.id}`),
          source: nodeUuid,
          target: node.id,
          animated: true,
          arrowHeadType: 'arrowclosed',
          label: data.data.nodes[0].outgoing.find(n => n.uuid === node.id).link_label,
        })),
        ...(data.data.nodes[0].incoming.length > 10 ? [{
          id: generateUniqueId(`e${customIncomingNode.id}-${nodeUuid}`),
          source: customIncomingNode.id,
          target: nodeUuid,
          animated: true,
          arrowHeadType: 'arrowclosed',
          label: 'More Incoming Nodes',
        }] : []),
        ...(data.data.nodes[0].outgoing.length > 10 ? [{
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
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  useEffect(() => {
    fetchNodes(uuid, true);
  }, [uuid]);

  const onNodeClick = useCallback((event, node) => {
    fetchNodes(node.id, false, node.id);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, arrowHeadType: 'arrowclosed' }, eds)),
    [setEdges],
  );

  return (
    <div className='h-full w-full relative'>
      <ReactFlowProvider>
        <ReactFlow 
          style={{ width: '100%', height: '100%' }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}>
          <Controls />
          <Background  variant="dots" gap={12} size={1} />
        </ReactFlow>
        <div className="absolute bottom-4 right-4 p-2">
          <MiniMap
            nodeColor={(n) => {
              if (n.style.background === '#FFCC80') return '#FFCC80';
              if (n.style.background === '#C8E6C9') return '#C8E6C9';
              return '#FFAB91';
            }}
            style={{ width: 200, height: 120 }}
          />
        </div>
        <DownloadButton className='absolute top-0 right-0' />
      </ReactFlowProvider>
      <div className="absolute top-0 left-0 bg-white p-2 border-2 border-gray-100 rounded shadow-md">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FFCC80' }}></div>
          <span>Central Node</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#C8E6C9' }}></div>
          <span>Incoming Node</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FFAB91' }}></div>
          <span>Outgoing Node</span>
        </div>
      </div>
    </div>
  );
};

export default GraphBrowser;
