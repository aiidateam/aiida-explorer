import { useState } from "react";

export default function FormattedMetaData({ nodeData, userData }) {
  const users = userData?.users || [];
  const aiida = nodeData?.aiida;
  const [isOpen, setIsOpen] = useState(false);

  if (!aiida) {
    return (
      <div className="ae:p-4 ae:text-slate-500 ae:italic">
        No metadata available
      </div>
    );
  }

  const creator = Array.isArray(users)
    ? users.find((u) => u.id === aiida.user_id)
    : null;

  return (
    <div>
      {/* Label with arrow on small screens */}
      <div
        className="ae:flex ae:gap-2 ae:items-center ae:cursor-pointer ae:md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="explorerHeadingBig">{nodeData.label || ""}</div>
        <span className="ae:lg:hidden ae:transition-transform ae:duration-200">
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {/* Metadata content */}
      <div
        className={`${isOpen ? "ae:block" : "ae:hidden"} ae:mt-1 ae:lg:block ae:lg:mt-2`}
      >
        <div className="ae:space-y-1 ae:px-1 ae:text-xs ae:lg:text-sm">
          {aiida.uuid && (
            <div>
              <span className="ae:font-medium">UUID:</span> {aiida.uuid}
            </div>
          )}
          {aiida.ctime && (
            <div>
              <span className="ae:font-medium">Created:</span> {aiida.ctime}
            </div>
          )}
          {aiida.mtime && (
            <div>
              <span className="ae:font-medium">Modified:</span> {aiida.mtime}
            </div>
          )}
          {aiida.node_type && (
            <div>
              <span className="ae:font-medium">Node Type:</span>{" "}
              {aiida.node_type}
            </div>
          )}
          {creator && (
            <div>
              <span className="ae:font-medium">Creator:</span>{" "}
              {creator.first_name} {creator.last_name || ""}
              {creator.institution && (
                <span className="ae:text-gray-500">
                  {" "}
                  ({creator.institution})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
