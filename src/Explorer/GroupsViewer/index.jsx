import React, { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { fetchGroups, fetchFromQueryBuilder } from "../api"; // make sure fetchFromQueryBuilder is exported
import formatTableData, { columnOrder } from "./formatTable";

// the REST API groups end point is practically useless.
// to get all nodes in a group;
// we build a query that we pass to the querybuilder instead
function makeGroupNodesQuery(groupLabel) {
  return {
    path: [
      {
        entity_type: "group.core",
        orm_base: "group",
        tag: "group",
      },
      {
        entity_type: "", // match any node type
        orm_base: "node",
        tag: "node",
        joining_keyword: "with_group",
        joining_value: "group",
      },
    ],
    filters: {
      group: {
        label: groupLabel,
      },
    },
    project: {
      node: ["id", "uuid", "node_type", "label", "ctime", "mtime"], // return only useful fields
    },
  };
}

export function GroupButtons({ baseUrl, onSelectGroup }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups(baseUrl).then(setGroups);
  }, [baseUrl]);

  return (
    <div className="flex flex-col gap-2 px-2">
      {groups.map((group) => (
        <button
          key={group.label}
          onClick={() => onSelectGroup(group)}
          className="px-2 py-1 rounded-md border border-gray-300 bg-gray-100 text-md text-gray-800 
                   hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="button"
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}

export default function GroupsViewer({ baseUrl = "" }) {
  const [tableData, setTableData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // we cache the grouped nodes
  // we dont want someone spamclicking to crash the API.
  const [cache, setCache] = useState({});

  const columns = [...columnOrder];

  async function handleSelectGroup(group) {
    setSelectedGroup(group);

    // Check cache first
    if (cache[group.label]) {
      console.log("Serving nodes from cache for group:", group.label);
      setTableData(formatTableData(cache[group.label]));
      return;
    }

    try {
      const postMsg = makeGroupNodesQuery(group.label);
      const result = await fetchFromQueryBuilder(baseUrl, postMsg);
      const nodes = result.node || [];

      // Save to cache
      setCache((prev) => ({ ...prev, [group.label]: nodes }));

      // Format for table
      setTableData(formatTableData(nodes));

      console.log("Fetched nodes for group:", group.label, nodes);
    } catch (err) {
      console.error("Failed to fetch nodes for group", group, err);
    }
  }

  return (
    <div className="flex gap-4 mt-2 ml-2 overflow-auto">
      <div className="flex-shrink-0">
        <h3 className="my-2 mx-2">AiiDA Groups within the Data:</h3>
        <GroupButtons baseUrl={baseUrl} onSelectGroup={handleSelectGroup} />
      </div>

      <div className="flex-1">
        {tableData.length > 0 && (
          <DataTable
            title={`${tableData.length} nodes in group: ${selectedGroup?.label}`}
            columns={columns}
            data={tableData}
            sortableCols={["Unique ID", "Type", "Created", "Modified"]}
          />
        )}
      </div>
    </div>
  );
}
