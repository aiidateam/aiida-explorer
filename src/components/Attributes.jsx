import React, { useEffect, useState , useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import { JSONTree } from 'react-json-tree';
import { FaCopy , FaCheck } from 'react-icons/fa';

const Attributes = ({ uuid , moduleName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastJob , setLastJob] = useState([]);
  const [derivedProperties, setDerivedProperties] = useState(null);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const theme = {
    scheme: 'stackoverflow-light',
    author: 'stackoverflow',
    base00: '#f6f6f6',
    base01: '#dcdcdc',
    base02: '#c0c0c0',
    base03: '#808080',
    base04: '#808080',
    base05: '#404040',
    base06: '#404040',
    base07: '#404040',
    base08: '#f2777a',
    base09: '#f99157',
    base0A: '#ffcc66',
    base0B: '#99cc99',
    base0C: '#66cccc',
    base0D: '#6699cc',
    base0E: '#cc99cc',
    base0F: '#d27b53'
  };

  const handleCopyClick = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${uuid}?attributes=true`);
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setData(data.data.nodes[0].attributes);
        setLastJob(data.data.nodes[0].attributes.last_job_info);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchDerivedProperties = async () => {
        try {
          const response = await axios.get(`https://aiida.materialscloud.org/${moduleName}/api/v4/nodes/${uuid}/contents/derived_properties/`);
          setDerivedProperties(response.data);
        } catch (error) {
          console.error('Error fetching derived properties:', error);
        }
      };

    fetchDerivedProperties();

    getData();
  }, [uuid]);

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
    return <div>
      <div className="loading-animation m-auto flex justify-center text-center">
          <ClipLoader size={30} color="#007bff" />
        </div>
    </div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="relative">
      <JSONTree data={data} theme={theme} invertTheme={false} />
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
      {lastJob && (
          <div>
            <span className='font-mono font-bold text-md'>Last Job Details :</span>
            <JSONTree data={lastJob} theme={theme} invertTheme={false} />
          </div>
        )}
    </div>
  );
};

export default Attributes;
