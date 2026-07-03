"use client";

import { useRouter } from "next/navigation";
import { Zap, PackagePlus, ArrowLeftRight, ShipWheel, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";

const ACTIONS = [
  { label: "Add product", href: "/products/new", icon: PackagePlus },
  { label: "Record stock", href: "/stock", icon: ArrowLeftRight },
  { label: "New shipment", href: "/shipments", icon: ShipWheel },
  { label: "Invite member", href: "/warehouses", icon: UserPlus },
];

export function QuickActionsWidget() {
  const router = useRouter();

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--fg)]">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(({ label, href, icon: Icon }) => (
          <button
            key={href + label}
            onClick={() => router.push(href)}
            className="flex flex-col items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-left hover:border-[var(--accent)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
          >
            <Icon size={18} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
