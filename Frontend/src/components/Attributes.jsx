import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';

const Attributes = ({ uuid }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [derivedProperties, setDerivedProperties] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}?attributes=true`);
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        setData(data.data.nodes[0].attributes);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchDerivedProperties = async () => {
        try {
          const response = await axios.get(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}/contents/derived_properties/`);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <SyntaxHighlighter language="json" style={stackoverflowLight}>
        {JSON.stringify(data, null, 2)}
      </SyntaxHighlighter>
      <div>
        {renderDerivedPropertiesTable()}    
      </div>
    </div>
  );
};

export default Attributes;
