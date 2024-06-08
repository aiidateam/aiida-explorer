import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const baseUrl = 'https://aiida.materialscloud.org/mc3d/api/v4/nodes/page/';
const urlEnd = '25%7C"&orderby=-ctime';
const processUrlEnd = '&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&orderby=-ctime';

const memo = new Map();

const buildTree = (node) => {
  if (memo.has(node)) {
    return memo.get(node);
  }

  const label = node.label || 'No Label';
  const full_type = node.full_type || '';
  const subspaces = node.subspaces || [];
  const children = subspaces.map(buildTree);
  console.log(node.counter);

  const result = { label, full_type, children, counter: node.counter };
  memo.set(node, result);
  return result;
};
    
const fetchPageData = async (fullType, page, onDataFetch) => {
//   const isProcessType = fullType.includes('process');
//   const fullTypeEncoded = fullType.replace(/\|/g, '');
//   fullType = isProcessType ? fullType.replace('%%', '%') : fullType;
fullType = fullType.replace(/\|/g, '');
fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
  let url = `${baseUrl}${page}?&perpage=20&full_type="${fullType}${urlEnd}`;
  console.log(url);
    if (fullType.includes('process')) {
        fullType = fullType.replace(/\%/g,'');
        fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
        url = `${baseUrl}${page}?&perpage=20&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&full_type="${fullType}25%7C%25"&orderby=-ctime`;
        console.log(url);
    }

//   const url = `${baseUrl}${page}?&perpage=20&full_type="${fullTypeEncoded}25%7C"${isProcessType ? processUrlEnd : urlEnd}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    onDataFetch(data.data.nodes, page);
  } catch (error) {
    console.error(`Error fetching data for ${fullType} on page ${page}:`, error);
  }
};

const TreeNode = ({ node, onSelectNode, currentPage, setSelectedNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      fetchPageData(node.full_type, currentPage, onSelectNode);
      setSelectedNode(node);
    }
  };

  return (
    <div className="ml-0 mt-1">
      <div
        className="cursor-pointer text-gray-900 mr-2 bg-gray-100 min-w-fit p-2 rounded hover:bg-gray-200 flex items-center"
        onClick={toggleExpand}
      >
        <FiChevronDown className={`w-4 h-4 mr-2 transform transition-transform duration-200 ${isExpanded ? '-rotate-90' : ''}`} />
        {node.label}
      </div>
      {isExpanded && (
        <div className="ml-4 mt-2">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ onSelectNode, currentPage, setSelectedNode }) => {
  const [tree, setTree] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://aiida.materialscloud.org/mc3d/api/v4/nodes/full_types_count/');
      const data = await response.json();
      const treeData = buildTree(data.data);
      setTree(treeData);
    };

    fetchData();
  }, []);

  if (!tree) {
    return <div className="text-center text-gray-700 bg-blue-100">Loading...</div>;
  }

  return <TreeNode node={tree} onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} />;
};

const GridViewer = ({ onSelectNode, currentPage, setSelectedNode }) => {
  return (
    <div className="p-4 bg-white border-2 border-gray-300 overflow-auto h-full">
      <TreeView onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} />
    </div>
  );
};

export default GridViewer;