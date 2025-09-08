import DataTable from "../../../components/DataTable";

export default function DictDataVisualiser({ data = {} }) {
  const {
    attributes = {},
    comments = {},
    extras = {},
    download = {},
    derived_properties = {},
    repo_list = {},
    files = {},
  } = data || {}; // double safety if data itself is null

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
      <DataTable
        key="attributes"
        title="Attributes"
        columns={["Key", "Value"]}
        data={dictToRows(attributes)}
      />
      <DataTable
        key="comments"
        title="Comments"
        columns={["Key", "Value"]}
        data={dictToRows(comments)}
      />
      <DataTable
        key="extras"
        title="Extras"
        columns={["Key", "Value"]}
        data={dictToRows(extras)}
      />
      <DataTable
        key="download"
        title="Download"
        columns={["Key", "Value"]}
        data={dictToRows(download)}
      />
      <DataTable
        key="derived"
        title="Derived Properties"
        columns={["Key", "Value"]}
        data={dictToRows(derived_properties)}
      />
      <DataTable
        key="repo"
        title="Repo List"
        columns={["Key", "Value"]}
        data={dictToRows(repo_list)}
      />

      <DataTable
        key="files"
        title="Files"
        columns={["Key", "Value"]}
        data={dictToRows(files)}
      />
    </div>
  );
}
