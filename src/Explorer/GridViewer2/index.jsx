import React, { useEffect, useState, useCallback } from "react";
import DataTable from "../../components/DataTable";
import TreeDropdown from "../../components/TreeDropdown";
import { fetchGroups } from "../api";

import formatTableData, { columnOrder } from "./formatTable";

export function GroupButtons({ baseUrl, onSelectGroup }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups(baseUrl).then(setGroups);
  }, [baseUrl]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {groups.map((group) => (
        <button
          key={group.id}
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
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableDataRaw, setTableDataRaw] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // track selected node
  const [openNodes, setOpenNodes] = useState({}); // persist open nodes on dropdown

  useEffect(() => {
    if (!baseUrl) return;

    async function loadData() {
      try {
        const download = await fetchGroups(baseUrl);
        if (!download) return;
        setData(download);

        console.log("d", download);
      } catch (err) {
        console.error("Failed to fetch tree data", err);
      }
    }

    loadData();
  }, [baseUrl]);

  const toggleNode = (full_type) => {
    setOpenNodes((prev) => ({
      ...prev,
      [full_type]: !prev[full_type],
    }));
  };

  const handleNodeSelect = useCallback(
    async (node) => {
      console.log("Selected node:", node);
      setSelectedNode(node);

      try {
        const url = `${baseUrl}/nodes/page/1?perpage=10&full_type="${node.full_type}"&orderby=-ctime`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch node data");

        const nodeData = await res.json();
        const nodes = nodeData.data.nodes || [];
        setTableDataRaw(nodes);
        console.log("raw TD", nodes);

        // format table data
        setTableData(formatTableData(nodes));
      } catch (err) {
        console.error("Error fetching node data:", err);
      }
    },
    [baseUrl]
  );

  const columns = columnOrder;

  return (
    <div className="flex gap-4 mt-2 ml-2 max-h-[600px] overflow-auto">
      {/* Tree dropdowns on the left */}
      <div className="flex-shrink-0">
        <h3 className="my-2 mx-2"> All Groups:</h3>
        <GroupButtons
          baseUrl="https://aiida.materialscloud.org/mc3d-pbe-v1/api/v4"
          onSelectGroup={(group) => console.log("Selected group:", group)}
        />
      </div>

      {/* Table on the right */}
      <div className="flex-1">
        {tableData.length > 0 && selectedNode && (
          <DataTable
            title={`Full Type fetch data for ${
              selectedNode.full_type.split(".").slice(-2)[0]
            }:`}
            columns={columns}
            data={tableData}
          />
        )}
      </div>
    </div>
  );
}
