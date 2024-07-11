import React, { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const buildTree = (node) => {
  let subspaces = node.subspaces || [];
  return {
    label: node.label || "No Label",
    full_type: node.full_type || "",
    children: subspaces.map(buildTree),
    counter: node.counter,
  };
};

const TreeNode = ({ node, onSelectNode, selectedNode }) => {
  const isSelected = node.full_type === selectedNode.full_type;
  const [isExpanded, setIsExpanded] = useState(isSelected);

  const expandAndSelect = () => {
    setIsExpanded(!isExpanded);
    onSelectNode(node);
  };

  return (
    <div className="ml-0 mt-1">
      <div
        className={`cursor-pointer text-gray-900 min-w-fit p-2 rounded hover:bg-gray-200 flex items-center
          ${isSelected ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        onClick={expandAndSelect}
      >
        <FiChevronDown
          className={`w-4 h-4 mr-2 transform transition-transform duration-200 ${
            isExpanded ? "" : "-rotate-90 "
          }`}
        />
        {node.label}
      </div>
      {isExpanded && (
        <div className="ml-4 mt-2 focus:bg-gray-500 active:bg-gray-500">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              onSelectNode={onSelectNode}
              selectedNode={selectedNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView = ({ fullTypeCounts, selectedNode, onSelectNode }) => {
  let loading = fullTypeCounts == null;

  if (loading) {
    return (
      <div className="text-center text-gray-700 bg-blue-100">Loading...</div>
    );
  }

  const tree = buildTree(fullTypeCounts).children;

  if (!tree.length) {
    return (
      <div className="text-center text-gray-700 bg-blue-100">
        No data available
      </div>
    );
  }

  return (
    <div>
      {tree.map((child, index) => (
        <TreeNode
          key={index}
          node={child}
          onSelectNode={onSelectNode}
          selectedNode={selectedNode}
        />
      ))}
    </div>
  );
};

const FilterSidebar = ({ fullTypeCounts, selectedNode, onSelectNode }) => {
  return (
    <div className="p-4 bg-white border-2 border-gray-300 overflow-auto h-full">
      <TreeView
        fullTypeCounts={fullTypeCounts}
        selectedNode={selectedNode}
        onSelectNode={onSelectNode}
      />
    </div>
  );
};

export default FilterSidebar;
