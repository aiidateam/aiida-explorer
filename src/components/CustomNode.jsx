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
  const nodeStyle = getNodeStyle(data.label);

  useEffect(() => {
    const fetchNodeData = async () => {
      try {
        const [response, response2, response3] = await Promise.all([
          fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${data.uuid}`),
          fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${data.uuid}/contents/attributes`),
          fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${data.uuid}/contents/derived_properties`)
        ]);

        let nodeDetails, value, formula;

        if (response.ok) {
          const result = await response.json();
          nodeDetails = result.data?.nodes?.[0]?.process_type;
        }

        if (response2.ok) {
          const result2 = await response2.json();
          value = result2.data?.attributes?.value;
        }

        if (response3.ok) {
          const result3 = await response3.json();
          formula = result3.data?.derived_properties?.formula;
        }

        if (formula) {
          setSubtitle(formula);
        } else if (value !== null && value !== undefined) {
          setSubtitle(String(value));
        } else if (nodeDetails) {
          const parts = nodeDetails.split(':');
          setSubtitle(parts.length > 1 ? parts[1] : nodeDetails);
        } else {
          setSubtitle('');
        }

      } catch (error) {
        console.error('Error fetching node data:', error);
        setSubtitle('');
      }
    };

    fetchNodeData();
  }, [data.uuid]);

  return (
    <div style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
      <div className='flex-col'>
        <div className="text-sm text-center whitespace-nowrap overflow-hidden overflow-ellipsis">
          {data.label}
        </div>
        {subtitle && (
          <div className="text-xs font-thin text-center whitespace-nowrap overflow-hidden overflow-ellipsis mt-1">
            <i>{subtitle}</i>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      />
    </div>
  );
};

export default memo(CustomNode);