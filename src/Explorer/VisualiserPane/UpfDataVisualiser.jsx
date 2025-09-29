import DataTable from "../../components/DataTable";

import { DownloadIcon } from "../../components/Icons";

// To maintain isolation visualisers should only be aware of their own data and not require a baseUrl and nodeId.
// however the format that "download" is in is a json object which is not the same as a upfFile.
// We would like to solve this somehow but its unclear?
// Technically this is also true for the StructureVisualiser.
export default function UpfDataVisualiser({ nodeData = {}, baseUrl = "" }) {
  const nodeId = nodeData.aiida.uuid;
  const download = nodeData.download;
  const attributes = nodeData.attributes;
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
      <div className="flex items-center gap-1">
        <h3 className="text-2xl">UpfData Node</h3>
        {/* for now we are downloading all the props. */}
        <DownloadIcon
          downloadUrl={`${baseUrl}/nodes/${nodeId}/download?download_format=upf`}
          filename={`${download.pseudo_potential.header.original_upf_file}`}
          size={22}
          className="pb-0.5"
        />
      </div>
      <DataTable
        key="attributes"
        title="Attributes"
        columns={["Key", "Value"]}
        data={dictToRows(attributes)}
      />
    </div>
  );
}
