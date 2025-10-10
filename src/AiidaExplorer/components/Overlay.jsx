import React, { createContext, useContext, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const OverlayContext = createContext(null);

export function useOverlayContainer() {
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
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white w-full mx-4 h-5/6 rounded-xl overflow-auto transform transition-all duration-800 ease-in-out"
        style={{ maxWidth, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b px-3 py-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black p-1 rounded"
          >
            ✕
          </button>
        </div>
        <div className="px-8 py-4">{children}</div>
      </div>
    </div>,
    containerRef.current
  );
}
