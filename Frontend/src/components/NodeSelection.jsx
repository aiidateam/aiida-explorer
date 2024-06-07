import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'tailwindcss/tailwind.css';
import GridViewer from './GridViewer';

const NodeSelection = () => {
  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const onButtonClick = (uuid) => {
    navigate(`/details/${uuid}`);
  };

  const dateFormatter = (params) => {
    const date = new Date(params.value);
    return date.toISOString().split('T')[0];
  };

  const columnDefs = [
    { headerName: 'UUID', field: 'uuid', sortable: true },
    { headerName: 'Name', field: 'node_type' },
    { headerName: 'Creation Time', field: 'ctime', sortable: true, valueFormatter: dateFormatter },
    { headerName: 'Modification Time', field: 'mtime', sortable: true, valueFormatter: dateFormatter },
    { headerName: 'Creator', field: 'user_id' },
    { headerName: 'Process State', field: 'process_type' },
    {
      headerName: '',
      field: 'details',
      cellRenderer: (params) => (
        <div>
          <button
            onClick={() => onButtonClick(params.data.uuid)}
            className="btn-details"
          >
            Details
          </button>
        </div>
      ),
      cellStyle: { border: 'none' },
    },
  ];

  const handleNodeSelect = (data) => {
    setRowData(data);
  };

  const onPaginationChanged = (params) => {
    if (params.api.paginationGetCurrentPage() + 1 !== currentPage) {
      setCurrentPage(params.api.paginationGetCurrentPage() + 1);
    }
  };

  return (
    <div className="flex w-[98%] mx-auto py-2 px-0">
      <div className="w-1/5 mr-2 bg-green-100">
        <GridViewer onSelectNode={handleNodeSelect} currentPage={currentPage} />
      </div>
      <div className="w-4/5 ml-2">
        <div className="ag-theme-alpine text-center" style={{ width: '100%', height: '100%' }}>
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            domLayout="autoHeight"
            onPaginationChanged={onPaginationChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeSelection;
