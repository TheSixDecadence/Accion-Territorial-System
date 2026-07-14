const variants = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  secondary:
    "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-slate-50",
  danger:
    "border border-red-200 bg-white text-[var(--color-danger)] hover:bg-red-50",
};

export default function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      type={type}
      {...props}
    />
  );
}
