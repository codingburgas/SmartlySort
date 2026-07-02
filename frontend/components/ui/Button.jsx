export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[var(--accent)] text-white hover:bg-emerald-700 active:bg-emerald-800",
    secondary: "bg-[var(--muted)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--border)]",
    destructive: "bg-[var(--destructive)] text-white hover:bg-red-700 active:bg-red-800",
    ghost: "text-[var(--fg)] hover:bg-[var(--muted)] border border-transparent",
    outline: "border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--muted)] bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
