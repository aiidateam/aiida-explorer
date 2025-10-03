import React, { useState, useEffect } from "react";
import Explorer from "./Explorer";
import yaml from "js-yaml";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useLocation,
} from "react-router-dom";

// needed to make mc-react-library components not shit the bed.
// TODO - should be moved into the Explorer component
// TODO Figure out if this why commenting this out breaks the node gfx
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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

  if (!backendUrl) return <div>Unknown backend "{prettyBackend}"</div>;

  return (
    <Explorer
      baseUrl={backendUrl}
      startingNode={new URLSearchParams(location.search).get("rootNode") || ""}
    />
  );
}

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
      <Route
        path="/:prettyBackend/*"
        element={<ExplorerLoader backendMapping={backendMapping} />}
      />
      <Route
        path="*"
        element={
          <div>
            Choose a valid backend in the URL, e.g., /mc3d-pbe-v1?rootNode=...
          </div>
        }
      />
    </Routes>
  );
}
