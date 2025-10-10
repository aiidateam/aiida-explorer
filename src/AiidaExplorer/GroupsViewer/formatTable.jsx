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
function formatValue(label, value, isSmallScreen = false) {
  switch (label) {
    case "Type": {
      if (typeof value !== "string") return value;
      const parts = value.replace(/\|$/, "").split(".");
      return parts.at(-1) || value;
    }
    case "Created":
    case "Modified":
      if (!value) return "";
      const date = new Date(value);
      return isSmallScreen
        ? date.toISOString().split("T")[0] // short YYYY-MM-DD
        : date.toLocaleString();
    case "Unique ID":
      if (isSmallScreen && typeof value === "string") {
        return value.split("-")[0]; // only first part of UUID
      }
      return value;
    default:
      return value;
  }
}

export default function formatTableData(
  nodes,
  setRootNodeId,
  isSmallScreen = false
) {
  return nodes.map((row) => {
    const newRow = {};

    columnOrder.forEach((label) => {
      const key = Object.keys(columnLabels).find(
        (k) => columnLabels[k] === label
      );
      if (key && row[key] !== undefined) {
        newRow[label] = formatValue(label, row[key], isSmallScreen);
      }
    });

    newRow[""] = (
      <button
        onClick={() => {
          setRootNodeId(row.uuid);
        }}
        className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        View
      </button>
    );

    return newRow;
  });
}
