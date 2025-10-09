import React, { useEffect, useState, useCallback } from "react";

import DataTable from "../../components/DataTable";
import { fetchGroups, fetchFromQueryBuilder } from "../api";
import formatTableData, { columnOrder } from "./formatTable";
import { buildQuery } from "./queryHandler";
import {
  TypeCheckboxTree,
  aiidaTypes,
  getFlattenedNodeTypes,
} from "./TypesCheckbox";

import ErrorDisplay from "../../components/Error";
import Spinner from "../../components/Spinner";

function sortGroups(groups) {
  return [...groups].sort((a, b) => {
    const isNumA = /^\d/.test(a.label);
    const isNumB = /^\d/.test(b.label);

    if (isNumA && !isNumB) return 1; // a goes after b
    if (!isNumA && isNumB) return -1; // a goes before b

    // Both numeric-start or both text: sort alphabetically
    return a.label.localeCompare(b.label, undefined, { numeric: true });
  });
}

// Component for rendering a checkered box for all common aiida types...
// TODO - add a flag that enables fetching of other types via the fulltypes endpoint
// TODO - discussion regarding a schema for dynamic fetching/rendering etc.
export default function GroupsViewer({ restApiUrl, setRootNodeId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 200;

  // Fetch groups
  useEffect(() => {
    fetchGroups(restApiUrl)
      .then(setGroups)
      .catch((err) => console.error("Failed to fetch groups:", err));
  }, [restApiUrl]);

  // Fetch nodes with loading/error state
  const fetchNodes = useCallback(
    async (offsetValue = 0, customLimit = limit) => {
      setLoading(true);
      setError(null);

      try {
        const nodeTypes = getFlattenedNodeTypes(selectedTypes, aiidaTypes);

        const postMsg = buildQuery({
          groups: selectedGroups,
          nodeTypes,
          limit: customLimit,
          offset: offsetValue,
        });

        const result = await fetchFromQueryBuilder(restApiUrl, postMsg);
        const nodes = result.node || [];

        const formattedNodes = formatTableData(nodes, setRootNodeId);

        setTableData((prev) =>
          offsetValue === 0 ? formattedNodes : [...prev, ...formattedNodes]
        );
        setOffset(offsetValue + nodes.length);
      } catch (err) {
        console.error("Failed to fetch nodes:", err);
        setError(err.message || "Failed to fetch nodes");
      } finally {
        setLoading(false);
      }
    },
    [restApiUrl, selectedGroups, selectedTypes, setRootNodeId]
  );

  // Auto-fetch initial nodes
  useEffect(() => {
    if (groups.length > 0 && tableData.length === 0) {
      fetchNodes(0, 1000);
    }
  }, [groups, tableData.length, fetchNodes]);

  return (
    <div className="flex gap-4 p-3 overflow-auto w-full items-start">
      {/* Left panel */}
      <div className="min-w-[250px] max-w-[400px] flex-shrink-0 bg-slate-50 p-2 px-4 rounded">
        <h4 className="font-medium mt-4 mb-2">Filter by Node Types</h4>
        <TypeCheckboxTree
          types={aiidaTypes}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
        />
        <h4 className="font-medium my-2 mt-4">Filter by Defined Groups</h4>
        {sortGroups(groups).map((g) => (
          <label key={g.label} className="flex items-start gap-2 mb-1">
            <input
              type="checkbox"
              className="mt-1"
              checked={selectedGroups.includes(g.label)}
              onChange={(e) =>
                setSelectedGroups((prev) =>
                  e.target.checked
                    ? [...prev, g.label]
                    : prev.filter((x) => x !== g.label)
                )
              }
            />
            <span className="truncate block" title={g.label}>
              {g.label}
            </span>
          </label>
        ))}
        <button
          onClick={() => fetchNodes(0)}
          className="px-3 py-1 my-2 ml-2 rounded bg-indigo-700 text-white hover:bg-indigo-800 transition"
        >
          Apply
        </button>
      </div>

      {/* Right table */}
      <div className="flex-1 bg-white p-2 rounded">
        <div className="flex gap-4">
          <h4 className="text-xl font-semibold">
            {tableData.length} nodes loaded
          </h4>
          {tableData.length > 0 && (
            <button
              onClick={() => fetchNodes(offset)}
              className="px-3 py-1 mr-10 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              Load next 200
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="w-full h-[400px] flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {/* Error Display */}
        {error && !loading && (
          <div className="w-full h-[400px] flex flex-col items-center justify-center">
            <ErrorDisplay message={error} onRetry={() => fetchNodes(offset)} />
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <DataTable
            columns={columnOrder}
            data={tableData || []}
            sortableCols={["Unique ID", "Label", "Type", "Created", "Modified"]}
            renderIfMissing={true}
          />
        )}
      </div>
    </div>
  );
}
