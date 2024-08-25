import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ClipLoader } from 'react-spinners';
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const NodeTable = ({ data, loading, sorting, onSort }) => {
  const navigate = useNavigate();

  const columnHelper = createColumnHelper();

  const switchToDetailsView = (uuid) => {
    navigate(`details/${uuid}`);
  };

  const SortableHeader = ({ column, children }) => {
    const isSortable = ['mtime', 'ctime', 'uuid'].includes(column);
    const currentSort = sorting.column === column ? sorting.order : null;

    return (
      <div className="flex items-center">
        {children}
        {isSortable && (
          <div className="ml-2 flex flex-col">
            <button
              onClick={() => onSort(column)}
              className={`text-xs ${currentSort === 'asc' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              ▲
            </button>
            <button
              onClick={() => onSort(column)}
              className={`text-xs ${currentSort === 'desc' ? 'text-blue-500' : 'text-gray-400'}`}
            >
              ▼
            </button>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    columnHelper.accessor("uuid", {
      header: ({ column }) => (
        <SortableHeader column="uuid">UUID</SortableHeader>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("node_type", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ctime", {
      header: ({ column }) => (
        <SortableHeader column="ctime">Creation Time</SortableHeader>
      ),
      cell: (info) => format(new Date(info.getValue()), "yyyy-MM-dd"),
    }),
    columnHelper.accessor("mtime", {
      header: ({ column }) => (
        <SortableHeader column="mtime">Modification Time</SortableHeader>
      ),
      cell: (info) => format(new Date(info.getValue()), "yyyy-MM-dd"),
    }),
    columnHelper.accessor("user_id", {
      header: "Creator",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("process_type", {
      header: "Process State",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      cell: (props) => (
        <button
          className="bg-blue-300 hover:bg-blue-400 py-1 px-2 rounded-md"
          onClick={() => switchToDetailsView(props.row.original.uuid)}
        >
          Details
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="loading-animation m-auto flex justify-center text-center">
        <ClipLoader size={30} color="#007bff" />
      </div>
    );
  }

  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2 border-b text-left bg-blue-50"
                >
                  {header.isPlaceholder ? null : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 border-b">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NodeTable;