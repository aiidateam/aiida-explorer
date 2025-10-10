import React from "react";

export default function Breadcrumbs({ trail, onClick, maxItems = 10 }) {
  const items = trail.slice(-maxItems);

  return (
    <div className="w-full flex gap-2 flex-wrap overflow-x-auto items-center bg-slate-100 border-t p-2 ">
      <span className="">History:</span>
      {items.map((node, idx) => (
        <React.Fragment key={`${node.id}-${idx}`}>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
            onClick={() => onClick(node, idx)}
          >
            {node.data.label} ({node.data.aiida.uuid.split("-")[0]})
          </button>
          {idx < items.length - 1 && <span className="mx-1">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
