// column label mappings
const columnLabels = {
  uuid: "Unique ID",
  label: "Label",
  full_type: "Type",
  ctime: "Created",
  mtime: "Modified",
  id: "ID",
};

// desired column order (by labels)
export const columnOrder = [
  "Unique ID",
  "Label",
  "Type",
  "Created",
  "Modified",
  "",
];

// optional: per-column formatting
function formatValue(label, value) {
  switch (label) {
    case "Type": {
      if (typeof value !== "string") return value;
      // Remove trailing chars like "|" then take the last segment
      const parts = value.replace(/\|$/, "").split(".");
      return parts.at(-1) || value;
    }
    case "Created":
    case "Modified":
      return value ? new Date(value).toLocaleString() : "";
    default:
      return value;
  }
}

export default function formatTableData(nodes, navigate, location) {
  return nodes.map((row) => {
    const newRow = {};

    columnOrder.forEach((label) => {
      const key = Object.keys(columnLabels).find(
        (k) => columnLabels[k] === label,
      );
      if (key && row[key] !== undefined) {
        newRow[label] = formatValue(label, row[key]);
      }
    });

    newRow[""] = (
      <button
        onClick={() => {
          const hashPath = location.hash.split("?")[0];
          navigate(`${hashPath}?rootNode=${row.uuid}`);
        }}
        className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        View
      </button>
    );

    return newRow;
  });
}
