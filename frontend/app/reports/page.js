"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, AlertCircle, Download, DollarSign, Boxes, ClipboardList } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouse } from "@/components/WarehouseProvider";
import { products as productsApi, stock as stockApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { LowStockPanel, CategoryBreakdown, RecentMovements } from "@/components/ReportsTables";

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const { currentWarehouse, loading: whLoading } = useWarehouse();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !whLoading && !currentWarehouse) router.replace("/warehouses");
  }, [authLoading, user, whLoading, currentWarehouse, router]);

  useEffect(() => {
    if (user && currentWarehouse) load();
  }, [user, currentWarehouse]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [prods, low, movs] = await Promise.all([
        productsApi.list(currentWarehouse.id),
        productsApi.lowStock(currentWarehouse.id),
        stockApi.list(currentWarehouse.id),
      ]);
      setProducts(prods || []);
      setLowStock(low || []);
      setMovements(movs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user || whLoading) return null;

  const productMap = {};
  for (const p of products) productMap[p.id] = p.name;

  const totalValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0);
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

  const categoryTotals = {};
  for (const p of products) {
    const cat = p.category || "Uncategorized";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (p.price || 0) * (p.quantity || 0);
  }
  const categoryRows = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryValue = categoryRows.reduce((acc, [, v]) => Math.max(acc, v), 0);

  const recentMovements = [...movements].reverse().slice(0, 15);

  function handleExportCsv() {
    const header = ["Product", "Category", "Qty", "Unit Price", "Total Value"];
    const rows = products.map((p) => [
      p.name,
      p.category || "",
      p.quantity ?? 0,
      (p.price || 0).toFixed(2),
      ((p.price || 0) * (p.quantity || 0)).toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-valuation-${currentWarehouse.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Reports</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">{currentWarehouse?.name}</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inventory Value"
          value={loading ? undefined : `$${totalValue.toFixed(2)}`}
          icon={DollarSign}
          loading={loading}
          accent
        />
        <StatCard label="Total Units" value={loading ? undefined : totalUnits.toLocaleString()} icon={Boxes} loading={loading} />
        <StatCard label="Low-Stock Items" value={loading ? undefined : lowStock.length} icon={AlertTriangle} loading={loading} />
        <StatCard label="Movements Logged" value={loading ? undefined : movements.length} icon={ClipboardList} loading={loading} />
      </div>

      <LowStockPanel loading={loading} lowStock={lowStock} />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--fg)]">Stock Valuation</h2>
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={loading || products.length === 0}>
            <Download size={14} />
            Export CSV
          </Button>
        </div>
        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : products.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)] text-center py-8">No products to value</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  {["Product", "Category", "Qty", "Unit Price", "Total Value"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold text-[var(--muted-fg)] uppercase tracking-wider ${
                        i >= 2 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--muted)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--fg)]">{p.name}</td>
                    <td className="px-4 py-3 text-[var(--muted-fg)]">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--fg)]">{p.quantity ?? 0}</td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--fg)]">${(p.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--fg)]">
                      ${((p.price || 0) * (p.quantity || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)]">
                  <td className="px-4 py-3 font-bold text-[var(--fg)]" colSpan={2}>
                    Grand Total
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[var(--fg)]">{totalUnits}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-mono font-bold text-[var(--fg)]">
                    ${totalValue.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <CategoryBreakdown loading={loading} categoryRows={categoryRows} maxCategoryValue={maxCategoryValue} />

      <RecentMovements loading={loading} recentMovements={recentMovements} productMap={productMap} />
    </div>
  );
}
