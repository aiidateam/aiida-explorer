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
  const [loading, setLoading] = useState(true);
  // const [lastJob, setLastJob] = useState([]);
  const [derivedProperties, setDerivedProperties] = useState(null);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${apiUrl}/nodes/${uuid}?attributes=true`);
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setData(data.data.nodes[0].attributes);
        // setLastJob(data.data.nodes[0].attributes.last_job_info || []);
      } catch (error) {
        setError(" ");
      } finally {
        setLoading(false);
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

    fetchDerivedProperties();
    getData();
  }, [uuid , apiUrl]);

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
  /></div>;
  }

  const jsonData = data ? data : {};

  return (
    <div>
      <div className="relative border-2 border-gray-100 p-3 shadow-lg">
        <JsonViewer
          value={jsonData}
          theme="githubLight"
          displayDataTypes={false}
          displaySize={false}
          enableClipboard={false}
        />
        <CopyToClipboard text={JSON.stringify(jsonData, null, 2)} onCopy={handleCopyClick}>
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
