import React from "react";
import { Handle, Position, useViewport } from "reactflow";

import { getNodeDisplay } from "./nodeUtils";

// tailwind color helper.
function getNodeColorClasses(type, selected = false, pos) {
  let bgClass = "bg-gray-200";
  let textClass = "text-black";
  let borderStyle = "border-transparent";

  if (type?.startsWith("process.workflow")) {
    bgClass = "bg-orange-300";
  } else if (type?.startsWith("process")) {
    bgClass = "bg-red-300";
  } else if (type?.startsWith("data")) {
    bgClass = "bg-green-300";
  }

  if (selected) {
    borderStyle = "border-black";
  } else if (pos === "center") {
    borderStyle = "border-[rgba(0,0,0,0.30)]";
  }

  return { bgClass, textClass, borderStyle };
}

// custom node component to rotate the edges.
export default function HorizontalNode({ data, selected }) {
  const { zoom } = useViewport();

  const baseNodeStyle = `min-w-[120px] text-center p-1.5 rounded border-3`;

  const baseLinkStyle = `absolute -translate-y-1/4 nodrag nopan pointer-events-none whitespace-nowrap opacity-80
      bg-slate-200 border border-gray-300 rounded-md px-1 py-0.5 text-gray-700 `;

  const leftLinkStyle = `${baseLinkStyle} left-full ml-1 text-left`;
  const rightLinkStyle = `${baseLinkStyle} right-full mr-1 text-right`;

  const { bgClass, textClass, borderStyle } = getNodeColorClasses(
    data.node_type,
    selected,
    data.pos,
  );

  // ----------
  // Determine fontsize based on zoom
  // ----------
  const fontSizeClass = zoom > 1.2 ? "text-[12px]" : "text-[16px]";
  const linkFontSizeClass = zoom > 1.2 ? "text-[9px]" : "text-[11px]";

  // Main label content
  const textHtml = (
    <div className={`${fontSizeClass} text-gray-900`}>
      {data.label}
      {zoom > 1.2 && <br />}
      {zoom > 1.2 && (
        <span className="text-[9px] opacity-80 ">{getNodeDisplay(data)}</span>
      )}
    </div>
  );

  // Link label
  const linkLabelHtml = data.aiida?.link_label && (
    <div
      className={`${
        data.pos === "input" ? leftLinkStyle : rightLinkStyle
      } ${linkFontSizeClass}`}
    >
      {data.aiida.link_label.length > 21
        ? `${data.aiida.link_label.slice(0, 18)}...`
        : data.aiida.link_label}
    </div>
  );
  return (
    // main node
    <div className={`${baseNodeStyle} ${bgClass} ${textClass} ${borderStyle}`}>
      {/* text strings. */}
      {linkLabelHtml}

      {textHtml}

      {/* node handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}
