import { toPng } from "html-to-image";
import { getNodesBounds } from "reactflow";

const PADDING = 50;
// Browsers refuse absurdly large canvases; scale down instead of failing.
// (Applies to CSS dimensions; output pixels = this x PIXEL_RATIO.)
const MAX_DIMENSION = 6000;
// Render denser than screen CSS pixels so text/edges stay crisp.
const PIXEL_RATIO = 4;

/**
 * Renders the whole graph (including off-screen nodes) to a PNG download.
 * Captures the viewport element only, so controls/minimap/chrome are excluded.
 * @param {HTMLElement} viewportEl - `.react-flow__viewport` element
 * @param {Array} measuredNodes - internal nodes (e.g. from `instance.toObject()`),
 *   which carry measured width/height
 */
export async function downloadGraphSnapshot(
  viewportEl,
  measuredNodes,
  filename = "aiida-graph.png",
) {
  if (!viewportEl || !measuredNodes?.length) return;

  const bounds = getNodesBounds(measuredNodes);
  const width = bounds.width + PADDING * 2;
  const height = bounds.height + PADDING * 2;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));

  const dataUrl = await toPng(viewportEl, {
    backgroundColor: "#f8fafc",
    pixelRatio: PIXEL_RATIO,
    width: width * scale,
    height: height * scale,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${-bounds.x + PADDING}px, ${-bounds.y + PADDING}px) scale(${scale})`,
    },
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
