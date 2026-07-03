import Link from "next/link";
import { Truck, Ship } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_META = {
  DUE: { label: "Due", dot: "bg-amber-400", text: "text-amber-700 dark:text-amber-400", pill: "bg-amber-100 dark:bg-amber-900/30" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-400", pill: "bg-indigo-100 dark:bg-indigo-900/30" },
  COMPLETED: { label: "Completed", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", pill: "bg-emerald-100 dark:bg-emerald-900/30" },
};

export function ShipmentsWidget({ loading, shipmentsList, productMap, supplierMap }) {
  const counts = { DUE: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  for (const s of shipmentsList) {
    const status = s.status ?? "DUE";
    if (counts[status] !== undefined) counts[status] += 1;
  }
  const active = shipmentsList
    .filter((s) => (s.status ?? "DUE") !== "COMPLETED")
    .slice(0, 5);

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--fg)]">Incoming Shipments</h2>
        </div>
        <Link href="/shipments" className="text-xs font-medium text-[var(--accent)] hover:underline">
          Open board
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            {["DUE", "IN_PROGRESS", "COMPLETED"].map((status) => {
              const meta = STATUS_META[status];
              return (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.pill} ${meta.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                  <span className="font-mono font-semibold">{counts[status]}</span>
                </span>
              );
            })}
          </div>

          {active.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <Ship size={24} className="text-[var(--border)] mb-2" />
              <p className="text-sm text-[var(--muted-fg)]">No shipments in progress</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {active.map((s) => {
                const meta = STATUS_META[s.status ?? "DUE"];
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                      <span className="text-sm text-[var(--fg)] truncate">
                        {supplierMap[s.supplierId] ?? `#${s.supplierId}`}
                        <span className="text-[var(--muted-fg)]"> → </span>
                        {productMap[s.productId] ?? `#${s.productId}`}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-[var(--fg)] flex-shrink-0">{s.quantity}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
