import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { CiSearch } from 'react-icons/ci';

const memo = new Map();

const buildTree = (node) => {
  if (memo.has(node.full_type)) {
    return memo.get(node.full_type);
  }

  const label = node.label || 'No Label';
  const full_type = node.full_type || '';
  const subspaces = node.subspaces || [];
  const children = subspaces.map(buildTree);

  const result = { label, full_type, children, counter: node.counter };
  memo.set(node.full_type, result);
  return result;
};

const fetchPageData = async (fullType, page, onDataFetch, moduleName, entriesPerPage = 20) => {
  const baseUrl = `https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/page/`;
  const urlEnd = '25%7C"&orderby=-ctime';

  fullType = fullType.replace(/\|/g, '');
  fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
  let url = `${baseUrl}${page}?&perpage=${entriesPerPage}&full_type="${fullType}${urlEnd}`;

  if (fullType.includes('process')) {
    fullType = fullType.replace(/\%/g, '');
    fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
    url = `${baseUrl}${page}?&perpage=${entriesPerPage}&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&full_type="${fullType}25%7C%25"&orderby=-ctime`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    onDataFetch(data.data.nodes, page, data.data.total_entries, Math.ceil(data.data.total_entries / entriesPerPage));
  } catch (error) {
    console.error(`Error fetching data for ${fullType} on page ${page}:`, error);
  }
};

const TreeNode = ({ node, onSelectNode, currentPage, setSelectedNode, moduleName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setSelectedNode(node);
      await fetchPageData(node.full_type, currentPage, onSelectNode, moduleName);
    }
  };

  return (
    <div className="ml-0 mt-1">
      <div
        className="cursor-pointer text-gray-900 bg-gray-100 min-w-fit p-2 rounded hover:bg-gray-200 flex items-center"
        onClick={toggleExpand}
      >
        <FiChevronDown className={`w-4 h-4 mr-2 transform transition-transform duration-200 ${isExpanded ? '-rotate-90' : ''}`} />
        {node.label}
      </div>
      {isExpanded && (
        <div className="ml-4 mt-2">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} onSelectNode={onSelectNode} moduleName={moduleName} currentPage={currentPage} setSelectedNode={setSelectedNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ onSelectNode, currentPage, setSelectedNode, moduleName }) => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/full_types_count/`);
        const data = await response.json();
        const rootNode = buildTree(data.data);
        setTree(rootNode.children);
      } catch (error) {
        console.error('Error fetching tree data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleName]);

  if (loading) {
    return <div className="text-center text-gray-700 bg-blue-100">Loading...</div>;
  }

  if (!tree.length) {
    return <div className="text-center text-gray-700 bg-blue-100">No data available</div>;
  }

  return (
    <div>
      {tree.map((child, index) => (
        <TreeNode key={index} node={child} onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} moduleName={moduleName} />
      ))}
    </div>
  );
};

const GridViewer = ({ onSelectNode, currentPage,setCurrentPage, setSelectedNode, moduleName }) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedNodeState, setSelectedNodeState] = useState(null);

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    if (selectedNodeState) {
      await fetchPageData(selectedNodeState.full_type, newPage, onSelectNode, moduleName);
    }
  };

  const handleNodeSelect = (node) => {
    setSelectedNodeState(node);
    setSelectedNode(node);
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-300 overflow-auto h-full">
      <TreeView onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} moduleName={moduleName} />
      <hr className='my-4 text-gray-800  '/>
      <div className='mt-2 border-2 rounded-sm bg-gray-200 hover:bg-gray-300 p-2 text-center text-md'>
        Computers
      </div>
    </div>
  );
};

export default GridViewer;
