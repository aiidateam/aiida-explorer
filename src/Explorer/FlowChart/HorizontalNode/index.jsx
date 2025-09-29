import React from "react";
import { Handle, Position, useViewport } from "reactflow";

import { getNodeDisplay } from "./nodeUtils";

/**
 * Returns Tailwind CSS classes for a node based on its type, selection, and position.
 *
 * @param {string} type - Node type string (e.g., "process.workflow", "data")
 * @param {boolean} selected - Whether the node is currently selected
 * @param {number} pos - Node position: -1 = left, 0 = center, 1 = right
 *
 * TODO - could incode prior node (via breadcrumb indexing) and make it
 * appear slightly different (this would also fuck with edge logic.)
 */
export function getNodeColorClasses(type, selected = false, pos = 0) {
  let bgClass = "bg-gray-200";
  let textClass = "text-black";
  let borderStyle = "transition-all";

  if (type?.startsWith("process.workflow")) {
    bgClass = "bg-orange-300";
    borderStyle = "border-orange-400 shadow-md";
  } else if (type?.startsWith("process")) {
    bgClass = "bg-red-300";
    borderStyle = "border-red-400 shadow-md";
  } else if (type?.startsWith("data")) {
    bgClass = "bg-green-300";
    borderStyle = "border-green-400 shadow-md";
  }

  if (selected) {
    borderStyle =
      "border-2 border-blue-600 shadow-md rounded-md transition duration-700";
    bgClass = "bg-blue-100 glow-4";
    textClass = "text-black font-semibold";
  }

  return { bgClass, textClass, borderStyle };
}

// custom node component.
export default function HorizontalNode({ data, selected }) {
  const { zoom } = useViewport();

  const baseNodeStyle = `min-w-[120px] text-center p-1.5 rounded border-3`;

  const baseLinkStyle = `absolute -translate-y-1/4 pointer-events-none whitespace-nowrap opacity-80
      bg-slate-200 border border-gray-300 rounded-md px-1 py-0.5 text-gray-700 `;

  const leftLinkStyle = `${baseLinkStyle} left-full ml-1 text-left`;
  const rightLinkStyle = `${baseLinkStyle} right-full mr-1 text-right`;

  // counts styling
  const countSize =
    zoom > 1.2
      ? "w-7 text-xs -translate-y-[165%]"
      : "w-10 text-sm -translate-y-[150%]";
  const baseCountStyle = `text-center absolute  pointer-events-none opacity-80
  bg-blue-400 border border-blue-800 rounded-md text-black  ${countSize}`;

  const leftCountStyle = `${baseCountStyle} -left-3`;
  const rightCountStyle = `${baseCountStyle} -right-3`;

  const { bgClass, textClass, borderStyle } = getNodeColorClasses(
    data.node_type,
    selected,
    data.pos,
  );

  // ----------
  // Determine fontsize based on zoom
  // ----------
  const fontSizeClass = zoom > 1.2 ? "text-[12px]" : "text-[16px]";
  const linkFontSizeClass =
    zoom > 1.2 ? "text-[9px] px-1 py-0.5" : "text-[12px] px-2 py-1";
  // Main label content
  const textHtml = (
    <div className={`${fontSizeClass}`}>
      {data.label}
      {zoom > 1.2 && <br />}
      {zoom > 1.2 && (
        <span className="text-[9px] opacity-80 ">{getNodeDisplay(data)}</span>
      )}
    </div>
  );

  // Link label
  const linkLabelHtml =
    data.aiida?.link_label && data.pos !== 0 ? (
      <div
        className={`${
          data.pos === 1 ? leftLinkStyle : rightLinkStyle
        } ${linkFontSizeClass}`}
      >
        {data.aiida.link_label.length > 21
          ? `${data.aiida.link_label.slice(0, 18)}...`
          : data.aiida.link_label}
      </div>
    ) : null;

  return (
    // main node
    <div className={`${baseNodeStyle} ${bgClass} ${textClass} ${borderStyle}`}>
      {/* text strings. */}
      {linkLabelHtml}

      {/* {linkCountLabel} */}
      <div className={leftCountStyle}>{data.parentCount ?? "N/A"}</div>
      <div className={rightCountStyle}>{data.childCount ?? "N/A"}</div>

      {textHtml}
      {/* node handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ pointerEvents: "none", opacity: 0, marginLeft: "3px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          pointerEvents: "none",
          opacity: 0,
          marginRight: "4px",
        }}
      />
    </div>
  );
}
