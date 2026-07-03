import { AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonTable } from "@/components/ui/Skeleton";

export function LowStockPanel({ loading, lowStock }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
        <h2 className="text-base font-semibold text-[var(--fg)]">Low-Stock Alerts</h2>
      </div>
      {loading ? (
        <SkeletonTable rows={3} cols={4} />
      ) : lowStock.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            All items sufficiently stocked
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-amber-200 dark:border-amber-800">
                <tr>
                  {["Product", "Current Qty", "Min Level", "Deficit"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200 dark:divide-amber-800">
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-medium text-[var(--fg)]">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-amber-700 dark:text-amber-400">{p.quantity}</td>
                    <td className="px-4 py-2.5 font-mono text-[var(--muted-fg)]">{p.minStockLevel}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-amber-700 dark:text-amber-400">
                      {Math.max(p.minStockLevel - p.quantity, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

export function CategoryBreakdown({ loading, categoryRows, maxCategoryValue }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[var(--accent)]" />
        <h2 className="text-base font-semibold text-[var(--fg)]">Value by Category</h2>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : categoryRows.length === 0 ? (
        <p className="text-sm text-[var(--muted-fg)] text-center py-8">No category data</p>
      ) : (
        <div className="space-y-3">
          {categoryRows.map(([cat, value]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-32 flex-shrink-0 text-sm text-[var(--fg)] truncate" title={cat}>
                {cat}
              </span>
              <div className="flex-1 h-6 rounded-md bg-[var(--muted)] overflow-hidden">
                <div
                  className="h-full rounded-md bg-emerald-500"
                  style={{ width: `${maxCategoryValue > 0 ? (value / maxCategoryValue) * 100 : 0}%` }}
                />
              </div>
              <span className="w-24 flex-shrink-0 text-right font-mono text-sm text-[var(--fg)]">
                ${value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function RecentMovements({ loading, recentMovements, productMap }) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-[var(--fg)] mb-4">Recent Movements</h2>
      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : recentMovements.length === 0 ? (
        <p className="text-sm text-[var(--muted-fg)] text-center py-8">No stock movements recorded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                {["Type", "Product", "Quantity", "Reason", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentMovements.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="px-4 py-3">
                    <Badge variant={m.type === "IN" ? "success" : "destructive"}>{m.type}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--fg)]">
                    {productMap[m.productId] ?? `#${m.productId}`}
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--fg)]">{m.quantity}</td>
                  <td className="px-4 py-3 text-[var(--muted-fg)]">{m.reason || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted-fg)]">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
