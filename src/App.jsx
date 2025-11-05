import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import AiidaExplorer from "./AiidaExplorer";
import "./index.css";

const DEFAULT_REST_URL = "https://aiida.materialscloud.org/2dtopo/api/v4";

export default function App() {
  const [sp, setSp] = useSearchParams();

  // Read from URL: api_url, uuid
  const apiUrl = sp.get("api_url") ?? DEFAULT_REST_URL;
  const uuid = sp.get("uuid") ?? "";

  // Local input state for the textbox, kept in sync with the URL param
  const [inputUrl, setInputUrl] = useState(apiUrl);
  useEffect(() => {
    setInputUrl(apiUrl);
  }, [apiUrl]);

  const handleRootNodeChange = useCallback(
    (uuid) => {
      const next = new URLSearchParams(sp);
      if (uuid) next.set("uuid", uuid);
      else next.delete("uuid");
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  const handleLoadClick = () => {
    const next = new URLSearchParams(sp);
    next.set("api_url", inputUrl.trim() || DEFAULT_REST_URL);
    next.delete("uuid");
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
          className="flex-grow p-2 border border-gray-400"
          onKeyDown={(e) => e.key === "Enter" && handleLoadClick()}
        />
        <button
          onClick={handleLoadClick}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
        >
          Load
        </button>
      </div>

      {/* Main Explorer container */}
      <div className="w-[95vw] h-[85vh] bg-amber-600">
        <AiidaExplorer
          restApiUrl={apiUrl}
          rootNode={uuid}
          onRootNodeChange={handleRootNodeChange}
        />
      </div>
    </div>
  );
}
