import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import CardContainer from "../../../components/CardContainer";
import ErrorDisplay from "../../../components/Error";
import SimplePlot from "../../../components/SimplePlot";
import Spinner from "../../../components/Spinner";

import {
  getRadialFunctionsTraces,
  getBetaProjectorsTraces,
  getChargeDensitiesTraces,
} from "./formatTraces";

// Temp Beta UpfDataVisualiser.
export default function UpfDataVisualiser({ nodeData }) {
  const aiidaJsonPath = nodeData.downloadByFormat?.json;

  const {
    data: upfData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["upfJson", aiidaJsonPath],
    queryFn: async () => {
      const res = await fetch(aiidaJsonPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = json.pseudo_potential;

      return {
        header: data.header,
        orbital: getRadialFunctionsTraces(data),
        beta: getBetaProjectorsTraces(data),
        charge: getChargeDensitiesTraces(data),
      };
    },
    enabled: !!aiidaJsonPath,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ae:w-full ae:min-h-[450px] ae:flex ae:items-center ae:justify-center">
        <ErrorDisplay message={error?.message} onRetry={refetch} />
      </div>
    );
  }

  if (!upfData) return null;

  const { header, orbital, beta, charge } = upfData;

  const commonLegend = {
    x: 0.97,
    y: 0.95,
    xanchor: "right",
    yanchor: "top",
    bordercolor: "#ccc",
    borderwidth: 1,
  };

  const commonMargin = { t: 20, b: 40, l: 50, r: 20 };

  return (
    <div className="ae:w-full ae:mx-auto ae:p-4 ae:space-y-6">
      <CardContainer header="Metadata">
        <p>
          <span className="ae:font-medium">Element:</span>{" "}
          {header?.element || "N/A"}
        </p>
        <p>
          <span className="ae:font-medium">Valence Electrons:</span>{" "}
          {header?.z_valence ?? "N/A"}
        </p>
        <p>
          <span className="ae:font-medium">Pseudopotential Type:</span>{" "}
          {header?.pseudo_type || "N/A"}
        </p>
        <p>
          <span className="ae:font-medium">Functional:</span>{" "}
          {header?.functional || "N/A"}
        </p>
      </CardContainer>

      <CardContainer header="Orbital radial functions">
        <SimplePlot
          data={orbital}
          layout={{
            autosize: true,
            height: 400,
            margin: commonMargin,
            xaxis: { title: { text: "Radius (Bohr)" }, range: [0, 20] },
            yaxis: { title: { text: "φ(r)" } },
            legend: commonLegend,
          }}
          config={{ responsive: true }}
        />
      </CardContainer>

      <CardContainer header="Beta projectors">
        <SimplePlot
          data={beta}
          layout={{
            autosize: true,
            height: 400,
            margin: commonMargin,
            xaxis: { title: { text: "Radius (Bohr)" } },
            yaxis: { title: { text: "φ(r)" } },
            legend: commonLegend,
          }}
          config={{ responsive: true }}
        />
      </CardContainer>

      <CardContainer header="Charge densities">
        <SimplePlot
          data={charge}
          layout={{
            autosize: true,
            height: 400,
            margin: commonMargin,
            xaxis: { title: { text: "Radius (Bohr)" }, range: [0, 5] },
            yaxis: { title: { text: "φ(r)" } },
            legend: commonLegend,
          }}
          config={{ responsive: true }}
        />
      </CardContainer>
    </div>
  );
}
