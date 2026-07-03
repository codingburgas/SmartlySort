import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { initials } from "./widgetUtils";

function MemberRow({ name, sub, role, isYou }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[var(--muted)] transition-colors">
      <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {name.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--fg)] truncate">
          {name.display}
          {isYou && <span className="text-[var(--muted-fg)] font-normal"> (you)</span>}
        </p>
        {sub && <p className="text-xs text-[var(--muted-fg)] truncate">{sub}</p>}
      </div>
      {role && <Badge variant="outline" className="flex-shrink-0">{role}</Badge>}
    </div>
  );
}

export function TeamWidget({ loading, members, user, currentWarehouse }) {
  const isOwner = currentWarehouse && user && Number(currentWarehouse.ownerId) === Number(user.id);
  const otherMembers = members.filter((m) => Number(m.id) !== Number(user?.id));
  const total = members.length + (isOwner && !members.some((m) => Number(m.id) === Number(user?.id)) ? 1 : 0);

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--fg)]">Warehouse Team</h2>
        </div>
        <Link href="/warehouses" className="text-xs font-medium text-[var(--accent)] hover:underline">
          Manage
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--muted-fg)] mb-2">{total} member{total === 1 ? "" : "s"}</p>
          <div className="space-y-1 overflow-y-auto max-h-64">
            {isOwner && (
              <MemberRow
                name={{ display: `${user.firstName} ${user.lastName}`, initials: initials(user.firstName, user.lastName) }}
                sub={user.username}
                role="Owner"
                isYou
              />
            )}
            {otherMembers.length === 0 && !isOwner ? (
              <p className="text-sm text-[var(--muted-fg)] text-center py-6">No members yet</p>
            ) : (
              otherMembers.map((m) => (
                <MemberRow
                  key={m.id}
                  name={{ display: `${m.firstName} ${m.lastName}`, initials: initials(m.firstName, m.lastName) }}
                  sub={m.username}
                  role={m.role === "ADMINISTRATOR" ? "Admin" : "Member"}
                  isYou={Number(m.id) === Number(user?.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </Card>
  );
}
