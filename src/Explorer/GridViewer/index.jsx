import React, { useEffect, useState, useCallback } from "react";
import DataTable from "../../components/DataTable";
import TreeDropdown from "../../components/TreeDropdown";
import { fetchAPIFullTypes } from "../api";

import formatTableData, { columnOrder } from "./formatTable";

export default function GridViewer({ baseUrl = "" }) {
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableDataRaw, setTableDataRaw] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null); // track selected node
  const [openNodes, setOpenNodes] = useState({}); // persist open nodes on dropdown

  useEffect(() => {
    if (!baseUrl) return;

    async function loadData() {
      try {
        const download = await fetchAPIFullTypes(baseUrl);
        if (!download) return;
        setData(download);
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
    [baseUrl],
  );

  const columns = columnOrder;

  return (
    <div className="flex gap-4 mt-2 ml-2 overflow-auto">
      {/* Tree dropdowns on the left */}
      <div className="flex-shrink-0">
        <h3 className="pb-2 px-2">AiiDA node datatypes:</h3>
        {data?.data?.subspaces?.map((subspace) => (
          <TreeDropdown
            key={subspace.full_type}
            data={subspace}
            onSelect={handleNodeSelect}
            openNodes={openNodes}
            toggleNode={toggleNode}
          />
        ))}
      </div>

      {/* Table on the right */}
      <div className="flex-1">
        {tableData.length > 0 && selectedNode && (
          <DataTable
            title={`All nodes with datatype ${
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
