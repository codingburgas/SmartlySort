export function StatCard({ label, value, icon: Icon, accent = false, loading = false }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm p-5 flex items-start gap-4">
      {Icon && (
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            accent
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-[var(--muted)] text-[var(--muted-fg)]"
          }`}
        >
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wider mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-[var(--muted)] rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-[var(--fg)] font-mono tabular-nums">{value ?? "—"}</p>
        )}
      </div>
    </div>
  );
}
