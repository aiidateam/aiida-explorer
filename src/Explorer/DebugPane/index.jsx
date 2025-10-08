export default function DebugPane({ selectedNode }) {
  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-semibold mb-2">Node Info</h3>
      {selectedNode ? (
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
          {" "}
          {JSON.stringify(selectedNode.data, null, 2)}
        </pre>
      ) : (
        <p>
          Click a node to see top level details. Double click fetch the node and
          get all the details.
        </p>
      )}
    </div>
  );
}
