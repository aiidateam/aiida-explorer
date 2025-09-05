import React, { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { fetchGroups, fetchFromQueryBuilder } from "../api"; // make sure fetchFromQueryBuilder is exported
import formatTableData, { columnOrder } from "./formatTable";

function makeGroupNodesQuery(groupLabel) {
  return {
    path: [
      {
        entity_type: "group.core",
        orm_base: "group",
        tag: "group",
      },
      {
        entity_type: "", // matches any node type
        orm_base: "node",
        tag: "node",
        joining_keyword: "with_group",
        joining_value: "group",
      },
    ],
    filters: {
      group: {
        label: groupLabel, // filter dynamically by label
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
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {groups.map((group) => (
        <button
          key={group.label}
          onClick={() => onSelectGroup(group)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer",
          }}
        >
          {group.label}
        </button>
      ))}
    </div>
  );
}

export default function GridViewer2({ baseUrl = "" }) {
  const [tableData, setTableData] = useState([]);
  const [tableDataRaw, setTableDataRaw] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);

  const columns = columnOrder;

  //
  async function handleSelectGroup(group) {
    setSelectedGroup(group);

    try {
      const postMsg = makeGroupNodesQuery(group.label);
      const result = await fetchFromQueryBuilder(baseUrl, postMsg);
      const nodes = result.node;
      console.log(nodes);

      // format into table-friendly shape
      const formatted = formatTableData(nodes);
      setTableData(formatted);

      console.log("Nodes in group", group.label, nodes);
    } catch (err) {
      console.error("Failed to fetch nodes for group", group, err);
    }
  }

  return (
    <div className="flex gap-4 mt-2 ml-2 max-h-[600px] overflow-auto">
      <div className="flex-shrink-0">
        <h3 className="my-2 mx-2">Filter By Group</h3>
        <GroupButtons baseUrl={baseUrl} onSelectGroup={handleSelectGroup} />
      </div>

      {/* Table on the right */}
      <div className="flex-1">
        {tableData.length > 0 && (
          <DataTable
            title={`Nodes in group: ${selectedGroup?.label}`}
            columns={columns}
            data={tableData}
          />
        )}
      </div>
    </div>
  );
}
