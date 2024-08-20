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
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaEye, FaEyeSlash, FaShapes } from 'react-icons/fa';
import Legend from './Legend';
import Tooltip from './Tooltip';
import CustomEdge from './CustomEdge';
import CustomNode from './CustomNode';
import Breadcrumbs from '../BreadCrumb';

const nodeWidth = 172;
const nodeHeight = 36;
const CENTRAL_X = 600;
const CENTRAL_Y = 300;
const INPUT_X = 200;
const OUTPUT_X = 1000;
// const LIMIT = 1000;

const LoadMoreNode = ({ data }) => (
  <div 
    className="load-more-node"
    style={{
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      cursor: 'pointer'
    }}
    onClick={() => data.onClick(data.type)}
  >
    Load More ({data.count})
  </div>
);

const labelNode = ({ data }) => (
  <div 
    className="px-3 text-center font-mono text-emerald-700 flex justify-center text-xl"
    style={{
      background: 'transparent',
      border: '1px solid #ccf',
      color: 'black',
      textAlign: 'center',
      cursor: 'default'
    }}
  >
    {(data.label).toUpperCase()}
  </div>
);

const nodeTypes = {
  custom: React.memo(CustomNode),
  loadMore: LoadMoreNode,
  label : labelNode
};


const edgeTypes = {
  custom: CustomEdge,
};

