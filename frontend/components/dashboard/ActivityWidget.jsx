import Link from "next/link";
import { Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "./widgetUtils";

export function ActivityWidget({ loading, movements, productMap }) {
  const recent = [...movements].reverse().slice(0, 7);

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--fg)]">Recent Activity</h2>
        </div>
        <Link href="/stock" className="text-xs font-medium text-[var(--accent)] hover:underline">
          View stock
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <Activity size={28} className="text-[var(--border)] mb-2" />
          <p className="text-sm text-[var(--muted-fg)]">No stock movements recorded</p>
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto max-h-72">
          {recent.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[var(--muted)] transition-colors"
            >
              <Badge variant={m.type === "IN" ? "success" : "destructive"} className="flex-shrink-0">
                {m.type}
              </Badge>
              <span className="text-sm text-[var(--fg)] truncate flex-1">
                {productMap[m.productId] ?? `#${m.productId}`}
              </span>
              <span className="font-mono text-sm text-[var(--fg)] flex-shrink-0">{m.quantity}</span>
              <span className="text-xs text-[var(--muted-fg)] truncate flex-shrink-0 max-w-24 hidden sm:inline">
                {m.reason || "—"}
              </span>
              <span className="text-xs text-[var(--muted-fg)] flex-shrink-0 whitespace-nowrap">
                {timeAgo(m.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
