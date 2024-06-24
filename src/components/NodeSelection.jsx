import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { format } from 'date-fns';
import GridViewer from './GridViewer';

const NodeSelection = ({ moduleName }) => {
  const baseUrl = `https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/page/`;
  const urlEnd = '25%7C"&orderby=-ctime';
  const entriesPerPage = 20; 

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const navigate = useNavigate();

  const fetchTotalEntries = useCallback(async (fullType) => {
    try {
      const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/full_types_count/`);
      const result = await response.json();
      const totalEntries = result.data.subspaces.find(node => node.full_type === fullType)?.counter || 0;
      console.log(result);
      return totalEntries;
    } catch (error) {
      console.error('Error fetching total entries:', error);
      return 0;
    }
  }, []);

  const fetchData = useCallback(async (page) => {
    if (!selectedNode) {
      setData([]);
      setTotalRows(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);

    let fullType = selectedNode.full_type.replace(/\|/g, '');
    fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
    let url = `${baseUrl}${page}?&perpage=${entriesPerPage}&full_type="${fullType}${urlEnd}`;

    if (fullType.includes('process')) {
      fullType = fullType.replace(/\%/g, '');
      fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
      url = `${baseUrl}${page}?&perpage=${entriesPerPage}&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&full_type="${fullType}25%7C%25"&orderby=-ctime`;
    }

    try {
      const totalEntries = await fetchTotalEntries(fullType);
      console.log(totalEntries);
      setTotalRows(totalEntries);
      setTotalPages(Math.ceil(totalEntries / entriesPerPage));

      const response = await fetch(url);
      const result = await response.json();
      setData(result.data.nodes);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalRows(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedNode, baseUrl, urlEnd, fetchTotalEntries]);

  useEffect(() => {
    if (selectedNode) {
      fetchData(currentPage);
    }
  }, [fetchData, currentPage, selectedNode]);

  const onButtonClick = (uuid) => {
    navigate(`/details/${uuid}`);
  };

  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor('uuid', {
      header: 'UUID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('node_type', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('ctime', {
      header: 'Creation Time',
      cell: info => format(new Date(info.getValue()), 'yyyy-MM-dd'),
    }),
    columnHelper.accessor('mtime', {
      header: 'Modification Time',
      cell: info => format(new Date(info.getValue()), 'yyyy-MM-dd'),
    }),
    columnHelper.accessor('user_id', {
      header: 'Creator',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('process_type', {
      header: 'Process State',
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <button onClick={() => onButtonClick(props.row.original.uuid)}>
          Details
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex w-full mx-auto py-2 px-0 font-mono text-sm">
      <div className="w-1/5 mr-2 bg-green-50">
        <GridViewer
          onSelectNode={setSelectedNode}
          moduleName={moduleName}
          currentPage={currentPage}
          setSelectedNode={setSelectedNode}
        />
      </div>
      <div className="w-4/5 ml-2">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-2 border-b text-left bg-blue-50">
                      {header.isPlaceholder ? null : (
                        <div>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                          {header.column.getCanFilter() ? (
                            <div>
                              <input
                                value={(header.column.getFilterValue() ?? '')}
                                onChange={e => header.column.setFilterValue(e.target.value)}
                                placeholder={`Filter ${header.column.columnDef.header}`}
                                className="w-full mt-1 p-1 text-xs border rounded"
                              />
                            </div>
                          ) : null}
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
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              fetchData(newPage);
            }}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:bg-gray-100 disabled:text-gray-400 text-xs"
          >
            Previous
          </button>
          <span className="text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              fetchData(newPage);
            }}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-green-100 text-green-800 rounded disabled:bg-gray-100 disabled:text-gray-400 text-xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeSelection;
