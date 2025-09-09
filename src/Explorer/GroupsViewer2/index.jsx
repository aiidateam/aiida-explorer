import React, { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { fetchGroups, fetchFromQueryBuilder } from "../api";
import formatTableData, { columnOrder } from "./formatTable";

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

// Build QueryBuilder POST body for collective
function makeFilteredNodesQuery({ groupLabel }) {
  const filters = { group: { label: groupLabel } };

  return {
    path: [
      { entity_type: "group.core", orm_base: "group", tag: "group" },
      {
        entity_type: "",
        orm_base: "node",
        tag: "node",
        joining_keyword: "with_group",
        joining_value: "group",
      },
    ],
    filters,
    project: { node: ["id", "uuid", "node_type", "label", "ctime", "mtime"] },
  };
}

export default function GroupsViewer2({ baseUrl = "" }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [cache, setCache] = useState({});

  useEffect(() => {
    fetchGroups(baseUrl).then(setGroups);
  }, [baseUrl]);

  const fetchFilteredNodes = async () => {
    try {
      const allNodes = [];

      for (const groupLabel of selectedGroups) {
        const cacheKey = `${groupLabel}`;
        let nodes = cache[cacheKey];
        if (!nodes) {
          const postMsg = makeFilteredNodesQuery({
            groupLabel,
          });
          const result = await fetchFromQueryBuilder(baseUrl, postMsg);
          nodes = result.node || [];
          setCache((prev) => ({ ...prev, [cacheKey]: nodes }));
        }
        allNodes.push(...nodes);
      }

      // Remove duplicates by UUID
      const uniqueNodes = Array.from(
        new Map(allNodes.map((n) => [n.uuid, n])).values()
      );

      setTableData(formatTableData(uniqueNodes));
    } catch (err) {
      console.error("Failed to fetch filtered nodes:", err);
    }
  };

  return (
    <div className="flex gap-4 p-3 overflow-auto w-full items-start">
      {/* Left filter panel */}
      <div className="min-w-[250px] max-w-[400px] flex-shrink-0 bg-slate-50 p-2 pr-4 rounded">
        <h4 className="font-medium mb-2">Filter by Defined Groups</h4>
        {sortGroups(groups).map((g) => (
          <label key={g.label} className="flex items-start gap-2 mb-2">
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
          onClick={fetchFilteredNodes}
          className="px-3 py-1 mb-2 ml-2 rounded bg-indigo-700 text-white hover:bg-indigo-800 transition"
        >
          Apply
        </button>
      </div>

      {/* Right table panel */}
      <div className="flex-1 bg-white p-2 rounded">
        <DataTable
          title={`${tableData.length} unique nodes in selected Groups`}
          columns={columnOrder}
          data={tableData || []}
          sortableCols={["Unique ID", "Label", "Type", "Created", "Modified"]}
          renderIfMissing={true}
        />
      </div>
    </div>
  );
}
