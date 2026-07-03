"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const PIE_COLORS = ["#059669", "#0EA5E9", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280"];

function groupByCategory(products) {
  const map = {};
  for (const p of products) {
    const cat = p.category || "Uncategorized";
    map[cat] = (map[cat] || 0) + (p.quantity || 0);
  }
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  if (entries.length <= 6) {
    return entries.map(([name, value]) => ({ name, value }));
  }
  const top5 = entries.slice(0, 5);
  const other = entries.slice(5).reduce((acc, [, v]) => acc + v, 0);
  return [...top5.map(([name, value]) => ({ name, value })), { name: "Other", value: other }];
}

function buildMovementData(movements) {
  let totalIn = 0;
  let totalOut = 0;
  for (const m of movements) {
    if (m.type === "IN") totalIn += m.quantity || 0;
    else if (m.type === "OUT") totalOut += m.quantity || 0;
  }
  return [
    { name: "IN", value: totalIn },
    { name: "OUT", value: totalOut },
  ];
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg text-sm">
      {label && <p className="font-medium text-[var(--fg)] mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill }}>
          {entry.name}: <span className="font-mono">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardCharts({ products, movements, loading }) {
  const categoryData = groupByCategory(products);
  const lowStockProducts = [...products]
    .filter((p) => p.quantity <= p.minStockLevel)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 8)
    .map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 16) + "…" : p.name, value: p.quantity }));
  const movementData = buildMovementData(movements);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-1">
        <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Stock by Category</h2>
        {loading ? (
          <Skeleton className="h-52" />
        ) : categoryData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-[var(--muted-fg)] text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                paddingAngle={2}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "var(--fg)", fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5 lg:col-span-1">
        <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Lowest Stock Products</h2>
        {loading ? (
          <Skeleton className="h-52" />
        ) : lowStockProducts.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-[var(--muted-fg)] text-sm">All stock healthy</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lowStockProducts} layout="vertical" margin={{ left: 0, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-fg)" }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "var(--muted-fg)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#D97706" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: "var(--muted-fg)" }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5 lg:col-span-1">
        <h2 className="text-sm font-semibold text-[var(--fg)] mb-4">Stock Movements</h2>
        {loading ? (
          <Skeleton className="h-52" />
        ) : movements.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-[var(--muted-fg)] text-sm">No movements yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={movementData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-fg)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-fg)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="#059669" />
                <Cell fill="#DC2626" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
