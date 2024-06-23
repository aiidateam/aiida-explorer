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
    navigate(path);
    setSelectedTab(path);
  };

  const renderButton = (path, tabName) => (
    <button
      onClick={() => handleNavigation(path)}
      className={`px-4 py-2 text-sm font-medium w-1/3 space-x-2 last:border-r-0 ${
        selectedTab === path ? 'text-white bg-gray-400' : 'text-gray-700 bg-white'
      }`}
    >
      {tabName}
    </button>
  );

  return (
    <div className="border-2 text-center w-full border-gray-300 flex justify-between p-1">
      {renderButton('/', 'Grid')}
      {renderButton('/statistics', 'Statistics')}
      {renderButton('/search', 'Details')}
    </div>
  );
};

export default Tabs;
