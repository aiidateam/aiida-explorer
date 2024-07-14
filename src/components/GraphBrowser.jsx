// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import ReactFlow, { 
//     MiniMap, 
//     Controls, 
//     Background, 
//     ReactFlowProvider,
//     useNodesState,
//     useEdgesState,
//     addEdge,
//     MarkerType,
// } from 'reactflow';
// import 'tailwindcss/tailwind.css';
// import 'reactflow/dist/style.css';
// import dagre from 'dagre';
// import CustomNode from './CustomNode';
// // import DownloadButton from './DownloadButton';
// import Legend from './Legend';
// import Tooltip from './Tooltip';


// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));
// const nodeWidth = 172;
// const nodeHeight = 36;

// const getLayoutedNodes = (nodes, edges) => {
//   dagreGraph.setGraph({ rankdir: 'LR' });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   return nodes.map((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.targetPosition = 'left';
//     node.sourcePosition = 'right';

//     node.position = {
//       x: nodeWithPosition.x - nodeWidth / 2,
//       y: nodeWithPosition.y - nodeHeight / 2,
//     };

//     return node;
//   });
// };

// const GraphBrowser = ({ uuid, moduleName }) => {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [nodeCache, setNodeCache] = useState({});
//   const [customNodeCounter, setCustomNodeCounter] = useState(0);
//   const [tooltipDetails, setTooltipDetails] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: null, y: null });
//   const tooltipTimeout = useRef(null);

//   // const nodeTypes = {
//   //   customNode: (props) => (
//   //     <CustomNode {...props} onMouseEnter={onNodeMouseEnter} onMouseLeave={onNodeMouseLeave} />
//   //   ),
//   // };
//   const containerRef = useRef(null);
//   const extractLabel = (nodeType) => {
//     if (!nodeType) return '';
//     const parts = nodeType.split('.');
//     return parts[parts.length - 2];
//   };

//   const generateUniqueId = (prefix = 'id') => {
//     return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
//   };

//   const fetchNodes = async (nodeUuid, isInitial = false, parentNodeId = null) => {
//     if (nodeCache[nodeUuid]) {
//       displayNodesFromCache(nodeUuid, isInitial, parentNodeId);
//       return;
//     }
  
//     try {
//       const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
//       const data = await response.json();
  
//       const newCache = { ...nodeCache };
//       newCache[nodeUuid] = { ...data.data.nodes[0], details: data.data.nodes[0] }; 
//       setNodeCache(newCache);
  
//       displayNodes(newCache[nodeUuid], nodeUuid, isInitial, parentNodeId);
//     } catch (error) {
//       console.error('Error fetching nodes:', error);
//     }
//   };
  

//   const displayNodesFromCache = (nodeUuid, isInitial, parentNodeId) => {
//     const nodeData = nodeCache[nodeUuid];
//     displayNodes(nodeData, nodeUuid, isInitial, parentNodeId);
//   };

//   const displayNodes = (nodeData, nodeUuid, isInitial, parentNodeId) => {
//     const parentNode = nodes.find(n => n.id === parentNodeId);
//     const middleNode = {
//       id: nodeUuid,
//       data: { label: extractLabel(nodeData.node_type) || nodeUuid },
//       position: parentNode
//         ? { x: parentNode.position.x + 150, y: 0 }
//         : { x: 0, y: 0 },
//       style: { 
//         background: '#FFCC80', 
//         color: '#333', 
//         border: '1px solid #333', 
//         paddingLeft: '20px',
//         paddingRight: '20px' },
//     };

//     const incomingNodes = nodeData.incoming.slice(0, 10).map((node, index) => ({
//       id: node.uuid,
//       data: { label: extractLabel(node.node_type) || node.uuid },
//       position: {
//         x: middleNode.position.x , 
//         y: middleNode.position.y - 200,
//       },
//       style: { 
//         background: '#C8E6C9', 
//         color: '#333', 
//         border: '1px solid #333', 
//         paddingLeft: '20px', 
//         paddingRight: '20px' },
//     }));
  
//     const outgoingNodes = nodeData.outgoing.slice(0, 10).map((node, index) => ({
//       id: node.uuid,
//       data: { label: extractLabel(node.node_type) || node.uuid },
//       position: {
//         x: middleNode.position.x , 
//         y: middleNode.position.y + 250, 
//       },
//       style: { 
//         background: '#FFAB91', 
//         color: '#333', 
//         border: '1px solid #333', 
//         paddingLeft: '20px', 
//         paddingRight: '20px' },
//     }));

//     const customIncomingNode = {
//       id: generateUniqueId(`incoming-custom-${nodeUuid}`),
//       data: { label: `(+${nodeData.incoming.length - 10}) nodes` },
//       position: {
//         x: middleNode.position.x , 
//         y: middleNode.position.y - 200, 
//       },
//       style: { 
//         background: '#ADD8E6', 
//         color: '#333', 
//         border: '1px dashed #333',
//         paddingLeft: '20px', 
//         paddingRight: '20px' 
//       },
//     };
    
//     const customOutgoingNode = {
//       id: generateUniqueId(`outgoing-custom-${nodeUuid}`),
//       data: { label: `(+${nodeData.outgoing.length - 10}) nodes` },
//       position: {
//         x: middleNode.position.x , 
//         y: middleNode.position.y + 200, 
//       },
//       style: { 
//         background: '#ADD8E6', 
//         color: '#333', 
//         border: '1px dashed #333', 
//         paddingLeft: '20px', 
//         paddingRight: '20px' 
//       },
//     };
    

//     const newNodes = [middleNode, ...incomingNodes, ...outgoingNodes];
//     if (nodeData.incoming.length > 10) {
//       newNodes.push(customIncomingNode);
//     }
//     if (nodeData.outgoing.length > 10) {
//       newNodes.push(customOutgoingNode);
//     }

