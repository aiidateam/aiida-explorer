import JSZip from "jszip";
import React, { useState, useCallback } from "react";

import { fetchFromQueryBuilder } from "../api";
import Spinner from "../components/Spinner";

const UPF_QUERY = {
  path: [
    {
      entity_type: "",
      orm_base: "node",
      tag: "node",
      joining_keyword: null,
      joining_value: null,
      edge_tag: null,
      outerjoin: false,
    },
  ],
  filters: {
    node: { node_type: { like: "data.core.upf.%" } },
  },
  project: {
    node: ["uuid", "attributes"],
  },
  project_map: {},
  order_by: [],
  limit: 10000,
  offset: 0,
  distinct: true,
};

export default function UtilitiesPane({ restApiUrl }) {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const handleDownload = useCallback(async () => {
    setStatus("querying");
    setProgress({ done: 0, total: 0 });

    try {
      const result = await fetchFromQueryBuilder(restApiUrl, UPF_QUERY);
      const nodes = result.node || [];

      if (nodes.length === 0) {
        setStatus("empty");
        return;
      }

      setStatus("downloading");
      setProgress({ done: 0, total: nodes.length });

      const zip = new JSZip();
      const CONCURRENCY = 5;
      let completed = 0;

      const downloadOne = async (node) => {
        const url = `${restApiUrl}/nodes/${encodeURIComponent(node.uuid)}/download?download_format=upf`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${node.uuid}`);

        const blob = await res.blob();
        zip.file(node.attributes?.filename || `${node.uuid.split("-")[0]}.upf`, blob);

        completed += 1;
        setProgress({ done: completed, total: nodes.length });
      };

      for (let i = 0; i < nodes.length; i += CONCURRENCY) {
        const batch = nodes.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(downloadOne));
      }

      setStatus("zipping");
      const content = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "upf_pseudopotentials.zip";
      link.click();
      URL.revokeObjectURL(link.href);

      setStatus("done");
    } catch (err) {
      console.error("UPF download failed:", err);
      setStatus("error");
    }
  }, [restApiUrl]);

  return (
    <div className="ae:mt-4 ae:border-t ae:border-slate-200 ae:pt-3">
      <div className="ae:font-medium ae:mb-2">Utilities</div>
      <p className="ae:text-xs ae:text-slate-500 ae:mb-2">
        Download all UPF pseudopotential files as a zip archive.
      </p>

      {status === "idle" && (
        <button
          onClick={handleDownload}
          className="explorerButton ae:bg-slate-500 ae:hover:bg-slate-700 ae:text-white ae:text-sm"
        >
          Download Zipped UPFs
        </button>
      )}

      {(status === "querying" || status === "downloading" || status === "zipping") && (
        <div className="ae:flex ae:items-center ae:gap-2 ae:text-sm">
          <Spinner size={20} />
          <span>
            {status === "querying" && "Querying UPF files..."}
            {status === "downloading" &&
              `Downloading ${progress.done} / ${progress.total}...`}
            {status === "zipping" && "Creating zip archive..."}
          </span>
        </div>
      )}

      {status === "empty" && (
        <div className="ae:text-sm ae:text-slate-500">
          No UPF files found on this profile.
        </div>
      )}

      {status === "done" && (
        <div className="ae:text-sm ae:text-green-700">
          Downloaded {progress.total} UPF files.
        </div>
      )}

      {status === "error" && (
        <div className="ae:text-sm ae:text-red-600 ae:flex ae:flex-col ae:gap-1">
          <span>Download failed. Some files may be inaccessible.</span>
          <button
            onClick={handleDownload}
            className="explorerButton ae:bg-slate-500 ae:hover:bg-slate-700 ae:text-white ae:text-xs ae:self-start"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
