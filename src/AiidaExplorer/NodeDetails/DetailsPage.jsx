import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import StructureVisualizer from "mc-react-structure-visualizer";
import Attributes from './Attributes';
import Files from './Files';
import Contents from './Contents';
import MetaData from './MetaData';
import BrowserSelection from './BrowserSelection';
import ExtraContent from './ExtraContent';
import Search from '../Statistics/Search';
import { JsonViewer } from '@textea/json-viewer';
import Brillouinzone from './brillouinzone';

const DetailsPage = ({ apiUrl }) => {
  const { uuid } = useParams();
  const [view, setView] = useState('raw');
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [derived, setDerived] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState(null);
  const [search , setSearch] = useState();
  const [header , setHeader] = useState();
  const [response , setResponse] = useState();
  const searchParams = new URLSearchParams(location.search);
  const isFromComputersGrid = searchParams.get('source') === 'computersGrid';

  console.log(isFromComputersGrid);

  const formatFormula = (formula) => {
    return formula.split(/(\d+)/).map((part, index) =>
      /\d/.test(part) ? <sub key={index}>{part}</sub> : part
    );
  };
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/nodes/${uuid}/download?download_format=cif&download=false`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json = await response.json();
        setData(json.data.download.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchHeader = async () => {
      try {
        const response = await fetch(`${apiUrl}/nodes/${uuid}`);
        const result = await response.json();
        setHeader(result.data.nodes[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the data:", error);
        setLoading(false);
      }
    };
    const fetchDerivedData = async () => {
      try {
        const response = await fetch(`${apiUrl}/nodes/${uuid}/contents/derived_properties`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json = await response.json();
        setResponse(json)
        setDerived(json.data.derived_properties);
        if(derived){
          setDerived(json.data.derived_properties);
          console.log(json);
        }else{
          setDerived(null);
        }
        console.log(derived);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttributesData = async () => {
      try {
        const response = await fetch(`${apiUrl}/nodes/${uuid}/contents/attributes`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json = await response.json();

        if (!json.data) {
          throw new Error('Empty or invalid response');
        }

        setAttributes(json.data.attributes);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      }
    };
    fetchHeader();
    fetchData();
    fetchDerivedData();
    fetchAttributesData();
  }, [uuid]);

  const displayData = header ? {
    UUID: header.uuid,
    Type: header.full_type,
    "Created on": formatDate(header.ctime),
    "Modified on": formatDate(header.mtime),
    "Creator": "Sebastiaan Huber (EPFL)"
  } : {};
  console.log(displayData);

  return (
<div>
  <div className="flex w-full flex-col md:flex-row h-[100vh] mx-4 p-5">
    <div className={` ${isFromComputersGrid ? 'w-full h-[100vh]' : 'w-full md:w-1/2'} p-6 border-2 mb-4 md:mb-0 md:mr-2  rounded-lg relative `}>
      <div className='p-5 relative border-2 bg-gray-50 border-gray-300 rounded'>
         <div className='border-2 border-gray-300 absolute top-[-1rem] left-[2%] px-3 py-1 bg-gray-200 z-10 align-middle items-center'>
          <h1 className="text-xl font-semibold text-center">Overview</h1>
        </div> 
        <div className="mb-4">
          <Search uuid={uuid} />
        </div>
        <div className='bg-white rounded shadow p-2'>
          <JsonViewer
            value={displayData}
            theme="githubLight"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            rootName={false}
          />
        </div>
      </div>
      <div className="flex pt-3 justify-between mb-4">
         {/* <button
            className="px-4 py-2 bg-blue-500 absolute top-0 left-0 text-white rounded-tl-md rounded-br-md"
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M244 400L100 256l144-144M120 256h292"/>
            </svg>
          </button> */}
      </div>
      {/* <div className='border-2 border-gray-300 absolute top-[-1rem] left-[40.5%] px-3 py-2 bg-green-200 z-10 align-middle items-center'>
          <h1 className="text-xl font-semibold text-center">Node Preview</h1>
        </div> */}
      <div className='px-5 py2 bg-gray-50 h-[65vh] border-2 relative border-gray-300 rounded'>
      <div className='border-2 border-gray-300 absolute top-[-1rem] left-[2%] px-3 py-1 bg-gray-200 z-10 align-middle items-center'>
          <h1 className="text-xl font-semibold text-center">Details</h1>
        </div> 
        <div className="flex justify-center mt-4 mb-4">
          <button
            className={`px-6 shadow-lg py-2 mx-2 rounded-lg ${view === 'raw' ? 'bg-blue-400 text-white' : 'bg-blue-100'}`}
            onClick={() => setView('raw')}
          >
            Raw
          </button>
          <button
            className={`px-6 shadow-lg py-2 mx-2 rounded-lg ${view === 'rich' ? 'bg-blue-400  text-white' : 'bg-blue-100'}`}
            onClick={() => setView('rich')}
          >
            Rich
          </button>
        </div>
        <div className="overflow-auto bg-white p-4 rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-[85%]">
          {view === 'raw' ? (
            <div>
              <Files apiUrl={apiUrl} uuid={uuid} />
              <div className='h-full'>
                <span className='font-semibold mt-2 font-mono mb-0'>Node Attributes :</span>
                <div className='h-full'>
                    <Attributes apiUrl={apiUrl} uuid={uuid} />
                </div>
              </div>
              <div className='mt-3'>
                <span className='font-semibold font-mono mb-0'>Node Extras :</span>
                <ExtraContent apiUrl={apiUrl} uuid={uuid} />
              </div>
            </div>
          ) : (
            <div>
              <Files apiUrl={apiUrl} uuid={uuid} />
              <Contents apiUrl={apiUrl} uuid={uuid} />
              {derived && (
                <div className="p-4 bg-gray-50 mb-4 border[-1px] border-gray-300 shadow-md rounded-lg">
                  <p className="text-lg font-semibold">
                    Formula: <span className="font-normal">{formatFormula(derived.formula)}</span>
                  </p>
                  <p className="text-lg font-semibold">
                    Dimension: <span className="font-normal">{derived.dimensionality.dim}</span>
                  </p>
                  <p className="text-lg font-semibold">
                    {derived.dimensionality.label}:{" "}
                    <span className="font-normal">{derived.dimensionality.value}</span>
                  </p>
                </div>
              )}
              {data && !error && (
                <div className="flex items-center justify-center">
                  <div className='m-auto'>
                    {data && <StructureVisualizer cifText={data} />}
                  </div>
                </div>
              )}
              {attributes.cell && (
                <div className="flex flex-col font-mono text-sm mb-4 mt-4">
                  <div className="w-full shadow-md overflow-auto h-42 border-2 border-gray-200 rounded-lg mr-2">
                    <table className="table-auto w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">Cell X</th>
                          <th className="px-4 py-2">Cell Y</th>
                          <th className="px-4 py-2">Cell Z</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributes.cell && attributes.cell.map((row, index) => (
                          <tr key={index}>
                            {row.map((cell, i) => (
                              <td key={i} className="border px-4 py-2">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {attributes.sites && (
                    <div className="w-full shadow-md overflow-auto h-96 mb-4 mt-4 border-2 border-gray-200 rounded-lg">
                      <table className="table-auto w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-2">Kind Name</th>
                            <th className="px-4 py-2">Position X</th>
                            <th className="px-4 py-2">Position Y</th>
                            <th className='px-4 py-2'> Position Z</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attributes.sites && attributes.sites.map((site, index) => (
                            <tr key={index}>
                              <td className="border px-4 py-2">{site.kind_name}</td>
                              {site.position.map((pos, i) => (
                                <td key={i} className="border px-4 py-2">{pos}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className='h-full w-full '>
                    <Brillouinzone data={response} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
    {!isFromComputersGrid && (
      <div className="w-full md:w-1/2 p-6 relative border-2 md:ml-2 border-gray-200 rounded-lg">
        <div className='border-2 border-gray-300 absolute top-[-1rem] left-[11%] translate-x-[-50%] px-3 py-1 bg-gray-200 z-10 align-middle items-center'>
          <h1 className="text-xl font-semibold text-center">Graph Preview</h1>
        </div >
        <div className='h-full w-full'>
          <BrowserSelection uuid={uuid} apiUrl={apiUrl} />
        </div>
      </div>
    )}
  </div>
</div>

  );
};

export default DetailsPage;
