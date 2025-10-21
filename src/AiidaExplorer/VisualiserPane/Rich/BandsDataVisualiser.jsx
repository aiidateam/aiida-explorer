import { BandsVisualiser } from "bands-visualiser";
import { useEffect, useRef, useState } from "react";

import ErrorDisplay from "../../components/Error";
import Spinner from "../../components/Spinner";

import CardContainer from "../../components/CardContainer";

export default function BandsDataVisualiser({ nodeData }) {
  const containerRef = useRef(null);
  const [bandsDataArray, setBandsDataArray] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const aiidaBandsPath = nodeData.downloadByFormat?.json;
  const yAxisUnits = nodeData?.attributes?.units || "N/A";

  useEffect(() => {
    if (!aiidaBandsPath) return;

    const fetchData = async () => {
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

    fetchData();
  }, [aiidaBandsPath]); // no warnings, safe

  useEffect(() => {
    if (!containerRef.current || !bandsDataArray) return;

    BandsVisualiser(containerRef.current, {
      bandsDataArray,
      settings: {
        showlegend: false,
        yaxis: { title: { text: `Value [${yAxisUnits}]` } },
        xaxis: { title: { text: `Path` } },
        margin: { l: 80, b: 45 },
      },
    });
  }, [bandsDataArray]);

  return (
    <div className="w-full mx-auto p-4 space-y-6">
      <CardContainer
        header="Bands Structure Plot"
        className="!px-1.5 !pt-2"
        childrenClassName="!p-0"
      >
        <div className="w-full h-[450px] relative flex items-center justify-center">
          {loading && <Spinner />}

          {error && !loading && (
            <ErrorDisplay message={error} onRetry={() => {}} />
          )}

          {!loading && !error && bandsDataArray && (
            <div ref={containerRef} className="absolute inset-0 " />
          )}
        </div>
      </CardContainer>
    </div>
  );
}
