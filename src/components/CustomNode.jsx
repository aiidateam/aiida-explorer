import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';

const getNodeStyle = (label) => {
  switch (label.toLowerCase()) {
    case 'calcjobnode':
      return {
        background: '#FF9999',
        borderRadius: '8px',
        width: '150px',
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
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #000',
        overflow: 'hidden',
      };
  }
};

const CustomNode = ({ data }) => {

  const [subtitle, setSubtitle] = useState('');
  const [nodeDetails, setNodeDetails] = useState(null);
  const [value, setValue] = useState(null);
  const [formula, setFormula] = useState(null);

  const nodeStyle = getNodeStyle(data.label);
  console.log(data.uuid);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${data.uuid}`);
        const response2 = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${data.uuid}/contents/attributes`);
        const response3 = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${data.uuid}/contents/derived_properties`);

        if (response3) {
          const result3 = await response3.json();
          console.log(result3.data.derived_properties.formula);
          setFormula(result3.data.derived_properties.formula);
        }
        if (response2) {
          const result2 = await response2.json();
          console.log(result2.data.attributes.value);
          setValue(result2.data.attributes.value);
        }
        const result = await response.json();
        setNodeDetails(result.data.nodes[0].process_type);
      } catch (error) {
        console.error('Error fetching nodes:', error);
      }
    };

    fetchNodes();
  }, [data.uuid]);

  useEffect(() => {
    if (formula) {
      setSubtitle(formula);
    }
    if (value) {
      setSubtitle(value);
    }
    if (nodeDetails) {
      setSubtitle(nodeDetails.split(':')[1]);
    }
  }, [formula, value, nodeDetails]);
  
  return (
    <div style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        // isConnectable={isConnectable}
      />
      <div className='flex-col'>

      <div className="text-sm text-center whitespace-nowrap overflow-hidden overflow-ellipsis">
        {data.label}
      </div>
      {subtitle && (
        <div className="text-xs font-thin text-center whitespace-nowrap overflow-hidden overflow-ellipsis mt-1">
         <i> {subtitle} </i>
        </div>
      )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        // isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomNode);