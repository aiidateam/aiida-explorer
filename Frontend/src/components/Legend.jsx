import React from 'react';

const Legend = () => (
  <div className="legend font-mono text-sm absolute top-4 left-4 border-[1px] border-gray-100 py-1 px-2 bg-white rounded shadow-lg">
    <h3 className="text-md font-mono font-semibold mb-2">Legend</h3>
    <div className="flex items-center mb-2">
      <div className="w-4 h-4 bg-yellow-300 border border-black mr-2"></div>
      <span>Selected Node</span>
    </div>
    <div className="flex items-center mb-2">
      <div className="w-4 h-4 bg-green-200 border border-black mr-2"></div>
      <span>Incoming Node</span>
    </div>
    <div className="flex items-center mb-2">
      <div className="w-4 h-4 bg-red-200 border border-black mr-2"></div>
      <span>Outgoing Node</span>
    </div>
  </div>
);

export default Legend;
