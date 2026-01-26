import React, { useEffect, useState, useCallback, useMemo } from "react";

import { fetchGroups, fetchFromQueryBuilder } from "../api";
import TypeCheckboxTree from "./TypeCheckboxTree";
import { getFlattenedNodeTypes, aiidaTypes, buildQuery } from "./utils";
import DataTable from "../components/DataTable";
import ErrorDisplay from "../components/Error";
import Spinner from "../components/Spinner";
import useMediaQuery from "../hooks/useMediaQuery";

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
const columnOrder = ["Unique ID", "Label", "Type", "Created", "Modified", ""];

// format a single value based on label and screen size
function formatValue(label, value, isSmallScreen = false) {
  if (value === undefined || value === null) return "";

  switch (label) {
    case "Type":
      if (typeof value !== "string") return value;
      if (isSmallScreen) {
        // small screen: only show last segment after "."
        const parts = value.replace(/\|$/, "").split(".");
        return parts.at(-2) || value;
      }
      // full value for larger screens
      return value;

    case "Created":
    case "Modified": {
      const date = new Date(value);
      return isSmallScreen
        ? date.toISOString().split("T")[0]
        : date.toLocaleString();
    }

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
        (k) => columnLabels[k] === label,
      );
      if (key && row[key] !== undefined) {
        newRow[label] = formatValue(label, row[key], isSmallScreen);
      }
    });

    newRow[""] = (
      <button
        onClick={() => setRootNodeId(row.uuid)}
        className="explorerButton ae:bg-slate-500 ae:hover:bg-slate-700 ae:text-white"
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
// TODO - refactor, this is very messy atm.
// TODO check the search feature - maybe wire into full_types api...?
export default function GroupsViewer({ restApiUrl, setRootNodeId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [rawTableData, setRawTableData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchNode, setSearchNode] = useState(""); // new state for search
  const limit = 200;

  // responsive
  const isSmallScreen = useMediaQuery("(max-width: 790px)");

  // columns based on screen
  const columnsToRender = isSmallScreen
    ? columnOrder.filter((c) => c !== "Created")
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
          offsetValue === 0 ? nodes : [...prev, ...nodes],
        );
        setOffset(offsetValue + nodes.length);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch nodes");
      } finally {
        setLoading(false);
      }
    },
    [restApiUrl, selectedGroups, selectedTypes],
  );

  // auto-fetch initial nodes
  useEffect(() => {
    if (rawTableData.length === 0) {
      fetchNodes(0, 1000);
    }
  }, [groups, rawTableData.length, fetchNodes]);

  // memoized formatted data (reacts to screen size)
  const tableData = useMemo(() => {
    return formatTableData(rawTableData, setRootNodeId, isSmallScreen);
  }, [rawTableData, isSmallScreen, setRootNodeId]);

  // handle manual node navigation
  const handleNodeSearch = () => {
    if (searchNode.trim() !== "") {
      setRootNodeId(searchNode.trim());
      setSearchNode(""); // clear input after navigation
    }
  };

  return (
    <div className="ae:flex ae:flex-col ae:lg:flex-row ae:gap-4 ae:overflow-auto ae:w-full ae:items-start">
      {/* Left panel */}
      <div className="ae:min-w-[250px] ae:max-w-[400px] ae:flex-shrink-0 ae:bg-slate-50 ae:p-2 ae:px-3 ae:rounded">
        {/* Top header + button */}
        <div className="ae:flex ae:gap-4 ae:items-center ae:mb-2">
          <div className="ae:font-medium">Filter by Node Types</div>
          <button
            onClick={() => fetchNodes(0)}
            className="explorerButton ae:bg-slate-500 ae:hover:bg-slate-700 ae:text-white"
          >
            Apply
          </button>
        </div>
        <TypeCheckboxTree
          types={aiidaTypes}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
        />
        <div className="ae:font-medium ae:my-2 ae:mt-4">
          Filter by Defined Groups
        </div>
        {sortGroups(groups).map((g) => (
          <label
            key={g.label}
            className="ae:flex ae:items-start ae:gap-2 ae:mb-1"
          >
            <input
              type="checkbox"
              className="ae:mt-1"
              checked={selectedGroups.includes(g.label)}
              onChange={(e) =>
                setSelectedGroups((prev) =>
                  e.target.checked
                    ? [...prev, g.label]
                    : prev.filter((x) => x !== g.label),
                )
              }
            />
            <span className="ae:truncate ae:block" title={g.label}>
              {g.label}
            </span>
          </label>
        ))}
      </div>

      {/* Right table */}
      <div className="ae:flex-1 ae:bg-white ae:rounded ae:gap-2">
        <div className="ae:flex ae:flex-col ae:lg:flex-row ae:lg:items-center ae:gap-2">
          {/* Left side: node count + load more */}
          <div className="ae:flex-1 ae:flex ae:items-center ae:gap-2 ae:py-2">
            <div className="ae:text-xl ae:font-medium">
              {tableData.length} nodes loaded
            </div>
            {tableData.length > 0 && (
              <button
                onClick={() => fetchNodes(offset)}
                className="explorerButton ae:bg-slate-500 ae:hover:bg-slate-700 ae:text-white"
              >
                Load next 200
              </button>
            )}
          </div>

          {/* Right side: search with label */}
          <div className="ae:flex ae:flex-col ae:sm:flex-row ae:items-start ae:sm:items-center ae:gap-2 ae:py-1 ae:w-full ae:lg:w-auto">
            <span className="ae:font-medium">Navigate via UUID:</span>
            <input
              type="text"
              value={searchNode}
              onChange={(e) => setSearchNode(e.target.value)}
              placeholder="Enter a UUID"
              className="ae:flex-1 ae:min-w-80 ae:border-2 ae:border-gray-300 ae:focus:outline-none ae:focus:border-slate-500 ae:px-2 ae:py-1 ae:rounded"
            />
            <button
              onClick={handleNodeSearch}
              className="explorerButton ae:bg-slate-500 ae:hover:bg-slate-700 ae:text-white"
            >
              Go
            </button>
          </div>
        </div>

        {loading && (
          <div className="ae:w-full ae:h-[400px] ae:flex ae:items-center ae:justify-center">
            <Spinner />
          </div>
        )}

        {error && !loading && (
          <div className="ae:w-full ae:h-[400px] ae:flex ae:flex-col ae:items-center ae:justify-center">
            <ErrorDisplay message={error} onRetry={() => fetchNodes(offset)} />
          </div>
        )}

        {!loading && !error && (
          <DataTable
            columns={columnsToRender}
            data={tableData}
            maxWidth={"3000px"}
            sortableCols={["Unique ID", "Label", "Type", "Created", "Modified"]}
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
