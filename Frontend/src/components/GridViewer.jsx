import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { CiSearch } from 'react-icons/ci';


const memo = new Map();

const buildTree = (node) => {
  if (memo.has(node)) {
    return memo.get(node);
    }
    
    const label = node.label || 'No Label';
    const full_type = node.full_type || '';
    const subspaces = node.subspaces || [];
    const children = subspaces.map(buildTree);
    
    const result = { label, full_type, children, counter: node.counter };
    memo.set(node, result);
    return result;
    };
    
const fetchPageData = async (fullType, page, onDataFetch, moduleName) => {
  const baseUrl = `https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/page/`;
  const urlEnd = '25%7C"&orderby=-ctime';
  const processUrlEnd = '&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&orderby=-ctime';
  fullType = fullType.replace(/\|/g, '');
  fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
  let url = `${baseUrl}${page}?&perpage=20&full_type="${fullType}${urlEnd}`;

  if (fullType.includes('process')) {
    fullType = fullType.replace(/\%/g, '');
    fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
    url = `${baseUrl}${page}?&perpage=20&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&full_type="${fullType}25%7C%25"&orderby=-ctime`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    onDataFetch(data.data.nodes, page);
  } catch (error) {
    console.error(`Error fetching data for ${fullType} on page ${page}:`, error);
  }
};

const TreeNode = ({ node, onSelectNode, currentPage, setSelectedNode, moduleName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      fetchPageData(node.full_type, currentPage, onSelectNode, moduleName);
      setSelectedNode(node);
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
            <TreeNode key={index} node={child}  onSelectNode={onSelectNode} moduleName={moduleName} currentPage={currentPage} setSelectedNode={setSelectedNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ onSelectNode, currentPage, setSelectedNode , moduleName }) => {
  const [tree, setTree] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/full_types_count/`);
      const data = await response.json();
      const rootNode = buildTree(data.data);
      setTree(rootNode.children); 
    };

    fetchData();
  }, []);

  if (!tree.length) {
    return <div className="text-center text-gray-700 bg-blue-100">Loading...</div>;
  }

  return (
    <div>
      {tree.map((child, index) => (
        <TreeNode key={index} node={child} onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} moduleName={moduleName} />
      ))}
    </div>
  );
};

const GridViewer = ({ onSelectNode, currentPage, setSelectedNode , moduleName }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="p-4 bg-white border-2 border-gray-300 overflow-auto h-full">
      <div className="w-full flex items-center border-2 mb-3 border-gray-400 hover:border-gray-600">
        <input
          type="search"
          placeholder="Search UUID"
          className="w-full p-2 border-0 border-white outline-none"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              window.location.href = `/details/${searchValue}`;
            }
          }}
        />
        <CiSearch
          className="text-center size-6 item-center mr-2"
          onClick={() => {
            window.location.href = `/details/${searchValue}`;
          }}
        />
      </div>

      <TreeView onSelectNode={onSelectNode} currentPage={currentPage} setSelectedNode={setSelectedNode} moduleName={moduleName} />
    </div>
  );
};

export default GridViewer;
