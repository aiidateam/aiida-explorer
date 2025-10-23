export default function DebugPane({ selectedNode }) {
  return (
    <div className="ae:w-full ae:h-full ae:p-4">
      <h3 className="ae:text-lg ae:font-medium ae:mb-2">Node Info</h3>
      {selectedNode ? (
        <pre className="ae:bg-slate-100 ae:p-2 ae:rounded ae:overflow-x-auto">
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
