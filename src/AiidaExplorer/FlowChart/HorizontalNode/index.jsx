import React, { memo } from "react";
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
  let bgClass = "ae:bg-gray-200";
  let textClass = "ae:text-black";
  let borderStyle = "ae:transition-all";

  if (type?.startsWith("process.workflow")) {
    bgClass = "ae:bg-orange-300";
    borderStyle = "ae:border-orange-400 ae:shadow-md";
  } else if (type?.startsWith("process")) {
    bgClass = "ae:bg-red-300";
    borderStyle = "ae:border-red-400 ae:shadow-md";
  } else if (type?.startsWith("data")) {
    bgClass = "ae:bg-green-300";
    borderStyle = "ae:border-green-400 ae:shadow-md";
  }

  if (selected) {
    borderStyle =
      "ae:border-blue-600 ae:shadow-md ae:rounded ae:transition ae:duration-700";
    bgClass = "ae:bg-blue-100 ae:glow-4";
    textClass = "ae:text-black ae:font-medium";
  }

  return { bgClass, textClass, borderStyle };
}

// custom node component.
function HorizontalNode({ data, selected }) {
  const { zoom } = useViewport();

  const baseNodeStyle = `ae:min-w-[150px] ae:text-center ae:py-1.5 ae:rounded ae:border-3`;

  // counts styling
  // ----------
  const showCounts = zoom > 1.2; // only show counts when zoomed in
  const countSize = showCounts ? "ae:text-[8px]" : "ae:text-[10px]";

  const baseCountStyle = `
  ae:absolute
  ae:top-1/3
  ae:bottom-1/3
  ae:flex
  ae:items-center
  ${countSize}
  ae:text-slate-600
  ae:font-light
  ${showCounts ? "" : "ae:hidden"}
`;

  const leftCountStyle = `${baseCountStyle} ae:left-0 ae:ml-0.5 ae:pr-1 ae:pl-0.5 ae:bg-gray-400/50 ae:rounded-r-sm`;

  const rightCountStyle = `${baseCountStyle} ae:right-0 ae:mr-0.5 ae:pl-1 ae:pr-0.5 ae:bg-gray-400/50 ae:rounded-l-sm`;

  const { bgClass, textClass, borderStyle } = getNodeColorClasses(
    data.node_type,
    selected,
    data.pos
  );

  const uuid = data.aiida.uuid.split("-")[0];
  const extraData = getNodeDisplay(data);

  // ----------
  // Determine fontsize based on zoom
  // ----------
  const fontSizeClass = zoom > 1.2 ? "ae:text-[12px]" : "ae:text-[14px]";

  // Main label content
  const textHtml = (
    <div className={`${fontSizeClass}`}>
      {data.label}
      {zoom > 1.2 && <br />}
      {zoom > 1.2 && (
        <div>
          <div className="ae:text-[8px] ae:opacity-80">{`uuid: ${uuid}`}</div>

          <div className="ae:text-[8px] ae:opacity-80 ">{`${extraData}`}</div>
        </div>
      )}
    </div>
  );

  return (
    // main node
    <div className={`${baseNodeStyle} ${bgClass} ${textClass} ${borderStyle}`}>
      {/* text strings. */}

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

export default memo(HorizontalNode);
