import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import DetailsPage from "./NodeDetails/DetailsPage";
import NodeGrid from "./NodeGrid";
import Statistics from "./Statistics/Statistics";
import Tabs from "./Tabs";
import Search from "./Statistics/Search";
import ComputersGrid from "./NodeGrid/ComputersGrid";
import ErrorBoundary from "./ErrorBoundary";

const AiidaExplorer = ({ apiUrl }) => {
  return (
    <div className="p-1">
      <Tabs apiUrl={apiUrl} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<NodeGrid apiUrl={apiUrl} />} />
          <Route
            path="/details/:uuid"
            element={<DetailsPage apiUrl={apiUrl} />}
          />
          <Route path="/details/" element={<Search apiUrl={apiUrl} />} />
          <Route path="/statistics/" element={<Statistics apiUrl={apiUrl} />} />
          <Route
            path="/computers/"
            element={<ComputersGrid apiUrl={apiUrl} />}
          />
          {/* <Route path="/:moduleName/*" element={<ModuleRoutes setModuleName={setModuleName} />} /> */}
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

const ModuleRoutes = ({ setModuleName }) => {
  const { moduleName } = useParams();

  useEffect(() => {
    if (moduleName) {
      sessionStorage.setItem("moduleName", moduleName);
      setModuleName(moduleName);
    }
  }, [moduleName, setModuleName]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route index element={<NodeGridWrapper />} />
        <Route path="search" element={<SearchWrapper />} />
        <Route
          path="details/:uuid"
          element={<DetailsPage moduleName={moduleName} />}
        />
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

// const DetailsPageWrapper = () => {
//   const { moduleName } = useParams();
//   console.log(moduleName);
//   return <DetailsPage moduleName={moduleName} />;
// };

const StatisticsWrapper = () => {
  const { moduleName } = useParams();
  return <Statistics moduleName={moduleName} />;
};

const ComputersGridWrapper = () => {
  const { moduleName } = useParams();
  return <ComputersGrid moduleName={moduleName} />;
};

export default AiidaExplorer;
