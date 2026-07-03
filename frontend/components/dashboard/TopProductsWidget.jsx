import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "./widgetUtils";

export function TopProductsWidget({ loading, products }) {
  const ranked = [...products]
    .map((p) => ({ ...p, value: (p.price || 0) * (p.quantity || 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const maxValue = ranked.length > 0 ? ranked[0].value : 0;

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--fg)]">Top Products by Value</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : ranked.length === 0 ? (
        <p className="text-sm text-[var(--muted-fg)] text-center py-8">No product data</p>
      ) : (
        <div className="space-y-3">
          {ranked.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-4 flex-shrink-0 text-xs font-mono text-[var(--muted-fg)]">{i + 1}</span>
              <span className="w-28 flex-shrink-0 text-sm text-[var(--fg)] truncate" title={p.name}>
                {p.name}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${maxValue > 0 ? (p.value / maxValue) * 100 : 0}%` }}
                />
              </div>
              <span className="w-20 flex-shrink-0 text-right font-mono text-sm text-[var(--fg)]">
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
