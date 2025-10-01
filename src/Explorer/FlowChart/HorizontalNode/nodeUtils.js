// switch function that determines node printing based on AiiDA built ins.
// basic aiida node data is gathered as a neccessity so we can render uuids without additional fetches

// TODO - implement all of these in a nice way.
// TODO - fix why these arent auto added to the data..?
export function getNodeDisplay(node) {
  const shortUUID = `${node.aiida.uuid.split("-")[0]}`;
  const fallback = "\u00A0";

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
      if (node.attributes?.mesh) {
        const [x, y, z] = node.attributes.mesh;
        return `Grid: ${x} × ${y} × ${z}`;
      }

      if (node.attributes?.labels && node.attributes?.label_numbers) {
        return `Path: ${node.attributes.labels.join(" → ")}`;
      }

      return fallback;

    case "StructureData": {
      function prettyFormula(formula, maxLength = 22) {
        const subscriptMap = {
          0: "₀",
          1: "₁",
          2: "₂",
          3: "₃",
          4: "₄",
          5: "₅",
          6: "₆",
          7: "₇",
          8: "₈",
          9: "₉",
        };

        const converted = formula.replace(
          /\d/g,
          (digit) => subscriptMap[digit] || digit
        );

        // Cull if too long
        if (converted.length > maxLength) {
          return converted.slice(0, maxLength - 3) + "...";
        }
        return converted;
      }

      if (node.extras?.formula_hill) {
        return `${prettyFormula(node.extras.formula_hill)}`;
      }

      if (node.derived_properties?.formula) {
        return `${prettyFormula(node.derived_properties?.formula)}`;
      }

      return fallback;
    }

    // unclear what we should render for UpfData on click??
    // for now we render the Pseudo type and element
    case "UpfData": {
      const element = node.download?.pseudo_potential?.header?.element;
      const psType = node.download?.pseudo_potential?.header?.pseudo_type;
      const psFile = node.download?.pseudo_potential?.header?.original_upf_file;

      if (element && psType) {
        return `${psFile}`;
      }
      return fallback;
    }

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
