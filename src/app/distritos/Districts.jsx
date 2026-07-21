"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/app/UI/Shared/PageHeader";
import {
  Map,
  MapControls,
  MapGeoJSON,
} from "@/components/ui/map";

const CHIHUAHUA_BOUNDS = [
  [-109.4, 25.3],
  [-102.9, 32.05],
];

const DISTRICT_COLORS = [
  "match",
  ["get", "DISTRITO_L"],
  1, "#ef9a9a",
  2, "#f48fb1",
  3, "#ce93d8",
  4, "#b39ddb",
  5, "#9fa8da",
  6, "#90caf9",
  7, "#81d4fa",
  8, "#80deea",
  9, "#80cbc4",
  10, "#a5d6a7",
  11, "#c5e1a5",
  12, "#e6ee9c",
  13, "#fff59d",
  14, "#ffe082",
  15, "#ffcc80",
  16, "#ffab91",
  17, "#bcaaa4",
  18, "#b0bec5",
  19, "#a7c7e7",
  20, "#c4b7e7",
  21, "#f4b6c2",
  22, "#b2dfdb",
  "#cbd9ec",
];

function DistrictMap({ districts }) {
  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[520px] w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <Map
        bounds={CHIHUAHUA_BOUNDS}
        fitBoundsOptions={{ padding: 32 }}
        theme="light"
      >
        <MapGeoJSON
          data={districts}
          fillPaint={{
            "fill-color": DISTRICT_COLORS,
            "fill-opacity": 0.42,
          }}
          id="local-districts"
          linePaint={{
            "line-color": "#2e3180",
            "line-width": 1.5,
          }}
        />
        <MapControls position="top-right" />
      </Map>
    </div>
  );
}

function DistrictsPage({ districts, error, isLoading }) {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader title="Distritos" />

      <section className="w-full flex-1 px-5 py-6 sm:px-7 lg:px-10">
        {isLoading ? (
          <StatusMessage>Cargando distritos…</StatusMessage>
        ) : error ? (
          <StatusMessage tone="error">{error}</StatusMessage>
        ) : (
          <DistrictMap districts={districts} />
        )}
      </section>
    </div>
  );
}

function StatusMessage({ children, tone = "default" }) {
  return (
    <div
      className={`grid min-h-[520px] place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center text-sm ${
        tone === "error"
          ? "text-[var(--color-danger)]"
          : "text-[var(--color-text-muted)]"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export default function Wrapper() {
  const [districts, setDistricts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDistricts = async () => {
      try {
        const response = await fetch("/data/distritos-locales.geojson");
        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data?.type !== "FeatureCollection" || data.features?.length !== 22) {
          throw new Error();
        }

        if (active) setDistricts(data);
      } catch {
        if (active) {
          setError("No fue posible cargar el mapa de distritos.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadDistricts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DistrictsPage
      districts={districts}
      error={error}
      isLoading={isLoading}
    />
  );
}
