import React, { useState, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const NodeTable = ({ data }) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);

  const navigate = useNavigate();

  const columnHelper = createColumnHelper();

  const switchToDetailsView = (uuid) => {
    navigate(`details/${uuid}`); // relative path
  };

  const columns = [
    columnHelper.accessor("uuid", {
      header: "UUID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("node_type", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ctime", {
      header: "Creation Time",
      cell: (info) => format(new Date(info.getValue()), "yyyy-MM-dd"),
    }),
    columnHelper.accessor("mtime", {
      header: "Modification Time",
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
          className="bg-blue-300 hover:bg-blue-400 py-3 px-2 rounded-md"
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <table className="min-w-full bg-white border border-gray-200">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="p-2 border-b text-left bg-blue-50">
                {header.isPlaceholder ? null : (
                  <div>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                    {header.column.getCanFilter() ? (
                      <div>
                        <input
                          value={header.column.getFilterValue() ?? ""}
                          onChange={(e) =>
                            header.column.setFilterValue(e.target.value)
                          }
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
  );
};

export default NodeTable;
