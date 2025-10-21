import { useState } from "react";

export default function FormattedMetaData({ nodeData, userData }) {
  const users = userData?.users || [];
  const aiida = nodeData?.aiida;
  const [isOpen, setIsOpen] = useState(false);

  if (!aiida) {
    return (
      <div className="p-4 text-theme-500 italic">No metadata available</div>
    );
  }

  const owner = Array.isArray(users)
    ? users.find((u) => u.id === aiida.user_id)
    : null;

  return (
    <div className="">
      {/* Label with arrow on small screens */}
      <div
        className="flex gap-2 items-center cursor-pointer md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-md lg:text-lg font-semibold">
          {nodeData.label || ""}
        </h2>
        <span className="lg:hidden transition-transform duration-200">
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {/* Metadata content */}
      <div className={`${isOpen ? "block" : "hidden"} mt-1 lg:block lg:mt-2`}>
        <div className="space-y-1 px-1 text-xs lg:text-sm">
          {aiida.uuid && (
            <div>
              <span className="font-medium">UUID:</span> {aiida.uuid}
            </div>
          )}
          {aiida.ctime && (
            <div>
              <span className="font-medium">Created:</span> {aiida.ctime}
            </div>
          )}
          {aiida.mtime && (
            <div>
              <span className="font-medium">Modified:</span> {aiida.mtime}
            </div>
          )}
          {aiida.node_type && (
            <div>
              <span className="font-medium">Node Type:</span> {aiida.node_type}
            </div>
          )}
          {owner && (
            <div>
              <span className="font-medium">Owner:</span> {owner.first_name}{" "}
              {owner.last_name || ""}
              {owner.institution && (
                <span className="text-gray-500"> ({owner.institution})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
