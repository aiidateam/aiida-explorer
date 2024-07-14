import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";

import NodeTable from "./NodeTable";

async function fetchFullTypeCounts(apiEndpoint) {
  try {
    const response = await fetch(`${apiEndpoint}/nodes/full_types_count/`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching full type counts:", error);
  }
}

async function fetchNodesPaginated(
  apiEndpoint,
  fullType,
  page,
  entriesPerPage = 20
) {
  let url = `${apiEndpoint}/nodes/page/${page}`;
  // query parameters:
  url += `?perpage=${entriesPerPage}&full_type="${fullType}"&orderby=-ctime`;
  if (fullType.includes("process")) {
    url += "&attributes=true";
    url +=
      "&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception";
  }
  const response = await fetch(url);
  const result = await response.json();

  return result.data.nodes;
}

const NodeGrid = ({ moduleName }) => {
  const baseUrl = `https://aiida.materialscloud.org/${moduleName}/api/v4/`;
  const entriesPerPage = 20;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNodeFilter, setSelectedNodeFilter] = useState(null);

  const [fullTypeCounts, setFullTypeCounts] = useState(null);

  const fetchData = async (page) => {
    setLoading(true);
    if (selectedNodeFilter && page >= 1) {
      try {
        const result = await fetchNodesPaginated(
          baseUrl,
          selectedNodeFilter.full_type,
          page,
          entriesPerPage
        );
        setData(result);
        // console.log(result)
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const getTotalPages = () => {
    if (selectedNodeFilter && selectedNodeFilter.counter) {
      const totalEntries = selectedNodeFilter.counter;
      return Math.ceil(totalEntries / entriesPerPage);
    }
    return 1;
  };

  // hook when the component renders for the first time
  useEffect(() => {
    setLoading(true);
    fetchFullTypeCounts(baseUrl).then((counts) => {
      console.log(counts);
      setFullTypeCounts(counts);

      // set the default selected filter to first subspaces
      if (counts.subspaces) {
        setSelectedNodeFilter(counts.subspaces[0]);
      }
    });
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [selectedNodeFilter, currentPage]);

  return (
    <div className="flex w-full mx-auto py-2 px-0 text-sm">
      <div className="w-1/5 mr-2 bg-green-50">
        <FilterSidebar
          fullTypeCounts={fullTypeCounts}
          selectedNode={selectedNodeFilter}
          onSelectNode={(nodeType) => {
            setSelectedNodeFilter(nodeType);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className="w-4/5 ml-2">
        <div className="overflow-x-auto">
          <NodeTable data={data} moduleName={moduleName} />
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setCurrentPage((old) => Math.max(old - 1, 1));
            }}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:bg-gray-100 disabled:text-gray-400 text-xs"
          >
            Previous
          </button>
          <span className="text-xs">
            Page {currentPage} of {getTotalPages()}
          </span>
          <button
            onClick={() => {
              setCurrentPage((old) => Math.max(old + 1, 1));
            }}
            disabled={currentPage === getTotalPages()}
            className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:bg-gray-100 disabled:text-gray-400 text-xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeGrid;
