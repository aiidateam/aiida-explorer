import { useState, useEffect } from "react";
import { RightDropDownIcon, DownDropDownIcon } from "../../components/Icons";

// Base AIIDA TYPES HIERACHY
// TODO, use the full_types method to get the subset of these.
export const aiidaTypes = [
  {
    label: "Data",
    type: "data",
    children: [
      { label: "Int", type: "data.core.int.%" },
      { label: "Float", type: "data.core.float.%" },
      {
        label: "ArrayData",
        type: "data.core.array.%",
        children: [
          { label: "ArrayData", type: "data.core.array.%" },
          { label: "BandsData", type: "data.core.array.bands.%" },
          { label: "XyData", type: "data.core.array.xy.%" },
          { label: "TrajectoryData", type: "data.core.array.trajectory.%" },
          { label: "KpointsData", type: "data.core.array.kpoints.%" },
        ],
      },
      { label: "Str", type: "data.core.str.%" },
      { label: "Bool", type: "data.core.bool.%" },
      { label: "List", type: "data.core.list.%" },
      { label: "Dict", type: "data.core.dict.%" },
      { label: "StructureData", type: "data.core.structure.%" },
      { label: "RemoteData", type: "data.core.remote.%" },
      { label: "FolderData", type: "data.core.folder.%" },
      { label: "UpfData", type: "data.core.upf.%" },
    ],
  },
  {
    label: "Process",
    type: "process.%",
    children: [
      { label: "CalcJob", type: "process.calculation.calcjob.%" },
      { label: "CalcFunction", type: "process.calculation.calcjob.%" },
      { label: "WorkFunction", type: "process.workflow.workfunction.%" },
      { label: "Workgraph", type: "process.workflow.workgraph.%" },
      { label: "Workchain", type: "process.workflow.workgraph.%" },
    ],
  },
];

/**
 * Recursively collect all node types for the selected labels
 * @param {string[]} selectedLabels - selected type labels
 * @param {Array} typesHierarchy - full hierarchy (aiidaTypes)
 * @returns {string[]} flattened list of type strings
 */
export function getFlattenedNodeTypes(selectedLabels, typesHierarchy) {
  const result = [];

  const traverse = (nodes) => {
    nodes.forEach((n) => {
      if (selectedLabels.includes(n.label)) {
        result.push(n.type);
        if (n.children) traverse(n.children);
      } else if (n.children) {
        traverse(n.children);
      }
    });
  };

  traverse(typesHierarchy);
  return result;
}

export function TypeCheckboxTree({
  types,
  selectedTypes,
  setSelectedTypes,
  level = 0,
}) {
  const [expanded, setExpanded] = useState({});

  const updateDescendants = (nodes, add) => {
    nodes.forEach((n) => {
      if (add) newSelected.add(n.label);
      else newSelected.delete(n.label);
      if (n.children) updateDescendants(n.children, add);
    });
  };

  const allChildrenSelected = (children) =>
    children.every((c) => selectedTypes.includes(c.label));

  const someChildrenSelected = (children) =>
    children.some((c) => selectedTypes.includes(c.label)) &&
    !allChildrenSelected(children);

  const toggleSelect = (label, children) => {
    if (!children || children.length === 0) {
      // Leaf: toggle only itself
      setSelectedTypes((prev) =>
        prev.includes(label)
          ? prev.filter((t) => t !== label)
          : [...prev, label]
      );
      return;
    }

    // Parent: toggle self + all descendants
    setSelectedTypes((prev) => {
      const newSelected = new Set(prev);

      const updateDescendants = (nodes, add) => {
        nodes.forEach((n) => {
          if (add) newSelected.add(n.label);
          else newSelected.delete(n.label);
          if (n.children) updateDescendants(n.children, add);
        });
      };

      const allSelected =
        newSelected.has(label) && allChildrenSelected(children);

      if (allSelected) {
        newSelected.delete(label);
        updateDescendants(children, false);
      } else {
        newSelected.add(label);
        updateDescendants(children, true);
      }

      return [...newSelected];
    });

    // Auto-expand parent + all descendants
    const expandAllDescendants = (nodes) => {
      const newExpanded = {};
      nodes.forEach((n) => {
        if (n.children) {
          newExpanded[n.label] = true;
          Object.assign(newExpanded, expandAllDescendants(n.children));
        }
      });
      return newExpanded;
    };
    setExpanded((prev) => ({
      ...prev,
      [label]: true,
      ...expandAllDescendants(children),
    }));
  };

  return (
    <div className="flex flex-col">
      {types.map(({ label, children }) => {
        const isChecked = selectedTypes.includes(label);
        const isIndeterminate = children && someChildrenSelected(children);

        return (
          <div key={label} style={{ marginLeft: `${level * 8}px` }}>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => toggleSelect(label, children)}
            >
              <input
                type="checkbox"
                checked={isChecked}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => e.stopPropagation()} // handled by parent div click
              />
              {children && children.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent double toggle
                    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
                  }}
                  className="p-0.5 focus:outline-none"
                >
                  {expanded[label] ? (
                    <DownDropDownIcon size={14} />
                  ) : (
                    <RightDropDownIcon size={14} />
                  )}
                </button>
              )}

              <span>{label}</span>
            </div>
            {/* recursive child builder */}
            {children && children.length > 0 && expanded[label] && (
              <TypeCheckboxTree
                types={children}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
