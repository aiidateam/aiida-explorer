import React, { useState, useRef, useEffect } from "react";

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

  // Close menu when clicking outside
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
    <div ref={ref} className="ae:relative ae:inline-block">
      {/* Download button */}
      <button
        type="button"
        title="Download"
        onClick={() => setOpen(!open)}
        className="ae:bg-blue-600 ae:text-white ae:text-xs ae:px-1 ae:py-1 ae:rounded-md ae:cursor-pointer 
                   ae:hover:bg-blue-800 ae:focus:bg-blue-700 ae:focus:ring-3 ae:focus:ring-[#2563eb4d]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 15V3" />
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul
          className="ae:absolute ae:top-full ae:left-1/2 ae:-translate-x-1/2 ae:mt-1 ae:min-w-max 
                       ae:border ae:border-gray-200 ae:rounded-md ae:shadow-md text-sm z-50"
        >
          {downloadFormats.map(({ format, label }) => (
            <li key={format}>
              <a
                href={`${dl_url}?download_format=${format}`}
                className="ae:block ae:px-3 ae:py-1 ae:text-gray-900 ae:hover:bg-gray-100 ae:whitespace-nowrap"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
