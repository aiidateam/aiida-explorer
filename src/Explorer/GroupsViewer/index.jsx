import React, { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { fetchGroups, fetchFromQueryBuilder } from "../api";
import formatTableData, { columnOrder } from "./formatTable";

import { buildQuery } from "./queryHandler";

import {
  TypeCheckboxTree,
  aiidaTypes,
  getFlattenedNodeTypes,
} from "./TypesCheckbox";

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

export default function GroupsViewer2({ baseUrl = "" }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [offset, setOffset] = useState(0);
  const limit = 50; // items per 'add more'

  useEffect(() => {
    fetchGroups(baseUrl).then(setGroups);
  }, [baseUrl]);

  const fetchNodes = async (offsetValue = 0) => {
    try {
      const nodeTypes = getFlattenedNodeTypes(selectedTypes, aiidaTypes);

      const postMsg = buildQuery({
        groups: selectedGroups,
        nodeTypes,
        limit,
        offset: offsetValue,
      });

      const result = await fetchFromQueryBuilder(baseUrl, postMsg);
      const nodes = result.node || [];

      setTableData((prev) =>
        offsetValue === 0
          ? formatTableData(nodes)
          : [...prev, ...formatTableData(nodes)]
      );

      setOffset(offsetValue + nodes.length);
    } catch (err) {
      console.error("Failed to fetch nodes:", err);
    }
  };

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
              Load next 50
            </button>
          )}
        </div>

        <DataTable
          columns={columnOrder}
          data={tableData || []}
          sortableCols={["Unique ID", "Label", "Type", "Created", "Modified"]}
          renderIfMissing={true}
        />
      </div>
    </div>
  );
}