const GraphBrowser = ({ apiUrl }) => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCache, setNodeCache] = useState({});
  const [clickedNodes, setClickedNodes] = useState([]);
  const [tooltipDetails, setTooltipDetails] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: null, y: null });
  const tooltipTimeout = useRef(null);
  const containerRef = useRef(null);
  const [showButtons, setShowButtons] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [showNodeTracker, setShowNodeTracker] = useState(false);
  const [centralNode, setCentralNode] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [previouslySelectedNode, setPreviouslySelectedNode] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);


  const API_URL = `${apiUrl}`

  const handleLoadMore = useCallback((type) => {
    setNodes((nds) => {
      const loadMoreNodeIndex = nds.findIndex(n => n.id === `loadMore-${type}`);
      if (loadMoreNodeIndex === -1) return nds;
  
      const loadMoreNode = nds[loadMoreNodeIndex];
      const { remainingNodes } = loadMoreNode.data;
      const nodesToAdd = remainingNodes.slice(0, 10);
      const newRemainingNodes = remainingNodes.slice(10);
  
      let y = loadMoreNode.position.y;
      const yIncrement = type.includes('Logical') ? 70 : 100;
      const startX = type.includes('input') ? INPUT_X : OUTPUT_X;
  
      const newNodes = nodesToAdd.map((node) => {
        y += yIncrement;
        return createNode(node, startX, y);
      });
  
      const newEdges = nodesToAdd.map((node, index) => 
        createEdge(
          type.includes('input') ? node.uuid : uuid,
          type.includes('input') ? uuid : node.uuid,
          node.link_label,
          !type.includes('input'),
          nds.filter(n => n.type === 'custom').length + index
        )
      );
  
      setEdges(eds => [...eds, ...newEdges]);
  
      if (newRemainingNodes.length > 0) {
        return [
          ...nds.slice(0, loadMoreNodeIndex),
          ...newNodes,
          {
            ...loadMoreNode,
            data: {
              ...loadMoreNode.data,
              count: newRemainingNodes.length,
              remainingNodes: newRemainingNodes
            },
            position: { x: startX, y: y + yIncrement }
          },
          ...nds.slice(loadMoreNodeIndex + 1)
        ];
      } else {
        return [
          ...nds.slice(0, loadMoreNodeIndex),
          ...newNodes,
          ...nds.slice(loadMoreNodeIndex + 1)
        ];
      }
    });
  }, [uuid, setNodes, setEdges]);

  const extractLabel = (nodeType) => {
    if (!nodeType) return '';
    const parts = nodeType.split('.');
    return parts[parts.length - 2];
  };

  const fetchCentralNode = async (uuid) => {
    try {
      const res = await fetch(`${apiUrl}/nodes/${uuid}`);
      const data = await res.json();
      const nodeType = data.data.nodes[0].node_type;
      const label = extractLabel(nodeType);
      return { nodeType, label };
    } catch (error) {
      console.error('Error fetching central node:', error);
      return null;
    }
  };  
  const fetchAndSetCentralNode = async () => {
    if (uuid) {
      const nodeInfo = await fetchCentralNode(uuid);
      if (nodeInfo) {
        setCentralNode(nodeInfo.label);
        console.log(nodeInfo.label, "-->Central");
      }
    }
  };
  
  useEffect(() => {
    fetchAndSetCentralNode();
  }, [uuid]);

  const fetchLinks = async (uuid, fullType, direction = "incoming", offset = 0) => {
    let url = `${API_URL}/nodes/${uuid}/links/${direction}`;
    url += `?orderby=+ctime&full_type="${fullType}"`;
  
    try {
      console.log('Fetching URL:', url);
      const response = await fetch(url);
      const result = await response.json();
      const totalCount = response.headers.get("X-Total-Count");
  
      return {
        totalCount: totalCount,
        links: direction === "incoming" ? result.data.incoming : result.data.outgoing,
      };
    } catch (error) {
      console.error("Error:", error);
      return { totalCount: 0, links: [] };
    }
  };

  const fetchAllLinks = async (uuid) => {
    try {
      const inputLogical = await fetchLinks(uuid, "process.%25%7C%25", "incoming");
      const inputData = await fetchLinks(uuid, "data.%25%7C%25", "incoming");
      const outputLogical = await fetchLinks(uuid, "process.%25%7C%25", "outgoing");
      const outputData = await fetchLinks(uuid, "data.%25%7C%25", "outgoing");
      return {
        inputLogical,
        inputData,
        outputLogical,
        outputData,
      };
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const generateUniqueId = (prefix = 'id') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createNode = useCallback((nodeData, x, y, style = {}) => {
    const isCentralNode = nodeData.uuid === uuid;
    const isPreviouslySelected = nodeData.uuid === previouslySelectedNode;
    let label = isCentralNode ? centralNode : extractLabel(nodeData.node_type);
  
    return {
      id: nodeData.uuid,
      type: 'custom',
      data: { 
        label, 
        uuid: nodeData.uuid, 
        isPreviouslySelected,
        isCentralNode
      },
      position: { x, y },
      sourcePosition: 'right',
      targetPosition: 'left',
      style,
    };
  }, [uuid, centralNode, previouslySelectedNode]);

  useEffect(() => {
    const fetchAndSetCentralNode = async () => {
      if (uuid) {
        const nodeType = await fetchCentralNode(uuid);
        setCentralNode(nodeType.label);
        console.log(nodeType.label, "-->Central"); 
      }
    };
    
    fetchAndSetCentralNode();
  }, []);

 const createEdge = useCallback((source, target, label, isOutgoing, index) => ({
    id: generateUniqueId(`e${source}-${target}`),
    source,
    target,
    type: 'custom',
    data: { 
      label, 
      showLabel: showEdgeLabels, 
      index: isOutgoing ? index + 1 : undefined,
      isPreviouslySelected: source === previouslySelectedNode || target === previouslySelectedNode
    },
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
  }), [showEdgeLabels, previouslySelectedNode]);

  const fetchNodes = async (nodeUuid) => {
    if (nodeCache[nodeUuid]) {
      console.log("Using cached data for", nodeUuid);
      displayNodesFromCache(nodeUuid);
      return;
    }

    try {
      console.log("Fetching data for", nodeUuid);
      const data = await fetchAllLinks(nodeUuid);
      console.log("Received data:", data);
      if (!data) {
        console.log("No data received");
        return;
      }

      const newCache = { ...nodeCache };
      newCache[nodeUuid] = data;
      setNodeCache(newCache);

      displayNodes(data, nodeUuid);
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
      // const d = new Date();
      // let time = d.getTime();
    const centralNode = createNode({ uuid: nodeUuid, node_type: 'central' }, CENTRAL_X, CENTRAL_Y+100);
    newNodes.push(centralNode);
  
    const createNodesWithLoadMore = (nodes, startX, startY, yIncrement, type, isReverse = false) => {
      if (nodes.length === 0) return;

      let y = startY;
      const nodesToDisplay = isReverse ? nodes.slice().reverse() : nodes;
      const dummyNode = {
        id: `dummy-${type}`,
        type: 'label',
        data: { label: type },
        position: { x: startX, y: startY - yIncrement },
        style: {
          backgroundColor: 'transparent',
          border: 'none',
          color: 'transparent'
        },
      };
      
      newNodes.push(dummyNode);
      newEdges.push(createEdge(dummyNode.id, dummyNode.id, '', false, 0));
      
      nodesToDisplay.slice(0, 10).forEach((node, index) => {
        const newNode = createNode(node, startX, y);
        newNodes.push(newNode);
        newNode.originalPosition = { x: startX, y };
        newEdges.push(createEdge(
          type.includes('input') ? node.uuid : nodeUuid,
          type.includes('input') ? nodeUuid : node.uuid,
          node.link_label,
          !type.includes('input'),
          index
        ));
        y += yIncrement;
      });
  
      if (nodes.length > 10) {
        const loadMoreNode = {
          id: `loadMore-${type}`,
          type: 'loadMore',
          data: { 
            count: nodes.length - 10, 
            type, 
            onClick: handleLoadMore,
            remainingNodes: nodes.slice(10)
          },
          position: { x: startX, y },
        };
        const loadMoreEdge = {
          id: `loadEdge-${type}`,
          type: 'custom',
          source: `loadMore-${type}`,
          target :centralNode,
          data: { 
            count: nodes.length - 10, 
            type, 
            onClick: handleLoadMore,
            remainingNodes: nodes.slice(10)
          },
          position: { x: startX, y },
        };
        newNodes.push(loadMoreNode);
        newEdges.push(loadMoreEdge);
      }
    };
  
    createNodesWithLoadMore(nodeData.inputLogical.links, INPUT_X, CENTRAL_Y - 300, 100, 'logical Input', true);
    createNodesWithLoadMore(nodeData.inputData.links, INPUT_X, CENTRAL_Y, 100, 'input Data');
    createNodesWithLoadMore(nodeData.outputLogical.links, OUTPUT_X, CENTRAL_Y - 300, 100, 'logical Output', true);
    createNodesWithLoadMore(nodeData.outputData.links, OUTPUT_X, CENTRAL_Y, 100, 'output Data');
  
    setNodes(newNodes);
    setEdges(newEdges);
  };


  useEffect(() => {
    fetchNodes(uuid);
  }, [uuid]);

  //   const { uuid } = node.data;
  //   setClickedNodes((prevClickedNodes) => [...prevClickedNodes, uuid]);
  //   navigate(`/${moduleName}/details/${uuid}`);
  // }, [navigate, moduleName]);

  // const handleNodeClick = useCallback((event, node) => {
  //   const { uuid } = node.data;
  //   setClickedNodes((prevClickedNodes) => [...prevClickedNodes, uuid]);
  //   setIsTransitioning(true);

  //   setNodes((nds) =>
  //     nds.map((n) => ({
  //       ...n,
  //       position: { x: CENTRAL_X, y: CENTRAL_Y },
  //       style: { ...n.style, transition: 'all 0.5s ease-in-out' },
  //     }))
  //   );

  //   setEdges((eds) =>
  //     eds.map((e) => ({
  //       ...e,
  //       style: { ...e.style, opacity: 0, transition: 'opacity 0.5s ease-in-out' },
  //     }))
  //   );

  //   setTimeout(() => {
  //     fetchNodes(uuid);
  //     setIsTransitioning(false);
  //   }, 500);

  //   navigate(`/${moduleName}/details/${uuid}`);
  // }, [navigate, moduleName, fetchNodes]);

  const handleNodeClick = useCallback((event, node) => {
    if (node.type === 'loadMore') {
      handleLoadMore(node.data.type);
      return;
    }

    const { uuid } = node.data;
    setPreviouslySelectedNode(uuid);
    setClickedNodes((prevClickedNodes) => [...prevClickedNodes, uuid]);
    // setClickedNodes((prevClickedNodes) => [...prevClickedNodes, uuid]);
    setIsTransitioning(true);
    setAnimationPhase('shrinking');

    setBreadcrumbs((prevBreadcrumbs) => {
      const newBreadcrumbs = [
        ...prevBreadcrumbs,
        { nodes: nodes, edges: edges, centralNode: uuid, label: node.data.label }
      ];
      return newBreadcrumbs.slice(-5);
    });

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        position: { x: CENTRAL_X, y: CENTRAL_Y },
        style: { ...n.style, transition: 'all 0.5s ease-in-out' },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...e.style, opacity: 0, transition: 'opacity 0.5s ease-in-out' },
      }))
    );

    setTimeout(() => {
      fetchNodes(uuid);
      setAnimationPhase('expanding');

      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            position: n.position, 
            style: { ...n.style, transition: 'all 0.5s ease-in-out' },
          }))
        );
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            style: { ...e.style, opacity: 1, transition: 'opacity 0.5s ease-in-out' },
          }))
        );

        setTimeout(() => {
          setIsTransitioning(false);
          setAnimationPhase('idle');
        }, 500);
      }, 100);
    }, 500);

    navigate(`/mc3d/details/${uuid}`);
  }, [navigate, apiUrl, fetchNodes]);

  const handleBreadcrumbClick = useCallback((index) => {
    const { nodes: breadcrumbNodes, edges: breadcrumbEdges, centralNode } = breadcrumbs[index];
    setPreviouslySelectedNode(centralNode);
    setNodes(breadcrumbNodes.map(node => ({
      ...node,
      data: { ...node.data, isPreviouslySelected: node.id === centralNode }
    })));
    setEdges(breadcrumbEdges.map(edge => ({
      ...edge,
      data: { ...edge.data, isPreviouslySelected: edge.source === centralNode || edge.target === centralNode }
    })));
    navigate(`/mc3d/details/${centralNode}`);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  }, [breadcrumbs, navigate]);


  const handleMouseEnter = (event, node) => {
    clearTimeout(tooltipTimeout.current);
    console.log(node)
    setTooltipDetails(node.data);
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPosition({ x: event.clientX, y: event.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    tooltipTimeout.current = setTimeout(() => {
      setTooltipDetails(null);
    }, 500);
  };

  const toggleButtons = () => setShowButtons(!showButtons);

const toggleEdgeLabels = () => {
  setShowEdgeLabels((prev) => !prev);
  setEdges((eds) =>
    eds.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        showLabel: !showEdgeLabels,
      },
    }))
  );
};

  const toggleNodeTracker = () => setShowNodeTracker(!showNodeTracker);

  return (
    <div ref={containerRef} className='h-full relative'>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={handleMouseEnter}
          onNodeMouseLeave={handleMouseLeave}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
        >
          <MiniMap />
          <Controls style={{ backgroundColor: '#fff' }}>
            <button
              className="m-auto  bg-slate-300"
              title="Show/Hide Buttons"
              onClick={toggleButtons}
              style={{ backgroundColor: 'transparent', color: 'black' }}
            >
              <FaArrowUp className='p-auto text-orange-700 items-center flex justify-center m-1 mt-2 mb-0' />
            </button>
          </Controls>
          <Background />
        </ReactFlow>
        {tooltipDetails && (
        <Tooltip
          apiUrl = {apiUrl}
          details={tooltipDetails}
          position={tooltipPosition}
          containerRef={containerRef}
        />
      )}
       <Breadcrumbs breadcrumbs={breadcrumbs} handleBreadcrumbClick={handleBreadcrumbClick} />
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
        {/* <Legend /> */}
      </ReactFlowProvider>
    </div>
  );
};

export default GraphBrowser;
