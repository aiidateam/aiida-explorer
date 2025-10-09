import React, { useState, useRef, useEffect } from "react";
import "./StructDownloadButton.css"; // updated styles below

const defaultFormats = [
  { format: "cif", label: "CIF" },
  { format: "xsf", label: "XSF" },
  { format: "xyz", label: "XYZ" },
];

export function StructDownloadButton(props) {
  const dl_url = `${props.aiida_rest_url}/nodes/${props.uuid}/download`;
  const downloadFormats = props.download_formats || defaultFormats;

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="download-wrapper">
      <button
        type="button"
        className="download-button"
        title="Download"
        onClick={() => setOpen(!open)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 15V3" />
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div className="download-menu-container">
          <ul className="download-menu">
            {downloadFormats.map(({ format, label }) => (
              <li key={format}>
                <a href={`${dl_url}?download_format=${format}`}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
