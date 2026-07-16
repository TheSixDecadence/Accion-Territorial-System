import Button from "./Button";

export default function PageHeader({
  action,
  actionDisabled = false,
  actionLabel,
  eyebrow,
  onAction,
  title,
}) {
  const headerAction = actionLabel ? (
    <Button disabled={actionDisabled} onClick={onAction}>
      {actionLabel}
    </Button>
  ) : (
    action
  );

  return (
    <header className="flex min-h-12 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 sm:px-7">
      <div>
        {eyebrow ? (
          <p className="text-xs text-[var(--color-text-muted)]">{eyebrow}</p>
        ) : null}
        <h1 className="text-base font-bold uppercase text-[var(--color-primary)]">
          {title}
        </h1>
      </div>
      {headerAction}
    </header>
  );
}
