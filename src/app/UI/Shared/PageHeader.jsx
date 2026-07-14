export default function PageHeader({ action, eyebrow, title }) {
  return (
    <header className="mb-6 flex min-h-12 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
      <div>
        {eyebrow ? (
          <p className="text-xs text-[var(--color-text-muted)]">{eyebrow}</p>
        ) : null}
        <h1 className="text-base font-bold uppercase text-[var(--color-primary)]">
          {title}
        </h1>
      </div>
      {action}
    </header>
  );
}
