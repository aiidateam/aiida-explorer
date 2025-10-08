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
function getNodeColorClasses(type, selected = false) {
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
    borderStyle = "border-blue-600 shadow-md rounded transition duration-700";
    bgClass = "bg-blue-100 glow-4";
    textClass = "text-black font-semibold";
  }

  return { bgClass, textClass, borderStyle };
}

// custom node component.
export default function HorizontalNode({ data, selected }) {
  const { zoom } = useViewport();

  const baseNodeStyle = `min-w-[110px] text-center p-1.5 px-4 rounded border-3`;

  const baseLinkStyle = `absolute -translate-y-1/4
   whitespace-nowrap opacity-90
   bg-slate-200 border border-gray-300
   rounded-md px-1 py-0.5 text-gray-700 `;

  const leftLinkStyle = `${baseLinkStyle} left-full ml-1 text-left`;
  const rightLinkStyle = `${baseLinkStyle} right-full mr-1 text-right`;

  // counts styling
  // ----------
  const showCounts = zoom > 1.2; // only show counts when zoomed in
  const countSize = showCounts ? "text-[8px]" : "text-[10px]";

  const baseCountStyle = `
  absolute
  top-1/3
  bottom-1/3
  flex
  items-center
  ${countSize}
  text-slate-600
  font-light
  ${showCounts ? "" : "hidden"}
`;

  const leftCountStyle = `${baseCountStyle} left-0 ml-0.5 pr-1 pl-0.5
   bg-gray-400 bg-opacity-40 rounded-r-md`;

  const rightCountStyle = `${baseCountStyle} right-0 mr-0.5 pl-1 pr-0.5
   bg-gray-400 bg-opacity-40 rounded-l-md`;

  const { bgClass, textClass, borderStyle } = getNodeColorClasses(
    data.node_type,
    selected,
    data.pos,
  );

  const uuid = data.aiida.uuid.split("-")[0];
  const extraData = getNodeDisplay(data);

  // ----------
  // Determine fontsize based on zoom
  // ----------
  const fontSizeClass = zoom > 1.2 ? "text-[12px]" : "text-[14px]";
  const linkFontSizeClass =
    zoom > 1.2 ? "text-[9px] px-2 py-1" : "text-[12px] px-2 py-1";
  // Main label content
  const textHtml = (
    <div className={`${fontSizeClass}`}>
      {data.label}
      {zoom > 1.2 && <br />}
      {zoom > 1.2 && (
        <div>
          <div className="text-[8px] opacity-80">{`uuid: ${uuid}`}</div>

          <div className="text-[8px] opacity-80 ">{`${extraData}`}</div>
        </div>
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
      {data.pos !== 0 && linkLabelHtml}

      {/* {linkCountLabel} */}
      <div className={leftCountStyle}>
        {data.parentCount > 99 ? "99+" : (data.parentCount ?? "")}
      </div>
      <div className={rightCountStyle}>
        {data.childCount > 99 ? "99+" : (data.childCount ?? "")}
      </div>
      {textHtml}
      {/* node handles - margin modified to make arrows line up nicely.*/}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          pointerEvents: "none",
          opacity: 0,
          marginLeft: "4px",
        }}
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
