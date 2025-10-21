/**
 * Controlled Recursive TreeDropdown component
 * Accepts:
 * - data: root node
 * - onSelect: callback when a node label is clicked
 * - openNodes: object mapping full_type to boolean (open/closed)
 * - toggleNode: function to toggle a node open/closed
 * - arrowClassName: Tailwind class for arrow styling
 */
export default function TreeDropdown({
  data,
  onSelect,
  openNodes,
  toggleNode,
  arrowClassName = "w-8 h-8 transform transition-transform duration-300",
}) {
  if (!data) return null;

  const TreeItem = ({ node }) => {
    const hasChildren = node.subspaces && node.subspaces.length > 0;
    const isOpen = !!openNodes[node.full_type];

    return (
      <div className="ml-2">
        <div className="flex items-center gap-1">
          {/* Arrow to toggle children */}
          {hasChildren && (
            <div
              className="cursor-pointer"
              onClick={() => toggleNode(node.full_type)}
            >
              <svg
                className={`${arrowClassName} ${isOpen ? "rotate-90" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 6L14 10L6 14V6Z" />
              </svg>
            </div>
          )}

          {/* Label triggers callback */}
          <div
            className="cursor-pointer text-gray-800 hover:bg-gray-100 p-1 rounded flex-1"
            onClick={() => onSelect && onSelect(node)}
          >
            {node.label}
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div
            className="overflow-hidden transition-all duration-300 origin-top"
            style={{ maxHeight: isOpen ? "1000px" : "0" }}
          >
            {node.subspaces.map((child) => (
              <TreeItem key={child.full_type} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded p-2 bg-white shadow max-w-md">
      <TreeItem node={data} />
    </div>
  );
}
