import React, { useEffect, useState, useCallback, useMemo } from "react";
import useMediaQuery from "../hooks/mediaquery";

import DataTable from "../components/DataTable";
import { fetchGroups, fetchFromQueryBuilder } from "../api";
import { buildQuery } from "./queryHandler";
import {
  TypeCheckboxTree,
  aiidaTypes,
  getFlattenedNodeTypes,
} from "./TypesCheckbox";

import ErrorDisplay from "../components/Error";
import Spinner from "../components/Spinner";

// column label mappings
const columnLabels = {
  uuid: "Unique ID",
  label: "Label",
  full_type: "Type",
  ctime: "Created",
  mtime: "Modified",
  id: "ID",
};

// desired column order
export const columnOrder = [
  "Unique ID",
  "Label",
  "Type",
  "Created",
  "Modified",
  "",
];

// format a single value based on label and screen size
function formatValue(label, value, isSmallScreen = false) {
  if (value === undefined || value === null) return "";

  switch (label) {
    case "Type":
      if (typeof value !== "string") return value;
      if (isSmallScreen) {
        // small screen: only show last segment after "."
        const parts = value.replace(/\|$/, "").split(".");
        console.log(parts);
        return parts.at(-2) || value;
      }
      // full value for larger screens
      return value;

    case "Created":
    case "Modified":
      const date = new Date(value);
      return isSmallScreen
        ? date.toISOString().split("T")[0]
        : date.toLocaleString();

    case "Unique ID":
      if (isSmallScreen && typeof value === "string")
        return value.split("-")[0];
      return value;

    default:
      return value;
  }
}

// convert raw nodes into table rows
function formatTableData(nodes, setRootNodeId, isSmallScreen = false) {
  return nodes.map((row) => {
    const newRow = {};

    columnOrder.forEach((label) => {
      const key = Object.keys(columnLabels).find(
        (k) => columnLabels[k] === label
      );
      if (key && row[key] !== undefined) {
        newRow[label] = formatValue(label, row[key], isSmallScreen);
      }
    });

    newRow[""] = (
      <button
        onClick={() => setRootNodeId(row.uuid)}
        className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        View
      </button>
    );

    return newRow;
  });
}

function sortGroups(groups) {
  return [...groups].sort((a, b) => {
    const isNumA = /^\d/.test(a.label);
    const isNumB = /^\d/.test(b.label);
    if (isNumA && !isNumB) return 1;
    if (!isNumA && isNumB) return -1;
    return a.label.localeCompare(b.label, undefined, { numeric: true });
  });
}

export default function GroupsViewer({ restApiUrl, setRootNodeId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [rawTableData, setRawTableData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 200;

  // responsive
  const isSmallScreen = useMediaQuery("(max-width: 900px)");

  // columns based on screen
  const columnsToRender = isSmallScreen
    ? columnOrder.filter((c) => c !== "Created" && c !== "Label")
    : columnOrder;

  // fetch groups once
  useEffect(() => {
    fetchGroups(restApiUrl).then(setGroups).catch(console.error);
  }, [restApiUrl]);

  // fetch nodes
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

        setRawTableData((prev) =>
          offsetValue === 0 ? nodes : [...prev, ...nodes]
        );
        setOffset(offsetValue + nodes.length);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch nodes");
      } finally {
        setLoading(false);
      }
    },
    [restApiUrl, selectedGroups, selectedTypes]
  );

  // auto-fetch initial nodes
  useEffect(() => {
    if (groups.length > 0 && rawTableData.length === 0) {
      fetchNodes(0, 1000);
    }
  }, [groups, rawTableData.length, fetchNodes]);

  // memoized formatted data (reacts to screen size)
  const tableData = useMemo(() => {
    return formatTableData(rawTableData, setRootNodeId, isSmallScreen);
  }, [rawTableData, isSmallScreen, setRootNodeId]);

  return (
    <div className="flex gap-4 overflow-auto w-full items-start">
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
      <div className="flex-1 bg-white rounded">
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

        {loading && (
          <div className="w-full h-[400px] flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {error && !loading && (
          <div className="w-full h-[400px] flex flex-col items-center justify-center">
            <ErrorDisplay message={error} onRetry={() => fetchNodes(offset)} />
          </div>
        )}

        {!loading && !error && (
          <DataTable
            columns={columnsToRender}
            data={tableData}
            sortableCols={columnsToRender}
            renderIfMissing
            breakableCols={[
              "Unique ID",
              "Label",
              "Type",
              "Created",
              "Modified",
            ]}
          />
        )}
      </div>
    </div>
  );
}
