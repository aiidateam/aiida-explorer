import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const MetaData = ({ moduleName, uuid }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

    fetchData();
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
    <div className="flex justify-center items-center bg-gray-100 ">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <SyntaxHighlighter language="json" style={stackoverflowLight}>
            {JSON.stringify(displayData, null, 2)}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
};

export default MetaData;
