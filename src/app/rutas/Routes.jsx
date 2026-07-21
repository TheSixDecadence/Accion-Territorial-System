"use client";

import { useState } from "react";
import PageHeader from "@/app/UI/Shared/PageHeader";
import Modal from "@/app/UI/Shared/Modal";
import { Map, MapControls } from "@/components/ui/map";
import RouteForm from "./RouteForm";

const CHIHUAHUA_CENTER = [-106.0889, 28.6353];

function RoutesPage({ onCreate }) {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader
        actionLabel="Nueva Ruta"
        onAction={onCreate}
        title="Rutas"
      />

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

export default function Wrapper() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <RoutesPage onCreate={() => setIsFormOpen(true)} />
      <Modal
        onClose={() => setIsFormOpen(false)}
        open={isFormOpen}
        title="Nueva Ruta"
      >
        <RouteForm onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </>
  );
}
