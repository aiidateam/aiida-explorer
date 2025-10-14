import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AiidaExplorer from "./AiidaExplorer";
import "./index.css";

const DEFAULT_REST_URL = "https://aiida.materialscloud.org/2dtopo/api/v4";

export default function App() {
  const [sp, setSp] = useSearchParams();

  // Read from URL: restApiUrl + rootNode
  const restUrl = sp.get("restApiUrl") ?? DEFAULT_REST_URL;
  const rootNode = sp.get("rootNode") ?? "";

  // Local input state for the textbox, kept in sync with the URL param
  const [inputUrl, setInputUrl] = useState(restUrl);
  useEffect(() => {
    setInputUrl(restUrl);
  }, [restUrl]);

  const handleRootNodeChange = useCallback(
    (uuid) => {
      const next = new URLSearchParams(sp);
      if (uuid) next.set("rootNode", uuid);
      else next.delete("rootNode");
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  const handleLoadClick = () => {
    // Update URL params: set restApiUrl, clear rootNode
    const next = new URLSearchParams(sp);
    next.set("restApiUrl", inputUrl.trim() || DEFAULT_REST_URL);
    next.delete("rootNode");
    setSp(next, { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      {/* URL input with label and load button */}
      <div className="flex items-center space-x-2 w-[95vw]">
        <label
          htmlFor="aiida-rest-url"
          className="text-gray-800 font-medium whitespace-nowrap"
        >
          AiiDA REST endpoint:
        </label>
        <input
          id="aiida-rest-url"
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter AiiDA REST API URL"
          className="flex-grow p-2 border border-gray-400 rounded"
          onKeyDown={(e) => e.key === "Enter" && handleLoadClick()}
        />
        <button
          onClick={handleLoadClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load
        </button>
      </div>

      {/* Main Explorer container */}
      <div className="w-[95vw] h-[85vh] bg-amber-600">
        <AiidaExplorer
          restApiUrl={restUrl}
          rootNode={rootNode}
          onRootNodeChange={handleRootNodeChange}
        />
      </div>
    </div>
  );
}
