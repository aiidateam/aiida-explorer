import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const MetaData = ({ moduleName, uuid }) => {
  const [data, setData] = useState(null);
  const [computerData, setComputerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computerLoading, setComputerLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://aiida.materialscloud.org/mc3d/api/v4/nodes/${uuid}`);
        const result = await response.json();
        setData(result.data.nodes[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching the data:", error);
        setLoading(false);
      }
    };

    const fetchComputerData = async () => {
      try {
        const response = await fetch('https://aiida.materialscloud.org/mc3d/api/v4/computers/e3cb26e2-08ee-431f-84a2-4be4ecff60df?attributes=true');
        const result = await response.json();
        if (result.data && result.data.computers.length > 0) {
          setComputerData(result.data.computers[0]);
        }
        setComputerLoading(false);
      } catch (error) {
        console.error("Error fetching computer data:", error);
        setComputerLoading(false);
      }
    };

    fetchData();
    fetchComputerData();
  }, [uuid]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const displayData = data ? {
    UUID: data.uuid,
    Type: data.full_type,
    "Created on": formatDate(data.ctime),
    "Modified on": formatDate(data.mtime),
    "Creator": "Sebastiaan Huber (EPFL)"
  } : {};

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md">
        {loading ? (
          <p>Loading node data...</p>
        ) : (
          <SyntaxHighlighter language="json" style={stackoverflowLight}>
            {JSON.stringify(displayData, null, 2)}
          </SyntaxHighlighter>
        )}
        {computerLoading ? (
          <p>Loading computer data...</p>
        ) : (
          computerData && (
            <SyntaxHighlighter language="json" style={stackoverflowLight}>
              {JSON.stringify(computerData, null, 2)}
            </SyntaxHighlighter>
          )
        )}
      </div>
    </div>
  );
};

export default MetaData;
