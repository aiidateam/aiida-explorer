import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getNodeStyle = (label) => {
  switch (label.toLowerCase()) {
    case 'calcjobnode':
      return {
        background: '#FF9999',
        borderRadius: '8px',
        width: '120px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000', 
        overflow: 'hidden',
      };
    case 'structure':
      return {
        background: '#99FF99',
        borderRadius: '50%',
        width: '150px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        overflow: 'hidden',
      };
    case 'dict':
      return {
        background: '#9999FF',
        borderRadius: '8px',
        width: '150px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        overflow: 'hidden',
      };
    default:
      return {
        background: '#FFCC80',
        borderRadius: '4px',
        width: '150px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        overflow: 'hidden',
      };
  }
};

const CustomNode = ({ data, isConnectable }) => {
  const nodeStyle = getNodeStyle(data.label);

  return (
    <div style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div style={{ fontSize: '14px' }}>{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomNode);