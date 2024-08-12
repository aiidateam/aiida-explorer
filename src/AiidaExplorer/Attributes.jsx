import React, { useEffect, useState, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import { JsonViewer } from '@textea/json-viewer';
import { JSONTree } from 'react-json-tree';
import { FaCopy, FaCheck } from 'react-icons/fa';

const Attributes = ({ uuid, apiUrl }) => {
  const [data, setData] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(true);
  const [computerData, setComputerData] = useState(null);
  const [computerLoading, setComputerLoading] = useState(true);
  const [derivedProperties, setDerivedProperties] = useState(null);
  const [nodeError, setNodeError] = useState(null);
  const [computerError, setComputerError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState(false);

  const handleCopyClick = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  }, []);

  const getData = async () => {
    try {
      const res = await fetch(`${apiUrl}/nodes/${uuid}?attributes=true`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      console.log("Fetched Node Data:", data.data.nodes[0].attributes);
      setData(data.data.nodes[0].attributes);
    } catch (error) {
      console.error("Error fetching node data:", error);
      setNodeError("Failed to fetch node data");
    } finally {
      setNodeLoading(false);
    }
  };

  const getComputerData = async () => {
    try {
      const res = await fetch(`${apiUrl}/computers/${uuid}?attributes=true`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      console.log("Fetched Computer Data:", data.data.computers[0]);
      setComputerData(data.data.computers[0]);
    } catch (error) {
      console.error("Error fetching computer data:", error);
      setComputerError("Failed to fetch computer data");
    } finally {
      setComputerLoading(false);
    }
  };

  const fetchDerivedProperties = async () => {
    try {
      const response = await axios.get(`${apiUrl}/nodes/${uuid}/contents/derived_properties/`);
      setDerivedProperties(response.data);
    } catch (error) {
      console.error('Error fetching derived properties:', error);
    }
  };

  useEffect(() => {
    getData();
    getComputerData();
    fetchDerivedProperties();
  }, [uuid, apiUrl]);

  if (nodeLoading || computerLoading) {
    return (
      <div className="loading-animation m-auto flex justify-center text-center">
        <ClipLoader size={30} color="#007bff" />
      </div>
    );
  }

  if (nodeError && computerError) {
    return <div className='bg-gray-100 p-4 rounded-lg'>Error loading data</div>;
  }
  
  const renderDerivedPropertiesTable = () => {
    if (!derivedProperties || !derivedProperties.data || !derivedProperties.data.derived_properties) {
      return null;
    }

    const { explicit_kpoints_abs, mesh, offset } = derivedProperties.data.derived_properties;

    return (
      <div className="my-4">
        {explicit_kpoints_abs && (
          <>
            <h2 className="text-lg font-mono mt-4 font-bold mb-2">Kpoints (1/Å)</h2>
            <div className='overflow-y-auto h-96 font-mono'>
              <table className="table-auto w-full text-left border-collapse border border-gray-300 mb-4">
                <thead>
                  <tr className='text-orange-800'>
                    <th className="border border-gray-300 px-4 py-2">kX</th>
                    <th className="border border-gray-300 px-4 py-2">kY</th>
                    <th className="border border-gray-300 px-4 py-2">kZ</th>
                  </tr>
                </thead>
                <tbody>
                  {explicit_kpoints_abs.map((kpoint, index) => (
                    <tr key={index} className='text-blue-900'>
                      <td className="border border-gray-300 px-4 py-2">{kpoint[0]}</td>
                      <td className="border border-gray-300 px-4 py-2">{kpoint[1]}</td>
                      <td className="border border-gray-300 px-4 py-2">{kpoint[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {mesh && offset && (
          <>
            <h2 className="text-lg mt-4 font-bold font-mono mb-2">Kpoints mesh and offset</h2>
            <div className='overflow-y-auto h-96 font-mono text-center'>
              <table className="table-auto w-full text-center border-collapse border border-gray-300">
                <thead>
                  <tr className='text-orange-800'>
                    <th className="border border-gray-300 px-4 py-2">Mesh</th>
                    <th className="border border-gray-300 px-4 py-2">Offset</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='text-blue-900'>
                    <td className="border border-gray-300 px-4 py-2">
                      {mesh.map((value, index) => (
                        <span key={index} className="block">{value}</span>
                      ))}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {offset.map((value, index) => (
                        <span key={index} className="block">{value}</span>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-animation m-auto flex justify-center text-center">
        <ClipLoader size={30} color="#007bff" />
      </div>
    );
  }

  if (error) {
    return <div className='bg-gray-100 p-4 rounded-lg'>
    <JsonViewer
    value={{}}
    theme="githubLight"
    displayDataTypes={false}
    displaySize={false}
    enableClipboard={false}
    rootName = {false}
  /></div>;
  }

  const jsonData = data ? data : {};

  return (
    <div>
      <div className="relative border-2 border-gray-100 p-3 shadow-lg">
      {data && Object.keys(data).length > 0 && (
          <div>
            {/* <h3>Node Data:</h3> */}
            <JsonViewer
              value={data}
              theme="githubLight"
              displayDataTypes={false}
              displaySize={false}
              enableClipboard={false}
              rootName={false}
            />
          </div>
        )}
        {computerData && Object.keys(computerData).length > 0 && (
          <div>
            {/* <h3>Computer Data:</h3> */}
            <JsonViewer
              value={computerData}
              theme="githubLight"
              displayDataTypes={false}
              displaySize={false}
              enableClipboard={false}
              rootName={false}
            />
          </div>
        )}
       <CopyToClipboard text={JSON.stringify(data, null, 2)} onCopy={handleCopyClick}>
          <button className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md hover:bg-gray-100 transition-colors duration-200">
            {isCopied ? (
              <FaCheck className="text-green-600" />
            ) : (
              <FaCopy className="text-gray-600" />
            )}
          </button>
        </CopyToClipboard>
      </div>
      <div>
        {renderDerivedPropertiesTable()}
      </div>
      {/* {lastJob && (
        <div>
          <span className='font-mono font-bold text-md'>Last Job Details :</span>
          <JsonViewer
            value={lastJob}
            theme="githubLight"
            displayDataTypes={false}
            displaySize={false}
            enableClipboard={false}
          />
        </div>
      )} */}
    </div>
  );
};

export default Attributes;
