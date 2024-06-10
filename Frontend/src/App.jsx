import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DetailsPage from './components/DetailsPage';
import NodeSelection from './components/NodeSelection';
import Statistics from './components/Statistics';
import Tabs from './components/Tabs';

const App = () => {
  return (
    <div className="p-1">
      <Router>
        <Tabs />
        <Routes>
          <Route path="/" element={<NodeSelection />} exact />
          <Route path="/details/:uuid" element={<DetailsPage />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
