import React from "react";

import AiidaExplorer from "./AiidaExplorer";

import { useSearchParams } from "react-router-dom";

import "./index.css";

export default function App() {
  const [sp, setSp] = useSearchParams();
  const rootNode = sp.get("rootNode") ?? "";

  const handleRootNodeChange = (uuid) => {
    const next = new URLSearchParams(sp);
    if (uuid) next.set("rootNode", uuid);
    else next.delete("rootNode");
    setSp(next, { replace: true });
  };

  // A Materials Cloud AiiDA rest API endpoint
  const AIIDA_REST_URL = "https://aiida.materialscloud.org/mc3d-pbe-v1/api/v4";
  return (
    <div className="flex items-center justify-center h-screen">
      {/* For testing, build container that is 95% size and centerd w.r.t. the screen. */}
      <div className="w-[95vw] h-[95vh] bg-amber-600">
        <AiidaExplorer
          restApiUrl={AIIDA_REST_URL}
          rootNode={rootNode}
          onRootNodeChange={handleRootNodeChange}
        />
      </div>
    </div>
  );
}
