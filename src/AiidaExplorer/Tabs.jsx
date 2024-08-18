import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Tabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(location.pathname);

  useEffect(() => {
    setSelectedTab(location.pathname);
  }, [location]);

  const handleNavigation = (path) => {
    const basePath = location.pathname.split('/').slice(0, 2).join('/');
    const fullPath = `${basePath}${path}`;
    console.log(basePath);
    navigate(fullPath);
    setSelectedTab(fullPath);
  };

  const renderButton = (path, tabName) => {
    const isActive = selectedTab.includes(path);
    return (
      <button
        onClick={() => handleNavigation(path)}
        className={`px-4 py-2 text-sm font-medium w-1/3 space-x-2 last:border-r-0 ${
          isActive ? 'text-white bg-gray-400' : 'text-gray-700 bg-white'
        }`}
      >
        {tabName}
      </button>
    );
  };

  return (
    <div className="border-2 text-center w-full border-gray-300 flex justify-between p-1">
      {renderButton('/', 'Node Grid')}
      {renderButton('/details/', 'Node Details')}
      {renderButton('/statistics', 'Node Statistics')}
    </div>
  );
};

export default Tabs;
