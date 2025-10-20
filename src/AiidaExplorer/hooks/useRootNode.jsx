import { useState, useCallback } from "react";

export default function useRootNode(
  rootNode,
  defaultRootNode,
  onRootNodeChange
) {
  const isControlled = rootNode !== undefined;
  const [internalRootNodeId, setInternalRootNodeId] = useState(defaultRootNode);
  const rootNodeId = isControlled ? rootNode : internalRootNodeId;

  const setRootNodeId = useCallback(
    (id) => {
      if (!isControlled) setInternalRootNodeId(id);
      onRootNodeChange(id);
    },
    [isControlled, onRootNodeChange]
  );

  return [rootNodeId, setRootNodeId];
}
