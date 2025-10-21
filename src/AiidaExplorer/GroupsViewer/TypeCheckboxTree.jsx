import { useState } from "react";

import { RightDropDownIcon, DownDropDownIcon } from "../components/Icons";

export default function TypeCheckboxTree({
  types,
  selectedTypes,
  setSelectedTypes,
  level = 0,
}) {
  const [expanded, setExpanded] = useState({});

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
