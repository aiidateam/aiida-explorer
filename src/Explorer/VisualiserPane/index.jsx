import KpointsDataVisualiser from "./KpointsDataVisualiser";
import FolderDataVisualiser from "./FolderDataVisualiser";
import CalcJobVisualiser from "./CalcJobVisualiser";
import UpfDataVisualiser from "./UpfDataVisualiser";
import RawDataVisualiser from "./RawDataVisualiser";
import StructureVisualiser from "./StructureVisualiser";

export default function VisualiserPane({ baseUrl, selectedNode }) {
  if (!selectedNode) {
    return (
      <div className="w-full h-full p-4">
        <p>
          Click a node to see top level details. Double click to traverse the
          graph.
        </p>
      </div>
    );
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
    case "CifData":
      return (
        <div className="">
          {/* Top half: fixed to 50% of viewport height */}
          <StructureVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
          />

          {/* Bottom part: scrollable content */}
          <RawDataVisualiser nodeData={selectedNode.data} />
        </div>
      );

    case "KpointsData":
      return (
        <div>
          <KpointsDataVisualiser
            key={`visualiser-${label}-${aiida.uuid}`}
            nodeData={selectedNode.data}
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

    case "FolderData": {
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
