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
      <div className="ae:ml-2">
        <div className="ae:flex ae:items-center ae:gap-1">
          {/* Arrow to toggle children */}
          {hasChildren && (
            <div
              className="ae:cursor-pointer"
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
            className="ae:cursor-pointer ae:text-gray-800 ae:hover:bg-gray-100 ae:p-1 ae:rounded ae:flex-1"
            onClick={() => onSelect && onSelect(node)}
          >
            {node.label}
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <div
            className="ae:overflow-hidden ae:transition-all ae:duration-300 ae:origin-top"
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
    <div className="ae:border ae:rounded ae:p-2 ae:bg-white ae:shadow ae:max-w-md">
      <TreeItem node={data} />
    </div>
  );
}
