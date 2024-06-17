// CustomNode.jsx
import React from 'react';
import { Handle } from 'reactflow';

const CustomNode = ({ id, data, isConnectable, onMouseEnter, onMouseLeave }) => {
  return (
    <div
      onMouseEnter={(event) => onMouseEnter(event, id)}
      onMouseLeave={onMouseLeave}
      className="custom-node"
      style={{ background: data.color }}
    >
      {data.label}
      <Handle type="target" position="top" isConnectable={isConnectable} />
      <Handle type="source" position="bottom" isConnectable={isConnectable} />
    </div>
  );
};

export default CustomNode;
