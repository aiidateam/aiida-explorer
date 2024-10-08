import React, { useEffect, useState } from 'react';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { stackoverflowLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { JsonViewer } from '@textea/json-viewer';

const MetaData = ({ apiUrl, uuid }) => {
  const [data, setData] = useState(null);
  const [computerData, setComputerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computerLoading, setComputerLoading] = useState(true);

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch(`${apiUrl}/nodes/${uuid}`);
    //     const result = await response.json();
    //     setData(result.data.nodes[0]);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error("Error fetching the data:", error);
    //     setLoading(false);
    //   }
    // };

    const fetchComputerData = async () => {
      try {
        const response = await fetch(`${apiUrl}/computers/${uuid}`);
        const result = await response.json();
        if (result.data && result.data.computers.length > 0) {
          setComputerData(result.data.computers[0]);
        }
        console.log(result)
        setComputerLoading(false);
      } catch (error) {
        console.error("Error fetching computer data:", error);
        setComputerLoading(false);
      }
    };

    // fetchData();
    fetchComputerData();
  }, [uuid]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // const displayData = data ? {
  //   UUID: data.uuid,
  //   Type: data.full_type,
  //   "Created on": formatDate(data.ctime),
  //   "Modified on": formatDate(data.mtime),
  //   "Creator": "Sebastiaan Huber (EPFL)"
  // } : {};

  return (
    <div className="flex mt-2 w-full">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md">
        {/* {loading ? (
          <p>Loading node data...</p>
        ) : (
          <JsonViewer
            value={displayData}
            theme="githubLight"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            rootName = {false}
          />
          // <SyntaxHighlighter language="json" style={stackoverflowLight}>
          //   {JSON.stringify(displayData, null, 2)}
          // </SyntaxHighlighter>
        )} */}
        {computerLoading ? (
          <p>Loading computer data...</p>
        ) : (
          computerData && (
            <JsonViewer
            value={computerData}
            theme="githubLight"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            rootName = {false}
          />
            // <SyntaxHighlighter language="json" style={stackoverflowLight}>
            //   {JSON.stringify(computerData, null, 2)}
            // </SyntaxHighlighter>
          )
        )}
      </div>
    </div>
  );
};

export default MetaData;
