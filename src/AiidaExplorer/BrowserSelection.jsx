import React, { useState } from 'react';
import { FaGlobe, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaBars } from 'react-icons/fa';
import GraphBrowser from './GraphBrowser';

const BrowserSelection = ({ uuid, apiUrl }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedView, setSelectedView] = useState('local');

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex z-50 h-full ">
<div className="flex-1 overflow-y-auto">
  {selectedView === 'local' ? <GraphBrowser uuid={uuid} apiUrl={apiUrl} /> : <GraphBrowser uuid={uuid} apiUrl={apiUrl} />}
</div>
<div className={`relative flex flex-col items-center p-2 transition-all duration-300 ${collapsed ? 'w-0' : 'w-20 bg-gray-200 text-gray-800'}`}>
  {!collapsed && (
    <>
      <button 
        onClick={() => setSelectedView('local')} 
        className={`flex items-center justify-center w-full px-4 py-2 mb-4  transition-colors duration-300 ${
          selectedView === 'local' ? 'bg-blue-100 border-[1px] border-gray-400' : 'bg-blue-50 text-gray-800 hover:bg-blue-200'
        }`}
      >
        <FaMapMarkerAlt />
      </button>
      <button 
        onClick={() => setSelectedView('global')} 
        className={`flex items-center justify-center w-full px-4 py-2 mb-4 transition-colors duration-300 ${
          selectedView === 'global' ? 'bg-blue-100' : 'bg-blue-50 text-gray-800 hover:bg-blue-200'
        }`}
      >
        <FaGlobe />
      </button>
    </>
  )}
  <button 
    className={`absolute top-1/2 transform -translate-y-1/2 transition-transform duration-300 ${collapsed ? 'translate-x-full' : 'translate-x-0'}`}
    onClick={handleToggleCollapse}
  >
    {collapsed ? <FaBars className="text-gray-800 " /> : <FaChevronRight className="text-gray-800" />}
  </button>
</div>

    </div>
  );
};

export default BrowserSelection;
