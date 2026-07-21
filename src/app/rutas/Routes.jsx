"use client";

import PageHeader from "@/app/UI/Shared/PageHeader";
import { Map, MapControls } from "@/components/ui/map";

const CHIHUAHUA_CENTER = [-106.0889, 28.6353];

export default function Routes() {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader title="Rutas" />

      <section className="w-full flex-1 px-5 py-6 sm:px-7 lg:px-10">
        <div className="h-[calc(100vh-8.5rem)] min-h-[520px] w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Map center={CHIHUAHUA_CENTER} theme="light" zoom={11}>
            <MapControls position="top-right" />
          </Map>
        </div>
      </section>
    </div>
  );
}