//     const newEdges = [
//       ...incomingNodes.map((node) => ({
//         id: generateUniqueId(`e${node.id}-${nodeUuid}`),
//         source: node.id,
//         target: nodeUuid,
//         animated: true,
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         style: {
//           strokeWidth: 1,
//           stroke: '#808080',
//         },
//         // arrowHeadType: 'arrowclosed',
//         label: nodeData.incoming.find(n => n.uuid === node.id).link_label,
//       })),
//       ...outgoingNodes.map((node) => ({
//         id: generateUniqueId(`e${nodeUuid}-${node.id}`),
//         source: nodeUuid,
//         target: node.id,
//         animated: true,
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         style: {
//           strokeWidth: 1,
//           stroke: '#808080',
//         },
//         // arrowHeadType: 'arrowclosed',
//         label: nodeData.outgoing.find(n => n.uuid === node.id).link_label,
//       })),
//       ...(nodeData.incoming.length > 10 ? [{
//         id: generateUniqueId(`e${customIncomingNode.id}-${nodeUuid}`),
//         source: customIncomingNode.id,
//         target: nodeUuid,
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         style: {
//           strokeWidth: 1,
//           stroke: '#808080',
//         },
//         animated: true,
//         // arrowHeadType: 'arrowclosed',
//         label: 'More Incoming Nodes',
//       }] : []),
//       ...(nodeData.outgoing.length > 10 ? [{
//         id: generateUniqueId(`e${nodeUuid}-${customOutgoingNode.id}`),
//         source: nodeUuid,
//         target: customOutgoingNode.id,
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         style: {
//           strokeWidth: 1,
//           stroke: '#808080',
//         },
//         animated: true,
//         // arrowHeadType: 'arrowclosed',
//         label: 'More Outgoing Nodes',
//       }] : []),
//     ];

//     if (isInitial) {
//       const layoutedNodes = getLayoutedNodes(newNodes, newEdges);
//       setNodes(layoutedNodes);
//       setEdges(newEdges);
//     } else {
//       const layoutedNodes = getLayoutedNodes([...nodes, ...newNodes], [...edges, ...newEdges]);
//       setNodes(layoutedNodes);
//       setEdges([...edges, ...newEdges]);
//     }
//   };

//   useEffect(() => {
//     fetchNodes(uuid, true);
//   }, [uuid]);

//   const onNodeClick = useCallback((event, node) => {
//     if (node.id.includes('incoming-custom') || node.id.includes('outgoing-custom')) {
//       loadMoreNodes(node.id);
//     } else {
//       fetchNodes(node.id, false, node.id);
//     }
//   }, [nodeCache]);

//   const onNodeMouseEnter = useCallback(async (event, nodeId) => {
//     clearTimeout(tooltipTimeout.current);
//     tooltipTimeout.current = setTimeout(async () => {
//       try {
//         console.log(nodeId.id);
//         const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${nodeId.id}`);
//         const data = await response.json();
//         setTooltipDetails(data.data.nodes[0]);
//         console.log(data.data.nodes[0]);
//         setTooltipPosition({ x: event.clientX, y: event.clientY });
//         console.log('x: ' + event.clientX, 'y:' + event.clientY);
//       } catch (error) {
//         console.error('Error fetching node details:', error);
//       }
//     }, 200); // Delay in milliseconds
//   }, []);

//   const onNodeMouseLeave = useCallback(() => {
//     clearTimeout(tooltipTimeout.current);
//     setTooltipDetails(null);
//   }, []);

  
  
  
//   const loadMoreNodes = (customNodeId) => {
//     const parts = customNodeId.split('-');
//     const direction = parts[0];
//     const parentId = parts.slice(2,-1).join('-'); 
  
//     const parentNode = nodeCache[parentId];
//     if (!parentNode) return;
    
//     const nodesToLoad = direction === 'incoming'
//       ? parentNode.incoming.slice(10)
//       : parentNode.outgoing.slice(10);
    
//     const newNodes = nodesToLoad.map((node, index) => ({
//       id: node.uuid,
//       data: { label: extractLabel(node.node_type) || node.uuid },
//       position: { x: 0, y: 0 },
//       style: direction === 'incoming'
//         ? { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' }
//         : { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//     }));
  
//     const newEdges = newNodes.map((node) => ({
//       id: generateUniqueId(`e${direction === 'incoming' ? node.id + '-' + parentId : parentId + '-' + node.id}`),
//       source: direction === 'incoming' ? node.id : parentId,
//       target: direction === 'incoming' ? parentId : node.id,
//       animated: true,
//       markerEnd: {
//         type: MarkerType.ArrowClosed,
//         width: 20,
//         height: 20,
//         color: '#808080',
//       },
//       style: {
//         strokeWidth: 1,
//         stroke: '#808080',
//       },
//       // arrowHeadType: 'arrowclosed',
//       label: node.link_label,
//     }));

//     const filteredNodes = nodes.filter(n => n.id !== customNodeId);
//     const filteredEdges = edges.filter(e => e.source !== customNodeId && e.target !== customNodeId);

//     const layoutedNodes = getLayoutedNodes([...filteredNodes, ...newNodes], [...filteredEdges, ...newEdges]);
//     setNodes(layoutedNodes);
//     setEdges([...filteredEdges, ...newEdges]);
//   };

//   return (
//     <div className="h-full w-full" ref={containerRef}>
//       <Legend />
//       <ReactFlowProvider>
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onNodeClick={onNodeClick}
//           onNodeMouseEnter={onNodeMouseEnter}
//           onNodeMouseLeave={onNodeMouseLeave}
//           fitView
//           onlyRenderVisibleElements
//         >
//           <MiniMap />
//           <Controls />
//           <Background />
//         </ReactFlow>
//       </ReactFlowProvider>
//       {tooltipDetails && (
//         <Tooltip
//           details={tooltipDetails}
//           position={tooltipPosition}
//           containerRef={containerRef}
//         />
//       )}
//       {/* <DownloadButton nodes={nodes} edges={edges} /> */}
//     </div>
//   );
// };

// export default GraphBrowser;







//FIRST MPLEMETATION //






//INITIAL IMPLEMENTATION

// import React, { useEffect, useState, useCallback } from 'react';
// import ReactFlow, {
// MiniMap,
// Controls,
// Background,
// ReactFlowProvider,
// useNodesState,
// useEdgesState,
// addEdge,
// } from 'reactflow';
// import 'tailwindcss/tailwind.css';
// import 'reactflow/dist/style.css';
// import DownloadButton from './DownloadButton';

// const GraphBrowser = ({ uuid, moduleName }) => {
// const [nodes, setNodes, onNodesChange] = useNodesState([]);
// const [edges, setEdges, onEdgesChange] = useEdgesState([]);
// const [nodeCache, setNodeCache] = useState({});
// const [customNodeCounter, setCustomNodeCounter] = useState(0);

// const extractLabel = (nodeType) => {
// if (!nodeType) return '';
// const parts = nodeType.split('.');
// return parts[parts.length - 2];
// };

// const generateUniqueId = (prefix = 'id') => {
// return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
// };

// const layoutNodes = (nodes) => {
// let maxX = 0;
// let minX = 0;
// let maxY = 0;
// let minY = 0;

// nodes.forEach((node, index) => {
//   node.position = {
//     x: node.position.x * 1.1,
//     y: index * 60,
//   };
//   maxX = Math.max(maxX, node.position.x);
//   minX = Math.min(minX, node.position.x);
//   maxY = Math.max(maxY, node.position.y);
//   minY = Math.min(minY, node.position.y);
// });

// const offsetX = (maxX - minX) / 4;
// const offsetY = (maxY - minY) / 6;

// nodes.forEach((node) => {
//   node.position.x -= offsetX;
//   node.position.y -= offsetY;
// });

// return nodes;
// };

// const fetchNodes = async (nodeUuid, isInitial = false, parentNodeId = null) => {
// if (nodeCache[nodeUuid]) {
// console.log(nodeCache[nodeUuid ])
// displayNodesFromCache(nodeUuid, isInitial, parentNodeId);
// return;
// }

// try {
//   const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
//   const data = await response.json();

//   console.log('API Response Data:', data);

//   const newCache = { ...nodeCache };
//   newCache[nodeUuid] = data.data.nodes[0];
//   console.log(newCache);
//   setNodeCache(newCache);

//   displayNodes(newCache[nodeUuid], nodeUuid, isInitial, parentNodeId);
// } catch (error) {
//   console.error('Error fetching nodes:', error);
// }
// };

// const displayNodesFromCache = (nodeUuid, isInitial, parentNodeId) => {
// const nodeData = nodeCache[nodeUuid];
// displayNodes(nodeData, nodeUuid, isInitial, parentNodeId);
// };

// const displayNodes = (nodeData, nodeUuid, isInitial, parentNodeId) => {
// const parentNode = nodes.find(n => n.id === parentNodeId);
// const middleNode = {
// id: nodeUuid,
// data: { label: extractLabel(nodeData.node_type) || nodeUuid },
// position: parentNode
// ? { x: 0, y: parentNode.position.y + 150 }
// : { x: 0, y: 0 },
// style: { background: '#FFCC80', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
// };

// const incomingNodes = nodeData.incoming.slice(0, 10).map((node, index) => ({
//     id: node.uuid,
//     data: { label: extractLabel(node.node_type) || node.uuid },
//     position: {
//       x: middleNode.position.x - 200,
//       y: middleNode.position.y , 
//     },
//     style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//   }));

//   const outgoingNodes = nodeData.outgoing.slice(0, 10).map((node, index) => ({
//     id: node.uuid,
//     data: { label: extractLabel(node.node_type) || node.uuid },
//     position: {
//       x: middleNode.position.x + 250, 
//       y: middleNode.position.y,
//     },
//     style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//   }));

//   const customIncomingNode = {
//     id: generateUniqueId(`incoming-custom-${nodeUuid}`),
//     data: { label: `(+${nodeData.incoming.length - 10}) nodes` },
//     position: {
//       x: middleNode.position.x - 200, 
//       y: middleNode.position.y  , 
//     },
//     style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//   };
  
//   const customOutgoingNode = {
//     id: generateUniqueId(`outgoing-custom-${nodeUuid}`),
//     data: { label: `(+${nodeData.outgoing.length - 10}) nodes` },
//     position: {
//       x: middleNode.position.x + 200, 
//       y: middleNode.position.y , 
//     },
//     style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//   };

// const newNodes = [middleNode, ...incomingNodes, ...outgoingNodes];
// if (nodeData.incoming.length > 10) {
//   newNodes.push(customIncomingNode);
// }
// if (nodeData.outgoing.length > 10) {
//   newNodes.push(customOutgoingNode);
// }

// const newEdges = [  ...incomingNodes.map((node) => ({    id: generateUniqueId(`e${node.id}-${nodeUuid}`),    source: node.id,    target: nodeUuid,    animated: true,    arrowHeadType: 'arrowclosed',    label: nodeData.incoming.find(n => n.uuid === node.id).link_label,  })),  ...outgoingNodes.map((node) => ({    id: generateUniqueId(`e${nodeUuid}-${node.id}`),    source: nodeUuid,    target: node.id,    animated: true,    arrowHeadType: 'arrowclosed',    label: nodeData.outgoing.find(n => n.uuid === node.id).link_label,  })),  ...(nodeData.incoming.length > 10 ? [{    id: generateUniqueId(`e${customIncomingNode.id}-${nodeUuid}`),    source: customIncomingNode.id,    target: nodeUuid,    animated: true,    arrowHeadType: 'arrowclosed',    label: 'More Incoming Nodes',  }] : []),
//   ...(nodeData.outgoing.length > 10 ? [{
//     id: generateUniqueId(`e${nodeUuid}-${customOutgoingNode.id}`),
//     source: nodeUuid,
//     target: customOutgoingNode.id,
//     animated: true,
//     arrowHeadType: 'arrowclosed',
//     label: 'More Outgoing Nodes',
//   }] : []),
// ];

// if (isInitial) {
//   setNodes(layoutNodes(newNodes));
//   setEdges(newEdges);
// } else {
//   setNodes((nds) => layoutNodes([...nds, ...newNodes]));
//   setEdges((eds) => [...eds, ...newEdges]);
// }
// };

// useEffect(() => {
// fetchNodes(uuid, true);
// }, [uuid]);

// const onNodeClick = useCallback((event, node) => {
// if (node.id.includes('incoming-custom') || node.id.includes('outgoing-custom')) {
// console.log("I am here")
// loadMoreNodes(node.id);
// } else {
// fetchNodes(node.id, false, node.id);
// }
// }, [nodeCache]);

// const loadMoreNodes = (customNodeId) => {
// const parts = customNodeId.split('-');
// const direction = parts[0];
// const parentId = parts.slice(2,-1).join('-');

// console.log(`direction = ${direction}`);
// console.log(`parentId = ${parentId}`);

// const parentNode = nodeCache[parentId];
// console.log(parentNode);
// if (!parentNode) return;

// const nodesToLoad = direction === 'incoming'
//   ? parentNode.incoming.slice(10)
//   : parentNode.outgoing.slice(10);

// console.log(nodesToLoad);

// const existingNodes = nodes.map(node => node.position);
// const maxY = Math.max(...existingNodes.map(pos => pos.y), 0);

// const newNodes = nodesToLoad.map((node, index) => ({
//   id: node.uuid,
//   data: { label: extractLabel(node.node_type) || node.uuid },
//   position: {
//     x: direction === 'incoming' ? -500 : 500,
//     y: maxY + (index + 1) * 70,
//   },
//   style: direction === 'incoming'
//     ? { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' }
//     : { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
// }));

// const newEdges = nodesToLoad.map((node) => ({
//   id: generateUniqueId(`e${direction === 'incoming' ? node.uuid : parentId}-${direction === 'incoming' ? parentId : node.uuid}`),
//   source: direction === 'incoming' ? node.uuid : parentId,
//   target: direction === 'incoming' ? parentId : node.uuid,
//   animated: true,
//   arrowHeadType: 'arrowclosed',
//   label: direction === 'incoming' ? parentNode.incoming.find(n => n.uuid === node.uuid).link_label : parentNode.outgoing.find(n => n.uuid === node.uuid).link_label,
// }));

// setNodes((nds) => {
//   const updatedNodes = [...nds, ...newNodes];

//   // Update or remove the custom node based on remaining nodes
//   if (direction === 'incoming') {
//     const remainingIncomingNodes = parentNode.incoming.slice(10 + nodesToLoad.length);
//     if (remainingIncomingNodes.length > 0) {
//       const updatedCustomNode = {
//         id: customNodeId,
//         data: { label: `(+${remainingIncomingNodes.length}) nodes` },
//         position: {
//           x: -500,
//           y: maxY + (nodesToLoad.length + 1) * 70,
//         },
//         style: { background: '#C8E6C9', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//       };
//       return layoutNodes(updatedNodes.map(node => node.id === customNodeId ? updatedCustomNode : node));
//     } else {
//       return layoutNodes(updatedNodes.filter(node => node.id !== customNodeId));
//     }
//   } else {
//     const remainingOutgoingNodes = parentNode.outgoing.slice(10 + nodesToLoad.length);
//     if (remainingOutgoingNodes.length > 0) {
//       const updatedCustomNode = {
//         id: customNodeId,
//         data: { label: `(+${remainingOutgoingNodes.length}) nodes` },
//         position: {
//           x: 500,
//           y: maxY + (nodesToLoad.length + 1) * 70,
//         },
//         style: { background: '#FFAB91', color: '#333', border: '1px solid #333', paddingLeft: '20px', paddingRight: '20px' },
//       };
//       return layoutNodes(updatedNodes.map(node => node.id === customNodeId ? updatedCustomNode : node));
//     } else {
//       return layoutNodes(updatedNodes.filter(node => node.id !== customNodeId));
//     }
//   }
// });

// setEdges((eds) => [...eds, ...newEdges]);
// };

// return (
// <div className="w-full h-full">
// <ReactFlowProvider>
// <ReactFlow
// nodes={nodes}
// edges={edges}
// onNodesChange={onNodesChange}
// onEdgesChange={onEdgesChange}
// onNodeClick={onNodeClick}
// snapToGrid={true}
// snapGrid={[15, 15]}
// fitView
// >
// <MiniMap />
// <Controls />
// <Background variant="dots" gap={12} size={1} />
// </ReactFlow>
// {/* <DownloadButton /> */}

//   </ReactFlowProvider>
//   <div className="legend font-mono text-sm absolute top-4 left-4 border-[1px] border-gray-100 py-1 px-2 bg-white rounded shadow-lg">
//     <h3 className="text-md font-mono font-semibold mb-2">Legend</h3>
//     <div className="flex items-center mb-2">
//       <div className="w-4 h-4 bg-yellow-300 border border-black mr-2"></div>
//       <span>Selected Node</span>
//     </div>
//     <div className="flex items-center mb-2">
//       <div className="w-4 h-4 bg-green-200 border border-black mr-2"></div>
//       <span>Incoming Node</span>
//     </div>
//     <div className="flex items-center mb-2">
//       <div className="w-4 h-4 bg-red-200 border border-black mr-2"></div>
//       <span>Outgoing Node</span>
//     </div>
//   </div>
// </div>
// );
// };

// export default GraphBrowser;




// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import ReactFlow, { 
//     MiniMap, 
//     Controls, 
//     Background, 
//     ReactFlowProvider,
//     useNodesState,
//     useEdgesState,
//     MarkerType,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// // import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
// import { FaArrowUp, FaEye, FaEyeSlash, FaShapes } from 'react-icons/fa';
// import dagre from 'dagre';
// import Legend from './Legend';
// import Tooltip from './Tooltip';
// import CustomNode from './CustomNode';

// const nodeWidth = 172;
// const nodeHeight = 36;

// const nodeTypes = {
//   custom: CustomNode,
// };

// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

// const getLayoutedElements = (nodes, edges) => {
//   dagreGraph.setGraph({ rankdir: 'LR' });

//   nodes.forEach((node) => {
//     dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
//   });

//   edges.forEach((edge) => {
//     dagreGraph.setEdge(edge.source, edge.target);
//   });

//   dagre.layout(dagreGraph);

//   return nodes.map((node) => {
//     const nodeWithPosition = dagreGraph.node(node.id);
//     node.targetPosition = 'left';
//     node.sourcePosition = 'right';

//     node.position = {
//       x: nodeWithPosition.x - nodeWidth / 2,
//       y: nodeWithPosition.y - nodeHeight / 2,
//     };

//     return node;
//   });
// };

// const GraphBrowser = ({ moduleName }) => {
//   const navigate = useNavigate();
//   const { uuid } = useParams();
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [nodeCache, setNodeCache] = useState({});
//   const [showEdgeLabels, setShowEdgeLabels] = useState(true);
//   const [clickedNodes, setClickedNodes] = useState([]);
//   const [showButtons, setShowButtons] = useState(false);
//   const [tooltipDetails, setTooltipDetails] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: null, y: null });
//   const [showNodeTracker, setShowNodeTracker] = useState(false);
//   const tooltipTimeout = useRef(null);
//   const containerRef = useRef(null);

//   const extractLabel = (nodeType) => {
//     if (!nodeType) return '';
//     const parts = nodeType.split('.');
//     return parts[parts.length - 2];
//   };

//   const generateUniqueId = (prefix = 'id') => {
//     return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
//   };

//   const fetchNodes = async (nodeUuid) => {
//     if (nodeCache[nodeUuid]) {
//       displayNodesFromCache(nodeUuid);
//       return;
//     }

//     try {
//       const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
//       const data = await response.json();

//       const newCache = { ...nodeCache };
//       newCache[nodeUuid] = { ...data.data.nodes[0], details: data.data.nodes[0] };
//       setNodeCache(newCache);

//       displayNodes(newCache[nodeUuid], nodeUuid);
//     } catch (error) {
//       console.error('Error fetching nodes:', error);
//     }
//   };

//   const displayNodesFromCache = (nodeUuid) => {
//     const nodeData = nodeCache[nodeUuid];
//     displayNodes(nodeData, nodeUuid);
//   };

//   const displayNodes = (nodeData, nodeUuid) => {
//     const newNodes = [];
//     const newEdges = [];
  
//     const sortedIncoming = [...nodeData.incoming].sort((a, b) => 
//       extractLabel(a.node_type).localeCompare(extractLabel(b.node_type))
//     );
//     const sortedOutgoing = [...nodeData.outgoing].sort((a, b) => 
//       extractLabel(a.node_type).localeCompare(extractLabel(b.node_type))
//     );
//     // Main node
//     const mainNode = {
//       id: nodeUuid,
//       type: 'custom',
//       data: { label: extractLabel(nodeData.node_type) || nodeUuid },
//       position: { x: 0, y: 0 },
//     };
//     newNodes.push(mainNode);
  
//     // Incoming nodes
//     sortedIncoming.slice(0, 10).forEach((node, index) => {
//       const incomingNode = {
//         id: node.uuid,
//         type: 'custom',
//         data: { label: extractLabel(node.node_type) || node.uuid },
//         position: { x: -200, y: index * 120 },
//       };
//       newNodes.push(incomingNode);
//       newEdges.push({
//         id: generateUniqueId(`e${node.uuid}-${nodeUuid}`),
//         source: node.uuid,
//         target: nodeUuid,
//         // type: 'smoothstep',
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         style: {
//           strokeWidth: 1,
//           stroke: '#808080',
//         },
//         label: node.link_label,
//       });
//     });
  
//     // Custom incoming node for extras
//     if (nodeData.incoming.length > 10) {
//       const customIncomingNode = {
//         id: generateUniqueId(`incoming-custom-${nodeUuid}`),
//         type: 'custom',
//         data: { label: `(+${nodeData.incoming.length - 10}) nodes` },
//         position: { x: -200, y: 10 * 120 },
//       };
//       newNodes.push(customIncomingNode);
//       newEdges.push({
//         id: generateUniqueId(`e${customIncomingNode.id}-${nodeUuid}`),
//         source: customIncomingNode.id,
//         target: nodeUuid,
//         // type: 'smoothstep',
//         style: { stroke: '#808080', strokeWidth: 1 },
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         label: 'More Incoming Nodes',
//       });
//     }
  
//     // Outgoing nodes
//     sortedOutgoing.slice(0, 10).forEach((node, index) => {
//       const outgoingNode = {
//         id: node.uuid,
//         type: 'custom',
//         data: { label: extractLabel(node.node_type) || node.uuid },
//         position: { x: 200, y: index * 120 },
//       };
//       newNodes.push(outgoingNode);
//       newEdges.push({
//         id: generateUniqueId(`e${nodeUuid}-${node.uuid}`),
//         source: nodeUuid,
//         target: node.uuid,
//         // type: 'smoothstep',
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         style: {
//           strokeWidth: 1,
//           stroke: '#808080',
//         },
//         label: node.link_label,
//       });
//     });
  
//     // Custom outgoing node for extras
//     if (nodeData.outgoing.length > 10) {
//       const customOutgoingNode = {
//         id: generateUniqueId(`outgoing-custom-${nodeUuid}`),
//         type: 'custom',
//         data: { label: `(+${nodeData.outgoing.length - 10}) nodes` },
//         position: { x: 200, y: 10 * 120 },
//       };
//       newNodes.push(customOutgoingNode);
//       newEdges.push({
//         id: generateUniqueId(`e${nodeUuid}-${customOutgoingNode.id}`),
//         source: nodeUuid,
//         target: customOutgoingNode.id,
//         // type: 'smoothstep',
//         style: { stroke: '#808080', strokeWidth: 1 },
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#808080',
//         },
//         label: 'More Outgoing Nodes',
//       });
//     }
  
//     clickedNodes.forEach((prevNodeId, index) => {
//       if (prevNodeId !== nodeUuid) {
//         newNodes.push({
//           id: prevNodeId,
//           type: 'custom',
//           data: { label: extractLabel(nodeCache[prevNodeId].node_type) || prevNodeId },
//           position: { x: -400 - index * 200, y: 0 },
//         });
  
//         const isIncoming = nodeData.incoming.some(node => node.uuid === prevNodeId);
//         const isOutgoing = nodeData.outgoing.some(node => node.uuid === prevNodeId);
  
//         if (isIncoming || isOutgoing) {
//           newEdges.push({
//             id: generateUniqueId(`e${isIncoming ? prevNodeId : nodeUuid}-${isIncoming ? nodeUuid : prevNodeId}`),
//             source: isIncoming ? prevNodeId : nodeUuid,
//             target: isIncoming ? nodeUuid : prevNodeId,
//             animated: true,
//             style: { stroke: '#FFA500', strokeWidth: 2 },
//             markerEnd: {
//               type: MarkerType.ArrowClosed,
//               width: 20,
//               height: 20,
//               color: '#FFA500',
//             },
//             label: 'Previous',
//           });
//         } else if (index < clickedNodes.length - 1) {
//           newEdges.push({
//             id: generateUniqueId(`e${prevNodeId}-${clickedNodes[index + 1]}`),
//             source: prevNodeId,
//             target: clickedNodes[index + 1],
//             animated: true,
//             style: { stroke: '#FFA500', strokeWidth: 2 },
//             markerEnd: {
//               type: MarkerType.ArrowClosed,
//               width: 20,
//               height: 20,
//               color: '#FFA500',
//             },
//             label: 'Previous',
//           });
//         }
//       }
//     });
  
//     const layoutedNodes = getLayoutedElements(newNodes, newEdges).map((node) => ({
//       ...node,
//       style: {
//         ...node.style,
//         backgroundColor: clickedNodes.includes(node.id) ? '#d1e7dd' : '#fff',
//       },
//     }));
  
//     setNodes(layoutedNodes);
//     setEdges(newEdges);
//   };
  
//   const loadMoreNodes = (customNodeId) => {
//   };

//   useEffect(() => {
//     if (uuid) {
//       fetchNodes(uuid);
//       setClickedNodes(prev => [...prev, uuid]);
//     }
//   }, [uuid]);

//   const onNodeClick = useCallback((event, node) => {
//     if (node.id.includes('incoming-custom') || node.id.includes('outgoing-custom')) {
//       loadMoreNodes(node.id);
//     } else {
//       navigate(`/details/${node.id}`);
//       fetchNodes(node.id);
//     }
//   }, [nodeCache, navigate]);

//   const onNodeMouseEnter = useCallback(async (event, node) => {
//     clearTimeout(tooltipTimeout.current);
//     tooltipTimeout.current = setTimeout(async () => {
//       try {
//         const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${node.id}`);
//         const data = await response.json();
//         setTooltipDetails(data.data.nodes[0]);
//         setTooltipPosition({ x: event.clientX, y: event.clientY });
//       } catch (error) {
//         console.error('Error fetching node details:', error);
//       }
//     }, 200);
//   }, [moduleName]);

//   const onNodeMouseLeave = useCallback(() => {
//     clearTimeout(tooltipTimeout.current);
//     setTooltipDetails(null);
//   }, []);

//   const handleNodeClick = (event, node) => {
//     const updatedClickedNodes = [...clickedNodes, node.id];
//     setClickedNodes(updatedClickedNodes);
  
//     navigate(`/details/${node.id}`); 
//   };

//   const handleMouseOver = (event, node) => {
//     if (tooltipTimeout.current) {
//       clearTimeout(tooltipTimeout.current);
//       tooltipTimeout.current = null;
//     }

//     const { clientX, clientY } = event;
//     setTooltipDetails({ id: node.id, data: node.data });

//     const containerRect = containerRef.current.getBoundingClientRect();
//     const adjustedX = clientX - containerRect.left + 10;
//     const adjustedY = clientY - containerRect.top + 10; 

//     setTooltipPosition({ x: adjustedX, y: adjustedY });
//   };

//   const handleMouseLeave = () => {
//     if (tooltipTimeout.current) {
//       clearTimeout(tooltipTimeout.current);
//       tooltipTimeout.current = null;
//     }

//     tooltipTimeout.current = setTimeout(() => {
//       setTooltipDetails(null);
//       setTooltipPosition({ x: null, y: null });
//     }, 500);
//   };

//   const handleButtonClick = () => {
//     navigate('/');
//   };

//   const toggleEdgeLabels = () => {
//     setShowEdgeLabels(!showEdgeLabels);
//   };

//   const toggleButtons = () => setShowButtons(!showButtons);

//   const toggleNodeTracker = () => {
//     setShowNodeTracker(!showNodeTracker);
//   };

//   return (
//     <div className="graph-container relative flex flex-col items-center justify-center h-full" ref={containerRef}>

//       <div className="reactflow-wrapper w-full h-full relative">
//         <ReactFlowProvider>
//           <ReactFlow
//             nodes={nodes}
//             edges={edges.map((edge) => ({
//               ...edge,
//               label: showEdgeLabels ? edge.label : '',
//             }))}
//             onNodesChange={onNodesChange}
//             onEdgesChange={onEdgesChange}
//             onNodeClick={onNodeClick}
//             onNodeMouseEnter={handleMouseOver}
//             onNodeMouseLeave={handleMouseLeave}
//             fitView
//             attributionPosition="bottom-right"
//             nodeTypes={nodeTypes}
//           >
//             <MiniMap />
//             <Controls />
//             <Background />
//           </ReactFlow>
//         </ReactFlowProvider>

//         {tooltipDetails && (
//          <Tooltip
//          details={tooltipDetails}
//          position={tooltipPosition}
//          containerRef={containerRef}
//        />

//         )}
//       </div>
//       <button
//         onClick={toggleButtons}
//         className="fixed bottom-7 transform translate-x-1/2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-full"
//       >
//         <FaArrowUp />
//       </button>

//       {showButtons && (
//         <div className="fixed bottom-16 right-1/4 transform translate-x-1/2 flex justify-between items-center w-full max-w-xs bg-white p-4 rounded-lg shadow-lg">
//           <button
//             onClick={toggleEdgeLabels}
//             className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-full ml-2"
//           >
//             {showEdgeLabels ? <FaEyeSlash /> : <FaEye />}
//           </button>
//           <button
//             onClick={toggleNodeTracker}
//             className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-full ml-2"
//           >
//             {showNodeTracker ? <FaEyeSlash /> : <FaShapes />}
//           </button>
//         </div>
//       )}

//   {showNodeTracker && (
//         <div className="node-tracker w-[80vh] overflow-x-auto fixed bottom-32 bg-blue-200 p-4 rounded-lg shadow-lg">
//         <div className="flex items-center space-x-2">
//           {clickedNodes.map((nodeId, index) => (
//             <span key={nodeId} className="text-blue-700 text-xs">
//               {nodeId}
//               {index < clickedNodes.length - 1 && <span className="mx-1">-&gt;</span>}
//             </span>
//           ))}
//         </div>
//       </div>
//       )}
      
//       <Legend />
//     </div>
//   );
// };

// export default GraphBrowser;



import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, { 
    MiniMap, 
    Controls, 
    Background, 
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FaArrowUp, FaEye, FaEyeSlash, FaShapes } from 'react-icons/fa';
import dagre from 'dagre';
import Legend from './Legend';
import Tooltip from './Tooltip';
import CustomNode from './CustomNode';


const nodeWidth = 172;
const nodeHeight = 36;

const nodeTypes = {
  custom: CustomNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({
    rankdir: 'LR',
    ranksep: 150, 
    nodesep: 100, 
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'left';
    node.sourcePosition = 'right';

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });
};

const GraphBrowser = ({ moduleName }) => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCache, setNodeCache] = useState({});
  const [clickedNodes, setClickedNodes] = useState([]);
  const [tooltipDetails, setTooltipDetails] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: null, y: null });
  // const [showNodeTracker, setShowNodeTracker] = useState(false);
  const tooltipTimeout = useRef(null);
  const containerRef = useRef(null);
  const [showButtons, setShowButtons] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [showNodeTracker, setShowNodeTracker] = useState(false);

  const extractLabel = (nodeType) => {
    if (!nodeType) return '';
    const parts = nodeType.split('.');
    return parts[parts.length - 2];
  };

  const generateUniqueId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchNodes = async (nodeUuid) => {
    if (nodeCache[nodeUuid]) {
      displayNodesFromCache(nodeUuid);
      return;
    }

    try {
      const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${nodeUuid}/links/tree?`);
      const data = await response.json();

      const newCache = { ...nodeCache };
      newCache[nodeUuid] = { ...data.data.nodes[0], details: data.data.nodes[0] };
      setNodeCache(newCache);

      displayNodes(newCache[nodeUuid], nodeUuid);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const displayNodesFromCache = (nodeUuid) => {
    const nodeData = nodeCache[nodeUuid];
    displayNodes(nodeData, nodeUuid);
  };

  const displayNodes = (nodeData, nodeUuid) => {
    const newNodes = [];
    const newEdges = [];
  
    // Main node
    const mainNode = {
      id: nodeUuid,
      type: 'custom',
      data: { label: extractLabel(nodeData.node_type) , uuid: nodeUuid},
      position: { x: 0, y: 0 },
    };
    newNodes.push(mainNode);
  
    // Incoming nodes
    nodeData.incoming.slice(0, 10).forEach((node, index) => {
      const incomingNode = {
        id: node.uuid,
        type: 'custom',
        data: { label: extractLabel(node.node_type) , uuid: node.uid },
        position: { x: -200, y: index * 120 },
      };
      newNodes.push(incomingNode);
      newEdges.push({
        id: generateUniqueId(`e${node.uuid}-${nodeUuid}`),
        source: node.uuid,
        target: nodeUuid,
        // animated: true,
        type:'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#808080',
        },
        style: {
          strokeWidth: 1,
          stroke: '#808080',
        },
        label: node.link_label,
      });
    });
  
    // Custom incoming node for extras
    if (nodeData.incoming.length > 10) {
      const customIncomingNode = {
        id: generateUniqueId(`incoming-custom-${nodeUuid}`),
        type: 'custom',
        data: { label: `(+${nodeData.incoming.length - 10}) nodes` },
        position: { x: -200, y: 10 * 120 },
      };
      newNodes.push(customIncomingNode);
      newEdges.push({
        id: generateUniqueId(`e${customIncomingNode.id}-${nodeUuid}`),
        source: customIncomingNode.id,
        target: nodeUuid,
        // animated: true,
        type:'smoothstep',
        style: { stroke: '#808080', strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#808080',
        },
        label: 'More Incoming Nodes',
      });
    }
  
    // Outgoing nodes
    nodeData.outgoing.slice(0, 10).forEach((node, index) => {
      const outgoingNode = {
        id: node.uuid,
        type: 'custom',
        data: { label: extractLabel(node.node_type) , uuid: node.uuid },
        position: { x: 200, y: index * 120 },
      };
      newNodes.push(outgoingNode);
      newEdges.push({
        id: generateUniqueId(`e${nodeUuid}-${node.uuid}`),
        source: nodeUuid,
        target: node.uuid,
        // animated: true,
        type:'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#808080',
        },
        style: {
          strokeWidth: 1,
          stroke: '#808080',
        },
        label: node.link_label,
      });
    });

    if (nodeData.outgoing.length > 10) {
      const customOutgoingNode = {
        id: generateUniqueId(`outgoing-custom-${nodeUuid}`),
        type: 'custom',
        data: { label: `(+${nodeData.outgoing.length - 10}) nodes` },
        position: { x: 200, y: 10 * 120 },
      };
      newNodes.push(customOutgoingNode);
      newEdges.push({
        id: generateUniqueId(`e${nodeUuid}-${customOutgoingNode.id}`),
        source: nodeUuid,
        target: customOutgoingNode.id,
        animated: true,
        style: { stroke: '#808080', strokeWidth: 1 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#808080',
        },
        label: 'More Outgoing Nodes',
      });
    }

    clickedNodes.forEach((prevNodeId, index) => {
      if (prevNodeId !== nodeUuid) {
        newNodes.push({
          id: prevNodeId,
          type: 'custom',
          data: { label: extractLabel(nodeCache[prevNodeId].node_type) || prevNodeId },
          position: { x: -400 - index * 200, y: 0 },
        });

        const isIncoming = nodeData.incoming.some(node => node.uuid === prevNodeId);
        const isOutgoing = nodeData.outgoing.some(node => node.uuid === prevNodeId);
  
        if (isIncoming || isOutgoing) {
          newEdges.push({
            id: generateUniqueId(`e${isIncoming ? prevNodeId : nodeUuid}-${isIncoming ? nodeUuid : prevNodeId}`),
            source: isIncoming ? prevNodeId : nodeUuid,
            target: isIncoming ? nodeUuid : prevNodeId,
            // animated: true,
            type:'smoothstep',
            style: { stroke: '#FFA500', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#FFA500',
            },
            label: 'Previous',
          });
        } else if (index < clickedNodes.length - 1) {
          newEdges.push({
            id: generateUniqueId(`e${prevNodeId}-${clickedNodes[index + 1]}`),
            source: prevNodeId,
            target: clickedNodes[index + 1],
            animated: true,
            style: { stroke: '#FFA500', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#FFA500',
            },
            label: 'Previous',
          });
        }
      }
    });
  
    const layoutedNodes = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes , { draggable: false });
    setEdges(newEdges);
  };

  const loadMoreNodes = (customNodeId) => {
    const parts = customNodeId.split('-');
    const direction = parts[0];
    const parentId = parts.slice(2, -1).join('-');
  
    const parentNode = nodeCache[parentId];
    if (!parentNode) return;
  
    const nodesToLoad = direction === 'incoming'
      ? parentNode.incoming.slice(10)
      : parentNode.outgoing.slice(10);
  
    const newNodes = nodesToLoad.map((node, index) => ({
      id: node.uuid,
      type: 'custom',
      data: { label: extractLabel(node.node_type) || node.uuid , uuid: node.uuid },
      position: { x: 0, y: 0 }, 
    }));
  
    const newEdges = nodesToLoad.map((node) => ({
      id: generateUniqueId(`e${direction === 'incoming' ? node.uuid + '-' + parentId : parentId + '-' + node.uuid}`),
      source: direction === 'incoming' ? node.uuid : parentId,
      target: direction === 'incoming' ? parentId : node.uuid,
      // animated: true,
      type:'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#808080',
      },
      style: {
        strokeWidth: 1,
        stroke: '#808080',
      },
      label: node.link_label,
    }));
  
    const filteredNodes = nodes.filter(n => n.id !== customNodeId);
    const filteredEdges = edges.filter(e => e.source !== customNodeId && e.target !== customNodeId);
  
    const layoutedNodes = getLayoutedElements([...filteredNodes, ...newNodes], [...filteredEdges, ...newEdges]);
    setNodes(layoutedNodes , { draggable: false });
    setEdges([...filteredEdges, ...newEdges]);
  };

  useEffect(() => {
    if (uuid) {
      fetchNodes(uuid);
      setClickedNodes(prev => [...prev, uuid]);
    }
  }, [uuid]);

  const onNodeClick = useCallback((event, node) => {
    if (node.id.includes('incoming-custom') || node.id.includes('outgoing-custom')) {
      loadMoreNodes(node.id);
    } else {
      navigate(`/${moduleName}/details/${node.id}`);
      fetchNodes(node.id);
    }
  }, [nodeCache, navigate]);

  const onNodeMouseEnter = useCallback(async (event, node) => {
    clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${node.id}`);
        const data = await response.json();
        setTooltipDetails(data.data.nodes[0]);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      } catch (error) {
        console.error('Error fetching node details:', error);
      }
    }, 200);
  }, [moduleName]);

  const onNodeMouseLeave = useCallback(() => {
    clearTimeout(tooltipTimeout.current);
    setTooltipDetails(null);
  }, []);

  const toggleEdgeLabels = () => setShowEdgeLabels(!showEdgeLabels);
  const toggleNodeTracker = () => setShowNodeTracker(!showNodeTracker);
  const toggleButtons = () => setShowButtons(!showButtons);

  return (
    <div className="h-full w-full relative" ref={containerRef}>
      <Legend />
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges.map((edge) => ({
            ...edge,
            label: showEdgeLabels ? edge.label : '',
          }))}
          nodesDraggable={false} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          fitView
          nodeTypes={nodeTypes}
        >
          <MiniMap />
          
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
      {tooltipDetails && (
        <Tooltip
          details={tooltipDetails}
          position={tooltipPosition}
          containerRef={containerRef}
        />
      )}
      <button
        onClick={toggleButtons}
        className="fixed bottom-4 right-1/4 transform translate-x-1/2 bg-orange-200 hover:bg-orange-300 text-orange-700 font-bold py-2 px-4 rounded-full"
      >
        <FaArrowUp />
      </button>

      {showButtons && (
        <div className="fixed bottom-16 right-1/4 transform translate-x-1/2 flex justify-between items-center w-full max-w-xs bg-white p-4 rounded-lg shadow-lg">
          <button
            onClick={toggleEdgeLabels}
            className="bg-green-200 hover:bg-green-300 text-green-700 font-bold py-2 px-4 rounded-full ml-2"
          >
            {showEdgeLabels ? <FaEyeSlash /> : <FaEye />}
          </button>
          <button
            onClick={toggleNodeTracker}
            className="bg-red-200 hover:bg-red-300 text-red-700 font-bold py-2 px-4 rounded-full ml-2"
          >
            {showNodeTracker ? <FaEyeSlash /> : <FaShapes />}
          </button>
        </div>
      )}

      {showNodeTracker && (
        <div className="absolute w-full bottom-24 bg-blue-200 p-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
          {clickedNodes.map((nodeId, index) => (
              <span key={nodeId} className="text-blue-700 text-xs">
                {nodeId}
                {index < clickedNodes.length - 1 && <span className="mx-1">-&gt;</span>}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <Legend />
    </div>
  );
};

const NodeTracker = ({ nodes }) => {
  return (
    <div className="absolute font-mono bottom-16 border-[1px] border-gray-400 left-4 right-4 bg-white p-2 rounded shadow">
      {/* <h4 className="font-light text-sm mb-2">Node History:</h4> */}
      <div className="flex overflow-x-auto">
        {nodes.map((nodeId, index) => (
          <div key={nodeId} className="flex text-xs mb-2 items-center">
            <span className="px-2 py-1 bg-orange-50 border-[1px] border-fray-300 rounded mr-2">{nodeId}</span>
            {index < nodes.length - 1 && <span className="mr-2">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
};  

export default GraphBrowser;