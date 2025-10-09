import React from "react";

import AiidaExplorer from "./AiidaExplorer";

import "./index.css";

export default function App() {
  const AIIDA_REST_URL = "https://aiida.materialscloud.org/mc3d-pbe-v1/api/v4";
  return <AiidaExplorer restApiUrl={AIIDA_REST_URL} />;
}
