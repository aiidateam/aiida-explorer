import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GridViewer from './GridViewer';
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

const ComputersGrid = ({ moduleName }) => {
  const [computersData, setComputersData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchComputers = async (page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/computers/page/${page}?perpage=10`);
      setComputersData(response.data.data.computers);
      console.log("Fetched computers:", response.data.data.computers);
    } catch (error) {
      console.error('Error fetching computers:', error);
      setError('Failed to fetch computers data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComputers(currentPage);
  }, [currentPage]);

  const handleDataFetched = (data) => {
    console.log("Computers data received in parent:", data);
    if (data && data.computers) {
      setComputersData(data.computers);
    }
  };

  const handleDetailsClick = (uuid) => {
    navigate(`/details/${uuid}`);
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor('uuid', {
      header: 'UUID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('label', {
      header: 'Label',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('hostname', {
      header: 'Host',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('scheduler_type', {
      header: 'Scheduler',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('uuid', {
      header: 'Details',
      cell: info => (
        <button
          onClick={() => handleDetailsClick(info.getValue())}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Details
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: computersData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: 10,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPageIndex = updater({ pageIndex: currentPage - 1 }).pageIndex;
        setCurrentPage(newPageIndex + 1);
      } else {
        setCurrentPage(updater.pageIndex + 1);
      }
    },
  });

  return (
    <div className="flex w-full mx-auto py-2 px-0 text-sm">
      <div className='w-1/5'>
        <GridViewer 
          onSelectNode={handleDataFetched} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setSelectedNode={setSelectedNode}
          moduleName={moduleName}
          onDataFetched={handleDataFetched}
        />
      </div>
      <div className="w-4/5 ml-2">
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="p-2 border-b text-left bg-blue-50">
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-2 border-b">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComputersGrid;