import React, { useEffect, useState } from 'react';

const Tooltip = ({ details, position, containerRef }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (containerRef.current && position) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = position.x - containerRect.left;
      const y = position.y - containerRect.top;
      setTooltipPosition({ x, y });
    }
  }, [position]);

  useEffect(() => {
    if (details && details.uuid) {
      setLoading(true);
      fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${details.uuid}`)
        .then(response => response.json())
        .then(data => {
          setFetchedData(data.data.nodes[0]);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    }
  }, [details]);

  if (!details) return null;

  return (
    <div
      className="absolute bg-white text-gray-800 border border-gray-200 rounded-lg shadow-md p-4 text-sm"
      style={{ top: tooltipPosition.y, left: tooltipPosition.x }}
    >
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {fetchedData && (
        <>
          <div className="mb-2 flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="font-semibold">ID : </span> {fetchedData.id}
          </div>
          <div className="mb-2 flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span className="font-semibold">UUID : </span> {fetchedData.uuid}
          </div>
          <div className="mb-2 flex items-center">
            <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="font-semibold">Type : </span> {fetchedData.node_type}
          </div>
          <div className="mb-2 flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
            <span className="font-semibold">Created : </span> {fetchedData.ctime}
          </div>
          <div className="mb-2 flex items-center">
            <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
            <span className="font-semibold">Modified : </span> {fetchedData.mtime}
          </div>
          {fetchedData.process_type && (
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-indigo-500 mr-2"></div>
              <span className="font-semibold">Process Type : </span> {fetchedData.process_type}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tooltip;
