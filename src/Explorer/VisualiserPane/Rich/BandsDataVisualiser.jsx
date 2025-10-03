import { useEffect, useRef, useState } from "react";
import { BandsVisualiser } from "bands-visualiser";

import Spinner from "../../../components/Spinner";
import { ErrorDisplay } from "../../../components/Error";

export default function BandsDataVisualiser({ nodeData }) {
  const containerRef = useRef(null);
  const [bandsDataArray, setBandsDataArray] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const aiidaBandsPath = nodeData.downloadByFormat?.json;

  const fetchData = async () => {
    if (!aiidaBandsPath) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(aiidaBandsPath);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const json = await res.json();
      setBandsDataArray([{ bandsData: json }]);
    } catch (err) {
      console.error("Failed to fetch bands JSON:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // initial fetch
  useEffect(() => {
    fetchData();
  }, [aiidaBandsPath]);

  useEffect(() => {
    if (!containerRef.current || !bandsDataArray) return;

    BandsVisualiser(containerRef.current, {
      bandsDataArray,
      settings: { showlegend: false },
    });
  }, [bandsDataArray]);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 bg-white border-gray-200 shadow-sm rounded-lg">
      <h2 className="text-md md:text-lg font-semibold px-3 pt-2">
        Bands Structure Plot
      </h2>

      <div className="w-full h-[450px] relative flex items-center justify-center">
        {/* Spinner */}
        {loading && <Spinner />}

        {/* Error */}
        {error && !loading && (
          <ErrorDisplay message={error} onRetry={() => fetchData()} />
        )}

        {/* Plot container */}
        {!loading && !error && bandsDataArray && (
          <div ref={containerRef} className="absolute inset-4" />
        )}
      </div>
    </div>
  );
}
