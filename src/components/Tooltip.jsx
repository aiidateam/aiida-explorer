import React, { useEffect, useState } from 'react';

const Tooltip = ({ details, position, containerRef }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current && position) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = position.x - containerRect.left;
      const y = position.y - containerRect.top;
      setTooltipPosition({ x, y });
    }
  }, [position]);

  if (!details) return null;

  return (
    <div
    className={`absolute bg-white text-gray-800 border border-gray-200 rounded-lg shadow-md p-4 text-sm'
      }`}
      style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
    >
     <div className="mb-2 flex items-center">
        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
        <span className="font-semibold">ID : </span> {details.id}
      </div>
      <div className="mb-2 flex items-center">
        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
        <span className="font-semibold">UUID : </span> {details.uuid}
      </div>
      <div className="mb-2 flex items-center">
        <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
        <span className="font-semibold">Type : </span> {details.node_type}
      </div>
      <div className="mb-2 flex items-center">
        <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
        <span className="font-semibold">Created : </span> {details.ctime}
      </div>
      <div className="mb-2 flex items-center">
        <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
        <span className="font-semibold">Modified : </span> {details.mtime}
      </div>
      {details.process_type && (
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-indigo-500 mr-2"></div>
          <span className="font-semibold">Process Type : </span>{' '}
          {details.process_type}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
