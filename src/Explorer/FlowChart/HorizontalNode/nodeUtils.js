// switch function that determines node printing based on AiiDA built ins.
// since the aiida data is gathered for free and will not require additional fetches (via singleclicks)
// we should prefer them.

export function getNodeDisplay(node) {
  const fallback = `uuid: ${node.aiida.uuid.split("-")[0]}`;

  // -----
  // Common Python DataTypes
  // -----
  switch (node.label) {
    case "Int":
    case "Float":
      return node.attributes?.value !== undefined
        ? `Value: ${node.attributes.value}`
        : fallback;

    // trying to render a string is probably unwise.
    case "Str":
      return fallback;

    case "Bool":
      return node.attributes?.value !== undefined
        ? `Value: ${node.attributes.value}`
        : fallback;

    case "List":
      return node.attributes?.value !== undefined
        ? `Length: ${node.attributes.list.length}`
        : fallback;

    // -----
    // These are AiiDA but easy to describe with a short string.
    // -----
    case "KpointsData":
      return node.attributes?.mesh !== undefined
        ? `Grid: ${node.attributes.mesh[0]} × ${node.attributes.mesh[1]} × ${node.attributes.mesh[2]}`
        : fallback;

    case "StructureData":
      return node.extras?.formula_hill !== undefined
        ? node.extras.formula_hill
        : fallback;

    case "UpfData":
      return node.aiida?.link_label !== undefined
        ? `Upf: ${node.aiida.link_label}`
        : fallback;

    case "BandsData":
      const bands = node.attributes?.["array|bands"];
      return bands?.[1] !== undefined ? `No. Bands: ${bands[1]}` : fallback;

    // AbstractData types cant easily be rendered as a short string.
    case "Dict":
      return fallback;

    case "EnumData":
      return fallback;

    case "JsonableData":
      return fallback;

    case "ArrayData":
      return fallback;

    case "XyData":
      return fallback;

    case "SinglefileData":
      return fallback;

    case "FolderData":
      return fallback;

    case "RemoteData":
      return fallback;

    case "AbstractCode":
      return fallback;

    case "Code":
      return fallback;

    case "InstalledCode":
      return fallback;

    case "PortableCode":
      return fallback;

    case "ContainerizedCode":
      return fallback;

    default:
      return fallback;
  }
}
