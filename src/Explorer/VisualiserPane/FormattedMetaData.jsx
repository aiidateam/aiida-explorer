import React from "react";

export default function FormattedMetaData({ nodeData, userData }) {
  const users = userData?.users || [];
  const aiida = nodeData?.aiida;

  if (!aiida) {
    return (
      <div className="p-4 text-gray-500 italic">No metadata available</div>
    );
  }

  // Resolve owner from user_id
  const owner = Array.isArray(users)
    ? users.find((u) => u.id === aiida.user_id)
    : null;

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-2">Node Metadata</h2>
      <div className="space-y-1 text-sm">
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
  );
}
