import StructureVisualizer from "mc-react-structure-visualizer";

import { StructDownloadButton } from "mc-react-library";
import KpointsDataVisualiser from "./KpointsDataVisualiser";
import FolderDataVisualiser from "./FolderDataVisualiser";

const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

// handler for the visualiser pane
// TODO move the structureData/CifData to its own file.
export default function VisualiserPane({ selectedNode }) {
  if (!selectedNode)
    return <div className="w-full h-full p-4">No node selected</div>;

  if (["StructureData", "CifData"].includes(selectedNode.data.label)) {
    // cifData only has a  cifDownload Method...
    const cifText = selectedNode.data.download.cifText;

    let dlFormats = [
      { format: "cif", label: "CIF" },
      { format: "xsf", label: "XSF" },
      { format: "xyz", label: "XYZ" },
    ];
    if (selectedNode.data.label === "CifData") {
      dlFormats = [{ format: "cif", label: "CIF" }];
    }

    return (
      <div className="w-full h-full p-4 relative">
        {/* Download button in top-right corner */}
        <div className="absolute top-8 right-8 z-50">
          <StructDownloadButton
            aiida_rest_url={BASE_URL}
            uuid={selectedNode.data.aiida.uuid}
            download_formats={dlFormats}
          />
        </div>
        {/* Visualizer fills the container */}
        <div className="w-full h-full">
          <StructureVisualizer cifText={cifText} initSupercell={[2, 2, 2]} />
        </div>
      </div>
    );
  }

  if (selectedNode.data.label === "KpointsData") {
    return (
      <KpointsDataVisualiser
        attributes={selectedNode.data.attributes}
        derivedProperties={selectedNode.data.derived_properties}
      />
    );
  }

  if (selectedNode.data.label === "FolderData") {
    // TODO clean this up...
    const repoList = selectedNode.data?.repo_list?.data?.repo_list || [];
    return <FolderDataVisualiser repoList={repoList} />;
  }

  if (selectedNode.data.label === "RemoteData") {
    // TODO clean this up...
    const repoList = selectedNode.data?.repo_list?.data?.repo_list || [];
    return <FolderDataVisualiser repoList={repoList} />;
  }

  return (
    <div className="w-full h-full p-4">
      <pre>{JSON.stringify(selectedNode.data.download || {}, null, 2)}</pre>
    </div>
  );
}
