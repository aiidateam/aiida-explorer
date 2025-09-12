import StructureVisualizer from "mc-react-structure-visualizer";
import { StructDownloadButton } from "mc-react-library";
import KpointsDataVisualiser from "./KpointsDataVisualiser";
import FolderDataVisualiser from "./FolderDataVisualiser";
import DictDataVisualiser from "./DictDataVisualiser";
import CalcJobVisualiser from "./CalcJobVisualiser";
import UpfDataVisualiser from "./UpfDataVisualiser";

import RawDataVisualiser from "./RawDataVisualiser";

const BASE_URL = "https://aiida.materialscloud.org/mc2d/api/v4";

export default function VisualiserPane({ baseUrl, selectedNode }) {
  if (!selectedNode) {
    return <div className="w-full h-full p-4">No node selected</div>;
  }

  const {
    label,
    aiida,
    download,
    attributes,
    derived_properties,
    repo_list,
    files,
  } = selectedNode.data;

  // TODO move the structure visualiser into its own seperate compoennt
  // add features like cell/sites info (similar to mc3d).
  switch (label) {
    case "StructureData":
    case "CifData": {
      const cifText = download.cifText;
      let dlFormats = [
        { format: "cif", label: "CIF" },
        { format: "xsf", label: "XSF" },
        { format: "xyz", label: "XYZ" },
      ];

      if (label === "CifData") {
        dlFormats = [{ format: "cif", label: "CIF" }];
      }

      return (
        <div className="w-full h-full p-4 relative">
          {/* Download button in top-right corner */}
          <div className="absolute top-8 right-8 z-50">
            <StructDownloadButton
              key={`visualiser-${label}-${aiida.uuid}`}
              aiida_rest_url={baseUrl}
              uuid={aiida.uuid}
              download_formats={dlFormats}
            />
          </div>
          {/* Visualizer fills the container */}
          <div className="w-full h-full">
            <StructureVisualizer
              key={`visualiser-${label}-${aiida.uuid}`}
              cifText={cifText}
              initSupercell={[2, 2, 2]}
            />
          </div>
          <RawDataVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
          />
        </div>
      );
    }

    case "KpointsData":
      return (
        <div>
          <KpointsDataVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
            download={download}
            attributes={attributes}
            derivedProperties={derived_properties}
          />
          <RawDataVisualiser nodeData={selectedNode.data} />
        </div>
      );

    case "UpfData":
      return (
        <div>
          <UpfDataVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
            baseUrl={baseUrl}
          />
          <RawDataVisualiser nodeData={selectedNode.data} />
        </div>
      );

    case "FolderData":
    case "RemoteData": {
      return (
        <div>
          <FolderDataVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
          />
          <RawDataVisualiser nodeData={selectedNode.data} />
        </div>
      );
    }

    case "CalcJobNode": {
      return (
        <div>
          <CalcJobVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
          />
          <RawDataVisualiser nodeData={selectedNode.data} />
        </div>
      );
    }

    // we use the RawDataVisualiser as a standalone if the type is not known.
    default:
      return <RawDataVisualiser nodeData={selectedNode.data} />;
  }
}
