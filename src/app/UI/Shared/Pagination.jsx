import Button from "./Button";

export default function Pagination({
  label,
  onNext,
  onPrevious,
  page,
  totalPages,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-muted)]">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Página anterior"
          className="min-h-8 px-3 text-xs"
          disabled={page <= 1}
          onClick={onPrevious}
          variant="secondary"
        >
          ← Anterior
        </Button>
        <span aria-live="polite" className="sr-only">
          Página {page} de {totalPages}
        </span>
        <Button
          aria-label="Página siguiente"
          className="min-h-8 px-3 text-xs"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
