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
import { ClipLoader } from 'react-spinners';
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const NodeTable = ({ data, isLoading }) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const navigate = useNavigate();

  const columnHelper = createColumnHelper();

  if (isLoading) {
    return (
      <div className="loading-animation m-auto flex justify-center text-center">
        <ClipLoader size={30} color="#007bff" />
      </div>
    );
  }

  const switchToDetailsView = (uuid) => {
    navigate(`details/${uuid}`);
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
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  });

  // const PaginationControls = () => {
  //   const pageCount = table.getPageCount();
  //   const currentPage = table.getState().pagination.pageIndex + 1;

  //   return (
  //     <div className="flex justify-center items-center space-x-2 my-2">
  //       <button
  //         onClick={() => table.setPageIndex(0)}
  //         disabled={!table.getCanPreviousPage()}
  //         className="px-2 py-1 border rounded disabled:opacity-50"
  //       >
  //         «
  //       </button>
  //       <button
  //         onClick={() => table.previousPage()}
  //         disabled={!table.getCanPreviousPage()}
  //         className="px-2 py-1 border rounded disabled:opacity-50"
  //       >
  //         ‹
  //       </button>
  //       {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
  //         <button
  //           key={page}
  //           onClick={() => table.setPageIndex(page - 1)}
  //           className={`px-2 py-1 border rounded ${
  //             page === currentPage ? "bg-gray-300" : "hover:bg-gray-200"
  //           }`}
  //         >
  //           {page}
  //         </button>
  //       ))}
  //       <button
  //         onClick={() => table.nextPage()}
  //         disabled={!table.getCanNextPage()}
  //         className="px-2 py-1 border rounded disabled:opacity-50"
  //       >
  //         ›
  //       </button>
  //       <button
  //         onClick={() => table.setPageIndex(pageCount - 1)}
  //         disabled={!table.getCanNextPage()}
  //         className="px-2 py-1 border rounded disabled:opacity-50"
  //       >
  //         »
  //       </button>
  //     </div>
  //   );
  // };

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
      {/* <PaginationControls />  */}
    </div>
  );
};

export default NodeTable;
