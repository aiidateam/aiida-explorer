import { BandsVisualiser } from "bands-visualiser";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import CardContainer from "../../components/CardContainer";
import ErrorDisplay from "../../components/Error";
import Spinner from "../../components/Spinner";

export default function BandsDataVisualiser({ nodeData }) {
  const containerRef = useRef(null);

  const aiidaBandsPath = nodeData.downloadByFormat?.json;
  const yAxisUnits = nodeData?.attributes?.units || "N/A";

  const {
    data: bandsDataArray,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bandsJson", aiidaBandsPath],
    queryFn: async () => {
      if (!aiidaBandsPath) {
        throw new Error("No bands JSON path available");
      }

      const res = await fetch(aiidaBandsPath);
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const json = await res.json();

      // match your original structure
      return [{ bandsData: json }];
    },
    enabled: !!aiidaBandsPath,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 5 * 60 * 1000, // cache lifetime (v5)
    retry: 1,
  });

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
  }, [bandsDataArray, yAxisUnits]);

  return (
    <div className="ae:w-full ae:mx-auto ae:p-4 ae:space-y-6">
      <CardContainer
        header="Bands Structure Plot"
        className="ae:!px-1.5 ae:!pt-2"
        childrenClassName="ae:!p-0"
      >
        <div className="ae:w-full ae:h-[450px] ae:relative ae:flex ae:items-center ae:justify-center">
          {isLoading && <Spinner />}

          {error && !isLoading && (
            <ErrorDisplay message={error} onRetry={refetch} />
          )}

          {!isLoading && !error && bandsDataArray && (
            <div ref={containerRef} className="ae:absolute ae:inset-0 " />
          )}
        </div>
      </CardContainer>
    </div>
  );
}
