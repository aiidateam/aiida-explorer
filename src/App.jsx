import React, { useEffect, useState } from "react";
import FlowChart from "./FlowChart";
import { fetchGraphByNodeId } from "./api";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const rootNodeId = "030bf271-2c94-4d93-8314-7f82f271bd44";

  useEffect(() => {
    let mounted = true;

    async function loadGraph() {
      const { nodes: fetchedNodes, edges: fetchedEdges } =
        await fetchGraphByNodeId(rootNodeId);
      if (mounted) {
        setNodes(fetchedNodes);
        setEdges(fetchedEdges);

        console.log("Nodes:", fetchedNodes);
        console.log("Edges:", fetchedEdges);
      }
    }

    loadGraph();

    return () => {
      mounted = false;
    };
  }, [rootNodeId]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <FlowChart
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />
    </div>
  );
}

export default App;
