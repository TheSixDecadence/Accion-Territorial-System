"use client";

import { useEffect } from "react";

export default function Modal({
  children,
  description,
  onClose,
  open,
  title,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-slate-950/55 p-4"
      onMouseDown={onClose}
    >
      <section
        aria-describedby={description ? "modal-description" : undefined}
        aria-labelledby="modal-title"
        aria-modal="true"
        className="my-auto w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-modal)] sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" id="modal-title">
              {title}
            </h2>
            {description ? (
              <p
                className="mt-1 text-sm text-[var(--color-text-muted)]"
                id="modal-description"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Cerrar"
            className="rounded-md px-2 py-1 text-xl text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
