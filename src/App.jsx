import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import DetailsPage from './components/DetailsPage';
import NodeGrid from './components/NodeGrid';
import Statistics from './components/Statistics';
import Tabs from './components/Tabs';
import { IconContext } from "react-icons";
import { FaArrowRight } from "react-icons/fa";
import Search from './components/Search';
import ComputersGrid from './components/NodeGrid/ComputersGrid';

const ModuleInput = ({ setModuleName }) => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputValue)
    if (inputValue) {
      setModuleName(inputValue);
      navigate('/');
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
          className="px-6 py-2 border border-gray-300 "
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
  const [moduleName, setModuleName] = useState('');

  return (
    <div className="p-1">
      {/* <Router>
        <Routes>
          <Route path="/" element={<NodeGrid moduleName="mc3d" />} exact />
        </Routes>
      </Router> */}
      <Router>
        <Tabs />
        {!moduleName ? (
          <ModuleInput setModuleName={setModuleName} />
        ) : (
          <Routes>
            <Route path="/search" element={<Search moduleName={moduleName} />} exact />
            <Route path="/" element={<NodeGrid moduleName={moduleName} />} exact />
            <Route path="/details/:uuid" element={<DetailsPage moduleName={moduleName} />} />
            <Route path="/statistics" element={<Statistics moduleName={moduleName} />} />
            <Route path="/computers"  element={<ComputersGrid moduleName={moduleName} />} />
          </Routes>
        )}
      </Router>
    </div>
  );
};

export default App;
