import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'tailwindcss/tailwind.css';

const NodeSelection = () => {
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/nodes')
      .then(response => {
        setRowData(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

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
        <div >
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

  return (
    <div className=" w-[83%] mx-auto py-2 px-0">
      <div className="ag-theme-alpine text-center" style={{ width: '100%', height: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default NodeSelection;
