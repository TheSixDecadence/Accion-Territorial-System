export const controlClass =
  "min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] placeholder:text-slate-400 focus:border-[var(--color-primary-soft)] focus:outline-none";

export default function Field({ children, error, htmlFor, label }) {
  return (
    <label className="block text-sm font-medium" htmlFor={htmlFor}>
      <span>{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {error ? (
        <span className="mt-1 block text-xs font-normal text-[var(--color-danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
