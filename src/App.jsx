import React from "react";

import AiidaExplorer from "./AiidaExplorer";

import "./index.css";

export default function App() {
  // A Materials Cloud AiiDA rest API endpoint
  const AIIDA_REST_URL = "https://aiida.materialscloud.org/mc3d-pbe-v1/api/v4";
  return (
    // For testing, build container that is 95% size and centerd w.r.t. the screen.
    <div className="flex items-center justify-center h-screen">
      <div className="w-[95vw] h-[95vh] bg-amber-600">
        <AiidaExplorer restApiUrl={AIIDA_REST_URL} />
      </div>
    </div>
  );
}
