import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'tailwindcss/tailwind.css';
import GridViewer from './GridViewer';


const NodeSelection = ({moduleName}) => {
  const baseUrl = `https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/page/`;
  const urlEnd = '25%7C"&orderby=-ctime';


  const [rowData, setRowData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

  const handleNodeSelect = (data, page = 1,totalEntries,totalPages) => {
    setRowData(data);
    setCurrentPage(page);
    setTotalEntries(totalEntries);
    setTotalPages(totalPages);
  };

  const onPaginationChanged = (params) => {
    const newPage = params.api.paginationGetCurrentPage() + 1;
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      if (selectedNode) {
        fetchPageData(selectedNode, newPage);
      }
    }
  };

  const fetchPageData = async (node, page) => {
    fullType = fullType.replace(/\|/g, '');
    fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
    let url = `${baseUrl}${page}?&perpage=20&full_type="${fullType}${urlEnd}`;
    console.log(url);
      if (fullType.includes('process')) {
          fullType = fullType.replace(/\%/g,'');
          fullType = fullType.endsWith('%') ? fullType : `${fullType}%`;
          url = `${baseUrl}${page}?&perpage=20&attributes=true&attributes_filter=process_label,process_state,exit_status,exit_message,process_status,exception&full_type="${fullType}%25%7C%25"&orderby=-ctime`;
          console.log(url);
      }
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      handleNodeSelect(data.data.nodes, page);
    } catch (error) {
      console.error(`Error fetching data for ${node.full_type} on page ${page}:`, error);
    }
  };


  return (
    <div className="flex w-[100%] mx-auto py-2 px-0">
      <div className="w-1/5 mr-2 bg-green-100">
        <GridViewer onSelectNode={handleNodeSelect} moduleName={moduleName} currentPage={currentPage} setSelectedNode={setSelectedNode} />
      </div>
      <div className="w-4/5 ml-2">
        <div className="ag-theme-alpine text-center" style={{ width: '100%', height: '98%' }}>
        <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={20}
            domLayout="autoHeight"
            paginationTotalPages={totalPages}
            paginationTotalRowCount={totalEntries}          
            onPaginationChanged={onPaginationChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeSelection;