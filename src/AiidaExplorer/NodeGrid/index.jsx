import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import { ClipLoader } from "react-spinners";
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
  entriesPerPage = 20,
  sortColumn = 'ctime',
  sortOrder = 'desc'
) {
  let url = `${apiEndpoint}/nodes/page/${page}`;
  url += `?perpage=${entriesPerPage}&full_type="${fullType}"&orderby=${sortOrder === 'desc' ? '-' : ''}${sortColumn}`;
  if (fullType.includes("process")) {
    url += "&attributes=true";
    url +=
      "&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception";
  }
  const response = await fetch(url);
  const result = await response.json();

  return result.data.nodes;
}

const NodeGrid = ({ apiUrl }) => {
  const baseUrl = apiUrl;
  const entriesPerPage = 20;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNodeFilter, setSelectedNodeFilter] = useState(null);
  const [fullTypeCounts, setFullTypeCounts] = useState(null);
  const [sorting, setSorting] = useState({ column: 'ctime', order: 'desc' });


  const fetchData = async (page) => {
    setLoading(true);
    if (selectedNodeFilter && page >= 1) {
      try {
        const result = await fetchNodesPaginated(
          baseUrl,
          selectedNodeFilter.full_type,
          page,
          entriesPerPage,
          sorting.column,
          sorting.order
        );
        setData(result);
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

  useEffect(() => {
    setLoading(true);
    fetchFullTypeCounts(baseUrl)
      .then((counts) => {
        setFullTypeCounts(counts);
        if (counts.subspaces) {
          setSelectedNodeFilter(counts.subspaces[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [selectedNodeFilter, currentPage ,  sorting]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= getTotalPages()) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = (column) => {
    setSorting(prevSorting => ({
      column,
      order: prevSorting.column === column && prevSorting.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderPaginationControls = () => {
    const totalPages = getTotalPages();
    const startPage = Math.max(1, currentPage - 7);
    const endPage = Math.min(totalPages, currentPage + 7);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 ${
            i === currentPage ? "bg-blue-200" : "bg-gray-100"
          } text-sm rounded`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex space-x-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 bg-gray-100 text-sm rounded"
        >
          First
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-gray-100 text-sm rounded"
        >
          Last
        </button>
      </div>
    );
  };

  return (
    <div className="flex w-full h-4/5 mx-auto py-2 px-0 text-sm">
      <div className="w-full sm:w-1/5 mr-2 bg-green-50">
        <FilterSidebar
          fullTypeCounts={fullTypeCounts}
          selectedNode={selectedNodeFilter}
          onSelectNode={(nodeType) => {
            setSelectedNodeFilter(nodeType);
            setCurrentPage(1);
          }}
        />
      </div>
      <div className="w-full sm:w-4/5 ml-2 flex flex-col">
        <div className="overflow-x-auto h-[96%] flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-[96%]">
              <ClipLoader size={50} color="#007bff" />
            </div>
          ) : (
            <NodeTable data={data} loading={loading} sorting={sorting}
              onSort={handleSort}/>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:bg-gray-100 disabled:text-gray-400 text-xs"
          >
            Previous
          </button>
          {renderPaginationControls()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
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
