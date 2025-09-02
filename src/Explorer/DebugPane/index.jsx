import React from "react";

export default function DebugPane({ nodes, edges, timeTaken }) {
  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-semibold mb-2">Debug Info</h3>

      <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
        Number of nodes = {nodes?.length ?? 0}
        {"\n"}
        Number of edges = {edges?.length ?? 0}
      </pre>
      {timeTaken && (
        <p className="mt-2 text-sm text-gray-500">
          Last load took: {timeTaken} ms
        </p>
      )}
    </div>
  );
}
