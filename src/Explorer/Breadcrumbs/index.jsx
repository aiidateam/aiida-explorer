import React from "react";

export default function Breadcrumbs({ trail, onClick, maxItems = 10 }) {
  // Keep only the last `maxItems` items
  const items = trail.slice(-maxItems);

  return (
    <div className="w-full border-t border-gray-300 p-2 flex gap-2 flex-wrap overflow-x-auto">
      {items.map((node, idx) => (
        <React.Fragment key={node.id}>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
            onClick={() => onClick(node)}
          >
            {node.data.label}
          </button>
          {idx < items.length - 1 && <span className="mx-1">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
