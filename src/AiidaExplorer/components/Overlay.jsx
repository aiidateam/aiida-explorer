import React, { createContext, useContext, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const OverlayContext = createContext(null);

function useOverlayContainer() {
  const ref = useContext(OverlayContext);
  if (!ref) {
    throw new Error(
      "useOverlayContainer must be used inside <OverlayProvider>"
    );
  }
  return ref;
}

export function OverlayProvider({ children, className = "" }) {
  const overlayContainerRef = useRef(null);

  return (
    <OverlayContext.Provider value={overlayContainerRef}>
      <div ref={overlayContainerRef} className={className}>
        {children}
      </div>
    </OverlayContext.Provider>
  );
}

export default function Overlay({
  children,
  active,
  onClose,
  title,
  maxWidth = "",
}) {
  const containerRef = useOverlayContainer();

  // Close overlay on ESC key
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onClose]);

  if (!active || !containerRef.current) return null;

  return createPortal(
    <div
      className="ae:absolute ae:inset-0 ae:z-50 ae:flex ae:items-center ae:justify-center ae:bg-black/30"
      onClick={onClose}
    >
      <div
        className="ae:bg-white ae:w-full ae:mx-4 ae:h-5/6 ae:rounded-md ae:overflow-auto ae:transform ae:transition-all ae:duration-800 ae:ease-in-out"
        style={{ maxWidth, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ae:flex ae:justify-between ae:items-center ae:border-b ae:px-3 ae:py-1">
          {title && <div className="ae:text-lg ae:font-medium">{title}</div>}
          <button
            onClick={onClose}
            className="ae:text-gray-600 ae:hover:text-black ae:hover:bg-slate-50 ae:rounded-lg ae:hover:cursor-pointer ae:p-1"
          >
            ✕
          </button>
        </div>
        <div className="ae:px-4 ae:py-4">{children}</div>
      </div>
    </div>,
    containerRef.current
  );
}
