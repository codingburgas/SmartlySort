import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function LowStockWidget({ loading, lowStock }) {
  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm font-semibold text-[var(--fg)]">Low-Stock Alerts</h2>
        </div>
        <Link href="/products" className="text-xs font-medium text-[var(--accent)] hover:underline">
          View products
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : lowStock.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            All items sufficiently stocked
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto max-h-64">
          {lowStock.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <span className="text-sm font-medium text-[var(--fg)] truncate">{p.name}</span>
              <div className="flex items-center gap-3 flex-shrink-0 text-xs font-mono">
                <span className="text-amber-700 dark:text-amber-400">
                  {p.quantity} / {p.minStockLevel}
                </span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  -{Math.max(p.minStockLevel - p.quantity, 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
