import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const baseUrl = 'https://aiida.materialscloud.org/mc3d/api/v4/nodes/page/';
const urlEnd = '&orderby=-ctime';
const processUrlEnd = '&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&orderby=-ctime';

const buildTree = (node) => {
  const label = node.label || 'No Label';
  const full_type = node.full_type || '';
  const subspaces = node.subspaces || [];
  const children = subspaces.map(buildTree);
  return { label, full_type, children };
};

const fetchAllPages = async (fullType, onDataFetch) => {
  let allData = [];
  let page = 1;
  let hasMoreData = true;
  const isProcessType = fullType.includes('process');
  const fullTypeEncoded = fullType.replace(/\|/g, '');
  console.log(fullTypeEncoded)

  while (hasMoreData) {
    try {
      const url = `${baseUrl}${page}?&perpage=50&full_type="${fullTypeEncoded}25%7C"${isProcessType ? processUrlEnd : urlEnd}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.data.nodes.length > 0) {
        allData = [...allData, ...data.data.nodes];
        page++;
      } else {
        hasMoreData = false;
      }
    } catch (error) {
      console.error(`Error fetching data for ${fullType} on page ${page}:`, error);
      hasMoreData = false;
    }
  }
  console.log(allData);

  onDataFetch(allData);
};

const TreeNode = ({ node, onSelectNode, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      fetchAllPages(node.full_type, onSelectNode);
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
            <TreeNode key={index} node={child} onSelectNode={onSelectNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ onSelectNode,currentPage }) => {
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

  return <TreeNode node={tree} onSelectNode={onSelectNode} />;
};

const GridViewer = ({ onSelectNode , currentPage }) => {
  return (
    <div className="p-4 bg-white border-2 border-gray-300 overflow-auto h-[98vh]">
      <TreeView onSelectNode={onSelectNode} currentPage={currentPage} />
    </div>
  );
}

export default GridViewer;
