import React, { useEffect, useState, useMemo } from 'react';

const Tooltip = ({ details, position, containerRef, tooltipData }) => {
  const [tooltip, setTooltip] = useState({ position: { x: 0, y: 0 }, data: null });
  // console.log(tooltipData)

  useEffect(() => {
    if (containerRef.current && position) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = position.x - containerRect.left + 40;
      const y = position.y - containerRect.top;

      let matchingNode = null;

      if (tooltipData && details.uuid) {
        matchingNode = tooltipData.inputLogical.links.find(node => node.uuid === details.uuid)
                    || tooltipData.inputData.links.find(node => node.uuid === details.uuid)
                    || tooltipData.outputLogical.links.find(node => node.uuid === details.uuid)
                    || tooltipData.outputData.links.find(node => node.uuid === details.uuid);

      }
      console.log(matchingNode);

      setTooltip({ position: { x, y }, data: matchingNode });
    }
  }, [position, containerRef, tooltipData, details]);

  const tooltipContent = useMemo(() => {
    if (!tooltip.data) return null;

    const { id, uuid, full_type, ctime, link_label } = tooltip.data;

    console.log("Tooltip Data:", tooltip.data);

    return (
      <>
        <div className="mb-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="font-semibold">ID : </span> {id}
        </div>
        <div className="mb-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span className="font-semibold">UUID : </span> {uuid}
        </div>
        <div className="mb-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
          <span className="font-semibold">Type : </span> {full_type}
        </div>
        <div className="mb-2 flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
          <span className="font-semibold">Created : </span> {ctime}
        </div>
        {link_label && (
          <div className="mb-2 flex items-center">
            <div className="h-3 w-3 rounded-full bg-indigo-500 mr-2"></div>
            <span className="font-semibold">Link Label : </span> {link_label}
          </div>
        )}
      </>
    );
  }, [tooltip.data]);

  if (!tooltip.data) return null;

  return (
    <div
      className="absolute bg-white z-50 text-gray-800 border border-gray-200 rounded-lg shadow-md p-4 text-sm"
      style={{ top: tooltip.position.y, left: tooltip.position.x }}
    >
      {tooltipContent}
    </div>
  );
};

export default Tooltip;
