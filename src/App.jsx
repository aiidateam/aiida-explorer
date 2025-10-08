import yaml from "js-yaml";
import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, useLocation } from "react-router-dom";

import AiidaExplorer from "./AiidaExplorer";
import HomePage from "./HomePage";
import NotFoundPage from "./NotFoundPage";

import "./index.css";

// URL to the YAML file on GitHub
const YAML_URL =
  "https://raw.githubusercontent.com/materialscloud-org/mc-frontend/main/src/data/explore.yml";

const prepend_URL = "https://aiida.materialscloud.org/";

function ExplorerLoader({ backendMapping }) {
  const { prettyBackend } = useParams();
  const location = useLocation();
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    const url = backendMapping[prettyBackend];
    if (url) setBackendUrl(`${prepend_URL}/${url}`);
  }, [prettyBackend, backendMapping]);

  if (!backendMapping[prettyBackend]) {
    return (
      <NotFoundPage
        backendMapping={backendMapping}
        attemptedPath={prettyBackend}
      />
    );
  }

  return (
    <div className="flex flex-col mx-4 border-2">
      <div className="flex-1">
        <AiidaExplorer
          baseUrl={backendUrl}
          startingNode={
            new URLSearchParams(location.search).get("rootNode") || ""
          }
        />
      </div>
    </div>
  );
}

// ----------------- Homepage -----------------

// ----------------- App -----------------
export default function App() {
  const [backendMapping, setBackendMapping] = useState(null);

  useEffect(() => {
    fetch(YAML_URL)
      .then((res) => res.text())
      .then((text) => {
        const data = yaml.load(text);
        const mapping = {};
        data.profiles.forEach((p) => {
          mapping[p.profile] = p.rest_url;
        });
        setBackendMapping(mapping);
      })
      .catch(console.error);
  }, []);

  if (!backendMapping) return <div>Loading backend mapping...</div>;

  return (
    <Routes>
      {/* valid explorer routes */}
      <Route
        path="/:prettyBackend/*"
        element={<ExplorerLoader backendMapping={backendMapping} />}
      />

      {/* homepage */}
      <Route path="/" element={<HomePage backendMapping={backendMapping} />} />

      {/* catch-all */}
      <Route path="*" element={<HomePage backendMapping={backendMapping} />} />
    </Routes>
  );
}
