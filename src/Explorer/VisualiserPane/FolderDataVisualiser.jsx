import DataTable from "../../components/DataTable";

// TODO - add view input files (maybe predownload some on the client if they are small)
// This will match functionality in old explore.
// TODO add filesize as backend point -
// Make a note that files sholuld be called something else.
export default function FolderDataVisualiser({ nodeData }) {
  const repoList = nodeData?.repo_list?.data?.repo_list ?? [];

  const fileData = repoList.map((row) => ({
    Files: row.name,
  }));

  return (
    <div className="w-full h-full p-4 space-y-6 overflow-y-auto">
      <DataTable
        title="Folder Files"
        columns={["Files"]}
        data={fileData}
        sortableCols={false}
      />
    </div>
  );
}
