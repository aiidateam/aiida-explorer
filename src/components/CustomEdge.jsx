import React, { useState, useEffect } from 'react';
import { getSmoothStepPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (sourceX != null && sourceY != null && targetX != null && targetY != null) {
      setIsReady(true);
    }
  }, [sourceX, sourceY, targetX, targetY]);

  if (!isReady) {
    return (
      <path
        id={id}
        style={{ ...style, strokeWidth: 1, stroke: '#d1d5db' }}
        d={`M${sourceX},${sourceY} L${targetX},${targetY}`}
      />
    );
  }

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const labelWidth = data?.label ? data.label.length * 6 : 0; 
  const labelHeight = 14; 
  const padding = 4; 

  return (
    <>
      <path
        id={id}
        style={{ ...style, strokeWidth: 1, stroke: '#d1d5db' }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-labelWidth / 2 - padding}
            y={-labelHeight / 2 - padding}
            width={labelWidth + 2 * padding}
            height={labelHeight + 2 * padding}
            fill="white"
            stroke="#d1d5db"
            strokeWidth="1"
            rx="4"
            ry="4"
          />
          <text
            x={0}
            y={0}
            className="react-flow__edge-text"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 12, fill: '#374151' }}
          >
            {data.label}
          </text>
        </g>
      )}
    </>
  );
};

export default CustomEdge;