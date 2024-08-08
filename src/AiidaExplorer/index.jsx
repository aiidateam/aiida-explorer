import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import DetailsPage from "./DetailsPage";
import NodeGrid from "./NodeGrid";
import Statistics from "./Statistics";
import Tabs from "./Tabs";
import Search from "./Search";
import ComputersGrid from "./NodeGrid/ComputersGrid";
import ErrorBoundary from "./ErrorBoundary";

const AiidaExplorer = ({ apiUrl }) => {
  const [moduleName, setModuleName] = useState(
    () => sessionStorage.getItem("moduleName") || ""
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("moduleName");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="p-1">
      <Tabs apiUrl={apiUrl} />
      <ErrorBoundary>
        <Routes>
          <Route path="" element={<NodeGrid apiUrl={apiUrl} />} />
          <Route
            path="/details/:uuid"
            element={
              <DetailsPage
                apiUrl={apiUrl}
              />
            }
          />
          <Route
            path="/statistics/"
            element={
              <Statistics apiUrl = {apiUrl}
              />
            }
          />
          <Route
            path="/computers/"
            element={
              <ComputersGrid apiUrl = {apiUrl}
              />
            }
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
        <Route path="details/:uuid" element={<DetailsPage moduleName={moduleName} /> } />
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
