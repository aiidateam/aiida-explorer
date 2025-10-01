// switch function that determines node printing based on AiiDA built ins.
// basic aiida node data is gathered as a neccessity so we can render uuids without additional fetches

// TODO - implement all of these in a nice way.
// Refactoring into some sort of object and object method is likely much cleaner -...-
// TODO - think about fetching these instantly.
export function getNodeDisplay(node) {
  const shortUUID = `${node.aiida.uuid.split("-")[0]}`;
  // const fallback = "\u00A0";  // pregap for this?
  const fallback = ""; // expand on click

  // Sorted by alpha since it seemed easier
  switch (node.label) {
    case "AbstractCode":
      return fallback;
    case "ArrayData":
      return fallback;
    case "BandsData":
      const bands = node.attributes?.["array|bands"];
      return bands?.[1] !== undefined ? `Num. bands: ${bands[1]}` : fallback;

    case "Bool":
      return node.attributes?.value !== undefined
        ? `Value: ${node.attributes.value}`
        : fallback;

    case "CalcJobNode":
      const proc_type = node?.aiida?.process_type?.split(":")[1];
      return proc_type ? proc_type : fallback;

    case "Code":
      const input_plugin = node?.attributes?.input_plugin;

      return input_plugin ? input_plugin : fallback;

    case "Dict":
      return node?.attributes
        ? `Num. keys: ${Object.keys(node.attributes).length}`
        : fallback;

    case "EnumData":
      return fallback;

    case "Float":
    case "Int":
      return node.attributes?.value !== undefined
        ? `Value: ${node.attributes.value}`
        : fallback;

    case "JsonableData":
      return fallback;

    case "List":
      return node.attributes?.value !== undefined
        ? `Length: ${node.attributes.list.length}`
        : fallback;

    // trying to render a string is probably unwise.
    case "Str":
      return fallback;

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
    // for now we render the pseudo file name.
    case "UpfData": {
      const element = node.download?.pseudo_potential?.header?.element;
      const psType = node.download?.pseudo_potential?.header?.pseudo_type;
      const psFile = node.download?.pseudo_potential?.header?.original_upf_file;

      if (element && psType) {
        return `${psFile}`;
      }
      return fallback;
    }

    case "XyData":
      return fallback;

    case "SinglefileData":
      return fallback;

    case "FolderData":
      return fallback;

    case "RemoteData":
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
