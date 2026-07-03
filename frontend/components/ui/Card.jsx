export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
