import DataTable from "../../../components/DataTable";
import { DownloadIcon } from "../../../components/Icons";

// the calcjob visualiser
export default function CalcJobVisualiser({ files = {}, attributes = {} }) {
  // Default to empty arrays to avoid undefined errors
  const inputFiles = Array.isArray(files.input_files) ? files.input_files : [];
  const outputFiles = Array.isArray(files.output_files)
    ? files.output_files
    : [];

  // ----- Input File table -----
  const inputCols = ["Files", "Download"];
  const inputData = inputFiles.map((row) => ({
    Files: row.name,
    Download: (
      <a
        href={row.downloadUrl || "#"}
        download={row.name || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        <DownloadIcon size={18} />
      </a>
    ),
  }));

  // ----- Output File table -----
  const outputCols = ["Files", "Download"];
  const outputData = outputFiles.map((row) => ({
    Files: row.name,
    Download: (
      <a
        href={row.downloadUrl || "#"}
        download={row.name || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        <DownloadIcon size={18} />
      </a>
    ),
  }));

  // helper: convert dict into table rows safely
  const dictToRows = (dict) => {
    if (!dict || typeof dict !== "object") return [];
    return Object.entries(dict).map(([key, value]) => ({
      Key: key,
      Value:
        value === null || value === undefined
          ? "—"
          : typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value),
    }));
  };

  return (
    <div className="w-full h-full p-4 space-y-6 overflow-y-auto">
      {inputData.length > 0 && (
        <DataTable
          title="Input Files"
          columns={inputCols}
          data={inputData}
          sortableCols={["Files"]}
        />
      )}
      {outputData.length > 0 && (
        <DataTable
          title="Output Files"
          columns={outputCols}
          data={outputData}
          sortableCols={["Files"]}
          columnWidths={{ Files: "250px", Download: "100px" }}
        />
      )}
      {inputData.length === 0 && outputData.length === 0 && (
        <div>No files available</div>
      )}

      <DataTable
        key="attributes"
        title="Attributes"
        columns={["Key", "Value"]}
        data={dictToRows(attributes)}
      />
    </div>
  );
}
