import { useState, useRef, useEffect } from "react";

const labelStyle = "ae:flex ae:items-center ae:gap-1 ae:text-xs";

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
      className={`ae:absolute ae:top-1 ae:right-1 ae:z-10 ae:overflow-hidden ae:rounded-md ae:bg-slate-50  ae:transition-all ae:duration-300 ${
        expanded ? "ae:w-22" : "ae:w-6"
      }`}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="ae:text-xl ae:w-full ae:flex ae:justify-end ae:rounded-md ae:hover:cursor-pointer ae:hover:bg-slate-100"
        aria-expanded={expanded}
      >
        ⚙️
      </button>

      {expanded && (
        <div className="ae:flex ae:flex-col ae:gap-1 ae:pb-2 ae:pl-2">
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
