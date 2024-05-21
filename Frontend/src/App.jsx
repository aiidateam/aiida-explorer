import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DetailsPage from './components/DetailsPage';
import NodeSelection from './components/NodeSelection';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NodeSelection />} exact />
        <Route path="/details/:uuid" element={<DetailsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
