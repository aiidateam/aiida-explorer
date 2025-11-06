import { useState, useRef, useEffect } from "react";

import { SettingsIcon } from "../../../components/Icons";

const labelStyle = "ae:flex ae:items-center ae:gap-1 ae:pt-1 ae:text-xs";

// Control div rendered above teh BZVis component.
export default function BZControls({
  showPathpoints,
  setShowPathpoints,
  showBVectors,
  setShowBVectors,
  showAxes,
  setShowAxes,
}) {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setExpanded(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close when escape is pressed
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setExpanded(false);
    }
    document.addEventListener("click", handleKey);
    return () => document.removeEventListener("click", handleKey);
  }, []);

  return (
    <div
      ref={panelRef}
      className={`ae:absolute  ae:top-1.5 ae:right-1.5 ae:z-10 ae:overflow-hidden ae:rounded-sm ae:border ae:bg-slate-50  ae:transition-all ae:duration-300 ${
        expanded ? "ae:w-22" : "ae:w-8.5" // closed size needed for animation
      }`}
    >
      <button
        className={`explorerButton ae:flex ae:items-center ae:gap-2 ae:w-full ${
          expanded ? "ae:justify-end ae:border-b" : "ae:justify-end"
        }`}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <SettingsIcon className="ae:w-4 ae:h-4" />
      </button>

      {expanded && (
        <div className="ae:flex ae:flex-col ae:pb-2 ae:pl-2">
          <label className={`${labelStyle}`}>
            <input
              type="checkbox"
              checked={showPathpoints}
              onChange={(e) => setShowPathpoints(e.target.checked)}
            />
            Kpoints
          </label>
          <label className={`${labelStyle}`}>
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
            />
            Axes
          </label>
          <label className={`${labelStyle}`}>
            <input
              type="checkbox"
              checked={showBVectors}
              onChange={(e) => setShowBVectors(e.target.checked)}
            />
            Bvectors
          </label>
        </div>
      )}
    </div>
  );
}
