"use client";

import { useEffect } from "react";

export default function Notification({ message, onClose, tone = "success" }) {
  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timeoutId);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-[1100] flex max-w-sm items-center gap-4 rounded-lg border px-4 py-3 text-sm shadow-lg ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-[var(--color-success)]"
          : "border-red-200 bg-red-50 text-[var(--color-danger)]"
      }`}
      role="status"
    >
      <span>{message}</span>
      <button
        aria-label="Cerrar notificación"
        className="rounded px-1 text-lg leading-none opacity-70 hover:opacity-100"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
