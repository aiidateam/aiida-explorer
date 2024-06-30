import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const getNodeStyle = (label) => {
  switch (label.toLowerCase()) {
    case 'calcjob':
      return { 
        background: '#FF9999', 
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        width: '150px',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };
    case 'structure':
      return { 
        background: '#99FF99', 
        borderRadius: '50%',
        width: '100px',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };
    case 'dict':
      return { 
        background: '#9999FF', 
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        width: '120px',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };
    default:
      return { 
        background: '#FFCC80', 
        borderRadius: '4px',
        width: '120px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
      <div>{data.label}</div>
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