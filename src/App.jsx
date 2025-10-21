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

  // Theme seleciton
  const [theme, setTheme] = useState("default");

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
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Load
        </button>

        {/* Theme selector */}
        <div className="flex items-center space-x-1">
          <label htmlFor="theme" className="text-gray-800 font-medium">
            Theme:
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-2 border border-gray-400 rounded bg-white cursor-pointer hover:border-blue-500 transition"
          >
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="amber">Amber</option>
            <option value="violet">Violet</option>
            <option value="emerald">Emerald</option>
            <option value="pink">Pink</option>
            <option value="rose">Rose</option>
            <option value="cyan">Cyan</option>
            <option value="teal">Teal</option>

            <option value="default">Slate (default)</option>
          </select>
        </div>
      </div>

      {/* Main Explorer container */}
      <div className="w-[95vw] h-[85vh] bg-amber-600">
        <AiidaExplorer
          restApiUrl={restUrl}
          rootNode={rootNode}
          onRootNodeChange={handleRootNodeChange}
          theme={theme}
        />
      </div>
    </div>
  );
}
