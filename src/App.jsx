import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import DetailsPage from './components/DetailsPage';
import NodeGrid from './components/NodeGrid';
import Statistics from './components/Statistics';
import Tabs from './components/Tabs';
import { IconContext } from "react-icons";
import { FaArrowRight } from "react-icons/fa";
import Search from './components/Search';
import ComputersGrid from './components/NodeGrid/ComputersGrid';
import ErrorBoundary from './components/ErrorBoundary';

const ModuleInput = ({ setModuleName }) => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue) {
      setModuleName(inputValue);
      sessionStorage.setItem('moduleName', inputValue);
      navigate(`/${inputValue}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-row items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter module name"
          className="px-6 py-2 border border-gray-300"
        />
        <button type="submit" className="flex items-center justify-center border border-blue-400 py-3 px-4 bg-blue-400 text-white">
          <IconContext.Provider value={{ className: "text-white" }}>
            <FaArrowRight />
          </IconContext.Provider>
        </button>
      </form>
    </div>
  );
};

const App = () => {
  const [moduleName, setModuleName] = useState(() => sessionStorage.getItem('moduleName') || '');

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('moduleName');
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="p-1">
      <Router>
        <Tabs moduleName={moduleName} setModuleName={setModuleName} />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              moduleName ? <Navigate to={`/${moduleName}`} /> : <ModuleInput setModuleName={setModuleName} />
            } />
            <Route path="/:moduleName/*" element={<ModuleRoutes setModuleName={setModuleName} />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </div>
  );
};

const ModuleRoutes = ({ setModuleName }) => {
  const { moduleName } = useParams();
  
  useEffect(() => {
    if (moduleName) {
      sessionStorage.setItem('moduleName', moduleName);
      setModuleName(moduleName);
    }
  }, [moduleName, setModuleName]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<NodeGridWrapper />} />
        <Route path="search" element={<SearchWrapper />} />
        <Route path="details/:uuid" element={<DetailsPageWrapper />} />
        <Route path="statistics" element={<StatisticsWrapper />} />
        <Route path="computers" element={<ComputersGridWrapper />} />
        <Route path="*" element={<Navigate to={`/${moduleName}`} replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

const SearchWrapper = () => {
  const { moduleName } = useParams();
  return <Search moduleName={moduleName} />;
};

const NodeGridWrapper = () => {
  const { moduleName } = useParams();
  return <NodeGrid moduleName={moduleName} />;
};

const DetailsPageWrapper = () => {
  const { moduleName } = useParams();
  return <DetailsPage moduleName={moduleName} />;
};

const StatisticsWrapper = () => {
  const { moduleName } = useParams();
  return <Statistics moduleName={moduleName} />;
};

const ComputersGridWrapper = () => {
  const { moduleName } = useParams();
  return <ComputersGrid moduleName={moduleName} />;
};

export default App;
