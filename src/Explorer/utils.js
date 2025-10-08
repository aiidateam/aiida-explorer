// helper that downloads only useful node information and not rendering information.
export function omitGraphKeys(obj) {
  const keysToRemove = ["label", "node_type", "pos", "link_label"];

  if (obj == null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => omitGraphKeys(item));
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key]) => !keysToRemove.includes(key))
      .map(([key, value]) => [key, omitGraphKeys(value)]),
  );
}
