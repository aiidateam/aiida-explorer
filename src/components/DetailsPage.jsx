import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import StructureVisualizer from "mc-react-structure-visualizer";
import Attributes from './Attributes';
import Files from './FIles';
import Contents from './Contents';
import MetaData from './MetaData';
import BrowserSelection from '../BrowserSelection';
import ExtraContent from './ExtraContent';

const DetailsPage = ({ moduleName }) => {
  const { uuid } = useParams();
  const [view, setView] = useState('raw');
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [derived, setDerived] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isFromComputersGrid = searchParams.get('source') === 'computersGrid';


  const formatFormula = (formula) => {
    return formula.split(/(\d+)/).map((part, index) =>
      /\d/.test(part) ? <sub key={index}>{part}</sub> : part
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/download?download_format=cif&download=false`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json = await response.json();

        // if (!json.data || !json.data.download || !json.data.download.data || json.data.download.data.trim().length === 0) {
        //   throw new Error('Empty or invalid response');
        // }

        setData(json.data.download.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchDerivedData = async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/contents/derived_properties`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const json = await response.json();

        // if (!json.data) {
        //   throw new Error('Empty or invalid response');
        // }

        setDerived(json.data.derived_properties);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttributesData = async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/contents/attributes`);

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

    fetchData();
    fetchDerivedData();
    fetchAttributesData();
  }, [uuid]);

  return (
    <div className="flex h-[100vh] mx-4 p-5">
      <div className={`w-1/2  ${isFromComputersGrid ? 'w-full' : 'w-1/2'} p-6 border-2 mr-2 border-gray-200 rounded-lg relative bg-gray-50 `}>
        <div className="flex justify-between mb-4">
          <button
            className="px-4 py-2 bg-blue-500 absolute top-0 left-0 text-white rounded-tl-md rounded-br-md"
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M244 400L100 256l144-144M120 256h292"/>
            </svg>
          </button>
        </div>
        <div className='border-2 border-gray-300 absolute top-[-1rem] left-[40.5%] px-3 py-2 bg-green-200 z-10 align-middle items-center'>
          <h1 className="text-xl font-semibold text-center">Node Preview</h1>
        </div>
        <div className="flex justify-center mb-4">
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
        <div className="overflow-auto bg-white p-4 rounded-lg shadow-[0_3px_10px_rgb(0,0,0,0.2)] h-[90%]">
          {view === 'raw' ? (
            <div>
              <Files moduleName={moduleName} uuid={uuid} />
              <div className="col-span-2 mb-4">
                <span className='font-semibold font-mono mb-0'>Node Metadata :</span>
                <MetaData moduleName={moduleName} uuid={uuid} />
              </div>
              <div>
                <span className='font-semibold mt-2 font-mono mb-0'>Node Attributes :</span>
                <Attributes moduleName={moduleName} uuid={uuid} />
              </div>
              <div>
                <span className='font-semibold mt-2 font-mono mb-0'>Node Extras :</span>
                <ExtraContent moduleName={moduleName} uuid={uuid} />
              </div>
            </div>
          ) : (
            <div>
              <Files moduleName={moduleName} uuid={uuid} />
              <Contents moduleName={moduleName} uuid={uuid} />
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
              {data &&!error && (
                <div className="flex items-center justify-center">
                  <div className='m-auto'>
                    {data && <StructureVisualizer cifText={data} />}
                  </div>
                </div> 
              )}
              {attributes && (
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
            {/* </div>
          )}
        </div>
      </div> */}
      {!isFromComputersGrid && (
        <div className="w-1/2 p-6 relative border-2 ml-2 rounded-lg border-gray-200">
          <div className='border-2 border-gray-300 absolute top-[-1rem] left-[40.5%] px-3 py-2 bg-green-200 z-10 align-middle items-center'>
            <h1 className="text-xl font-semibold text-center">Graph Preview</h1>
          </div >
          <div className='h-full w-full'>
            <BrowserSelection uuid={uuid} moduleName={moduleName} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;
