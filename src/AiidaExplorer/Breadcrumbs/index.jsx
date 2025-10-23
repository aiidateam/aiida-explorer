import React from "react";

export default function Breadcrumbs({ trail, onClick, maxItems = 10 }) {
  const items = trail.slice(-maxItems);

  return (
    <div className="ae:w-full ae:flex ae:gap-2 ae:flex-wrap ae:overflow-x-auto ae:items-center ae:bg-slate-100 ae:border-slate-800 ae:border-t ae:p-2">
      <span className="">History:</span>
      {items.map((node, idx) => (
        <React.Fragment key={`${node.id}-${idx}`}>
          <button
            className="explorerButton ae:text-sm "
            onClick={() => onClick(node, idx)}
          >
            {node.data.label} ({node.data.aiida.uuid.split("-")[0]})
          </button>
          {idx < items.length - 1 && <span className="ae:mx-1">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
